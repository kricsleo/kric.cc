---
title: nodejs 事件循环阻断
date: 2023-10-27 11:10:00
---

最近刷[snyk这家公司的的技术博客](https://snyk.io/blog/)时发现了一篇有意思的文章:

- [How even quick Node.js async functions can block the Event-Loop](https://snyk.io/blog/nodejs-how-even-quick-async-functions-can-block-the-event-loop-starve-io/)

顺便一提, 里面总共1200多篇博客已经挑选我感兴趣的全部看过了😀, 我对这种技术博客还是挺感兴趣的, 也推荐另外一个已经都刷完的博客站点

- stackblitz的技术博客站点: [https://blog.stackblitz.com/](https://blog.stackblitz.com/)

stackblitz 就是那个做出在浏览器内运行nodejs环境的公司, 日常我们会在上面进行各种前端项目的demo即时开发

回到正题, [How even quick Node.js async functions can block the Event-Loop](https://snyk.io/blog/nodejs-how-even-quick-async-functions-can-block-the-event-loop-starve-io/)这篇博客的时间比较久远了(2019年2月份), 演示使用的还是`nodejs 10`, 但是提到的关于nodejs的事件循环机制还是比较有意思的.

原文内容已经很详细, 建议完整阅读, 我按照原文步骤在我自己的Mac上进行了实验, 结果略有不同, 这可能跟测试设备有关系

> Examples below use Node 10.9.0 on an Ubuntu 18.04 VM with 4 cores, running on a MacBook Pro 2017

我是在MacBook Pro M1 (10核)上直接运行的, 在`setImmediate`一项上的测试结果与原文不太一致, CPU利用率最高只到20%, 没有像原文那样达到100%

## 测试结果

- `sync`同步
  - **blocked**: 事件循环被阻断, 时长 8.119s
  - CPU: 100%, 繁忙

- 仅添加`await`异步方式
  - **blocked**: 事件循环被阻断, 时长 8.544s
  - CPU: 100%, 繁忙

- `setTimeout`异步方式
  - **unblocked**: 事件循环未被阻断, 时长 Infinite (因为时间太长了所以我把计算次数缩小了两个量级以后才能在有限时间 121.408s 内运行完毕)
  - CPU: 3.6%, 闲置

- `setImmediate`异步方式
  - **unblocked**: 事件循环未被阻断, 时长 131.132s
  - CPU: 20%, 中等繁忙(在原文中这一项的测试数据是100%)

## 结论

虽然`setImmediate`的测试数据与原文有出入, 但是不影响最终结论

- 仅使用`await`来标记异步而不实际进行任何的异步操作是无法达到让出主线程的目的, 事件循环仍会被阻断, 结果与同步方式一致
- `setTimeout`虽然可以让出主线程, 但是却无法充分利用CPU (让出的时间太久, 导致CPU几乎处于闲置状态)
- `setImmediate`不仅可以让出主线程, 不阻断事件循环, 还可以尽可能的利用CPU, 减少CPU闲置

在适当利用异步来让出线程的方法上 **`setImmediate` wins! 🎉**