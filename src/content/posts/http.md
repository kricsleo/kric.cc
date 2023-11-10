---
title: http 笔记
date: 2018-10-12 10:29:30
---

# http

http虽然内容简单, 容易理解, 但是内容十分庞大, 涉及到现在通信的方方面面, 我打算花点时间陆陆续续的把我接触到的http的相关部分整理出来, 这里作为一个入口页, 后续持续补充.

## method

- `OPTIONS`

`OPTIONS`请求是浏览器在满足一定条件的时候自动发送的请求, 一般来说开发者很少手动去使用这个, 作用是在发送真正的请求之前使用这个「预检」请求去先查询服务端支持的请求方式，确认接下来要发送的请求是否是服务器支持的。

满足什么条件才会发送这个请求?
1. `CORS`(请求跨域), 即请求的协议-域名-端口这三者有任何一个和当前所处的页面不一致时就是`CORS`
2. 请求的类型不是「简单请求」，「简单请求」即同时满足下面两个条件的请求
  1.1. 请求方法是`HEAD`, `GET`或者`POST`其中之一
  1.2. `Requese-Header`不能出现以下5个以外的字段:`Accept`, `Accept-Language`, `Content-Language`, `Last-Event-ID`和`Content-Type`(`Content-Type`只能使用`application/x-www-form-urlencoded`, `multipart/form-data`和`text/plain`其中之一, 现在常用的`application/json`不在可选里面)

以上两个条件任何一个不满足, 浏览器就会在正式请求前先发送一个`OPTIONS`请求, 同时浏览器也有一个缓存机制, 通过识别响应头的`Access-Control-Max-Age`字段(单位是s)来缓存本次「预检」的结果, 在到期前不会再发送`OPTIONS`请求, 可以一定程度节约网络请求.如果服务端不支持这个`OPTIONS`请求(可能是请求方法或者域名之类的不满足要求), 那么「预检」失败, `XMLHttpRequest`会抛出错误`onerror`

示例:
![](/img/20220114175608.png)

`CORS`的请求相对于同域的请求来说有一些特别的字段

请求头中会多出如下跨域字段, 例如:

- `Access-Control-Request-Method`: 表示请求可能用到的的方式, 例如`PUT`

- `Access-Control-Request-Headers`: 表示请求所携带的自定义首部字段

响应头中都会多出一些跨域特有的字段, 例如

- `Access-Control-Allow-Origin`: 表示有哪些域可以发送跨域的请求到本站, 配置方式有两种, 一种是通配符`*`, 表示可以接受任何域的请求, 另一种是固定的一个域名: 例如`https://kric.cc`, 注意这种方式只能填写一个域名, 不能配置多个.

- `Access-Control-Allow-Credentials`: 表示跨域的请求是否可以携带`cookie`, 如果有信息在`cookie`中必需要携带的话那么这个字段需要配置为`true`, 否则可以配置`false`, 不接收`cookie`.

- `Access-Control-Allow-Methods`: 表示服务端允许的请求方式, 例如`GET,HEAD,PUT,PATCH,POST,DELETE`表示服务端允许这些请求方式

## 缓存控制策略梳理(TODO)

## SSL/TLS

- SSL/TLS证书交换过程
![SSL/TLS证书交换过程](https://kric.cc/img/_SSL_TLS 证书交换过程.png)

## Content-Type

[关于Content-Type](https://kric.cc/Content-Type/)

## 参考

- [「查缺补漏」巩固你的HTTP知识体系](https://mp.weixin.qq.com/s/-F_rePfdhU29wxsH6nWNuQ)
