---
title: 原子化 CSS
date: 2023-05-26 18:05
---

之前一直有一个 TODO, 想要写一篇笔记, 主题就是 `tailwindcss vs windicss vs unocss` , 对比一下这三种比较流行的原子化 CSS, 但是一直咕咕.

- [UnoCSS](https://github.com/unocss/unocss)
- [Tailwindcss](https://github.com/tailwindlabs/tailwindcss)
- [Windi CSS](https://github.com/windicss/windicss)

今天在 TODO 列表里面又看到这条, 所以又去看了一下这三个工具(虽然 unocss 我一直在用, tailwindcss 短暂用过一次), 意外发现 [Windi CSS is Sunsetting](https://windicss.org/posts/sunsetting.html)! 不免有些感慨, 时过境迁的感觉.

那看来之后就是 unocss 和 tailwindcss 二选一了, 我个人更倾向于 unocsss, 有如下原因:

1. 维护者

  - unocss 是 [antfu](https://github.com/antfu)个人开源的, 开源社区处于积极维护中
  - tailwindcss 是 Tailwind Labs Inc. 开源的, 本质上是一家商业公司的开源作品, 开源社区也处于积极维护中

2. 灵活性

  - unocss 提供了很多预设, 但它的定位要更底层一些, 是一个 CSS 引擎, 通过正则表达式可以做出很多自定义的事情(理论上如果你想的话, 那么你甚至可以用 unocss 实现一个新的 tailwindcss!)
  - tailwindcss 同样提供了许多预设, 以及一些限定的东西(这不一定是个问题, 因为这也带来了规范化和更统一的理解)

4. 流行度

  - 虽然 Tailwindcss 下载和使用量远超 unocss, 但是一个原因是前者已经开发6年之久了, 后者则是新起之秀(开发2年), 另外一个原因是商业公司在宣传上投入的成本是会远大于社区个人的宣传的, 所以这条数据看看就好.

  <iframe src="https://www.npmvs.com/tailwindcss-vs-windicss-vs-unocss" title="tailwindcss-vs-windicss-vs-unocss" width="100%" height="800px"></iframe>

  <div style="text-align:center;">
    数据来源于<a href="https://www.npmvs.com/tailwindcss-vs-windicss-vs-unocss" target="_blank">npmvs.com</a>
  </div>

3. IDE 支持
  - 二者都有良好的 IDE 支持

就我个人而言, 一是处于对开源社区及作者的喜好, 二是我不喜欢和商业性挂上太多勾的东西(有些时候商业策略会导致产品上以自己利益为主, 而做出一些不那么"开源"的事情), 所以我更倾向于 unocss

Happy Friday!
