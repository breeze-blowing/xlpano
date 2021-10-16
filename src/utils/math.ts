/**
 * 把一个角度换算成 [0, 360) 区间的值
 * @param {number} angle 原始角度
 * @return {number} 转换后的角度
 * */
export function angleIn360(angle: number): number {
  let result = angle % 360;
  if (result < 0) result += 360;
  return result;
}

/**
 * 把一个角度换算成弧度制
 * @param {number} angle 原始角度
 * @return {number} 转换后的弧度
 * */
export function angle2PI(angle: number): number {
  return angle * (2 * Math.PI / 360);
}

/**
 * 把一个弧度算成角度制，取整
 * @param {number} pi 原始弧度
 * @return {number} 转换后的角度
 * */
export function PI2Angle(pi: number): number {
  return pi / (2 * Math.PI / 360);
}
