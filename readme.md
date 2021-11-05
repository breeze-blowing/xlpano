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

