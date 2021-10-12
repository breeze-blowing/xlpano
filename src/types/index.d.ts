/**
 * 对 WebGLRenderingContext 进行扩展，加上 program，方便使用
 * */
interface WebGLRenderingContextWithProgram extends WebGLRenderingContext {
  program?: WebGLProgram
}

declare module '*.vert';
declare module '*.frag';
declare module '*.png';
declare module '*.gif';
declare module '*.jpg';

/**
 * 内部层层传递的全局变量
 * */
interface PanoRenderParams {
  gl: WebGLRenderingContextWithProgram,
  canvas: HTMLCanvasElement,
  container: HTMLElement,
  switchScene: (index: number) => void,
}
