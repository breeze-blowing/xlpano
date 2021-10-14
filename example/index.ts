import { Pano, Scene, HotSpot } from '../src/index';

import b_b from './assets/bedroom/b.jpg';
import b_d from './assets/bedroom/d.jpg';
import b_f from './assets/bedroom/f.jpg';
import b_l from './assets/bedroom/l.jpg';
import b_r from './assets/bedroom/r.jpg';
import b_u from './assets/bedroom/u.jpg';

import r_b from './assets/restroom/b.jpg';
import r_d from './assets/restroom/d.jpg';
import r_f from './assets/restroom/f.jpg';
import r_l from './assets/restroom/l.jpg';
import r_r from './assets/restroom/r.jpg';
import r_u from './assets/restroom/u.jpg';

import arrow from './assets/hotSpot/arrow.png';

/**
 * 动态插入热点箭头图片动画样式文件
 * @param {number} imageSize
 * */
function injectHotSpotArrowAnimCss(imageSize: number) {
  const steps = 25
  const cssStr = `@keyframes xlpano_hot_spot_arrow_img_anim_name{0%{top:0}100%{top:-${imageSize * steps}px}}`;
  document.styleSheets[0].insertRule(cssStr, document.styleSheets[0].cssRules.length)
}

function createHotSpotDom(description?: string): HTMLElement {
  const imgSize = 50;

  const container = document.createElement('div');
  container.style.width = '70px';
  container.style.height = '50px';
  container.style.position = 'absolute';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.alignItems = 'center';
  container.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
  container.style.borderRadius = '10px';
  container.style.color = '#FFFFFF';
  container.style.fontSize = '16px';
  container.style.paddingTop = '2px';

  if (description) container.innerText = description;

  const imgCon = document.createElement('div');
  imgCon.style.width = `${imgSize}px`;
  imgCon.style.height = `${imgSize}px`;
  imgCon.style.cursor = 'pointer';
  imgCon.style.marginTop = '-14px';
  imgCon.style.overflow = 'hidden';

  container.appendChild(imgCon);

  const img = document.createElement('img');
  img.src = arrow;
  img.style.objectFit = 'cover';
  img.width = imgSize;
  img.height = 1250;
  img.style.position = 'relative';
  img.style.animation = 'xlpano_hot_spot_arrow_img_anim_name 2s steps(25) infinite';

  imgCon.appendChild(img);

  return container;
}

function main() {
  // 插入 anim - css
  injectHotSpotArrowAnimCss(50);

  const pano = new Pano('containerId', true);

  const scene1 = new Scene([b_f, b_r, b_u, b_l, b_d, b_b]);

  const s1HotSpot = new HotSpot(createHotSpotDom('卫生间'), 1, { pitch: -10, yaw: 55 });

  scene1.addHotSpots([s1HotSpot]);

  const scene2 = new Scene([r_f, r_r, r_u, r_l, r_d, r_b]);
  const s2HotSpot = new HotSpot(createHotSpotDom('主卧'), 0, { pitch: -10, yaw: 10 });

  scene2.addHotSpots(s2HotSpot);

  pano.addScene(scene1);
  pano.addScene(scene2);
  pano.render();
}

window.onload = main;
