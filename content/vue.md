---
title: vue 笔记
date: 2021-4-20 14:12
---

# vue

- [x] $slots与$scopedSlots在2.5与2.6之间的父子组件重复渲染验证

  https://github.com/vuejs/rfcs/blob/master/active-rfcs/0006-slots-unification.md#summary vue关于$slots和$scopedSlots迁移计划

  这段话的pr讨论https://github.com/vuejs/vue/pull/9371 以及对比demo：

  - 2.5版本：https://codesandbox.io/s/vue25-slots-vs-scopedslots-jsrn8?file=/src/components/HelloWorld.vue
  - 2.6版本：https://codesandbox.io/s/vue26-slots-vs-scopedslots-cu8rq?file=/src/components/HelloWorld.vue

  结论: 后续3.x版本中会统一使用$scopedSlots, 2.x中的$slots将被废弃, 这是一个迁移计划. 所以在日常2.x使用中统一使用$scopedSlots, 不要再使用$slots, 这样之后向3.x版本迁移的话可以借助工具一次性把代码都迁移到新的用法上

- [x] 为什么要通过组件触发事件外面注册回调的方式来执行函数,而不通过属性的方式把要调用的函数传递给组件让组件调用?

  - 对于dom原生事件的支持以及一些vue提供的事件修饰符(`.stop`等), 这类型的事件因为是dom原生的所以肯定是事件形式, 这种不必讨论

  - `.once`修饰符可以针对非原生事件也起作用, 但是如果是函数属性的方式那么每次都会调用, 不支持`.once`的形式(以上两点都是针对修饰符在谈好处)

  - 作用域: 由于vue对于methods会自动绑定this, 所以函数实际执行时的作用域这一点上没有差别

  - 事件与函数最大的区别就在于事件是可以注册多个监听器的, 这对于代码的解耦是很有帮助的, 我们可以注册监听器a执行log等操作, 注册监听器b执行track等操作等等, 各部分逻辑是独立的, 但是如果是函数的话那么所有代码都必须统一写在这个函数里, 因为函数方式在被调用时只会有一个.

    在vue里面更具体的说就是: 加入你现在生成了一个vue实例, 你可以通过`$on`的方式注册多个事件监听器来执行不同的逻辑, 但是如果是函数属性的方式, 那么就只能传入一个函数给组件调用

  结论: 如果是不关系修饰符和注册多个监听器的场景的话可以使用函数属性的方式, 好处是属性是可以提前声明的, 这对于组件的使用者来说是很友好的, 可以通过查看你的属性声明来知道函数的参数以及返回值等, 尤其是配合ts时可以自动生成组件api文档, 比起别人在你的源码里面翻找`$emit`是如何触发的, 传递了什么参数要友好的多

  2022-07-21 17:41

  最近看了 vue3 以后关于`@click`和`:onClick`的疑惑终于没有了，因为这两者在 vue3 中被统一了！二者只是写法上的不一样，经过 vue 编译后结果是一模一样的，不用再纠结了，选择你喜欢的写法即可，它们没有差别。

  编译结果如下示例，你可以在[SFC Playground]()亲自试一试

  - 不论是使用`@`还是`:`符号绑定事件，都会被编译转为`on`前缀的属性传给组件
  - 添加事件修饰符`.once`等，只是会自动给事件名称添加`Once`等后缀，虽然使用`:`配合手动加上`Once`后缀就能达到一样的效果，但是这种手动拼接修饰符后缀的方式因为未在官方文档中提及，所以不推荐

  ![image-20220721175123507](https://kricsleo.com/img/image-20220721175123507.png)

####	vue 事件绑定流程（以浏览器环境为例）

1. 在`template` 中书写`@click='xx'` 或者`:onClick='xx'`
2. 编译时通过`@vue/compiler-core`的[`parseAttribute`](https://github.com/vuejs/core/blob/main/packages/compiler-core/src/parse.ts#L801)统一编译为`{ props: { onClick: xx } }`形式，如果同时存在`@click`和`:onClick`，那么两者都会保留变成`{ props: { onClick: [xx, xx] } }`数组形式
3. 运行时通过@vue/runtime-dom的[`patchProps`](https://github.com/vuejs/core/blob/c6eb3ccccee8e43e7aafcbc3c9ededecc565fdf0/packages/runtime-dom/src/patchProp.ts#L13)使用`props`属性创建或更新节点元素
4. `patchProps`根据正则[`isOn`](https://github.com/vuejs/core/blob/c6eb3ccccee8e43e7aafcbc3c9ededecc565fdf0/packages/runtime-dom/src/patchProp.ts#L28)判断属性是否是`on`开头，从而来判断属性是否是事件绑定, 如果是的话则调用[`patchEvent`](https://github.com/vuejs/core/blob/c6eb3ccccee8e43e7aafcbc3c9ededecc565fdf0/packages/runtime-dom/src/patchProp.ts#L31)进行事件绑定
5. `patchEvent`调用原生的[`addEventListener`](https://github.com/vuejs/core/blob/3bdc41dff305422cb5334a64353c314bce1202a4/packages/runtime-dom/src/modules/events.ts#L83)来绑定到原生 DOM 上(这里并没有区分是否真的是 DOM 原生事件（click 等），而是全部都会进行绑定)

- [x] vuex和vue-router的黑魔法

  `vue`本身从起点`new Vue(options)`开始便留了口子, 传入的参数`options`会被合并存储在根实例的`$options`参数中,` vue-router`(`vuex`没看, 应该差不多)正是利用这一点通过初始化时在`options`中传入`router`对象, 之后所以的子实例通过一层层向上遍历找到根实例上的`router`然后来调用`router`的一些方法.

  (这也就是为什么自己有时候在一些特殊组件中使用`new Vue()`自己构建实例的时候拿不到`router`和`vuex`相关对象, 因为你自己`new`出来的实例自己就是根节点, 无法再向上查到到最外部的被注入了相关属性那个根实例, 当然你也可以在自己`new`的过程中把`router`和`vuex`注入进去, 这样你自己根节点下的实例中就也能向上遍历找到你本次注入的`router`和`vuex`)

  **这有个启发, 之后如果想做一些类似的在所有实例注入一些东西, 是不是也可以通过`options`参数来注入?**

## Vue Conf 观后

#### 2021 年的[Vue Conf（第四届）](https://node.fequan.com/videodetail/1621773573110)看完了(2021-06-15 11:30)

记得最早开始接触vue是vue1.x的时候，那时候在jd，一个移动端的项目引入了vue.js，当时只是简单写了一下，感觉是一个带有自己生命周期钩子的前端框架js，开发来说也比较方便，了解不深，后来开始使用React之后社区里面凡是搜索React相关的必定能搜索到React和Vue对比的文章，所以多多少少也看了一些，知道它是使用什么原理来响应式的更新DOM，记得以前很早去看尤雨溪在github上的一个评论提到为什么会开发Vue，最早期只是自己觉得市面上的框架都不是很好用，自己试着按照自己的想法去做一个能更新DOM的东西出来，后来感觉做的也还不错，于是开源到社区，没想到社区里面很多人也喜欢这个方式，于是渐渐的用的人多了一起，慢慢发展壮大。

现在对于我来说享受到了代码提示和类型提示带来的好处和安全感之后，很难再回到盲编码的阶段了，但是现在用的Vue2对于ts的支持比较差，用起来很蛋疼，而且模板里面完全享受不到类型提示和补全的快感，尤雨溪自己也说押错了宝，他早期并不看好ts，没想到后来ts的发展让他自己也感叹真香，所以Vue3里面从头开始使用ts重写，这也是我很期待Vue3的一个原因，另外像hooks编程这种新特性也很好的契合了我之前写React hooks的一贯想法，同一块逻辑就应该放在一块维护，而不是拆分在不同的地方不同的生命周期中。

Vue也在探索着走自己的路，静态节点优化等等都能看到他们在自己的方向上做出的努力，我本身是喜欢React的哲学的，函数即一切，尤其是纯函数，享受完全自由化的js函数编程的能力，Vue相较来说就有很多限制和不支持，他会告诫你什么该做，什么不该做，这是我所不喜欢的，记得原来尝试性的用Vue2.x做一个管理后台的时候，痛苦了整整一个星期，我反复的查阅文档，学习并且牢记住每一个支持的写法，vue的官方文档总是跟我的代码编辑器一样开一个tab放在旁边随时查看，我太讨厌这种查字典的感觉了，但是后来写React的时候我就笑了起来，我只是粗略的看了一下React的文档，了解了它的设计哲学之后就开始随心所欲的编码了，我想写成什么样都能很好的实现我想要的效果，这太自由了，仿佛没有框架一样，普遍的说法是React的学习门槛要比Vue高一些，但是在我这里完全反了过来，可能我天生喜欢自由的东西，不喜欢限制与约束，如果一个框架有限制，那么我希望它能自己处理好这种限制，不要来告诉我应该做什么不应该做什么。

另外 vitePress 也许可以尝鲜一下，写博客也许用得到。

#### 2022年的 [Vue Conf（第五届）](https://www.vuemastery.com/conferences/vueconf-us-2022/opening-keynote/)看完了（2022-07-22 16:34）

- 这次感觉没什么有意思的
- Vue 3 已经开始用了
- Nuxt 3 已经是 RC 版本，再等等就可以用了

```vue
<template>
  <div class="order-invoice">
    <mhy-bbs-nav-bar />
    <mhy-promise
      :promise="pagePromise"
      @retry="initPromise">
      <!-- 开票确认状态 -->
      <template v-if="statusInfo.confirming">
        <div class="order-invoice__confirm">
          <div class="order-invoice__confirm-row">
            <p class="order-invoice__confirm-row-title">
              发票类型：
            </p>
            <p class="order-invoice__confirm-row-subtitle">
              增值税电子普通发票
            </p>
          </div>
          <div class="order-invoice__confirm-row">
            <p class="order-invoice__confirm-row-title">
              抬头类型：
            </p>
            <p class="order-invoice__confirm-row-subtitle">
              {{ titleTypeText }}
            </p>
          </div>
          <div class="order-invoice__confirm-row">
            <p class="order-invoice__confirm-row-title">
              发票抬头：
            </p>
            <p class="order-invoice__confirm-row-subtitle">
              {{ titleInput }}
            </p>
          </div>
          <div
            v-if="isEnterpriceTitleType"
            class="order-invoice__confirm-row">
            <p class="order-invoice__confirm-row-title">
              税号：
            </p>
            <p class="order-invoice__confirm-row-subtitle">
              {{ taxInput }}
            </p>
          </div>
          <div class="order-invoice__confirm-row">
            <p class="order-invoice__confirm-row-title">
              发票内容：
            </p>
            <p class="order-invoice__confirm-row-subtitle">
              您所购买的详细商品名称与价格
            </p>
          </div>
          <div class="order-invoice__confirm-row">
            <p class="order-invoice__confirm-row-title">
              开票金额
            </p>
            <p class="order-invoice__confirm-row-subtitle">
              <mhy-price
                :value="info.invoice_amount"
                class="font-bold"
                size="16"
                fira />
            </p>
          </div>
          <div class="order-invoice__confirm-row">
            <p class="order-invoice__confirm-row-title">
              接收邮箱：
            </p>
            <p class="order-invoice__confirm-row-subtitle">
              {{ emailInput }}
            </p>
          </div>
        </div>
      </template>
      <!-- 编辑状态 -->
      <template v-if="statusInfo.unApplyed || statusInfo.editing">
        <div class="order-invoice__info">
          <div class="order-invoice__info-row">
            <p class="order-invoice__info-row-title">
              订单编号：
            </p>
            <p class="order-invoice__info-row-subtitle">
              {{ orderId }}
            </p>
          </div>
          <div class="order-invoice__info-row">
            <p class="order-invoice__info-row-title">
              开票金额：
            </p>
            <p class="order-invoice__info-row-subtitle flex items-center">
              <mhy-price
                :value="info.invoice_amount"
                size="16"
                fira />
              <mhy-icon
                class="order-invoice__info-row-icon"
                name="i"
                size="12"
                @click="showMoneyTip = true" />
            </p>
          </div>
          <div class="order-invoice__info-row">
            <p class="order-invoice__info-row-title">
              发票内容：
            </p>
            <p class="order-invoice__info-row-subtitle">
              您所购买的详细商品名称与价格
            </p>
          </div>
        </div>
        <div class="order-invoice__form">
          <mhy-form
            label-align="left"
            input-align="right">
            <mhy-field
              class="field"
              label="发票类型："
              name="invoinceType">
              <template #input>
                <p class="font-bold">
                  增值税电子普通发票
                </p>
              </template>
            </mhy-field>
            <mhy-field
              name="titleType"
              class="field"
              label="抬头类型：">
              <template #input>
                <mhy-radio-group
                  v-model="titleType"
                  direction="horizontal">
                  <mhy-radio
                    v-for="config in titleTypes"
                    :key="config.value"
                    :name="config.value"
                    class="apply-radio">
                    {{ config.label }}
                  </mhy-radio>
                </mhy-radio-group>
              </template>
            </mhy-field>
            <mhy-field
              v-model="titleInput"
              :maxlength="200"
              class="field"
              label="发票抬头："
              placeholder="请填写需要开具发票的抬头" />
            <mhy-field
              v-show="isEnterpriceTitleType"
              v-model="taxInput"
              class="field"
              label="税号："
              placeholder="请填写纳税人识别号" />
            <mhy-field
              v-model="emailInput"
              class="field"
              label="接收邮箱"
              placeholder="请填写接收电子发票的邮箱" />
          </mhy-form>
        </div>
      </template>
      <!-- 已申请|已开票 查看状态 -->
      <template v-else-if="statusInfo.applying || statusInfo.done">
        <div class="order-invoice__tip">
          <p class="order-invoice__tip-title">
            {{ statusInfo.applying ? '已申请' : '开票完成' }}
          </p>
          <p class="order-invoice__tip-subtitle">
            {{ statusInfo.applying ? '发票将会在确认收货且没有处理中的售后单后30个工作日内开具' : '请前往您所填写的接收邮箱查看发票信息' }}
          </p>
        </div>
        <mhy-img
          no-fallback
          :w="375"
          :h="340"
          :src="bg"
          as="div"
          class="order-invoice__show">
          <div class="order-invoice__show-content">
            <p class="order-invoice__show-title">
              增值税电子普通发票
            </p>
            <div class="order-invoice__show-row">
              <span class="order-invoice__show-row-title">发票抬头：</span>
              <span class="order-invoice__show-row-subtitle">{{ info.invoice_title }}</span>
            </div>
            <div
              v-if="isEnterpriceTitleType"
              class="order-invoice__show-row">
              <span class="order-invoice__show-row-title">税号：</span>
              <span class="order-invoice__show-row-subtitle">{{ info.invoice_tax_no }}</span>
            </div>
            <div class="order-invoice__show-row">
              <span class="order-invoice__show-row-title">开票金额：</span>
              <mhy-price
                :value="info.invoice_amount"
                fira />
            </div>
            <div class="order-invoice__show-row">
              <span class="order-invoice__show-row-title">发票内容：</span>
              <span class="order-invoice__show-row-subtitle">您所购买的详细商品名称与价格</span>
            </div>
            <div class="order-invoice__show-row">
              <span class="order-invoice__show-row-title">申请日期：</span>
              <span class="order-invoice__show-row-subtitle">
                {{ info.invoice_time | formatTime('YYYY.MM.DD') }}
              </span>
            </div>
            <div class="order-invoice__show-row">
              <span class="order-invoice__show-row-title">接收邮箱：</span>
              <span class="order-invoice__show-row-subtitle">{{ info.applicant_email }}</span>
            </div>
          </div>
          <mhy-img
            v-if="statusInfo.done"
            no-fallback
            :src="completeSymbol"
            :w="95"
            :h="84"
            class="order-invoice__symbol" />
        </mhy-img>
      </template>
      <div
        v-if="cancelText || confirmText"
        class="order-invoice__footer">
        <mhy-button
          v-if="cancelText"
          v-trackClick="['button', 'click', cancelText]"
          :loading="cancelling"
          :type="confirmText ? 'info' : 'primary'"
          class="order-invoice__footer-btn"
          @click="onCancel">
          {{ cancelText }}
        </mhy-button>
        <mhy-button
          v-if="confirmText"
          v-trackClick="['button', 'click', confirmText]"
          :loading="confirming"
          type="primary"
          class="order-invoice__footer-btn"
          @click="onConfirm">
          {{ confirmText }}
        </mhy-button>
        <mhy-bottom-safe-gap />
      </div>
      <mhy-dialog
        v-model="showMoneyTip"
        title="开票金额说明"
        confirm-button-text="我知道了">
        <ul class="order-invoice__dialog-content">
          <li>开票金额为您实付款的金额，优惠金额不在开票范围内。</li>
          <li>如订单发生退货退款，开票金额将变更为最终实付款金额</li>
        </ul>
      </mhy-dialog>
    </mhy-promise>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import MhyBbsNavBar from '~/components/business/navbar/MhyBbsNavBar.vue';
  import MhyPromise from '~/components/base/MhyPromised.vue';
  import MhyPrice from '~/components/common/MhyPrice/index.vue';
  import MhyImg from '~/components/common/MhyImg/index.vue';
  import MhyIcon from '~/components/common/MhyIcon/index.vue';
  import MhyForm from '~/components/base/MhyForm/index.vue';
  import MhyField from '~/components/base/MhyField/index.vue';
  import MhyRadioGroup from '~/components/base/MhyRadioGroup/index.vue';
  import MhyRadio from '~/components/base/MhyRadio/index.vue';
  import MhyButton from '~/components/base/MhyButton.vue';
  import MhyToast from '~/components/base/MhyToast/index';
  import MhyBottomSafeGap from '~/components/base/MhyBottomSafeGap/index.vue';
  import MhyDialog from '~/components/base/MhyDialog/index';
  import { emailReg, ENUM_ORDER_INVOICE_STATUS, ENUM_ORDER_INVOICE_TITLE_TYPE, IMG_CONFIG, taxNumberReg } from '~/shared/constants';
  import { getOrderInvoiceInfo, saveOrderInvoiceInfo, withdrawOrderInvoice } from '~/shared/domain';
  import { IOrderInvoiceApplyInfo, IOrderInvoiceInfo } from '~/shared/types';
  import { ORDER_INVOICE_TITLE_TYPE_CONFIG } from '~/shared/domain/order';

  interface JSon {
    name: stirng;
  }

  export default Vue.extend({
    name: 'order-invoice',
    components: {
      MhyBbsNavBar,
      MhyPromise,
      MhyPrice,
      MhyIcon,
      MhyForm,
      MhyField,
      MhyRadioGroup,
      MhyRadio,
      MhyBottomSafeGap,
      MhyButton,
      MhyImg,
      'mhy-dialog': MhyDialog.Component,
    },
    layout: 'm-default',
    data() {
      return {
        orderId: this.$route.query.orderId as string,
        info: {} as IOrderInvoiceInfo,
        pagePromise: Promise.resolve() as Promise<any>,
        innerInfoStatus: ENUM_ORDER_INVOICE_STATUS.unApplyed,
        titleType: ENUM_ORDER_INVOICE_TITLE_TYPE.personal,
        titleTypes: Object.values(ORDER_INVOICE_TITLE_TYPE_CONFIG),
        bg: IMG_CONFIG.orderInvoiceBgMobile,
        completeSymbol: IMG_CONFIG.orderInvoiceCompleteSymbolMobile,
        titleInput: '',
        taxInput: '',
        emailInput: '',
        confirming: false,
        cancelling: false,
        showMoneyTip: false,
      };
    },
    computed: {
      statusInfo(): {
        expired: boolean; unApplyed: boolean; applying: boolean; done: boolean, editing: boolean; confirming: boolean;
      } {
        return {
          expired: this.innerInfoStatus === ENUM_ORDER_INVOICE_STATUS.expired,
          unApplyed: [
            ENUM_ORDER_INVOICE_STATUS.unApplyed,
            ENUM_ORDER_INVOICE_STATUS.cancelled,
          ].includes(this.innerInfoStatus),
          applying: this.innerInfoStatus === ENUM_ORDER_INVOICE_STATUS.applying,
          done: this.innerInfoStatus === ENUM_ORDER_INVOICE_STATUS.done,
          editing: this.innerInfoStatus === ENUM_ORDER_INVOICE_STATUS.editing,
          confirming: this.innerInfoStatus === ENUM_ORDER_INVOICE_STATUS.confirming,
        };
      },
      isEnterpriceTitleType(): boolean {
        return this.titleType === ENUM_ORDER_INVOICE_TITLE_TYPE.enterprice;
      },
      titleTypeText(): string {
        return ORDER_INVOICE_TITLE_TYPE_CONFIG[this.titleType]?.label;
      },
      confirmText(): string {
        switch (this.innerInfoStatus) {
          case ENUM_ORDER_INVOICE_STATUS.expired:
          case ENUM_ORDER_INVOICE_STATUS.done: return '';
          case ENUM_ORDER_INVOICE_STATUS.cancelled:
          case ENUM_ORDER_INVOICE_STATUS.editing:
          case ENUM_ORDER_INVOICE_STATUS.unApplyed: return '提交申请';
          case ENUM_ORDER_INVOICE_STATUS.applying: return '修改申请';
          case ENUM_ORDER_INVOICE_STATUS.confirming: return '确认提交';
          default: return '';
        }
      },
      cancelText(): string {
        switch (this.innerInfoStatus) {
          case ENUM_ORDER_INVOICE_STATUS.expired:
          case ENUM_ORDER_INVOICE_STATUS.done: return '';
          case ENUM_ORDER_INVOICE_STATUS.cancelled:
          case ENUM_ORDER_INVOICE_STATUS.unApplyed: return '暂不申请';
          case ENUM_ORDER_INVOICE_STATUS.applying: return '撤销申请';
          case ENUM_ORDER_INVOICE_STATUS.editing: return '取消';
          case ENUM_ORDER_INVOICE_STATUS.confirming: return '返回修改';
          default: return '';
        }
      },
    },
    watch: {
      orderId: {
        handler() {
          this.initPromise();
        },
        immediate: true,
      },
      info() {
        this.innerInfoStatus = this.info.invoice_status ?? ENUM_ORDER_INVOICE_STATUS.unApplyed;
        this.titleType = this.info.invoice_title_type || ENUM_ORDER_INVOICE_TITLE_TYPE.personal;
        this.titleInput = this.info.invoice_title ?? '';
        this.taxInput = this.info.invoice_tax_no ?? '';
        this.emailInput = this.info.applicant_email ?? '';
      },
    },
    methods: {
      initPromise() {
        this.pagePromise = this.initOrderInvoice();
      },
      // 初始化开票信息
      async initOrderInvoice() {
        this.info = await getOrderInvoiceInfo(this.orderId);
      },
      // 确认
      async onConfirm() {
        switch (this.innerInfoStatus) {
          case ENUM_ORDER_INVOICE_STATUS.cancelled:
          case ENUM_ORDER_INVOICE_STATUS.editing:
          case ENUM_ORDER_INVOICE_STATUS.unApplyed: {
            // 必填校验
            const invalid = [
              ...['titleInput', 'emailInput'].map(key => this.validateFormItem(key)),
              this.isEnterpriceTitleType ? this.validateFormItem('taxInput') : '',
            ].some(t => {
              if (t) {
                MhyToast(t);
                return true;
              }
              return false;
            });
            if (invalid) {
              break;
            }
            this.innerInfoStatus = ENUM_ORDER_INVOICE_STATUS.confirming;
            break;
          }
          case ENUM_ORDER_INVOICE_STATUS.confirming: {
            const paylaod: IOrderInvoiceApplyInfo = {
              applicant_email: this.emailInput,
              invoice_title: (this.titleInput || '').trim(),
              invoice_title_type: this.titleType,
              order_no: this.orderId,
              invoice_amount: this.info.invoice_amount as number,
            };
            this.isEnterpriceTitleType && (paylaod.invoice_tax_no = this.taxInput);
            try {
              this.confirming = true;
              await saveOrderInvoiceInfo(paylaod);
              MhyToast('提交成功');
              await this.initOrderInvoice();
              this.confirming = false;
            } catch (e) {
              console.log('提交申请失败', e);
              setTimeout(() => this.confirming = false, 1000);
            }
            break;
          }
          case ENUM_ORDER_INVOICE_STATUS.applying: {
            // 编辑
            this.innerInfoStatus = ENUM_ORDER_INVOICE_STATUS.editing;
            break;
          }
          default: break;
        }
      },
      // 取消
      async onCancel() {
        switch (this.innerInfoStatus) {
          case ENUM_ORDER_INVOICE_STATUS.applying: {
            MhyDialog.confirm({
              title: '撤销申请',
              message: '是否确认撤销该发票申请？',
              cancelButtonText: '取消',
              confirmButtonText: '确认',
              beforeClose: async (action, done) => {
                if (action === 'cancel') {
                  done(true);
                  return;
                }
                try {
                  this.cancelling = true;
                  await withdrawOrderInvoice(this.orderId);
                  MhyToast('已撤销申请');
                  this.$router.back();
                  done(true);
                } catch (e) {
                  done(false);
                  console.log('撤销申请失败', e);
                }
                this.cancelling = false;
              },
            }).catch(() => {});
            break;
          }
          case ENUM_ORDER_INVOICE_STATUS.editing: {
            // 取消编辑
            this.innerInfoStatus = ENUM_ORDER_INVOICE_STATUS.applying;
            break;
          }
          case ENUM_ORDER_INVOICE_STATUS.confirming: {
            this.innerInfoStatus = ENUM_ORDER_INVOICE_STATUS.unApplyed;
            break;
          }
          default: this.$router.back(); break;
        }
      },
      // 开票表单项输入
      handleInvoiceFormChange(key: string, value: string) {
        this[key].value = (value || '').trim();
      },
      // 表单项有效性校验
      validateFormItem(key: string): string {
        switch (key) {
          case 'emailInput': return emailReg.test(this.emailInput) ? '' : '请输入正确的邮箱地址以确保能收到电子发票';
          case 'taxInput': return taxNumberReg.test(this.taxInput) ? '' : '请输入正确的纳税人识别号';
          case 'titleInput': return this.titleInput ? '' : '请填写发票抬头';
          default: return '';
        }
      },
    },
  });
</script>

<style scoped lang="scss">
.order-invoice {
  &__info {
    background-color: #fff;
    padding: 15px 15px 22px 15px;
    margin-bottom: 10px;
  }
  &__info-row {
    @include flex(flex-start, flex-start);
    font-size: 14px;
    color: #16162e;
    line-height: 20px;
    & + & {
      margin-top: 12px;
    }
  }
  &__info-row-title {
    flex-shrink: 0;
    margin-right: 10px;
    flex-grow: 1;
  }
  &__info-row-subtitle {
    font-weight: 500;
    word-break: break-all;
    text-align: right;
  }
  &__info-row-icon {
    margin-left: 10px;
  }
  &__form::v-deep {
    background-color: #fff;
    margin-bottom: 80px;
    .van-radio--horizontal:last-child {
      margin-right: 0;
    }
    .van-field__label label {
      font-weight: 400;
    }
    .mhy-field {
      padding: 13px 15px;
      &:not(:first-child) {
        &::before {
          display: inline-block !important;
          position: absolute;
          box-sizing: border-box;
          content: '';
          pointer-events: none;
          right: 16px;
          top: 0;
          left: 16px;
          border-bottom: 1px solid #ebedf0;
          transform: scaleY(0.5);
        }
      }
    }
    .van-radio__icon {
      font-size: 14px;
    }
  }
  &__footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 12px 15px;
    text-align: right;
    background-color: #fff;
  }
  &__footer-btn {
    min-width: 109px;
  }
  &__confirm {
    padding: 15px;
    background-color: #fff;
  }
  &__confirm-row {
    @include flex(space-between, flex-start);
    & + & {
      margin-top: 12px;
    }
  }
  &__confirm-row-title {
    color: #9696a1;
    margin-right: 10px;
    flex-grow: 1;
    flex-shrink: 0;
  }
  &__confirm-row-subtitle {
    color: #16162e;
    text-align: right;
    word-break: break-all;
  }
  &__tip {
    padding: 15px;
    background-color: #f48b8b;
  }
  &__tip-title {
    font-size: 18px;
    font-weight: 600;
    color: #ffffff;
    line-height: 25px;
  }
  &__tip-subtitle {
    margin-top: 6px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
    line-height: 20px;
  }
  &__show {
    height: 354px;
    margin: 15px 15px 80px 15px;
    padding: 36px 31px 40px 30px;
    margin-bottom: 80px;
    position: relative;
  }
  &__show-content {
    max-height: 100%;
    overflow: auto;
  }
  &__show-title {
    color: #ff6d6d;
    font-size: 16px;
    font-weight: 600;
    line-height: 22px;
    text-align: center;
    margin-bottom: 10px;
  }
  &__show-row {
    position: relative;
    @include flex();
    padding: 10px 0;
    & + & {
      border-top: 1px #f6f6f6 solid;
    }
  }
  &__show-row-title {
    color: #9696a1;
    flex-grow: 1;
    flex-shrink: 0;
    margin-right: 10px;
  }
  &__show-row-subtitle {
    word-break: break-all;
    text-align: right;
  }
  &__subtitle {
    color: #16162e;
    word-break: break-all;
    text-align: right;
  }
  &__dialog-content {
    margin-top: -14px;
    padding: 0 20px 19px 20px;
    font-size: 14px;
    font-weight: 400;
    color: #9696a1;
    line-height: 20px;
    list-style: disc;
    margin-left: 20px;
    li + li {
      margin-top: 5px;
    }
  }
  &__symbol {
    width: 95px;
    height: 84px;
    position: absolute;
    bottom: 70px;
    right: 46px;
  }
}
</style>
```
