import { getWebGLContext, initShaders } from '../utils/cuon-utils';
import VertShader from '../shader/index.vert';
import FragShader from '../shader/index.frag';
import Scene from './scene';
import {WebGLRenderingContextWithProgram} from "../types/index";

/**
 * 容器
 * */
export default class Pano {
  /**
   * @property {HTMLElement} container 容器
   * */
  container: HTMLElement;

  /**
   * @property {HTMLCanvasElement} canvas canvas节点
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
   * @param {string} containerId 容器节点id
   * @param {boolean} debug 是否开启debug
   * */
  constructor(containerId: string, debug?: boolean) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error('找不到容器，请确认 id 是否正确');
    }
    container.style.overflow = 'hidden';
    // 如果 container 的 position 不是 absolute 和 fixed，则统一设置成 relative
    const containerPosition = container.style.position;
    if (containerPosition !== 'absolute' && containerPosition !== 'fixed') {
      container.style.position = 'relative';
    }
    const canvas = document.createElement('canvas');

    // 开启 HiDPI
    const desiredCSSWidth = container.offsetWidth;
    const desiredCSSHeight = container.offsetHeight;
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width  = desiredCSSWidth  * devicePixelRatio;
    canvas.height = desiredCSSHeight * devicePixelRatio;
    canvas.style.width  = desiredCSSWidth  + "px";
    canvas.style.height = desiredCSSHeight + "px";

    canvas.style.cursor = 'grab';

    container.append(canvas);

    this.container = container;
    this.canvas = canvas;
    this.gl = getWebGLContext(canvas, debug);
    initShaders(this.gl, VertShader, FragShader);
  }

  /**
   * 添加场景
   * @param {Scene} scene 场景
   * */
  addScene(scene: Scene) {
    this.scenes.push(scene);
  }

  /**
   * 切换场景
   * @param {number} sceneIndex 切换后的场景
   * */
  switch = (sceneIndex: number) => {
    const currentScene = this.scenes[this.sceneIndex];
    if (currentScene) currentScene.destroy();
    this.sceneIndex = sceneIndex;
    this.render();
  }

  /**
   * 渲染当前 Scene 到 canvas
   * */
  render() {
    const currentScene = this.scenes[this.sceneIndex];
    if (!currentScene) {
      throw new Error('当前场景不存在');
    }
    const gl = this.gl;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    currentScene.render({
      gl,
      canvas: this.canvas,
      container: this.container,
      switchScene: this.switch,
    });
  }
}
