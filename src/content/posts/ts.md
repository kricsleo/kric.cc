---
title: ts 笔记
date: 2021-6-20 14:12
---

对于初学者可以参考这篇[typescript入门](/typescript-guide)

以下内容为部分不易理解的地方，特意记录

## 部分"神奇参数"

- [x] esModuleInterop: boolean

  [esModuleInterop 到底做了什么？](https://zhuanlan.zhihu.com/p/148081795)

  简单来说是由于CommonJS和ES module对于默认导出导入的逻辑不一致, 所以在使用ts把ES module模块代码编译成CommonJS模块代码时需要进行的一个特殊处理, 这个参数影响的是ts对于`import`的转译规则(`export`不受影响)

  babel 默认的转译规则和 TS 开启 esModuleInterop 的情况差不多, 所以如果旧代码是使用babel打包的, 那么大概率你在切换到ts打包后需要手动开启这个参数

  对于默认如下导入

  ```ts
  // 注意 React 的声明文件本身没有默认导出, 都是 exports.Children = Children 这样的导出方式
  // 在js中我们可以直接使用下面的默认导出, 会把所有属性都挂载到这个对象上
  // 但是在ts中没有默认导出的时候, 我们应该使用 import * as React from 'react' 的方法来达到js中同样的效果
  // 这里在ts仍然使用js的导入方法只是为了演示会导致什么样的结果, 以及开启 esModuleInterop 参数后就可以"修复"这种行为
  import React from 'react';
  console.log(React);

  // 转译后
  // esModuleInterop: fasle (默认值)
  "use strict";
  exports.__esModule = true;
  var react_1 = require("react");
  // 这里实际会打印出 undefined , 因为 React 没有默认导出(default)
  console.log(react_1["default"]);

  // esModuleInterop: true
  // (代码经过简化, 主要是使用默认导出的地方会包上一层 __importDefault 处理 default 属性的调用)
  var __importDefault = function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
   var react = __importDefault(require('react'));
  // 这里可以正常打印结果, 因为 __importDefault 手动把所有属性挂载到了 default 上达到了babel一样的效果
   console.log(react['default']);
  ```

- [x] moduleResolution: 'node' | 'classic'

  表示模块解析策略, 如果module配置是 commonjs 那么默认采用 node 解析策略, 如果module是其他值(`amd`, `system`, `umd`, `es2015`, `esnext`, etc.), 那么默认采用 classic, 使用 node 解析策略的较多, 因为用webpack 打包的时候是基于node模式, 所以 ts 配置为node更符合我们日常的认知和做法, 采取的两种解析模式的差别如下

  ```
  // 在源文件/root/src/A中导入一个模块, 两种解析方式查找文件方式不同
  import { b } from "./moduleB"

  // classic模块解析方式
  1. /root/src/moduleB.ts
  2. /root/src/moduleB.d.ts

  // node模块解析方式
  1. /root/src/moduleB.ts
  2. /root/src/moduleB.tsx
  3. /root/src/moduleB.d.ts
  4. /root/src/moduleB/package.json (if it specifies a "types" property)
  5. /root/src/moduleB/index.ts
  6. /root/src/moduleB/index.tsx
  7. /root/src/moduleB/index.d.ts
  ```

### `asserts`

使用`asserts`类型断言来确保类型安全: [Assertion Functions](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions)

```ts
function assert(condition: any): asserts condition {
  if(!condition) {
    throw new Error(`Not satisfied.`)
  }
}

function run(obj: { name?: string }) {
  obj.name.toLowerCase() // Error! TS hint: name might be undefined.
  assert(obj.name)
  obj.name.toLowerCase() // Correct! No more complaints.
}
```

### Vue Types

- [ ] 实现和了解Vue中的类型推断