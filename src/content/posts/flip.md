---
title: FLIP方式来实现css动画
date: 2021-08-06 12:00:00
---

# FLIP

最近在看vue文档的时候, 文档里面提到vue的`<transition>`是使用的[`FLIP`](https://aerotwist.com/blog/pixels-are-expensive/)技术实现的, 我看了一下这个`FLIP`感觉还挺有意思的, 他利用触发浏览器强制布局(`layout`)的方式来计算初始位置和最终位置的偏差值来做动画, 这个想法还挺秒的, 这里记录一下具体原理和一些实现的demo, 原文是[Pixels are expensive](https://aerotwist.com/blog/pixels-are-expensive/), 这篇文章中的视频和链接文章也很值得一看, 不要跳过

## 先分析浏览器绘制dom的步骤

`recalculate style`(可跳过) -> `layout`(可跳过) -> `paint`(可跳过) -> `composite`

这四个步骤中有些会根据具体情况被跳过

1. recalculate style(样式匹配)

这一步会把css和dom匹配上, 找出每个dom的样式结果, 这个步骤通常来说是非常快的(除非你一次性更改上千或更多的元素)

2. layout(布局)

计算出每个dom在页面上的几何信息(宽高和位置等), 这一步通常来说是比较麻烦的, 因为对于网页来说流式的排版意味着一个元素的几何信息变化, 比如高度变高, 那么会影响很多别的元素的排布, 被影响的元素要重新计算自己的几何位置.

**如果我们只改变了dom的视觉信息(颜色, 阴影值等)而没有改变元素的几何位置, 那么layout这个步骤是会被跳过的.**

有一种比较糟糕的情况可能是我们在写代码的过程中不小心会犯的, 浏览器的 layout 过程是惰性的, 通常会在帧的末尾去处理回流(reflow)(会触发layout)这种事情, 但是如果在帧的过程中我们去读取dom的几何信息, 比如`element.clientHeight`这样的方式, 那么为了让这一行代码能得出准确的结果, 浏览器就只能抛弃优化, 立刻去处理layout, 然后把当前准确的`clientHeight`给出来.[Preventing 'layout thrashing'](http://blog.wilsonpage.co.uk/preventing-layout-thrashing/)

例如如下代码:

```js
// Read
const h1 = element1.clientHeight;

// Write (invalidates layout)
element1.style.height = (h1 * 2) + 'px';

// Read (triggers layout)
const h2 = element2.clientHeight;

// Write (invalidates layout)
element2.style.height = (h2 * 2) + 'px';

// Read (triggers layout)
const h3 = element3.clientHeight;

// Write (invalidates layout)
element3.style.height = (h3 * 2) + 'px';
```

在读取`element2.clientHeight`和`element3.clientHeight`的过程中我们实际上触发了浏览器的强制layout, 原本我们更改元素尺寸代码会触发的reflow事件是会被浏览器在帧的结尾处理的, 但是因为我们触发了强制layout, 导致浏览器在这段代码执行的过程中实际已经发生了两次layout, 帧结尾还会有一次本该有的layout, 我们可以通过如下方式来避免

```js
// Read
const h1 = element1.clientHeight;
const h2 = element2.clientHeight;
const h3 = element3.clientHeight;

// Write (invalidates layout)
element1.style.height = (h1 * 2) + 'px';
element2.style.height = (h2 * 2) + 'px';
element3.style.height = (h3 * 2) + 'px';

// Document reflows at end of frame
```

这样浏览器就只会在帧结尾做一次layout

3. paint(绘制)

在前面知道了dom的几何信息和视觉信息之后, 浏览器在这一步进行像素级别的绘制dom的样式, 这一步肉眼看到的样式还不会变, 还要经过下面的composite才会最终显示到屏幕上

**如果是改变了一些特殊属性(例如下文会提到的transform等)直接触发了下文的composite, 那么paint这一步是会被跳过的**

4. composite(合成)

这一步可以类比于ps的图层的概念, 在没有 compsite 的时候所有元素在同一个层上排版, 一个元素样式改变会让浏览器去操作这一整个层, 相对来说比较损耗性能, 所以引入了compsite的方式, 通过开发者手动声明一些css属性把一些可预见会改变样式的dom移动到一个新的层上去渲染, 当dom样式发生变化的时候浏览器直接操作这个新的只含有这个元素的层就会快很多, 这一步之后肉眼就可以看到dom的样式变化了

为了保持帧率我们可以使用`transform`和`opacity`属性来做样式上的改变, 而不是使用`top``visibility`这种, 因为前者会触发浏览器自动把dom绘制到一个单独的层中, 在改变样式的时候浏览器可以利用一些优化手段, 例如GPU的绘制低透明度或者其它硬件加速等方式来快速改变这一层的样式, **跳过前面三个步骤, 直接进行composite**, 而后者则不会触发这种优化

简单来说就是如果相对一个动画做优化, 我们可以使用一些css属性来触发让浏览器把dom提升到一个单独的层中, 之后dom的动画效果就会单独在这个层中进行, 性能会好很多, 例如有时候看到一些`transform: translateZ(0)`看似无用的样式声明, 其实就是利用`transform`会触发生成单独层的原理来让dom元素之后的动画更流畅. 现在也可以使用新提出的属性[`will-change`](https://caniuse.com/?search=will-change)来告诉浏览器此dom马上就会产生动画, 请对此元素产生一个新的层, 并且会预准备资源对动画进行预优化, 在大量动画的场景下带来的流畅度提升还是比较明显的.

手动触发生成一个新层或者使用`will-change`是银弹吗?并不是!

- 如果页面上的层太多达到一定量级, 浏览器在合成层的时候负载就会很重, 一样会卡顿, 我隐约记得(也许记错了)苹果官网曾经发生过动画很卡顿的情况, 原因就是他们很喜欢动画, 所以手动触发生成了很多层, 导致最后合成层的时候发生卡顿, 适当减少层的数量就可以了
- `will-change`也请按需使用, 并且在动画结束之后要移除这个属性. 原因是浏览器会对有这个属性的dom预留比如内存空间或者动画路径优化等有成本的预操作, 如果无脑大量使用`will-change`只会大量占用资源最后还是会导致卡顿, 在动画结束后如果不移除这个属性那么那些用于优化的资源也就不会被释放, 累积多了以后也会造成卡顿, 常见的正确使用方式是, 比如一个dom在鼠标click的时候会触发动画, 那么在dom被hover的时候我们可以手动添加上`will-change`属性,这个时候浏览器就会开始为之后的动画做优化, 在动画结束后手动移除这个属性, 优化的资源就可以被释放.

 听起来很麻烦是吧? 是的, 目前我的感觉的确是这样, 没有银弹, 生活总是不那么如你所愿.

## 使用FLIP实现动画

[`FLIP`解释](https://css-tricks.com/animating-layouts-with-the-flip-technique/)

>**F**irst, **L**ast, **I**nvert, **P**lay
>
>- **First:** before anything happens, record the current (i.e., first) position and dimensions of the element that will transition. You can use `element.getBoundingClientRect()` for this, as will be shown below.
>- **Last:** execute the code that causes the transition to instantaneously happen, and record the final (i.e., last) position and dimensions of the element.*
>- **Invert:** since the element is in the last position, we want to create the illusion that it’s in the first position, by using `transform` to modify its position and dimensions. This takes a little math, but it’s not too difficult.
>- **Play:** with the element inverted (and pretending to be in the first position), we can move it back to its last position by setting its `transform` to `none`.

结合之前内容解释就是以下四个步骤

1. 计算初态几何信息(大小, 坐标等)
2. 触发一次强制布局(比如把终态的class直接给到dom上)让dom被布局(layout)到终态位置, 计算终态几何信息(这个过程触发了强制layout, 但是因为还没有走到后续的composite步骤, 所以屏幕上不会产生肉眼可见的dom变化, 但是在js里面已经可以读取到最终位置了)
3. 计算终态和初态的偏差, 作为dom`transform`属性的值, 这时dom就又回到了初态位置(这个过程也是肉眼不可见的, 因为还没有composite)
4. 把`transform`再修改为`none`, js执行结束, 然后在下一帧dom就会从初态位置以`transform`动画的形式移动到终态

这个过程还挺有意思的, 我们的初心是从初态移动到终态, 但是实际的实现其实是先移到终态, 然后假装回到初态, 最后以肉眼可见的动画形式从初态还原到终态, 编程里面有很多这种思想反转带来一片新天地的做法, 让人耳目一新, 我记得之前要做一个tab栏滑动过程中吸顶的效果, 常见的做法是顺着初心从下至上计算滚动位置, 到该吸顶的时候就fix住, 但是我在浏览一个看房app的时候就发现它的吸顶是从屏幕顶部向下出来一个tab栏固定住, 这个时候其实是存在两个tab栏的,一个顺着页面滚走了, 一个从屏幕顶部往下出现吸附住,这个想法就是逆着来的, 从上至下, 形成了有意思的吸顶效果, 当时一直赞叹逆转想法很精妙

总结上面两个章节描述的内容:

- 适度利用层的概念来使动画更流畅
- `FLIP`可以作为写动画时的一个实现方式

## demo

[FLIP in codepn](https://codepen.io/kricsleo/pen/RwpXMvv)

<iframe height="300" style="width: 100%;" scrolling="no" title="flip demo" src="https://codepen.io/kricsleo/embed/RwpXMvv?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/kricsleo/pen/RwpXMvv">
  flip demo</a> by kricsleo (<a href="https://codepen.io/kricsleo">@kricsleo</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

[frame-rate in codesandbox](https://codesandbox.io/s/frame-rate-yzd44)

## 曾经的一个疑问

**`useLayoutEffect`是如何在实际渲染前就能获得元素的真实dom大小的?**

浏览器的渲染过程实例分析见[React的useEffect与useLayoutEffect执行机制剖析](https://www.cnblogs.com/fulu/p/13470126.html)
最根本的原因是同步的代码可以阻断进程, 当执行对dom的修改(例如React中的commit阶段)之后浏览器不会马上对屏幕上的内容进行重绘, 而是在`recalculate style`(计算样式)和`layout`(布局)之后运行同步的代码, 此时可以获取到最新的元素节点信息(例如大小等), `useLayoutEffect`就发生在这个时刻, 在这一刻可以去修改dom的内容, 然后浏览器重新计算样式和布局之后如果不再有阻断的代码, 就进行下一步`paint`(绘制)把内容通过显卡绘制到屏幕上,变成肉眼可见的元素, 这个task(任务)结束之后再从栈里面取出代码运行.
`useEffect`可以类似理解为`setTimeout(fn, 0)`, 把代码放到下一个周期里面去执行, 这样可以不阻断页面内容的绘制, 如果`useEffect`里面改变了元素, 那么浏览器就进行一轮新的重绘, 更新页面上的内容, 用户可以看到屏幕内容的变化. 所以对于`useLayoutEffect`和`useEffect`的区别可以总结为前者是同步的阻断内容呈现的, 用户只会看到最终的内容, 中间过程用户处于等待内容呈现状态, 后者是异步的不阻断内容呈现的, 浏览器会进行重绘,用户会看到屏幕内容的前后变化.
一个常见的demo, 我就不写了, 只描述一下, 通过js反复改变一个元素的颜色在红蓝之间来回切换, 那么useLayoutEffect只会在页面上呈现最终的颜色, 而useEffect会看到元素的颜色不断切换.

## 参考

- [Pixels are expensive](https://uxplanet.org/functional-animation-in-ux-design-what-makes-a-good-transition-d6e7b4344e5e#.t0usjdtlu)
- [Functional Animation In UX Design: What Makes a Good Transition?](https://aerotwist.com/blog/pixels-are-expensive/)
- https://csstriggers.com/
