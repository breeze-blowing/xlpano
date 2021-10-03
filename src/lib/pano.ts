import { getWebGLContext, initShaders } from '../utils/cuon-utils';
import VertShader from '../shader/index.vert';
import FragShader from '../shader/index.frag';
import Scene from './scene';
import Matrix4 from "../utils/matrix";
import { initArrayBuffer } from '../utils/process';

/**
 * 容器
 * */
export default class Pano {
  /**
   * @property {HTMLCanvasElement} canvas canvas节点容器
   * */
  canvas: HTMLCanvasElement;

  /**
   * @property {WebGLRenderingContextWithProgram} gl WebGL绘制上下文
   * */
  gl: WebGLRenderingContextWithProgram;

  /**
   * @property {Scene[]} scenes 场景列表
   * */
  // scenes: Scene[] = [];

  /**
   * @property {number} sceneIndex 当前场景
   * */
  // sceneIndex: number = 0;

  /**
   * @constructor
   * @param {HTMLCanvasElement} canvas canvas节点容器
   * @param {boolean} debug 是否开启debug
   * */
  constructor(canvas: HTMLCanvasElement, debug?: boolean) {
    if (!canvas) {
      throw new Error('初始化 canvas 不能为空');
    }
    this.canvas = canvas;
    this.gl = getWebGLContext(canvas, debug);
    // 初始化着色器
    initShaders(this.gl, VertShader, FragShader);
  }

  /**
   * 添加场景
   * */
  /*addScene(scene: Scene) {
    this.scenes.push(scene);
  }*/

  /**
   * 把场景渲染到页面
   * */
  render() {
    // this.scenes[this.sceneIndex].render(this.gl);

    const gl = this.gl;

    // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3

    const vertices = new Float32Array([   // Vertex coordinates
      1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,  // v0-v1-v2-v3 front
      1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,  // v0-v3-v4-v5 right
      1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,  // v0-v5-v6-v1 up
      -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,  // v1-v6-v7-v2 left
      -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,  // v7-v4-v3-v2 down
      1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0   // v4-v7-v6-v5 back
    ]);

    const colors = new Float32Array([     // Colors
      0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front(blue)
      0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v3-v4-v5 right(green)
      1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  // v0-v5-v6-v1 up(red)
      1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  // v1-v6-v7-v2 left
      1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
      0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0   // v4-v7-v6-v5 back
    ]);

    const indices = new Uint8Array([       // Indices of the vertices
      0, 1, 2,   0, 2, 3,    // front
      4, 5, 6,   4, 6, 7,    // right
      8, 9,10,   8,10,11,    // up
      12,13,14,  12,14,15,    // left
      16,17,18,  16,18,19,    // down
      20,21,22,  20,22,23     // back
    ]);

    const indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
      throw new Error('创建索引缓冲区对象失败');
    }

    initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position');
    initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color');

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    // Set the clear color and enable the depth test
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // Get the storage location of u_MvpMatrix
    const u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    if (!u_MvpMatrix) {
      throw new Error('获取 mvp 矩阵地址失败');
    }

    const mvpMatrix = new Matrix4();
    mvpMatrix.setPerspective(30, 1, 1, 100);
    mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
  }
}
