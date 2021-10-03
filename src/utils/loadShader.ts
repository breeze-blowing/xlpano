/**
 * 请求着色器文件
 * @param {string} file 着色器文件地址
 * @return {Promise<string>} Promise<着色器代码字符串>
 * */
function fetchFile(file: string): Promise<string> {
  return fetch(file).then(res => res.text());
}

/**
 * 请求顶点和片元着色器
 * @param {string} vertFile 顶点着色器文件地址
 * @param {string} fragFile 片元着色器文件地址
 * @return {Promise<string[]>} Promise<[顶点着色器代码字符串, 片元着色器代码字符串]>
 * */
export function loadShaderFile(vertFile: string, fragFile: string): Promise<string[]> {
  return Promise.all([
    fetchFile(vertFile),
    fetchFile(fragFile)
  ]);
}
