import {Pano, CubeScene, SphereScene, HotSpot, SceneAngle, Scene} from '../src/index';

import b_b from './assets/bedroom/b.jpg';
import b_d from './assets/bedroom/d.jpg';
import b_f from './assets/bedroom/f.jpg';
import b_l from './assets/bedroom/l.jpg';
import b_r from './assets/bedroom/r.jpg';
import b_u from './assets/bedroom/u.jpg';

import r_b from './assets/restroom/b.jpeg';
import r_d from './assets/restroom/d.jpeg';
import r_f from './assets/restroom/f.jpeg';
import r_l from './assets/restroom/l.jpeg';
import r_r from './assets/restroom/r.jpeg';
import r_u from './assets/restroom/u.jpeg';

import sphereImg from './assets/room.jpeg';

import arrow from './assets/hotSpot/arrow.gif';

// 创建热点 dom
function createHotSpotDom(description?: string): HTMLElement {
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.justifyContent = 'center';
  container.style.alignItems = 'center';
  container.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
  container.style.borderRadius = '10px';
  container.style.padding = '0 8px 10px';

  const img = document.createElement('img');
  img.src = arrow;
  img.style.objectFit = 'contain';
  img.style.width = '40px';
  img.style.height = '40px';

  container.appendChild(img);

  if (description) {
    const desc = document.createElement('span');
    desc.style.fontSize = '12px';
    desc.style.color = '#ffffff';
    desc.style.marginTop = '6px';
    desc.innerText = description;
    container.appendChild(desc);
  }

  return container;
}

function main() {
  const pano = new Pano('containerId', true);

  // 主卧
  const bedroomScene = new CubeScene([b_f, b_r, b_u, b_l, b_d, b_b], { yaw: 50, pitch: 20 });
  // 主卧热点
  const restroomHotSpot = new HotSpot(createHotSpotDom('卫生间'), { pitch: -10, yaw: 55, target: 1 });
  const toBeautyDom = createHotSpotDom('看精装');
  toBeautyDom.onclick = () => pano.setScene(2);
  const beautySpot = new HotSpot(toBeautyDom, { pitch: -10, yaw: 0 });
  bedroomScene.addHotSpots([restroomHotSpot, beautySpot]);

  // 卫生间
  const restroomScene = new CubeScene([r_f, r_r, r_u, r_l, r_d, r_b], { yaw: 200, pitch: 30 });
  // 卫生间热点
  const bedroomHotSpot = new HotSpot(createHotSpotDom('主卧'), { pitch: -10, yaw: 10, target: 0 });
  restroomScene.addHotSpots(bedroomHotSpot);

  // 精装主卧
  const beautyScene = new SphereScene(sphereImg, { yaw: 80, pitch: 10 });
  // 精装主卧热点
  const backHomeSpot = new HotSpot(createHotSpotDom('回简装'), { pitch: 10, yaw: 80, target: 0 });
  beautyScene.addHotSpots(backHomeSpot);

  // 全部添加到 pano
  pano.addScene(bedroomScene);
  pano.addScene(restroomScene);
  pano.addScene(beautyScene);

  pano.render();

  // 按钮
  document.getElementById('getCurrentScene').onclick = () => {
    const currentScene = pano.getCurrentScene();
    if (currentScene === bedroomScene) {
      alert('房间');
    } else if (currentScene === restroomScene) {
      alert('洗手间');
    } else if (currentScene === beautyScene) {
      alert('精装房间');
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

  const onSceneChange = (scene: Scene, index: number) => {
    document.getElementById('showCurrentScene').innerText = `当前场景：第${index + 1}个场景`;
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
    beautyScene.addListener('angleChange', onAngleChange);
    document.getElementById('showCurrentAngle').innerText = '移动切换后显示角度';
  };

  document.getElementById('removeAngleListener').onclick = () => {
    bedroomScene.removeListener('angleChange', onAngleChange);
    restroomScene.removeListener('angleChange', onAngleChange);
    beautyScene.removeListener('angleChange', onAngleChange);
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
