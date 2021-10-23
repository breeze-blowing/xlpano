/**
 * 对 WebGLRenderingContext 进行扩展，加上 program，方便使用
 * */
export interface WebGLRenderingContextWithProgram extends WebGLRenderingContext {
  program?: WebGLProgram
}

/**
 * 纹理资源：可以是图像或者资源地址
 * */
export type TextureSource = TexImageSource | string;
