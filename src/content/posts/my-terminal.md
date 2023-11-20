---
title: 我使用的终端工具
date: 2023-10-13 17:10:10
---

我一直有些不满于VS Code中启动terminal的缓慢, 大概1.5s左右(也许你觉得这个速度还可以接受, 但我是几乎绝对的速度主义), 对比起没有安转插件的原生bash几乎可以瞬间启动, 我一直想找时间好好优化一下我的终端配置, 速度永远是我的最爱🚀

- Updated At: 2023-11-20 19:11 最近在尝试[fish](https://fishshell.com/), 一个据说更加友好和现代化的命令行工具, 自带了很多 zsh 需要安装插件才能使用的功能, 如代码高亮, 自动补全等, 等用一段时间再回头来补一下感受.

## 旧的配置: `oh-my-zsh` + `iTerm2`

我之前一直使用的是这套社区推荐很广泛的搭配, 这套的社区生态很好, 也支持非常高度的定制化(虽然`iTerm2`没有沉浸模式, 指无窗口标题栏 & 无关闭按钮的那种, 但是我也忍了很久)

至于`oh-my-zsh`的插件,我常用的有这几个:

- [`autojump`](https://github.com/wting/autojump) - 提供智能跳转目录功能, 这节省了我很多时间(**Life Saver!**), 对于访问过的目录来说可以很方便的再次跳转过去

- [`zsh-autosuggestions`](https://github.com/zsh-users/zsh-autosuggestions) - 提供命令自动补全功能

- [`zsh-syntax-highlighting`](https://github.com/zsh-users/zsh-syntax-highlighting) - 提供终端颜色高亮

- [`git`](https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/git) - 提供git相关的快捷操作和一些常用命令的缩写别名

- [`NVM`](https://github.com/nvm-sh/nvm) - 对于前端来说不可或缺的nodejs版本管理工具 (但同时也是很大程度的"万恶之源". 因为后面在通过启动耗时分析哪个插件最慢的时候, 它站了出来, 有一半的时间都花在`NVM`的初始化上.)

## 新的配置: `zsh` + `starship` + `alacritty`

### `zsh` or `bash`

`zsh`是基于`bash`构建的, 支持更丰富的配置, 速度也稍微快一些(据说), 所以我仍继续使用`zsh`, 但是要替换其上层的一些插件和工具

`mac`自带`zsh`, 所以无需任何安装步骤

### `oh-my-zsh` -> `starship`

虽然`oh-my-zsh`有着很好的社区生态和丰富的配置, 但是我找到了更适合我的替代品 - [starship](https://starship.rs/). 

`starship`是使用`Rust`编写的(`Rust`在速度上再得一分🎉)的可适用于几乎所有的`shell`的`prompt`, 在功能和支持的配置上虽然不然`oh-my-zsh`丰富, 但是已有的功能如`prompt`定制已经完全满足我的需求, 加上速度上的优势, 那当然是选择`starship`了

#### 安装`starship`

1. 按照官网[Installation](https://starship.rs/guide/#%F0%9F%9A%80-installation)章节安装

```bash
curl -sS https://starship.rs/install.sh | sh
```

2. 然后需要在`zsh`的配置文件`~/.zshrc`中添加如下配置才能启用它

```bash
# in ~/.zshrc

eval "$(starship init zsh)"
```

3. `starship`有一些内置的[主题预设](https://starship.rs/presets/#presets)你可以直接使用, 当然也可以自行配置. 以下我自己的主题, 你可以拷贝到`starship`的配置文件`~/.config/starship.toml`中便会直接生效(或者重启终端)

```toml
# in ~/.config/starship.toml

format = """
[](blue)\
$directory\
[\u0020](bg:blue)\
[](fg:blue bg:red)\
$git_branch\ 
[](red)\
\u0020\
"""

[directory]
style = "bg:blue"
format = "[$path]($style)"
truncation_length = 0

[git_branch]
symbol = "\uf418"
style = "bg:red"
format = '[ $symbol $branch ]($style)'
```

### `iTerm2` -> `alacritty`

虽然`iTerm2`支持非常丰富的自定义, 但是没有沉浸式窗口这一点我前面已经抱怨过了, 而[`alacritty`](https://github.com/alacritty/alacritty)是支持的, 然后也同样支持自定义主题. 另外很重要的一点是它也是`Rust`编写的(`Rust` win!🎉), 在启动速度上快的非常明显, 那当然是选择`alacritty`了

### 安装`alacritty`

可以在Github的[Releases](https://github.com/alacritty/alacritty/releases)下载安装包进行安装

然后可以在它的[配置文件](https://github.com/alacritty/alacritty#configuration)(`~/.config/alacritty/alacritty.yml`)中自定义配置主题等内容

(如果想查阅更完整详细的配置可以参考它的[release](https://github.com/alacritty/alacritty/releases)中的`alacritty.yml`文件来了解有哪些配置可用)

```yaml
# in ~/.config/alacritty/alacritty.yml

live_config_reload: true

window:
  padding:
    x: 10
    y: 15
  # decorations: full | none | transparent | buttonless
  decorations: buttonless

font:
  normal:
    family: "Iosevka Nerd Font Mono"
  size: 16

# Colors (Palette from `unocss`)
colors:
  # Primary colors
  primary:
    background: '0x22272d'
    foreground: '0xdee2e6'

  # Normal colors
  normal:
    black: '0x222222'
    red: '0xf87171'
    green: '0x4ade80'
    yellow: '0xfacc15'
    blue: '0x60a5fa'
    magenta: '0xe879f9'
    cyan: '0x22d3ee'
    white: '0xf1f3f5'
```

## `zsh`插件安装

因为之前是使用`oh-my-zsh`来管理的插件, 所以当我直接使用`zsh`后原先的插件都需要改用"手动安装"这种方式, here we go!

#### `autojump`

1. 按照插件文档[INSTALLATION](https://github.com/wting/autojump#installation)安装, (在mac上可使用`brew`安装)

```bash
brew install autojump
```

2. 安装完成后**注意输出的日志** (这的确容易忽略, 然后不知道下一步该如何, 但是官方似乎不打算修改这种引导方式)

```
...
Add the following line to your ~/.bash_profile or ~/.zshrc file:
  [ -f /usr/local/etc/profile.d/autojump.sh ] && . /usr/local/etc/profile.d/autojump.sh

If you use the Fish shell then add the following line to your ~/.config/fish/config.fish:
  [ -f /usr/local/share/autojump/autojump.fish ]; and source /usr/local/share/autojump/autojump.fish

Restart your terminal for the settings to take effect.
...
```

按照日志提示拷贝`[ -f /usr/local/etc/profile.d/autojump.sh ] && . /usr/local/etc/profile.d/autojump.sh`到`~/.zshrc`中就完成了插件的安装和配置

```bash
# in ~/.zshrc

[ -f /usr/local/etc/profile.d/autojump.sh ] && . /usr/local/etc/profile.d/autojump.sh
```

#### `zsh-autosuggestions`

1. 按照插件文档[INSTALL - Manual (Git Clone)](https://github.com/zsh-users/zsh-autosuggestions/blob/master/INSTALL.md#manual-git-clone)安装

```bash
git clone https://github.com/zsh-users/zsh-autosuggestions ~/.zsh/zsh-autosuggestions
```

2. 打开`~/.zshrc`文件添加配置后就完成了插件的安装和配置

```bash
# in ~/.zshrc

source ~/.zsh/zsh-autosuggestions/zsh-autosuggestions.zsh
```

#### `git`

由于我日常使用的`git`快捷操作命令就那几条, 所以我不打算再像原来那样安装插件那么麻烦, 而是直接从[插件源码](https://github.com/ohmyzsh/ohmyzsh/blob/master/plugins/git/git.plugin.zsh#L165-L186)里面拷贝出我常用的几条命令作为别名(`alias`)就够用了, 例如:

```bash
# in ~/.zshrc

alias gcam='git commit --all --message'
alias gco='git checkout'
alias gcb='git checkout -b'
alias gm='git merge'
alias gl='git pull'
alias gp='git push'
```

#### `NVM`

上面说过nodejs官方的`NVM`对于终端启动速度的影响, 所以这次我使用了社区的懒加载版本[`zsh-nvm`](https://github.com/lukechilds/zsh-nvm)来代替它.

 `zsh-nvm`可以懒加载`NVM`, 在实际使用到该命令的时候再初始化`NVM`, 当然你需要配置一下才能启用懒加载

1. 按照插件文档[Installation - Manually](https://github.com/lukechilds/zsh-nvm#manually)安装

```bash
git clone https://github.com/lukechilds/zsh-nvm.git ~/.zsh-nvm
```

2. 打开`~/.zshrc`文件添加配置后就完成了插件的安装和配置

```bash
# in ~/.zshrc

# Load NVM lazily(works with zsh-nvm)
export NVM_LAZY_LOAD=true
# Disable NVM auto completion(works with zsh-nvm)
export NVM_COMPLETION=false

source ~/.zsh-nvm/zsh-nvm.plugin.zsh
```

### `~/.zshrc`最终配置

```bash
# in ~/.zshrc

# ENV
# Load NVM lazily(works with zsh-nvm)
export NVM_LAZY_LOAD=true
# Disable NVM auto completion(works with zsh-nvm)
export NVM_COMPLETION=false

# alias
# npm scripts
alias nio="ni --prefer-offline"
alias d="nr dev"
alias s="nr start"
alias b="nr build"
# git
alias gcam='git commit --all --message'
alias gco='git checkout'
alias gcb='git checkout -b'
alias gm='git merge'
alias gl='git pull'
alias gp='git push'
# cd to workspace
alias w="j workspace"
# open sourcetree
alias st="open -a SourceTree ."
# clean screen
alias c="clear && printf '\e[3J'"

# PLUGIN
# provide auto completion
source ~/.zsh/zsh-autosuggestions/zsh-autosuggestions.zsh
# lazy load nvm
source ~/.zsh-nvm/zsh-nvm.plugin.zsh
# syntax highlighting
source ~/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
# autojump
[ -f /usr/local/etc/profile.d/autojump.sh ] && . /usr/local/etc/profile.d/autojump.sh

# starup starship
eval "$(starship init zsh)"
```

## 总结

舒服多了, 现在的启动速度已经很接近原生`bash`, 感官上延迟大约在`100ms`内, 这次的搭配应该可以再顶一段时间到下次再折腾配置

我对`Rust`还挺有好感的, 之前也学习过一段时间的`Rust`并用它写了个静态博客站点编译工具, 在速度上的优势深得我心, 每当看到使用`Rust`构建的工具总会第一印象心生好感 ✨

顺便提一句最近看到的Vite Conf上介绍之后会使用基于`Rust`构建的新编译打包工具[`Rolldown`](https://www.youtube.com/watch?v=hrdwQHoAp0M), 会用来解决Vite长期存在的一些打包问题, 我还是挺期待的.