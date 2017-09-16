* date:`1505570181563`
* title:`[EZPlugin]（一） 介绍与设计实现`
* tags:`cocos creator` `ezplugin` `js` `objc` `java`

----

 cocos移动游戏开发，难免会接入各式各样的本地扩展和第三方SDK接入（比如登录、支付、分析等等）。本地扩展和第三方sdk的实现机制依赖于各个系统，比如iOS库是objc来做，Android库则是用java+jni。
  

使用creator开发本地项目，可以用cocos2d-js提供的反射机制来做。
 [JS到java的反射](http://www.cocos.com/docs/html5/v3/reflection/zh.html)
  [JS到OC的反射](http://www.cocos.com/docs/html5/v3/reflection-oc/zh.html)
  
  
  利用反射，我们可以在js里直接调用java或oc的静态方法，然而，两个平台的反射写法是有很大差异的，而且java或oc回调js写法也很不同，在java平台你还需要注意Android UI线程和cocos opengl线程的差异，这些零零碎碎的注意点堆积起来，也会在开发当中造成一定的麻烦。
  
  经过多年的开发经验，我在现有creator项目里，把这些平台的差异性抽象出来，并用一种非常讨巧的方案来实现回调，总结了一个轻量级的适用于iOS和Android平台的插件系统`EZPlugin`。
  

以下将主要介绍在安卓上的EZplugin实现，下一篇将系统介绍iOS和Android的集成和使用。
  
## EZPlugin回调

  在node.js里，经常需要写一个异步的调用。
  
```
  const fs = require("fs")
  fs.readFile('./test.txt', 'utf8', function(err, data){
    console.log(data);  
});
```
  
 异步读取一个本地文件，前面都是参数，最后一个是调用结果回调。这种写法约定俗成非常自然。
 
 回到creator里面，我们自然也很期待这样类似的callback写法。比如我们调用微信分享，如果是node风格，我们很期待调用（iOS和Android）分享过程这样写：
 
```
 const wechat = require("EZPlugin")["PluginWechat"];
 wechat.excute("share","http://aeooh.com",function(result){
 	cc.log("分享结果：",result);
 });
```

 `EZPlugin`的回调灵感来源于node.js写法风格。实现这个原理不复杂。

 我们把jsCallback回调函数放到一个JSCallbackHash对象Map表里，并生成一个唯一callbackid，把这个callbackid传到java层，java在执行完成以后，调用js层的方法，并将callbackid传回来，js根据callbackid去JSCallbackHash取回jsCallback函数，执行。
 js调用java/oc静态方法是用上面提到的js反射。java/OC回调js是用cocos提供的`Cocos2dxJavascriptJavaBridge.evalString`和`ScriptingCore::getInstance()->evalString`方法。

 
## EZPlugin插件
 
设计插件类更多是考虑sdk之间互相分离，避免干扰。

EZPlugin核心实现依赖java和Objc的类反射机制实现，初始化EZPlugin时，制定哪些插件类需要初始化，底层会根据类名来生成一个实例对象。

`EZPlugin`插件只有一个基类PluginBase，他有一个initPlugin和excute方法，但是`EZPlugin `插件不提供任何接口！

 
### 为什么不提供接口？
 
以往，基于java代码设计框架通常会用各种各样的接口，接口最常见的优势就是实现类和接口分离，在更换实现类的时候，不用更换接口功能。利用接口可以规范一类型的sdk的公开方法。这是容易想到的特性，但这里，我们并不是在写java系统，我们更应该关注业务互调，用接口其实是在制造麻烦。

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

第二点。接口的另一个麻烦是新增接口带来的整体变动和浪费。同一个接口的实现类通常会被放在一个同类型的HashMap里便于调用和修改，但你无法预测你可能会遇到什么样的sdk，为了让接口插件系统运行下去，你可能会新增接口。举个例子，为了获取游戏运行异常和崩溃的反馈，你可能会接入腾讯bugly，新增一个IBug.java接口，写一套接口，然后修改PluginX框架管理类集成进IBug接口，然后照bugly文档提供的方法，实现一个对应的类，然后再把这个类也集成进框架。接完之后好好想想，一个游戏不大可能会去接入多个错误崩溃sdk，所以这个接口实际上只有一个类实现了它！

第三点。
增加接口会增加新手学习成本，这是毋庸置疑的，你必须熟悉接口的设计规范，哪些可用哪些不可用。

因为接口的种种弊端，EZPlugin抛弃任何接口，所有的插件都只继承一个PluginBase抽象类，PluginBase基类通常只有两个可用的供外部调用方法。


基本原理已经说明完成，下一篇将介绍如何把EZPlugin集成到现有的creator项目中。