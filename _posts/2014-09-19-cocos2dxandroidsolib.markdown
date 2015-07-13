---
layout: post
title:  "cocos2d-x android项目引用so库编译"
date:   2014-09-19 13:45:00
commentid: 201409190
categories: [Cocos,Android]
---

   项目接了几十个渠道平台，每个平台都建了一个Android工程，引用Classes，由于才用java接口类来抽象出平台接口方法，所以每个工程的Android.mk是完全一致的，也就是说libgame.so是一样的。前期为了保证开发进度，没有做优化，所以发一次版本，几十个渠道都要编译一次c++，其过程之痛苦，令人不寒而栗！

　　想办法来优化发布过程，思路是这样的，A工程先正确的编译一次，得到一个libgame.so库文件，然后B工程里面，我们在jni目录下新建目录prebuilt，然后把libgame.so放上去，Android,mk修改成如下内容，这样，B工程根本毋须编译任何c++代码，速度提升了N倍　　
　　　
#####以下为MK配置	

	　		　	
	LOCAL_PATH := $(call my-dir)
	include $(CLEAR_VARS)
	LOCAL_MODULE := game
	LOCAL_SRC_FILES := prebuilt/libgame.so
	include $(PREBUILT_SHARED_LIBRARY 
	
	LOCAL_SHARED_LIBRARIES := game

　　clean，然后编译，你将体会这种做法带来的便利.当然这么做的前提是你的安卓项目里面没有使用宏处理编译。
　　


