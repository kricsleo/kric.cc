---
title: package.json 字段笔记
date: 2023-04-02 22:04
---

package.json 中经常会扩展一些影响某些特定行为的字段，本笔记记录日常开发过程中的部分字段释义

- [ ] 字段顺序推荐（强迫症必备）

## [`type`](https://nodejs.org/api/packages.html#type)

> Added in: v12.0.0
> 
> The "type" field defines the module format that Node.js uses for all .js files that have that package.json file as their nearest parent.

nodejs 从 `v12.0.0`开始支持了 [ES modules](https://nodejs.org/api/esm.html#modules-ecmascript-modules), 该字段决定 nodejs 是使用 node 传统的 [CommonJS](https://nodejs.org/api/modules.html#modules-commonjs-modules) 还是 ES6 规范的 [ES modules](https://nodejs.org/api/esm.html#modules-ecmascript-modules) 模块方式来处理 js 文件

- `commonjs`（默认值）： CommonJS 方式 - 使用 `require` / `module.exports` 引入和导出模块
- `module`：ES modules 方式 - 使用 `import` / `export` 引入和导出模块

另外无论该字段设置为何值，`.mjs` 都会以 CommonJS 方式处理，`.cjs` 都会以 ES modules 方式处理

参考：
- [Ship ESM & CJS in one Package](https://antfu.me/posts/publish-esm-and-cjs) - by `anyfu`

## [`exports`](https://nodejs.org/api/packages.html#conditional-exports) & [`typesVersions`](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html#version-selection-with-typesversions)

nodejs 除了最基本的指定`main`来声明包的入口文件外, 还支持`exports`来指定子文件路径的方式声明多个子入口

同样 typescript 除了最基本的指定`types`来声明包的入口类型文件外, 还支持`typesVersions`来指定(或者重定向)子入口文件的类型文件

需要注意的是由于兼容性的原因, 虽然 nodejs 在 `v12.16.0`开始支持 `exports`, `exports` 中允许通过 `types` 来指定子文件的类型文件位置, [但是 typescript 在 `v4.7` 才支持了这种形式的 `types`](https://stackoverflow.com/questions/58990498/package-json-exports-field-not-working-with-typescript), 同时还要求 `tsconfig.json` 中的 `moduleResolution` 必须是 `node16` 或者 `nodenext`. 对于低于该版本的 typescript 或者 `moduleResolution` 非指定值的需要另外通过 `typesVersions` 字段另外指定子文件的类型文件位置才可以生效. 

所以稳妥的做法是同时指定`exports`和`typesVersions`.

- [types-for-sub-modules](https://antfu.me/posts/types-for-sub-modules) - by `antfu`

## [packageManager](https://nodejs.org/api/packages.html#packagemanager)

这个字段是因为`nodejs`在`v14.19.0`开始内建提供了[`corepack`](https://nodejs.org/api/corepack.html)工具(默认未启用, 可使用`corepack enable`开启), 目的是无感支持多种包管理工具(包括社区的`yarn`和`pnpm`), 启用`corepack`之后无论使用`npm`, `yarn`还是`pnpm`都会根据`package.json`中的`packageManager`来自动安装及使用声明的包管理工具及对应版本, 这有两个好处:

1. 降低了不同包管理工具之间的切换及教学成本. 无需疑问这个项目我应该使用`npm`还是`pnpm`命令等, `corepack`会自动的代理命令调用到声明的版本
2. 避免了同一个包管理工具不同版本间的兼容性问题. 没有`packageManager`时我们通常会使用自己本机安装的全局的包管理器版本, 但是在开发多个项目时, 不同项目所依赖的包管理器版本也许是不一样的, 要么是随时切换全局包管理器版本, 要么就可能会使用到不兼容的全局包管理器版本

我目前一般使用[`ni`](https://github.com/antfu/ni)工具来管理依赖, 它与`corepack`很类似, 通过自动探测`packageManager`(第一优先级)以及`lockfile`(例如`package-lock.json`或者`pnpm-lock.yaml`)(第二优先级)来确定当前项目应该使用哪个包管理器. 也许等`corepack`进一步完善之后可以取代这种工具.

