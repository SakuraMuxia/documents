## transform

transform 是一个属性，用来应用 2D 或 3D 变换效果。

它的值可以包含多个变换函数，例如：`translate（位移）`、`rotate（旋转）`、`scale（缩放）`、`skew（扭曲）` 等。

translate 是 transform 中的一个函数。

translate 用于移动元素的位置（不影响文档流）。

translate(x, y)：将元素在 x 方向移动 x，在 y 方向移动 y。

```css
.box {
  transform: translate(100px, 50px);
}
```

## 为什么有些情况用translate而不用定位

```ts
translate是transform属性中的一个函数，改变translate或opacity不会触发浏览器重新布局。
改变定位会触发浏览器重新布局，进而触发重绘
translate使浏览器创建一个GPU图层，改变绝对定位会使用CPU，translate会更高效。
translate改变位置时依然会占据空间，而定位会脱离文本流
```

## li与li之间的间隔如何处理

```ts
两个 <li> 之间的换行或空格（在 HTML 代码中）会导致大约 4px 的间隔，这是因为浏览器将换行符当作空格处理

解决办法：把li写成一行
使用 font-size：0 消除空格影响
```

## CSS3有哪些新特性

```ts
新增各种css选择器：ID选择器，类选择器，伪类选择器，属性选择器 标签选择器 伪元素选择器 全局选择器
```

## 媒体查询的理解

```ts
“媒体查询”（Media Queries）是 CSS3 引入的一项功能，用于根据不同的设备特性（如屏幕宽度、高度、分辨率、方向等）应用不同的样式。常用于响应式布局中，使网页在不同设备（手机、平板、桌面等）上都有良好表现
```

```ts
@media media-type and (condition) {
  /* 针对满足条件的设备的 CSS 规则 */
}

常见的 media-type：
all：所有设备（默认）
screen：屏幕设备
print：打印机

```

```ts
/* 小屏幕（手机） */
@media screen and (max-width: 600px) {
  body {
    background-color: lightblue;
  }
}

/* 中等屏幕（平板） */
@media screen and (min-width: 601px) and (max-width: 1024px) {
  body {
    background-color: lightgreen;
  }
}

/* 大屏幕（桌面） */
@media screen and (min-width: 1025px) {
  body {
    background-color: lightcoral;
  }
}

```

## 对CSS工程化的理解

