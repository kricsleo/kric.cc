---
title: build your vue template
date: 2021-12-27 20:40:01
draft: true
---

# 建立和使用你自己的 vue 模板

vue 提供的 vue cli 不仅可以按照默认的 vue 模板来初始化一个新项目, 也可以通过指定一个模板来初始化新项目

- TODO: complete this note.

## 使用

1. 安装 vue cli, 参考[官网教程](https://cli.vuejs.org/zh/)

```bash
npm install -g @vue/cli
# OR
# yarn global add @vue/cli
```

2. 建立自己的模板

- 或者参考这篇笔记[自定义一套Vue-Cli项目](https://notes.jindll.com/web/%E5%A6%82%E4%BD%95%E8%87%AA%E5%AE%9A%E4%B9%89%E4%B8%80%E5%A5%97Vue-Cli%E9%A1%B9%E7%9B%AE%E6%A8%A1%E7%89%88.html#%E5%89%8D%E8%A8%80)

3. 指定 vue 模板来初始化项目

```bash
# vue create --preset [username/repo] [project-name]
vue create --preset kricsleo/template-vue vue
```
