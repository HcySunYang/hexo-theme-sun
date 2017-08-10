title: nodejs使用mongodb做数据持久化
date: 2015-12-02 14:30:47
categories:
- WebFrontEnd
tags:
- mongodb
- nodejs
---

>前段时间，写了一篇博客，讲解了在[Mac下使用brew安装mongodb](http://hcysun.me/2015/11/21/Mac%E4%B8%8B%E4%BD%BF%E7%94%A8brew%E5%AE%89%E8%A3%85mongodb/)，这篇文章可以看做是续篇，使用nodejs操作mongodb，并封装一些有用的方法。

<!-- more -->

nodejs操作mongodb，首先要使用npm安装操作mongodb数据库的包，有两个选择 [mongoose](https://www.npmjs.com/package/mongoose) 和 [mongodb](https://www.npmjs.com/package/mongodb)，由于mongodb的使用方式更接近mongodb原生的语法，所以这里我们使用[mongodb](https://www.npmjs.com/package/mongodb)模块，操作数据库。

在[Mac下使用brew安装mongodb](http://hcysun.me/2015/11/21/Mac%E4%B8%8B%E4%BD%BF%E7%94%A8brew%E5%AE%89%E8%A3%85mongodb/)这篇文章中，已经讲解了mongodb数据库的性质和安装，也介绍了一个连接mongodb的客户端工具 Robomongo ，所以这里就不在赘述。

不过，简单介绍下mongodb数据库的语法还是有必要的，如果你已经了解，那么可以跳过这里，接下来，我们就使用原生的语法来做一次CURD操作。

## 1、启动mongodb服务 ##

```
mongo
```

在终端执行命令 mongo 就可以启动mongodb服务了，我们会进入到mongo的交互模式，如图：

![启动mongodb服务](http://7xlolm.com1.z0.glb.clouddn.com/201512021.pic.jpg)

我们可以看到，mongo启动后，默认连接的是test数据库，注意，mongodb是非关系型数据库，和MySQL不同，在mongodb中：

```
nodql       	<=====>		sql
数据库(database) <=====> 数据库(database)
集合(collection) <=====> 表(table)
文档(docs) 		<=====> 行(rows)
字段(field) 		<=====> 列(field)
```

我们执行下面的命令来查看我们当前操作的数据库：

```
db
```

如下，我们当前操作的数据库是 test 库：

![显示当前我们所操作的数据库](http://7xlolm.com1.z0.glb.clouddn.com/201512026.pic.jpg)

也可以执行下面这条命令来查看所以数据库：

```
show dbs
```

如下图，展示出我们所有的数据库，但是请注意，如果你的数据库里面没有任何数据，是不会被显示出来的：

![显示所有数据库，空数据库没有显示](http://7xlolm.com1.z0.glb.clouddn.com/201512023.pic.jpg)

我们可以使用下面这条命令切换数据库：

```
use hcy
```

这样，我们就切换到了数据库名字为hcy的数据库，我们可以执行 db 命令来查看是否切换成功：

![切换数据库](http://7xlolm.com1.z0.glb.clouddn.com/201512024.pic.jpg)

注意，使用use db_name来切换数据库的时候，如果该数据库不存在，那么会创建该数据库，所以如果你要创建一个数据库，也是用use命令就好啦。

如果要删除一个数据库，我们首先要切换到当前数据库下，然后执行下面的命令就可以删除这个数据库了：

```
use hcy

db.dropDatabase()
```

这样就会删除hcy这个数据库，我们再来查看所有数据库，发现hcy库已经不见了，被我们删掉了：

![删除数据库](http://7xlolm.com1.z0.glb.clouddn.com/201512025.pic.jpg)

下面，我们讲述最简单的curd操作：

### 1、向hcy数据库中的users集合插入一个文档 ###

标题中的话如果翻译成sql数据库的语言就是：“向hcy数据库中的users表中插入一条数据”，那么我们看看怎么向mongodb数据库的集合中插入文档：

```
use hcy

db.users.insert({
	name : 'hcy',
	age : 21
})
```

首先，我们切换到hcy数据库，如果没有该数据库就会自动创建该数据库，然后执行插入数据操作，我们可以使用下面的命令查询一个集合中的数据：

```
db.users.find()
```

这样会查询出hcy库中users集合下面的所有数据，如果需要条件查找，像下面这条命令，只需要在find()方法中传入一个json对象作为筛选条件即可：

```
db.users.find({name:'hcy'})
```

删除数据：

```
db.users.remove()
```

上面的数据会删除users集合下得所有文档(数据)，也可以传入第一个参数，作为筛选条件：

```
db.users.remove({
	name : 'hcy'
})
```

上面的命令会删除掉users集合中，所有name值为hcy的所有文档，也可以传入第二个参数，是一个boolean值，true为只删除一条：

```
db.users.remove({
	name : 'hcy'
}, true)
```

修改数据有两种方法，可以使用 update()方法，也可以使用save()方法，先来看update()方法:

```
db.collection.update(
   <query>,
   <update>,
   {
     upsert: <boolean>,
     multi: <boolean>,
     writeConcern: <document>
   }
)
```

>query : update的查询条件，类似sql update查询内where后面的。
>update : update的对象和一些更新的操作符（如$,$inc...）等，也可以理解为sql update查询内set后面的
>upsert : 可选，这个参数的意思是，如果不存在update的记录，是否插入objNew,true为插入，默认是false，不插入。
>multi : 可选，mongodb 默认是false,只更新找到的第一条记录，如果这个参数为true,就把按条件查出来多条记录全部更新。
>writeConcern :可选，抛出异常的级别。

这里我只介绍了语法，也可以使用save()方法：

```
db.collection.save(
   <document>,
   {
     writeConcern: <document>
   }
)
```

>document : 文档数据。
>writeConcern :可选，抛出异常的级别。

例子如下：

```
db.users.save({
	"_id" : ObjectId("56064f89ade2f21f36b03136"),
    "name" : "aaaa",
    "age" : "100"
})
```

上面的例子中，我们替换了 _id 为 56064f89ade2f21f36b03136 的文档数据。

如果想了解更多mongodb原生语法知识，[这里](http://www.runoob.com/mongodb/mongodb-tutorial.html)是一个好去处

现在，你应该对mongodb有了一定的了解了，那么我们如何在nodejs中操作mongodb呢？

首先在项目中使用npm安装mongodb模块

```
npm install --save mongodb
```

当我们想要在项目中使用这个模块操作数据库的时候，我们就可以引入该模块

```
var MongoClient = require('mongodb').MongoClient;
```

上面的代码返回一个mongodb客户端实例，连接数据库：

```
var mongoConnectUrl = 'mongodb://localhost:27017/hcy';
MongoClient.connect(mongoConnectUrl, function(err, db){
	if(err) return console.log(err);
	console.log('连接成功');
});
```

上面的mongoConnectUrl是我们连接mongodb数据库的一个url，注意，mongodb默认监听的端口是27017，另外，如果始终连接不成功，你可以把localhost换成你电脑的ip地址试一试，笔者在测试的时候只能使用ip地址，使用localhost始终连接失败，在url的最后是你要连接的数据库，这里我们连接到hcy数据库。

连接数据库成功后，我们可以创建一个集合，并操作里面的数据，我们封装一个方法：

## 插入数据 ##

```
/**
 * 插入数据
 * @method insertData
 * @param {String} mongoConnectUrl 数据库连接
 * @param {String} coll 集合名称
 * @param {Array} data 插入的数据
 * @param {Function} callback 回调函数
 * @return {Null}
 *
 */
function insertData(mongoConnectUrl, coll, data, callback){
	MongoClient.connect(mongoConnectUrl, function(err, db){
		if(err) return console.log(err);
		// 打开集合
		var collection = db.collection(coll);
		// 插入数据
		collection.insertMany(data, function(err, result){
			//console.log(result)
			// 记得要关闭数据库
			db.close();
			callback(result);
		});

	});
}
```

## 查询数据 ##

```
/**
 * 查询数据
 * @method findData
 * @param {String} mongoConnectUrl 数据库连接
 * @param {String} coll 集合名称
 * @param {Object} opation 条件
 * @param {Function} callback 回调函数
 * @return {Null}
 *
 */
function findData(mongoConnectUrl, coll, opation, callback){
	MongoClient.connect(mongoConnectUrl, function(err, db){
		if(err) return console.log(err);
		// 打开集合
		var collection = db.collection(coll);
		// 根据条件查询数据
		var userData = collection.find(opation);
		// 遍历数据
		userData.toArray(function(err2, docs) {
			// docs是查询出来的文档，json对象，可以打印出来看看
			db.close();
			callback(docs);
		});

	});
}
```

## 删除数据 ##

```
/**
 * @method deleteData
 * @param {String} mongoConnectUrl 数据库连接
 * @param {String} coll 集合名称
 * @param {Object} opation 条件
 * @param {Number} num 删除数据的数量，即删除几条
 * @return {Null}
 *
 */
function deleteData(mongoConnectUrl, coll, opation, num, callback){
	var i = num;
	var res = [];
	var tempRes = [];
	var thisFn = arguments.callee;
	MongoClient.connect(mongoConnectUrl, function(err, db){
		if(err) return console.log(err);

		var collection = db.collection(coll);
		if(i > 0){
			i--;
			collection.deleteOne(opation, function(err, result){
				// console.log(result)
				res.push(result);
				thisFn(mongoConnectUrl, coll, opation, i, callback);
				if(i == 0){
					db.close();
					tempRes = res;
					res = []
					i = 0;
					callback(tempRes);
				}
				
			});
		}

	});
},
```

## 修改一条数据 ##

```
/**
 * @method deleteData
 * @param {String} mongoConnectUrl 数据库连接
 * @param {String} coll 集合名称
 * @param {Object} opation 条件
 * @param {Object} data 更新的数据
 * @return {Null}
 *
 */
function deleteData(mongoConnectUrl, coll, opation, data, callback){
	MongoClient.connect(mongoConnectUrl, function(err, db){
		if(err) return console.log(err);

		var collection = db.collection(coll);
		
		collection.updateOne(opation, { $set: data }, function(err, result) {
			db.close();
			callback(result);
		});

	});
},
```






