---
title: rust 笔记
date: 2022-8-20 14:12
---

## `String`vs`&String`vs`&str`

- `String`: 可变字符串，堆上分配的`UTF-8`字节缓冲区，有`len()`和`capaciry*()`(注: `len()`代表当前实际占用的空间, `capacity()`代表已经分配的空间, 可能是大于`len()`的, 类比一个大小为10的数组当前只存储了一个对象)，例如: `let mut a = String::from("demo");`
- `&String`: 引用`String`, 由于只是引用, 不获取所有权, 无法修改, 所以可以当做`&str`(类型也不会报错)
- `&str`: 不可变字符串的引用，如果是从`String`解引用来的则指向堆，如果是字面值，则指向静态内存，只有`len()`, 例如：`let b = "demo"; `

互相转换：
- `String` -> `&str`:  `x.as_str()`
- `&str` ->  `String`: `x.to_string()`|`x.to_owned()`|`String::from(x)`


## `iter()`vs`iter_mut()`vs`into_iter()`

- `iter()`: `&self`
- `iter_mut()`: `&mut self`
- `into_iter()`: `self`

```rs
let v = vec!(47);
for i in v.iter() {
	assert_eq!(i, &47);
}

let mut v = vec!(47);
for i in v.iter_mut() {
	*i = 48;
	assert_eq!(i, &48);
}

let v = vec!(47);
for mut i in v.into_iter() {
	i += 1;
	assert_eq!(i, 48);
}
```

## `clone()`vs`to_owned()	`
参考资料: [In Rust, what is the difference between clone() and to_owned()?](https://stackoverflow.com/questions/22264502/in-rust-what-is-the-difference-between-clone-and-to-owned)
- `clone()`: 只能实现&T -> T, 使用的更频繁一些
- `to_owned()`: 可以实现更复杂一些的别的类型->T, 使用的相对少一些

## `AsRef`vs`AsMut`

参考资料: https://wiki.jikexueyuan.com/project/rust-primer/intoborrow/asref.html

共同点：二者都是`Trait`

区别：

- `AsRef`: 对一个类型为`T`的对象`foo`, 如果`T`实现了`AsRef<U>`, 那么`foo`可执行`foo.as_ref()`操作, 得到一个`&U`
例如: `String`和`&str`都实现了`AsRef<str>`, 所以一下代码都可以运行

```rs
fn is_hello<T: AsRef<str>>(s: T) {
	assert_eq!("hello", s);
}

let s = "hello";
is_hello(s);

let s2 = "hello".to_string();
is_hello(s2);
```

- `AsMut`: 是`AsRef`的可变引用版本, 对应的方法是`.as_mut()`

## `&&&&&&str.len()`
这个表达式之所以能调用，是因为`rust`的自动解引用特性：[解引用](https://zhuanlan.zhihu.com/p/21615411)
函数使用引用参数时，参数不会发生`move`的, 因为引用会自动按位复制给函数使用

## 指针

- 指针：一个指向其他数据的内存地址，无别的功能和开销，不实际拥有所指向的数据
- 智能指针：一类数据结构，除了表现得像指针一样可以指向其他数据，通常还有别的功能和元数据，最显著的特征是自动实现了`Deref`（自动解引用）和`Drop`（自动释放内存）两种 trait，拥有所指向的数据

### 常见智能指针

- `Box<T>`

默认情况下分配内存都是在栈中，Box 可以将值放置在堆中，然后在栈中留下一个指向堆的引用（引用所占用的内存是大小固定的）

- `Rc<T>`（ Reference Counting ）

通常一个值只能由一个变量所有，使用 Rc 可以让一个值被多个变量所有，内被是计数引用的形式来记录被多少个变量拥有，当计数为 0 的时候会自动释放内存

Rc 只能用于单线程，不能用于多线程

- `Arc<T>`(Atomically)

跨线程安全的计数引用，可以用于多线程，除此之外和`Rc<T>`是一样的

- `Cell<T>`和`RefCell<T>`

用于对象实现内部可变性，对象不可变，但是里面的内容是可变的

[Rust 的包装类型](https://blog.lxdlam.com/post/b63a9600/)

## match 的引用

[Rust的pattern match](https://www.yuanguohuo.com/2020/01/13/rust-pattern-match/)

> Rust中match随处可见，但是其中有一些细节值得注意：被match的对象可以是值也可以是引用，pattern可以是值也可以是引用，这就有4种组合，各自是什么行为呢？

## `&` vs `ref`

作用是基本一样的，只是使用的地方不一样

[rust 的引用与借用](https://zhuanlan.zhihu.com/p/306650851)
