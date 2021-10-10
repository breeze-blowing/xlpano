import Pano from '../src/lib/pano';
import Scene from '../src/lib/scene';
import HotSpot from '../src/lib/hotSpot';

function main() {
  const pano = new Pano('containerId', true);

  const scene = new Scene([
    './assets/f.jpg',
    './assets/r.jpg',
    './assets/u.jpg',
    './assets/l.jpg',
    './assets/d.jpg',
    './assets/b.jpg',
  ]);
  const s1HotSpot1 = new HotSpot(0, 22.5, 1);
  // const s1HotSpot2 = new HotSpot(100,-140, 1);
  scene.addHotSpots([
    s1HotSpot1,
    // s1HotSpot2,
  ]);

  const scene2 = new Scene([
    './assets/room_f.jpg',
    './assets/room_r.jpg',
    './assets/room_u.jpg',
    './assets/room_l.jpg',
    './assets/room_d.jpg',
    './assets/room_b.jpg',
  ]);
  const s2HotSpot = new HotSpot(0, 100, 0);
  scene2.addHotSpots(s2HotSpot);

  pano.addScene(scene);
  pano.addScene(scene2);
  pano.render();
}

window.onload = main;
