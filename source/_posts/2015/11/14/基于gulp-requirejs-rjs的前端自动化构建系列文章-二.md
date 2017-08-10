title: 基于gulp requirejs rjs的前端自动化构建系列文章(二)
date: 2015-11-14 10:12:25
categories:
- WebFrontEnd
tags:
- js
- 自动化
- gulp
- requirejs
- rjs
- 构建
---

> 上一篇介绍了js模块化的历程和AMD规范中规定模块的定义和引用，这篇文章就以requirejs这个AMD规范的实现来讲解js中的模块化开发

![requirejs](http://7xlolm.com1.z0.glb.clouddn.com/20151109amd.jpg)

<!-- more -->

如果你知道了AMD规范中规定的js模块的定义方法和如何引用一个模块，那么requirejs的使用几乎是零成本的，因为requirejs就是AMD规范的实现，你唯一需要学习的可能就是一些便于我们使用模块的配置，和requirejs的一些特性，接下来，我们就用一个完整的例子，来学习如何使用requirejs。

我们在项目中很可能会引用第三方库，比如jQuery等，还要引用我们自己写的一些js文件，在最初，我们的目录结构看上去是这样的，如下图：

![原始目录结构](http://7xlolm.com1.z0.glb.clouddn.com/201511141.pic.jpg)

我们有一个index.html文件，然后再建立一个名为js的文件夹，把jQuery库和我们自己写的js文件都放在里面，或者可能你还会为jQuery等第三方库单独建立一个文件夹，但最终在html页面中引用的效果是一样的，即需要几个js文件，就需要几个script标签，如下是index.html的内容：

```
<!DOCTYPE html>
<html>
<head>
	<title></title>
	<meta charset="utf-8" />
</head>
<body>

	<script src="js/jquery.min.js"></script>
	<script src="js/a.js"></script>
	<script src="js/b.js"></script>
</body>
</html>
```

我们已经了解了上面代码的缺点：
* 污染了全局变量，不同文件之间可能会命名冲突
* 文件依赖关系难以维护
* 发出更多的http请求，影响性能

再来看看我们的a.js和b.js文件：

a.js
```
var a = {
	content : 'a.js'
}
```

b.js
```
var b = {
	content : 'b.js'
}
```

这两个文件很简单，分别定义了两个污染全局的变量a和b。

那我们通过requirejs来解决这些问题呢？首先，你得有个女朋友，哦不对，你得先有requirejs库，所以，下载连接 [requirejs下载](http://www.requirejs.cn/docs/download.html#requirejs)

下载下来之后，我们把requirejs放在与我们index.html同级的目录下，如下图：

![requirejs与html同级](http://7xlolm.com1.z0.glb.clouddn.com/201511142.pic.jpg)

修改我们的index.html，只需引入我们刚刚下载下来的requirejs：

```
<!DOCTYPE html>
<html>
<head>
	<title></title>
	<meta charset="utf-8" />
</head>
<body>

	<script src="require.js" data-main="config"></script>
</body>
</html>
```

你可能会疑惑，script标签中data-main是什么？是这样的，requirejs需要一个入口模块，也就是一上来就去执行的模块，类似于C语言中的main函数。上面的代码中，我们告诉requirejs我们的入口模块是config.js，由于requirejs默认模块都是以.js为后缀的，所以这里我们可以省略，只需要写config就可以了，然后我们在index.html同级目录下创建config.js文件如下：

![config.js文件与index.html同级目录](http://7xlolm.com1.z0.glb.clouddn.com/201511143.pic.jpg)

这个config.js可以看做是我们的入口模块，或者主模块，当requirejs加载完成后，会自动执行config.js文件，我们可以在config.js文件中写下如下代码：

```
alert('这是config.js文件');
```

双击打开requirejs文件在浏览器中打开，如下图，如我们所愿，config.js被执行了：

![config.js文件被执行了](http://7xlolm.com1.z0.glb.clouddn.com/20151114c.png)

如果config模块只是简单的alert一句话，那么我们就没有必要用requirejs了，一般来讲，我们在主模块中去引用其他模块，开发我们的业务逻辑，在之前的代码中，我们引入了jQuery库，a.js和b.js，现在我们只引入了requirejs并且告诉它我们的主模块是config.js，那么我们如何使用requirejs去加载a.js、b.js和jQuery库呢？我们知道config.js符合AMD模块编写规范，上一篇文章我们已经讲过了AMD规范中如何编写和引用模块，下面我们需要做的就是把我们的文件都编写成一个个模块就好了，由于我们多在主模块即config.js中去引用其他模块，所以我们修改config.js如下：

```
require(['a', 'b'], function(A, B){
	console.log(A);
	console.log(B);
});
```

我们在config.js中使用require函数去加载模块a和模块b，注意，requirejs默认模块是.js后缀结尾的，所以我们只需要写a和b即可，它会自动去加载a.js和b.js，但是这样写就可以了嘛？我们刷新浏览器：

![报错](http://7xlolm.com1.z0.glb.clouddn.com/2015111422.pic.jpg)

我们仔细看报错信息，“net::ERR_FILE_NOT_FOUND”，再看模块加载的路径 “file:///Users/huochunyang/hcyObj/temp/a.js”，为什么会这样呢？我们知道，我们刚刚在config.js中加载模块a和b的时候，我们仅仅写了a和b到依赖数组中，可是requirejs怎么知道你这两个模块在哪里？所以默认情况下，requirejs默认会在引用requirejs的html文件所在目录下查找，注意，是html同级目录下查找，不是requirejs同级目录下查找，当然，由于我们这个例子中index.html和requirejs是在同一个目录下，所以怕大家混淆。既然这样，问题就好说了，我们index.html同级目录下并没有a.js和b.js这两个模块，我们把这两个模块放到了js目录下，所以，当然会报错啦，既然找到了问题的原因，我们修改config.js文件：

```
require(['js/a', 'js/b'], function(A, B){
	console.log(A);
	console.log(B);
});
```

再刷新浏览器，如下图：

![不报错，但输出undefined](http://7xlolm.com1.z0.glb.clouddn.com/201511144.pic.jpg)

怎么样？不报错了吧？那是因为我们家在模块的时候路径写的正确，requirejs能够正确加载模块，所以就不会报错了，但是细心的同学会发现，怎么输出两个undefined？在config.js中我们加载了a、b两个模块后，分别在log中输出了A、B模块对象，也就是说我们使用requirejs加载过来的两个模块竟然是undefined。为什么会这样呢？很简单，因为我们a.js和b.js中，并没有暗中AMD规范去编写模块代码，上一篇文章中我们介绍了如果编写一个模块，下面我们就改写a.js和b.js为模块的写法，如下：

a.js
```
define(function(){
	var a = {
		content : 'a.js'
	}

	return a;
});
```

b.js
```
define(function(){

	var b = {
		content : 'b.js'
	}

	return b;

});
```

这两个模块很简单，我们使用return语句返回两个对象，被返回的对象就是模块对象，代表了这个模块，我们刷新浏览器：

![输出模块A和B](http://7xlolm.com1.z0.glb.clouddn.com/201511145.pic.jpg)

如何我们的模块B需要依赖模块A，我们可以改写模块B为如下代码，在依赖数组中依赖模块A：

```
define(['js/a'], function(A){

	var b = {
		content : 'b.js'
	}

	return b;

});
```

不知道大家有没有发现，我们每次去加载模块的时候，都要写对模块所在路径，比如加载模块a，我们就要这样去加载 “js/a.js” ，假如我们的项目做的比较大，模块分的比较深，及目录层级深，如果我们还这样去加载的话，可能会写成下面这样：

* "modules/dom/XXX/aaa.js" *

如果每次为了加载一个模块都要这样去写的话，第一我们还要记住模块所在路径，如果记不住的话还要去查看，很影响开发效率，第二写起来总是感觉很不爽，代码看着很恶心，那么我们如何解决这个问题呢？这就要讲到requirejs的配置了，requirejs有一个config函数，接受一个json对象，设置一些配置选项，我们修改config.js如下：

```
requirejs.config({
	paths : {
		a : 'js/a',
		b : 'js/b'
	}
});


require(['a', 'b'], function(A, B){
	console.log(A);
	console.log(B);
});
```

首先我们在使用require()函数去加载模块之前，我们使用requirejs.config()方法去对requirejs进行配置，requirejs.config方法接收一个对象，对象中有一个paths配置项，顾名思义，这是一项路径配置，再看下面使用require()函数去加载模块时，我们直接去加载a和b，这样是可以正常加载模块的，因为在加载a模块的时候，requirejs发现在paths中配置的路径中a对应“js/a”，所以，require会自动去加载js/a模块，而不是在index.html同级目录下去找，所以paths配置就像一个路由，刷新页面，查看控制台中的输出，我们等待片刻会发现，如下图：

![加载超时](http://7xlolm.com1.z0.glb.clouddn.com/201511146.pic.jpg)

什么？加载超时？什么情况？别紧张，还记我们的b.js中吗？我们在b.js中依赖了a.js，可是我们的代码是怎么依赖的呢？打开b.js：

```
define(['js/a'], function(A){

	var b = {
		content : 'b.js'
	}

	return b;

});
```

我们发现，我们依赖a，模块的时候依然使用'js/a'进行依赖，而当requirejs在解析'js/a'的时候，发现有一个'a'，然后又再paths配置中发现'a'对应'js/a',于是，requirejs就把'a'换成了'js/a'，所以整体的'js/a'最终被换成了'js/js/a'，然后又再路径中发现了a，于是加载路径又被替换成了'js/js/js/a'，如此下去，最终成了死循环，而超过一定的时间之后，就会报错加载超时，明白了吧，所以，我们把b.js中依赖a.js的字符创直接写成'a'就可以了，如下：

```
define(['a'], function(A){

	var b = {
		content : 'b.js'
	}

	return b;

});
```

再次刷新浏览器，怎么样？正常加载了吧？这样以后我们只要需要依赖a模块，我们就直接写'a'就可以了：

![正常加载](http://7xlolm.com1.z0.glb.clouddn.com/201511147.pic.jpg)

那么好，a.js和b.js我们都改成了模块的编写方式，并且也做了paths配置，最终也成功加载了，但是我们还遗漏了一个东西，就是jQuery这个第三方库，那么requirejs能够加载第三方库吗？答案是：只要第三方库提供了AMD接口，那么requirejs就可以加载，而jQuery本身也提供了这个接口，所以我们直接加载就好了，为了方便，我们依然在paths中配置一下：

```
requirejs.config({
	paths : {
		a : 'js/a',
		b : 'js/b',
		$ : 'js/jquery.min'
	}
});
```

然后在config中去加载jQuery并试着使用jQuery，看看能不能正常使用，修改我们的config.js如下：

```
requirejs.config({
	paths : {
		a : 'js/a',
		b : 'js/b',
		jquery : 'js/jquery.min'
	}
});

require(['a', 'b', 'jquery'], function(A, B, $){
	alert($('html').html());
	console.log(A);
	console.log(B);
});
```

刷新页面：

![第三方库加载成功](http://7xlolm.com1.z0.glb.clouddn.com/201511148.pic.jpg)

弹出弹窗，证明我们加载jQuery成功并成功使用。

下面我们再来思考一个问题，我们为什么能够直接通过requirejs加载jQuery？是因为jQuery这个第三方库提供了AMD支持，可是并不是所有第三方库都提供了AMD支持，那么require就不能加载那些第三方库了吗？答案是：依然能够加载。不过，这就涉及到如何加载非AMD模块写法的模块了，假设我们有一个模块c，但是c.js并没有按照AMD规范封装为一个模块，我们在js文件加下创建c.js，并写下如下代码：

```
var show = function(){
	alert('调用了c');
}
```

我们的c.js很简单。只是单纯的定义了一个c函数，并弹出一个提示框，显示“调用了c”，所以这个c.js并不是一个AMD模块，那么如果我们想使用requirejs加载这个c，该如何加载呢？这就要讲到requirejs.config()中的另一个配置项 shim 了，我们已经知道了paths是用来配置加载模块路径的，shim则是用来加载非AMD模块规范的“模块”的，所以，为了加载c.js，我们可以修改config.js并添加shim配置，如下：

```
requirejs.config({
	paths : {
		a : 'js/a',
		b : 'js/b',
		c : 'js/c',
		jquery : 'js/jquery.min'
	},

	shim : {
		c : {
			exports : 'show'
		}
	}
});


require(['a', 'b', 'jquery', 'c'], function(A, B, $, c){
	console.log(c);
});
```

我们添加了shim配置，配置中，c 代表我们在require中引入模块时的名字，即我们可以通过require(['c'])去引用c模块，c对应一个json对象，对象中有一个exports属性，exports属性的值就是我们要到处的接口，注意，我们依然要在paths中添加模块c的配置，这样才能正常加载模块，最后，我们在控制台中输出了模块c，打开浏览器，刷新：

![输出模块c](http://7xlolm.com1.z0.glb.clouddn.com/201511149.pic.jpg)

我们看到，打印出来的就是我们的函数show，也就是说我们到处的接口就是show函数，我们可以调用一下试试，修改config.js：

```
require(['a', 'b', 'jquery', 'c'], function(A, B, $, c){
	c();
});
```

刷新页面：

![调用了show函数](http://7xlolm.com1.z0.glb.clouddn.com/2015111410.pic.jpg)

怎么样，弹出弹窗了吧，实际上，经过shim配置后，requirejs会自动修改c.js为一个AMD模块，为其添加封装代码，如下：

```
define(function(){
	var show = function(){
		alert('调用了c');
	}	

	return show;
});
```

我们看到，return返回的是show函数，是因为我们在shim中为c模块配置的导出接口为show，即exports的值是show，所以加入我们修改exports的值为其他值，是没有办法导出成功的，比如我们修改config.js中c模块的shim配置，如下，我们导出的接口不是show而是随意的aaa:

```
shim : {
	c : {
		exports : 'aaa'
	}
}
```

刷新页面：

![报错](http://7xlolm.com1.z0.glb.clouddn.com/2015111411.pic.jpg)

报错，c不是一个函数，为什么呢？因为我们导出的接口是aaa，鬼知道你这个aaa是什么啊。所以最后调用的时候当然会报错。

我们还可以导出多个接口，比如我们的c.js中有两个函数，分别是show函数和hide函数，修改我们的c.js如下：

```
var show = function(){
	alert('show函数');
}	

var hide = function(){
	alert('hide函数');
}
```

如果我们继续使用上面的shim配置，那么我们将只能导出show函数，没有办法导出hide，如何才能将两个接口都导出来呢？这个时候我们就不能使用exports属性了，我们要用init属性，分别将两个接口导出，修改config.js如下：

```
shim : {
	c : {
		init : function(){
			return {
				aaa : show,
				bbb : hide
			}
		}
	}
}
```

init属性对应一个函数，函数返回一个对象，对象里面对应我们要导出的接口，这样，我们就把两个接口都导出了，我们可以通过模块的aaa调用show函数，模块的bbb调用hide函数，修改config.js去尝试调用一下：

```
require(['a', 'b', 'jquery', 'c'], function(A, B, $, c){
	c.aaa();
	c.bbb();
});
```

打开浏览器刷新，怎么样，两个函数正常调用了吧，不过这里有一个需要注意的地方，init属性对应的函数中，返回的对象里面，show和hide不能用引号引起来，下面的写法是错误的：

```
shim : {
	c : {
		init : function(){
			return {
				aaa : 'show',
				bbb : 'hide'
			}
		}
	}
}
```

刷新浏览器会报错，如下图：

![加引号后报错](http://7xlolm.com1.z0.glb.clouddn.com/2015111412.pic.jpg)

那么为什么会这样呢？实际上，当我们设置了init属性后，requirejs相当于自动为我们封装了c.js如下面这样：

```
define(function(){
	var show = function(){
		alert('show函数');
	}	

	var hide = function(){
		alert('hide函数');
	}

	return {
		aaa : show,
		bbb : hide
	}
});
```

上面代码中show和hide没有加引号，所以是变量，分别引用上面的show函数和hide函数，如果我们加了引号，requirejs封装之后就会想这样：

```
define(function(){
	var show = function(){
		alert('show函数');
	}	

	var hide = function(){
		alert('hide函数');
	}

	return {
		aaa : 'show',
		bbb : 'hide'
	}
});
```

我们看上面的代码，'show'和'hide'都加了引号，所以他们是字符串，并没有引用上面的show函数和hide函数，只是导出一个字符串而已，所以当我们把字符串当做函数来调用的时候，当然会报错。我们也可以验证这一点，我们就使用带引号的配置，然后打印出c.aaa的类型，如下：

```
requirejs.config({
	paths : {
		a : 'js/a',
		b : 'js/b',
		c : 'js/c',
		jquery : 'js/jquery.min'
	},

	shim : {
		c : {
			init : function(){
				return {
					aaa : 'show',
					bbb : 'hide'
				}
			}
		}
	}
});


require(['a', 'b', 'jquery', 'c'], function(A, B, $, c){
	console.log(typeof c.aaa);
});
```

刷新浏览器，我们看到，c.aaa的确是一个字符串：

![打印出来的是字符串](http://7xlolm.com1.z0.glb.clouddn.com/2015111413.pic.jpg)

另外，我们注意一点，paths里面的配置，路径中都带有'js/'，如下：

```
paths : {
	a : 'js/a',
	b : 'js/b',
	c : 'js/c',
	jquery : 'js/jquery.min'
}
```

也就是说我们的模块都放在js目录下，既然这样，我们可不可以通过一个配置，来告诉我们的requirejs，每次查找模块的时候都基于js目录查找呢？这样我们就不用每次编写paths配置的时候都要写上'js/'了，实际上是可以的，requirejs.config()的配置对象中还有一个 baseUrl 属性，用来制定模块的查找目录，修改配置如下：

```
requirejs.config({
	baseUrl : './js',
	paths : {
		a : 'a',
		b : 'b',
		c : 'c',
		jquery : 'jquery.min'
	},

	shim : {
		c : {
			init : function(){
				return {
					aaa : show,
					bbb : hide
				}
			}
		}
	}
});
```

当然，baseUrl本省是基于引入requirejs的html文件所在目录的，在本例中即index.html所在目录的。

另外，我们发现，当我们配置完baseUrl之后，paths中a、b、c三个模块可以不用配置，因为已经没有什么意义了，但是jquery需要保留，如下：

```
requirejs.config({
	baseUrl : './js',
	paths : {
		jquery : 'jquery.min'
	},

	shim : {
		c : {
			init : function(){
				return {
					aaa : show,
					bbb : hide
				}
			}
		}
	}
});
```

这样，当requirejs去加载的a、b、c模块的时候，就自动会根据baseUrl中的配置去查找模块，而我们的三个模块也恰好在js目录下，所以可以不用配置了，总而言之，这是一个很灵好好用的配置，具体根据你的项目来。

下面，我们在考虑一种情景，假如你的项目很大，在最初阶段，你的项目里引用了jQuery1.x版本，后来随着项目的发展，项目需要引入jQuery2.x的版本，但是又不能删除掉原来的1.x版本，因为项目中有很多模块都在使用1.x的版本，这个时候，我们就希望在某些文件中引入jQuery时使用的1.x版本，而在另外一些文件中使用的是2.x的版本，怎么办呢？有的同学可能会这样想，如下配置：

```
requirejs.config({
	baseUrl : './js',
	paths : {
		jquery1 : 'jquery-1.11.3'
		jquery2 : 'jquery-2.1.4'
	},

	shim : {
		c : {
			init : function(){
				return {
					aaa : show,
					bbb : hide
				}
			}
		}
	}
});
```

配置两个jquery，一个jquery1，一个jquery2，分别对应不同的版本，当我们使用1.x版本的时候，就引用'jquery1'，当我们想使用2.x版本的时候就引用'jquery2'，这样看上去好像很合理，试着使用一下，修改config.js中require中的代码如下：

```requirejs.config({
	baseUrl : './js',
	paths : {
		jquery1 : 'jquery-1.11.3',
		jquery2 : 'jquery-2.1.4'
	},

	shim : {
		c : {
			init : function(){
				return {
					aaa : show,
					bbb : hide
				}
			}
		}
	}
});


require(['jquery1'], function($){
	alert($('html').html());
});

```

我们刷新页面，报错了：

![报错](http://7xlolm.com1.z0.glb.clouddn.com/2015111414.pic.jpg)

查看报错信息，他说$没有定义，言外之意就是说我们jQuery模块根本没有引入进来，怎么会这样呢？实际上，当我们在paths中配置jquery时，我们不能使用别名，也就是说我们只能使用 jquery 而不能使用 jquery1和jquery2，不信你将requirejs.config()中的paths修改如下：

```
paths : {
	jquery : 'jquery-1.11.3'
}
```

刷新页面可以正常使用，但是修改成下面这样就不能正常使用：

```
paths : {
	jq : 'jquery-1.11.3'
}
```

因为你只能用jquery而不能用任何其他别名，为什么这样呢？我们打开jquery的源码，开其中有这么一段代码，如下图：

![jQuery源码中对AMD兼容做法](http://7xlolm.com1.z0.glb.clouddn.com/2015111415.pic.jpg)

这段代码其实就是jQuery库对AMD模块的兼容做法，我们发现，jQuery去使用define定义模块的时候，他显示的传递了第一个参数，是一个字符串 'jquery'，这个参数在我们自己编写的模块中一般是不去手动写死得，一般由构建工具在优化模块时自动填充的，以免模块冲突，因为这个参数代表了模块id，那么jquery为什么要写死呢？

网上有种说法是出于性能考虑，因为像jQuery这种库我们在项目中使用是很频繁的，很多模块都要依赖这个模块，如果id这个参数不写死得话，意味着我们在依赖jQuery的时候可以随意起名字，而非必须使用 'jquery' ，这样其他模块就可以给jQuery起不同的模块名，这就会导致多次引入jQuery。

现在，我们知道了为什么我们在paths配置中配置jQuery的时候为什么只能使用 'jquery' 了，我们回到之前的问题，即在不同的模块引入不同版本的jQuery，想一想我们还能这样去配置了嘛：

```
paths : {
	jquery1 : 'jquery-1.11.3',
	jquery2 : 'jquery-2.1.4'
}
```

答案是否定的，因为我们只能用 jquery 而不能用 jquery1 或 jquery2，那难道我们这样配置吗？如下：

```
paths : {
	jquery : 'jquery-1.11.3',
	jquery : 'jquery-2.1.4'
}
```

简直就是笑话，这样第二个jquery属性会覆盖第一个jquery属性，那怎么办？这就涉及requirejs的另一个配置了，map配置项，map配置项的作用是，在不同的模块中，即js文件中，依赖相同的模块名，缺加载不同的模块。

我们先在config.js中增加map配置如下：

```
requirejs.config({
	baseUrl : './js',
	paths : {
		jquery : 'jquery-1.11.3'
	},

	shim : {
		c : {
			init : function(){
				return {
					aaa : show,
					bbb : hide
				}
			}
		}
	},

	map : {
		'a' : {
			jquery : 'jquery-1.11.3'
		},
		
		'b' : {
			jquery : 'jquery-2.1.4'
		}
	}
});
```

我们在map中可以对每一个模块进行配置，上面代码中，我们配置了当在 a 模块中依赖 'jquery' 时，我们加载的是 1.11.3 版本，当我们在 b 模块中依赖 'jquery' 时，我们加载的是 2.1.4 版本。我们可以尝试一下，分别修改a.js和b.js这两个模块，让他们都去依赖jquery，然后分别返回所依赖jquery的版本，如下：

a.js
```
define(['jquery'], function(jquery){
	var a = {
		content : $().jquery
	}

	return a;
});
```

b.js
```
define(['jquery'], function(jquery){
	var b = {
		content : $().jquery
	}

	return b;

});
```

然后我们在config.js中打印模块a和b，如下：

```
require(['a', 'b'], function(A, B){
	console.log('模块a引用的jQuery版本是' + A.content);
	console.log('模块b引用的jQuery版本是' + B.content);
});
```

刷新浏览器，我们看到如下，的确在不同的文件中依赖了不同版本的jQuery：

![不同文件中依赖了不同版本的jQuery](http://7xlolm.com1.z0.glb.clouddn.com/2015111416.pic.jpg)

但是有一点请读者看清楚，在a.js和b.js中我都依赖了jquery，在形式参数中我使用的是jquery，但是在下面我用到的却是(美元符号)，因为笔者在调试过程中，如果形式参数也写成(美元符号)，那么使用(美元符号)参数打印出来的始终都是undefined，但是经过分析的确正常导入模块并且没有报错，我不知道这是什么原因，或者requirejs的BUG，如果读者有知道是什么原因的欢迎在下面评论指针，共同进步。

这样，requirejs中一些必备且不易理解的配置以及一些遇到的问题和解决方案就讲解的差不多了，其实requirejs中的配置不只这些，读者可以查阅[官方文档](http://www.requirejs.cn/) 查看其他配置，都比较简单，掌握笔者讲得这些基本够用了。

下一篇文章我们就来讲一讲如何优化项目的事，包括使用rjs配合gulp构建工具等，如果你觉得对你有帮助，就看看我的话联网祈祷思维的运用吧，如下：

![支付宝二维码](http://7xlolm.com1.z0.glb.clouddn.com/201511122.pic.jpg)


