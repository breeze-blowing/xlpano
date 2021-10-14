/**
 * 对 WebGLRenderingContext 进行扩展，加上 program，方便使用
 * */
export interface WebGLRenderingContextWithProgram extends WebGLRenderingContext {
  program?: WebGLProgram
}
