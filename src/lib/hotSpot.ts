import {angle2PI, angleIn360} from "../utils/math";
import Pano from "./pano";
import Scene from "./scene";

/**
 * 热点
 * */
export default class HotSpot {

  /**
   * @property {HTMLElement} dom 热点元素
   * */
  dom: HTMLElement;

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
   * @property {Pano} pano 爷爷容器Pano
   * */
  pano: Pano;

  /**
   * @property {Scene} scene 父容器Scene
   * */
  scene: Scene;

  /**
   * @constructor
   * @param {HTMLElement} dom 热点元素
   * @param {number} target 转场目标场景索引
   * @param {{pitch?: number, yaw?: number}} options 可选参数：pitch 位置-俯仰角-角度，范围是 (-90, 90)；yaw 位置-偏航角-角度
   * */
  constructor(dom: HTMLElement, target: number, options?: { pitch?: number, yaw?: number }) {
    if (!options) options = {};
    const { pitch = 0, yaw = 0 } = options;
    this.dom = dom;
    this.pitch = pitch;
    this.yaw = yaw;
    this.target = target;
  }

  /**
   * 把热点图像插入到容器内
   * @param deltaPitch {number} 场景的俯仰角偏移值
   * @param deltaYaw {number} 场景的偏航角偏移值
   * @param {Pano} pano 爷爷容器
   * @param {Scene} scene 父容器
   * */
  render(deltaPitch: number, deltaYaw: number, pano: Pano, scene: Scene) {
    this.pano = pano;
    this.scene = scene;

    const { container } = this.pano;

    this.dom.onclick = this.onClick;
    container.append(this.dom);

    const { width, height } = this.dom.getBoundingClientRect();

    const centerX = (container.offsetWidth - width) / 2;
    const centerY = (container.offsetHeight - height) / 2;

    this.pitch += deltaPitch;
    this.yaw -= deltaYaw;

    const { offsetWidth, offsetHeight } = container;

    /**
     * tan(|pitch|) = deltaTop / 1
     * pitch 的绝对值的正切：y 方向偏移量 / 深度(1)
     * pitch 的绝对值不超过配置的范围
     * deltaTop 的计算结果是归一化的，换算成像素值：* canvas.height / 2
     * */
    const deltaTop = Math.tan(angle2PI(Math.abs(this.pitch))) * (container.offsetHeight / 2);
    const top = this.pitch > 0 ? centerY - deltaTop : centerY + deltaTop;
    this.dom.style.top = `${top}px`;

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
      deltaLeft = 4;
    }
    deltaLeft *= (container.offsetWidth / 2) * (offsetHeight / offsetWidth);
    this.dom.style.left = `${centerX + deltaLeft}px`;
  }

  /**
   * 点击热点执行函数
   * */
  onClick = () => {
    // this.pano.switchScene(this.target);
    const duration = 1000;
    this.scene.moveToHotSpot(this, duration);
    setTimeout(() => {
      this.pano.switchScene(this.target);
    }, duration);
  }

  /**
   * 销毁
   * */
  destroy() {
    // 移除图片
    if (this.pano.container) this.pano.container.removeChild(this.dom);
  }

}
