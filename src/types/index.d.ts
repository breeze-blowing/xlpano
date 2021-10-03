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

/**
 * 以字符串的方式 import 着色器文件
 * */
declare module '*.vert';
declare module '*.frag';
