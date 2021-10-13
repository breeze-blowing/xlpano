// 该工具集主要是顶层工具，一般只会在初始化程序时使用一次
import WebGLUtils from './webgl-utils';
import WebGLDebugUtils from './webgl-debug';
import {WebGLRenderingContextWithProgram} from "../types/index";

/**
 * 初始化着色器程序，并挂载到 gl 上
 * @param {WebGLRenderingContextWithProgram} gl WebGL 上下文
 * @param {string} vshader 顶点着色器代码字符串
 * @param {string} fshader 片元着色器代码字符串
 * @return void
 */
export function initShaders(gl: WebGLRenderingContextWithProgram, vshader: string, fshader: string): void {
  const program = createProgram(gl, vshader, fshader);
  gl.useProgram(program);
  gl.program = program;
}

/**
 * 创建 program 程序对象
 * @param {WebGLRenderingContextWithProgram} gl WebGL 上下文
 * @param {string} vshader 顶点着色器代码字符串
 * @param {string} fshader 片元着色器代码字符串
 * @return WebGLProgram
 */
function createProgram(gl: WebGLRenderingContextWithProgram, vshader: string, fshader: string): WebGLProgram {
  // 创建着色器对象
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);

  // 创建程序对象
  const program = gl.createProgram();
  if (!program) {
    throw new Error('创建程序对象失败');
  }

  // 程序对象绑定着色器对象
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  // gl 链接程序对象
  gl.linkProgram(program);

  // 校验上一步的链接结果
  const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
    gl.deleteProgram(program);
    gl.deleteShader(fragmentShader);
    gl.deleteShader(vertexShader);
    throw new Error(`链接程序对象失败：${gl.getProgramInfoLog(program)}`);
  }
  return program;
}

/**
 * 创建着色器对象
 * @param {WebGLRenderingContextWithProgram} gl WebGL 上下文
 * @param {GLenum} type 着色器类型（顶点/片元）
 * @param {string} source 着色器代码
 * @return created shader object, or null if the creation has failed.
 */
function loadShader(gl: WebGLRenderingContextWithProgram, type: GLenum, source: string): WebGLShader {
  // 创建着色器对象
  const shader = gl.createShader(type);
  if (shader === null) {
    throw new Error(`创建 ${type} 着色器对象失败`);
  }

  // 设置着色器代码
  gl.shaderSource(shader, source);

  // 编译着色器
  gl.compileShader(shader);

  // 校验上一步的编译结果
  const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) {
    gl.deleteShader(shader);
    throw new Error(`编译着${type}色器失败：${gl.getShaderInfoLog(shader)}`);
  }

  return shader;
}

/**
 * 初始化WebGL，并返回上下文
 * @param {HTMLCanvasElement} canvas canvas 节点
 * @param {boolean} [debug] 是否开启 debug
 * @return WebGLRenderingContextWithProgram 上下文
 */
export function getWebGLContext(canvas: HTMLCanvasElement, debug?: boolean): WebGLRenderingContextWithProgram {
  // @ts-ignore 创建 WebGL 上下文
  let gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    throw new Error('创建 WebGL 上下文失败');
  }

  // 是否需要开启 debug
  if (debug) {
    // @ts-ignore
    gl = WebGLDebugUtils.makeDebugContext(gl);
  }

  return gl;
}
