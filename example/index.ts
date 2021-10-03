import Pano from '../src/lib/pano';
import Scene from '../src/lib/scene';

function main() {
  const canvas = document.getElementById('panoCanvas');
  const pano = new Pano(canvas as HTMLCanvasElement, true);
  // const scene = new Scene();
  // pano.addScene(scene);
  pano.render();
}

window.onload = main;
