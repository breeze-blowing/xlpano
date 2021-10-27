import {TextureSource} from "../../types/index";
import HotSpot from "../HotSpot";
import Pano from "../Pano";

export type SceneListenerType = 'angleChange';

export type SceneAngleChangeCallback = (angle: SceneAngle) => void;

export type VoidFunction = () => void;

// 场景角度
export type SceneAngle = {
    pitch: number,
    yaw: number,
}

/**
 * 场景接口，CubeScene 和 SphereScene 都要实现的接口
 * */
export default interface Scene {
    textures: TextureSource[] | TextureSource;
    hotSpots: HotSpot[];

    addListener: (type: SceneListenerType, callback: SceneAngleChangeCallback) => void;
    removeListener: (type: SceneListenerType, callback: SceneAngleChangeCallback) => void;
    replaceTextures: (textures: TextureSource[] | TextureSource) => void;
    addHotSpots: (hotSpots: HotSpot | HotSpot[]) => void;
    render: (pano: Pano) => void;
    onHotSpotClick: (hotSpot: HotSpot) => void;
    destroy: VoidFunction;
    getAngle: () => SceneAngle;
    setAngle: (angle: SceneAngle, options?: { animation?: boolean, duration?: number, callback?: VoidFunction}) => void;
    getFovy: () => number;
    setFovy: (fovy: number, options?: { animation?: boolean, duration?: number, callback?: VoidFunction}) => void;
}
