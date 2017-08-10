title: 使用npm和node开发命令行工具并使用npm管理你的包
date: 2016-01-14 14:51:34
categories:
- WebFrontEnd
tags:
- node
- npm
- 命令行工具
---

> 对于前端开发者来讲，玩儿js的你们肯定对nodejs已经npm并不陌生，现在npm已经集成到了node里，所以当你安装了node之后也就默认安装了npm，npm的全称是node package manager : node 包管理器，提供一个registry，你只要注册一个npm账号，就可是使用npm进行包管理了，比如发布，安装，更新...等等。最近再做公司内部框架的重构，准备使用npm开发一套命令行工具，管理核心代码，只输出业务目录给框架使用者，一方面减轻了项目体积，另一方面给开发者一个更好的开发体验，同时保证了核心代码的安全，这篇文章记录了使用npm进行包管理的事项、已经使用npm和node开发命令行工具的方法。

<!-- more -->

想要使用npm进行包管理，有两种方案，一种是使用npm官方，即[https://www.npmjs.com/](https://www.npmjs.com/)，注册你自己的账号然后进行管理，但是如果不使用私有包的话，你的代码是暴露的，如果是企业内部的私有包，不想对外暴露，避免潜在的风险，那么就必须使用私有包管理，不过，是要交保护费的，虽然也不多，如果你连保护费都不想交的话，那么也有办法，搭建私有npm服务，国内比如[cnpm](https://github.com/cnpm/cnpmjs.org)，或者使用npm官方提供的 [On-Site](https://www.npmjs.com/npm/on-site)，都可以搭建企业内部的私有npm服务，但是我可以在这里给大家提个醒，如果你真的要自己搭建私有npm服务，那么你准备好接受各种折磨，让我偷乐一会儿......

乐完了，回到正题，为了给大家讲解，我这里就采用npm官方registry进行npm包管理的操作，首先，你要有个女朋友，哦 sorry，是有一个npm账号：

# 注册npm账号 #

填写你的信息注册账号，然后会给你发一封激活邮件，激活你的账号就ok了，就是一个普通的不能再普通的注册流程了：

![注册npm账号](http://7xlolm.com1.z0.glb.clouddn.com/201501301.pic.jpg)

有了账号，就可以登录，注意，我说的是在终端登录，不是在网站登录，打开你的终端，执行命令：

```$
npm login
```

会让你输入你刚才注册的用户名密码已经邮箱，你就实话实说就ok了，它不会为难你的，如下图：

![终端中登录npm](http://7xlolm.com1.z0.glb.clouddn.com/201501302.pic.jpg)

如果一切正常，那么不会有任何提示信息，说明你登录成功了。

我们写一个测试包，测试一下：

执行：

```$
mkdir test
cd test
npm init
```

生成package.json文件，这个文件很重要，npm就是依据这个文件进行包管理工作的，然后我们我们新建一个html文件：

```$
touch index.html
```

这个html文件是我随便建的，作为我们这个测试包的内容，现在我们已经有了一个最简单的包了，接下来，我们就可以把我们的包，通过npm推送到远程，进行管理，执行：

```$
npm publish
```

这条命令的意思是发布我们的包，如果你真的按照我的教程敲代码，你可能会得到如下错误：

![npm publish发布错误](http://7xlolm.com1.z0.glb.clouddn.com/201501303.pic.jpg)

如果你可以确认你已经使用了正确的账号登陆，那么就不要被提示信息所迷惑着，这可能是你所要发布的包的名字，已经有人使用并发布了，编辑你的package.json文件，找到name字段，修改一个独一无二的名字：

![修改name字段](http://7xlolm.com1.z0.glb.clouddn.com/201501304.pic.jpg)

好吧，我承认这个名字99.99999999%可以用了。

然后再发布，就可以成功了，执行：

```$
npm publish
```

如下：

![发布成功](http://7xlolm.com1.z0.glb.clouddn.com/201501305.pic.jpg)

发布成功后，在npm官网登陆你的账号，你是可以看到你自己的包的：

![你发布的包](http://7xlolm.com1.z0.glb.clouddn.com/201501306.pic.jpg)

发布了包之后，你就可以像安装其他第三方包一下来安装你的包了：

```
npm install <you package name>
```

如果你的本地包有更新，需要再次发布的话，直接执行 npm publish 是不可以的，你还要更新一下包的版本号，然后再执行发布命令才行，也就是修改一下package.json文件的 version 字段，不过，不需要手动修改，执行：

```
npm version <update_type>
```

update_type 可以取三个值：major minor patch

我们知道，版本号的格式是这样的 1.0.0

其中 1 是主要版本，只有重大的更新才会修改它的值（major），第二个位置是次要的(minor)，第三个位置是补丁(patch)，根据包修改的程度来定你要修改那个位置的数字，为了测试，我们就执行如下命令：

```$
npm version patch
```

![更新版本](http://7xlolm.com1.z0.glb.clouddn.com/201501307.pic.jpg)

我们看到，版本由原来的 1.0.0 变成了 1.0.1。这时，我们就可以执行 npm publish 命令更新我们的包了。

上面描述了最基本的管理命令，npm远不止这些，官方文档写的很详细：[npm](https://docs.npmjs.com/getting-started/what-is-npm)

# 如果使用npm和node开发命令行工具 #

什么是命令行工具？最通俗的解释就是，敲一串字符，命令行能够识别，并做一些事。比如 ls 查看文件， cd 切换目录等等，都是命令行工具，及可执行的文件。

其实用npm和node开发命令行工具特别简单，我们还继续使用上面的例子。

## 第一步：编写一个nodejs文件 ##

名字你随便起，这里我们就叫 test.js，在package.json的同级目录新建一个test.js文件，并编辑如下内容：

```test.js
#! /usr/bin/env node

console.log('test command line!');
```

注意，第一行的 #! /usr/bin/env node 不可以省略，这是告诉机器，这个文件要在node环境下运行，当我们直接执行这个文件的时候，相当于使用node去执行它，即：

```
./test.js
```

相当于

```
node ./test.js
```

## 第二部：在package.json文件中添加bin字段 ##

```package.json
"bin": {
    "hcy-cmd": "./test.js"
}
```

bin字段是一个json对象，键是命令的名称，即我们可以在终端执行的命令名称，值是该命令对应的可执行文件，在我们这个例子中，就是当前目录下的 test.js 文件，其中，命令的名称你自己随便定义。

致此，我们还没有结束，如果现在就在终端敲 hcy-cmd 的话，是不行的，还需要最后一步。

## 第三部：连接到全局 ##

如何连接到全局，很简单，只需一条命令，执行：

```$
npm link
```

这是在终端敲入我们自定义的命令，查看结果：

![执行命令](http://7xlolm.com1.z0.glb.clouddn.com/201501308.pic.jpg)

这样，我们就可以发挥我们的创造力，利用它做一些有趣的事情，快去实现你的想象吧，另外推荐两个库，配合它们，我们可以开发出很强大的命令行工具：

[shelljs - 强大的执行unix系统命令的npm包](https://www.npmjs.com/package/shelljs)

[yargs - 命令行参数的处理](https://www.npmjs.com/package/yargs)






