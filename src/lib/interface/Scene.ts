import {TextureSource} from "../../types/index";
import HotSpot from "../HotSpot";
import Pano from "../Pano";

export type SceneListenerType = 'angleChange';

export type SceneAngleChangeCallback = (angle: SceneAngle) => void;

export type SceneListenerCallback = SceneAngleChangeCallback;

export type VoidFunction = () => void;

/**
 * 场景角度
 * @param pitch {number} 俯仰角
 * @param yaw {number} 偏航角
 * */
export type SceneAngle = {
    pitch?: number,
    yaw?: number,
}

/**
 * 场景接口，CubeScene 和 SphereScene 都要实现的接口
 * */
export default interface Scene {
    /**
     * @property {TextureSource[] | TextureSource} textures 纹理资源：在各个子类中重写
     * */
    textures: TextureSource[] | TextureSource;
    /**
     * @property {HotSpot[]} hotSpots 热点
     * */
    hotSpots: HotSpot[];

    /**
     * 添加回调函数
     * @param type {SceneListenerType} 事件类型，预定义好的
     * @param  callback {SceneListenerCallback} 回调函数
     * */
    addListener: (type: SceneListenerType, callback: SceneListenerCallback) => void;
    /**
     * 移除监听
     * @param type {SceneListenerType} 事件类型，预定义好的
     * @param  callback {SceneListenerCallback} 回调函数
     * */
    removeListener: (type: SceneListenerType, callback: SceneListenerCallback) => void;
    /**
     * 渲染模型：在各个子类中重写
     * @param textures {TextureSource[] | TextureSource} 替换后的纹理资源
     * */
    replaceTextures: (textures: TextureSource[] | TextureSource) => void;
    /**
     * 添加热点
     * @param {HotSpot | HotSpot[]} hotSpots 待添加的热点
     * */
    addHotSpots: (hotSpots: HotSpot | HotSpot[]) => void;
    /**
     * 渲染到 pano
     * @param {Pano} pano 父容器
     * */
    render: (pano: Pano) => void;
    /**
     * 点击热点回调，执行切换场景前的动画
     * @param {HotSpot} hotSpot 目标热点
     * */
    onHotSpotClick: (hotSpot: HotSpot) => void;
    /**
     * 销毁
     * */
    destroy: VoidFunction;
    /**
     * 获取当前角度
     * @return {SceneAngle} 俯仰角/偏航角
     * */
    getAngle: () => SceneAngle;
    /**
     * 设置到某个角度
     * @param angle {SceneAngle} 目标角度值
     * @param options {AnimationOptions} 可选动画参数
     * */
    setAngle: (angle: SceneAngle, options?: { animation?: boolean, duration?: number, callback?: VoidFunction}) => void;
    /**
     * 获取视角范围
     * @return {number} 视角范围
     * */
    getFovy: () => number;
    /**
     * 设置到视角
     * @param fovy {number} 目标视角
     * @param options {AnimationOptions} 可选动画参数
     * */
    setFovy: (fovy: number, options?: { animation?: boolean, duration?: number, callback?: VoidFunction}) => void;
}
