---
layout: post
title: 关于 Xcode 的 Build Settings
date: 2015-10-1
---

官方文档 [Xcode Build Setting Reference](https://developer.apple.com/library/mac/documentation/DeveloperTools/Reference/XcodeBuildSettingRef/1-Build_Setting_Reference/build_setting_ref.html#//apple_ref/doc/uid/TP40003931-CH3-SW105) 有介绍构建设置每个项的含义。这里我主要挑选几个使用比较多的作分享。

####1.证书和描述文件
证书和描述文件是我们平时使用最多的，特别是带有 today 或者 watch 的项目，配置一套尤为烦人。在团队开发中，会存在更新项目后需要重新配置描述文件的问题。其实这里有个简单的方法。
(1) 在开发者中心配一套描述文件(特指带 today 或者 watch 的)，例如 com.wutongr.healthTip、com.wutongr.healthTip.watchkitextension、com.wutongr.healthTip.watchkitapp(针对 watch os1，os2规则有变)，再配一个com.wutongr.healthTip.*。在 Project 中配置这个描述文件。其他 Target 使用 Project 的配置(如果 Target 这项是粗体，那么选中这项按 Delete )。这样在编译过程中 Xcode 会自动在本地找满足需求的描述文件，而我们只需要改动 Project 中的项即可。

(2) 一人下载全部描述文件，共享给团队其他人。不够灵活。
 
####2.项目需要打出不同渠道的包
*配置 Configurations*

![image](/assets/img/configurations.png)

####3.自定义配置项
(1) 如同 CocoaPods 加入 xcconfig 文件

*GCC_PREPROCESSOR_DEFINITIONS = $(inherited) COCOAPODS=1
HEADER_SEARCH_PATHS = "${PODS_ROOT}/Headers/Public" "${PODS_ROOT}/Headers/Public/AFNetworking" "${PODS_ROOT}/Headers/Public/BlocksKit" "${PODS_ROOT}/Headers/Public/MMDrawerController" "${PODS_ROOT}/Headers/Public/Masonry" "${PODS_ROOT}/Headers/Public/ReactiveCocoa" "${PODS_ROOT}/Headers/Public/ReactiveViewModel" "${PODS_ROOT}/Headers/Public/RegexKitLite" "${PODS_ROOT}/Headers/Public/SDWebImage"*

Build Settings 中的项对应关系是 HEADER_SEARCH_PATHS <-> Header Search Paths
在 Build Settings 中使用时按照 ${HEADER_SEARCH_PATHS} 的规则。

(2) 配置 User-Defined 项

####4.加载静态库中的 Category
*在 Other Linker Flags 中加入 -Objc*

####5.设置预编译宏
*在 Preprocessor Macros 中配置，例如在 Debug 中配置 DEBUG=1，可以在QA 中配置 QA=1，在项目代码中可以用来判断编译环境*

		#if defind(QA)
		#endif

####6.Enable Bitcode 项
*iOS9 新加入项，对于某些第三方库可能还不支持，需要设置为 No*

####7.Search Paths
Framework Search Paths

  *加载 .framework 路径*
  
Header Search Paths

  *加载头文件,有时候 openSSL 会报头文件找不到，这时应该检查路径是否正确。*
  
Library Search Paths

  *加载 .a 路径*
  
可以参考 [Clarify different Search Paths](http://stackoverflow.com/questions/8342982/ios-clarify-different-search-paths)
