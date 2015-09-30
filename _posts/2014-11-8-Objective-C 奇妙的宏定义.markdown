---
layout: post
title: "Objective-C 奇妙的宏定义"
date:  2014-11-8
---

ObjC是C的超集，所以自然也就继承了他的宏，本文介绍一些宏定义的示例以及在项目中常用的宏定义。

## 宏定义的好处

首先是能方便管理程序中常量，不需要找来找去还会丢掉。再者可以节省不少代码啊（懒 -. -），提升程序运行效率。

## 宏定义的写法

    #define PI 3.14
    #define kWidth 200
    #define Max(a,b) ((a) > (b) ? (a) : (b))
    
前两个就是简单的定义PI,kWidth的值，第三个定义了一个获取最大值的函数。注意右边需要加括号，宏定义在预编译阶段把宏的内容拷贝到源代码相应位置，因此由于运算符优先级的原因，最后得到的结果可能不是你理想的。
例:

    #define Max(a,b) a > b ? a : b
    int result = Max(5,3) + 1   //result = 5
    
## 宏定义语法

    # ## \
    
    #是将参数转为带双引号的字符串
    #define myprint(str) printf (#str"=%s",str)
    myprint("hah") // "hah"=hah
    
    ##是连接两个参数,生成新的参数名
    #define contact(str) NSObject *_NameSpace##str
    
    \是换行
    
    #ifdef ...  如果定义...   (#if 判断表达式真假)
    #undef ...  解除定义...
    #define ... 定义...
    #endif ...  结束  
    
## 宏定义一些技巧

1.在宏定义中可以引用定义过的宏

2.可以根据程序运行状态自行处理事件

    #ifdef DEBUG
    ...
    #endif 
    
3.避免重复引用头文件

    #ifndef DirectBank_Define_h
    #define DirectBank_Define_h
    
## 常用宏定义
参考自[CocoaChina](http://www.cocoachina.com/industry/20130328/5907.html)

    #define NavigationBar_HEIGHT (44 + 20)
    #define UIScreenWidth [UIScreen mainScreen].bounds.size.width
    #define UIScreenHeight [UIScreen mainScreen].bounds.size.height
    #define Color(R,G,B) [UIColor colorWithRed:(R)/255.0 green:(G)/255.0 blue:(B)/255.0 alpha:1]
    #define IOS_VERSION [[[UIDevice currentDevice]systemVersion]floatValue]
    #ifdef DEBUG
    #define NEED_OUTPUT_LOG    1
    #else
    #define NEED_OUTPUT_LOG    0
    #endif
    //A better version of NSLog
    #if NEED_OUTPUT_LOG
    #define NSLog(format, ...) do {                                             \
    fprintf(stderr, "<%s : %d> %s\n",                                           \
    [[[NSString stringWithUTF8String:__FILE__] lastPathComponent] UTF8String],  \
    __LINE__, __func__);                                                        \
    (NSLog)((format), ##__VA_ARGS__);                                           \
    fprintf(stderr, "-------\n");                                               \
    } while (0)
    #else
    #define NSLog(format, ...)
    #endif
    #if TARGET_OS_IPHONE
    //iPhone
    #endif
    #if TARGET_IPONE_SIMULATOR
    //iPhone Simulator
    #endif
    #if __has_feature(objc_arc)
    //compiling with ARC
    #else
    //compiling without ARC
    #endif
    #define LOADIMAGE(file,ext) [UIImage imageWithContentsOfFile:[[NSBundle mainBundle]pathForResource:file ofType:ext]]
    
## 简化开发流程的宏
参考自[BeeFramework](http://www.bee-framework.com)

    #if __has_feature(objc_instancetype)

	#undef	AS_SINGLETON
	#define AS_SINGLETON

	#undef	AS_SINGLETON
	#define AS_SINGLETON( ... ) \
			- (instancetype)sharedInstance; \
			+ (instancetype)sharedInstance;

	#undef	DEF_SINGLETON
	#define DEF_SINGLETON \
			- (instancetype)sharedInstance \
			{ \
				return [[self class] sharedInstance]; \
			} \
			+ (instancetype)sharedInstance \
			{ \
				static dispatch_once_t once; \
				static id __singleton__; \
				dispatch_once( &once, ^{ __singleton__ = [[self alloc] init]; } ); \
				return __singleton__; \
			}

	#undef	DEF_SINGLETON
	#define DEF_SINGLETON( ... ) \
			- (instancetype)sharedInstance \
			{ \
				return [[self class] sharedInstance]; \
			} \
			+ (instancetype)sharedInstance \
			{ \
				static dispatch_once_t once; \
				static id __singleton__; \
				dispatch_once( &once, ^{ __singleton__ = [[self alloc] init]; } ); \
				return __singleton__; \
			}

    #else	// #if __has_feature(objc_instancetype)

	#undef	AS_SINGLETON
	#define AS_SINGLETON( __class ) \
			- (__class *)sharedInstance; \
			+ (__class *)sharedInstance;

	#undef	DEF_SINGLETON
	#define DEF_SINGLETON( __class ) \
			- (__class *)sharedInstance \
			{ \
				return [__class sharedInstance]; \
			} \
			+ (__class *)sharedInstance \
			{ \
				static dispatch_once_t once; \
				static __class * __singleton__; \
				dispatch_once( &once, ^{ __singleton__ = [[[self class] alloc] init]; } ); \
				return __singleton__; \
			}

    #endif	// #if __has_feature(objc_instancetype)

    #undef	DEF_SINGLETON_AUTOLOAD
    #define DEF_SINGLETON_AUTOLOAD( __class ) \
		DEF_SINGLETON( __class ) \
		+ (void)load \
		{ \
			[self sharedInstance]; \
		}

## 其他宏定义

    #undef DEF_NAVPUSH
    #define DEF_NAVPUSH( __class ) \
    __class * __NAV_##__class = [[__class alloc]initWithNibName:NSStringFromClass([__class class]) bundle:nil]; \
    [self.navigationController pushViewController:__NAV_##__class animated:YES]; \

    #undef DEF_NAVPOP
    #define DEF_NAVPOP \
    [self.navigationController popViewControllerAnimated:YES];

相信你已经可以开发自己的宏了，将常用的方法写成宏吧。
