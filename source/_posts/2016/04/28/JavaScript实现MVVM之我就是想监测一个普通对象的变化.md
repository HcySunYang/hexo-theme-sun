title: JavaScript实现MVVM之我就是想监测一个普通对象的变化
date: 2016-04-28 10:51:17
categories:
- WebFrontEnd
tags:
- 框架
- MVVM
- observe
---

我的博客始终都有一个特点，就是喜欢从0开始，努力让小白都能看的明白，即使看不明白，也能知道整体的来龙去脉，这篇博客依然秉承着这个风格。
以MVVM模式为主线去实现的JavaScript框架非常流行，诸如 angular、Ember、Polymer、vue 等等，它们的一个特点就是数据的双向绑定。这对于小白来说就像变魔术一样，但无论对谁来讲，当你看到一个令你感兴趣的魔术，那么揭秘它总是能吸引你的眼球。
这篇文章主要讲述MVVM实现中的一部分：如何监测数据的变化。

<!-- more -->

>注：本篇文章将生产出一个迷你库，代码托管在 [https://github.com/HcySunYang/jsonob](https://github.com/HcySunYang/jsonob)，由于本篇文章代码采用ES6编写，所以不能直接在浏览器下运行，读者在实践的时候可以采用该仓库的代码，clone仓库后：
1、安装依赖
npm install
2、构建项目
npm run build
3、使用浏览器打开 test/index.html 查看运行结果

那么接下来我们要做什么呢？我们会实现一个迷你库，这个库的作用是监测一个普通对象的变化，并作出相应的通知。库的使用方法大致如下：

```
// 定义一个变化通知的回调
var callback = function(newVal, oldVal){
    alert(newVal + '----' + oldVal);
};

// 定义一个普通对象作为数据模型
var data = {
    a: 200,
    level1: {
        b: 'str',
        c: [1, 2, 3],
        level2: {
            d: 90
        }
    }
}

// 实例化一个监测对象，去监测数据，并在数据发生改变的时候作出反应
var j = new Jsonob(data, callback);
```

上面代码中，我们定义了一个 callback 回调函数，以及一个保存着普通json对象的变量 data ，最后实例化了一个 监测对象 ，对 data 进行变化监测，当变化发生的时候，执行给定的回调进行必要的变化通知，这样，我们通过一些手段就可以达到数据绑定的效果。

## Object.defineProperty ##

ES5 描述了属性的特征，提出对象的每个属性都有特定的描述符，你也可以理解为那是属性的属性。。。。。

ES5把属性分成两种，一种是 数据属性， 一种是 访问器属性，我们可以使用 Object.defineProperty() 去定义一个数据属性或访问器属性。如下代码：

```
var obj = {};

obj.name = 'hcy';
```

上面的代码我们定义了一个对象，并给这个对象添加了一个属性 name，值为 'hcy'，我们也可以使用 Object.defineProperty() 来给对象定义属性，上面的代码等价于：

```
var obj = {};

Object.defineProperty(obj, 'name', {
	value: 'hcy',		// 属性的值
	writable: true,		// 是否可写
	enumerable: true,	// 是否能够通过for in 枚举
	configurable: true	// 是否可使用 delete删除
})
```

这样我们就使用 Object.defineProperty 给对象定义了一个属性，这样的属性就是数据属性，我们也可以定义访问器属性：

```
var obj = {};

Object.defineProperty(obj, 'age', {
	get: function(){
		return 20;
	},
	set: function(newVal){
		this.age += 20;
	}
})
```

访问器属性允许你定义一对儿 getter/setter ，当你读取属性值的时候底层会调用 get 方法，当你去设置属性值的时候，底层会调用 set 方法

知道了这个就好办了，我们再回到最初的问题上面，如何检测一个普通对象的变化，我们可以这样做：

> 遍历对象的属性，把对象的属性都使用 Object.defineProperty 转为  getter/setter ，这样，当我们修改一些值得时候，就会调用set方法，然后我们在set方法里面，回调通知，不就可以了吗，来看下面的代码：

```
// index.js
const OP = Object.prototype;

export class Jsonob{
    constructor(obj, callback){
        if(OP.toString.call(obj) !== '[object Object]'){
            console.error('This parameter must be an object：' + obj);
        }
        this.$callback = callback;
        this.observe(obj);
    }
    
    observe(obj){
        Object.keys(obj).forEach(function(key, index, keyArray){
            var val = obj[key];
            Object.defineProperty(obj, key, {
                get: function(){
                    return val;
                },
                set: (function(newVal){
                    this.$callback(newVal);
                }).bind(this)
            });
            
            if(OP.toString.call(obj[key]) === '[object Object]'){
                this.observe(obj[key]);
            }
            
        }, this);
        
    }
}
```

上面代码采用ES6编写，index.js文件中导出了一个 Jsonob 类，constructor构造函数中，我们保证了传入的对象是一个 {} 或 new Object() 生成的对象，接着缓存了回调函数，最后调用了原型下的 observe 方法。

observe方法是真正实现监测属性的方法，我们使用 Object.keys(obj).forEach 循环obj所有可枚举的属性，使用 Object.defineProperty 将属性转换为访问器属性，然后判断属性的值是否是一个对象，如果是对象的话再进行递归调用，这样一来，我们就能保证一个复杂的普通json对象中的属性以及值为对象的属性的属性都转换成访问器属性。

最后，在 Object.defineProperty 的 set 方法中，我们调用了指定的回调，并将新值作为参数进行传递。

接下来我们编写一个测试代码，去测试一下上面的代码是否可以正常使用，在index.html中（[读者可以clone文章开始阶段给出的仓库](https://github.com/HcySunYang/jsonob)），编写如下代码：

```
<html>
    <head>
        <meta charset="utf-8" />
    </head>
    <body>
        
        <script src="../dist/jsonob.js"></script>
        <script>
            var Jsonob = Jsonob.Jsonob;
            
            var callback = function(newVal){
                alert(newVal);
            };
            
            var data = {
                a: 200,
                level1: {
                    b: 'str',
                    c: [1, 2, 3],
                    level2: {
                        d: 90
                    }
                }
            }
            
            var j = new Jsonob(data, callback);
            
            data.a = 250;
            data.level1.b = 'sss';
            data.level1.level2.d = 'msn';
        </script>
    </body>
</html>
```

上面代码，很接近我们文章开头要实现的目标。我们定义了回调(callback)和数据模型(data)，在回调中我们使用 alert 函数弹出新值，然后创建了一个监测实例并把数据和回调作为参数传递过去，然后我们试着修改data对象相面的属性以及子属性，看看代码是否按照我们预期的工作，打开浏览器，如下图

![弹窗1](http://7xlolm.com1.z0.glb.clouddn.com/20160428a.jpg)
![弹窗2](http://7xlolm.com1.z0.glb.clouddn.com/b.jpg)
![弹窗3](http://7xlolm.com1.z0.glb.clouddn.com/c.jpg)

可以看弹出三个对话框，这说明我们的代码正常工作了，无论是data对象的属性，还是子属性的改变，都能够监测到变化，并执行我们指定的回调。

这样就结束了吗？可能细心的朋友可能已经意识到了，我们在检测到变化并通知回调时，只传递了一个新值(newVal)，但有的时候我们也需要旧值，但是以现在的程序来看，我们还无法传递旧值，所以我们要想办法。大家仔细看上面 index.js 中forEach循环里面的代码，有这样一段：

```
var val = obj[key];
Object.defineProperty(obj, key, {
    get: function(){
        return val;
    },
    set: (function(newVal){
        this.$callback(newVal);
    }).bind(this)
});
```

实际上，val 变量所存储的，就是旧值，我们不妨把上面的代码修改成下面这样：

```
var oldVal = obj[key];
Object.defineProperty(obj, key, {
    get: function(){
        return oldVal;
    },
    set: (function(newVal){
        if(oldVal !== newVal){
            if(OP.toString.call(newVal) === '[object Object]'){
                this.observe(newVal);
            }
            this.$callback(newVal, oldVal);
            oldVal = newVal;
        }
        
    }).bind(this)
});
```

我们将原来的 val 变量名字修改成 oldVal ，并在set方法中进行了更改判断，仅在值有更改的情况下去做一些事，当值有修改的时候，我们首先判断了新值是否是类似 {} 或 new Object() 形式的对象，如果是的话，我们要调用 this.observe 方法去监听一下新设置的值，然后在把旧值传递给回调函数之后更新一下旧值。

接着修改 test/index.html 文件：

```
<html>
    <head>
        <meta charset="utf-8" />
    </head>
    <body>
        
        <script src="../dist/jsonob.js"></script>
        <script>
            var Jsonob = Jsonob.Jsonob;
            
            var callback = function(newVal, oldVal){
                alert('新值：' + newVal + '----' + '旧值：' + oldVal);
            };
            
            var data = {
                a: 200,
                level1: {
                    b: 'str',
                    c: [1, 2, 3],
                    level2: {
                        d: 90
                    }
                }
            }
            
            var j = new Jsonob(data, callback);
            
            data.a = 250;
            data.a = 260;
        </script>
    </body>
</html>
```

我们在回调函数中接收了新值和旧值，在下面我们修改了 data.a 的值为 250，然后运行代码，查看浏览器的反馈：

![alert1](http://7xlolm.com1.z0.glb.clouddn.com/20160428d.jpg)

![alert1](http://7xlolm.com1.z0.glb.clouddn.com/20160428e.jpg)

这样，我们完成了最最基本的普通对象变化监测库，接着，我们继续发现问题，我们回过头来看一下数据模型：

```
var data = {
    a: 200,
    level1: {
        b: 'str',
        c: [1, 2, 3],
        level2: {
            d: 90
        }
    }
}
```

我们可以发现， data.level1.c 的值为一个数组，数组在我们工作中肯定是一个非常常见的数据结构，当数组的元素发生改变的时候，也视为数据的改变，但遗憾的是，我们现在库还不能监测数组的变化，比如：

```
data.level1.c.push(4);
```

我们向数组中push了一个元素，但是并不会触发改变。操作数组的方法有很多，比如：'push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse' 等等。那么我们如何在使用这些方法操作数组的时候能够监听到变化呢？有这样一个思路，看图：

![当你定义一个数组实例的时候，实例、实例的__proto__属性、Array构造函数、原型之间的关系](http://7xlolm.com1.z0.glb.clouddn.com/20160501f.jpg)

上图显示了，当你通过 var arr1 = [] 或者 var arr1 = new Array() 语句创建一个数组实例的时候，实例、实例的__proto__属性、Array构造函数以及Array原型四者之间的关系。我们可以很容的发现，数组实例的__proto__属性，是Array.prototype的引用，当我们使用 arr1.push() 语句操作数组的时候，是调用原型下的push方法，那么我们可不可以重写原型的这些数组方法，在这些重写的方法里面去监听变化呢？答案是可以的，但是在实现之前，我们先思考一个问题，我们到底要怎么重写，比如我们重写一个数组push方法，向数组栈中推入一个元素，难道我们要这样去重写吗：

```
Array.prototype.push = function(){
    // 你的实现方式
}
```

然后再一次实现其他的数组方法：

```
Array.prototype.pop = function(){
    // 你的实现方式
}
Array.prototype.shift = function(){
    // 你的实现方式
}
...
```

这种实现是最不应该考虑的，暂且不说能不能全部实现的与原生无异，即使你实现的与原生方法在使用方式上一模一样，并且不影响其他代码的运行，那么在性能上，可能就与原生差很多了，我们可以在上面 数组实例以及数组构造函数和原型之间的关系图 中思考解决方案，我们可不可以在原型链中加一层，如下：

![思路](http://7xlolm.com1.z0.glb.clouddn.com/20160501g.jpg)

如上图所示，我们在 arr1.__proto__ 与 Array.prototype 之间的链条中添加了一环 fakePrototype (假的原型)，我们的思路是，在使用 push 等数组方法的时候，调用的是 fakePrototype 上的push方法，然后在 fakePrototype 方法中简介再去调用真正的Array原型上的 push 方法，同时监听变化，这样，我们很容易就能实现，完整代码如下：

```
/*
 *  Object 原型
 */
const OP = Object.prototype;
/*
 *  需要重写的数组方法 OAR 是 overrideArrayMethod 的缩写
 */
const OAM = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];

export class Jsonob{
    constructor(obj, callback){
        if(OP.toString.call(obj) !== '[object Object]'){
            console.error('This parameter must be an object：' + obj);
        }
        this.$callback = callback;
        this.observe(obj);
    }
    
    observe(obj){
        // 如果发现 监测的对象是数组的话就要调用 overrideArrayProto 方法
        if(OP.toString.call(obj) === '[object Array]'){
            this.overrideArrayProto(obj);
        }
        Object.keys(obj).forEach(function(key, index, keyArray){
            var oldVal = obj[key];
            Object.defineProperty(obj, key, {
                get: function(){
                    return oldVal;
                },
                set: (function(newVal){
                    if(oldVal !== newVal){
                        if(OP.toString.call(newVal) === '[object Object]' || OP.toString.call(newVal) === '[object Array]'){
                            this.observe(newVal);
                        }
                        this.$callback(newVal, oldVal);
                        oldVal = newVal;
                    }
                    
                }).bind(this)
            });
            
            if(OP.toString.call(obj[key]) === '[object Object]' || OP.toString.call(obj[key]) === '[object Array]'){
                this.observe(obj[key]);
            }
            
        }, this);
        
    }
    
    overrideArrayProto(array){
            // 保存原始 Array 原型
        var originalProto = Array.prototype,
            // 通过 Object.create 方法创建一个对象，该对象的原型就是Array.prototype
            overrideProto = Object.create(Array.prototype),
            self = this,
            result;
        // 遍历要重写的数组方法
        Object.keys(OAM).forEach(function(key, index, array){
            var method = OAM[index],
                oldArray = [];
            // 使用 Object.defineProperty 给 overrideProto 添加属性，属性的名称是对应的数组函数名，值是函数
            Object.defineProperty(overrideProto, method, {
                value: function(){
                    oldArray = this.slice(0);
                    
                    var arg = [].slice.apply(arguments);
                    // 调用原始 原型 的数组方法
                    result = originalProto[method].apply(this, arg);
                    // 对新的数组进行监测
                    self.observe(this);
                    // 执行回调
                    self.$callback(this, oldArray);
                    
                    return result;
                },
                writable: true,
                enumerable: false,
                configurable: true
            });
        }, this);
        
        // 最后 让该数组实例的 __proto__ 属性指向 假的原型 overrideProto
        array.__proto__ = overrideProto;
        
    }
}
```
我们新增加了 overrideArrayProto 方法，并且在程序的最上面定义了一个常量 OAM ，用来定义要重写的数组方法，同时在 observe 方法中添加了对数组的判断，我们也允许了对数组的监听。接下来我们详细介绍一下 overrideArrayProto 方法。

顾名思义，overrideArrayProto 这个方法是重写了 Array 的原型，在 overrideArrayProto 方法中，我们首先保存了数组的原始原型，然后创建了一个假的原型，然后遍历需要重新的数组方法，并将这些方法挂载到 overrideProto 上，我们可以看到，在挂载到 overrideProto 上的这些数组方法的里面，我们调用了原始的数组原型上的数组方法，最后，我们让数组实例的 __proto__ 属性指向 overrideProto，这样，我们就实现了上图中的思路。并且完成了想要达到的效果，接下来我们可以使用我们已经重写了的数组方法去操作数组，查看能不能监测到变化：

```
var callback = function(newVal, oldVal){
    alert('新值：' + newVal + '----' + '旧值：' + oldVal);
};

var data = {
    a: 200,
    level1: {
        b: 'str',
        c: [{w: 90}, 2, 3],
        level2: {
            d: 90
        }
    }
}

var j = new Jsonob(data, callback);

data.level1.c.push(4);
```

在浏览器中可以看到，我们的代码按照预期运行了：

![图1](http://7xlolm.com1.z0.glb.clouddn.com/20160501h.jpg)

直到现在，我们可以几乎完美的监测到数据对象的变化了，并且能够知道变化前后的旧值与新值，那么这样就结束了吗？当然不是，我们可以回顾一下当我们修改数据对象的时候，我们的确能够获取到新值和旧值，但是也仅此而已，我们并不知道修改的是哪个属性，但是能够知道修改的哪个属性对于我们是相当重要的。

比如MVVM中，当数据对象改变时，要去更新模板，而模板到数据之间的关系，是通过数据对象下的某个字段名称进行绑定的，举个简单的例子，比如我们有如下模板：

```
<div id="box">
    <div>{{name}}</div>
    <div>{{age}}</div>
    <div>{{sex}}</div>
</div>
```

然后我们有如下数据：

```
var data = {
    name : 'hcy',
    age : 20,
    sex : '男'
}
```

最后我们通过 viewModule 简历模板和数据的关系：

```
new Jsonob(document.getElementById('box'), data);
```

那么当我们的数据模型data中的某个属性改变的时候，比如 data.name = 'fuck'，如若我们不知道改变的字段名称，那么我们就无法得知要刷新哪部分模板，我们只能对模板进行完全更新，这并不是一个好的设计，性能会很差，所以回到我们最初的问题，当数据对象发生改变的时候，我们得知变化的属性的名称是很必要的，但是现在我们的 Jsonob 库还不能完成这样的任务，所以我们要进一步完善。

在完善之前，我们要提出一个路径的概念，所谓路径，就是变化的字段的路径，比如有如下数据模型：

```
var data = {
    a : {
        b : {
            c : 'hcy'
        }
    }
}
```

那么字段 a 的路径就是用 data.a ，b 的路径就是 data.a.b，c 的路径就是 data.a.b.c。有的时候我们也可以用数组或者字符串来表述路径，至于用什么来表述路径并不重要，重要的是我们能够获取到路径，比如用数组表述路径可以这样：

1、 a 的路径是 ['data', 'a']
1、 b 的路径是 ['data', 'a', 'b']
1、 c 的路径是 ['data', 'a', 'b', 'c']

有了路径的概念后，我们就可以继续完善 Jsonob 库了，我们在存储路径的时候选择的是数组表示，用数组存储路径，我们修改Jsonob库代码，修改了 observe 方法和 overrideArrayProto 方法，如下图，我做了所有修改的标注：

![修改observe方法](http://7xlolm.com1.z0.glb.clouddn.com/20160501n.jpg)

![修改overrideArrayProto方法](http://7xlolm.com1.z0.glb.clouddn.com/20160501m.jpg)

最后，让我们再次尝试修改一切数组属性：

```
var callback = function(newVal, oldVal, path){
    alert('新值：' + newVal + '----' + '旧值：' + oldVal + '----路径：' + path);
};

var data = {
    a: 200,
    level1: {
        b: 'str',
        c: [{w: 90}, 2, 3],
        level2: {
            d: 90
        }
    }
}

var j = new Jsonob(data, callback);

data.level1.c.push(4);              // 向数组 data.level1.c 中push一个元素
data.level1.c[0].w = 100;           // 修改数组 data.level1.c[0].w 的值
data.level1.b = 'sss';              // 修改 data.level1.b 的值
data.level1.level2.d = 'msn';       // 修改 data.level1.level2.d 的值
```

我们修改了四个属性的值，然后我们在回调函数中接收了 path 参数，这样当数据模型变化的时候，我们不仅能够获取到新旧值，还能够知道是哪个属性发生了变化，这样我们就可以相应的做一些其他的事情，比如MVVM中的更新关联的视图，就可以做到了。最后我们刷新浏览器来产看弹出框：

![一](http://7xlolm.com1.z0.glb.clouddn.com/20160501aa.jpg)

![二](http://7xlolm.com1.z0.glb.clouddn.com/20160501ab.jpg)

![三](http://7xlolm.com1.z0.glb.clouddn.com/20160501ac.jpg)

![四](http://7xlolm.com1.z0.glb.clouddn.com/20160501ad.jpg)

图中我用红色圈标出了变化属性的路径，由于我们的路径是数组标示的，所以看上去是以逗号“,”隔开的，现在，我们就算完成了这个迷你库，相信读者也有自己的实现思路，笔者水平有限，如果哪里有欠缺还希望大家指正，共同进步。



