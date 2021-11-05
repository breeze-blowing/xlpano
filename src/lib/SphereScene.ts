import {TextureSource, WebGLRenderingContextWithProgram} from "../types/index";
import BaseScene from "./interface/BaseScene";
import {initArrayBuffer} from "../utils/process";
import Pano from "./Pano";
import {getSingleTexImageSource} from "./resource";
import {SceneAngle} from "./interface/Scene";

export default class SphereScene extends BaseScene {

  /**
   * @static {number} sections 球体经纬被切分的份数
   * */
  static sections = 60;

  /**
   * @static
   * @return {{vertices, texs, indices}} 顶点坐标，纹理坐标，顶点索引
   * */
  static get verticeTexIndices() {
    const verticesArray: number[] = [];
    const texsArray: number[] = [];
    const indicesArray: number[] = [];

    let aj, sj, cj, ai, si, ci, p1, p2;
    for (let j = 0; j <= SphereScene.sections; j++) {
      aj = j * Math.PI / SphereScene.sections;
      sj = Math.sin(aj);
      cj = Math.cos(aj);
      for (let i = 0; i <= SphereScene.sections; i++) {
        ai = i * 2 * Math.PI / SphereScene.sections;
        si = Math.sin(ai);
        ci = Math.cos(ai);

        // 顶点坐标
        verticesArray.push(si * sj, cj, ci * sj);

        // 纹理坐标
        texsArray.push(i / SphereScene.sections, (SphereScene.sections - j) / SphereScene.sections);

        if (j < SphereScene.sections && i < SphereScene.sections) {
          // 顶点索引
          p1 = j * (SphereScene.sections + 1) + i;
          p2 = p1 + (SphereScene.sections + 1);
          indicesArray.push(p1, p2, p1 + 1, p1 + 1, p2, p2 + 1);
        }
      }
    }

    const vertices = new Float32Array(verticesArray);
    const indices = new Uint32Array(indicesArray);
    const texs = new Float32Array(texsArray);

    return {vertices, texs, indices};
  };

  /**
   * 将每个面的纹理贴图赋值给每个面的 sampler
   * @param {WebGLRenderingContextWithProgram} gl WebGL 上下文
   * @param {TexImageSource} image 图像资源
   * */
  static initTexture(gl: WebGLRenderingContextWithProgram, image: TexImageSource) {
    const texture = gl.createTexture();
    if (!texture) {
      throw new Error('创建纹理对象失败');
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
    if (!u_Sampler) {
      throw new Error(`获取 u_Sampler 地址失败`);
    }
    gl.uniform1i(u_Sampler, 0);
  }

  /**
   * @property {TextureSource} textures 2:1球体纹理图
   * */
  textures: TextureSource;

  /**
   * @constructor 构造函数
   * @param {string} texture 宽高比2:1的纹理图片
   * @param {SceneAngle} defaultAngle 默认展示角度
   * */
  constructor(texture: TextureSource, defaultAngle?: SceneAngle) {
    super();
    this.textures = texture;
    if (defaultAngle) {
      const { pitch, yaw } = defaultAngle;
      if (pitch) this.pitch = pitch;
      if (yaw) this.yaw = yaw;
    }
  }

  /**
   * 渲染球体
   * */
  drawModel() {
    const { indices } = SphereScene.verticeTexIndices;
    const { gl } = this.pano;
    const indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
      throw new Error('创建索引缓冲区对象失败');
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    if (gl.getExtension("OES_element_index_uint")) {
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_INT, 0);
    } else {
      throw new Error('不支持大于 gl.UNSIGNED_BYTE 的 type');
    }
  }

  /**
   * 加载纹理贴图
   * @return {Promise<TexImageSource>} 图像资源
   * */
  private loadTextures(): Promise<TexImageSource> {
    return typeof this.textures === 'string' ? getSingleTexImageSource(this.textures) : Promise.resolve(this.textures);
  }

  replaceTextures(texture: TextureSource) {
    this.textures = texture;
    this.render(this.pano);
  }

  /**
   * 渲染到 pano
   * @param {Pano} pano 父容器
   * */
  render(pano: Pano) {
    super.render(pano);

    const { gl } = this.pano;
    const { vertices, texs } = SphereScene.verticeTexIndices;
    initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position');
    initArrayBuffer(gl, texs, 2, gl.FLOAT, 'a_TexCoord');
    this.loadTextures().then((image) => {
      SphereScene.initTexture(gl, image);
      this.draw();
    });
  }
}
