* date:`1509760365133`
* title:`[ezplugin]（二） 集成与使用`
* tags:`cocos creator` `ezplugin` `js` `objc` `java`

----

> ezplugin存在的意义是抹平creator移动游戏跨平台(iOS和Android)调用本地接口的差别。

我的本地开发环境

* macOS 10.3
* cocos creator v1.6.1
* Xcode v8.3.3
* Android Studio v2.3

ezplugin以源码方式集成，它非常轻量级，除系统sdk以外不依赖任何第三方库和代码，源码只有三个部分js、java和oc。

## 集成

源码在这里下载：

下载解压，分别有三个目录，分别拷贝到你的工程目录下。
最后你的工程目录看起来差不多是这样

![img](article/res/Snip20170917_10.png)
![img](article/res/Snip20170917_9.png)

上面都预留了一个plugins空目录，后面创建的插件都将放在该目录下。

js部分``PluginCore.js`和`PluginHelper.js`可以放在你creator脚本目录的任何路径，
，但是一定不能`导入为插件`，只要确保require就可以。

尝试编译一下，如果出错请检查代码导入是否正确。

## 测试插件

我们建一个测试插件PluginTest来测试是否可以使用插件，流程是js调用native方法，native延迟2秒回调给js。


1. 打开PluginHelper.js，修改文件头部的两个js数组对象。 这里我们声明了一个PluginTest插件，params定义了插件初始化参数。
  PluginsConfig_android和PluginsConfig_IOS是插件配置列表，只有声明配置过的插件才会去初始化。注意pluginName值必须和java和oc里对应的类名一致。

```
    const PluginCoreJAVAPATH = "com/sdkplugin/core/PluginCore";
    const PluginsConfig_android = [
        {
            pluginName :"PluginTest",                                          
            params     : {"appId":"Android_APPID_123", "debug": false}
        }
    ];
    
     // PluginCore插件iOS配置，
    const PluginCoreIOSPATH = "PluginCore";
    const PluginsConfig_IOS = [
        {
            pluginName :"PluginTest",                                          
            params     : {"appId":"iOS_APPID_456", "debug": false}
        }
    ];
    
    ...

```


2. 在Android Studio工程打开项目，com/sdkplugin/plugins新建一个PluginTest.java类，这个类继承com.sdkplugin.core.PluginBase。
    为了模拟异步操作，我们在PluginTest里延迟两秒回调js层

    `PluginTest.java`
```
    package com.sdkplugin.plugins;
    
    import android.content.Context;
    import android.os.Handler;
    import android.util.Log;
    import com.sdkplugin.core.PluginBase;
    import org.json.JSONObject;
    /**
     * 测试
     * Created by howe on 17/09/2017.
     */
    public class PluginTest extends PluginBase {
        public void initPlugin(Context context, JSONObject jobj){
            Log.d("PluginTest->initPlugin",jobj.toString());
        }
        public void excutePluginAction(String type, String params, final int callback){
            Log.d("excutePluginAction",String.format("type：%s,params:%s",type,params));
            final PluginBase self = this;
            new Handler().postDelayed(new Runnable() {
                @Override
                public void run() {
                    //todo
                    self.$callBackToJSOnce(callback,"java延时2秒回调js");
                }
            }, 2000);
        }
    }
``` 

3. 打开Xcode，在plugins包下新建一个PluginTest.h和PluginTest.m文件

```
    #import "PluginTest.h"
    
    @implementation PluginTest
    
    -(void)initPlugin:(NSDictionary*)params{
        NSLog(@"PluginTest->initPlugin %@",params);
    }
    -(void)excutePluginAction:(NSString*)type andParams:(NSString*)params andCallback:(int)callback{
        NSLog(@"excutePluginAction type: %@, params:%@",type,params);
        NSTimer *timer = [NSTimer scheduledTimerWithTimeInterval:2 repeats:NO block:^(NSTimer * _Nonnull timer) {
            [self $callBackToJSOnce:callback andParams:@" objc 延时2秒回调js"];
        }];
        [timer fire];
    }
    @end
```

4. 在组件脚本里，初始化ezplugin，我们设定点击一个按钮点击触发PluginTest插件方法，然后label来显示native返回的结果。

```
    cc.Class({
        extends: cc.Component,
    
        properties: {
            label: {
                default: null,
                type: cc.Label
            },
            // defaults, set visually when attaching this script to the Canvas
            text: 'Hello, World!'
        },
    
        // use this for initialization
        onLoad: function () {
            this.label.string = this.text;
    
            let pluginHelper = require("PluginHelper");
            pluginHelper.registerInitedCallback(function(ret){
                cc.log("pluginHelper init success");
            })
            // 初始化插件
            pluginHelper.init();
        },
        click:function(){
            let pluginHelper = require("PluginHelper");
            let pluginTest = pluginHelper["PluginTest"];
            pluginTest.excute("halo","World",(error,params)=>{
                cc.log(params);
                this.label.string = params;
            })
        },
        // called every frame
        update: function (dt) {
    
        },
    });
```

你可能会注意到上面执行具体的插件逻辑只有一个可用方法`excutePluginAction` , 该方法有3个参数，具体值从js层传递过来，注意回调函数会被替换成一个整数ID。 
你需要根据type的值来分别执行各种任务，任务执行完成以后调用`$callBackToJSOnce`，callback是方法ID，后面是需要传给js的参数。
之后，将会触发js的回调方法。如果插件执行错误，请调用`$callBackToJSOnceError`，同样会触发js回调方法。
js回调函数的第一个参数是Error对象，如果不为null，表示调用出错，这个和node.js基本一致


5. 构建发布，在Xcode和Android studio里测试查看日志。

我只测试了ios版本，
Xcode 调试结果：（右边有输出日志）
![img](article/res/Snip20170919_13.png)

至此，PluginTest插件已经集成好了。


## API说明

你可能注意到了，一个基于PluginBase的插件供js调用的其实就2个本地方法，initPlugin和excutePluginAction。

调用 pluginHelper.init() ，将会调用PluginBase子类的initPlugin方法，除此以外所有的js调用native方法都将调用excutePluginAction。
excutePluginAction可以根据第一个参数来做具体调用。

需要注意ios和Android的区别。

* 由于Android存在gles线程和mainUI线程的区别，所以js里提供了两个方法：excute和excuteInUITheard，前者调用的java方法在opengl线程，后者调用的java方法将在Android UI线程中执行。
另外也需要注意java回调js，java执行js方法都将runOnGLThread，也就是说js收到java回调的方法都将在js当前主逻辑执行完后才能收到。
* 在ios上，js调用oc、oc回调js都是一个线程中执行（在ios系统上，cocos opengl线程和oc主线程是一个意思）。所以在ios中excute和excuteInUITheard是一个效果。


下一篇将介绍ezplugin的事件和其他用法。