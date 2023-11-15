---
title: inline-block 的 baseline 位置
date: 2021-5-20 14:12
---

今天又着了`vertical-align`的道了

场景：多个`display:inline-block`的`div`排在一行，他们的宽高内外边距都是相同的，唯一不同的是`div`里面的多行文本，有的是一行，有的是多行，然后`div`就会在水平方向参差不齐，如下
![水平方向参差不齐](/img/20211201142845.png)

开发阶段文本都是一行的，所以没看出问题，提测之后数据出现了多行文本导致没有对齐，一个bug产生了，当时看到第一反应就是水平方向的对齐问题十有八九是`vertical-align`导致的，手动给`div.box`添加一个`vertical-align:middle`临时解决问题，还是要知道问题产生的根源是什么。

我们知道`vertical-align`影响的是元素的`baseline`等参考线和它父元素的`baseline`等参考线的对齐关系，对于文本元素我们比较好按照常用的字母`x`来定位参考线位置，但是对于一个里面可能含有多个子元素的`inline-block`元素而言，它的`baseline`在哪呢？

> The baseline of an 'inline-block' is the baseline of its last line box in the normal flow, unless it has either no in-flow line boxes or if its 'overflow' property has a computed value other than 'visible', in which case the baseline is the bottom margin edge. --[w3c](https://www.w3.org/TR/CSS2/visudet.html#leading)

这个规则我也是在查找资料的过程中第一次知道，按照这个规则重新来看我们上面的布局，`box`元素里面有一个`h5`和`p`元素，`p`元素是最后一个行元素(` in-flow line boxes`)，那么`p`元素的`baseline`就是父元素`box`元素的`baseline`，所以三个`box`元素水平对齐时的参考位置就变成了它们里面的三个`p`元素对齐，这与图中的表现是一致的，三个`p`元素底部对齐(多行文本时每一行文本都有自己的`baseline`，按照「最后一个行元素」的规则使用最后一行元素的`baseline`)，这导致它们的父元素`box`没有对齐

## 为什么添加`vertical-align:middle`可以让`box`对齐？

我是真的很烦这个属性的，相关的解释和资料看过很多次，还是觉得很烦，一句话此时：元素`box`的中部与父元素的基线加上父元素x-height（[x高度](https://www.zhangxinxu.com/wordpress/2015/06/about-letter-x-of-css/)）的一半对齐。这个时候`box`的自身高度参与排布规则，而不是默认的`baseline`，所以避免了上面的问题(改为`top``bottom`等也是一样的效果)。

我们还可以改变`overflow`属性使其不为`visible`，比如`overflow:hidden`来达到同样的效果，这个时候是因为我们破坏了上面w3c规则的限定条件` if its 'overflow' property has a computed value other than 'visible'`, `box`元素的`baseline`不再由`p`元素决定，而是由自身的底部位置来决定，这样三个`box`的参考位置就相同了，也就能水平对齐了

![水平方向对齐](/img/20211201142932.png)

[online demo](https://codepen.io/kricsleo/pen/NWvwpzR)👇🏻
<iframe height="300" style="width: 100%;" scrolling="no" title="inline-block vertical-align" src="https://codepen.io/kricsleo/embed/preview/NWvwpzR?default-tab=result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/kricsleo/pen/NWvwpzR">
  inline-block vertical-align</a> by kricsleo (<a href="https://codepen.io/kricsleo">@kricsleo</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>
