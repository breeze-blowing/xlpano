import {initArrayBuffer, loadImage} from "../utils/process";
import Matrix4 from "../utils/matrix";
import HotSpot from "./hotSpot";
import {Fovy, PitchRange} from "../config/index";
import {angleIn360, PI2Angle} from "../utils/math";

/**
 * 每个面的编号 0-f 1-r 2-u 3-l 4-d 5-b
 * */
type Unit = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * 场景类，提供全景画面
 * 立方体
 *    v6----- v5
 *   /|      /|
 *  v1------v0|
 *  | |     | |
 *  | |v7---|-|v4
 *  |/      |/
 *  v2------v3
 * */
export default class Scene {

    /**
     * @static {Float32Array} vertices 立方体顶点坐标
     * */
    static vertices = new Float32Array([
        1.0,  1.0,  1.0,    -1.0,  1.0,  1.0,    -1.0, -1.0,  1.0,     1.0, -1.0,  1.0,  // v0-v1-v2-v3 front
        1.0,  1.0,  1.0,     1.0, -1.0,  1.0,     1.0, -1.0, -1.0,     1.0,  1.0, -1.0,  // v0-v3-v4-v5 right
        1.0,  1.0,  1.0,     1.0,  1.0, -1.0,    -1.0,  1.0, -1.0,    -1.0,  1.0,  1.0,  // v0-v5-v6-v1 up
       -1.0,  1.0,  1.0,    -1.0,  1.0, -1.0,    -1.0, -1.0, -1.0,    -1.0, -1.0,  1.0,  // v1-v6-v7-v2 left
       -1.0, -1.0, -1.0,     1.0, -1.0, -1.0,     1.0, -1.0,  1.0,    -1.0, -1.0,  1.0,  // v7-v4-v3-v2 down
        1.0, -1.0, -1.0,    -1.0, -1.0, -1.0,    -1.0,  1.0, -1.0,     1.0,  1.0, -1.0   // v4-v7-v6-v5 back
    ]);

    /**
     * @static {Float32Array} texs 顶点对应的纹理坐标
     * */
    static texs = new Float32Array([
        1.0, 1.0,    0.0, 1.0,    0.0, 0.0,    1.0, 0.0,
        0.0, 1.0,    0.0, 0.0,    1.0, 0.0,    1.0, 1.0,
        1.0, 0.0,    1.0, 1.0,    0.0, 1.0,    0.0, 0.0,
        1.0, 1.0,    0.0, 1.0,    0.0, 0.0,    1.0, 0.0,
        0.0, 0.0,    1.0, 0.0,    1.0, 1.0,    0.0, 1.0,
        0.0, 0.0,    1.0, 0.0,    1.0, 1.0,    0.0, 1.0,
    ]);

    /**
     * @static {Uint8Array[]} allFacesIndices 六个面的顶点索引数组
     * */
    static allFacesIndices = [
        new Uint8Array([0,  1,   2,     0,  2,  3]), // f
        new Uint8Array([4,  5,   6,     4,  6,  7]), // r
        new Uint8Array([8,  9,  10,     8, 10, 11]), // u
        new Uint8Array([12, 13, 14,    12, 14, 15]), // l
        new Uint8Array([16, 17, 18,    16, 18, 19]), // d
        new Uint8Array([20, 21, 22,    20, 22, 23]), // b
    ];

    /**
     * @static {WebGLUniformLocation} u_Face 的地址
     * 第一次渲染的时候被赋值
     * */
    static u_Face?: WebGLUniformLocation;

    /**
     * 将每个面的纹理贴图赋值给每个面的 sampler
     * @param {WebGLRenderingContextWithProgram} gl WebGL 上下文
     * @param {TexImageSource} image 图像资源
     * @param {number} unit 每个面的编号 0-f 1-r 2-u 3-l 4-d 5-b
     * */
    static initTexture(gl: WebGLRenderingContextWithProgram, image: TexImageSource, unit: Unit) {
        const texture = gl.createTexture();
        if (!texture) {
            throw new Error('创建纹理对象失败');
        }
        let texUnit = gl.TEXTURE0;
        let samplerPrefix = 'f';
        switch (unit) {
            case 0:
                texUnit = gl.TEXTURE0;
                samplerPrefix = 'f';
                break;
            case 1:
                texUnit = gl.TEXTURE1;
                samplerPrefix = 'r';
                break;
            case 2:
                texUnit = gl.TEXTURE2;
                samplerPrefix = 'u';
                break;
            case 3:
                texUnit = gl.TEXTURE3;
                samplerPrefix = 'l';
                break;
            case 4:
                texUnit = gl.TEXTURE4;
                samplerPrefix = 'd';
                break;
            case 5:
                texUnit = gl.TEXTURE5;
                samplerPrefix = 'b';
                break;
            default:
                break;
        }
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.activeTexture(texUnit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        // 下面两句能修复天空盒的裂缝
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

        const u_Sampler = gl.getUniformLocation(gl.program, `${samplerPrefix}_Sampler`);
        if (!u_Sampler) {
            throw new Error(`获取 ${u_Sampler} 地址失败`);
        }
        gl.uniform1i(u_Sampler, unit);
    }

    /**
     * 获取 u_Face 缓存
     * @param {WebGLRenderingContextWithProgram} gl WebGL 上下文
     * @return {WebGLUniformLocation} u_Face 地址
     * */
    getUFaceLocation(gl: WebGLRenderingContextWithProgram): WebGLUniformLocation {
        if (!Scene.u_Face) {
            const u_Face = gl.getUniformLocation(gl.program, 'u_Face');
            if (!u_Face) {
                throw new Error('获取 u_Face 地址失败');
            }
            Scene.u_Face = u_Face;
        }
        return Scene.u_Face;
    }

    /**
     * @property {string[]} textures 六个面的纹理图片，按照 f r u l d b 的顺序
     * */
    textures: string[] = [];

    /**
     * @property {number} pitch 俯仰角-绕 x 轴旋转角度
     * */
    pitch = 0.0;
    /**
     * @property {number} yaw 偏航角-绕 y 轴旋转角度
     * */
    yaw = 0.0;

    /**
     * @property {boolean} dragging 是否正在被拖拽
     * 鼠标按下置为 true；鼠标释放置为 false
     * */
    dragging = false;
    /**
     * @property {{x: number, y: number}} dragStartPoint 开始拖拽的起点
     * */
    dragStartPoint = { x: 0, y: 0 };

    /**
     * @property {HotSpot[]} hotSpots 热点
     * */
    hotSpots: HotSpot[] = [];

    /**
     * @property {HTMLCanvasElement} canvas canvas
     * */
    canvas: HTMLCanvasElement;

    /**
     * @property {WebGLRenderingContextWithProgram} gl WebGL绘制上下文
     * */
    gl: WebGLRenderingContextWithProgram;

    /**
     * @constructor 构造函数
     * @param {string[]} textures 六个面的纹理图片，按照 f r u l d b 的顺序
     * */
    constructor(textures: string[]) {
        this.textures = textures;
    }

    addHotSpots(hotSpots: HotSpot | HotSpot[]) {
        if (hotSpots instanceof Array) {
            this.hotSpots = this.hotSpots.concat(hotSpots);
        } else {
            this.hotSpots.push(hotSpots);
        }
    }

    /**
     * 渲染到 pano
     * @param {PanoRenderParams} params 全局通用渲染参数
     * */
    render(params: PanoRenderParams) {
        const { gl, canvas } = params;
        this.canvas = canvas;
        this.gl = gl;

        initArrayBuffer(gl, Scene.vertices, 3, gl.FLOAT, 'a_Position');
        initArrayBuffer(gl, Scene.texs, 2, gl.FLOAT, 'a_TexCoord');

        this.loadTextures().then((images) => {
            // [imgF, imgR, imgU, imgL, imgD, imgB]
            images.forEach((img, index) => {
                if (index <= 5) Scene.initTexture(gl, img, index as Unit);
            });

            // pc 端事件
            canvas.onmousedown = (ev) => {
                this.dragging = true;
                this.dragStartPoint = {
                    x: ev.offsetX,
                    y: ev.offsetY,
                };
            };
            canvas.onmouseup = () => this.dragging = false;
            canvas.onmouseout = () => this.dragging = false;
            canvas.onmousemove = (ev) => {
                if (this.dragging) this.moveTo(ev.offsetX, ev.offsetY, params);
            };
            // 手机端事件
            canvas.ontouchstart = (ev) => {
                const { top, left } = canvas.getBoundingClientRect();
                const targetX = ev.changedTouches[0].clientX - left;
                const targetY = ev.changedTouches[0].clientY - top;
                this.dragStartPoint = {x: targetX, y: targetY,};
            };
            canvas.ontouchmove = (ev) => {
                // 通过和 canvas 的视窗相对位置计算
                const { top, left } = canvas.getBoundingClientRect();
                const targetX = ev.changedTouches[0].clientX - left;
                const targetY = ev.changedTouches[0].clientY - top;
                this.moveTo(targetX, targetY, params);
            };

            this.draw(0.0, 0.0, params);
        });
    }

    /**
     * 场景移动到某一点
     * @param {number} targetX 移动目标点的X坐标
     * @param {number} targetY 移动目标点的X坐标
     * @param {PanoRenderParams} params 全局通用渲染参数
     * */
    private moveTo(targetX: number, targetY: number, params: PanoRenderParams) {
        const deltaX = this.dragStartPoint.x - targetX;
        const deltaY = this.dragStartPoint.y - targetY;

        let deltaPitch;
        if (this.pitch <= PitchRange[0] && deltaY <= 0) {
            deltaPitch = 0;
        } else if (this.pitch >= PitchRange[1] && deltaY >= 0) {
            deltaPitch = 0;
        } else {
            deltaPitch = PI2Angle(Math.atan(deltaY / (this.canvas.height / 2)));
        }

        const deltaYaw = PI2Angle(Math.atan(deltaX / (this.canvas.width / 2)));

        this.draw(deltaPitch, deltaYaw, params);
        this.dragStartPoint = {x: targetX, y: targetY};
    }

    /**
     * 绘制变换后的场景和热点
     * @param deltaPitch {number} 场景的俯仰角偏移值
     * @param deltaYaw {number} 场景的偏航角偏移值
     * @param {PanoRenderParams} params 全局通用渲染参数
     * */
    private draw(deltaPitch: number, deltaYaw: number, params: PanoRenderParams) {
        const { gl } = params;
        this.pitch += deltaPitch;
        if (this.pitch < PitchRange[0]) this.pitch = PitchRange[0];
        if (this.pitch > PitchRange[1]) this.pitch = PitchRange[1];
        this.yaw += deltaYaw;
        this.yaw = angleIn360(this.yaw);

        this.setMvpMatrix(gl);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        Scene.allFacesIndices.forEach((faceIndices, index) => {
            this.renderFace(gl, faceIndices, index as Unit);
        });

        // 渲染热点
        if (this.hotSpots && this.hotSpots.length) {
            this.hotSpots.forEach(hotSpot => hotSpot.render(deltaPitch, deltaYaw, params));
        }
    }

    /**
     * 加载纹理贴图
     * @return {Promise<TexImageSource[]>} 图像资源
     * */
    private loadTextures(): Promise<TexImageSource[]> {
        return Promise.all(this.textures.map(texture => loadImage(texture)));
    }

    /**
     * 渲染立方体的其中一面
     * @param {WebGLRenderingContextWithProgram} gl WebGL 上下文
     * @param {Uint8Array} indices 该面的顶点索引
     * @param {Unit} unit 每个面的编号
     * */
    private renderFace(gl: WebGLRenderingContextWithProgram, indices: Uint8Array, unit: Unit) {
        const indexBuffer = gl.createBuffer();
        if (!indexBuffer) {
            throw new Error('创建索引缓冲区对象失败');
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        gl.uniform1i(this.getUFaceLocation(gl), unit);

        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
    }

    /**
     * 设置 mvp 矩阵
     * @param {WebGLRenderingContextWithProgram} gl WebGL 上下文
     * */
    private setMvpMatrix(gl: WebGLRenderingContextWithProgram) {
        const u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
        if (!u_MvpMatrix) {
            throw new Error('获取 mvp 矩阵地址失败');
        }

        const { width, height } = this.canvas;
        const mvpMatrix = new Matrix4();
        mvpMatrix.setPerspective(Fovy, width / height, 0.01, 10.0);
        mvpMatrix.lookAt(0.0, 0.0, 0.0, 0.0, 0.0, -1.0, 0, 1, 0);
        mvpMatrix.rotate(this.pitch, 1, 0, 0);
        mvpMatrix.rotate(this.yaw, 0, 1, 0);

        gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    }

    /**
     * 销毁
     * */
    destroy() {
        // 移除热点
        if (this.hotSpots && this.addHotSpots.length) this.hotSpots.forEach(hotSpot => hotSpot.destroy());
    }
}
