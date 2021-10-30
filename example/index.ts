import { Pano, CubeScene, SphereScene, HotSpot } from '../src/index';

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

import ggImg from './assets/gugong/2_1.jpg';

import arrow from './assets/hotSpot/arrow.png';
import {SceneAngle} from "../src/lib/interface/Scene";

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

  const bedroomScene = new CubeScene([b_f, b_r, b_u, b_l, b_d, b_b]);

  const restroomHotSpot = new HotSpot(createHotSpotDom('卫生间'), { pitch: -10, yaw: 55, target: 1 });

  const s1CustomHotSpotDom = createHotSpotDom('自定义');
  s1CustomHotSpotDom.onclick = () => alert('自定义热点交互');
  const s1CustomHotSpot = new HotSpot(s1CustomHotSpotDom, { pitch: -10, yaw: 0 });

  const ggHotSpot = new HotSpot(createHotSpotDom('故宫'), { pitch: -10, yaw: 10, target: 2 });

  bedroomScene.addHotSpots([restroomHotSpot, s1CustomHotSpot, ggHotSpot]);

  const restroomScene = new CubeScene([r_f, r_r, r_u, r_l, r_d, r_b]);
  const bedroomHotSpot = new HotSpot(createHotSpotDom('主卧'), { pitch: -10, yaw: 10, target: 0 });

  restroomScene.addHotSpots(bedroomHotSpot);

  const ggScene = new SphereScene(ggImg);
  const backHomeSpot = new HotSpot(createHotSpotDom('回家'), { pitch: 0, yaw: 0, target: 0 });
  ggScene.addHotSpots(backHomeSpot);

  pano.addScene(bedroomScene);
  pano.addScene(restroomScene);
  pano.addScene(ggScene);

  pano.render();

  // 按钮
  document.getElementById('getCurrentScene').onclick = () => {
    const currentScene = pano.getCurrentScene();
    if (currentScene === bedroomScene) {
      alert('房间');
    } else if (currentScene === restroomScene) {
      alert('洗手间');
    } else if (currentScene === ggScene) {
      alert('故宫');
    } else {
      alert('没有当前场景');
    }
  };
  document.getElementById('setScene1').onclick = () => {
    pano.setScene(0);
  }
  document.getElementById('setScene2').onclick = () => {
    pano.setScene(restroomScene);
  }
  document.getElementById('setScene3').onclick = () => {
    pano.setScene(2);
  }

  const onSceneChange = (scene: CubeScene, index: number) => {
    document.getElementById('showCurrentScene').innerText = `当前场景：scene${index + 1}`;
  };

  document.getElementById('addListener').onclick = () => {
    pano.addListener('sceneChange', onSceneChange);
    document.getElementById('showCurrentScene').innerText = '切换后显示当前场景';
  };

  document.getElementById('removeListener').onclick = () => {
    pano.removeListener('sceneChange', onSceneChange);
    document.getElementById('showCurrentScene').innerText = '当前场景：';
  };

  document.getElementById('getAngle').onclick = () => {
    const currentScene = pano.getCurrentScene();
    const angle = currentScene.getAngle();
    alert(`pitch: ${angle.pitch.toFixed(2)}；yaw: ${angle.yaw.toFixed(2)}`);
  };

  document.getElementById('setAngle').onclick = () => {
    const currentScene = pano.getCurrentScene();
    currentScene.setAngle({ pitch: 30, yaw: 45 });
  }
  document.getElementById('setAngleAnim').onclick = () => {
    const currentScene = pano.getCurrentScene();
    currentScene.setAngle({ pitch: 30, yaw: 45 }, { animation: true });
  }

  document.getElementById('getFovy').onclick = () => {
    const currentScene = pano.getCurrentScene();
    alert(`fovy: ${currentScene.getFovy().toFixed(2)}`);
  };

  document.getElementById('setFovy').onclick = () => {
    const currentScene = pano.getCurrentScene();
    currentScene.setFovy(80);
  }
  document.getElementById('setFovyAnim').onclick = () => {
    const currentScene = pano.getCurrentScene();
    currentScene.setFovy(80, { animation: true });
  }

  const onAngleChange = (angle: SceneAngle) => {
    document.getElementById('showCurrentAngle').innerText = `pitch：${angle.pitch.toFixed(2)}；yaw：${angle.yaw.toFixed(2)}`;
  };

  document.getElementById('addAngleListener').onclick = () => {
    bedroomScene.addListener('angleChange', onAngleChange);
    restroomScene.addListener('angleChange', onAngleChange);
    ggScene.addListener('angleChange', onAngleChange);
    document.getElementById('showCurrentAngle').innerText = '移动切换后显示角度';
  };

  document.getElementById('removeAngleListener').onclick = () => {
    bedroomScene.removeListener('angleChange', onAngleChange);
    restroomScene.removeListener('angleChange', onAngleChange);
    ggScene.removeListener('angleChange', onAngleChange);
    document.getElementById('showCurrentAngle').innerText = '当前角度：';
  };

  const replaceTexture = (sources: string[]) => {
    function loadImage(src: string): Promise<TexImageSource> {
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => resolve(image);
        image.onerror = error => reject(error);
        image.src = src;
      });
    }

    Promise.all(sources.map(src => loadImage(src))).then(images => bedroomScene.replaceTextures(images));
  };

  document.getElementById('replaceTexture').onclick = () => replaceTexture([r_f, r_r, r_u, r_l, r_d, r_b]);
  document.getElementById('replaceTextureBack').onclick = () => replaceTexture([b_f, b_r, b_u, b_l, b_d, b_b]);
}

window.onload = main;
