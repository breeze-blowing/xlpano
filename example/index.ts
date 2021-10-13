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

function main() {
  const pano = new Pano('containerId', true);

  const scene = new Scene([b_f, b_r, b_u, b_l, b_d, b_b]);
  const s1HotSpot1 = new HotSpot(-10, 126, 1, { description: '卫生间' });
  const s1HotSpot2 = new HotSpot(-10, 0, 1, { description: '墙壁' });
  scene.addHotSpots([s1HotSpot1, s1HotSpot2]);

  const scene2 = new Scene([r_f, r_r, r_u, r_l, r_d, r_b]);
  const s2HotSpot = new HotSpot(-10, 170, 0, { description: '主卧' });
  scene2.addHotSpots(s2HotSpot);

  pano.addScene(scene);
  pano.addScene(scene2);
  pano.render();
}

window.onload = main;
