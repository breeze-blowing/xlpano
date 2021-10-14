/**
 * 对 WebGLRenderingContext 进行扩展，加上 program，方便使用
 * */
export interface WebGLRenderingContextWithProgram extends WebGLRenderingContext {
  program?: WebGLProgram
}

/**
 * 内部层层传递的全局变量
 * */
export interface PanoRenderParams {
  gl: WebGLRenderingContextWithProgram,
  canvas: HTMLCanvasElement,
  container: HTMLElement,
  switchScene: (index: number) => void,
}
