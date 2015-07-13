---
layout: post
title:  "C++ 中list、vector和deque比较"
date:   2014-09-19 13:45:00
commentid: 20150713
categories: [C/C++]
---

> 转自 <http://blog.csdn.net/xiaolajiao8787/article/details/5882609>


### 性能比较


| 类型 | Vector | Deque | List |
| ------------ | ------------- | ------------ |
| 内存管理 | Poor  | Good | perfect |
| 使用[ ]和at() 操作访问数据 | Very good  | Normal | N/A |
| Iterator的访问速度 | Good  | Very good  | Good |
| Push_back操作（后插入） | Good  | Good | Good |
| Push_front操作（前插入） | N/A  | Very good | Good |
| Insert（中间插入） | Poor  | Perfect | Perfect |
| Erase（中间删除） | Poor  | Perfect | Perfect |
| Pop_back（后部删除） | Perfect  | Perfect | Normal |
| Swap（交换数据） | Perfect  | Very good | Good |
| 遍历 | Perfect  | Good | Normal |

