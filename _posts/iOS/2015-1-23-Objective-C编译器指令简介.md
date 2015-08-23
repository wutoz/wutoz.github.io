---
layout: post
title: Objective-C 编译器指令简介
keywords: 编译器指令
category: 编译器指令
tags: [编译器指令]
---

*@class*

声明某个类但不需要引入头文件

    @class TempClass
    
获取某个类
    
    NSString *ClassName = @"TempClass";
    Class c = @class(TempClass); ❌
    Class c = [TempClass class]; ❓
    Class c = NSClassFromString(ClassName); ✔️
    
*@end*

类,协议或者接口结束标示

*@protocol @required @optional* 

协议的开始

    @protocol TempProtocol <aProtocol,anotherProtocol>
    
获取某个协议

    Protocol *aProtocol = @protocol(TempProtocol);

协议中方法分为必选和可选

    @required
    -(void)method1;
    
    @optional
    -(void)method2;

判断使用协议的类是否响应方法

    [object respondsToSelector:@selector(method2)];

*@interface @public @package @protected @private @property*

标示类或者分类的开始,objc的类基本都是直接间接的继承自NSObject类,我们使用@interface来声明某个类符合某个协议

    @interface TempClass:SuperClass<aProtocol,anotherProtocol>{
    @public
    //instance variables
    @package
    //instance variables
    @protected
    //instance variables
    @private
    //instance variables
    }
    //property declarations
    @property (atomic, readwrite, assign) id aProperty;
    //public instance and/or class method declarations
    @end
    
*Category*

分类(非正式协议)

    @interface TempClass(CategoryName)<aProtocol,anotherProtocol>
    
在*.m*文件中如果声明的方法是私有的,可以省略CategoryName。(扩展)

*assign(default),retain,copy*

*atomic(default),nonatomic*

*weak(default),strong*

*@selector*

返回SEL类型的objc方法，如果方法没有声明或者不存在，那么编译器会发出警告。

    -(void)aMethod{
        SEL aMethodSelector = @selector(aMethod);
        [self performSelector:aMethodSelector];
    }

*@implementation* 

标示某个类或者分类实现的开始

*@synthesize* 

自动生成属性的实例变量和setter/getter方法

    @synthesize aProperty = _aProperty;

*@dynamic*

用以修饰的属性会在程序运行时动态绑定setter和getter方法

    static NSString * const stockCodeHandler = @"stockCodeHandler";
	static NSString * const stockMarketHandler = @"stockMarketHandler";
	
	@implementation UIButton (stockButton)
	
	@dynamic stockCode;
	@dynamic stockMarket;
	
	-(void)setStockCode:(NSString *)stockCode{
	    objc_setAssociatedObject(self, (__bridge const void *)(stockCodeHandler), stockCode, OBJC_ASSOCIATION_COPY_NONATOMIC);
	}
	
	-(void)setStockMarket:(NSString *)stockMarket{
	    objc_setAssociatedObject(self, (__bridge const void *)(stockMarketHandler), stockMarket, OBJC_ASSOCIATION_COPY_NONATOMIC);
	}
	
	-(NSString *)stockCode{
	    return objc_getAssociatedObject(self, (__bridge const void *)(stockCodeHandler));
	}
	
	-(NSString *)stockMarket{
	    return objc_getAssociatedObject(self, (__bridge const void *)(stockMarketHandler));
	}
	
	-(void)dealloc{
	    objc_removeAssociatedObjects(self);
	}
	@end
	
	-(void)btnClick:(UIButton *)sender{
        NSLog(@"%@,%@",sender.stockCode,sender.stockMarket);
    }

*@synchronized*

线程锁
 
     -(void)aMethodWithObject:(id)object{
         @synchronized(object){
             //code that works with locked object
         }
     }

*@throw @try @catch @finally*

捕获异常,objc用的少,c#,java使用的多。objc一般使用NSError来处理错误。出于效率考虑。

    @try {
        NSException *exception = [NSException exceptionWithName:@"ExampleException" reason:@"In your face!" userInfo:nil];
        @throw exception;
    }
    @catch (NSException *exception) {
        //Handle an exception thrown in the @try block
    }
    @finally {
        //Code that gets executed whether or not an exception is thrown
    }

*@autoreleasepool*

自动释放池,比原来NSAutoreleasePool快六倍(真的假的...)

    @autoreleasepool{
        //code
    }

*@encode*

返回类型的符号

    char *x = @encode(int);
    char *y = @encode(@selector(aMethod)); //y = ":"
    if(x = "i"){
        
    }

*@compatibility_alias*

用于给某个类起别名,这样你就可以使用别名来调用这个类

    @compatibility_alias AliasClassName ExistingClassName
