---
layout: post
title:  "经典算法总结"
date:   2015-07-14 13:09:00
commentid: 20150714
categories: [算法]
---


*  1 取平方根 ` 作者：约翰-卡马克`

		float Q_rsqrt( float number )
		{
			long i;
			float x2, y;
			const float threehalfs = 1.5F;
			x2 = number * 0.5F;
			y   = number;
			i   = * ( long * ) &y;   // evil floating point bit level hacking
			i   = 0x5f3759df - ( i >> 1 ); // what the fuck?
			y   = * ( float * ) &i;
			y   = y * ( threehalfs - ( x2 * y * y ) ); // 1st iteration
			// y   = y * ( threehalfs - ( x2 * y * y ) ); // 2nd iteration, this can be removed
	
			#ifndef Q3_VM
			#ifdef __linux__
			 assert( !isnan(y) ); // bk010122 - FPE?
			#endif
			#endif
			return y;
		}  
	
* 2 绝对值 ` 作者：约翰-卡马克`

		float Q_fabs( float f ) 
		{
			int tmp = * ( int * ) &f;
			tmp &= 0x7FFFFFFF;
			return * ( float * ) &tmp;
		}
	
* 3 不用临时变量交换两个数的值

		a = a ^ b;
		b = b ^ a;
		a = a ^ b;
* 4 求最大公约数

		int gcd(int x,int y)
		{ 
			return y?gcd(y,x%y):x; 
		}



