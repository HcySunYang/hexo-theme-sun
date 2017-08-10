title: js Worker API 在倒计时中的使用
date: 2016-07-11 17:33:17
categories:
- WebFrontEnd
tags:
- Worker
---

在做开发的时候，倒计时的需求是很常见的，比如订单待提交和待支付都会有倒计时，市面上的兼职软件在领取任务后都会有倒计时，登录注册中获取验证码的时候也会有倒计时，有的页面只有一个倒计时，而有的页面作为列表页，列表中的每一项都会有倒计时，今天就来聊聊 Worker API 在js倒计时中的使用，以及为什么要使用 Worker 来做倒计时

<!-- more -->

# setInterval 或 setTimeout 的问题 #

当提到js的倒计时功能时，我想你第一个想到的可能就是 setInterval 这个东东，这个东西在做PC页面的时候并没有什么问题，至少我现在还没遇到什么问题，而当你在移动页面中使用它来做倒计时的时候，就会出问题了，具体来说，是在做ios中的移动页面开发的时候，问题就尤为明显了，我们有以下代码：

```
<body>

    <div id="box">60</div>

    <script>

    var box = document.getElementById('box');
    var num = 60;

    var T = setInterval(function(){
        
        box.innerHTML = --num;
        if(num <= 0){
            clearInterval(T);
        }

    }, 1000);
        
    </script>
</body>
```

上面的代码很简单，就是一个60秒的倒计时程序，我们使用 setInterval 来完成，这段代码在PC中可以正常运行，在Android中也可以正常运行，但是拿到ios中，就会有一个问题，来看图：

![时间停止](http://7xlolm.com1.z0.glb.clouddn.com/201607114.gif)

上图中，当倒计时走到37的时候，用手拖动页面，这个时候js代码会被阻塞，导致倒计时不在执行，这个现象很常见，比如当你和朋友玩微信的时候，互相发送自定义表情的gif图的时候，当你滚动聊天界面时，你会发现gif图也会静止，这个问题是ios系统机制的问题，我们没办法从根本上解决，但这并不是最关键的，大家可以发现，在倒计时走到37的时候，用手指操作页面大概有两三面的时间，按正常来讲，时间应该倒计时到 35秒或者34秒，但是图中很清楚的可以看到，在手指停止操作后，时间却从37秒继续倒计时，走到了36秒，这就与时间的倒计时时间造成了差距，假如倒计时的页面很长，比如一个列表页，那么用户在滑动查看页面信心的时候，会造成更多的倒计时延迟，这在一些要求比较精准的倒计时应用中，简直是不允许出现的，虽然后端也会做一层校验。

这个就是我们要说的问题，与其说是 setInterval 或者 setTimeout 的问题，倒不如说是 ios 系统的问题，那么有办法解决这个问题吗？这就是我们要谈到的 Worker API。

# Worker API #

web Worker API 允许 JavaScript 在后台运行，浏览器实现 Worker API 的方式有很多，每个浏览器厂家可能不尽相同，他们可以使用现线程或后台进程等，这使得 js 代码不被UI线程阻塞，二者互不影响，特别是面对计算量比较大的任务的时候，会给应用程序带来性能上的提升。

web Worker API 的使用很简单，大家可以自行查询相关书籍或博客。相信聪明的你10分钟就能搞定。

# 使用 Worker 解决问题 #

我们的思路是，将倒计时的计算放到一个单独的文件里，使用 Worder 去执行这个文件，是不是就可以了呢？

新建一个 countdown.js 文件：

```
self.onmessage = function(event){
	var num = event.data;

	var T = setInterval(function(){
		
        self.postMessage(--num);
        if(num <= 0){
            clearInterval(T);
            self.close();
        }

    }, 1000);
}
```

上面的代码很简单，在 countdown.js 中，由于这个js文件是由 Worker 来在后台执行的文件，所以这个文件内代码的 self 指向的就是 Worker 对象。我们通过 onmessage 时间接收来自页面的倒计时数值，然后原封不动的把之前的倒计时代码拷贝过来，唯一不同的就是使用 self.close() 语句来关闭 Worker。

然后修改之前的页面文件如下：

```
<body>

    <div id="box">60</div>

    <script>

    var box = document.getElementById('box');

    var w = new Worker('countdown.js');

    w.postMessage(60);

    w.onmessage = function(event){
        box.innerHTML = event.data;
    }
        
    </script>
</body>
```

在PC中刷新你的页面，可以看到依然正确工作，之后再拿到ios中做之前gif图同样的操作，如下图：

![倒计时继续](http://7xlolm.com1.z0.glb.clouddn.com/2016071144.gif)

我们可以看到，在55秒的时候开始拖动页面，这个时候倒计时停止了，不过，当我们放手之后，倒计时会立刻恢复到正常应该到达的时刻，而不会产生任何误差和延迟，这样，我们就比较完美的解决了这个问题。

# 需要注意的地方 #

在列表页面中，可能会有很多个倒计时，并且每个倒计时的开始时间不尽相同，但切记不要通过循环去 new 很多个 Worker 出来，这样可能会导致应用卡死，特别是如果在做 Hybrid App 中的 H5 页面时，可能会造成闪退，所以你只能 new 一个 Worker 对象出来，然后使用这一个 Worker 对象去做所有列表时间的倒计时，然后在更新视图中使用循环去更新，这样就不会有问题了，另外一个需要注意的是，有些Android机型中的webview不支持 web Worker 。这个时候仅仅去使用 setInterval 就可以了，因为在Android中不存在ios中那种阻塞的情况。

以上就是这篇博客的内容，希望对大家有所帮助 = =。

