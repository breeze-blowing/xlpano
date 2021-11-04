/**
 * 纹理图片加载逻辑
 * 1. 第一个场景
 * 2. 和第一个场景关联的场景
 * 3. 其他场景
 * */
import Pano from "./Pano";
import Scene from "./interface/Scene";
import {loadImage} from "../utils/process";

const ImageResource: {[keu: string]: TexImageSource} = {};

/**
 * 加载图片资源
 * @param {string[]} sources 图片资源路径集合
 * @return {TexImageSource[]} 图片资源对象集合
 * */
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

/**
 * 加载图片资源
 * @param {string} src 图片资源路径
 * @return {TexImageSource} 图片资源对象
 * */
export async function getSingleTexImageSource(src: string): Promise<TexImageSource> {
  if (ImageResource[src]) return ImageResource[src];
  return await loadImage(src);
}

/**
 * 加载整个 pano 的纹理图
 * 1、加载首个场景，加载完就放行
 * 2、接着加载首个场景邻近的场景，先发出请求
 * 3、同时开始加载其他场景，后发出请求
 * */
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

/**
 * 加载单个场景的纹理图片，加载完后直接缓存到 ImageResource
 * @param {Scene} scene 场景
 * */
function loadOneSceneTexImage(scene: Scene): Promise<void> {
  return loadTexImages(filterSceneSrcTex(scene));
}

/**
 * 加载图片，加载完后直接缓存到 ImageResource
 * @param {string[]} images 图片资源路径集合
 * */
function loadTexImages(images: string[]): Promise<void> {
  return Promise.all(images.map(image => loadImage(image))).then((results: TexImageSource[]) => {
    images.forEach((src, index) => {
      ImageResource[src] = results[index];
    });
  });
}

/**
 * 过滤一个场景中资源地址类型的纹理，- 因为场景的纹理可以是资源地址，也可以是完成的资源
 * @param {Scene} scene 场景
 * */
function filterSceneSrcTex(scene: Scene): string[] {
  if (scene.textures instanceof Array) {
    return scene.textures.filter(item => typeof item === 'string') as string[];
  } else {
    return typeof scene.textures === 'string' ? [scene.textures] : [];
  }
}
