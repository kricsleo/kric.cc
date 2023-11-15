---
title: TCP → TLS → HTTP 连接协商
date: 2022-07-10 11:38
---

HTTP/1和HTTP/2都是建立在TCP连接的基础上

### 如何建立TCP连接？

1. 客户端发送「SYN」包， 内容「Seq=0」
2. 服务端响应「SYN, ACK」包，内容「Seq=0 Ack=1」
3. 客户端发送「ACK」包，内容「Seq=1 Ack=1」

3次TCP握手成功，则成功建立TCP连接。

客户端和服务端之间的一个来回时间称为`RTT`（Round Trip Time），所以建立TCP连接的时间是1.5RTT

![Untitled](/img/Untitled.png)

- `Seq`代表自己本次发送数据包的序列号
- `Ack`代表期望下一次收到的对方的序列号（即对方的Seq值）

这两个序号列都是随着数据的发送根据数据包的长度来递增的（排除一些特殊情况会产生的序列号重置），如果序列号不对，则说明中间传输可能发生了数据丢失

例如客户端本次发送数据时「Seq=1 Ack=10 Len=100」，「Seq=1」代表自己之前发过的数据包的长度是1，「Ack=10」代表自己之前接收到来自对方的数据包的长度是10，所以期望下次对方发过来的数据里面的「Seq」值为10，这样就校对正确，「Len=100」代表自己本次要发送的数据包的长度是100

那么可以推测的是服务端下次发送的数据应该是「Seq=10 Ack=101 Len=…」，这次的「Seq」应该和客户端的「Ack」相等为10，这次的「Ack」应该等于客户端的「Seq」+「Len」=1 + 100=101

客户端和服务端就按照上述规则来递增「Seq」和「Ack」值

（上述规则为示例，其实里面有更多场景，比如确认连接后会重置「Seq」和「Ack」为1，「SYN」包没有数据但是也会让「Ack」的值+1，「ACK」包也没有数据却不会导致「Ack」+1，这些都是协议里规定的一些细节内容）

### 如何建立TLS连接？

如果网站是`https`的，那么在建立了TCP连接之后还需要接着建立`TLS`连接来保证之后传输数据的安全性

### TLS/1.1及TLS/1.2 的过程

1. 客户端发送`Client Hello`包，内容是自己支持的加密套件以及随机码等内容
2. 服务端响应`Server Hello`包，里面是根据客户端`Client Hello`包中内容确定最后选择的加密方法以及随机码等内容
    1. 服务端紧接着还会发送一个`Certificate`证书文件包，把自己的网站证书发送给客户端验证，和一个`Server Hello Done`包，告诉客户端初步协商完成
3. 客户端发送`Change Cipher Spec`和`Handshake Finished`包来告诉服务端加密验证相关的信息以及客户端`TLS`握手完成
4. 服务端同样响应`Change Cipher Spec`包和`Handshake Finished`包来告诉客户端加密相关信息以及服务端`TLS`握手完成

4次TLS握手完成，则成功建立TLS连接。

初次建立TLS连接的时间是2RTT（后续TLS连接只需要1RTT，这里暂不展开说明为什么减少1RTT）

![Untitled](/img/Untitled1.png)

### 如何确定使用TLS1.1还是TLS1.2？

1. 客户端在`Client Hello`的握手信息`Handshake Protocol`中提供自己的`TLS`版本（默认为自己支持的最高版本）

![Untitled](/img/Untitled2.png)

2. 服务端根据客户端`Client Hello`中的版本以及自己支持的版本确定最后使用的`TLS`版本, 然后在`Server Hello`的握手信息`Handshake Protocol`中返回

![Untitled](/img/Untitled3.png)

### 那TLS1.3 怎么建立连接呢？

TLS1.3相比于之前认证和连接过程都有了很大改变，但是为了兼容之前的TLS版本，所以仍然套的是之前`Client Hello`,`Server Hello`这种方式的壳子，但是在数据包里面加了`supported_versions`字段来让支持`TLS1.3`的服务端能够切换到`TLS1.3`。如果服务端支持TLS1.3，那么二者将会使用这个字段来协商使用TLS1.3，如果服务端不支持，那么就会自动回退到之前TLS1.2的过程建立TLS1.2连接

1. 客户端（支持TLS1.3）发送`Client Hello`包，在`supported_versions`中填写自己支持的TLS版本，如下：TLS1.3和TLS1.2

![Untitled](/img/Untitled4.png)

2. 服务端（支持TLS1.3）响应`Server Hello`包，在`supported_versions`中根据客户端和自己的支持情况选择了TLS1.3

![Untitled](/img/Untitled5.png)

另外这里可以看到`Change Cipher Spec`不再是单独发送，而是和`Server Hello`包合并一起发送，服务端在响应握手的同时把加密相关的内容一起发给了客户端，客户端的`Change Cipher Spec`也可以跟随之后的应用数据包一起发送，这样就只需要两步就建立了TLS连接，时间缩短到了1RTT（TLS1.3后续连接是0RTT，这里暂不展开说明）

TLS1.2 和 TLS1.3 握手差别：

![TLS1.2 和 TLS1.3 握手差别](https://oss.kricsleo.com/differences-between-tls-1.2-and-tls-1.3-full-handshake.png)



（一个小插曲，在测试nginx对TLS各版本的支持情况时，发现必须所有开启了https的server的ssl_protocols都有TLS1.3，nginx才会开启TLS1.3，例如nginx如果同时代理了两个网站，不能仅对其中一个开启TLS1.3，另外的不开，也就是要么全部启用TLS1.3，要么全部关闭TLS1.3，只配置部分网站的话最后结果是都不会开启）

### 如何确定使用`HTTP/1`还是`HTTP/2`?

客户端和服务端都有各自支持的`HTTP`版本，那么怎么决定在二者通信时应该使用哪个版本呢？

这里就是使用`HTTP/2`的协商机制来决定是否从`HTTP/1`升级到`HTTP/2`，分为一下两种情况：

- 如果是`HTTP/2 Over HTTP`（即不加密的`HTTP/2`），那么可以使用`HTTP`的`Upgrade`机制，也就是协议升级（例如我们日常使用的`WebSockt`链接的建立过程就是使用这个实现的从`http`协议升级到`wss`协议），如果看到一个`101`的`http`响应码，则说明发生了一次协议升级，通过这种方式可以从`HTTP/1`升级到`HTTP/2`
- 如果是`HTTP/2 Over TLS`(即加密的`HTTP/2`)，注意这里才是我们遇到的现实，因为虽然规范并没有规定`HTTP/2`一定要是加密（TLS）的，但是实际各个浏览器不约而同的都只支持通过`TLS`来进行`HTTP/2`通讯，所以这也意味着所以使用`HTTP/2`的网站必须是`https`的，这种情况下只能在`TLS`层用`ALPN`或者`NPN`来进行协议升级，他们的区别如下：
    - `NPN`（Next Protocol Negotiation，下一代协议协商）是Google早期是实验`SPDY`(也就是HTTP/2的前身)时采取的一种做法，它是服务端发送自己所支持的版本，然后由客户端来选择一个使用
    - `ALPN`（**Application-Layer Protocol Negotiation, 应用层协议协商）是`SPDY`被正式修订为`HTTP/2`的过程中对**`NPN`的修改形成的，他是客户端发送自己所支持的版本，然后由服务端来选择一个使用

也就是说现在这个`HTTP/2`时代我们用的都是`ALPN`的方式，由服务器选择使用哪个版本的`HTTP`来通讯

1. 例如客户端这里的`Client Hello`包中`application_layer_protocol_negotiation`列出了自己所支持的`HTTP`版本：`h2`(HTTP/2)和`http/1.1`

![Untitled](/img/Untitled6.png)

1. 然后服务端的`Server Hello`中`application_layer_protocol_negotiation`根据客户端以及自己的支持情况选择了高版本的`h2`

![Untitled](/img/Untitled7.png)

不论是`HTTP/1`还是`HTTP/2`, 都需要建立在TCP连接的基础上，那么最基础的TCP的3RTT的时间就会一直存在，是否搭配TLS（`http`还是`https`）以及搭配的是哪个版本的TLS（TLS1.1，TLS/1.2还是TLS1.3）有如下结果（注意：都是计算的初次连接过程，另外客户端TCP最后一次握手可以和TLS的第一次握手可以紧挨着发送，所以下面的计算过程可以节省0.5RTT）

- `http`:  TCP 1.5RTT  + 0 = 1.5RTT
- `https`(TLS1.1或TLS1.2)：TCP 1.5RTT  + TLS 2RTT - 0.5RTT = 3RTT
- `https`(TLS1.3)：TCP 1.5RTT  + TLS 1RTT - 0.5RTT = 2RTT

### 0-RTT

这是最理想的情况，无需等待连接建立，即可直接发送请求，在TLS1.3中开始支持TSL层的0-RTT。

注意0-RTT在客户端和服务端初次建立连接时不可用，仅对后续请求可以生效，原理就是服务端和客户端在第一次连接建立成功之后会把加密等相关信息都缓存下来，在有效期内下次通讯可以直接通过Session来复用缓存的加密信息来传输数据，而无需重复交换加密信息这一过程，所以对TLS1.3而言后续通讯直接减少1RTT变成了0RTT，这个缓存有效期一般会设定在一个合适的时间范围内，既保证内存占用不会太高，又能对一段时间内持续的数据传输起到减少RTT的作用。如果超过有效期，那么就需要重新进行1RTT的建连过程。

（这里的0-RTT仅指TLS层，如果使用的还是HTTP/1或者HTTP/2，那么TCP层的1.5RTT怎么都无法省略，只有到了HTTP/3，才可以连TCP的1.5RTT都省略，变成真正的0-RTT）

那么TCP的1.5RTT能不能省呢？能！这就是目前已经开始推广使用的HTTP/3。

## HTTP/3

### HTTP/3带来了什么改变？

HTTP/3抛弃TCP拥抱UDP，然后基于UDP制定了QUIC协议，由Google最初提出并在2012年实现，QUIC把原本独立的一层TLS包含在内，内建了TLS1.3

![Untitled](/img/Untitled8.png)

TCP与UDP协议的对比是老生常谈，最常说的一句话是「TCP是可靠连接，UDP是不可靠连接」，这主要是因为他们在是否需要提前建立稳定的连接，是否保证数据正确性和顺序上的区别。

- TCP通过三次握手来建立稳定连接，但是带来1.5RTT延迟问题，同时对于数据有着较为严格的校验和重传机制，但是带来了队头阻塞（一个包丢了，后面的包都会挂起，直到丢失的包重传成功）问题
- 而UDP不需要提前建立连接，数据想发就发，同时因为不保证数据到达顺序，各个包独立发送，独立到达，所以不存在队头阻塞，当然了有利就有弊，UDP是牺牲了数据传输的可靠性，服务端和客户端需要为可靠性的降低而付出别的努力比如新的数据格式，校验机制等等来保证传输的稳定性和正确性

虽然规范是更加自由的, 但是浏览器的实际实现只允许如下这些情况存在:

- 如果是HTTP/1，那么可以使用TLS（https），也可以不使用（http）
- 如果是HTTP/2，那么必须使用TLS，且最低使用TLS1.2
- 如果是HTTP/3，那么必须使用TLS，且最低使用TLS1.3

底层的修改为HTTP带来了更多的可能性，因为不需要建立TCP连接，比如我们追求的0-RTT在HTTP/3中成为了现实，在初次连接时仅需要1-RTT来交互必要的加密信息等数据，后续连接可以使用之前缓存的信息来直接发送数据实现0-RTT

### 如何从HTTP/1，HTPP/2切换到HTTP/3？

（部分网络代理软件会影响HTTP/3，导致实际看到的是使用旧版的HTTP，所以使用或者测试HTTP/3时保险起见先关闭本机的网络代理，之后等各个软件适配，这种情况应该会减少）

前面说HTTP/1升级到HTTP/2是通过ALPN方式来协商升级的，但是HTTP/3的升级却不是ALPN，而是通过新的HTTP Alternative Services（该方式晚于HTTP/2一年发布），具体做法是服务端会在响应头增加一个叫做「Alt-Svc」字段，来告诉客户端除了你当前正在使用的这种连接方式，我还支持额外这些连接方式，客户端可以自己决定是否切换到新的方式

(这种方式除了可以用以HTTP/3协议的升级,还可以用在负载均衡等场景, 例如服务端当前繁忙的时候可以通过这个方式指定一个替代的服务器,用户可以到另外的服务器上去获取数据,或者科学上网以及免备案接入国内主机等)

例如：

```bash
alt-svc: h3-29=":443"; ma=86400, h3=":443"; ma=86400
```

这代表服务端在443端口还支持h3（HTTP/3）和h3-29（HTTP/3的一个草案）连接方式，在未来的86400s内客户端都可以选择使用新的这两种方式来和客户端通讯（当然也可以不使用，这取决于客户端自己）

升级对于服务端也有要求

1. 「Alt-Svc」里的替代服务必须部署TLS
2. 如果原始服务也是使用TLS，那么替代服务必须使用同一张SSL证书（Chrome中进一步要求原始服务必须是TLS）

从协议升级过程可以看出在初次连接的时候仍然会使用HTTP/1或HTTP/2，从第二次或者更后面的请求才可以切换到HTTP/3，所以即使某个网站支持HTTP/3，也许你也需要多刷新几次才会发现开始使用HTTP/3，随着HTTP/3的发展后面也许可以出现更优雅的方式能够从初次连接开始就使用HTTP/3

## HTTP发展过程

1. HTTP/0.9 -  在1991年由W3C组织（[World Wide Web](https://www.w3.org/)）实施（最早是在1989年由万维网之父-蒂姆·伯纳斯-李（[Tim Berners-Lee](https://en.wikipedia.org/wiki/Tim_Berners-Lee)）发明），已废弃

2. HTTP/1.0 -   在1996年由**W3C的**HTTP工作组（HTTP Worging Group）发布，已废弃

3. HTTP/1.1 -    在1997年由W3C的HTTP工作组（HTTP Worging Group）发布，仍在使用中

4. SPDY      -    在2009年由Google发布并开始实验（后续正式化为HTTP/2.0），已废弃

5. HTTP/2.0  -  在2015年由W3C的HTTP工作组（HTTP Worging Group）发布（因为SPDY实验很成功，Google把相关内容都提交给了W3C来进行标准化），仍在使用中

6. HTTP/3.0 -   在2022年由IETF（IETF HTTP Working Group）发布，主流浏览器陆续提供支持

## 使用curl测试

1. 确认curl基础库版本

```bash
curl --version
```

 - 如果是基于Libressl构建的curl, 那么内容类似如下:

 ```
 curl 7.79.1 (x86_64-apple-darwin21.0) libcurl/7.79.1 (SecureTransport) LibreSSL/3.3.6 zlib/1.2.11 nghttp2/1.45.1
 Release-Date: 2021-09-22
 Protocols: dict file ftp ftps gopher gophers http https imap imaps ldap ldaps mqtt pop3 pop3s rtsp smb smbs smtp smtps telnet tftp
 Features: alt-svc AsynchDNS GSS-API HSTS HTTP2 HTTPS-proxy IPv6 Kerberos Largefile libz MultiSSL NTLM NTLM_WB SPNEGO SSL UnixSockets
 ```

 如果要测试TLS1.3, 那么LibreSSL版本需要>=`3.2.2`, LibreSSL从这个版本开始支持TLS1.3, [Changelog for LibreSSL 3.2.2](https://abi-laboratory.pro/index.php?view=changelog&l=libressl&v=3.2.2)

 > 3.2.2 - Stable release
 > * This is the first stable release with the new TLSv1.3 implementation enabled by default for both client and server.

 - 如果是基于OpenSSL构建的curl, 那么内容类似如下:

 ```
 curl 7.84.0 (x86_64-apple-darwin21.5.0) libcurl/7.84.0 (SecureTransport) OpenSSL/1.1.1q zlib/1.2.11 brotli/1.0.9 zstd/1.5.2 libidn2/2.3.2 libssh2/1.10.0 nghttp2/1.48.0 librtmp/2.3 OpenLDAP/2.6.2
 Release-Date: 2022-06-27
 Protocols: dict file ftp ftps gopher gophers http https imap imaps ldap ldaps mqtt pop3 pop3s rtmp rtsp scp sftp smb smbs smtp smtps telnet tftp
 Features: alt-svc AsynchDNS brotli GSS-API HSTS HTTP2 HTTPS-proxy IDN IPv6 Kerberos Largefile libz MultiSSL NTLM NTLM_WB SPNEGO SSL threadsafe TLS-SRP UnixSockets zstd
 ```

 如果要测试TLS1.3, 那么OpenSSL版本需要>=`1.1.1`, OpenSSL从这个版本开始支持TLS1.3, [ Changes between 1.1.0i and 1.1.1 [11 Sep 2018]](https://www.openssl.org/news/cl111.txt)

 > *) Support for TLSv1.3 added.

 - 如果基础库不满足要求, 那么可以使用homebrew安装新版curl

 ```bash
 brew install curl

 # 安装后需要按照brew提示进行配置
 # 因为macos自带curl, 新安装的curl不能直接取代原有的
 # 所以需要在修改配置文件来使用新安装的版本
 # 你会看到类似如下提示内容, 按照提示语句配置
 # If you need to have curl first in your PATH, run:
 #   echo 'export PATH="/usr/local/opt/curl/bin:$PATH"' >> ~/.zshrc
 echo 'export PATH="/usr/local/opt/curl/bin:$PATH"' >> ~/.zshrc

 # 修改了配置文件后,需要重载配置文件才能生效
 source ~/.zshrc

 # 再次查看curl版本
 curl --version
 ```

2. 使用curl测试连接

```bash
# -I 仅显示响应头
# -v 显示连接过程详细信息
# --tlsv1.3 最低使用tls1.3版本(类比 --tls1.1 --tls1.2 可限定最低版本)
# --tls-max 1.3 最高使用tls1.3版本(类比 --tls-max 1.2 可限定其它最高版本)
# --tlsv1.3 --tls-max 1.3 配合使用可限定到仅使用某个tls版本
curl https://kric.cc -Iv
```

- 我本机安装新版本curl后支持tls1.3, 正好服务端也支持tls1.3, 所以tls层最后的协商结果是tls1.3

- curl支持http2, 正好服务端也支持http2, 所以http层最后的协商结果是http2

- 如果各自支持的最高版本不一致, 那么将会回退到二者都支持的版本中最高的一个

```
*   Trying 47.117.70.235:443...
* Connected to kricsleo.com (47.117.70.235) port 443 (#0)
* ALPN: offers h2
* ALPN: offers http/1.1
* TLSv1.3 (OUT), TLS handshake, Client hello (1):
* TLSv1.3 (IN), TLS handshake, Server hello (2):
* TLSv1.3 (IN), TLS handshake, Encrypted Extensions (8):
* TLSv1.3 (IN), TLS handshake, Certificate (11):
* TLSv1.3 (IN), TLS handshake, CERT verify (15):
* TLSv1.3 (IN), TLS handshake, Finished (20):
* TLSv1.3 (OUT), TLS change cipher, Change cipher spec (1):
* TLSv1.3 (OUT), TLS handshake, Finished (20):
* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384
* ALPN: server accepted h2
* Server certificate:
*  subject: CN=kricsleo.com
*  start date: Nov 16 00:00:00 2021 GMT
*  expire date: Nov 16 23:59:59 2022 GMT
*  subjectAltName: host "kricsleo.com" matched cert's "kricsleo.com"
*  issuer: C=US; O=DigiCert Inc; OU=www.digicert.com; CN=Encryption Everywhere DV TLS CA - G1
*  SSL certificate verify ok.
* Using HTTP2, server supports multiplexing
...
```

### 使用浏览器测试

- 浏览器控制台->Network面板->Protocol查看HTTP版本信息

![image-20220714100424892](/img/image-20220714100424892.png)

- 浏览器控制台->Security面板->Connection查看TLS版本信息

![image-20220714100604813](/img/image-20220714100604813.png)

![image-20220714100528491](/img/image-20220714100528491.png)

## 参考文档

- [HTTP/3 Deep Dive](https://ably.com/topic/http3)
- [Decoding TLS 1.3 Protocol Handshake With Wireshark](https://thesecmaster.com/decoding-tls-1-3-protocol-handshake-with-wireshark/)
- [HTTP/3：HTTP Alternative Services 作为协商方式](https://blog.skk.moe/post/http3-alt-svc/)
