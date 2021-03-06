import {createProgram, getWebGLContext, useProgram} from '../utils/cuon-utils';
import CubeVertShader from '../shader/cube/index.vert';
import CubeFragShader from '../shader/cube/index.frag';
import SphereVertShader from '../shader/sphere/index.vert';
import SphereFragShader from '../shader/sphere/index.frag';
import {WebGLRenderingContextWithProgram} from "../types/index";
import {loadPanoTexImage} from "./resource";
import Scene from "./interface/Scene";
import CubeScene from "./CubeScene";
import SphereScene from "./SphereScene";

type SceneChangeCallback = (scene: Scene, index: number) => void;

type ListenerType = 'sceneChange';

type ListenerCallback = SceneChangeCallback;

/**
 * 容器
 * */
export default class Pano {

  /**
   * @static {WebGLProgram} CubeGLProgram 立方体 WebGL 程序对象
   * */
  static CubeGLProgram: WebGLProgram;

  /**
   * @static {WebGLProgram} SphereGLProgram 球体 WebGL 程序对象
   * */
  static SphereGLProgram: WebGLProgram;

  /**
   * 初始化着色器程序
   * */
  initShader() {
    const scene = this.scenes[this.sceneIndex];
    if (scene instanceof CubeScene) {
      if(!Pano.CubeGLProgram) Pano.CubeGLProgram = createProgram(this.gl, CubeVertShader, CubeFragShader);
      useProgram(this.gl, Pano.CubeGLProgram);
    } else if (scene instanceof SphereScene) {
      if (!Pano.SphereGLProgram) Pano.SphereGLProgram = createProgram(this.gl, SphereVertShader, SphereFragShader);
      useProgram(this.gl, Pano.SphereGLProgram);
    } else {
      throw new Error('当前场景非法');
    }
  }

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

    // canvas 大小变化后，即时改变 gl 的 viewport
    this.gl.viewport(0, 0, canvas.width, canvas.height);

    canvas.style.cursor = 'grab';
  }

  /**
   * container 尺寸变化监听，重新渲染
   * */
  onContainerResize() {
    if (ResizeObserver) {
      const observer = new ResizeObserver(() => {
        if (this.rendered) {
          this.setStyle();
          this.render();
        }
      });
      observer.observe(this.container);
    }
  }

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

    this.gl = getWebGLContext(canvas, debug);
    this.setStyle();

    this.onContainerResize();
  }

  /**
   * 场景变化的回调函数
   * */
  sceneChangeCallbacks: SceneChangeCallback[] = [];
  /**
   * 添加回调函数
   * @param {ListenerType} type 监听类型，预定义好的
   * @param {ListenerCallback} callback 回调函数
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
   * 添加回调函数
   * @param {ListenerType} type 监听类型，预定义好的
   * @param {ListenerCallback} callback 回调函数
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
      this.initShader();
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
