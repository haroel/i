* date:`1493022893817`
* title:`Cocos creator Acition 重构`
* tags:`cocos` `creator` `js`

----

## Cocos Action介绍

cocos2d-x的Action框架强大而丰富,其Action系统的核心在于继承和组合使用。
由于creator是一个以cocos2d-x为基础的框架,这些核心特性也被完全保留了下来。

    * cocos里面使用Action的方法。
    this.node.runAction(cc.moveTo(1.0,cc.v2(100,100)));

    如果要修改Action本身的行为,那么就需要对Action进行组合或者包装操作。
    * 如果要把Action加速,要重新修改
    this.node.runAction(cc.speed( cc.moveTo(1.0,cc.v2(100,100)) ,2.0);
    // 注意cc.speed会返回一个新的Action
    // 此处还有一个疑问,我想在运行一半的时候把moveTo加速用Cocos又该怎么写?

    * 如果要在Action运行结束做一件事情
    this.node.runAction( cc.sequence( cc.moveTo(1.0,cc.v2(100,100)) , cc.callFunc(function()
     {
        cc.log("TODO some thing");
     }));

    * 如果用缓动
    var aciton = cc.scaleTo(0.5, 2, 2);
    var actionEase = action.easing(cc.easeIn(3.0));
    this.node.runAction(actionEase);
    
Action可以参考 官方说明文档
 http://www.cocos.com/docs/creator/scripting/actions.html

##  Cocos Action局限性

#### 扩展性
可以看到cocos的Action基本覆盖了Node的所有可视化属性操作,然而,要进一步扩展或者封装就显得非常麻烦。
比如我要在1.5秒内同时修改node的坐标、透明度和缩放值。

       var actions = cc.spawn( cc.moveTo(1.5,pos),cc.fadeTo(1.5,opacity),cc.scaleTo(1.5,scale) );
       所以上述代码执行后相当于创建了四个Action, 如果每个Action加上缓动那就是7个。

如果我提一个新需求,给自定义的Node新加一个属性,比如这个Node是一枚导弹,它有速度,我想给这个速度属性加速,从0开始到3马赫,并在超过音速时播放一个音罩效果。
解决这个问题,你可能会用schedule来更新,好了,现在再进一步,我希望这枚导弹速度曲线是缓动的....

可以看出,为了解决这类实际的扩展问题,你必须用Action以外的实现方式来补充这种需求,

#### 缓动
cocos的缓动系统非常强大也很好用,但是有点冗杂,本质上缓动动作其实就是把progress(0~1.0)值经过缓动函数计算后返回一个新的progress。
但是Action系统封装了一个Action类,由这个类来把缓动后的progress值赋给被缓动的Action对象,比较多余而且增加了复杂性。

### 致命bug

Action提供了一个CallFunc的组件,它用于Sequence对象某个阶段来回调。在cocos里如果使用复杂的Action组合调用形式, 并且CallFunc内部js函数使用了闭包。
那么很容易出现闭包函数绑定的对象内存错误, crash的概率非常高。
 笔者所在的项目就遇到过这类问题,大概是这样:Spawn内部有2个Sequence,Sequence内又有spawn,spawn内部是有一个callfunc,callfunc绑定函数内使用了当前Node。 

### Sequence缺陷?

    举个实际例子
    onLoad: function () {
        let seq = cc.sequence( cc.callFunc(function(){
            cc.log("1");
        }), cc.callFunc(function(){
            cc.log("2");
        }),cc.callFunc(function(){
            cc.log("3");
        }),cc.callFunc(function(){
            cc.log("4");
        }) );
        this.node.runAction(seq);
    },

    // called every frame
    update: function (dt) {
        cc.log("update ");
    },

执行结果    
![logo](assets/img/a1.png)

上面这个动作很简单, 四个callfunc串联执行,执行结果比较有趣。
如果Sequence内超过1个Action,则会把其他Action重新组合成一个新Sequence。
如果你的动作要求插入回调,且动作的连续性非常强(比如一帧移动30像素),动作执行晚一帧对效果有影响, 那么Sequence可能会让你觉得很扎心。

## 如何重构

基于上述种种不便和困境,我决定重新写一套动作系统。
核心目标: 新的动作系统应该`轻量级`、`易扩展`、`易用`、`高效`,并能充分利用js特性。

我重写了一套新的纯js语言的Action框架—— `HAction`,该框架借鉴了 [tweenlite](http://greensock.com/tweenlite) 动画库的api特点,并保持了和cocos Action的类似的使用接口。





    
