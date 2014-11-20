---
layout: post
title: 如何使用Masonry简化iOS屏幕适配
keywords: Masonry
category: Masonry
tags: [Masonry]
---

#开源项目[Masonry](https://github.com/Masonry/Masonry)旨在让自动布局（Auto Layout）的代码更简洁，可读性更强。


    Masonry is a light-weight layout framework which wraps AutoLayout with a nicer syntax. Masonry has its own layout DSL which provides a chainable way of describing your NSLayoutConstraints which results in layout code that is more concise and readable. Masonry supports iOS and Mac OS X.
    
Masonry 是一种领域特定语言（DSL），为自动布局的所有功能提供便捷的方法，包括建立和修改约束、存取属性、设置优先级以及调试支持。

##GitHub上的示例代码
我们通过作者给出的代码来详细体会Masonry的典型用法及其简洁的语法。首先你得在需要的类中引入Masonry.h

    //define this constant if you want to use Masonry without the 'mas_' prefix
    #define MAS_SHORTHAND  //方法名和属性名简略写法

    //define this constant if you want to enable auto-boxing for default syntax
    #define MAS_SHORTHAND_GLOBALS  //设置约束的block属性简略写法(自动转换数值类型)

    UIView *view1 = [[UIView alloc]init];
    view1.backgroundColor = UIColor.greenColor;
    view1.layer.borderColor = UIColor.blackColor.CGColor;
    view1.layer.borderWidth = 2;
    [self addSubview:view1];
    
    UIView *view2 = [[UIView alloc]init];
    view2.backgroundColor = UIColor.redColor;
    view2.layer.borderColor = UIColor.blackColor.CGColor;
    view2.layer.borderWidth = 2;
    [self addSubview:view2];
    
    UIView *view3 = [[UIView alloc]init];
    view3.backgroundColor = UIColor.blueColor;
    view3.layer.borderColor = UIColor.blackColor.CGColor;
    view3.layer.borderWidth = 2;
    [self addSubview:view3];
    
    UIView *superview = self;
    int padding = 10;
    
    [view1 makeConstraints:^(MASConstraintMaker *make) {
        make.top.greaterThanOrEqualTo(superview.top).offset(padding);
        make.left.equalTo(superview.left).offset(padding);
        make.bottom.equalTo(view3.top).offset(-padding);
        make.right.equalTo(view2.left).offset(-padding);
        make.width.equalTo(view2.width);
        
        make.height.equalTo(@[view2.height,view3.height]);
    }];
    
    [view2 mas_makeConstraints:^(MASConstrainMaker *make) {
        make.top.equalTo(superview.mas_top).with.offset(padding);
        make.left.equalTo(view1.mas_right).offset(padding);
        make.bottom.equalTo(view3.mas_top).offset(-padding);
        make.right.equalTo(superview.mas_right).offset(-padding);
        make.width.equalTo(view1.mas_width);
        
        make.height.equalTo(@[view1,view3]);
    }];
    
    [view3 mas_makeConstraints:^(MASConstraintMaker *make) {
        make.top.equalTo(view1.mas_bottom).offset(padding);
        make.left.equalTo(superview.mas_left).offset(padding);
        make.bottom.equalTo(superview.mas_bottom).offset(-padding);
        make.right.equalTo(superview.mas_right).offset(-padding);
        
        make.height.equalTo(@[view1.mas_height,view2.mas_height]);
    }];
    
代码中使用了makeConstraints和mas_makeConstraints方法，其实是一种方法，前者是后者的简略写法，如果想使用前者，就必须在引入Masonry.h前define MAS_SHORTHAND，不然不起效果。同样top和mas_top也是如此。下面我们分析makeConstraints方法。

*相似的方法还有updateConstraints，remakeConstraints*

    -(NSArray *)mas_makeConstraints:(void(^)(MASContraintMaker *))block {
        //使用Auto Layout前必须关闭AutoresizingMask
        self.translatesAutoresizingMaskIntoConstraints = NO;
        MASConstraintMaker *constraintMaker = [[MASConstraintMaker alloc]initWithView:self];
        //添加约束
        block(constraintMaker);
        //开始布局
        return [constraintMaker install];
    }
    
这段代码的用处就是将block中设置的约束进行初始化，install中的方法即是调用系统Auto Layout方法，因此我们只要关心block块中方法即可。

让我们回顾下经典设置frame方法

    self.view.frame = CGRectMake(<#CGFloat x#>, <#CGFloat y#>, <#CGFloat width#>, <#CGFloat height#>);
    
frame中使用了四个属性控制view的形状和位置，这在iPhone4s的时代还没有多大的问题。随着iPhone屏幕的增大，特别是iPhone6屏幕宽度的增加，你会发现在iPhone5上运行好好的项目在iPhone6上右边就会空出一小块。那么就必须再加两个属性一起来控制

Masonry设定了六个属性:top, left, bottom, right, width, height 

待续...
    
    

