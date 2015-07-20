---
layout: post
title:  "Cocos 设置shader以后，setOpacity无效的问题"
date:   2015-07-20 10:35:00
commentid: 201507201
categories: [Cocos]
---

<br>
从网上拔下来一个Shader效果，设置shader后，加上FadeOut action无效。

为简单起见，我就用黑白色来说明这个问题 
<br>
	
	
	// Shader from http://www.iquilezles.org/apps/shadertoy/
	#ifdef GL_ES 
	precision mediump float; 
	#endif 
	varying vec2 v_texCoord;
	
	void main(void) 
	{ 
	    // Convert to greyscale using NTSC weightings 
	    vec4 col = texture2D(CC_Texture0, v_texCoord); 
	    float grey = dot(col.rgb, vec3(0.299, 0.587, 0.114));
	    gl_FragColor =  vec4(grey, grey, grey, col.a);
	}


* 1 把这个shader加载后，设置给Sprite对象，不出意外会将纹理图片设置成灰色
* 2 然后对这个Sprite设置FadeOut效果， 然后问题来了，它并没用


问题出在哪了，对比官方默认的Shader，可以很容易找到差别所在，比如在

` render/shaders/ccShader_PositionTextureColor_noMVP.frag` 的最后一段代码

	...
	void main()
	{
		gl_FragColor = v_fragmentColor * texture2D(CC_Texture0, v_texCoord);
	}
	...

很明显，默认的shader 在给`gl_FragColor`赋值时，`乘`了一个`v_fragmentColor`，好，我们把上面的灰色shader改成这样


	// Shader from http://www.iquilezles.org/apps/shadertoy/
	#ifdef GL_ES 
	precision mediump float; 
	#endif 
	varying vec2 v_texCoord;
	varying vec4 v_fragmentColor;
	
	void main(void) 
	{ 
	    // Convert to greyscale using NTSC weightings 
	    vec4 col = texture2D(CC_Texture0, v_texCoord); 
	    float grey = dot(col.rgb, vec3(0.299, 0.587, 0.114));
	    gl_FragColor = v_fragmentColor * vec4(grey, grey, grey, col.a);
	}
	
		
再次运行，设置FadeOut，我们可以看到起效了。
	
问题的核心就是`v_fragmentColor`，它其实是一个纹理颜色，这个数据是由顶点着色器传递过来的，注意声明称varying（varying类型的变量是在vertex shader和fragment shader之间传递数据用的），我们通常根据`texture2D(CC_Texture0, v_texCoord)`计算出来的其实是一个顶点颜色，两者是不同的概念 ，一个有效的输出颜色应该是纹理颜色乘以顶点颜色
	
	
	
	
	
	