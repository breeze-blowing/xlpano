import { getWebGLContext, initShaders } from '../utils/cuon-utils';
import VertShader from '../shader/index.vert';
import FragShader from '../shader/index.frag';
import {WebGLRenderingContextWithProgram} from "../types/index";
import {loadPanoTexImage} from "./resource";
import Scene from "./interface/Scene";

type SceneChangeCallback = (scene: Scene, index: number) => void;

type ListenerType = 'sceneChange';

type ListenerCallback = SceneChangeCallback;

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
   * 是否已经渲染
   * */
  rendered = false;

  /**
   * 设置样式
   * */
  setStyle() {
    const { container, canvas } = this;
    container.style.overflow = 'hidden';
    // 如果 container 的 position 不是 absolute 和 fixed，则统一设置成 relative
    const containerPosition = container.style.position;
    if (containerPosition !== 'absolute' && containerPosition !== 'fixed') {
      container.style.position = 'relative';
    }

    // 开启 HiDPI
    const desiredCSSWidth = container.offsetWidth;
    const desiredCSSHeight = container.offsetHeight;
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width  = desiredCSSWidth  * devicePixelRatio;
    canvas.height = desiredCSSHeight * devicePixelRatio;
    canvas.style.width  = desiredCSSWidth  + "px";
    canvas.style.height = desiredCSSHeight + "px";

    canvas.style.cursor = 'grab';
  }

  /**
   * todo container 尺寸变化监听，重新渲染
   * */
  /*onContainerResize() {
    if (ResizeObserver) {
      const observer = new ResizeObserver(() => {
        if (this.rendered) {
          this.setStyle();
          this.render();
        }
      });
      observer.observe(this.container);
    }
  }*/

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
    this.container = container;

    const canvas = document.createElement('canvas');
    this.canvas = canvas;
    container.append(canvas);

    this.setStyle();

    this.gl = getWebGLContext(canvas, debug);
    initShaders(this.gl, VertShader, FragShader);

    // this.onContainerResize();
  }

  /**
   * 场景变化的回调函数
   * */
  sceneChangeCallbacks: SceneChangeCallback[] = [];
  /**
   * 添加回调函数
   * */
  addListener(type: ListenerType, callback: ListenerCallback) {
    switch (type) {
      case "sceneChange":
        this.sceneChangeCallbacks.push(callback);
        break;
      default:
        break;
    }
  }
  /**
   * 移除监听
   * */
  removeListener(type: ListenerType, callback: ListenerCallback) {
    switch (type) {
      case "sceneChange":
        this.sceneChangeCallbacks = this.sceneChangeCallbacks.filter(item => item !== callback);
        break;
      default:
        break;
    }
  }
  /**
   * 移除所有监听
   * */
  removeAllListeners() {
    this.sceneChangeCallbacks = [];
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
  switchScene = (sceneIndex: number) => {
    if (sceneIndex === this.sceneIndex) return;
    const currentScene = this.scenes[this.sceneIndex];
    if (currentScene) currentScene.destroy();
    this.sceneIndex = sceneIndex;
    this.render();
    // 执行回调
    this.sceneChangeCallbacks.forEach(callback => {
      callback(this.scenes[this.sceneIndex], this.sceneIndex);
    });
  }

  /**
   * 渲染当前 Scene 到 canvas
   * */
  render() {
    const renderScene = () => {
      const currentScene = this.scenes[this.sceneIndex];
      if (!currentScene) {
        throw new Error('当前场景不存在');
      }
      const gl = this.gl;
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.enable(gl.DEPTH_TEST);
      currentScene.render(this);
      this.rendered = true;
    };
    if (!this.rendered) {
      // 先加载纹理
      loadPanoTexImage(this).then(renderScene);
    } else {
      renderScene();
    }
  }

  /**
   * 获取当前场景索引
   * @return {Scene} 当前场景
   * */
  getCurrentScene(): Scene {
    return this.scenes[this.sceneIndex];
  }

  /**
   * 设置当前场景
   * @param {Scene | number} scene 场景实例，或者场景索引
   * */
  setScene(scene: Scene | number) {
    if (typeof scene === 'number') {
      if (scene < 0 || scene > this.scenes.length - 1) {
        throw new Error('场景索引超出范围');
      }
      this.switchScene(scene);
    } else {
      const index = this.scenes.indexOf(scene);
      if (index === -1) {
        throw new Error('场景不存在');
      }
      this.switchScene(index);
    }
  }
}
