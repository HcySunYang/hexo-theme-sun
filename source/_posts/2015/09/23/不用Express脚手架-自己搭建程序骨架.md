title: 不用Express脚手架-自己搭建程序骨架
date: 2015-09-23 11:14:46
categories:
- WebFrontEnd
tags:
- express
- nodejs
---

# 初识Express #

[Express](http://expressjs.com/)的官网上是这样介绍的：“精简的、灵活的Node.js Web程序框架”。
express的哲学是“少即是多”，express是可扩展的，他只充当你和服务器之间薄薄的一层，这并不是说它不健壮，而是尽量少干预你，让你能够充分表达自己的思想。

<!-- more -->

在开始之前，首先要确认你对node有一定的了解，以及你的电脑上已经安装了node，接下来我们就开始吧。
既然是使用express从零搭建项目，那么第一步我们应该创建自己的项目文件夹也叫根目录或者项目目录（一下统称为项目目录）：

```
mkdir learnexpress
cd learnexpress
```

npm(包管理工具)是基于package.json文件管理项目的依赖以及项目的元数据的，所以我们要创建package.json这个文件，最简单的办法就是先项目目录中执行

```
npm init
```

执行上面的命令后，终端会提出一些列问题，来帮助你完成这个文件：

![npm init](http://7xlolm.com1.z0.glb.clouddn.com/20150923a.png) 

不过我们可以一路回车，不需要填写任何信息，这样就会生成一个包含默认信息的package.json文件，打开该文件，内容如下：

```
{
  "name": "learnexp",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC"
}
```

package.json文件创建好了，我们就可以开始安装express了，执行：

```
npm install --save express
```

运行npm install会把指定名称的包安装到node_modules目录下，如果你使用了 --save 选项，他还会更新package.json文件，将包的依赖写入package.json，打开项目目录，你会发现多了一个node_modules目录，此时再次打开package.json文件，会发现文件被更新了：

```
{
  "name": "learnexp",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.13.3"
  }
}
```

express也安装好了，接下来，我们就可以开始写项目了，那么我们第一步需要做的事情是什么呢？不管任何一个项目都需要一个入口文件，所以我们接下来要做的就是写入口文件，在我们的项目目录下面创建一个js文件，文件名称自定义，但是最好以你的项目名称去命名，这里我们就叫app.js作为我们的项目入口文件，并写入以下代码

```
// 引入express模块
var express = require('express');

// 调用express()方法创建一个对象
var app = express();

// 设置端口
app.set('port', process.env.PORT || 3000);

// 中间件 定制404页面
app.use(function(req, res){
	res.type('text/plain');
	res.status(404);
	res.send('404 - Not Found');
});

// 中间件 定制500页面
app.use(function(req, res){
	res.type('text/plain');
	res.status(500);
	res.send('500 - Server Error');
});

app.listen(app.get('port'), function(){
	console.log('express启动并监听' + app.get('port') + '端口，按 Ctrl + C 终止');
});
```

入口文件写好后，我们保存文件，在项目目录下执行：

```
node app.js
```

这样，我们的程序就跑起来了，打开你的浏览器，输入 * localhost:3000 *，会看到如下界面：

![404](http://7xlolm.com1.z0.glb.clouddn.com/20150923b.png)

为什么是404界面呢？很简单我们并没有设置任何路由，我们的入口文件（app.js）中只设置了404、500的处理。
在我们给应用程序加上路由之前我们来说一些问题，首先通过执行 * npm init * 创建的package.json中main属性的默认值是index.js，而我们的项目入口文件是app.js，所以我们要手动修改package.json文件的main属性为app.js：

```
{
  "name": "learnexp",
  "version": "1.0.0",
  "description": "",
  "main": "app.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.13.3"
  }
}
```

接下来，我们给首页和关于页面加上路由，注意：路由应该放在404和500处理器前面：

```
// 首页路由
app.get('/' ,function(req, res){
	res.type('text/plain');
	res.send('home');
})

// 关于页面路由
app.get('/about' ,function(req, res){
	res.type('text/plain');
	res.send('about');
})

// 中间件 定制404页面
app.use(function(req, res){
	res.type('text/plain');
	res.status(404);
	res.send('404 - Not Found');
});

........

```

app.get 是我们添加的路由方法(常见的还有 app.post )，这个方法有两个参数：第一个参数是路径，第二个参数是一个回调函数
重启我们的node服务

```
node app.js
```

打开浏览器分别输入 * localhost:3000 * 和 * localhost:3000/about * 怎么样，是否如下图所示：

![首页](http://7xlolm.com1.z0.glb.clouddn.com/20150923c.png) ![关于页面](http://7xlolm.com1.z0.glb.clouddn.com/20150923d.png)



# 莫板引擎 #

那么问题来了，我们的界面不可能总是一堆文字吧，是不是应该有漂亮的样式，开发过程中是不是应该有模板引擎，我相信很多同学对莫板引擎是不陌生的。express支持很多种莫板引擎，例如Jade，ejs等，而我们今天要介绍的是 Handlebars，为了支持handlebars，我们首先要安装 express3-handlebars 包：

```
npm install --save express3-handlebars
```

然后在我们的项目入口文件中* 创建app的代码 *之后加入以下代码：

```
var app = express();

// 设置handlebars莫板引擎
var handlebars = require('express3-handlebars').create({defaultLayout : 'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
```

以上代码中，我们执行了 * {defaultLayout : 'main'} * ，这就意味着除非我们特别声明，否则所有视图都将使用main.handlebars作为默认布局，布局文件默认在 * views/layouts/ * 目录下，接下来我们想项目目录下创建views目录，并在views目录中创建layouts目录，在layouts目录中创建main.handlebars文件：

```
<!dpcument html>
<html>
<head>
	<title>默认布局</title>
</head>
<body>
	<h1>默认布局哦哦哦哦</h1>
	{{{body}}}
</body>
</html>
```

编写好默认布局好，我们来分别创建首页页面，views/home.handlebars

```
<h1>这是首页</h1>
```

关于我们页面，views/about.handlebars

```
<h1>这是关于我们页面</h1>
```

404页面，views/404.handlebars

```
<h1>这是404页面</h1>
```

500页面，500.handlebars

```
<h1>这是500页面</h1>
```

现在视图也编写好了，接下来我们修改项目入口文件中的路由已经404和500处理器：

```
// 首页路由
app.get('/' ,function(req, res){
	res.render('home');
})

// 关于页面路由
app.get('/about' ,function(req, res){
	res.render('about');
})

// 中间件 定制404页面
app.use(function(req, res){
	res.status(404);
	res.render('404');
});

// 中间件 定制500页面
app.use(function(req, res){
	res.status(500);
	res.render('500');
});
```

注意我们已经不用res.type指定内容类型了，视图引擎默认会返回 text/html 内容类型，也不用 res.status 指定状态码了，视图引擎会默认返回200状态码(对于404和500页面必须指定状态码)
下面，我们再次重启服务器

```
node app.js
```

怎么样，是不是如下图：

![使用莫板引擎的首页](http://7xlolm.com1.z0.glb.clouddn.com/20150923e.png) ![使用莫板引擎的关于页面](http://7xlolm.com1.z0.glb.clouddn.com/20150923f.png)

# 视图和静态资源 #

我们在做视图的时候，总是会使用带静态资源，比如图片、css、javascript文件等，express是靠static中间件管理静态资源的，它可以把一个或多个目录指派成包含静态资源的目录，其中的资源不经过任何处理直接发给客户端。

在项目目录下创建 * public * 目录，接下来，在所有路由以及中间件之前加入static中间件：

```
app.use(express.static(__dirname + '/public'));
```

接下来，在public目录下面创建一个img子目录，并照一张图片放入该目录下（如：logo.png），之后修改main.handlebars布局文件

```
<!DOCTYPE html>
<html>
<head>
	<title>默认布局</title>
</head>
<body>
	<img src="/img/logo.png" alt="LOGO" />
	<h1>默认布局哦哦哦哦</h1>
	{{{body}}}
</body>
</html>
```

重启node服务

```
node app.js
```

访问主页面，是不是看到了静态资源图片：

![静态资源图片](http://7xlolm.com1.z0.glb.clouddn.com/20150923g.png)

好啦，这就是express搭建项目的基本使用，你还可以在public目录下面创建类似于css，js这样的子目录，存放对应的静态资源文件，更多有关于express的内容，可以继续关注我的博客，或者[express](http://expressjs.com/)官网