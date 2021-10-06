import { getWebGLContext, initShaders } from '../utils/cuon-utils';
import VertShader from '../shader/index.vert';
import FragShader from '../shader/index.frag';
import Scene from './scene';

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
  scenes: Scene[] = [];

  /**
   * @property {number} sceneIndex 当前场景
   * */
  sceneIndex: number = 0;

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
    initShaders(this.gl, VertShader, FragShader);
  }

  /**
   * 添加场景
   * */
  addScene(scene: Scene) {
    this.scenes.push(scene);
  }

  /**
   * 渲染当前 Scene 到 canvas
   * */
  render() {
    const currentScene = this.scenes[this.sceneIndex];
    if (!currentScene) {
      throw new Error('当前场景不存在');
    }
    currentScene.render(this.gl, this.canvas);
  }
}
