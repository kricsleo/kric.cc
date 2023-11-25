---
title: 终端如何输出?
date: 2023-11-25
---

最近写了个快速在本地创建各种技术栈 demo 项目的工具, 这里👉🏻[create](https://github.com/kricsleo/create)

主线任务并不困难, 但是在实时日志输出这块反而花费了比主线任务还要多的时间 (因为我喜欢花里胡哨的东西 :)

nodejs 相关的`readline`api 能够操作日志输出`process.stdin`流中指针的位置, 从而可以实现各种各样有趣的效果, 比如常见的终端 loading 动画, 就是通过反复重置指针位置, 每次在同一位置输出不同内容的动画帧( loading 符号)从而实现 loading 效果.

但是关于`moveCursor`和`cursorTo`等相关 api 用起来却不是很顺手, 我想到 `vitest` 在跑测试时是如何实现实时日志的定位和管理的, 关于终端输出这块应该需要好好研究下, 写出漂亮的终端日志会很需要

...