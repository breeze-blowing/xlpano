# XLPano 全景引擎

## 介绍
XLPano 是一个基于 Typescript 的轻量的全景开源库。

## 安装
本库提供了直接使用 `<scrpit>` 标签引入方式和 `npm` 包两种方式
### 标签引入
`<script src="xlpano.min.js"></script>`
### npm 安装
`npm install xl-pano --save` 或者 `yarn add xl-pano`

## 使用
本库提供了三个关键的类，完成全景的搭建。
1. 引入 Pano, Scene, HotSpot
```
// 全局变量方式引入
const { Pano, Scene, HotSpot } = window.XLPano;

// ES6 module 方式引入
import { Pano, Scene, HotSpot } from 'xl-pano';

// CommonJS 方式引入
const { Pano, Scene, HotSpot } = require('xl-pano');
```
2. 构建全景
```
// 创建 pano，containerId 是容器 dom 节点的 id
const pano = new Pano('containerId');

// 创建 scene，立方体贴图按照[前, 右, 上, 左, 下, 后]的顺序添加
const scene = new Scene([f, r, u, l, d, b]);
// 创建 hotSpot，传入热点元素，目标场景索引，俯仰角，偏航角
const hotSpot = new HotSpot(HtmlElement, 1, { pitch: -10, yaw: 55 });

// scene 添加 hotSpot
scene.addHotSpots(hotSpot);
// pano 添加 scene
pano.addScene(scene);

// 渲染 pano
pano.render();
```

## 接口
Todo
