/**
 * 动态插入热点箭头图片动画样式文件
 * @param {number} imageSize
 * */
export function injectHotSpotArrowAnimCss(imageSize: number) {
  const steps = 25
  const cssStr = `@keyframes xlpano_hot_spot_arrow_img_anim_name{0%{top:0}100%{top:-${imageSize * steps}px}}`;
  document.styleSheets[0].insertRule(cssStr, document.styleSheets[0].cssRules.length)
}
