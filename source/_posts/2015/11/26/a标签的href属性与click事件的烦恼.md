title: a标签的href属性与click事件的烦恼
date: 2015-11-26 21:48:05
categories:
- WebFrontEnd
tags:
- html
- js
---

> 最近公司做项目，Hybrid App，我负责首页H5的开发工作，首页是一个常规app的首页，顶部是轮播图，然后是三个按钮，下面是一个列表，列表是a标签，点击a标签会跳转，然而让我长了姿势。。。

<!-- more -->

首先来看一张图，是我们目前开发的app首页：

![app首页，可点击的列表元素](http://7xlolm.com1.z0.glb.clouddn.com/201511271.pic.jpg)

红色区域就是可点击的列表元素，当点击的时候，会通过a标签的href内的连接进行跳转（href属性内的连接不是http协议，是我们自己定义的协议，native端通过截获协议实现native跳转），但是发现很迟钝，即点击之后会有一点延迟才会执行跳转，我的第一反应就是click事件延迟300毫秒的原因，但是当时自己比较low，觉得这是一个a标签，只是简单的加一个href属性，他得跳转我们怎么去控制了，而且这和click貌似没什么关系吧，所以一直这么想当然着。

问题的转机出现在列表页面，列表页面的DOM结构和首页中的列表DOM结构完全一样，但是列表页面点击跳转的反应速度相当的快，这让我们更加不解，后来铁了心的觉得要对比两个文件到底哪里不一样（相当费力），最终，发现列表页面应用了fastclick模块，仅此区别，于是之前的声音又回荡于耳际：“难道a标签的href属性在跳转的时候与click事件有关？”，经过验证的确如此：

## 当点击浏览器a标签的时候，浏览器的默认机制如下： ##

1、触发a的click事件
2、读取href属性的值
3、如果是URI则跳转
4、如果是javascript代码则执行该代码

下面我们一起来做一个实验：

我们在一个html页面中写下如下代码：

```
<a href="http://www.baidu.com" id="a">这是一个a标签</a>
```

代码只有一个a标签，接下来我们使用js分别给a标签触发 touchstart、touchend、mousedown、mouseup、click 事件，测试一下能够是a标签跳转的都有哪些事件，我们的js代码如下：

```
// 事件数组
var events = 'touchstart touchend mousedown mouseup click'.split(' ');
var n = 0;
// 开启定时器，每两秒钟为a标签触发相应事件
var timer = setInterval(function(){
    var event = new Event(events[n]);
    document.getElementById('a').dispatchEvent(event); // 触发事件。
    console.log(event.type);
    n++;
    if (n == events.length) {
        clearInterval(timer);
    }
},2000);
```

测试结果如下：

![每隔两秒触发一次事件，只有click事件触发时，a标签才会跳转](http://7xlolm.com1.z0.glb.clouddn.com/20151127a.gif)

我们可以看到，在控制台中每隔两秒钟就会打印出当前a标签触发的事件，当最后一个click事件触发时，a标签执行了跳转，跳转到了百度，这也就说明，a标签的跳转只有click事件能够触发，所以当点击a标签，发出请求的时候，浏览器会先去触发a的click事件，我们都知道，click事件在移动端会有300毫秒的延迟，所以这就是首页中列表点击迟钝的原因，而我之前一直认为的是，a标签的跳转与click事件无关。我怎么这么low呢？？？？？？？？？

所以最后：大家以后开发移动端页面的时候，不要觉得你没有显示的去给某个元素绑定click事件就不会存在300毫秒延迟的问题，实际上a标签的跳转也会触发click事件，如果不加处理的话，也会有300毫秒延迟的问题，这对于用户体验是极其不好的。在这个分享给大家，还是那句老话：共勉。



