# CSS篇

## CSS基础

### CSS选择器和优先级

| 选择器         | 格式          | 权重 |
| -------------- | ------------- | ---- |
| id选择器       | #id           | 100  |
| 类选择器       | .classname    | 10   |
| 属性选择器     | a[ref="eee"]  | 10   |
| 伪类选择器     | li:last-child | 10   |
| 标签选择器     | div           | 1    |
| 伪元素选择器   | li:after      | 1    |
| 相邻兄弟选择器 | h1 + p        | 0    |
| 子选择器       | ul>li         | 0    |
| 后代选择器     | li a          | 0    |
| 通配符选择器   | *             | 0    |

选择器优先级：

- 内联样式：1000
- id选择器：100
- 类选择器：伪类选择器，属性选择器10
- 标签选择器，伪元素选择器1

> !important声明的样式优先级最高
>
> 优先级如果相同，后边的样式覆盖前边的
>
> 继承得到的样式优先级最低

### css中继承属性和不可继承属性有哪些

不可继承属性

* display
* 文本属性中的：文本阴影效果，文本方法，文本对齐
* 盒子模型中：宽高内边距，外边距，边框
* 背景属性：
* 定位属性：float，clear，position

可继承属性：

* 字体大小，字体风格，字体粗细
* 文本属性：文本缩进，文本水平对齐，行高
* 元素可见性：visibility
* 列表属性：list-style
* 光标：cursor

### display的属性

* none:不显示
* block：快元素：可设置宽高
* inline：行内元素：不可设置宽高，同行显示
* inline-block：行内快：可设置宽高，同行显示

行内元素和块元素特点

**（1） 行内元素**

* 设置宽高无效
* 可以设置水平方向的margin和padding，不能设置垂直方向的padding和margin
* 不会自动换行

**（2）块级元素**

* 可以设置宽高
* 设置margin和padding都有效
* 可以自动换行
* 多个块状，默认从上到下

### 什么是BFC

BFC是block Format Context，块级格式上下文。当元素满足了一定的条件，我们就认为该元素创建了BFC。

创建了BFC的元素，我们可以把她当作一个独立的容器，容器内的元素不论如何布局都不会影响到外面

### 创建BFC的方式

* 根元素
* 浮动元素
* 绝对定位和固定定位
* 行内快元素
* 表格单元格，表格行，表格标题。
* overflow的值不为visible的块元素
* 伸缩项目
* 多列容器
* column-span为all的元素始终会创建一个新的BFC

### 创建BFC可以解决的问题

* 清除子元素浮动的影响：给浮动元素的父元素创建BFC，清除掉子元素浮动的影响。
* 给父元素创建BFC，第一个和最后一个子元素的外边距不会塌陷。

### 隐藏元素的方法

* display：none；渲染树不会渲染对象
* visibility：hidden；元素仍占据空间，不会响应绑定的监听事件
* opacity：0；将元素的透明度设置为0。元素占据空间，响应元素绑定的监听事件
* position：absolute；通过定位将元素移动到可视范围外，隐藏元素。
* z-index：负值；使用其他元素遮盖住该元素。
* transform：scale（0,0）；将元素缩放为0，来实现元素的隐藏。元素仍在页面中占据位置，不会响应绑定的监听事件

### link和import区别

两者都是外部引入css的方式，区别

* 加载时机不同：link在页面载入是同时加载，@import需要页面完全加载完毕后加载。
* 兼容性不同：link所有主流浏览器都支持，@import在早期浏览器支持不佳
* js控制能力不同：link标签，js可以操作，@import不可操作
* 用途范围不同：link标签除了可以加载css，还可以加载RSS订阅；@import只能用来处理css

### transition和animation的区别

* transition是过渡属性：强调过渡，他的实现需要一个事件（点击，焦点）才执行。
* animation是动画属性：实现不需要触发事件，设定好时间之后可以自己执行，可以循环一个动画。

### display:none与visibility:hidden区别

两个属性都是让元素隐藏，不可见，区别：

* 在渲染树中，display：none会让元素完全从渲染树中消失，渲染时不会占据任何空间，子元素一起隐藏
* visibility：hidden，不会让元素从渲染树中消失，渲染的元素占据响应的空间，内容不可见，子元素可以设置visibility：visible

### 伪元素和伪类的区别

伪元素：在内容元素的前后插入额外的元素和样式，

### transform

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

### 为什么有些情况用translate而不用定位

```ts
translate是transform属性中的一个函数，改变translate或opacity不会触发浏览器重新布局。
改变定位会触发浏览器重新布局，进而触发重绘
translate使浏览器创建一个GPU图层，改变绝对定位会使用CPU，translate会更高效。
translate改变位置时依然会占据空间，而定位会脱离文本流
```

### li与li之间的间隔如何处理

```ts
两个 <li> 之间的换行或空格（在 HTML 代码中）会导致大约 4px 的间隔，这是因为浏览器将换行符当作空格处理

解决办法：把li写成一行
使用 font-size：0 消除空格影响
```

### CSS3有哪些新特性

```ts
新增各种css选择器：ID选择器，类选择器，伪类选择器，属性选择器 标签选择器 伪元素选择器 全局选择器
```

### 媒体查询的理解

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

### 对CSS工程化的理解

1. 在宏观设计上：希望优化CSS文件的目录结构，对现有CSS文件能够进行复用
2. 在编码上：希望能够写出结构清晰，简明易懂的CSS，需要有一定的嵌套层级关系，更需要他有变量特性，计算能力，循环能力等。
3. 在维护性上：更强的可编程性意味着更优质的代码结构，实现复用意味着更强的拓展能力，增强可维护性

### 预处理器特性

1. 具备嵌套能力，通过嵌套可以反映不同的css属性之间的层级关系
2. 指定定义css变量 通过@符号定义 @变量名:值;
3. 提供计算函数，内置了计算百分比，取余计算，颜色调整函数，乘除计算
4. 支持混合mixins，类似于js中的函数，定义后可以在后续代码中调用。
5. 支持css模块化，实现复用
6. 支持条件判断（less）

### webpack能处理css吗如何实现

webpack在裸奔状态下，是不能处理css的，webpack本身是一个面向JavaScript且只能处理JavaScript代码的模块化打包工具；

webpack在loader的辅助下，是可以处理css的

### 如何用webpack实现对css的处理

使用两个关键的 loader：css-loader和style-loader

前者是导入css模块，对css代码进行编译处理，后者是创建style标签，把css内容写入到标签中。

### 如何判断元素是否达到可视区域

window.innerHeight 获取浏览器可视区的高度

document.body.scrollTop 是浏览器滚动的距离

imgs.offsetTop 是图片元素距离顶部文档的高度

当 imgs.offsetTop < document.body.scrollTop + window.innerHeight时，内容可以显示。

![image-20250529145007218](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250529145007218.png)

### z-index属性在什么情况下会失效

z-index是控制两个重叠状态的标签时，谁在谁的上方。z-index的值越大，就越是在上层

当 z-index属性在

* 父元素position为relative时，子元素的z-index失效。解决父元素的position改为absolute或static
* 元素没有设置position设置为非static属性。解决 设置该元素的position为relative，absolute或flex
* 元素在设置z-index的同时还设置了float浮动，解决：float去除，改为display：inline-block

### 常见的css布局单位

px：像素

%：浏览器的高度和宽度发生改变时，页面中的组件也会发生变化

em:文本相对长度单位，相对于当前对象内文本的字体尺寸，相对父元素的字体大小倍数（默认字体大小16px）

rem:相对于根元素（html元素）字体大小的倍数。

vw/vh:视图窗口有关的单位，vw相对于视图窗口的宽度，vh相对于视图窗口的高度。

### px，em，rem区别和使用场景

区别

* px是固定的像素
* em和rem是相对长度单位，长度不是固定的，适合响应式布局
* em是相对于父元素字体的大小。rem是相对于根元素。
