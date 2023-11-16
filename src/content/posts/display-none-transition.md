---
title: display:none "遮蔽"子元素 transition
date: 2023-11-14
---

在以前我们知道`display:none`的元素在从隐藏变为显示时是无法应用`transition`过渡的

(PS: 新版浏览器已经开始支持`display`过渡了, 例如 Chrome 在116版本开始支持: [Four new CSS features for smooth entry and exit animations](https://developer.chrome.com/blog/entry-exit-animations/), 相信其它浏览器也会逐步跟进)

但是我今天才知道的一点是**不只`display:none`的元素本身无法应用过渡, 连带其所有子元素(子树)都无法应用过渡**

## 演示

如下 [demo](https://codepen.io/kricsleo/pen/MWLvLVz), 你可以点击第一个按钮 "Toggle Directly", 这会直接切换父元素`display:none` <-> `display:block`, 同时也会切换其子元素透明度`opacity:0` <-> `opacity:1`. 

由于我在子元素上应用了过渡`transition:opacity 1s`, 理论上我应该可以看到子元素从隐藏变为显示的过程中透明度渐变才对, 但是实际上子元素不会有任何渐变过程, 而是直接变成终态.

```ts
btn.addEventListener('click', () => {
  parent.classList.toggle('parent--hidden')
  child.classList.toggle('child--hidden')
})
```

<iframe height="300" style="width: 100%;" scrolling="no" title="display-none-transition" src="https://codepen.io/kricsleo/embed/MWLvLVz?default-tab=" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/kricsleo/pen/MWLvLVz">
  display-none-transition</a> by kricsleo (<a href="https://codepen.io/kricsleo">@kricsleo</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>


## 解决方法

由于父元素和子元素的样式是同时变化的, 所以父元素的`display:none`强大的"遮蔽"<sup>(我使用"遮蔽"来描述这种行为)</sup>过渡能力把同一时间发生的子元素过渡也"遮蔽"掉了. 想要避免这个情况, 有两种方法:

1. **在父元素变化后的下一帧对子元素设置过渡**

这其实是绕过了"父子元素同时变化"这个条件, 使得子元素在下一帧开始过渡, 从而避免了被父元素"遮蔽".

你可以使用类似`requestAnimationFrame`在下一帧为子元素添加过渡, 例如示例中的

```ts
btnFrame.addEventListener('click', () => {
  parent.classList.toggle('parent--hidden')
  // Do animation in next frame
  requestAnimationFrame(() => {
      child.classList.toggle('child--hidden')
  })
})
```

2. **在父元素变化后立即访问一次页面任何元素的任何样式信息,随后再对子元素设置过渡**

这是个比较 Hack 的方式, 利用的是刷新浏览器缓存帧的原理(这跟应用比较广泛的 [FLIP](https://css-tricks.com/animating-layouts-with-the-flip-technique/) 过渡动画方式是同一个原理).

当父元素从`display:none`变为`display:block`之后浏览器并不会立即绘制内容到屏幕, 而是缓存在内存中等待更多的更改随后一次性绘制, 因为这样可以高效的节省很多次绘制. 

但是如果样式在被修改了之后我们立即读取一次最新的样式信息, 那么浏览器为了保证我们读取的屏幕上的样式值一定是正确的, 就会不再等待后续变更而是直接将缓存内容进行一次绘制, 然后读取值返回给我们. (因为正确性大于高效性)

所以在访问完样式信息之后, 页面绘制内容实际上就会被更新掉, `display:none`的遮蔽时机已过,然后我们再对子元素应用过渡, 那么过渡就可以正常发生了. 

例如示例中的读取`clientHeight`行为, 实际上你可以读取任何元素的任何样式信息来达到同样的效果

```ts
btnFlush.addEventListener('click', () => {
  parent.classList.toggle('parent--hidden')
  // This is the HACK which flushes the frame
  const _h = window.document.documentElement.clientHeight
  child.classList.toggle('child--hidden')
})
```