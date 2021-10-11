import ArrowImage from '../assets/image/arrow.png';
import {PitchRange} from "../config/index";
import {angle2PI, angleIn360} from "../utils/math";
import {injectHotSpotArrowAnimCss} from "../utils/css";

/**
 * 热点
 * */
export default class HotSpot {

  /**
   * 是否加载了动画样式
   * */
  static HasInjectArrowAnimCss = false;

  /**
   * @static {number} 热点大小
   * */
  static size = {
    width: 80,
    height: 50,
  };

  /**
   * @static 创建热点图片节点
   * @param {string} [description] 箭头上方的描述文字
   * */
  static createArrow(description?: string) {
    const imgSize = 50;
    if (!HotSpot.HasInjectArrowAnimCss) injectHotSpotArrowAnimCss(imgSize);

    const container = document.createElement('div');
    container.style.width = `${HotSpot.size.width}px`;
    container.style.height = `${HotSpot.size.height}px`;
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
    img.src = ArrowImage;
    img.style.objectFit = 'cover';
    img.width = imgSize;
    img.height = 1250;
    img.style.position = 'relative';
    img.style.animation = 'xlpano_hot_spot_arrow_img_anim_name 2s steps(25) infinite';

    imgCon.appendChild(img);

    return container;
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
  image: HTMLDivElement | null;

  /**
   * @property {string} description 描述
   * */
  description?: string;

  /**
   * @property {HTMLElement} container 容器
   * */
  container: HTMLElement;

  /**
   * @constructor
   * @param {number} pitch 位置-俯仰角-角度，范围是 (-90, 90)
   * @param {number} yaw 位置-偏航角-角度
   * @param {number} target 目标场景索引
   * @param {{description?: string}} options 可选参数：description 描述
   * */
  constructor(pitch: number, yaw: number, target: number, options?: { description?: string }) {
    if (pitch > PitchRange[1] || pitch < PitchRange[0]) {
      throw new Error(`俯仰角的范围不能超出[${PitchRange[0]}, ${PitchRange[1]}]`);
    }
    this.pitch = pitch;
    this.yaw = yaw;
    this.target = target;
    if (options && options.description) this.description = options.description;
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
      this.image = HotSpot.createArrow(this.description);
      this.image.onclick = () => switchScene(this.target);
      container.append(this.image);
    }

    const centerX = (container.offsetWidth - HotSpot.size.width) / 2;
    const centerY = (container.offsetHeight - HotSpot.size.height) / 2;

    this.pitch += deltaPitch;
    this.yaw -= deltaYaw;

    const { offsetWidth, offsetHeight } = this.container;

    /**
     * tan(|pitch|) = deltaTop / 1
     * pitch 的绝对值的正切：y 方向偏移量 / 深度(1)
     * pitch 的绝对值不超过配置的范围
     * deltaTop 的计算结果是归一化的，换算成像素值：* canvas.height / 2
     * */
    const deltaTop = Math.tan(angle2PI(Math.abs(this.pitch))) * (this.container.offsetHeight / 2);
    const top = this.pitch > 0 ? centerY - deltaTop : centerY + deltaTop;
    this.image.style.top = `${top}px`;

    /**
     * yaw 先转换到 [0, 360)，再区分 [0, 90, 180, 270, 360) 各个区间计算
     * 只要处理 [0, 90) 和 (270, 360)
     * 90 和 270 是无穷大，(90, 270) 范围在视线背面
     *
     * [0, 90): tan(yaw) = deltaLeft / 1
     * (270, 360): tan(360 - yaw) = deltaLeft / 1
     *
     * 横向偏移量还和 canvas 的宽高比还有关系，但是垂直方向的偏移量和宽高比没关系？？？
     * */
    this.yaw = angleIn360(this.yaw);
    let deltaLeft;
    if (this.yaw >= 0 && this.yaw < 90) {
      deltaLeft = Math.tan(angle2PI(this.yaw));
    } else if (this.yaw > 270) {
      deltaLeft = -Math.tan(angle2PI(360 - this.yaw));
    } else {
      // 直接给一个画布的宽度值，偏移到外面不显示
      deltaLeft = 2;
    }
    deltaLeft *= (this.container.offsetWidth / 2) * (offsetHeight / offsetWidth);
    this.image.style.left = `${centerX + deltaLeft}px`;
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
