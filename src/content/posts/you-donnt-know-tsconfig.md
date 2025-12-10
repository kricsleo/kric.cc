本文记录描述 `tsconfig.json` 中一些「反直觉」的表现

### `skipLibCheck`

功能：是否跳过**所有** `.d.ts` 文件的类型检查 

开启它会跳过所有 `.d.ts` 文件的类型检查（通常会开启，检查速度快）

- 既包括项目源码中 `.d.ts` 文件，例如我们经常自定义的 `src/env.d.ts`
- 也包括所有非源码的 `.d.ts` 文件，例如最常见的 `node_modules/` 中三方库的 `.d.ts` 文件

#### Q&A

- 是否可以跳过一部分 `.d.ts` 文件（例如 `node_modules/` 中），而保持检查其它 `.d.ts` 文件（例如 `src/` 中的）?

**不能**，要么全检查，要么全不检查

在 Github TypeScript 仓库中有关于这个行为的很多讨论，这里摘录部分作为参考：

- https://github.com/microsoft/TypeScript/issues/47387#issuecomment-1010123047
- https://github.com/microsoft/TypeScript/issues/44205#issuecomment-849895090
- https://github.com/microsoft/TypeScript/issues/30511

### `include`

功能：指定类型检查的**入口**文件

指定 TS 从哪些文件开始类型检查，**而不是限定只有这些文件参与类型检查**

你可以类比为 rollup 等打包工具的 `entry` 配置，从一个（或多个文件）开始打包，
期间自动遍历所有被 `import` 的文件并把它们包含在打包结果中

TS 类型检查也是如此，从 `include` 指定的文件开始进行类型检查，
**期间自动遍历所有被 `import` 的文件并对它们也进行类型检查**

所以常见的误解是认为配置 `include: ["src/a"]` 就只会检查 `src/a` 下的文件，而不检查 `src/b` 下的文件
但实际是只要 `src/a` 中 `import` 了 `src/b` 中的文件，即使不在 `include` 中，也会检查 `src/b` 中被 import 的文件

只在一种情况可以不检查 `src/b`，那就是 `src/a` 里面完全没有引用到 `src/b` 的内容

（你可能想配置 `exclude: ["src/b"]` 来跳过？对不起，不行，下一节会提到）

### `exclude`

功能：指定从 `include` 中剔除部分**入口**文件

还是以打包工具类比，有些时候 `include` 指定的入口太多，希望反向通过 `exclude` 排查掉其中一部分入口文件
例如指定 `include: ["src"], exclude: ["src/b"]` 意思是除了 `src/` 目录下除了 `src/b` 以外的部分都作为类型检查的入口

但还是那个问题，检查过程中的自动遍历是无法被 `exclude` 控制和跳过的
只要 `src` 中 `import` 了 `src/b` 中的文件，即使 `src/b` 在 `exclude` 中，也会检查 `src/b` 中被 import 的文件

所以通常看到的在一些大仓项目中想用 `exclude` 来希望跳过部分文件夹（或者依赖的源码包）的类型检查是完全无效的

（另外一个小点是 `exclude` 不需要配置 `node_modules`，ts 内部始终会 `exclude` 该文件夹）

### `references`

功能：类似 `include` 指定类型检查的**入口**文件（文件夹）

但和 `include` 关键不同点是被指定的文件**不使用**当前 `tsconfig.json` 的配置，
而是保持使用被 `references` 的文件夹内原本的 `tsconfig.json` 配置

在以下两种情况会使用该字段，而不用 `include`：

1. 项目代码有多个运行环境

例如一部分代码（`src/`）会运行在浏览器中，另一部分代码（`tests/`）会运行在 Node.js 中
此时正确的做法是创建两个 `tsconfig.json`，一个用来限制 `src/` 代码的类型，例如可访问全局 `DOM` 对象，但不可访问 Node.js 的 API
另一个用来限制 `tests/` 代码的类型，例如可访问 Node.js 的 API，但不能访问全局 `DOM` 对象

**严谨的做法是有多少种运行环境，就需要创建多少个 `tsconfig.json` 文件**

```jsonc
// tsconfig.web.json
{ 
  // ...
  "include": ["src"]
}

// tsconfig.test.json
{ 
  // ...
  "include": ["tests"]
}

// tsconfig.json
{ 
  "references": ["tsconfig.web.json", "tsconfig.test.json"],
  "files": []
}
```

2. 代码中引用了不同 `tsconfig.json` 的另一项目文件（例如 `monorepo` 中常见）

`monorepo` 中常用源码引用的方式来使用同一仓库不同目录下的包，例如 `apps/a` 引用了 `packages/b` 中的**源码**（即会直接 `import` `packages/b` 的 `.ts` 文件）
如果 `apps/a` 的 `tsconfig.json` 规则要比 `packages/b` 的 `tsconfig.json` 规则更严格
那么按照前面提到的在对 `apps/a` 类型检查过程中**一定**会去检查 `packages/b` 的类型，又因为 `packages/b` 的类型没有 `apps/a` 严格，如果检查出 `packages/b` 的 ts 错误，那么整个类型检查过程就会失败

这种情况同样发生在如果一个 npm 包直接发布的是 `.ts` 源码，那么即使这个包是安装在 `node_modules` 中的，也遵循前面提到的 `import` 规则，只要被引用就会被强制检查，如果这个 npm 包类型检查不通过，那么项目的整个类型检查就同样会失败

所以目前来说还是发布编译后的 `.js` 和 `.d.ts` 文件到 npm 是稳定的做法，因为 `.d.ts` 文件即使有错误，也可以被 `skipLibCheck` 给全量跳过，不影响宿主项目类型检查结果

回到 `monorepo` 的场景，在不修改 `packages/b` 的 `tsconfig.json` 规则的前提下怎么处理这个问题？
答：使用 `references` 引用 `packages/b` 的 `tsconfig.json` 文件即可

此时 `references` 的作用是告诉 ts 编译器：在检查 `apps/a` 的类型过程中，如果检查到了 `packages/b` 的文件，
那么对 `packages/b` 的文件继续保持使用 `packages/b` 定义的 `tsconfig.json` 配置进行检查，而不是使用 `apps/a` 的 `tsconfig.json`

### 当前实践

我不确定这是不是「最佳实践」，至少我目前（2025-12）推荐这样做

```
pnpm i @total-typescript/tsconfig @total-typescript/ts-reset -D
```

如果代码运行在浏览器环境中，那么拷贝以下配置：

```json
{
  "extends": "@total-typescript/tsconfig/bundler/dom.json",
  "compilerOptions": {
    "types": ["@total-typescript/ts-reset"],
  }
}
```

如果代码不运行在浏览器环境中，那么拷贝以下配置：

```json
{
  "extends": "@total-typescript/tsconfig/bundler/no-dom.json",
  "compilerOptions": {
    "types": ["@total-typescript/ts-reset"],
  }
}
```

TS 相关内容可以关注 [Matt Pocock](https://www.totaltypescript.com/articles) 这个「TS 专家」，他研究 TS 多年，有不少实践中的例子来讲解 TS 的一些行为和配置，所依赖的 `@total-typescript` 工具也是他的经验所得

### 参考文章

以下文章建议**逐字阅读**：

- [The TSConfig Cheat Sheet](https://www.totaltypescript.com/tsconfig-cheat-sheet)
- [One Thing Nobody Explained To You About TypeScript](https://kettanaito.com/blog/one-thing-nobody-explained-to-you-about-typescript)
- [TSConfig Grimoire](https://github.com/bluwy/tsconfig-grimoire)