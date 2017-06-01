* date:`1496323669202`
* title:`Cocos creator Acition 扩展`
* tags:`cocos` `creator` `js`

----

本篇文章将主要介绍基于cocos creator扩展出的一个`轻量级`Action系统。

## Cocos Action介绍

cocos的Action框架系统非常强大。

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
    
关于Action的更多使用,请参考官方说明文档
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

### 崩溃bug

Action提供了一个CallFunc的组件,它可以用于Sequence某个动作执行完成后回调。在cocos creator里如果使用复杂的Action组合调用形式, 并且CallFunc内部js函数使用了闭包。
那么很容易出现闭包函数绑定的对象内存错误, crash的概率非常高。这大概是因为creator jsb使用了新的内存管理模型导致,但此问题并不必现也很难排查。
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

上面这个动作很简单, 四个callfunc串联执行,执行结果多少有点出乎意料。
上面的log表明,Sequence内部action之间执行至少间隔一帧。
很多时候,我们要求一个动作执行完成,另一个动作立即开始,这样Action的帧变化间隔时间是固定的。
比如你的move动作要求插入回调,且动作的连续性非常强(比如一帧移动30像素),动作执行晚一帧会比较明显的卡顿一下, 那么Sequence可能会让你觉得很尴尬。

## 如何重构

基于上述种种不便和困境,我决定重新写一套动作系统。
核心目标: 新的动作系统应该`轻量级`、`易扩展`、`易用`、`高效`,并能充分利用js特性并能友好的用在creator项目中。

这套新的`纯js`语言的Action框架 —— `HAction`。
先谈谈这套框架基本使用用法。
    
            1. 引入框架
            let hh = require("HH");
            
            2. 执行一个moveTo动作
            let act = hh.moveTo(2.0,cc.v2(200,200));
            this.node.RunAction(act);
            
            let act = hh.delay(1.0); //delay1秒
            
            3. 延迟4秒执行moveBy,并repeat10次 
            let act = hh.moveBy(2.0,cc.v2(200,200),{delay:4.0}).repeat(10);
            this.node.RunAction(act);
            
            4. repeatForever? 支持的!
            let act = hh.moveBy(2.0,cc.v2(200,200),{delay:4.0}).repeatForever();
            this.node.RunAction(act);
            
            4. 在上一个动作执行完成之后,紧接着执行一个scale动作
            let act = hh.moveBy(2.0,cc.v2(200,200),{delay:4.0}).then(hh.scaleTo(0.4,{scaleX:3.0,scaleY:2.0}));
            this.node.RunAction(act);
            
            5. Sequence 或Spawn ? 支持的! 
            let act = hh.spawn( [hh.moveBy(2.0,cc.v2(200,0),{delay:0.5}), hh.scaleTo(3.3,{scaleX:3.0,scaleY:2.0})]  );
            this.node.RunAction( act.repeat(5) ); // spawn 5次
            
            let act = hh.sequence( [hh.moveBy(2.0,cc.v2(200,0),{delay:1.0}), hh.scaleTo(3.3,{scaleX:3.0,scaleY:2.0}) ]  );
            this.node.RunAction( act );
            
            6. Action执行完成后回调
            let act = ...
            act.onComplete(function( action )
            {
            });
            //每次update回调
            act.onUpdate(function( action, dt )
            {
            });
            
            7. 支持缓动。
               // 需要先导入Ease模块
               let easing = require("HEaseDefine");
                let act = ...
                act.easing( easing.EaseElasticIn() );
                
            8. 支持action执行 pause、resume、clone
            
            当然, 还有很多。。。
            
 上面介绍了如何在creator中使用HAction的基本方式, 
 
 为方便使用HAction,我在cc.Node的原型上加了扩展方法,代码在HNodeEx.js。
 主要有 RunAction、RemoveAction、RemoveAllActions、PauseActions、ResumeActions、GetActionByTag,首字母大写。
 
 那么Action如何与Node产生关联的呢?
 
 > 这里还有一个最关键的HActionComponent中间组件,它是cc.Component的子类,调用RunAction时会自动挂载在cc.Node（一个Node只会有一个HActionComponent实例）上。
 HActionComponent 内部有一个ActionQueue队列。所有的RunAction都会被添加到这个队列中。
 每帧运行时, HActionComponent的update函数会去tick队列里的所有可运行的Action实例,并最终去更新node的属性。
 当Node销毁时,HActionComponent的onDestroy方法将会调用,并在此方法里销毁所有的Action队列。
 
 
 下面介绍HAction框架的继承模型,我总结了一张图方便大家认知。
            
![img](article/res/haction_f.png)


* HAction是所有动作基类,它定义了基本的动作执行顺序、then方法、clone、运行回调。
* HActionInstant是单帧动作类,只会执行一帧然后删除。
* HActionInterval是基于时间线的动作基类,它增加了easing缓动接口、进度属性progress和setSpeed加速执行方法。
* HActionTweenBase是补间动画基类。


#### 属性动态变化

你可能有疑问,上面用到的 moveTo,moveBy,scaleTo这些对象又是继承自哪里?

好了,这里我用到了动态属性处理, 如果你有用过`tweenlite`动画引擎,你可能会觉得非常熟悉。

比如我要在2秒内逐渐改变某个对象的坐标到某个值。在tweenlite里面你可以这样写
    
    var node = {
        x:0,
        weight:0
    }
    TweenLite.from(node, 2.0, {x:100, weight:20});
    
    TweenLite会根据你设置的参数对象里定义了哪些属性,然后去补间更新执行定义的属性变化
 
 
这里我借鉴了tweenlite的处理方式。
 
举个例子说明, 以前如果要同时修改scale和position,你可能需要定义一个spawn动作,里面传一个scaleTo和moveTo,
而现在你完全可以这样写

    let act = hh.tween(2.0, {scale:3.0,x:20,y:50}); 
    this.node.RunAction(act); // 因为node节点有scale、x、y属性,所以这个动作可以生效。
    // 那么再加一个opacity变化?
    let act = hh.tween(2.0, {scale:3.0,x:20,y:50,opacity:100}); 
    好了,跟上面实例结合起来试试
    let act = hh.tween(2.0, {delay:1.1,repeat:4,scale:3.0,x:20,y:50,opacity:100}); 
    
可以看出,以前需要多个动作执行,现在一个就全部搞定,而且简单易读。

moveTo、scaleTo这类to性质的动作是HActionTween的某种使用特例。
同样的道理, moveBy、scaleBy这类by性质的动作是HActionTweenBy的某种使用特例。
使用这种写法,我就不需要一个个去重新实现cocos内置的动作类。
    
    在HH.js里有这类动作的定义
    hh.moveTo = function ( duration, pos, vars/* null */  )
    {
        return hh.tween(duration,pos,vars);
    };
    
    hh.moveBy = function ( duration, pos, vars/* null */  )
    {
        return hh.tweenBy(duration,pos,vars);
    };
    
    hh.scaleTo = function ( duration, scaleParams, vars/* null */  )
    {
        return hh.tween(duration,scaleParams,vars);
    };
    
    hh.scaleBy = function ( duration, scaleParams, vars/* null */  )
    {
        return hh.tweenBy(duration,scaleParams,vars);
    };
    
我加了moveTo、moveBy这些方法只是为了跟cocos名称一致,便于理解,本质上他们都是一个东西。

 说明: 对于HActionTweenBase类和子类, 如果有设置过repeat方法,那么每次repeat开始前都会自动把node属性重置到初始状态。
    
    比如 node初始位置{0,0},moveTo到{100,100},设置repeat 5次,那么每次都会从{0,0}移动到{100,100},HActionTweenBase会自动记录对象的初始状态。


说明一点,HAction的参数vars 默认会用到`delay`和`repeat`属性,当然你还可以在vars上设置onUpdate、onComplete和onStoped回调函数。
onComplete和onStoped的区别是前者如果设置repeat3次,则onComplete会回调3次,onStoped在Action动作执行完销毁前调用。


HAction的另一个特点就是使用then式语法。
then式调用的action会向单链表一样链接成一个Action队列,前一个Action执行完成后,会依次执行后面的action直到action全部调用完成。
HAction基类定义了then方法,这意味着所有的action都可以使用then调用链。
推荐用then来取代Sequence,更易读调用起来方便。

    let act = hh.moveTo(1.0,{x:100}).then(hh.fadeOut(2.0));
 
 注意: 这里then方法也可以传多个（大于1个）参数,多个参数会封装成一个HActionSpawn对象来执行
 
    let act = hh.moveTo(1.0,{x:100}).then(hh.fadeOut(2.0), hh.scaleTo(1.0,{scaleX:3.0}) );


#### 缓动

HAction的缓动与cocos的Action缓动非常不一样, 但它更简洁。目前只有HActionInterval类和子类才有easing接口,easing方法只需要传入一个缓动函数就可以运行。

HEaseDefine.js定义了常用的缓动高阶函数,你可以任意新增新的缓动方法。这个方法需要传入一个progress参数,并返回计算后的数值。

        // 需要先导入Ease模块
        let easing = require("HEaseDefine");
        let act = h.moveTo(1.0,{x:100});
        act.easing( easing.EaseElasticIn() );
        
        或者可以直接写
        act.easing( function (time)
                        {
                            return -1 * Math.cos(time * M_PI_X_2) + 1;
                        } );
                        
有时,你的缓动函数还需要设置其他参数,比如贝塞尔曲线(需要传入控制点坐标)或是EaseElasticOut这种设置变化曲率的函数,这个时候你可以用闭包包装一下。
        
        let EaseElasticOut = function ( value )
        {
            let period = value || 0.3;
            return function ( time )
            {
                let newT = 0;
                if (time == 0 || time == 1)
                {
                    newT = time;
                }else
                {
                    let s = period / 4;
                    newT = Math.pow(2, -10 * time) * Math.sin((time - s) * M_PI_X_2 / period) + 1;
                }
                return newT;
            }
        };
        act.easing( EaseElasticOut(0.5) );


如果你能大致理解HAction的实现思路,你完全可以继承其中的某个Action来实现自己的需求。 



 笔者所在的creator游戏项目（jsb）中已大量使用了HAction框架来实现动作效果,从目前已发的几个线上版本上看,稳定性、效果没有问题。
 
 github地址: https://github.com/haroel/CreatorActionEx
 
 这个框架目前由我独自开发维护使用, 某些代码实现受限于本人思维,可能有一定的局限性,不排除还有bug,如果你也对此有兴趣,欢迎拉取代码使用,当然如果你能提出好的修改意见和建议就最好不过了。
 
 最后感谢你阅读到这里, :)
        
        
        
                      
        

        
        
                
                
            



    
