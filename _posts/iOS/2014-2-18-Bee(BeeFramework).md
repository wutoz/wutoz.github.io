---
layout: post
title: Bee(BeeFramework) 用户指南 v1.0
keywords: BeeFramework
category: BeeFramework
tags: [BeeFramework]
---

##Geek们都在用!

你自认为是GEEK吗？燃烧起来吧！
在时间成本、学习成本、开发成本同时兼顾的情况下，BEE是最好的RAD开发选择。

##欢迎使用Bee

Bee是一套给iOS开发者使用的应用程序“快速”开发框架，它集成了基于COCOA TOUCH的很多扩展组件，并提供简洁（稍有些抽象）的接口，其目的是让开发人员可以"快速"地进行项目开发（不管您是接外包也好，还是给投资人演示DEMO也好，都将是第一选择）。
Bee一来弥补COCOA TOUCH部分缺失功能，二来简化实现并减少代码量，使您可以全身心投入到创造性开发上去。

##Bee是为谁准备的？

 你需要一个小巧的框架
 你需要短时间内快速开发DEMO
 你喜欢把代码写的简单有条理
 你需要完整、清晰的文档
 你讨厌复杂的设计
 你讨厌被迫理解IOS潜规则
if ( 满足以上任何一条 ) echo '恭喜您，继续往下读';

##基本要求

 您大概了解ObjectiveC是个啥东西。
 您大概了解CocoaTouch是个啥东西。
 您大概了解MVC、View、ViewController是个啥东西。
if ( 满足以上任何一条 ) echo '恭喜您，继续往下读';

##Bee是什么

Bee是英文蜜蜂的意思 :-)
Bee是项目代号，寓意着“清晰，灵活，高效，纯粹”。


##Bee是应用程序框架

这此略去N字

##Bee是免费的
Bee 是经过MIT开源许可授权的，可以不经过作者的同意，进行传播、修改、再发布，以及商业化，完全不存在任何法律问题，请放心使用。

##Bee是轻量级的

非常轻量。其中基础类库可选择性的使用，M-V-C也可选择性使用，其核心部分只有很少量的代码
。
##Bee是快速的

非常快速。经过多个项目测试，没有因为封装而在效率上受影响，我们尽可能的保持快速。

##Bee使用M-V-C模型

在使用Bee的同时，您会自觉的将界面与逻辑分离开来。
最大化复用逻辑，最大化用多布局来LAYOUT具有相同元素的界面。
M: Model，数据持久化或数据Cache都在这里
C: Controller，业务逻辑或与云端交互逻辑都在这里
V: View + ViewController，界面展示及界面逻辑都在这里

##Bee使用干净的VIEW结构
Bee通过轻度的封装，将原本复杂繁重的UI开发工作细化为3部分：View、Layout、Data，可以想像成WEB开发中的HTML、CSS、数据。通过“数据加载或变化时重绘”的机制，简化代码逻辑，开发者只需要知道什么时候给View填充数据即可，计算布局由Bee搞定。
在一些互联网公司中，他们的产品经常需要重构UI的，这往往给IOS开发人员带来很大困扰。我想用interface builder快速开发DEMO，又不想写死坐标，如果动态计算，或将来更换布局，我该怎么办？
Bee给您一套简单可行的方案，最常用的，也是建设UI最主要用到的控件是“单元格”，类名叫做BeeUIGridCell，其分别需要开发者其实3个方法（随后章节会细讲）也是3个步骤：

“计算画布大小” cellSize:bound:
“计算内部布局” cellLayout:bound:
“填充数据（字符串图片等）” bindData:

通过简单实现3个函数，满足各种UI变化的需求。
同时，这套所谓“简单可的方案”也不失灵活性，一个BeeUIGridCell可对应多个布局，在不改变逻辑和增减内部元素的情况下，快速完成UI调整。

下面举个例子说明“单元格”及布局（后面章节中会详细介绍）：

    -- xxxView.h
    // 布局1
    @interface MyLayout1 : NSObject
    AS_SINGLETON(MyLayout1)
    @end
    // 布局2
    @interface MyLayout2 : NSObject
    AS_SINGLETON(MyLayout2)
    @end
    @interface MyCell : BeeUIGridCell
    {
    UILabel * _subView1;
    UILabel * _subView2;
    }
    @end
    -- xxxView.mm
    @implementation MyLayout1
    + (CGSize)cellSize:(NSObject *)data bound:(CGSize)bound
    {
    return CGSizeMake( bound.width, 90.0f ); // 宽不变，高为90
    }
    - (void)cellLayout:(BeeUIGridCell *)cell bound:(CGSize)bound
    {
    _subView1.frame = …;
    _subView2.frame = …;
    }
    - (void)bindData:(NSObject *)data
    {
    _subView1.text = …;
    _subView2.text = …;
    [super bindData:data]; // Bee会判断数据是否变了，然后重算布局
    }
    @end
    ...
    {
    MyCell * cell = [[MyCell alloc] init];
    if ( ... )
    cell.layout = [MyLayout1 sharedInstance];
    else
    cell.layout = [MyLayout2 sharedInstance];
    }
    -- xxxViewController.mm
    {
    MyCell * cell = ...;
    [cell bindData:[NSDictionary dictionary]]; // 方式1，自动布局
    [cell layoutAllSubcells]; // 方式2，手动布局
    }
    
您可能会问：刚刚讲了，我们有了”HTML、CSS、数据”，那么JS哪去了？事件怎样传递和被处理？
您有两个选择，一个是传统的Delegate方式，另一种是新引入的UISignal。
两种机制本质上是做相同的事情，不过后者采用更聪明简单的方式完成多层UIView之间传事件。

再来个例子说明UISignal（后面章节中会详细介绍）：

    -- xxxView.h
    @interface MyCell : BeeUIGridCell
    AS_SIGNAL( TEST ) // 声明SIGNAL
    @end
    -- xxxView.m
    @implementation MyCell
    DEF_SIGNAL( TEST ) // 定义SIGNAL
    - (void)someEvent
    {
    [self sendUISignal:MyCell.TEST]; // 发送Signal
    }
    @end
    -- xxxViewController.m
    - (void)loadView
    {
    MyCell * cell = [[MyCell alloc] init];
    [self.view addSubview:cell];
    }
    - (void)handleUISignal:(BeeUISignal *)signal
    {
    if ( [signal is:MyCell.TEST] )
    {
    // do something
    }
    [super handleUISignal:signal]; // pass to super view
    }
    
 可以看到，只要存在UIView的层级关系当中，就可以从子级向上透传UISignal。
而定义方法也极其简单明了，AS/DEF_SIGNAL()即可。
更多细节在后面章节介绍，许多看起来复杂华丽的UI实现，在Bee的支撑下，代码变及清晰简单。
问：想想怎样把你的界面拆成若干个Cell？怎样把Delegate替换成Signal？

##Bee使用干净的CONTROLLER结构
相对于View，Controller是存放逻辑的地方，往往是大家所说的看不见的部分，被称为“业务逻辑”。
怎样有效的组织业务逻辑，怎么有效的复用业务逻辑，又使之与VIEW最大程度解耦合？
Bee将Controller与View完全分离，通过Message（消息机制）通讯，并自动消息路由，且逻辑的执行大多是异步的，而且额外负责与云端（服务器）的通讯。
那么您可以这样理解：

1. View只是个数据的Formatter，管理数据显示成什么样子，偶尔产生一些用户事件。
2. Controller只是负责执行逻辑（即便是在服务器端执行），并把结果（数据）返回给View去显示。
这样理解，我们就懂了，原来作者所说的就是View是HTML+CSS，Controller是AJAX。
或者说Controller是云端逻辑在客户端中的代理，请求需要时间，所以是异步。

<!--举例说明消息及控制器怎样用（后面章节中会详细介绍）：-->


<!--    -- xxxController.h-->
<!--    @interface MyController : BeeController-->
<!--    AS_MESSAGE( TEST ) // 声明消息-->
<!--    @end-->
<!--    -- xxxController.mm-->
<!--    @implementation MyController-->
<!--    DEF_MESSAGE( TEST ) // 定义消息-->
<!--    - (void)TEST:(BeeMessage *)msg-->
<!--    {-->
<!--    if ( msg.sending ) // 正在发送时-->
<!--    {-->
<!--    NSString * param1 = [msg.input objectForKey:@"param1"];-->
<!--    NSString * param2 = [msg.input objectForKey:@"param2"];-->
<!--    // Controller通过Message向某网站请求数据-->
<!--    [msg POST:@"http://api.XXX.com/" data:...];-->
<!--    }-->
<!--    else if ( msg.progressed ) // 发送/接收进度更新时-->
<!--    {-->
<!--    }-->
<!--    else if ( msg.succeed ) // 成功时-->
<!--    {-->
<!--    NSDictionary * obj = [msg.response objectFromNSData]; // 解析回应包-->
<!--    if ( nil == obj )-->
<!--    {-->
<!--    [msg setLastError:... domain:...]; // 异常情况，做点什么-->
<!--    return;-->
<!--    }-->
<!--    [msg output:@"result", obj, nil]; // 输出结果-->
<!--    }-->
<!--    else if ( msg.failed ) // 错误时-->
<!--    {-->
<!--    }-->
<!--    else if ( msg.cancelled ) // 取消时-->
<!--    {-->
<!--    }-->
<!--    }-->
<!--    -- xxxViewController.mm-->
<!--    ....-->
<!--    {-->
<!--    // MyController自动初始化及挂接到Bee内核-->
<!--    [MyController sharedInstance];-->
<!--    }-->
<!--    ....-->
<!--    {-->
<!--    // 在你代码任意位置可以发送消息，它会自动路由到MyController::TEST方法中去-->
<!--    [[self sendMessage:MyController.TEST] input:-->
<!--    @"param1", @"value1", // 输入参数1-->
<!--    @"param2", @"value2", // 输入参数2-->
<!--    nil];-->
<!--    }-->
<!--    ....-->
<!--    - (void)handleMessage:(BeeMessage *)msg-->
<!--    {-->
<!--    if ( [msg is:MyController.TEST] )-->
<!--    {-->
<!--    [self showLoading:msg.sending]; // 更新界面状态-->
<!--    if ( msg.succeed )-->
<!--    {-->
<!--    // 提示成功-->
<!--    }-->
<!--    else-->
<!--    {-->
<!--    // 提示失败-->
<!--    }-->
<!--    }-->
<!--    }-->
    
<!--可以看到，View与Controller完全分离，消息的发送和接收也是非常简单的事情。-->
<!--而定义方法也极其简单明了，AS/DEF_MESSAGE()即可。-->

<!--更多细节在后面章节介绍。-->

问：想想你的APP应该有几个Controller，以及应该分别有几个Message？

##Bee使用干净的MODEL结构
很简单，详见Bee_Model.h，未来会对ActiveRecord支持。

##Bee功能强大
调试功能，性能监测，网络异步交互，多线程，Foundation扩展，UIView扩展等等。

##Bee深入国内顶尖互联网公司
Geek们都在用！行业内N家顶级互联网公司在采用。

#Bee速记表

    .Foundation
    .Cache
    BeeFileCache - 文件缓存
    BeeMemoryCache - 内存缓存
    .Network
    BeeRequest - 网络请求
    .Debug
    BeeCallFrame - 调用栈
    BeeRuntime - 运行时
    BeePerformance - 性能测试
    .FileSystem
    BeeSandbox - 沙箱
    .Utility
    BeeLog() / CC - 日志
    BeeSystemInfo - 系统信息
    .Thread
    BeeTaskQueue - 多线程执行队列
    .MVC
    .Controller
    BeeMessage - 消息
    BeeMessageQueue - 消息队列
    BeeController - 控制器
    .Model
    BeeModel - 数据模型
    .View
    .UI
    BeeUIScrollView - 横向/纵向滚动列表
    BeeUIPageControl - 页码
    BeeUINavigationBar - 导航条
    BeeUIActionSheet - 弹出菜单
    BeeUIActivityIndicatorView - 加载指示器
    BeeUIAlertView - 弹出对话框
    BeeUIButton - 按钮
    BeeUIDatePicker - 日期选择器
    BeeUIFont - 字体
    BeeUIGridCell - 单元格
    BeeUIImageView - 图片
    BeeUIKeyboard - 键盘
    BeeUILabel - 标签
    BeeUIOrientation - 界面方向
    BeeUIProgressView - 进度条
    BeeUIPullLoader - 下拉刷新
    BeeUISegmentedControl - 分段指示器
    BeeUISignal - 信号
    BeeUITabBar - Tab菜单
    BeeUITextField - 单行文本框
    BeeUITextView - 多行文本框
    BeeUIWebView - 网页
    BeeUIZoomView - 缩放
    .UIController
    BeeUIBoard - 白板(UIViewController)
    BeeUIStack - 白板堆栈(UINavigationController)
    BeeUIStackGroup - 堆栈组
    BeeUICameraBoard - 照相机
    BeeUIFlowBoard - 瀑布流
    BeeUITableBoard - Table
    BeeUIWebBoard - 浏览器

Bee设计和架构目标

1. 低耦合。从Bee的整体架构上来看，M、V、C完全分离，互不依赖。
2. 高内聚。Bee的每个文件，都有其专属的功能，每个类都有其文件内独立的功能实现。

Bee基本流程图
实际开发中，MVC有5种组合模式（其中变种模式，与MOVE模式近似）。

模式1 - VC (View->Controller)
User --> View -signal-> UIBoard ..message..> Controller ...> Cache/Server
^ .
| .
|--------------------- UIBoard <..message.. Controller <..data....
---> 同步
...> 异步

1. User(用户)触发一个点击事件，传递给某View(控件)。
2. View(控件)发送一个UISignal给顶层的UIBoard(白板)。
3. UIBoard(白板)向Controller(控制器)发送一个消息。
4. Controller(控制器)执行逻辑，向Cache或Server查询新数据，返回给UIBoard(白板)。
5. UIBoard(白板)收到消息响应并带了数据回来，显示显示给用户。

模式2 - VMC (View->Model->Controller)
User --> View -signal-> UIBoard --> Model ..message..> Controller ...> Server
^ .
| .
|--------------------- UIBoard <-- Model <..message.. Controller <..data..
---> 同步
...> 异步

1. User(用户)触发一个点击事件，传递给某View(控件)。
2. View(控件)发送一个UISignal给顶层的UIBoard(白板)。
3. UIBoard(白板)向Model(模型)要数据。
4. Model(模型)向Controller(控制器)发送一个消息。
5. Controller(控制器)执行逻辑，向Cache或Server查询新数据，返回给Model(模型)。
6. Model(模型)再把数据返回给UIBoard(白板)。
5. UIBoard(白板)收到新数据，显示显示给用户。

模式3 - VCM (View->Controller->Model)
User --> View -signal-> UIBoard ..message..> Controller --> Model ...> Server
^ | .
| | .
|--------------------- UIBoard <..message.. Controller <-------- <..data..
---> 同步
...> 异步

1. User(用户)触发一个点击事件，传递给某View(控件)。
2. View(控件)发送一个UISignal给顶层的UIBoard(白板)。
3. UIBoard(白板)向Controller(控制器)发送一个消息。
4. Controller(控制器)执行逻辑，并控制向Model或云端查询数据，返回给UIBoard(白板)。
5. UIBoard(白板)收到消息响应并带了数据回来，显示显示给用户。

模式4 - VM (View->Model)
User --> View -signal-> UIBoard --> Model ...> Server
^ | .
| | .
|--------------------- UIBoard <------ <..........
---> 同步
...> 异步
这里Model角色并不显示，可以充当本地数据提供者，也可以充当Controller + Cache/Server封装的角色，从而变为本地及云端两者的代理，开发者忽略相关细节，只管向Model要数据即可，后面章节会讲。

模式5 - V (View)
User --> View -signal-> UIBoard
^ |
| |
|--------------------------
---> 同步
...> 异步
这种模式里，所有数据及逻辑都由UIViewController来处理。

模式6 - 开个玩笑：）
User ----
^ |
| |
|-------
O_O，what's this?

#Bee怎么来的
（此处纯属废话，不看可以略过）

从我入职腾讯开始说起，08年的时候通过内部推荐形式，我加入了腾讯北京分公司的无线产品部（简称无产部）。
当初腾讯北京在终端开发领域积累不多，团队也刚刚组建，所涉及的平台仅仅只有SYMBIAN，KJAVA及MTK。
而在我加入之后，所接手的就一个项目就是在MTK平台上面实现手机QQ音乐。
说实话，当初对手机APP开发的认识也是在混沌状态，只知道基于MTK平台的固定思维模式套用CATEGORY（界面模版）。
而幸运的是，腾讯有着不错的技术氛围与分享文化，就在加入腾讯不久，我们领导组织了一次关于移动开发中MVC的讲座。
会上我了解到，除了后台开发可以用MVC之外，终端开发也同样适用，而且会大大改进开发效率优化代码结构。
从此，走上了令人着魔的MVC不归路⋯⋯
（⋯⋯刚跑题了）
在MTK平台PURE-C环境下，我第一次尝试了使用MVC模式设计整体架构，终于⋯⋯
经过各种加班到后半夜坚持了2个月的情况下，我们在MTK平台上有了纯C的MVC框架一枚。
基本套路就是：分4个部分，存储、业务逻辑、界面逻辑、界面模版，按照这种架构来垂直划分每一个产品需求。
有了PURE-C环境下MVC的实践经验，接着又搞了很多项目，如：QQ影院，QQ斗地主，QQ空间，QQ游戏大厅⋯⋯等等。
其间，同时兼职开发、架构师、项目经理（各种累），在务实与务虚之间游荡的同时，务出了一个道理。
MVC是用来做什么的？？架构是个什么东西？？什么是架构师？？
用一句话来讲，MVC是架构上直接可套用的一种实现方式，最终目的是为了明确边界，并让多人可以并行工作。
因此，涉及到框架、架构两个主题时，自认为是架构师的同学（特别是前端类），必须要解决的问题就是并行。
运用MVC最多的项目是手机QQ空间及QQ游戏大厅，一个项目大致只有3个人左右，每个人都需要至上到下理解软件整体架构。
我们的工作认领方式从原始的”一人写引擎一个写界面”优化到”每人专注写自己需求范围内的数据库、业务逻辑、界面逻辑、以及UI和动画”，每人垂直一线，因此成长很快，学到的东西多，减少不必要的沟通，工作效率各种提升。
日积月累，在QQ空间项目接手半年多之后，总结出了一套框架，本想一来体现团队价值，二来以备服务于全公司。
但当时不巧，因为个人原因，我离开了腾讯。在反复思考人生之后，开始了一段时间的创业之路。
就在那时那刻，我发觉国内以及国外还没有成熟的开源MVC框架（当然是指IOS），所以我开始基于以往的技术储备开始BEE。
（最初BEE不叫BEE，而是用了某人的生日Jun21当做代号，后来伤心就改了代号，就叫了现在的名字）
8月的时候，代码重新进行整理，全部加上了BEE前辍，有了第一个版本。
9月的时候，用BEE框架帮助几个合作伙伴实现了他们APP。
10月的时候，正式有些开发者下载并与我们接触。
之后，我们准备正式上线网站，并开始TOP100开源计划。并决心持续维护并坚持开源的事业。

##Bee将从这里开始
注意：在学习Bee之前，确认您已下载Bee示例工程，打开并正常运行。

组建基于BEE的工程
启动Xcode，通过File->New->Project创建COCOA TOUCH工程，接下来：

1. 修改工程文件，添加Framework: 参考DEMO工程，添加所依赖的framework。
2. 修改预编译文件(.pch):
3. 
  (1)#define \_\_BEE_DEVELOPMENT\_\_ (1) // 是否DEBUG模式

  (2)#define \_\_BEE_LOG\_\_ (1) // 是否输出LOG
  
  (3)#define \_\_BEE_DEBUGGER\_\_ (1) // 是否显示Debugger小虫子
  
  (4)在.h/.m中包括BEE头文件 #import "bee.h"

4. 编译运行
开始动手前，应该理解的东西
单件 Singleton
当你需要定义一个全局唯一的单件时，我们提供了简单的实现方式。
定义时，请遵守编码规范


    @interface MyClass : BaseClass
    AS_SINGLETON( MyClass );
    @end
    @implementation MyClass
    DEF_SINGLETON( MyClass );
    @end
    
引用时，请遵守编码规范

    [[MyClass sharedInstance] doSomething];
    
静态属性 StaticProperty
当你想在某些Class中像JAVA一样定义静态变量时，我们提供了简单的实现方式。
静态属性对于Class内部是唯一的，配合Class.PropertyName就是全局统一的，实质上是NSString。
定义时，请遵守编码规范

    @interface MyClass : BaseClass
    AS_STATIC_PROPERTY( HELLO );
    @end
    @implementation MyClass
    DEF_STATIC_PROPERTY( HELLO );
    @end
    
引用时，请遵守编码规范

    NSLog( @"property = %@", MyClass.HELLO );
    
前几节提到的Signal及Message的定义，也是基于StaticProperty实现的，具体详见代码。
UI信号 UISignal
是否会遇到这样的问题？为了透传某事件，A setDelegate给 B，B setDelegate给 C，...。
苹果推荐的Delegate方式在实际开发过程中显得繁琐，当工程庞大时，维护成本颇高，且不易读。
最讨厌的是，每个人的命名风格都不一样，很难去找到对应关系。
BeeUISignal是Delegate替代品，配合StaticProperty及相关send方法，达到view向viewController的事件传递目的，同时解决以上面提到的问题。
注意：
UISignal是类唯一的，也就是说MyView.TOUCHED与MyAnotherView.TOUCHED是两个不同的SIGNAL。
定义时，请遵守编码规范

    @interface MyView : UIView
    AS_SIGNAL( TOUCHED );
    @end
    @implementation MyView
    DEF_SIGNAL( TOUCHED );
    @end
    
这里AS_SIGNAL、DEF_SIGNAL请避免使用英文大写“SIGNAL”做为名称，此为Bee系统保留名字。
建议起一些能被看懂的名字，比如：

    AS_SIGNAL( TOUCHED )
    AS_SIGNAL( WILL_XXX )
    AS_SIGNAL( DID_XXX )
    AS_SIGNAL( RELOADED )
    AS_SIGNAL( CHANGED )
    
这样看起来会很自然，符合人类的语言习惯。

    xxxView.TOUCHED
    xxxView.WILL_XXX
    xxxView.DID_XXX
    ...
    
发送时，请遵守编码规范

    @implementation MyView
    ...
    {
    [self sendUISignal:MyView.TOUCHED];
    [self sendUISignal:MyView.TOUCHED withObject:...];
    [self sendUISignal:MyView.TOUCHED withObject:... from:...];
    }
    @end
 
响应时，请遵守编码规范
如果需要响应，你重载以下方法:

    - (void)handleUISignal:(BeeUISignal *)signal
    {
    [super handleUISignal:signal];
    // your codes here
    }
    

注意：

1. 一定要写[super handleUISignal:signal]。
2. NSObject已经有一个默认实现，因此你没写，那么Bee帮你自动转发signal。
类别及相关判断方法
BeeUISignal有两个常用的方法：
判断名称 is:
判断类别 isKindOf:
每个View/ViewController有一个默认的.SIGNAL定义，通常用来判断类别。
引用方法：
MyView.SIGNAL
MyViewController.SIGNAL

<!--举个简单的例子，比如:-->


<!--    - (void)handleUISignal:(BeeUISignal *)signal-->
<!--    {-->
<!--    if ( [signal isKindOf:MyView.SIGNAL] )-->
<!--    {-->
<!--    if ( [signal is:MyView.TOUCHED] )-->
<!--    {-->
<!--    // 我知道了signal是从MyView发送过来的，意思是被点击了-->
<!--    }-->
<!--    }-->
<!--    }-->

路由机制：
TODO

编写第一个界面

俗话说：“万事开头难”，我们先从简单的开始，先学习一下如何编写第一个界面。

了解UISignal

什么是BeeUIBoard

在Bee的世界里，你基本用不上UIViewController这么复杂的东西，取而代之的是BeeUIBoard。
起初，只做为VC简单封装，当做画板用，所以起名叫做Board。
随着后续项目越来越多，重复代码也越写越多，就决心改造REPEAT YOURSELF的烂代码架构。
主要对比UIViewController相比有以下几点改进：

1. 单一入口：方法只有一个handleUISignal。
2. 状态驱动：在什么时间做什么事，BeeUIBoard描述的很清楚，按章办事，不必关注IOS技术细节。
3. 简单易记：如 viewDidUnload 对应 BeeUIBoard.DELETE_VIEWS，是不是很好记？
4. 集中管理：所有子VIEW的响应事件，都在 UIBoard handleUISignal 集中处理。
5. 
初识BeeUIBoard

打开Lession1源码，可以看到有两个文件Lession1Board.h/.m。
（这里我简化了一些）

    -- Lession1Board.h
    @interface Lession1Board : BeeUIBoard
    @end
    -- Lession1Board.m
    @implementation Lession1Board
    - (void)handleUISignal:(BeeUISignal *)signal // 单入一口，集中管理
    {
    [super handleUISignal:signal];
    if ( [signal isKindOf:BeeUIBoard.SIGNAL] )
    {
    if ( [signal is:BeeUIBoard.CREATE_VIEWS] ) // 状态驱动，简单易记
    {
    }
    else if ( [signal is:BeeUIBoard.DELETE_VIEWS] )
    {
    }
    else if ( [signal is:BeeUIBoard.LAYOUT_VIEWS] )
    {
    }
    ...
    }
    }
    @end
    
理解BeeUIBoard

按照APPLE的套路，一个UIViewController的生命周期大概是这样的：
-> init
-> loadView -> viewDidLoad
-> viewWillAppear -> viewDidAppear
-> viewWillDisappear -> viewDidDisappear
-> viewDidUnload
-> dealloc
这个流程里我们还没考虑到内存不足的情况，以及加载数据及CACHE等业务逻辑的情况。
在VC繁琐的流程背后，是一个强大而复杂的UI状态机，驱动着UIViewController控制VIEW的生存及显示。
基于BeeUISignal技术，BeeUIBoard得以简化了流程，抽象出状态机，使用BeeUISignal机制实现。

相关SIGNAL有下面这些：

AS_SIGNAL( CREATE_VIEWS ) // 创建视图

AS_SIGNAL( DELETE_VIEWS ) // 释放视图

AS_SIGNAL( LAYOUT_VIEWS ) // 布局视图

AS_SIGNAL( LOAD_DATAS ) // 加载数据

AS_SIGNAL( FREE_DATAS ) // 释放数据

AS_SIGNAL( WILL_APPEAR ) // 将要显示

AS_SIGNAL( DID_APPEAR ) // 已经显示

AS_SIGNAL( WILL_DISAPPEAR ) // 将要隐藏

AS_SIGNAL( DID_DISAPPEAR ) // 已经隐藏

AS_SIGNAL( ORIENTATION_CHANGED ) // 方向变化

AS_SIGNAL( BACK_BUTTON_TOUCHED ) // NavigationBar左按钮被点击

AS_SIGNAL( DONE_BUTTON_TOUCHED ) // NavigationBar右按钮被点击

新的BeeUIBoard生命周期如下：

CREATE_VIEWS

-> LAYOUT_VIEWS

-> LOAD_DATAS

-> WILL_APPEAR -> DID_APPEAR

-> WILL_DISAPPEAR -> DID_DISAPPEAR

-> DELETE_VIEWS

-> FREE_DATAS

当内存不足时，BeeUIBoard会自动发送DELETE_VIEWS、FREE_DATAS信号，以提醒开发者应该释放内存。当再次进入被释放的Board时，BeeUIBoard会与初始化时相同的顺序发送CREATE_VIEWS、LOAD_DATAS信号，以在正确的时刻重新创建VIEW。
 
//所有逻辑执行起来都像是同步的
