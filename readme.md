# XLPano 全景引擎

## 介绍
XLPano 是一个基于 Typescript 的轻量的全景开源库。使用 WebGL1.0 实现，同时支持立方体场景和球体场景。

## 示例地址
https://breeze-blowing.github.io/xlpano/index.html

## 安装
本库提供了直接使用 `<scrpit>` 标签引入方式和 `npm` 包两种方式
### 标签引入
`<script src="xlpano.min.js"></script>`
### npm 安装
`npm install xl-pano --save` 或者 `yarn add xl-pano`

## 使用
本库提供了四个关键的类，完成全景的搭建。
1. 引入 Pano, CubeScene(立方体场景，六面体贴图), SphereScene(球体场景，长宽2:1贴图), HotSpot
```
// 全局变量方式引入
const { Pano, CubeScene, SphereScene, HotSpot } = window.XLPano;

// ESM 方式引入
import { Pano, CubeScene, SphereScene, HotSpot } from 'xl-pano';

// CommonJS 方式引入
const { Pano, CubeScene, HotSpot } = require('xl-pano');
```
2. 构建全景
```
// 创建 pano，containerId 是容器 dom 节点的 id
const pano = new Pano('containerId');

// 创建 CubeScene，立方体贴图按照[前, 右, 上, 左, 下, 后]的顺序添加
const cubeScene = new CubeScene([f, r, u, l, d, b]);
// 创建 hotSpot，传入热点元素，目标场景索引，俯仰角，偏航角
const hotSpot = new HotSpot(HtmlElement, 1, { pitch: -10, yaw: 55 });

// 创建 SphereScene，传入宽高2:1场景贴图
const sphereScene = new SphereScene(image);

// scene 添加 hotSpot
cubeScene.addHotSpots(hotSpot);
// pano 添加 scene
pano.addScene(cubeScene);
pano.addScene(sphereScene);

// 渲染整个 pano
pano.render();
```

> 完整示例查看 /example 目录

## 特别注意
- 本库使用 WebGL1.0 实现，场景贴图的宽高尺寸值必须是2的n次幂
- 本库没有做降级处理，对于不支持 WebGL1.0 的浏览器，无法使用本库

## 文档

### Pano
一个全景能包含多个场景，Pano 作为整个全景的管理者，管理所有的场景，控制着场景的切换。
#### 构造函数
`const pano = new Pano('containerId');`

| 参数名 | 说明 | 类型 | 必填 | 默认值 | 备注 |
| ---   | --- | --- | --- | ---   | ---  |
| id    | 容器 id | string | 是 | - | -   |
| debug | 是否开启 debug | boolean | 否 | false | WebGL相关方法发生的错误并不会直接抛出来，难以定位问题；开启 debug 会打印这些错误；生产环境请关闭 debug |

#### 实例方法
- addScene
  - 说明：添加场景，场景是承载画面的实例，被添加进 pano 的场景才能显示，具体内容看 `Scene` 文档
  - 接口：(scene: Scene) => void
  - 参数：
      
    | 参数名 | 说明 | 类型 | 必填 | 默认值 | 备注 |
    | ---   | --- | --- | --- | ---   | ---  |
    | scene | 场景实例 | Scene | 是 | - | `Scene` 是接口，具体使用 `CubeScene` 或者 `SphereScene` |
  - 返回值：无
  
- render
  - 说明：渲染全景，执行该方法发后在页面显示全景。在执行 render 前请先添加好场景。
  - 接口：() => void
  - 参数：无
  - 返回值：无
  
- setScene
  - 说明：通过该方法，能任意设置当前场景，前提是被设置的场景已经通过 `addScene` 方法被添加到 pano 中了。
  - 接口：(scene: scene: Scene | number) => void
  - 参数：

    | 参数名 | 说明 | 类型 | 必填 | 默认值 | 备注 |
    | ---   | --- | --- | --- | ---   | ---  |
    | scene | 场景实例或者场景索引 | Scene 或 number | 是 | - | 索引是场景被添加到 pano 的顺序值 |
  - 返回值：无
  
- getCurrentScene
  - 说明：获取当前场景实例
  - 接口：() => Scene
  - 参数：无
  - 返回值：当前场景实例
  
- addListener
  - 说明：添加监听函数
  - 接口：(type: ListenerType, callback: ListenerCallback) => void
  - 参数：

    | 参数名 | 说明 | 类型 | 必填 | 可选值 | 默认值 | 备注 |
    | ---   | --- | --- | --- | ---   | ---   | --- |
    | type  | 事件类型 | ListenerType | 是 | `sceneChange` | - | 目前只有场景变换一种事件类型 |
    | callback | 回调函数 | ListenerCallback | 是 | `SceneChangeCallback` | - | 方法参数见下面文档 |
  - SceneChangeCallback 方法
    - 场景变化回调函数，`type === 'sceneChange'` 被执行
    - 接口：(scene: Scene, index: number) => void
    - 回调参数：
      
      | 参数名 | 说明 | 类型 | 备注 |
      | ---   | --- | --- | --- |
      | scene  | 场景实例 | Scene | 变化后的场景实例 |
      | index | 场景索引 | number | 索引是场景被添加到 pano 的顺序值 |
  
- removeListener
  - 说明：移除监听函数
  - 接口：(type: ListenerType, callback: ListenerCallback) => void
  - 参数：

    | 参数名 | 说明 | 类型 | 必填 | 可选值 | 默认值 | 备注 |
    | ---   | --- | --- | --- | ---   | ---   | --- |
    | type  | 事件类型 | ListenerType | 是 | `sceneChange` | - | 目前只有场景变换一种事件类型 |
    | callback | 回调函数引用 | ListenerCallback | 是 | `SceneChangeCallback` | - | `addListener` 传入方法的引用 |
  
- removeAllListeners
  - 说明：移除所有监听，一般在销毁的时候调用
  - 接口：() => void
  - 参数：无
  - 返回值：无
  
### Scene
Scene (场景)是真正渲染画面的载体；`Scene` 本身是一个接口，不能直接实例化使用。
本库提供了 `CubeScene` (立方体场景) 和 `SphereScene` (球体场景) 两种场景。

### CubeScene 和 SphereScene 相同的实例方法
- addHotSpots
  - 说明：添加热点，热点是附着在场景上的 dom 节点，具体内容看 `HotSpot` 文档
  - 接口：(hotSpots: HotSpot | HotSpot[]) => void
  - 参数：

    | 参数名 | 说明 | 类型 | 必填 | 默认值 | 备注 |
    | ---   | --- | --- | --- | ---   | ---  |
    | hotSpots | 热点实例 | HotSpot 或 HotSpot[] | 是 | - | 可以添加单个热点或热点数组 |
  - 返回值：无

- addListener
  - 说明：添加监听函数
  - 接口：(type: SceneListenerType, callback: SceneListenerCallback) => void
  - 参数：

    | 参数名 | 说明 | 类型 | 必填 | 可选值 | 默认值 | 备注 |
    | ---   | --- | --- | --- | ---   | ---   | --- |
    | type  | 事件类型 | SceneListenerType | 是 | `angleChange` | - | 目前只有角度变换一种事件类型 |
    | callback | 回调函数 | SceneListenerCallback | 是 | `SceneAngleChangeCallback` | - | 方法参数见下面文档 |
  - SceneAngleChangeCallback 方法
    - 场景变化回调函数，`type === 'angleChange'` 被执行
    - 接口：(angle: SceneAngle) => void
    - 回调参数：

      | 参数名 | 说明 | 类型 | 备注 |
      | ---   | --- | --- | --- |
      | angle  | 场景角度 | SceneAngle | 变化后的角度，具体看上面 `SceneAngle` 文档 |

- removeListener
  - 说明：移除监听函数
  - 接口：type: SceneListenerType, callback: SceneListenerCallback) => void
  - 参数：

    | 参数名 | 说明 | 类型 | 必填 | 可选值 | 默认值 | 备注 |
    | ---   | --- | --- | --- | ---   | ---   | --- |
    | type  | 事件类型 | SceneListenerType | 是 | `angleChange` | - | 目前只有角度变换一种事件类型 |
    | callback | 回调函数引用 | SceneListenerCallback | 是 | `SceneAngleChangeCallback` | - | `addListener` 传入方法的引用 |

- removeAllListeners
  - 说明：移除所有监听，一般在销毁的时候调用
  - 接口：() => void
  - 参数：无
  - 返回值：无

- getAngle
  - 说明：获取当前角度
  - 接口：() => SceneAngle
  - 参数：无
  - 返回值：场景角度，类型参考下面 `SceneAngle` 文档

- setAngle
  - 说明：设置场景角度
  - 接口：(angle: SceneAngle, options?: { animation?: boolean, duration?: number, callback?: VoidFunction}) => void
  - 参数：

    | 参数名 | 说明 | 类型 | 必填 | 默认值 | 备注 |
    | ---   | --- | --- | --- | ---   | --- |
    | angle | 场景角度 | SceneAngle | 是 | - | 类型参考下面 `SceneAngle` 文档 |
    | options | 可选参数 | 参考下面文档 | 否 | { animation: false, duration: 500, callback: () => {} } | - |
    
  - options 可选参数：
    
    | 参数名 | 说明 | 类型 | 必填 | 默认值 | 备注 |
    | ---   | --- | --- | --- | ---   | --- |
    | animation | 切换过程是否需要动画 | boolean | 否 | false | - |
    | duration | 动画执行时间 | number | 否 | 500 | 毫秒 |
    | callback | 切换完场景后的回调函数 | VoidFunction | 否 | - | - |

- getFovy
  - 说明：获取视角范围
  - 接口：() => number
  - 参数：无
  - 返回值：视角范围

- setFovy
  - 说明：设置视角范围，增大会有离远的视觉效果，减小会有走近的视觉效果
  - 接口：(fovy: number, options?: { animation?: boolean, duration?: number, callback?: VoidFunction}) => void
  - 参数：

    | 参数名 | 说明 | 类型 | 必填 | 默认值 | 备注 |
    | ---   | --- | --- | --- | ---   | --- |
    | fovy | 视角范围 | number | 是 | - | 小于 180 |
    | options | 可选参数 | 参考 setAngle 的 options 参数 | 否 | { animation: false, duration: 500, callback: () => {} } | - |


### CubeScene 单独接口
立方体场景，也称天空盒，需要前后左右上下六张贴图构建场景。
#### 构造函数
`const cubeScene = new CubeScene([f, r, u, l, d, b], { yaw: 50, pitch: 20 });`

| 参数名 | 说明 | 类型 | 必填 | 默认值 | 备注 |
| ---   | --- | --- | --- | ---   | ---  |
| textures | 贴图数组 | TextureSource[] | 是 | - | 六个面的贴图，需按照 前-右-上-左-下-后 的顺序；类型详细说明见 `TextureSource` 文档 |
| defaultAngle | 初始角度 | SceneAngle | 否 | { yaw: 0, pitch: 0 } | 类型详细说明见 `SceneAngle` 文档 |

- TextureSource 贴图资源：可以是网络资源链接地址，也可以是 `TexImageSource` 对象。通过 `new Image()` 可以实例化一个 `TexImageSource` 
  对象；在使用 `TexImageSource` 对象实例化 `CubeScene` 对象前，请先确保 `TexImageSource` 的图片资源已经加载完成。
- SceneAngle 场景角度：有两个属性，pitch(俯仰角) 和 yaw(偏航角)。对于全景而言，俯仰角一般在 [-90, 90] 度范围之间；偏航角理论上可以无限的旋转，
  但是为了方便理解，本库会默认将偏航角转换到 [0, 360) 度的范围
  
#### 实例方法
- replaceTextures
  - 说明：替换贴图
  - 接口：(textures: TextureSource[]) => void
  - 参数：参考构造函数中的 textures 参数
  - 返回值：无
  
### SphereScene 单独接口
球体场景，仅需要一张宽高长度比 2:1 的贴图即可构建场景。
#### 构造函数
`const scene = new SphereScene(sphereImg, { yaw: 80, pitch: 10 });`

| 参数名 | 说明 | 类型 | 必填 | 默认值 | 备注 |
| ---   | --- | --- | --- | ---   | ---  |
| texture | 贴图 | TextureSource | 是 | - | 需要宽高比2:1的贴图，`TextureSource` 具体参考上面文档 |
| defaultAngle | 初始角度 | SceneAngle | 否 | { yaw: 0, pitch: 0 } | 类型详细说明见 `SceneAngle` 文档 |

#### 实例方法
- replaceTextures
  - 说明：替换贴图
  - 接口：(texture: TextureSource) => void
  - 参数：参考构造函数中的 texture 参数
  - 返回值：无

#### 关于 Scene 的 replaceTextures 接口
- CubeScene 和 SphereScene 都有 replaceTextures 方法，参数类型相同；只不过 CubeScene 需要六张图，SphereScene 只需要一张图
- 因为本库没有提供单独的资源加载接口，资源加载是在 render 阶段执行的，加载完资源后才真正绘制场景，因此直接使用高清网络资源图会出现白屏现象。
  可以在 Scene 的构造函数中使用低清缩略图来加速首屏显示，然后同时加载高清资源图，加载完成后使用 replaceTextures 替换首屏贴图
- 同时 XLPano 库内部会对非首个场景的网络资源图有预加载机制，所以在切换场景时，一般不会存在白屏问题

### HotSpot
热点是附着在场景上的 dom 节点，会跟随场景转动，还内置了被点击切换场景的功能

#### 构造函数
`const hotSpot = HotSpot(dom, { pitch: -10, yaw: 10, target: 1 });`

| 参数名 | 说明 | 类型 | 必填 | 默认值 | 备注 |
| ---   | --- | --- | --- | ---   | ---  |
| dom | dom对象 | HTMLElement | 是 | - | 热点本质是一个dom对象，需要自己构建后传入构造函数 |
| option | 可选参数 | 参考下面文档 | 否 | { yaw: 0, pitch: 0 } | 参考下面文档 |

- option 参数：有 yaw、pitch 和 target 三个属性，都是可选属性
  - yaw 和 pitch 分别为初始偏航角和初始俯仰角，可参考上面 SceneAngle 的定义
  - yaw 和 pitch 的初始值是相对于 scene 的偏航角和俯仰角都是 0 的基础的；若添加热点的时候，场景有默认角度，则首次渲染热点的时候会添加场景的默认角度
  - target 表示目标场景索引，如果传入了该属性，且目标场景存在，则点击该热点，会切换到目标场景
  - 如果不传 target 属性，库不会对热点做任何默认操作，你可以对 dom 做自定义操作
