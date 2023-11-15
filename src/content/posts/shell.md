---
title: shell 笔记
date: 2021-12-20 14:12
---

感觉最近又要学 shell 了, 知识体系总是串联起来，当我想要学习一个东西时总是会经常不得不一起学习其他东西

## 以下是笔记

示例：
```bash
# 这一行指定脚本解释器， 表示用什么来执行这个文件，这里使用 /bin/sh 来执行
# 如果直接运行这个文件，例如 「./shell.sh」 那么系统就会使用这里指定的脚本解释器来执行这个文件，
# 如果直接通过解释器来运行这个文件，例如 「/bin/sh ./shell.sh」那么这里的指定就是没有意义可以省略的了
#!/bin/sh
cd ~
mkdir shell_tut
cd shell_tut

for ((i=0; i<10; i++)); do
	touch test_$i.txt
done
```

`mkdir`和`touch`是系统自带的程序，一般在/bin或者/usr/bin目录下
`for`, `do`, `done`是`sh`脚本语言的关键字

脚本解释器除了上面使用的`sh`外还有别的，例如`bash`,`zsh`等
`sh`: 即Bourne shell，POSIX（Portable Operating System Interface）标准的shell解释器，它的二进制文件路径通常是/bin/sh，由Bell Labs开发。
`bash`: Bash是Bourne shell的替代品，属GNU Project，二进制文件路径通常是/bin/bash。业界通常混用bash、sh、和shell
在CentOS里，/bin/sh是一个指向/bin/bash的符号链接,但在Mac OS上不是，/bin/sh和/bin/bash是两个不同的文件

- 变量
```bash
# 定义变量时，变量名不加美元符号（$），同时等号前后不能有空格
# 字符串可以使用单引号也可以使用使用双引号
# 单引号中不能使用变量，也不能再出现单引号，即使转义单引号也不行，内容会原原本本的输出
# 双引号可以使用变量，也可以出出现转义字符
your_name="kricsleo"

# 除了显式地直接赋值，还可以用语句给变量赋值
for file in `ls /etc`

# 使用变量，虽然变量名可以不使用{}包裹，但是在某些边界情况下可能会解析错误，所以良好的习惯是一直使用花括号包裹
echo "your name is ${your_name}"

# 变量重新赋值时不需要使用$符号，直接赋值即可
your_name="yelo"
```

- 字符串操作
```bash
# 拼接字符串
your_name="kricsleo"
greeting="hello, "$your_name" !"
greeting_1="hello, ${your_name} !"

echo $greeting $greeting_1

# 获取字符串长度：
echo ${#your_name} # 输出：8

# 提取子字符串
echo ${your_name:1:4} # 输出：rics
```

## 参考
- [Shell脚本编程30分钟入门](https://github.com/qinjx/30min_guides/blob/master/shell.md)
