* date:`1493022893817`


* title:`Cocos creator Acition 重构`
* tags:`cocos`,`creator`,`js

---

cocos2d-x的Action框架强大而丰富,其Action系统的核心在于继承和组合使用。
由于creator是一个以cocos2d-x为基础的框架,这些核心特性也被完全保留了下来。
但在js开发上,这套系统过于冗杂且易用性较差,扩展性更是无从下手。



    * cocos里面使用Action的方法。
    this.node.runAction(cc.moveTo(1.0,cc.v2(100,100)));

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

