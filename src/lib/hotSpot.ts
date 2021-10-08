import ArrowImage from '../assets/image/arrow.png';

/**
 * 热点
 * */
export default class HotSpot {

  /**
   * @static {number} 热点大小
   * */
  static size = 50;

  /**
   * @static 创建热点图片节点
   * */
  static createArrow() {
    const img = document.createElement('img');
    img.src = ArrowImage;
    img.width = HotSpot.size;
    img.height = HotSpot.size;
    img.style.position = 'absolute';
    img.style.opacity = '0.8';
    img.style.cursor = 'pointer';
    return img;
  }

  /**
   * @property {number} pitch 位置-俯仰角-角度
   * */
  pitch: number;

  /**
   * @property {number} yaw 位置-偏航角-角度
   * */
  yaw: number;

  /**
   * @property {number} target 目标场景索引
   * */
  target: number

  /**
   * @property {HTMLImageElement} image 图像
   * */
  image: HTMLImageElement | null;

  /**
   * @property {HTMLElement} container 容器
   * */
  container: HTMLElement;

  /**
   * @constructor
   * @param {number} pitch 位置-俯仰角-角度
   * @param {number} yaw 位置-偏航角-角度
   * @param {number} target 目标场景索引
   * */
  constructor(pitch: number, yaw: number, target: number) {
    this.pitch = pitch;
    this.yaw = yaw;
    this.target = target;
  }

  /**
   * 把热点图像插入到容器内
   * @param deltaPitch {number} 场景的俯仰角偏移值
   * @param deltaYaw {number} 场景的偏航角偏移值
   * @param {PanoRenderParams} params 全局通用渲染参数
   * */
  render(deltaPitch: number, deltaYaw: number, params: PanoRenderParams) {
    const { container, switchScene } = params;
    this.container = container;

    if (!this.image) {
      this.image = HotSpot.createArrow();
      this.image.onclick = () => switchScene(this.target);
      container.append(this.image);
    }

    const centerX = (container.offsetWidth - HotSpot.size) / 2;
    const centerY = (container.offsetHeight - HotSpot.size) / 2;
    const ratio = 6;
    this.pitch -= deltaPitch * ratio;
    this.yaw -= deltaYaw * ratio;
    this.image.style.top = `${centerX + this.pitch}px`;
    this.image.style.left = `${centerY + this.yaw}px`;
  }

  /**
   * 销毁
   * */
  destroy() {
    // 移除图片
    if (this.container) this.container.removeChild(this.image);
    this.image = null;
  }

}
