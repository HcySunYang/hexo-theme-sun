title: 基于webpack和vue.js搭建的H5端框架(其实主要用于Hybrid开发H5端框架，但是依然能够作为纯web端使用)
date: 2016-03-25 15:17:33
categories:
- WebFrontEnd
tags:
- 框架
- 架构
- vue
- webpack
---

人类的发展得益于对追求不断的提升，在能活着的基础上是否要活得潇洒一点，技术的发展亦如是。在公司作为一个最最最最最最最底层的搬砖码农，经历了两个版本的铸(zhe)炼(mo)之后，我痛下决心今后一定要：..............一定要和产品惺(shi)惺(bu)相(liang)惜(li)。

<!-- more -->

# 开始之前 #

本文包含以下技术，文中尽量给与详细的描述，并且附上参考链接，读者可以深入学习：

1、[webpack](http://webpack.github.io/)
2、[Vue.js](http://cn.vuejs.org/)
3、[npm](https://www.npmjs.com/)
4、nodejs ---- 这个就不给连接了，因为上面的连接都是在你实践的过程中要去不断访问的
5、[ES6语法](http://es6.ruanyifeng.com/#README)

另外，这套教程的代码都在我的github上，读者可以对照着代码来看，不过还是希望大家自己亲手搭建，体验这个过程，git地址：

[git地址](https://github.com/HcySunYang/h5_frame)

# 前言 #

在对着产品高举中指怒发心中之愤后，真正能够解决问题的是自身上的改变，有句话说的好：你虽然改变不了全世界，但是你有机会改变你自己。秉承着“不听老人言，吃亏在眼前”的优良作风，我还是决定玩火自焚。

### 问题所在 ###

之前的项目总结为以下内容：

>1、AMD模块规范开发，使用requirejs实现，使用rjs打包，最终导致的结果是，输出的项目臃肿，肿的就像一坨狗不理......不忍直视
2、使用gulp进行打包，这一点貌似没有可吐槽的地方，毕竟都是被grunt折磨过来的......
3、数据的渲染使用模板引擎，这就意味着你要手动管理DOM，这样，你的业务代码参杂着你的数据处理、DOM管理，满屏幕的毛线......
4、模块化不足，虽然使用require进行了模块管理，但是大部分业务逻辑还是充斥在一个文件里，这与最近流行的组件化概念冰火不容，拒绝落后......
5、诸如 扩展性 、 维护性 我想早已不言而喻，不需赘述，再述就真TM是累赘了。

新框架要解决的问题：

>1、要使构建输出的项目像你邻家小妹妹一样、瘦的皮包骨。（也许是营养不良）
2、要实现真正的模块化、组件化的开发方式，真正去解决维护难、扩展难的问题。（从此不怕产品汪）
3、业务逻辑专注数据处理，手动管理DOM的年代就像......像什么呢？（毕竟成人用品也越来越自动化了）
4、等等.......（其实好处无需赘述，来，往下看）

为了达成以上目标，我们探讨一下解决方案：

*<b>1、老项目的构建输出为什么臃肿？</b>*

答：因为使用的是require的rjs进行构建打包的，了解rjs的都知道，它会把项目所有依赖都打包在一个文件里，如果项目中有很多页面依赖这个模块，那么rjs并不会把这个模块提取出来作为公共模块，所以就会有很多复制性的内容，所以项目自然臃肿。

*解决方案：*使用webpack配合相应的loader，来完成模块加载和构建的工作。

*<b>2、老项目为什么模块化的不足？</b>*

答：老项目的模块化，仅仅体现在js层面，解决了模块引用的问题，但在开发方式上，依然可以看做是过程式的，这样的结果就导致了项目的难扩展和难维护，让开发人员在与产品汪的对峙中，并不从容。

*解决方案：*Vue.js能够很好的解决组件化的问题，配合 Vue.js 官方提供的 *vue-loader* 能够很好的结合webpack做组件化的开发架构。

*<b>3、如何避免手动管理DOM？</b>*

答：如果你在做数据展示这一块的开发工作，相信你一定体会颇深，发送http请求到服务端，拿到返回的数据后手动渲染DOM至页面，这是最原始的开发方式，无非再加一个模板引擎之类的，但最终还是避免不了手动渲染，如果页面逻辑复杂，比如给你来一个翻页的功能，再来一个筛选项，估计你会觉得世界并不那么美好。

*解决方案：*MVVM模式能够很好的解决这个问题，而Vue.js的核心也是MVVM。

# webpack #

你肯定听说过webpack，如果直接对你描述什么是webpack你可能感受不到他的好处，那么在这之前，我相信你肯定使用过gulp或者grunt，如果你没使用过也可以，至少你要听说过并且知道gulp和grunt是干什么的，假如这个你还不清楚，那么你并不是一个合格的前端开发人员，这篇文章也不适合你，你可以从基础的地方慢慢学起。

gulp和grunt对于每一个前端开发人员应该是不陌生的，它们为前端提供了自动化构建的能力，并且有自己的生态圈，有很多插件，使得我们告别刀耕火种的时代，但是它们并没有解决模块加载的问题，比如我们之前的项目是使用gulp构建的，但是模块化得工作还是要靠require和rjs来完成，而gulp除了完成一些其他任务之外，就变成了帮助我们免除手动执行命令的工具了，别无它用。

而webpack就不同了，webpack的哲学是一切皆是模块，无论是js/css/sass/img/coffeejs/ttf....等等，webpack可以使用自定义的loader去把一切资源当做模块加载，这样就解决了模块依赖的问题，同时，利用插件还可以对项目进行优化，由于模块的加载和项目的构建优化都是通过webpack一个”人“来解决的，所以模块的加载和项目的构建优化并不是无机分离的，而是有机的结合在一起的，是一个组合的过程，这使得webpack在这方面能够完成的更出色，这也是webpack的优势所在。

如果你看不懂上面的描述，没关系，你只需要知道一下几点：

1、过去使用require和rjs等进行模块加载的方式，可以替换为webpack提供的指定loader去完成，你也可以自己开发加载特定资源的loader。
2、过去使用gulp和grunt完成项目构建优化的方式，可以替换成webpack提供的插件和特定的配置去完成。
3、由于模块的加载和项目的构建优化有机的结合，所以webpack能够更好的完成这项工作
4、并不是说有了webpack就淘汰的gulp等，有些特定的任务，还是要使用gulp去自定义完成的。但是不保证webpack的未来发展趋势会怎么样。

最后，给大家分享一个官方的教程，这个教程的最开始有坑的地方，如果读者遇到了坑，可以在这里给我留言，我会为大家解答，不过总体来讲，这个教程适合入门，唯一不足的就是教程是英文的，英文的也不用怕，本人的英语没过四级，但是现在依然能够看得懂英文技术文章。教程链接：[http://blog.madewithlove.be/post/webpack-your-bags/](http://blog.madewithlove.be/post/webpack-your-bags/)

# Vue.js #

[Vue.js](http://cn.vuejs.org/)是一个MVVM模式的框架，如果读者有angular经验，一定能够很快入门Vue的，那么问题来了，为什么使用Vue而不用angular，
首先，Vue的体积小，轻量在移动端开发始终是一个不可忽略的话题，其次，Vue在实现上与angular有本质的区别，读者可以通过下面两个链接来了解：

1、[Vue的变化追踪和计算属性的区别等](http://cn.vuejs.org/guide/reactivity.html)

2、[Vue 与 angular 及 react 等框架的对比](http://cn.vuejs.org/guide/comparison.html)

3、第三点就是Vue提供了webpack的loader ----> [vue-loader]，使用它可以让项目的组件化思想更加清晰

综上所述，这就是选用Vue的原因

# npm 和 nodejs #

npm 的全称是 *nodejs包管理*，现在越来越多的项目(包)都可以通过npm来安装管理，nodejs是js运行在服务器端的平台，它使得js的能力进一步提高，我们还要使用nodejs配合 webpack 来完成热加载的功能。所以读者最好有nodejs的开发经验，如果有express的经验更好。

# 让我们一步一步从零搭建这个项目 #

首先新建一个目录，名为 myProject ，这是我们的项目目录。然后执行一些基本的步骤，比如 npm init 命令，在我们的项目中生成 package.json 文件，这几乎是必选的，因为我们的项目要有很多依赖，都是通过npm来管理的，而npm对于我们项目的管理，则是通过package.json文件：

```$
npm init
```

执行npm init之后，会提示你填写一些项目的信息，一直回车默认就好了，或者直接执行 npm init -y 直接跳过询问步骤
然后我们新建一个叫做 app 的目录，这个是我们页面模块的目录，再在app目录下建立一个index目录，假设这个是首页模块的目录，然后再在index目录下建立一个 index.html 文件和 index.js 文件，分别是首页入口html文件和主js文件，然后再在index目录下建立一个components目录，这个目录用作存放首页组件模块的目录，因为我们最终要实现组件化开发。这样，当你完成上面的步骤后，你的项目看上去应该是这样的：

![项目结构](http://7xlolm.com1.z0.glb.clouddn.com/20160325b.jpg)

接下来通过npm安装项目依赖项：

```$
npm install\
  webpack webpack-dev-server\
  vue-loader vue-html-loader css-loader vue-style-loader vue-hot-reload-api\
  babel-loader babel-core babel-plugin-transform-runtime babel-preset-es2015\
  babel-runtime@5\
  --save-dev

npm install vue --save
```

这个时候，你的package.json文件看起来应该是这样的：

```
"devDependencies": {
    "babel-core": "^6.3.17",
    "babel-loader": "^6.2.0",
    "babel-plugin-transform-runtime": "^6.3.13",
    "babel-preset-es2015": "^6.3.13",
    "babel-runtime": "^5.8.34",
    "css-loader": "^0.23.0",
    "vue-hot-reload-api": "^1.2.2",
    "vue-html-loader": "^1.0.0",
    "vue-style-loader": "^1.0.0",
    "vue-loader": "^7.2.0",
    "webpack": "^1.12.9",
    "webpack-dev-server": "^1.14.0"
  },
  "dependencies": {
    "vue": "^1.0.13"
  },
```

我们安装了 babel 一系列包，用来解析ES6语法，因为我们使用ES6来开发项目，如果你不了解ES6语法，建议你看一看[阮老师的教程](http://es6.ruanyifeng.com/)，然后我们安装了一些loader包，比如css-loader/vue-loader等等，因为webpack是使用这些指定的loader去加载指定的文件的。

另外我们还使用 npm install vue --save 命令安装了 vue ，这个就是我们要在项目中使用的vue.js，我们可以直接像开发nodejs应用一样，直接require('vue');即可，而不需要通过script标签引入，这一点在开发中很爽。

安装完了依赖，编辑以下文件并保存到相应位置：

1、index.html文件：

```
<!DOCTYPE html>
<html lang="zh">
	<head>
		<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, user-scalable=no">
		<meta charset="utf-8">
		<title>首页</title>
	</head>
	<body>
		<!-- vue的组件以自定义标签的形式使用 -->
		<favlist></favlist>
	</body>
</html>

```

2、index.js文件：

```
import Vue from 'Vue'
import Favlist from './components/Favlist'

new Vue({
	el: 'body',
	components: { Favlist }
})
```

3、在components目录下新建一个 Favlist.vue 文件，作为我们的第一个组件：

```
<template>
    <div v-for="n in 10">div</div>
</template>

<script>
    export default {
        data () {
            return {
                msg: 'Hello World!'
            }
        }
    }
</script>

<style>
    html{
        background: red;
    }
</style>

```

要看懂上面的代码，你需要了解vue.js，假如你看不懂也没关系，我们首先在index.html中使用了自定义标签（即组件），然后在index.js中引入了Vue和我们的Favlist.vue组件，Favlist.vue文件中，我们使用了基本的vue组件语法，最后，我们希望它运行起来，这个时候，我们就需要webpack了。

在项目目录下新建 build 目录，用来存放我们的构建相关的代码文件等，然后在build目录下新建 webpack.config.js 这是我们的webpack配置文件，webpack需要通过读取你的配置，进行相应的操作，类似于gulpfile.js或者gruntfile.js等。

webpack.config.js

```
// nodejs 中的path模块
var path = require('path');

module.exports = {
    // 入口文件，path.resolve()方法，可以结合我们给定的两个参数最后生成绝对路径，最终指向的就是我们的index.js文件
    entry: path.resolve(__dirname, '../app/index/index.js'),
    // 输出配置
    output: {
        // 输出路径是 myProject/output/static
        path: path.resolve(__dirname, '../output/static'),
        publicPath: 'static/',
        filename: '[name].[hash].js',
        chunkFilename: '[id].[chunkhash].js'
    },
    module: {
        
        loaders: [
            // 使用vue-loader 加载 .vue 结尾的文件
            {
                test: /\.vue$/, 
                loader: 'vue'   
            }
        ]
    }
}
```

上例中，相信你已经看懂了我的配置，入口文件是index.js文件，配置了相应输出，然后使用 vue-loader 去加载 .vue 结尾的文件，接下来我们就可以构建项目了，我们可以在命令行中执行：

```
webpack --display-modules --display-chunks --config build/webpack.config.js
```

通过webpack命令，并且通过 --config 选项指定了我们配置文件的位置是 'build/webpack.config.js'，并通过 --display-modules 和 --display-chunks 选项显示相应的信息。如果你执行上面的命令，可能得到下图的错误：

![报错](http://7xlolm.com1.z0.glb.clouddn.com/20160325c.jpg)

错误提示我们应该选择合适的loader去加载这个 './app/index/index.js' 这个文件，并且说不期望index.js文件中的标识符（Unexpected token），这是因为我们使用了ES6的语法 import 语句，所以我们要使用 babel-loader 去加载我们的js文件，在配置文件中添加一个loaders项目，如下：

```
// nodejs 中的path模块
var path = require('path');

module.exports = {
    // 入口文件，path.resolve()方法，可以结合我们给定的两个参数最后生成绝对路径，最终指向的就是我们的index.js文件
    entry: path.resolve(__dirname, '../app/index/index.js'),
    // 输出配置
    output: {
        // 输出路径是 myProject/output/static
        path: path.resolve(__dirname, '../output/static'),
        publicPath: 'static/',
        filename: '[name].[hash].js',
        chunkFilename: '[id].[chunkhash].js'
    },
    module: {
        
        loaders: [
            // 使用vue-loader 加载 .vue 结尾的文件
            {
                test: /\.vue$/, 
                loader: 'vue'   
            },
            {
                test: /\.js$/,
                loader: 'babel?presets=es2015',
                exclude: /node_modules/
            }
        ]
    }
}
```

现在再运行构建命令 ： 'webpack --display-modules --display-chunks --config build/webpack.config.js'

sorry，不出意外，你应该得到如下错误：

![错误](http://7xlolm.com1.z0.glb.clouddn.com/20160325d.jpg)

它说没有发现 './components/Favlist' 模块，而我们明明有 ./components/Favlist.vue 文件，为什么它没发现呢？它瞎了？其实是这样的，当webpack试图去加载模块的时候，它默认是查找以 .js 结尾的文件的，它并不知道 .vue 结尾的文件是什么鬼玩意儿，所以我们要在配置文件中告诉webpack，遇到 .vue 结尾的也要去加载，添加 resolve 配置项，如下：

```
// nodejs 中的path模块
var path = require('path');

module.exports = {
    // 入口文件，path.resolve()方法，可以结合我们给定的两个参数最后生成绝对路径，最终指向的就是我们的index.js文件
    entry: path.resolve(__dirname, '../app/index/index.js'),
    // 输出配置
    output: {
        // 输出路径是 myProject/output/static
        path: path.resolve(__dirname, '../output/static'),
        publicPath: 'static/',
        filename: '[name].[hash].js',
        chunkFilename: '[id].[chunkhash].js'
    },
    resolve: {
        extensions: ['', '.js', '.vue']
    },
    module: {
        
        loaders: [
            // 使用vue-loader 加载 .vue 结尾的文件
            {
                test: /\.vue$/, 
                loader: 'vue'   
            },
            {
                test: /\.js$/,
                loader: 'babel?presets=es2015',
                exclude: /node_modules/
            }
        ]
    }
}
```

这样，当我们去加载 './components/Favlist' 这样的模块时，webpack首先会查找 ./components/Favlist.js 如果没有发现Favlist.js文件就会继续查找 Favlist.vue 文件，现在再次运行构建命令，我们成功了，这时我们会在我们的输出目录中看到一个js文件：

![输出](http://7xlolm.com1.z0.glb.clouddn.com/20160325e.jpg)

之所以会这样输出，是因为我们的 webpack.config.js 文件中的输出配置中指定了相应的输出信息，这个时候，我们修改 index.html ，将输出的js文件引入：

```
<!DOCTYPE html>
<html lang="zh">
	<head>
		<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, user-scalable=no">
		<meta charset="utf-8">
		<title>首页</title>
	</head>
	<body>
		<!-- vue的组件以自定义标签的形式使用 -->
		<favlist></favlist>

		<script src="../../output/static/main.ce853b65bcffc3b16328.js"></script>
	</body>
</html>
```

然后用浏览器打开这个页面，你可以看到你写的代码正确的执行了。

那么问题来了，难道我们每次都要手动的引入输出的js文件吗？因为每次构建输出的js文件都带有 hash 值，如 main.ce853b65bcffc3b16328.js，就不能更智能一点吗？每次都自动写入？怎么会不可能，否则这东西还能火吗，要实现这个功能，我们就要使用webpack的插件了，[html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin)插件，这个插件可以创建html文件，并自动将依赖写入html文件中。

首先安装 html-webpack-plugin 插件：

```
npm install html-webpack-plugin --save-dev
```

然后在修改配置项：

```
// nodejs 中的path模块
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    // 入口文件，path.resolve()方法，可以结合我们给定的两个参数最后生成绝对路径，最终指向的就是我们的index.js文件
    entry: path.resolve(__dirname, '../app/index/index.js'),
    // 输出配置
    output: {
        // 输出路径是 myProject/output/static
        path: path.resolve(__dirname, '../output/static'),
        publicPath: 'static/',
        filename: '[name].[hash].js',
        chunkFilename: '[id].[chunkhash].js'
    },
    resolve: {
        extensions: ['', '.js', '.vue']
    },
    module: {
        
        loaders: [
            // 使用vue-loader 加载 .vue 结尾的文件
            {
                test: /\.vue$/, 
                loader: 'vue'   
            },
            {
                test: /\.js$/,
                loader: 'babel?presets=es2015',
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: '../index.html',
            template: path.resolve(__dirname, '../app/index/index.html'),
            inject: true
        })
    ]
}
```

然后再次执行构建命令，成功之后，看你的输出目录，多出来一个index.html文件，双击它，代码正确执行，你可以打开这个文件查看一下，webpack自动帮我们引入了相应的文件。

问题继续来了，难道每次我们都要构建之后才能查看运行的代码吗？那岂不是很没有效率，别担心，webpack提供了几种方式，进行热加载，在开发模式中，我们使用这种方式来提高效率，这里要介绍的，是使用 [webpack-dev-middleware](https://www.npmjs.com/package/webpack-dev-middleware)中间件和[webpack-hot-middleware](https://www.npmjs.com/package/webpack-hot-middleware)中间件，首先安装两个中间件：

```
npm install webpack-dev-middleware webpack-hot-middleware --save-dev
```

另外，还要安装express，这是一个nodejs框架

```
npm install express --save-dev
```

在开始之前，我先简单介绍一下这两个中间件，之所以叫做中间件，是因为nodejs的一个叫做express的框架中有中间件的概念，而这两个包要作为express中间件使用，所以称它们为中间件，那么他们能干什么呢？

*<b>1、webpack-dev-middleware</b>*

我们之前所面临的问题是，如果我们的代码改动了，我们要想看到浏览器的变化，需要先对项目进行构建，然后才能查看效果，这样对于开发效率来讲，简直就是不可忍受的一件事，试想我仅仅修改一个背景颜色就要构建一下项目，这尼玛坑爹啊，好在有[webpack-dev-middleware](https://www.npmjs.com/package/webpack-dev-middleware)中间件，它是对webpack一个简单的包装，它可以通过连接服务器服务那些从webpack发射出来的文件，它有一下几点好处：

1、不会向硬盘写文件，而是在内存中，注意我们构建项目实际就是向硬盘写文件。

2、当文件改变的时候，这个中间件不会再服务旧的包，你可以直接帅新浏览器就能看到最新的效果，这样你就不必等待构建的时间，所见即所得。

下面我们在build目录中创建一个 dev-server.js 的文件，并写入一下内容：

```
// 引入必要的模块
var express = require('express')
var webpack = require('webpack')
var config = require('./webpack.config')

// 创建一个express实例
var app = express()

// 调用webpack并把配置传递过去
var compiler = webpack(config)

// 使用 webpack-dev-middleware 中间件
var devMiddleware = require('webpack-dev-middleware')(compiler, {
    publicPath: config.output.publicPath,
    stats: {
        colors: true,
        chunks: false
    }
})

// 注册中间件
app.use(devMiddleware)

// 监听 8888端口，开启服务器
app.listen(8888, function (err) {
    if (err) {
        console.log(err)
        return
    }
    console.log('Listening at http://localhost:8888')
})
```

此时，我们在项目根目录运行下面的命令，开启服务：

```
node build/dev-server.js
```

如果看到下图所示，证明你的服务成功开启了：

![开启服务成功](http://7xlolm.com1.z0.glb.clouddn.com/20160325f.jpg)

接下来打开浏览器，输入：

```
http://localhost:8888/app/index/index.html
```

回车，如果不出意外，你应该得到一个404，如下图：

![404](http://7xlolm.com1.z0.glb.clouddn.com/20160325g.jpg)

我们要对我们的 webpack.config.js 配置文件做两处修改：

1、将 config.output.publicPath 修改为 '/'：

```
output: {
    // 输出路径是 myProject/output/static
    path: path.resolve(__dirname, '../output/static'),
    publicPath: '/',
    filename: '[name].[hash].js',
    chunkFilename: '[id].[chunkhash].js'
},

```

2、将 plugins 中 HtmlWebpackPlugin 中的 filename 修改为 'app/index/index.html'

```
plugins: [
    new HtmlWebpackPlugin({
        filename: 'app/index/index.html',
        template: path.resolve(__dirname, '../app/index/index.html'),
        inject: true
    })
]
```

重启服务，再刷新页面，如果看到如下界面，证明你成功了：

![成功](http://7xlolm.com1.z0.glb.clouddn.com/20160325h.jpg)

但是这样开发模式下的确是成功了，可是我们直接修改了 webpack.config.js 文件，这就意味着当我们执行 构建命令 的时候，配置变了，那么我们的构建也跟着变了，所以，一个好的方式是，不去修改webpack.config.js文件，我们在build目录下新建一个 webpack.dev.conf.js文件，意思是开发模式下要读取的配置文件，并写入一下内容：

```
var HtmlWebpackPlugin = require('html-webpack-plugin')
var path = require('path');
// 引入基本配置
var config = require('./webpack.config');

config.output.publicPath = '/';

config.plugins = [
    new HtmlWebpackPlugin({
        filename: 'app/index/index.html',
        template: path.resolve(__dirname, '../app/index/index.html'),
        inject: true
    })
];

module.exports = config;
```

这样，我们在dev环境下的配置文件中覆盖了基本配置文件，我们只需要在dev-server.js中将 

```
var config = require('./webpack.config')
```

修改为：

```
var config = require('./webpack.dev.conf')
```

即可，然后，重启服务，刷新浏览器，你应该得到同样的成功结果，而这一次当我们执行构建命令：

```
webpack --display-modules --display-chunks --config build/webpack.config.js
```

并不会影响构建输出，因为我们没有直接修改webpack.config.js文件。

现在我们已经使用 webpack-dev-middleware 搭建基本的开发环境了，但是我们并不满足，因为我们每次都要手动去刷新浏览器，所谓的热加载，意思就是说能够追踪我们代码的变化，并自动更新界面，甚至还能保留程序状态。要完成热加载，我们就需要使用另外一个中间件 *webpack-hot-middleware*


*<b>2、webpack-hot-middleware</b>*

[webpack-hot-middleware](https://www.npmjs.com/package/webpack-hot-middleware) 只配合 webpack-dev-middleware 使用，它能给你提供热加载。

它的使用很简单，总共分4步：

1、安装，我们上面已经安装过了
2、在 webpack.dev.conf.js 配置文件中添加三个插件，如下：

```

var HtmlWebpackPlugin = require('html-webpack-plugin')
var path = require('path');
var webpack = require('webpack');
// 引入基本配置
var config = require('./webpack.config');

config.output.publicPath = '/';

config.plugins = [
    // 添加三个插件
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),

    new HtmlWebpackPlugin({
        filename: 'app/index/index.html',
        template: path.resolve(__dirname, '../app/index/index.html'),
        inject: true
    })
];

module.exports = config;
```

3、在 webpack.config.js 文件中入口配置中添加 'webpack-hot-middleware/client'，如下：

```
entry: ['webpack-hot-middleware/client', path.resolve(__dirname, '../app/index/index.js')],
```

4、在 dev-server.js 文件中使用插件

```
// 引入必要的模块
var express = require('express')
var webpack = require('webpack')
var config = require('./webpack.dev.conf')

// 创建一个express实例
var app = express()

// 调用webpack并把配置传递过去
var compiler = webpack(config)

// 使用 webpack-dev-middleware 中间件
var devMiddleware = require('webpack-dev-middleware')(compiler, {
    publicPath: config.output.publicPath,
    stats: {
        colors: true,
        chunks: false
    }
})

// 使用 webpack-hot-middleware 中间件
var hotMiddleware = require('webpack-hot-middleware')(compiler)

// 注册中间件
app.use(devMiddleware)
// 注册中间件
app.use(hotMiddleware)

// 监听 8888端口，开启服务器
app.listen(8888, function (err) {
    if (err) {
        console.log(err)
        return
    }
    console.log('Listening at http://localhost:8888')
})

```

ok，现在重启的服务，然后修改 Favlist.vue 中的页面背景颜色为 '#000'：

```
<style>
    html{
        background: #000;
    }
</style>

```

然后查看你的浏览器，是不是你还没有刷新就已经得带改变了？

那么这样就完美了吗？还没有，如果你细心，你会注意到，我们上面在第2步中修改了 webpack.config.js 这个基本配置文件，修改了入口配置，如下：

```
entry: ['webpack-hot-middleware/client', path.resolve(__dirname, '../app/index/index.js')],
```

这也会导致我们之前讨论过的问题，就是会影响构建，所以我们不要直接修改 webpack.config.js 文件，我们还是在 webpack.dev.conf.js 文件中配置，如下：

```

var HtmlWebpackPlugin = require('html-webpack-plugin')
var path = require('path');
var webpack = require('webpack');
// 引入基本配置
var config = require('./webpack.config');

config.output.publicPath = '/';

config.plugins = [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new HtmlWebpackPlugin({
        filename: 'app/index/index.html',
        template: path.resolve(__dirname, '../app/index/index.html'),
        inject: true
    })
];

// 动态向入口配置中注入 webpack-hot-middleware/client
var devClient = 'webpack-hot-middleware/client';
Object.keys(config.entry).forEach(function (name, i) {
    var extras = [devClient]
    config.entry[name] = extras.concat(config.entry[name])
})

module.exports = config;
```

但是我们还是要讲 webpack.config.js 文件中的入口配置修改为多入口配置的方式，这个修改不会影响构建，所以无所谓：

```
entry: {
    index: path.resolve(__dirname, '../app/index/index.js')
},
```

重启你的服务，刷新一下浏览器，然后修改 Favlist.vue 中的背景色为 green：

```
<style>
    html{
        background: green;
    }
</style>
```

再次查看浏览器，发现可以热加载。但是这样就结束了吗？还没有，不信你修改 index.html 文件，看看会不会热加载，实际上不会，你还是需要手动刷新页面，为了能够当 index.html 文件的改动也能够触发自动刷新，我们还需要做一些工作。

*<b>第一步：在 dev-server.js 文件中监听html文件改变事件，修改后的 dev-server.js 文件如下：</b>*

```
// 引入必要的模块
var express = require('express')
var webpack = require('webpack')
var config = require('./webpack.dev.conf')

// 创建一个express实例
var app = express()

// 调用webpack并把配置传递过去
var compiler = webpack(config)

// 使用 webpack-dev-middleware 中间件
var devMiddleware = require('webpack-dev-middleware')(compiler, {
    publicPath: config.output.publicPath,
    stats: {
        colors: true,
        chunks: false
    }
})

var hotMiddleware = require('webpack-hot-middleware')(compiler)

// webpack插件，监听html文件改变事件
compiler.plugin('compilation', function (compilation) {
    compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
        // 发布事件
        hotMiddleware.publish({ action: 'reload' })
        cb()
    })
})

// 注册中间件
app.use(devMiddleware)
// 注册中间件
app.use(hotMiddleware)

// 监听 8888端口，开启服务器
app.listen(8888, function (err) {
    if (err) {
        console.log(err)
        return
    }
    console.log('Listening at http://localhost:8888')
})

```

从上面的代码中可以看到，我们增加了如下代码：

```
// webpack插件，监听html文件改变事件
compiler.plugin('compilation', function (compilation) {
    compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
        // 发布事件
        hotMiddleware.publish({ action: 'reload' })
        cb()
    })
})
```

这段代码可能你看不懂，因为这涉及到webpack插件的编写，读者可以参阅下面的连接：

[webpack 插件doc1](https://github.com/webpack/docs/wiki/plugins)

[webpack 插件doc2](https://github.com/webpack/docs/wiki/How-to-write-a-plugin)

在这段代码中，我们监听了 'html-webpack-plugin-after-emit' 事件，那么这个事件是从哪里发射的呢？我们通过名字可知，这个事件应该和html-webpack-plugin这个插件有关，在npm搜索 [html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin) 插件，在页面最底部我们可以发现如下图：

![html-webpack-plugin可以发射事件](http://7xlolm.com1.z0.glb.clouddn.com/20160325i.jpg)

我们可以看到，html-webpack-plugin 这个插件的确提供了几个可选的事件，下面也提供了使用方法，这样，我们就能够监听到html文件的变化，然后我们使用下面的代码发布一个事件：

```
hotMiddleware.publish({ action: 'reload' })
```

*<b>第二步：修改 webpack.dev.conf.js 文件如下：</b>*

```

var HtmlWebpackPlugin = require('html-webpack-plugin')
var path = require('path');
var webpack = require('webpack');
// 引入基本配置
var config = require('./webpack.config');

config.output.publicPath = '/';

config.plugins = [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new HtmlWebpackPlugin({
        filename: 'app/index/index.html',
        template: path.resolve(__dirname, '../app/index/index.html'),
        inject: true
    })
];

// var devClient = 'webpack-hot-middleware/client';
var devClient = './build/dev-client';
Object.keys(config.entry).forEach(function (name, i) {
    var extras = [devClient]
    config.entry[name] = extras.concat(config.entry[name])
})

module.exports = config;
```

我们修改了devClient变量，将 'webpack-hot-middleware/client' 替换成 './build/dev-client'，最终会导致，我们入口配置会变成下面这样：

```
entry: {
    index: [
        './build/dev-client',
        path.resolve(__dirname, '../app/index/index.js')
    ]
},
```

*<b>第三步：新建 build/dev-client.js 文件，并编辑如下内容：</b>*

```
var hotClient = require('webpack-hot-middleware/client')

// 订阅事件，当 event.action === 'reload' 时执行页面刷新
hotClient.subscribe(function (event) {
    if (event.action === 'reload') {
        window.location.reload()
    }
})

```

这里我们除了引入 'webpack-hot-middleware/client' 之外订阅了一个事件，当 event.action === 'reload' 时触发，还记得我们在 dev-server.js 中发布的事件吗：

```
hotMiddleware.publish({ action: 'reload' })
```

这样，当我们的html文件改变后，就可以监听的到，最终会执行页面刷新，而不需要我们手动刷新，现在重启服务，去尝试能否对html文件热加载吧。答案是yes。
好了，开发环境终于搞定了，下面我们再来谈一谈生产环境，也就是构建输出，我们现在可以执行一下构建命令，看看输出的内容是什么，为了不必每次都要输入下面这条长命令：

```
webpack --display-modules --display-chunks --config build/webpack.config.js
```

我们在 package.js 文件中添加 "scripts" 项，如下图：

![npm](http://7xlolm.com1.z0.glb.clouddn.com/20160325m.jpg)

这样，我们就可以通过执行下面命令来进行构建，同时我们还增加了一条开启开发服务器的命令：

```
// 构建
npm run build
// 开启开发服务器
npm run dev
```

回过头来，我们执行构建命令： npm run build，查看输出内容，如下图：

![输出内容](http://7xlolm.com1.z0.glb.clouddn.com/20160325n.jpg)

现在我们只有一个js文件输出了，并没有css文件输出，在生产环境，我们希望css文件生成单独的文件，所以我们要使用 extract-text-webpack-plugin 插件，安装：

```
npm install extract-text-webpack-plugin --save-dev
```

然后在build目录下新建 webpack.prod.conf.js 文件，顾名思义，这个使我们区别于开发环境，用于生产环境的配置文件，并编辑一下内容：

```

var HtmlWebpackPlugin = require('html-webpack-plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var path = require('path');
var webpack = require('webpack');
// 引入基本配置
var config = require('./webpack.config');

config.vue = {
    loaders: {
        css: ExtractTextPlugin.extract("css")
    }
};

config.plugins = [
    // 提取css为单文件
    new ExtractTextPlugin("../[name].[contenthash].css"),

    new HtmlWebpackPlugin({
        filename: '../index.html',
        template: path.resolve(__dirname, '../app/index/index.html'),
        inject: true
    })
];

module.exports = config;
```

上面的代码中，我们覆盖了 webpack.config.js 配置文件的 config.plugins 项，并且添加了 config.vue 项，补血药知道为什么，就是这么用的，如果一定要知道为什么也可以，这需要你多去了解vue以及vue-loader的工作原理，这里有连接[点击这里](http://vuejs.github.io/vue-loader/configurations/extract-css.html)
然后修改 package.json 文件中的 script 项为如下：

```
"scripts": {
    "build": "webpack --display-modules --display-chunks --config build/webpack.prod.conf.js",
    "dev": "node ./build/dev-server.js"
},
```

我们使用 webpack.prod.conf.js 为配置去构建，接下来执行：

```
npm run build
```

查看你的输出内容，如下图，css文件未提取出来了：

![css文件被提取](http://7xlolm.com1.z0.glb.clouddn.com/20160325l.jpg)

另外我们还可以添加如下插件在我们的 webpack.prod.conf.js 文件中，作为生产环境使用：

```
config.plugins = [
    new webpack.DefinePlugin({
        'process.env': {
            NODE_ENV: '"production"'
        }
    }),
    // 压缩代码
    new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        }
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    // 提取css为单文件
    new ExtractTextPlugin("../[name].[contenthash].css"),
    new HtmlWebpackPlugin({
        filename: '../index.html',
        template: path.resolve(__dirname, '../app/index/index.html'),
        inject: true
    })
];
```

大家可以搜索这些插件，了解他的作用，这篇文章要介绍的太多，所以我一一讲解了。

到这里实际上搭建的已经差不多了，唯一要做的就是完善，比如公共模块的提取，如何加载图片，对于第一个问题，如何提取公共模块，我们可以使用 CommonsChunkPlugin 插件，在 webpack.prod.conf.js 文件中添加如下插件：

```
new webpack.optimize.CommonsChunkPlugin({
    name: 'vendors',
    filename: 'vendors.js',
}),
```

然后在 webpack.config.js 文件中配置入口文件：

```
entry: {
    index: path.resolve(__dirname, '../app/index/index.js'),
    vendors: [
        'Vue'
    ]
},
```

上面代码的意思是，我们把Vue.js当做公共模块单独打包，你可以在这个数组中增加其他模块，一起作为公共模块打包成一个文件，我们执行构建命令，然后查看输出，如下图，成功提取：

![提取公共模块](http://7xlolm.com1.z0.glb.clouddn.com/20160325u.jpg)

对于加载图片的问题，我们知道，webpack的哲学是一切皆是模块，然后通过相应的loader去加载，所以加载图片，我们就需要使用到 url-loader，在webpack.config.js 文件中添加一个loader配置：

```
loaders: [
    // 使用vue-loader 加载 .vue 结尾的文件
    {
        test: /\.vue$/, 
        loader: 'vue'   
    },
    {
        test: /\.js$/,
        loader: 'babel?presets=es2015',
        exclude: /node_modules/
    },
    // 加载图片
    {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'url',
        query: {
            limit: 10000,
            name: '[name].[ext]?[hash:7]'
        }
    }
]
```

这样，当我们的css样式表文件中使用 url(xxxx.png)或者js中去require('xxxx.png')的时候，webpack就知道如何处理，另外url-loader的一个好处就是，以上面的配置来说，当我们的图片大小小于10000字节的时候，webpack会把图片转换成base64格式插入到代码中，从而减少http请求，另外，我们在这里谈到的任何一个loader都可以在npm中查找到，读者可以查询更多的loader了解并使用。




