---
title: nginx 部署及配置笔记
date: 2018-11-08 10:29:02
---

现在很多网站用的都是 nginx 作为代理服务器, 所以为了进行 web 性能的优化, 自然也要折腾一下 nginx 的配置的.
<!-- more -->

我的远程主机环境:

```bash
# linux 通用查看系统版本
lsb_release -a
# LSB Version:    :core-4.1-amd64:core-4.1-noarch
# Distributor ID: CentOS
# Description:    CentOS Linux release 7.4.1708 (Core)
# Release:        7.4.1708
# Codename:       Core
```

## nginx 的安装

参考文章: [nginx服务器详细安装过程（使用yum 和 源码包两种安装方式，并说明其区别）](https://segmentfault.com/a/1190000007116797)

安装 nginx 前要先安装 nginx 编译及运行的依赖环境

```bash
# yum -y install gcc gcc-c++ make libtool zlib zlib-devel openssl openssl-devel pcre pcre-devel
```

nginx 一般来说有两种安装方式: `yum`安装和源码包自行编译安装, 新手推荐前一种, 想折腾的话或者老手使用后一种

- `yum`安装是在线安装, 好处是简单方便, 不易出错, 但是缺点是使用的其实是别人编译好的二进制版本, 不能自定义其中加载的模块, 不过目前来 centos 官方提供的那个版本还是比较实用的

```bash
# 首先把 nginx 的源加载 yum 里面
vi /etc/yum.repo.d/nginx.repo
```

然后在文件里添加如下内容

```
[nginx]
name=nginx repo
baseurl=http://nginx.org/packages/centos/$releasever/$basearch/
gpgcheck=0
enabled=1
```

然后就可以使用`yum install nginx`安装最新版了, 也可以`yum install nginx-1.6.3`安装指定版本.安装之后可以使用`rpm -ql nginx`查看安装目录, 卸载时使用`rpm -e nginx`, 如果因为依赖包导致卸载失败，可以尝试`rpm -e --nodeps nginx`来卸载，这个命令相当于强制卸载，不考虑依赖问题。

使用这种方式安装之后 nginx 会被自动添加到系统服务里面, 也就是说可以直接使用`serivce nginx {option}`来启动或者关闭 nginx.

- 源码包编译安装, 好处是编译的时候是根据你本机的条件和环境进行编译的, 性能更好一些,同时也可以在编译的时候自定义模块

```bash
# 可以获取指定版本的 nginx, 可以使用 -P 指定下载目录
wget -c <-P> <destDir> https://nginx.org/download/nginx-1.11.6.tar.gz
# 然后解压下载的压缩包, 可以使用 -C 指定解压目录
tar -zxvf nginx-1.11.6.tar.gz <-C> <destDir>
# 然后进行解压后的目录
cd nginx-1.11.6
# 然后先进行编译配置, 直接使用 ./configure 表示使用默认配置, 也可以在后面附加参数表示一些其他的模块之类的, 请具体根据使用来配置
./configure
# 然后进行编译安装
make && make install
```

一般来说编译安装后的二进制文件都在`/usr/local/`目录下, 如果需要卸载的话直接在这里删除对应的目录就可以, 同时启动 nginx 也可以在这里使用二进制文件直接启动, 见下文 nginx 的使用.

使用源码包编译安装的好处是是可以后期为 nginx 添加各种各样的模块.

比如我在第一次安装的并没有安装 SSL 相关的模块, 后期我想开启 SSL, 这个时候就需要给 nginx 添加`ngx_http_ssl_module`模块.
注意在添加的时候为了保留之前的一些配置, 我们需要先查看之前编译的`configure`配置项, 你可以使用`./nginx -V`来查看, 我的输出如下:

```
nginx version: nginx/1.15.2
built by gcc 4.8.5 20150623 (Red Hat 4.8.5-28) (GCC)
configure arguments: --prefix=/usr/local/nginx
```

可以看到我的版本是`1.15.2`, 我之前的编译参数是`--prefix=/usr/local/nginx`, 也就是只制定了 nginx 的配置文件路径, 那么我现在需要在原来的基础上添加新的参数`--with-http_ssl_module`才能编译一个新的带有 SSL 模块的 nginx 二进制文件.

1. 找到原来的源码包, 没有的话就下载一个跟你现在用的是同一个版本的 nginx 源码包, 然后解压, 进入解压后的目录
2. 在解压后的目录执行编译前的配置`./configure --prefix=/usr/local/nginx --with-http_ssl_module`, 注意这里一定要把你原来的参数都拷贝过来, 然后在后面添加新的, 要不然编译出来的东西可能跟你原来的不兼容
3. 接下来执行`make`, **这里可千万别手快执行`make && make install`**, 如果你`insall`了那么你之前的 nginx 的配就都丢了, 所以我们这里只需要编译出一个可用的 nginx 的二进制版本, 然后手动替换掉原来的即可.
4. 新编译的 nginx 文件在 `objs/nginx`

```bash
# 将原来的`/usr/local/nginx/sbin/nginx`备份
cp /usr/local/nginx/sbin/nginx /usr/local/nginx/sbin/nginx.back
# 请先停止 nginx 服务, 然后再删除原来的 nginx 文件
rm -f /usr/local/nginx/sbin/nginx
# 把新的 nginx 文件拷贝到原来的地方
cp objs/nginx /usr/local/nginx/sbin/nginx
```

然后再正常启动 nginx 即可使得新的功能生效

## nginx 的使用

有两种方式启动 nginx, 但是后一种相对来说方便一些, 推荐使用.

- 直接在安装目录使用 nginx 的命令进行 nginx 的启动和关闭

```bash
# 启动
/usr/local/nginx/sbin/nginx
# 检查默认配置文件
/usr/nginx/sbin/nginx -t
# 检查指定配置文件
/usr/nginx/sbin/nginx -t -c {configFileDir}
# 使用指定配置文件启动 nginx
/usr/nginx/sbin/nginx -c {configFileDir}
# 关闭 stop 表示立即停止, quit 表示平滑停止, reopen 表示重新启动 reload 不中断服务重新加载配置文件
/usr/local/nginx/sbin/nginx -s {stop|quit|reload|reopen}
# 通过进程查看及关闭 nginx
ps -ef | grep nginx
# 从容停止Nginx：
kill -QUIT 主进程号
# 快速停止Nginx：
kill -TERM 主进程号
# 强制停止Nginx：
kill -9 nginx
```

- 配置 nginx 的启动和关闭到系统服务

1. 在`/etc/init.d/`目录下新建文件`nginx`, 把[这些内容](/code/nginx)拷贝到文件中
2. 赋予脚本可执行权限`chmod +x /etc/init.d/nginx`
3. 修改系统服务之后使用`systemctl daemon-reload`重新加载一下才能生效
4. 可以吧 nginx 服务配置成开机启动 `chkconfig nginx on`
5. 有如下命令可执行:

```bash
service nginx {start|stop|status|restart|condrestart|try-restart|reload|force-reload|configtest}
# 参数说明
# start 启动 nginx
# stop 停止 nginx
# status 查看 nginx 的状态
# restart 重启 nginx, 会先中断 nginx, 然后重新启动, 如果配置文件有误, 那么将无法启动 nginx
# reload 重新加载配置文件, 不会中断 nginx 服务, 如果新的配置文件有误, 那么会使用上一次正确的配置文件, 保证服务正常运行
# configtest 检查配置文件是否正确
```

## nginx 的配置

nginx 的配置相对来说是比较繁杂的, 所以我放到最下面来说, 后期持续补充.
参考文档: [nginx服务器安装及配置文件详解](https://segmentfault.com/a/1190000002797601)

### gzip压缩功能设置

gzip 相关配置可放在 http{} 或 server{} 或 location{} 层级，若不同层级有重复设置优先级为 location{} > server{} > http{}
gzip 配置参数如下

```
# 打开 gzip 压缩
gzip on;
# 进行压缩的最小文件大小, 小于这个大小的不进行压缩
gzip_min_length 1k;
# 压缩结果数据流存储所用空间，下面表示以16k为单位，按照原始数据大小以16k为单位的4倍申请内存。默认值是申请跟原始数据相同大小的内存空间去存储gzip压缩结果。
gzip_buffers    4 16k;
# 采用http协议版本 默认是1.1 ，对于1.0的请求不会压缩，如果设置成1.0，表示http1.0以上 的版本都会压缩。(如果使用了 proxy_pass 进行反向代理，那么nginx和后端的 upstream server之间默认是用 HTTP/1.0协议通信的。)
gzip_http_version 1.0;
# 压缩级别（1~9，一般为平衡文件大小和CPU使用，5是常用值，当然跟实际机器的情况有关） 级别越高, 压缩比越大, 但是 cpu 的性能消耗也越高, 同时在压缩到一定程度之后即使再进行压缩文件体积也不会再有明显的减小了. 一般取值在4~6, 这里有一组测试数据
; text/html - phpinfo():
; 0    55.38 KiB (100.00% of original size)
; 1    11.22 KiB ( 20.26% of original size)
; 2    10.89 KiB ( 19.66% of original size)
; 3    10.60 KiB ( 19.14% of original size)
; 4    10.17 KiB ( 18.36% of original size)
; 5     9.79 KiB ( 17.68% of original size)
; 6     9.62 KiB ( 17.37% of original size)
; 7     9.50 KiB ( 17.15% of original size)
; 8     9.45 KiB ( 17.06% of original size)
; 9     9.44 KiB ( 17.05% of original size)

; application/x-javascript - jQuery 1.8.3 (Uncompressed):
; 0    261.46 KiB (100.00% of original size)
; 1     95.01 KiB ( 36.34% of original size)
; 2     90.60 KiB ( 34.65% of original size)
; 3     87.16 KiB ( 33.36% of original size)
; 4     81.89 KiB ( 31.32% of original size)
; 5     79.33 KiB ( 30.34% of original size)
; 6     78.04 KiB ( 29.85% of original size)
; 7     77.85 KiB ( 29.78% of original size)
; 8     77.74 KiB ( 29.73% of original size)
; 9     77.75 KiB ( 29.74% of original size)
gzip_comp_level 5;
# 压缩文件类型（默认总是压缩 text/html类型，其中特别说明的是application/javascript和text/javascript最好都加上，若页面script标签的type不同则有可能发生部分js文件不会压缩，默认type为application/javascript） 一般来说对图片不进行压缩, 因为图片压缩比较耗时而且压缩比也很低
gzip_types application/atom+xml application/javascript application/json application/rss+xml application/vnd.ms-fontobject application/x-font-ttf application/x-web-app-manifest+json application/xhtml+xml application/xml font/opentype image/svg+xml image/x-icon text/css text/plain text/javascript text/x-component;
# 代表缓存压缩和原始版本资源，避免客户端因Accept-Encoding不支持gzip而发生错误的现象（现在一般都采用gzip） 开启此参数以后会在返回头里面看到一个 Vary 字段, 里面会有一个 Accept-Encoding 字段, 代表此资源有着多个版本, 比如 gzip 压缩版 和不压缩版, 关于 Vary 字段的解释可以查看这里: https://imququ.com/post/vary-header-in-http.html
gzip_vary on;
# 禁止IE6进行gzip压缩（当然现在已经基本没有人使用IE6了）
gzip_disable "MSIE [1-6]";
```

参考文章:[Nginx配置指北之gzip](https://segmentfault.com/a/1190000010563519)

### HTTPS 配置

如果要启用 nginx 的 SSL 配置, 那么需要 nginx 安装的时候包含了`http_ssl_module`模块, 默认 nginx 是不会安装这个模块的, 可以使用`./nginx -V`查看 nginx 安装时的配置参数里面有没有这个模块, 如果没有这个模块, 那么我们可以按照上面编译安装的步骤编译一个新的包含这个模块的 nginx 二进制文件, 然后替换掉现在的即可. 然后在 server{} 层级中加入如下配置(请根据自己情况修改)

详细配置说明可以查看[Nginx 配置 HTTPS 服务器](https://aotu.io/notes/2016/08/16/nginx-https/index.html)

```
# 网站域名
server_name example.com
# 表示监听 443 端口, 协议为 ssl
listen 443 ssl;
# 证书文件的位置
ssl_certificate     example.com.crt;
# 证书私钥文件的位置
ssl_certificate_key example.com.key;
# SSL 协议具体版本
ssl_protocols       TLSv1 TLSv1.1 TLSv1.2;
# SSL 算法
ssl_ciphers         HIGH:!aNULL:!MD5;
```

上面的配置是必须的, 另外还有一些配置依据个人情况可以添加. 另外你需要首先申请自己的网站证书才行.

例如安全协议的具体版本`ssl_protocols`和算法`ssl_ciphers`, 由于这两个命令的默认值已经好几次发生了改变，因此不建议显性定义，除非有需要额外定义的值，如定义 D-H 算法, 具体查看[Nginx 配置 HTTPS 服务器](https://aotu.io/notes/2016/08/16/nginx-https/index.html)进行配置.

### HTTP/2.0 配置

既然已经上了 HTTPS, 那么干脆一鼓作气上到 HTTP/2.0, 根据规范来说 HTTP/2.0 是不需要依赖 HTTPS 的, 但是目前的现状来说, 各个浏览器都是要求在 HTTPS 的环境中才能启用 HTTP/2.0. nginx 要启用 HTTP/2.0 需要`http_v2_module`和`http_ssl_module`这两个模块, 如果之前的编译安装时没有这两个模块, 那么就需要重新加上参数再编译一份. 这里省略我再次编译的过程(同上), 只是编译参数改为`./configure --prefix=/usr/local/nginx --with-http_ssl_module --with-http_v2_module`.

更新了 nginx 之后就要在 nginx 的配置文件里面开启 HTTP/2.0, 告诉客户端我们支持 HTTP/2.0 了. 配置很简单, 只需要在之前的`listen`字段中增加一个`http2`即可.

目前 IE11+ 以及其他主流浏览器都已经支持 HTTP/2.0, 而且就算客户端不支持结果也是正常的使用现在的 HTTP/1.1, 不会影响页面访问.

例如:

```
# 改为
listen 443 ssl http2;
```

这里有一个**小坑**, 在启用 HTTP/2.0 之前, 我们可能把80端口和443端口放在同一个 server 里面监听, 但是如果我们想要启用 HTTP/2.0, 那么就必须把80端口拿出去单独放在一个 server 里面, 监听80端口的并不能启用 HTTP/2.0, 所以如果你想要为网站同时启用 HTTP 和 HTTP/2.0, 那么你在 nginx 配置文件里面就至少需要写两个 server, 一个监听80端口, 另一个监听443端口.

关于 HTTP/2.0 的相关文章, 尤其是升级及浏览器兼容问题可以查看屈屈的博客[谈谈 HTTP/2 的协议协商机制](https://imququ.com/post/protocol-negotiation-in-http2.html).

我自己的总结如下: 在浏览器和服务端建立 TCP 连接之后, 如果是 http 协议, 那么此时就可以进行数据传输了, 如果是 https 协议, 那么就还需要建立安全的 TLS 连接, 由于 TLS 有多个版本, 也有不同的加密算法, 那么浏览器和服务器就需要进行协商, 确定一个版本和算法等信息来进行数据加密, 协商是通过`握手`来实现的, 首先客户端会发送一个`client hello`握手信息, 里面包含了客户端支持的各种协议以及算法等信息, 然后服务端收到这个信息之后会在这些支持的协议里面选出自己也支持的协议和算法, 然后确定最后要采用的协议和算法(例如 HTTP/2.0 > HTTP/1.1)通过`server hello`握手信息返给客户端, 这样双方就确定了一组对应的协议和算法进行后续的数据传输. 所以可以看到服务器在升级到了 HTTP/2.0 之后, 如果用户使用的浏览器也支持 HTTP/2.0, 那么协商之后双方就会无痛升级到 HTTP/2.0 进行通信, 享受 HTTP/2.0 带来的种种好处, 而如果用户的浏览器不支持 HTTP/2.0, 那么协商之后就会采用原来的 HTTP/1.1进行通信, 并不会影响现在的业务.

在线检测网站是否支持h3:https://http3check.net 不过目前检测结果我感觉存疑

## `rewrite`

这一部分主要记录`nginx`配置中`rewrite`的使用，背景是这样的，在这一次的折腾（20200610）中，我终于一口气买了阿里云一台5年的服务器，方便之后折腾，然后初步计划是在这台服务器上配置`nginx`作为各种服务的转发，博客的内容还是`markdown`，然后编译后生成静态的`html`等内容放到阿里云OSS上，访问的时候静态内容通过`nginx`先到CDN，然后CDN回源到OSS，另外估计还会重写整个博客的搜索，预计是在这台服务器上部署一个ES，在前面说到的编译过程中把一些用于检索的内容同步到ES中，同样也会通过`nginx`来转发搜索服务。

解决的第一个点是OSS上的文件内容都是带后缀的，比如`index.html`，访问的时候需要带上后缀名才能拿到对应的资源，比如`https://kricsleo.com/blog/index.html`(我这里已经给我的oss绑定了我自己的域名`https://kricsleo.com`，并且博客相关的内容都放在`/blog`文件夹下)，但是我想要的是用户访问的时候可以不用输入文件后缀，毕竟带着后缀访问看起来太low了，所以这里就要在`nginx`代理访问的过程中重写`uri`，需要满足以下场景：
- 直接访问`https://kricsleo.com`,重写后变成访问`https://kricsleo.com/blog/index.html`;
- 直接访问`https://kricsleo.com/xxx`,重写后变成访问`https://kricsleo.com/blog/xxx.html`;
- 直接访问`https://kricsleo.com/xxx.html`,重写后变成访问`https://kricsleo.com/blog/xxx.html`;
- 直接访问`https://kricsleo.com/xxx.css`或者其它非`html`类型资源,重写后变成访问`https://kricsleo.com/blog/xxx.css`或者其它原本的后缀形式;

这里就要用到`nginx`的`rewrite`功能了

### `rewrite`

- 执行上下文环境：`server` | `location` | `if`

`nginx`使用`ngx_http_rewrite_module`模块来提供`rewrite`相关的功能， 标准格式如下：
```
# rewrite 是指令
# regex 是 相应的用来匹配访问地址 $request_uri 的正则表达式
# replacement 是在前面的正则匹配到了之后生成新的访问地址，这里面可以像js里面的正则匹配一样引用前一个表达式的匹配结果
# 注意如果替换字符串replacement以http：//，https：//或$ scheme开头，则停止处理后续内容，并直接重定向返回给客户端。
# [flag] 用来指示 rewrite 指令匹配到了之后的进一步操作， 一共有四个选项：last | break | redirect | permanent
# last：终止处理所处的 location 中的其它 rewrite 指令，并且使用重写后的 uri 立即发起新一轮的 location 匹配
# break： 终止处理所处的 location 中的其它 rewrite 指令， 但是不会发起新一轮的 location 匹配
# redirect： 给客户端返回302，让客户端临时重定向到改写后的 uri
# permanent： 给客户端返回301， 让客户端永久重定向到改写后的 uri

# rewrite regex replacement [flag];
```

```
location / {
    rewrite ^/test1 /test2;
    rewrite ^/test2 /test3 last;  # 此处发起新一轮location匹配 uri为/test3
    rewrite ^/test3 /test4;
    proxy_pass https://google.com;
}

location = /test2 {
    return 200 "/test2";
}

location = /test3 {
    return 200 "/test3";
}
location = /test4 {
    return 200 "/test4";
}
# 发送如下请求
# curl 127.0.0.1:8080/test1
# /test3

当如果将上面的 location / 改成如下代码
location / {
    rewrite ^/test1 /test2;
    # 此处 不会 发起新一轮location匹配；当是会终止执行后续rewrite模块指令 重写后的uri为 /more/index.html
    rewrite ^/test2 /more/index.html break;
    rewrite /more/index\.html /test4; # 这条指令会被忽略

    # 因为 proxy_pass 不是rewrite模块的指令 所以它不会被 break终止
    proxy_pass https://google.com;
}
# 发送如下请求
# 浏览器输入 127.0.0.1:8080/test1
# 代理到 https://google.com/more/index.html;
```

- `rewrite` 后的请求参数
如果替换字符串replacement包含新的请求参数，则会自动在它们之后附加先前的请求参数。如果你不想要之前的参数，则在替换字符串 replacement 的末尾放置一个问号，避免附加它们。

```
# 由于最后加了个 ?，原来的请求参数将不会被追加到rewrite之后的url后面
rewrite ^/users/(.*)$ /show?user=$1? last;
```

### 指令执行过程

1. 首先顺序执行server块中的rewrite模块指令，得到rewrite后的请求URI；
2. 然后循环执行如下两步（如果没有遇到中断循环标志，此循环最多执行10次，但是我们可以使用`break`指令来中断rewrite后的新一轮的循环）
    2.1. 依据rewrite后的请求URI，匹配定义的 location 块;
    2.2. 顺序执行匹配到的 location 中的rewrite模块指令

注意`nginx`的`proxy_pass`的功能在`ngx_http_proxy_module`模块中，所以即使`ngx_http_rewrite_module`模块使用了`break`或者`return`方式想要结束执行过程，但是`proxy_pass`的功能还是会执行，不会受到这个模块的影响

### `if`

- 执行上下文环境：`server` | `location`
- 使用有如下几种方式(注意 `if` 后必须跟一个空格，就好像每行语句结尾一定要有`;`一样，另外 `nginx` 中没有 `else`)

```
# 当 $variable 是空字符串或者字符串`"0"`的时候判断结果为`false`，其余为`true`
if ($variable) {
  #...
}

# 比较 $variable 与字符串 `'demo'` 是否相等， `$variable != 'demo'`，表示判断不等
if ($variable = 'demo') {
  #...
}

# 变量（只能使用变量，不能使用字符串）与一个正则表达式进行匹配
# 模式匹配操作符一共有四种：
# ~：区分大小写的正则匹配
# ~*：不区分大小写的正则匹配
# !~: 区分大小写的正则不匹配
# !~*: 不区分大小写的正则不匹配
if ($variable ~ ^.*\.html$) {
  #...如果变量的值是以`.html`结尾则为 true
}

# 检查本地是否存在该文件，路径等
# -f：存在该文件，!-f 不存在该文件，后面可以跟变量或者字符串
# -d: 存在该路径，!-d 不存在该路径，后面可以跟变量或者字符串
# -e：检测文件、路径、或者链接文件是否存在，!-e 检测文件、路径、或者链接文件是否不存在，后面可以跟变量或者字符串
# -x: 检测文件是否为可执行文件，!-x 文件是否为不可执行文件，后面可以跟变量或者字符串
if (!-f $filename) {
  #...
}
```

### `break`

- 执行上下文环境：`server` | `location` | `if`
- 表示停止执行`ngx_http_rewrite_module`的指令集，但是其他模块指令是不受影响的

例如：
```
server {
    listen 8080;
    # 此处 break 会停止执行 server 块的 return 指令(return 指令属于rewrite模块)
    # 如果把它注释掉 则所有请求进来都返回 ok
    break;
    return 200 "ok";
    location = /testbreak {
        break;
        return 200 $request_uri;
        proxy_pass http://127.0.0.1:8080/other;
    }
    location / {
        return 200 $request_uri;
    }
}

# 发送请求如下
# curl 127.0.0.1:8080/testbreak
# /other

# 可以看到 返回 `/other` 而不是 `/testbreak`，说明 `proxy_pass` 指令还是被执行了
# 也就是说 其他模块的指令是不会被 break 中断执行的
# (proxy_pass是ngx_http_proxy_module的指令)
```

### `return`

- 执行上下文环境：`server` | `location` | `if`
- 停止处理并将指定的code码返回给客户端。 非标准code码 444 关闭连接而不发送响应报头。

```
# 返回 code 和 内容 给客户端
# return code [text];
location = /ok {
  return 200 "ok";
}

# 返回 code 和 重定向的 url
# return code URL;
location = /redirect {
  return 302 https://google.com;
}
# 直接返回重定向的 url（默认302临时重定向）
# return URL;
location = /redirect {
    return https://google.com;
}
```

### `set`

- 执行上下文环境：`server` | `location` | `if`
- 设置指定变量的值。变量的值可以包含文本，变量或者是它们的组合形式。

```
location / {
    set $var1 "host is ";
    set $var2 $host;
    set $var3 " uri is $request_uri";
    return 200 "response ok $var1$var2$var3";
}
# 发送如下请求
# curl 127.0.0.1:8080/test
# response ok host is 127.0.0.1 uri is /test
```

### `rewrite` 与 `proxy_pass`配合使用的一个大坑

在实现我上面说的静态文件代理到oss的功能时碰到了这两个指令配合起来使用的一个大坑，这是我没想到的，当`rewrite`生效以后，`proxy_pass`中的路径会被忽略掉！
举个例子：
```
location / {
  rewrite ^/(.*) /index.html break;
  proxy_pass https://kricsleo.com/blog/;
}
# 按照我原先的想法，直接访问 https://kricsleo.com 时会先经过rewrite重写然后再拼接到proxy_pass的地址后面，结果应该是 https://kricsleo.com/blog/index.html
# 但是实际上并非如此！最后结果是 https://kricsleo.com/index.html，proxy_pass中的路径 /blog 会被忽略掉，
# 所以要想达到目的需要把路径 /blog 加到rewrite的结果里面去，才能路径才不会丢失，如下所示，最开始查资料的时候没看到任何一个资料提到这一点，但是反反复复排查为什么会产生404（因为最后的 uri 地址其实是丢失路径的，所以一直404）的过程中，偶然看到一句 「proxy_pass路径无效」然后往这个方向排查了一下才发现问题，难顶。。。
location / {
  rewrite ^/(.*) /blog/index.html break;
  proxy_pass https://kricsleo.com;
}

这里附上我最后使用的满足前面提出的四个场景的配置语句
location / {
  # 把通用路径放到变量里面，后面直接引用
  set $prefix '/blog';

  # 如果是直接访问域名的方式，https://kricsleo.com, 则重写 uri 为 https://kricsleo.com/blog/index.html,
  if ( $request_uri ~ ^/$ ) {
      rewrite ^/(.*) $prefix/index.html break;
  }

  # 如果访问路径没有带后缀， 则自动拼接上 .html 后缀（如果已经带后缀，例如 .css 等则此处不作处理）
  if ( $request_uri !~* ^/(.*)\.(.*)$ ) {
    rewrite ^/(.*) $prefix/$1.html break;
  }

  # 不属于上面两种情况的统一就直接重写拼接我的 oss 路径 /blog 即可
  rewrite ^/(.*) $prefix/$1 break;

  # rewrite 结束后统一使用 proxy_pass 代理的真实 oss 服务
  proxy_pass https://kricsleo.com;
}
```

## 配置复用

有一些配置我们可能在多个地方重复出现, 比如多个server有相同的gzip压缩配置等, 我们可以单独建立一个没有后缀的文件, 例如`etc/nginx/conf/common`, 把相同的配置直接写到这个文件中,然后在需要使用的地方直接写上`include etc/nginx/conf/common`, 里面的内容就都引入到这里了
