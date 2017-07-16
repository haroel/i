* date:`1500170473696`
* title:`Android本地定时通知实现`
* tags:`Android` `Java`

----

安卓开发中我们经常需要实现一个客户端定时提醒功能,本文将介绍一个轻量级的本地消息实现的库。


### 基本介绍
Android SDK提供了一个AlarmManager类来管理系统级的闹钟订阅服务，我们的本地闹钟服务依赖这个类来实现。

### 通知
安卓本地消息通知。原生实现
github地址 https://github.com/haroel/AndroidLocalNotify

GET STARTED

1. 消息代码文件在 ` /PushAppAlarm/app/src/main/java/com/game/push ` 路径下，可以把这个目录拷贝到自己工程下。
2. 修改 自己工程下的 `AndroidManifest.xml`文件，增加下面配置并按要求修改


```
 <!--本地消息配置 BEGIN-->
<service android:name="com.game.push.ScheduleService"  />
<service android:name="com.game.push.NotifyService" android:process=":service"/>
		<!--通知栏界面图标-->
<meta-data android:name="com.game.push.gameicon" android:resource="@mipmap/ic_launcher" />
		<!--通知栏小图标-->
<meta-data android:name="com.game.push.notifyicon" android:resource="@mipmap/ic_launcher" />
		<!--App名称-->
<meta-data android:name="com.game.push.title" android:value="@string/app_name" />
<!--本地消息配置 END-->```
3 . 在Activity onCreate方法初始化
	
```
 public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        // Create a new service client and bind our activity to this service
        ScheduleClient.getInstance().init(this);
  }
   		  
```
 

4 . 增加、删除本地消息，key表示一种消息类型id，push相同key值的通知将会自动更新，id类型由业务层自己维护

```
// 注册一个本地通知
ScheduleClient.getInstance().addLocalNotify( new NotifyObject( {key} , {time} , {title}, {msg}));
// 删除通知
ScheduleClient.getInstance().removeLocalNotify({key});
//清除所有通知
ScheduleClient.getInstance().clear()

```

功能：

1. 收到消息以后，点击进入app（或是从后台返回前台），消息栏关于本App的所有通知将自动清除。
2. 通知信息会保存到本地存储当中，app重启以后也可以把以前注册的通知清除。
3. 区分通知对象是基于key（int类型）来实现，重复调用addLocalNotify并传入key相同的通知对象将会覆盖和更新之前的通知。删除通知同理。所以建议业务层用一个枚举来identify通知对象。


在高版本系统中，安卓强化了应用进程服务管控，当App被卸载或者app进程被用户强行kill后，`AlarmManager`将失效。国产各类OS和xxUI对这类服务控制更加严格，除了加入系统白名单和后台白名单（比如微信、QQ，这类app出厂就被设成白名单，通知全部保留也不会被kill），其他应用的服务会被各类清理软件给一键干掉。如果想了解如何保活服务，可以去搜索相关资料，本文不做具体介绍。

以下只讨论app不被主动强杀的操作方法。
为了保证app进入后台以后，`AlarmManager`依然有效，我们在通知显示服务加了`android:process`属性。


> 最后，本文初期部分设计思路来源于 http://blog.blundellapps.co.uk/notification-for-a-user-chosen-time/（作者实现了一个闹钟demo）， 感谢。