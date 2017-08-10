title: Ubuntu连接的网络需要登陆认证后才能使用的解决办法
date: 2016-01-14 14:51:34
categories:
- WebFrontEnd
tags:
- Ubuntu
- python
- pycurl
---

> 公司团队内部继续一台服务器，做一些对内使用的网站的部署工作，于是把旁边的一台windows电脑安装成了双系统----一个server版本的Ubuntu，但是公司的网络有个问题，就是每天早上来了都要重新登录认证，之后才能正常使用网络，一开始还好，每天早上来了先启动windows系统认证完网络之后再启动Ubuntu，这样就能正常使用，不过后来突然不好使了，于是想了个办法，使用Python写个脚本，再设一个定时任务，每天定时执行一次该脚本，从此告别网络的烦恼了，这篇文章就记了这次网络处理的过程，用到的一些东西。

<!-- more -->

# Ubuntu下使用U盘 #

由于要执行Python脚本，而这台电脑又没有安装Python，有没有网络，所以只能有网络的电脑下载Python以及一个Python库----pycurl，然后使用U盘拷贝到这台Ubuntu下，下面介绍了Ubuntu下如果使用U盘。

首先执行下面的命令，查看你的磁盘区块：

```$
ls /dev/ | grep sd
```

然后插入U盘，再次执行该命令，再次查看：

```$
ls /dev/ | grep sd
```

观察多出来了什么，一般会有两个，其中一个的名字比另一个多一个数字1，比如sdb和sdb1 

这时候说明U盘被识别了，接下来创建挂载目录：

```$
sudo mkdir -p /mnt/usb
```

然后使用mount命令挂载（假设你的U盘为sdb和sdb1）：

```$
sudo mount /dev/sdb1 /mnt/usb
```

然后就可以使用 /mnt/usb 目录访问U盘内容了：

```$
cd /mnt/usb
ls
```

处理完你想要做的事情之后，比如我将U盘里下载好的Python和pycurl拷贝到Ubuntu上，拔出U盘之前记得卸载，执行下面的命令：

```$
sudo amount  /dev/sdb1 /mnt/usb
```

拔出U盘即可

# Ubuntu编译安装软件 #

在使用Linux时，很多时候我们需要编译安装软件，我安装Python也是编译安装的，借着这个就好好把Ubuntu下编译安装的一些事项介绍一下。

## 1、获取源码包（tar.gz、tar.gz2、zip、tgz），并解压 ##

如果有网络，我们可以通过curl下载，如果没有网络，就像我一样，使用U盘，总之，你要获取到源码包，然后解压：

```$
tar -zxvf Python-3.5.1.tgz	// 我下载的是3.5.1版本的
```

## 2、configure ##

绝大多数linux上需要源码安装的程序可以通过./configure；make；make install这三步来实现安装，而最困难的一步往往都在./configure这一步，那后面的几步是可以很轻松的完成的。

configure是用来做下面这些事的一个脚本：

>1、用以检查计算机建立包所必须的完整性；
2、帮助你根据需要改变默认的路径；
3、用以激活/禁用编译程序中的各种选项；
4、用以改变程序将要被安装的路径；

你可以通过执行下面的命令来查看特定configure脚本所提供的选项个功能：

```$
./configure --help | less
```

例如，默认的configure脚本会指定安装到/usr/local下面，如果你想改变路径，可以执行下面显示的configure脚本命令：

```$
./configure --PREFIX=/opt
```

如果你真的想从零开始编译，可以认真研读一下README或者INSTALL文件。你会看到需要什么样的软件碎片，比起在包系统中，在这些文件中他们通常有着不一样的名字。接下来，可以通过使用apt-cache工具来寻找相应的包。如果你已经通过仓库中编译包，那么还有一个诀窍，就是通过下面的命令来安装包的依赖：

```#
sudo apt-get build-dep <package>
```

这可以确保所有所需的包以来都可以被安装，以期configure不会由于过旧的依赖包而报错，否则你将不得不继续编译相关的依赖。

寻找并修复configure的故障

恰巧在下面这几种情况下，configure可能会失败：

>1、编译的时候需要-dev包；
2、要编译GNOME应用那么需要相应的gnome-level；而编译KDE应用则需要kde-level；
3、C和C++库的名称总是以lib开头，因此，如果./configure报错说丢失了库foo，那么你需要安装libfoo-dev包；
4、如果configure说要“X includes”，那么你可能需要安装下面这些包“xlibs-dev,xlibs-static-dev,x-window-system-dev”，注意，有时候，仅仅需要xorg-dev和x-dev就可以了。-Racecar56 Under Jaunty则需要安装xorg-dev和libx11-dev。
5、查看哪些包被需要的技巧，可以使用auto-apt工具或者apt-file工具（auto-apt可能更快一些）：
```$
sudo apt-get install auto-apt
sudo auto-apt update
auto-apt search missing-file.h
```
6、如果编译软件禁用失败的选项，可以使用./configure –disable-FEATURE选项。
7、如果你自己没能修复你遇到的问题，你也可以寻求ubuntu官方的帮助哦。

如果根本不存在configure的文件，那么最好查看一下configure.ac文件（有必要认真阅读一下INSTALL和README文件），如果configure.ac文件存在，那就是开发者忘记创建最终configure文件了，你可以自己创建，不过需要autoconf包：

```$
sudo apt-get install autoconf
```

安装成功之后，键入：

```$
autoconf
```

如果幸运的话，一个可工作的configure文件应该被创建了。

## 编译 ##

可喜可喝，configure步骤已经完成了，真正的编译安装可以开始了。非常简单：

```$
make
```

现在如果一切顺利的话，你应该的到了一个可工作的程序copy在你的源目录下，你可以运行下面的命令来试用一下：

```
src/program_name
```

如果程序这一步失败了，那么就有可能是程序的bug，这时候你最好联系一下作者，告诉他程序的问题。

安装软件包

如果一切进展顺利的话，你可以键入下面的命令来安装程序：

```$
sudo checkinstall
```

使用CheckInstall可以创建一个.deb包，这货稍后可以很容易被移除哦！

然而，由于某些原因，你不想使用CheckInstall，这是安装的最后方法（不推荐）：

```$
sudo make install
```

# 安装Python #

回到正题，安装Python，前面讲完了Ubuntu下编译安装软件的方法，那么下载安装起来就方便多了：

首先在这里下载Python包 [python.tgz](https://www.python.org/getit/)。

解压安装：

```$
tar -zvxf Python-3.5.1.tgz
cd Python-3.5.1
./configure
sudo make
sudo make install
```

执行python，查看是否安装成功

```$
python
```

# 安装pycurl #

在这里下载资源包：[pycurl.tgz](http://pycurl.sourceforge.net/) 下载，可能需要翻墙，然后解压安装，注意，他有自己的安装方式：

```$
tar -zxvf pycurl-$VER.tar.gz
cd pycurl-$VER
python setup.py install
```

经过如上步骤，我们可以在这台Ubuntu上执行自动登录认证网络的Python脚本了：

```$
python xxx.py
```

# Ubuntu下开启定时任务 #

在Ubuntu下开启定时任务，我们要使用到 cron，什么事cron呢？点击下面的连接了解：

[cron教程](http://wiki.ubuntu.org.cn/UbuntuHelp:CronHowto/zh)

上面的教程并不长，如果你读完了教程，那么看看我是怎么做的吧，首先执行下面的命令编辑crontab文件：

```$
crontab -e
```

然后写下一下内容：

```
8 8 * * * sh ~/test/test.sh
```

上面的命令的意思是：每天早上的8点8分时，执行 tesh.sh脚本，之后保存退出（Ctrl + x  ->  y  ->  enter回车），保存退出的方式根据你使用编辑器决定，自己看吧。保存之后，执行下面的命令，启动cron服务：

```$
sudo service cron start
```

更多命令：

```$
sudo service cron stop 		// 停止cron服务
sudo service cron restart 	// 重启cron服务
```

好了，从此无忧了，不用手动XXOO了。
