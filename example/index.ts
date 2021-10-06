import Pano from '../src/lib/pano';
import Scene from '../src/lib/scene';

function main() {
  const canvas = document.getElementById('panoCanvas');
  const pano = new Pano(canvas as HTMLCanvasElement, true);
  const scene = new Scene([
    './assets/f.jpg',
    './assets/r.jpg',
    './assets/u.jpg',
    './assets/l.jpg',
    './assets/d.jpg',
    './assets/b.jpg',
  ]);
  pano.addScene(scene);
  pano.render();
}

window.onload = main;
