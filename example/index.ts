import Pano from '../src/lib/pano';
import Scene from '../src/lib/scene';
import HotSpot from '../src/lib/hotSpot';

function main() {
  const pano = new Pano('containerId', true);

  const scene = new Scene([
    './assets/bedroom/f.jpg',
    './assets/bedroom/r.jpg',
    './assets/bedroom/u.jpg',
    './assets/bedroom/l.jpg',
    './assets/bedroom/d.jpg',
    './assets/bedroom/b.jpg',
  ]);
  const s1HotSpot1 = new HotSpot(-10, 126, 1, { description: '卫生间' });
  const s1HotSpot2 = new HotSpot(-10, 0, 1, { description: '墙壁' });
  scene.addHotSpots([s1HotSpot1, s1HotSpot2]);

  const scene2 = new Scene([
    './assets/restroom/f.jpg',
    './assets/restroom/r.jpg',
    './assets/restroom/u.jpg',
    './assets/restroom/l.jpg',
    './assets/restroom/d.jpg',
    './assets/restroom/b.jpg',
  ]);
  const s2HotSpot = new HotSpot(-10, 170, 0, { description: '主卧' });
  scene2.addHotSpots(s2HotSpot);

  pano.addScene(scene);
  pano.addScene(scene2);
  pano.render();
}

window.onload = main;
