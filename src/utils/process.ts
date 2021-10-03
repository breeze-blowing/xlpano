// 该工具集主要是 WebGL 流程中经常会用到的工具

/**
 * 把 TypedArray 传递给顶点着色器
 * @param {WebGLRenderingContextWithProgram} gl WebGL 上下文
 * @param {Float32Array} data 传递进着色器的数据
 * @param {number} size 指定从 data 中给每个顶点取数据时取几个，vertexAttribPointer 函数用的
 * @param {GLenum} type 数据类型，指明 WebGL 程序取数据时的内存长度
 * @param {string} attribute 着色器中定义的变量名
 * */
export function initArrayBuffer(
  gl: WebGLRenderingContextWithProgram,
  data: Float32Array,
  size: number,
  type: GLenum,
  attribute: string
): void {
  const buffer = gl.createBuffer();
  if (!buffer) {
    throw new Error('创建缓冲区对象失败');
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  const a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    throw new Error(`获取 ${attribute} 地址失败`);
  }
  gl.vertexAttribPointer(a_attribute, size, type, false, 0, 0);
  gl.enableVertexAttribArray(a_attribute);
}
