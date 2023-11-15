---
title: webp格式图片的支持情况
date: 2021-01-13 16:50:00
---

webp格式是由Google开发的一种图片格式, 可支持对带透明度或者无透明度的jpg,png,gif等格式的图片进行有损压缩或者无损压缩, 一般来说, 有损压缩可减少25%~34%的体积, 无损压缩可以减少26%左右的体积, 由于需要额外的编解码过程, 所以相比于jpg图片来说编码速度慢10倍, 解码速度慢1.5倍(压缩体积视源文件不同而有所浮动, 解码效率也视运行平台有所浮动, 上面数据是测试的平均值), 但是由于减少了体积, 也就减少了网络传输时间, 总体来说的图片加载完成的时间是要明显短的, 推荐在浏览器支持的情况下使用webp格式图片来代替其他格式, [webp兼容情况](https://caniuse.com/?search=webp)

![webp兼容情况](/img/20220113153746.png)

## 判断客户端是否兼容webp

### 浏览器端

- 使用`canvas.toDataURL('image/webp')`做同步判断

```js
function checkWebp() {
  try {
    return document.createElement('canvas')
      .toDataURL('image/webp')
      .indexOf('data:image/webp') === 0;
  } catch(e) {
    return false;
  }
}
```

这里利用的浏览器的`canvas`在导出图片数据时可以自定义导出的图片格式, 如果指定的是浏览器不支持的格式, 那么会被浏览器忽略, 最终得到的是`image/png`, 所以指定导出`image/webp`格式, 如果得到的也是这个格式, 那么说明浏览器是支持这个格式的图片的.

注意: 根据[caniuse](https://caniuse.com/?search=webp)上的数据, 浏览器对`canvas.toDataURL('image/webp')`方法和`webp`图片的支持程度不是完全一致的, 对前者支持更晚一些, 也就是说只要是支持`canvas.toDataURL('image/webp')`, 就一定支持`webp`, 但是反过来则不正确. 这是一种粗糙但安全的方案.

优点: 同步检测

缺点: 部分老版浏览器实际是支持`webp`, 但是不支持`canvas.toDataURL('image/webp')`的, 所以这种判断下会导致少量老版浏览器用户在支持`webp`的情况下我们认为他用不了, 而让他使用无优化的`png`或其他图片, 这点损失应该是可以接受的.

- 尝试加载`webp`图片做异步判断

「行不行, 试了才知道」, 可以尝试把`webp`图片给`image`元素加载, 如果加载成功, 则支持, 加载失败则不支持.

这里给出google开发者文档中的[示例代码](https://developers.google.com/speed/webp/faq#how_can_i_detect_browser_support_for_webp)

```js
// check_webp_feature:
//   'feature' can be one of 'lossy', 'lossless', 'alpha' or 'animation'.
//   'callback(feature, result)' will be passed back the detection result (in an asynchronous way!)
function check_webp_feature(feature, callback) {
    var kTestImages = {
        lossy: "UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",
        lossless: "UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==",
        alpha: "UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA==",
        animation: "UklGRlIAAABXRUJQVlA4WAoAAAASAAAAAAAAAAAAQU5JTQYAAAD/////AABBTk1GJgAAAAAAAAAAAAAAAAAAAGQAAABWUDhMDQAAAC8AAAAQBxAREYiI/gcA"
    };
    var img = new Image();
    img.onload = function () {
        var result = (img.width > 0) && (img.height > 0);
        callback(feature, result);
    };
    img.onerror = function () {
        callback(feature, false);
    };
    img.src = "data:image/webp;base64," + kTestImages[feature];
}
```

优点: `webp`本身分为有损/无损/透明/动态图, 这种检测可以最精细化的检测到对每种类型是否支持

缺点: 异步检测

### 微信小程序

也有做微信小程序的开发, 而自成体系的小程序在各种方面都很蛋疼, `webp`的支持也不例外.

微信小程序在ios和android还有开发者工具上采用的是不同的底层框架, 对webp的支持程度也由其底层实现来决定, 所以我们需要分开平台判断

- PC和Mac: 这两个平台的微信小程序均不支持webp

- android: android平台的微信使用的腾讯x5内核, 一直都支持webp

- ios: [官方文档](https://developers.weixin.qq.com/community/develop/issue/130)宣称在小程序基础库升级到`2.9.0`及以上之后可以在ios上支持webp, 但是测试发现, **腾讯出品的文档一如既往的垃圾**, 测试结果表明是否支持webp同时受到ios版本和微信基础库版本两者的限制, 表现如下:

  - ios系统处于14.x(我测试的是14.2)即使小程序基础库低于`2.9.0`(我测试的是2.6.0)可以在`<Image />`和`background-image`中直接支持webp

  - 如果ios低于14.x(比如我同事的11.4.1)即使基础升级到了`2.9.0`也还是不支持webp, 一直升级基础库测试直到`2.10.1`才在`<Image />`组件中支持了webp的显示, 注意`<Image />`要开启webp参数, 对于`background-image`还是不支持

  利用手边的资源进行实际测试,本次测试微信基础库版本以`2.10.1`为准, 只要`2.10.1`支持webp, 则认为更高版本的基础库也支持webp,微信本身的版本默认对测试结果无影响

  ios系统以11.4.1, 12.2, 13.4.1, 14.0, 14.2(我借到的五款ios系统)为准,能够显示webp图片则认为支持webp, 同时测试了`<Image />`和`background-image`的支持程度, 测试结果如下:
  ![ios微信小程序webp支持情况](/img/webp_in_miniprogram.png)

  可以看到从ios11.4.1(也许更早的系统也支持,但是我手上没有样机资源)和小程序基础库`2.10.1`开始支持了在`<Image />`组件中开启webp参数以后使用webp图片

  对于`background-image`的方式可以认为从14.0开始就支持, 即使小程序库低于`2.10.1`(因为我的项目库设置的是2.6.0, 所以低于2.6.0的库不再进行测试)

  针对以上的测试结果可以小程序中加入如下是否可以使用webp的代码判断

  ```ts
  /**
    * 比较源版本号和目标版本号的高低
    * -1: 源版本低, 0: 源版本与目标版本相同, 1: 源版本高
    * @param v1 源版本号
    * @param v2 目标版本号
    */
  function compareVersion(v1: string, v2:string): -1 | 0 | 1 {
    const v1Arr = v1.split('.')
    const v2Arr = v2.split('.')
    const len = Math.max(v1Arr.length, v2Arr.length)

    while (v1Arr.length < len) {
      v1Arr.push('0')
    }
    while (v2Arr.length < len) {
      v2Arr.push('0')
    }

    for (let i = 0; i < len; i++) {
      const num1 = parseInt(v1Arr[i])
      const num2 = parseInt(v2Arr[i])

      if (num1 > num2) {
        return 1
      } else if (num1 < num2) {
        return -1
      }
    }

    return 0;
  }

  // ios环境 webp 支持情况
  const supportedWebpVerison = {
    // <Image />支持 webp 的最低版本
    wechatLib: '2.10.1',
    // ios支持 <Image /> 方式使用 webp 的最低版本
    ios: '11.4.1',
    // ios支持 backgroundImage 方式使用 webp 的最低版本
    iosBackgroundImage: '14.0',
  }

  /**
    * 是否可使用webp格式图片
    * [image 组件是否支持webp, backgroundImage 是否支持webp]
    */
  export function checkWebp(): [boolean, boolean] {
    const { platform, system, SDKVersion } = getSystemInfoSync() || {};
    if (platform === 'android') {
      return [true, true];
    } else if(platform === 'ios') {
      const systemVersion = system.split(' ')[1];
      const isSupportBackgroundImage = compareVersion(systemVersion, supportedWebpVerison.iosBackgroundImage) >= 0;
      const isSupportImage = compareVersion(systemVersion, supportedWebpVerison.ios) >= 0 && compareVersion(SDKVersion, supportedWebpVerison.wechatLib) >= 0;
      return [isSupportImage, isSupportBackgroundImage];
    }
    return [false, false];
  }
  ```
  (2020-01-07补充一个小发现: h5中`<Img />`是没有子元素的, 但是小程序中`<Image />`发现可以支持子元素, 这一点并未在官方文档和相关社区描述中提到, 但是偶然的测试发现是支持的,可能是由于小程序的独立渲染机制所导致的,猜测`<Image />`实际渲染时也是先生成一个视口来占位,然后再将一个图片元素填充到这个视口中, 看起来就好像是一个单独的图片一样, 所以实际测试可以在`<Image />`里面放入`View`,`Text`, `Image`等元素, 默认图片会填满这个视口, 但是如果里面的子元素太大了宽高溢出的话也可以设置`overflow: auto`来滚动,你可以把`<Image />`也类比为一个`<View />`来理解, 这一点在再加上`<Image />`对webp的支持程度好一些, 是可以好好利用的)

## 服务端判断客户端是否可用`webp`

浏览器如果支持`webp`,那么会在特定类型请求的请求头的`accept`字段附带`image/webp`标识, 服务器可以判断请求头中是否存在该值.

"特定类型请求"指的是什么?

> 浏览器会基于请求的上下文来为这个请求头设置合适的值，比如获取一个CSS层叠样式表时值与获取图片、视频或脚本文件时的值是不同的。  --[Accept](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Accept)

通常是在`html`和`image`类型的资源会附带`image/xx`类型的`accept`头, 其余的例如`css`/`js`/`video`/`audio`是不会使用`image/xx`类型的`accept`头, 具体的场景可以参考这份文档[List of default Accept values](https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation/List_of_default_Accept_values), 所以我们可以在`html`或者`image`类型资源的请求中来查询`accept`字段是否附带`image/webp`标识, 从而判断客户端是否支持`webp`

![accept头字段中的image/webp标识](/img/20220113172305.png)
