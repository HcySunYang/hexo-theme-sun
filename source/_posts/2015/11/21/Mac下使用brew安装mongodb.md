title: Mac下使用brew安装mongodb
date: 2015-11-21 16:57:48
categories:
- WebFrontEnd
tags:
- mongodb
- 数据库
- brew
---

> Homebrew是Mac下得套件管理器，类似于Linux系统中的 yum 或者 apt-get ，它能让你的Mac更完美。mongodb则是NOSQL数据库，一种文档数据库，不同于传统的关系型数据库(mysql,orcal等)，这篇文章对brew做了基本介绍并使用brew在Mac下安装mongoddb以及其中的问题和注意事项（笔者笔记）

<!-- more -->

最近工作需要完成的任务比较多，所以前一篇系列博客（基于gulp requirejs rjs的前端自动化构建系列文章）还没完成，先在此插一篇博客，记录一些东西，由于最近在工作中需要针对我们的现有前端框架搭建一套配合输出的后台系统，用来完成前端构建，输出项目等工作，于是准备使用node + express做项目估价，mongodb做持久化，而本篇文章，记录了Mac下使用brew安装mongodb的有关东西。

# Homebrew #

[Homebrew](http://brew.sh/index_zh-cn.html) 是Mac下得软件包管理工具，我们可以用它在我们的Mac下安装软件，卸载软件等。要是用Homebrew，首先我们要在我们的Mac下安装Homebrew，执行下面的命令进行安装：

```
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

Homebrew的安装很简单，使用一条ruby命令，我们的Mac电脑自带ruby，你可以在终端中试一下：

```
ruby -v
```

如下，输出ruby的版本：

![Mac终端下查看ruby版本](http://7xlolm.com1.z0.glb.clouddn.com/201511211.pic.jpg)

执行安装命令，安装brew，安装完成后，我们就可以使用brew安装Mac下得软件了，在安装mongodb之前，我们再了解了解brew，首先如何卸载brew?如果你不知道怎么去卸载的话，你可以再次执行一次brew的安装命令，如果你已经安装了brew再次执行安装命令的话，会给你一个提示，告诉你你的系统已经安装过brew了，如果想要重复安装就执行卸载命令，这样，你根据终端的提示执行以下卸载命令就可以了，另外我也把brew的卸载命令贴出来：

```
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/uninstall)"
```

其实就是把安装命令中的install改成uninstall就ok了。

下面列出一些brew的常用命令：

1、跟新brew本身

```
brew update
```

2、使用brew安装软件

```
brew install soft_name
// soft_name为你所要安装软件的标志，如使用brew安装git
brew install git
```

3、使用brew卸载软件

```
brew uninstall soft_name
// soft_name为你所要卸载软件的标志，如使用brew卸载git
brew uninstall git
```

4、显示使用brew安装的软件列表

```
brew list
```

5、更新软件

```
brew upgrade		// 更新所有使用brew安装的软件
brew upgrade git	// 更新某个使用brew安装的软件
```

6、查看哪些软件需要更新

```
brew outdated
```

7、查找软件

```
// 当你记不清软件的名字的时候，你可以使用search，只需要写去几个字母，他就会帮你联想，并把所有可能的结果输出给你
brew search 
```

下图为使用brew search gi的输出结果：

![使用brew search gi](http://7xlolm.com1.z0.glb.clouddn.com/201511212.pic_hd.jpg)

8、查看使用brew安装的东西，安装在哪里

```
brew --cache
```

[更多命令](https://github.com/Homebrew/homebrew/blob/master/share/doc/homebrew/FAQ.md)

# 使用brew安装mongodb #

1、有了brew，我们安装mongodb就变得很简单了：

```
brew install mongodb
```

![安装完成](http://7xlolm.com1.z0.glb.clouddn.com/201511213.pic.jpg)

2、之后将我们的mongodb升级一下，确保版本最新的

```
brew upgrade mongodb
```

如果你现在就启动mongo你并不会成功，如下：

```
Failed to connect to 127.0.0.1:27017, reason: errno:61 Connection refused

Error: couldn't connect to server 127.0.0.1:27017 (127.0.0.1), connection attempt failed at src/mongo/shell/mongo.js:146

exception: connect failed
```

3、在启动mongo之前，我们需要创建一个目录，为mongo默认的数据写入目录

```
mkdir -p /data/db
```

4、然后给刚刚创建的目录以可读可写的权限

```
chown `id -u` /data/db
```

5、修改目录

```
// /data/db 目录是mongo的默认目录，如果你想使用其他目录，可以使 --dbpath 参数
mongo --dbpath dir_name
// dir_name 为你的目录名字
```

现在，你可以放心的启动mongodb了，执行下面的命令：

```
mongod
```

假如依然包上面那个错误的话，或许你可以试试下面的命令：

```
brew services start mongodb
```

不过，brew services 已经将要废除了，并且已经没有人维护了，具体查看[点击这里](https://github.com/Homebrew/homebrew/issues/30628)

现在如果一切顺利的话应该像下面这样：

![启动mongodb成功](http://7xlolm.com1.z0.glb.clouddn.com/201511214.pic.jpg)

如果有一天你发现你的数据库突然启动不了了，可能是你为正常关闭导致的，你可以删除掉mongod.lock文件，然后重新启动，如果还是不可以，你可以查看一下进程，然后杀掉：

```
ps -aef | grep mongo
```

如下：

![进程](http://7xlolm.com1.z0.glb.clouddn.com/201512031.pic.jpg)

然后根据进程ID杀掉进程：

```
sudo kill 6955
```

重新启动mongodb服务，即可：

```
mongod
```

我们可以新开一个终端窗口连接数据库并试着查看所有的数据库：

```
mongo

show dbs
```

![查看数据库](http://7xlolm.com1.z0.glb.clouddn.com/201511215.pic.jpg)

最后，像大家推荐一个连接mongo的客户端可视化工具 [robomongodb](http://www.robomongo.org/)，它是跨平台的工具，我们可以下载Mac版的，安装后打开，界面是这个样子：

![robomongodb界面](http://7xlolm.com1.z0.glb.clouddn.com/201511216.pic.jpg)

点击create按钮，创建新的连接，会弹出一个连接的配置框，里面有一些默认的参数，我们保持默认，直接点击save，再点击connect按钮就好了：

![点击create创建连接](http://7xlolm.com1.z0.glb.clouddn.com/201511217.pic.jpg)

下图是点击connect连接数据库成功后的界面

![点击connect连接数据库](http://7xlolm.com1.z0.glb.clouddn.com/201511218.pic.jpg)

好了，其他的作者还要继续捣鼓捣鼓，大家共勉，努力学习吧骚年。

