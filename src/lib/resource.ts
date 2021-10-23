/**
 * 纹理图片加载逻辑
 * 1. 第一个场景
 * 2. 和第一个场景关联的场景
 * 3. 其他场景
 * */
import Pano from "./pano";
import Scene from "./scene";
import {loadImage} from "../utils/process";

const ImageResource: {[keu: string]: TexImageSource} = {};

export async function getTexImageSource(sources: string[]): Promise<TexImageSource[]> {
  const result: TexImageSource[] = [];
  for (const src of sources) {
    if (ImageResource[src]) {
      result.push(ImageResource[src]);
    } else {
      result.push(await loadImage(src));
    }
  }
  return result;
}

// 加载整个 pano 的纹理图，首个场景加载完就放行
export async function loadPanoTexImage(pano: Pano) {
  const scenes = pano.scenes;
  if (scenes.length > 0) {
    await loadOneSceneTexImage(scenes[0]);
  }
  if (scenes.length > 1) {
    // 第一个场景的关联场景索引
    let firstNeighborIndex: number[] = [];
    const firstHotSpots = scenes[0].hotSpots;
    if (firstHotSpots.length > 0) {
      // 从第一个场景的热点中找到关联场景索引
      firstNeighborIndex = firstHotSpots.map(hot => hot.target);
    }
    // 第一个场景关联场景的所有纹理图片
    let firstNeighborTextures: string[] = [];
    firstNeighborIndex.forEach(neighborIndex => {
      const neighborScene = scenes[neighborIndex];
      if (neighborScene) firstNeighborTextures = firstNeighborTextures.concat(filterSceneSrcTex(neighborScene));
    })
    loadTexImages(firstNeighborTextures);
    // 已经加载完成的索引列表
    const alreadyLoadedSceneIndex = firstNeighborIndex.concat([0]);
    // 其他场景纹理图片
    let otherSceneTextures: string[] = [];
    scenes.forEach((_, index) => {
      if (!alreadyLoadedSceneIndex.includes(index)) {
        const otherScene = scenes[index];
        if (otherScene) otherSceneTextures = otherSceneTextures.concat(filterSceneSrcTex(otherScene));
      }
    });
    loadTexImages(otherSceneTextures);
  }
}

function loadOneSceneTexImage(scene: Scene): Promise<void> {
  return loadTexImages(filterSceneSrcTex(scene));
}

function loadTexImages(images: string[]): Promise<void> {
  return Promise.all(images.map(image => loadImage(image))).then((results: TexImageSource[]) => {
    images.forEach((src, index) => {
      ImageResource[src] = results[index];
    });
  });
}

// 过滤一个场景中资源地址类型的纹理
function filterSceneSrcTex(scene: Scene): string[] {
  return scene.textures.filter(item => typeof item === 'string') as string[];
}
