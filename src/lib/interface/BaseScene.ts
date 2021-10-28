import {DefaultAnimDuration, DefaultFovy, DefaultMovingRate, DefaultYRange} from "../../config/index";
import Pano from "../Pano";
import Matrix4 from "../../utils/matrix";
import Scene, {SceneAngle, SceneAngleChangeCallback, SceneListenerType, VoidFunction} from "./Scene";
import HotSpot from "../HotSpot";
import {angleIn360, PI2Angle} from "../../utils/math";
import {TextureSource} from "../../types/index";

export default class BaseScene implements Scene {
  /**
   * @property {number} pitch 俯仰角-绕 x 轴旋转角度
   * */
  pitch = 0.0;
  /**
   * @property {number} yaw 偏航角-绕 y 轴旋转角度
   * */
  yaw = 0.0;

  /**
   * 视点参数
   * position: 视点位置
   * target: 视线方向
   * up: 上方向
   * */
  eye = {
    position: { x: 0.0, y: 0.0, z: 0.0 },
    target: { x: 0.0, y: 0.0, z: -1.0 },
    up: { x: 0.0, y: 1.0, z: 0.0 },
  }

  /**
   * @property {[number, number]} yRange 俯仰可视范围角度
   * */
  yRange = DefaultYRange;

  /**
   * @property {number} fovy 静态可视范围角度
   * */
  fovy = DefaultFovy;

  /**
   * @property {boolean} dragging 是否正在被拖拽
   * 鼠标按下置为 true；鼠标释放置为 false
   * */
  dragging = false;
  /**
   * @property {{x: number, y: number}} dragStartPoint 开始拖拽的起点
   * */
  dragStartPoint = { x: 0, y: 0 };

  /**
   * @property {boolean} angling 是否正在进行转动
   * */
  angling = false;

  /**
   * @property {boolean} fovying 是否正在进行移动（fovy 切换）
   * */
  fovying = false;

  /**
   * 获取 pitch 可移动范围
   * */
  getPitchRange() {
    const fovyHalf = this.fovy / 2;
    return [this.yRange[0] + fovyHalf, this.yRange[1] - fovyHalf];
  }

  /**
   * @property {Pano} pano 父容器Pano
   * */
  pano: Pano;

  setMvpMatrix() {
    const { gl } = this.pano;
    const {
      position: { x: eyeX, y: eyeY, z: eyeZ },
      target: { x: centerX, y: centerY, z: centerZ },
      up: { x: upX, y: upY, z: upZ },
    } = this.eye;
    const u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    if (!u_MvpMatrix) {
      throw new Error('获取 mvp 矩阵地址失败');
    }

    const { width, height } = this.pano.canvas;
    const mvpMatrix = new Matrix4();
    mvpMatrix.setPerspective(this.fovy, width / height, 0.01, 10.0);
    mvpMatrix.lookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ);
    mvpMatrix.rotate(this.pitch, 1, 0, 0);
    mvpMatrix.rotate(this.yaw, 0, 1, 0);

    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  }

  /**
   * 角度变化回调函数
   * */
  angleChangeCallbacks: SceneAngleChangeCallback[] = [];

  /**
   * @property {HotSpot[]} hotSpots 热点
   * */
  hotSpots: HotSpot[] = [];

  /**
   * 添加回调函数
   * */
  addListener(type: SceneListenerType, callback: SceneAngleChangeCallback) {
    switch (type) {
      case "angleChange":
        this.angleChangeCallbacks.push(callback);
        break;
      default:
        break;
    }
  }
  /**
   * 移除监听
   * */
  removeListener(type: SceneListenerType, callback: SceneAngleChangeCallback) {
    switch (type) {
      case "angleChange":
        this.angleChangeCallbacks = this.angleChangeCallbacks.filter(item => item !== callback);
        break;
      default:
        break;
    }
  }
  /**
   * 移除所有监听
   * */
  removeAllListeners() {
    this.angleChangeCallbacks = [];
  }

  /**
   * 销毁
   * */
  destroy() {
    // 移除热点
    if (this.hotSpots && this.hotSpots.length) this.hotSpots.forEach(hotSpot => hotSpot.destroy());
  }

  // 获取当前角度
  getAngle(): SceneAngle {
    return {
      pitch: this.pitch,
      yaw: this.yaw,
    }
  }

  getFovy(): number {
    return this.fovy;
  }

  // 渲染热点
  renderHotSpots(deltaPitch: number = 0, deltaYaw: number = 0) {
    if (this.hotSpots && this.hotSpots.length) {
      this.hotSpots.forEach(hotSpot => hotSpot.render(deltaPitch, deltaYaw, this.pano, this));
    }
  }

  // 执行角度变换回调
  executeAngleChangeCallbacks() {
    this.angleChangeCallbacks.forEach(callback => callback({ pitch: this.pitch, yaw: this.yaw }));
  }

  // 绘制前的准备工作
  beforeDrawElements(deltaPitch: number = 0, deltaYaw: number = 0) {
    const { gl } = this.pano;
    this.pitch += deltaPitch;
    const PitchRange = this.getPitchRange();
    if (this.pitch < PitchRange[0]) this.pitch = PitchRange[0];
    if (this.pitch > PitchRange[1]) this.pitch = PitchRange[1];
    this.yaw += deltaYaw;
    this.yaw = angleIn360(this.yaw);

    this.setMvpMatrix();

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  addHotSpots(hotSpots: HotSpot | HotSpot[]) {
    if (hotSpots instanceof Array) {
      this.hotSpots = this.hotSpots.concat(hotSpots);
    } else {
      this.hotSpots.push(hotSpots as HotSpot);
    }
  }

  /**
   * 绘制变换后的场景和热点
   * @param deltaPitch {number} 场景的俯仰角偏移值
   * @param deltaYaw {number} 场景的偏航角偏移值
   * @param instance {Scene} 场景实例
   * */
  draw(deltaPitch: number = 0, deltaYaw: number = 0) {
    this.beforeDrawElements(deltaPitch, deltaYaw);

    this.drawModel();

    this.renderHotSpots(deltaPitch, deltaYaw);

    this.executeAngleChangeCallbacks();
  }

  /**
   * 场景移动到某一点
   * @param {number} targetX 移动目标点的X坐标
   * @param {number} targetY 移动目标点的X坐标
   * */
  moveTo(targetX: number, targetY: number) {
    const { canvas } = this.pano;

    const deltaX = this.dragStartPoint.x - targetX;
    const deltaY = this.dragStartPoint.y - targetY;

    let deltaPitch;
    const PitchRange = this.getPitchRange();
    if (this.pitch <= PitchRange[0] && deltaY <= 0) {
      deltaPitch = 0;
    } else if (this.pitch >= PitchRange[1] && deltaY >= 0) {
      deltaPitch = 0;
    } else {
      deltaPitch = PI2Angle(Math.atan(deltaY / (canvas.height / 2)));
    }

    const deltaYaw = PI2Angle(Math.atan(deltaX / (canvas.width / 2)));
    this.draw(deltaPitch * DefaultMovingRate, deltaYaw * DefaultMovingRate);
    this.dragStartPoint = {x: targetX, y: targetY};
  }

  // 移动某个角度偏移量 - 可同步移动 fovy
  move(deltaPitch: number, deltaYaw: number, options: { animation?: boolean, duration?: number, callback?: VoidFunction} = {}) {
    const {animation, callback, duration = DefaultAnimDuration} = options;
    if (animation) {
      this.angling = true;

      const pitchSpeed = deltaPitch / duration;
      const yawSpeed = deltaYaw / duration;

      let start = Date.now();
      const startSign = start;

      const anim = () => {
        requestAnimationFrame(() => {
          const now = Date.now();
          const deltaTime = now - start;
          if (now < startSign + duration) {
            this.draw(pitchSpeed * deltaTime, yawSpeed * deltaTime);
            start = now;
            anim();
          } else {
            this.angling = false;
            if (callback) callback();
          }
        });
      };
      anim();
    } else {
      this.draw(deltaPitch, deltaYaw);
      if (callback) callback();
    }
  }

  // 设置角度
  setAngle(angle: SceneAngle, options?: { animation?: boolean, duration?: number, callback?: VoidFunction }) {
    const { pitch: targetPitch, yaw: targetYaw } = angle;
    this.move(targetPitch - this.pitch, targetYaw - this.yaw, options);
  }

  setFovy(fovy: number, options: { animation?: boolean, duration?: number, callback?: VoidFunction } = {}) {
    if (fovy <= 0 || fovy >= 180) {
      throw new Error('视角范围超出(0, 180)限制');
    }
    const { animation, callback, duration = DefaultAnimDuration } = options;
    if (animation) {
      this.fovying = true;

      const fovySpeed = (fovy - this.fovy) / duration;

      let start = Date.now();
      const startSign = start;

      const anim = () => {
        requestAnimationFrame(() => {
          const now = Date.now();
          const deltaTime = now - start;
          if (now < startSign + duration) {
            this.fovy += (fovySpeed * deltaTime);
            this.draw();
            start = now;
            anim();
          } else {
            this.fovying = false;
            if (callback) callback();
          }
        });
      };
      anim();
    } else {
      this.fovy = fovy;
      this.draw();
      if (callback) callback();
    }
  }

  /**
   * 点击热点回调
   * @param {HotSpot} hotSpot 目标热点
   * */
  onHotSpotClick(hotSpot: HotSpot) {
    this.move(-hotSpot.pitch, hotSpot.yaw > 180 ? -(360 - hotSpot.yaw) : hotSpot.yaw, {
      animation: true,
      callback: () => this.pano.switchScene(hotSpot.target),
    });
    this.setFovy(this.fovy - 6, {
      animation: true,
      callback: () => this.fovy = DefaultFovy,
    });
  }

  // 交互事件绑定
  eventBind() {
    const { canvas } = this.pano;
    // pc 端事件
    canvas.onmousedown = (ev) => {
      this.dragging = true;
      canvas.style.cursor = 'grabbing';
      this.dragStartPoint = {
        x: ev.offsetX,
        y: ev.offsetY,
      };
    };
    canvas.onmouseup = () => {
      this.dragging = false;
      canvas.style.cursor = 'grab';
    }
    canvas.onmouseout = () => {
      this.dragging = false;
      canvas.style.cursor = 'grab';
    }
    canvas.onmousemove = (ev) => {
      if (this.dragging && !this.angling && !this.fovying) this.moveTo(ev.offsetX, ev.offsetY);
    };
    // 手机端事件
    canvas.ontouchstart = (ev) => {
      const { top, left } = canvas.getBoundingClientRect();
      const targetX = ev.changedTouches[0].clientX - left;
      const targetY = ev.changedTouches[0].clientY - top;
      this.dragStartPoint = {x: targetX, y: targetY,};
    };
    canvas.ontouchmove = (ev) => {
      // 通过和 canvas 的视窗相对位置计算
      const { top, left } = canvas.getBoundingClientRect();
      const targetX = ev.changedTouches[0].clientX - left;
      const targetY = ev.changedTouches[0].clientY - top;
      if (!this.angling && !this.fovying) this.moveTo(targetX, targetY);
    };
  }

  /**
   * 纹理资源：在各个子类中重写
   * */
  textures: TextureSource[] | TextureSource;

  /**
   * 渲染模型：在各个子类中重写
   * */
  drawModel() {}

  /**
   * 渲染模型：在各个子类中重写
   * */
  replaceTextures(textures: TextureSource[] | TextureSource) {}

  /**
   * 渲染到 pano：在各个子类中重写
   * @param {Pano} pano 父容器
   * */
  render(pano: Pano) {
    this.pano = pano;

    // 在 render 里面重新绑定事件，其他 scene 的事件都会注销
    this.eventBind();
  }

}