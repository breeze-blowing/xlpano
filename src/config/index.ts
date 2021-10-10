// 俯仰可视范围
const YRange = [-86, 86];

// 上下可视范围-角度制
export const Fovy = 90;
const FovyHalf = Fovy / 2;

// 俯仰可移动范围
export const PitchRange = [YRange[0] + FovyHalf, YRange[1] - FovyHalf];
