---
layout: post
title: Objective-C 与 cpp 混编的注意点
keywords: 混编
category: 混编
tags: [混编]
---

最近在忙一个IM项目，使用的是 gloox 开发包，那么问题就来了。

##iOS混编的要点
- OC 调用 C++

这种情况比较简单，因为编译器做了优化，把 .m 文件直接改为 .mm ，然后直接用就好了。

- C++ 调用 OC

这种又分为两种情况：1.完全的 C++ ，那么实现文件以 .cpp 结尾，里面不允许使用OC的方法。那么怎么间接调用 OC 方法？写接口好了。实际上 C++ 是调用OC编译过后的 .o 文件。 2.部分 C++ 部分 OC ，实现文件以 .mm 结尾，里面允许直接使用 OC 方法。

##出现的问题及解决思路

刚把包含有 C++ 的代码添加进工程时，毫无例外出现满眼的 error ，甚至之前好好的 OC 代码也跟着犯傻，爆出奇葩的错误。如果你是添加的 .a 库这种的，先打开终端 lipo -info 看看是不是少了什么指令集。如果是纯代码的，那么先把 AppDelagate.m 改为 AppDelagate.mm 看看情况是否好转。如果没有变化，那么继续。

1. 检查是否添加依赖库。例如 libstdc++.6.0.9.dylib 这类的库。
2. 检查 Build Setting 的 Compile Source As Accounting to File Type (网上有说设置为 Objective C++ ，这就说明我每个文件都按照 Objective C++ 的标准编译，某些 OC 类中的方法就可能会报错。)
3. shift + command + k 或许有用。
4. 如果有 pch 文件，看看你的预编译中有没有写 ___OBJC____ 作区分。
5. 混编不要使用 OC 和 C++ 的关键词。
6. 仔细看看混编要点，排查使用到 C++ 的类。

##TODO

平时开发的时候记得常见的error原因，养成好的笔记习惯。



