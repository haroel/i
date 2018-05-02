* date:`1509760365131`
* title:`[ezplugin]（一） 介绍ezplugin`
* tags:`cocos creator` `ezplugin` `js` `objc` `java`

----

简单点说，`ezplugin`是一个基于cocos creator的简洁、易用、易扩展、易兼容的轻量级native开发接入框架。 

# 为什么会有ezplugin

 cocos移动游戏开发，为了增强体验，难免会调用各式各样的系统API或接入第三方SDK库（如登录、支付、分析等等）。
 本地扩展和第三方sdk的实现机制依赖于各个系统，iOS是objc++来实现，Android则是用java+jni。 

使用creator开发，可以用cocos2d-js提供的反射机制来做。
 [JS到java的反射](http://www.cocos.com/docs/html5/v3/reflection/zh.html)
  [JS到OC的反射](http://www.cocos.com/docs/html5/v3/reflection-oc/zh.html)
  
  > 许多第三方SDK提供了基于cocos2d-x版本的API库接入，对于cocos2d-x来说可能比较省事，但对于creator项目来说，实则多增麻烦，
  你需要额外导入c++代码，安卓工程还要修改Android.mk重新编译，测试完成以后再写js桥接c++代码，如此流程实在是浪费时间。
  更好的做法是直接使用原生版本的库接入，利用cocos反射来调用，ezplugin就是基于反射机制来实现。
  
  利用反射，我们可以在js里直接调用java或oc的静态方法，然而，两个平台的反射写法是有很大差异的，而且java或oc回调js写法也很不同，
  在java平台你还需要注意Android UI线程和cocos opengl线程的差异。
  
  思考一段时间以后，我设计并完善了一个轻量级的适用于creator项目的iOS和Android平台的Native插件系统`ezplugin`。
  
   ezplugin存在的意义是抹平跨平台调用本地接口的区别。

  
# ezplugin回调
    
  ezplugin最有特点的是回调和事件机制。

  在node.js里，经常需要写一个异步的调用。
  
```
  const fs = require("fs")
  fs.readFile('./test.txt', 'utf8', function(err, data){
    console.log(data);  
});
```
  
 异步读取一个本地文件，前面都是参数，最后一个是调用结果回调。node.js底层文件读取完成后，把结果通过回调函数返回。
 
 回到creator里面，我们自然也很期待跨平台调用类似如下的callback写法。
 
```
    // 获取微信插件对象
 const wechat = require("ezplugin")["PluginWechat"];
 // 执行 分享
 wechat.excute("share","http://aeooh.com",function(err,result){
 	cc.log("分享结果：",result);
 });
```

 
## ezplugin插件
 
设计插件类更多是考虑sdk之间互相分离，避免干扰。

ezplugin核心实现依赖java和Objc的类反射机制实现，初始化ezplugin时，根据参数来选择初始哪些插件，PluginCore会根据类名来生成一个实例对象。

`ezplugin`插件只有一个基类PluginBase，他有一个initPlugin和excute方法，但是`ezplugin `插件不提供任何接口！

 
### 为什么不提供接口？
 
以往，基于java代码设计框架通常会用各种各样的接口，接口最常见的优势就是实现类和接口分离，在更换实现类的时候，不用更换接口功能。
利用接口可以规范一类型的sdk的公开方法。这是容易想到的特性，但这里，我们并不是在写java系统，我们更应该关注业务互调，用接口其实是在制造麻烦。

原因如下:

第一点。严格说接口一旦定制，就不允许随意修改。但是很多情况下，各个sdk之间有很明显的差异。如果照顾到所有情况，接口文件里面很多方法纯属鸡肋，不写无法编译，写了又是个空方法。如果你没考虑周全，增加新接口方法，之前实现这个接口的类又要全部改一遍。

以下是个典型的sdk插件接口例子
`InterfaceSocial.java`是cocos内置plugin-x的登录平台接口。

```
public interface InterfaceSocial {
    public final int PluginType = 6;

    public void configDeveloperInfo(Hashtable<String, String> cpInfo);
    public void submitScore(final String leaderboardID, final String score);
    public void showLeaderboard(String leaderboardID);
    public void unlockAchievement(Hashtable<String, String> achInfo);
    public void showAchievements();
    public void setDebugMode(boolean debug);
    public String getSDKVersion();
    public String getPluginVersion();
    public void login();
    public void logout();
}
```

如果是接入Googleplay服务，这些接口方法几乎都会用到。

以下是国内UC SDK登录类实现这个接口`SocialUC.java`。

```
...
	@Override
	public void submitScore(String leaderboardID, String score) {
		// TODO Auto-generated method stub
	}
	@Override
	public void showLeaderboard(String leaderboardID) {
		// TODO Auto-generated method stub
	}
	@Override
	public void unlockAchievement(Hashtable<String, String> achInfo) {
		// TODO Auto-generated method stub
	}
	@Override
	public void showAchievements() {
		// TODO Auto-generated method stub
	}
	@Override
	public void setDebugMode(boolean debug) {
		// TODO Auto-generated method stub

	}
	@Override
	public String getSDKVersion() {
		// TODO Auto-generated method stub
		return null;
	}
	@Override
	public String getPluginVersion() {
		// TODO Auto-generated method stub
		return null;
	}
...
```

除了login和loginOut方法，其他方法都是摆设。因为UC根本就没有提供这些功能，如果一个sdk插件类实现了多个接口，将有更多的垃圾僵尸方法。如果业务需要修改接口，情况将更加糟糕。

第二点。接口的另一个麻烦是新增接口带来的整体变动和浪费。同一个接口的实现类通常会被放在一个同类型的HashMap里便于调用和修改，但你无法预测你可能会遇到什么样的sdk，为了让接口插件系统运行下去，你可能会新增接口。
举个例子，为了获取游戏运行异常和崩溃的反馈信息，你可能会接入腾讯bugly，新增一个IBug.java接口，写一套接口，然后修改PluginX框架管理类集成进IBug接口，然后照bugly文档提供的方法，实现一个对应的类，然后再把这个类也集成进框架。
接完之后好好想想，一个游戏不大可能会去接入多个错误崩溃sdk，所以这个接口实际上只有一个类实现了它！

第三点。
增加接口会增加新手学习成本，这是毋庸置疑的，你必须熟悉接口的设计规范，哪些可用哪些不可用。

基于以上考虑，ezplugin所有的插件子类都只继承一个PluginBase抽象类，PluginBase基类通常只有两个可用的供外部调用方法。

有过设计成更灵活的方法调用形式，但给插件增加新的方法会导致稳定性，扩展性也会受影响。后面在解释如何接入ezplugin会谈到这一点。


下一篇将介绍如何把ezplugin集成到现有的creator项目中。