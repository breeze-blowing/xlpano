/**
 * 对 WebGLRenderingContext 进行扩展，加上 program，方便使用
 * */
interface WebGLRenderingContextWithProgram extends WebGLRenderingContext {
  program?: WebGLProgram
}

/**
 * todo 这两个 Util，也需要用 ts 重写
 * */
declare let WebGLUtils: {
  setupWebGL: (canvas: HTMLCanvasElement) => WebGLRenderingContextWithProgram,
}
declare let WebGLDebugUtils: {
  makeDebugContext: (gl: WebGLRenderingContextWithProgram) => WebGLRenderingContextWithProgram,
}

declare module '*.vert';
declare module '*.frag';
declare module '*.png';

/**
 * 内部层层传递的全局变量
 * */
interface PanoRenderParams {
  gl: WebGLRenderingContextWithProgram,
  canvas: HTMLCanvasElement,
  container: HTMLElement,
  switchScene: (index: number) => void,
}
