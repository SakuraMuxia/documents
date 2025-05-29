---
title: 常用CSS样式
authors: [yuluo]
tags: [css]
---

# 常用CSS样式

## 单行，多行文本溢出隐藏

```css
overflow:hidden;
text-overflow:ellipsis;
white-space:nowrap; // 不换行

overflow:hidden;	// 溢出隐藏
text-overflow:ellipsis; // 溢出使用省略号
display:-webkit-box;	// 设置弹性伸缩盒子
-webkit-box-orient:vertical; // 设置伸缩盒子排列模式
-webkit-line-clamp:3;	// 显示行数
```

