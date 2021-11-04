import {initArrayBuffer} from "../utils/process";
import {TextureSource, WebGLRenderingContextWithProgram} from "../types/index";
import Pano from "./Pano";
import {getTexImageSource} from "./resource";
import BaseScene from "./interface/BaseScene";
import {SceneAngle} from "./interface/Scene";

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
export default class CubeScene extends BaseScene {

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
        0.0, 1.0,    1.0, 1.0,    1.0, 0.0,    0.0, 0.0,
        1.0, 1.0,    1.0, 0.0,    0.0, 0.0,    0.0, 1.0,
        1.0, 1.0,    1.0, 0.0,    0.0, 0.0,    0.0, 1.0,
        0.0, 1.0,    1.0, 1.0,    1.0, 0.0,    0.0, 0.0,
        0.0, 1.0,    1.0, 1.0,    1.0, 0.0,    0.0, 0.0,
        1.0, 0.0,    0.0, 0.0,    0.0, 1.0,    1.0, 1.0,
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
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

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
    static getUFaceLocation(gl: WebGLRenderingContextWithProgram): WebGLUniformLocation {
        if (!CubeScene.u_Face) {
            const u_Face = gl.getUniformLocation(gl.program, 'u_Face');
            if (!u_Face) {
                throw new Error('获取 u_Face 地址失败');
            }
            CubeScene.u_Face = u_Face;
        }
        return CubeScene.u_Face;
    }

    /**
     * @property {TextureSource[]} textures 六个面的纹理图片，按照 f r u l d b 的顺序
     * */
    textures: TextureSource[] = [];

    /**
     * @constructor 构造函数
     * @param {string[]} textures 六个面的纹理图片，按照 f r u l d b 的顺序
     * @param {SceneAngle} defaultAngle 默认展示角度
     * */
    constructor(textures: TextureSource[], defaultAngle?: SceneAngle) {
        super();
        this.textures = textures;
        if (defaultAngle) {
            const { pitch, yaw } = defaultAngle;
            if (pitch) this.pitch = pitch;
            if (yaw) this.yaw = yaw;
        }
    }

    /**
     * 渲染立方体
     * */
    drawModel() {
        CubeScene.allFacesIndices.forEach((faceIndices, index) => {
            this.renderFace(faceIndices, index as Unit);
        });
    }

    /**
     * 加载纹理贴图
     * @return {Promise<TexImageSource[]>} 图像资源
     * */
    private loadTextures(): Promise<TexImageSource[]> {
        // 交换前后，左右
        const [f, r, u, l, d, b] = this.textures;
        const sourceOrder = [b, r, u, l, d, f];
        // 删选出资源地址类型的，然后加载图片
        const srcSources: { src: string, index: number }[] = [];
        sourceOrder.forEach((source, index) => {
            if (typeof source === 'string') {
                srcSources.push({
                    src: source,
                    index,
                });
            }
        });
        return getTexImageSource(srcSources.map(item => item.src)).then(images => {
            // 拼接返回所有的 TexImageSource 类型
            return sourceOrder.map(source => {
                if (typeof source === 'string') {
                    return images.shift();
                } else {
                    return source;
                }
            });
        });
    }

    /**
     * 渲染立方体的其中一面
     * @param {Uint8Array} indices 该面的顶点索引
     * @param {Unit} unit 每个面的编号
     * */
    private renderFace(indices: Uint8Array, unit: Unit) {
        const { gl } = this.pano;
        const indexBuffer = gl.createBuffer();
        if (!indexBuffer) {
            throw new Error('创建索引缓冲区对象失败');
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        gl.uniform1i(CubeScene.getUFaceLocation(gl), unit);

        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
    }

    /**
     * 更改纹理重新渲染
     * @param {TextureSource[]} textures 纹理资源集合，按照 f r u l d b 的顺序
     * */
    replaceTextures(textures: TextureSource[]) {
        this.textures = textures;
        this.render(this.pano);
    }

    /**
     * 渲染到 pano
     * @param {Pano} pano 父容器
     * */
    render(pano: Pano) {
        super.render(pano);

        const { gl } = this.pano;
        initArrayBuffer(gl, CubeScene.vertices, 3, gl.FLOAT, 'a_Position');
        initArrayBuffer(gl, CubeScene.texs, 2, gl.FLOAT, 'a_TexCoord');
        this.loadTextures().then((images) => {
            // [imgF, imgR, imgU, imgL, imgD, imgB]
            images.forEach((img, index) => {
                if (index <= 5) CubeScene.initTexture(gl, img, index as Unit);
            });
            this.draw();
        });
    }
}
