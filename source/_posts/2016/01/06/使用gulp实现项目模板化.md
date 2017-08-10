title: 使用gulp实现项目模板化
date: 2016-01-06 15:30:32
categories:
- WebFrontEnd
tags:
- gulp
- nodejs
- 自动化
- 插件
---

> 当一个大项目逐渐成型，或者一个框架又或者一个开发方式逐渐成型的时候，总会有一个所谓的“套路”，我们在工作中往往遵循着这个套路走。所以更换一家公司或者一个部门团队的时候，上手项目并不难，你只需要掌握这个团队管用的“套路”就ok了，关键是：要想办法优化这个“套路”。

<!-- more -->

之前一直在做内部框架的跨平台和自动化构建的事，加上开发业务逻辑的页面已经完成，就没去优化这个开发套路，什么套路呢？当项目中需要一个新的H5页面的时候，就需要手动去copy之前的一个页面代码，然后逐个修改，改成另外一个页面。去掉代码中的业务逻辑，会发现除了名称不同，其余的代码全部相同，秉承着“上级命令一定要完成”总宗旨，非也，是秉承着“我是一个程序员”的宗旨，就应该将一切需要手工完成的工作变成自动化的。所以......所以就不吹NB了，好好写......

一个古老的思路是，你应该有一套模板，当有新的页面需要开发的时候，只需一条命令或者一个按钮就可以自动帮你基于这套模板创建一个可直接用于开发的环境。为了达成这个目的，我是用到了：

1.gulp

gulp的教程这里就不写了，这里讲的很清楚 [gulp教程](http://www.gulpjs.com.cn/docs/api/)

2.该功能主要使用到的gulp插件

[gulp-load-plugins](https://www.npmjs.com/package/gulp-load-plugins) 加载gulp插件的插件

[gulp-file-include](https://www.npmjs.com/package/gulp-file-include) 文件包含插件

[gulp-data](https://www.npmjs.com/package/gulp-data) 提供数据，该数据可被其他gulp插件使用

[gulp-rename](https://www.npmjs.com/package/gulp-rename) 重命名文件

[gulp-template](https://www.npmjs.com/package/gulp-template) 渲染模板

上面的插件连接，点击进去就是文档。

笔者认为最好的学习方式就是有一个能运行起来的项目，然后看着代码一步步走，所以我把模板化从公司的项目中抽离出来，并做了删减，提炼出一个完整的可运行的项目，并放在我的git仓库，可以运行一下命令查看效果，调试并学习：

```
git clone git@github.com:HcySunYang/modapp.git

npm install

gulp createapp --name=aaa
```

下面是gulpfile.js文件和package.json文件

# gulpfile.js #

```
var gulp = require('gulp');
var gulpLoadPlugins = require("gulp-load-plugins");
var plugins = gulpLoadPlugins();
var util     = require("gulp-util");
var devPath = './html';
var appData = {};

/*
 * @desc 组装模板
 * @src  devPath 
 * @deps 
 * @dest devPath + '/tmod/app/dest'
 */
gulp.task('includeTpl',function () {
    // 获取 gulp 命令的 --name参数的值 （gulp createapp --name=aaa）
    var appName = util.env.name || 'special';
    
    // 首字母大写
    var appNameBig = appName.replace((/\w/), function(char){
        return char.toUpperCase();
    });

    appData={
        app: appName,
        appapi: appNameBig,
        appDo: appName + "Do",
        title: appName
    }
    return gulp.src([
            devPath + '/tmod/app/app.tpl',
            devPath + '/tmod/app/appDo.tpl',
            devPath + '/tmod/app/app.html',
            devPath + '/tmod/app/appApi.tpl',
            devPath + '/tmod/app/appapiInterFace.tpl'
        ])
        .pipe(plugins.fileInclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest(devPath + '/tmod/app/dest'));
});

/*
 * @desc 解析模板
 * @src  devPath 
 * @deps includeTpl
 * @dest devPath + '/tmod/app/dest'
 */
gulp.task('resolveTpl',["includeTpl"],function () {
    return gulp.src([
            devPath + '/tmod/app/dest/app.tpl',
            devPath + '/tmod/app/dest/appDo.tpl',
            devPath + '/tmod/app/dest/app.html',
            devPath + '/tmod/app/dest/appApi.tpl',
            devPath + '/tmod/app/dest/appapiInterFace.tpl'
        ])
        .pipe(plugins.data(function () {
            return {app: appData.app, appDo:appData.appDo,title:appData.title, appapi : appData.appapi};
        }))
        .pipe(plugins.template())
        .pipe(gulp.dest(devPath + '/tmod/app/dest'));
});

/*
 * @desc 创建部署
 * @src  devPath + '/tmod/app/dest 
 * @deps resolveTpl
 * @dest devPath + '/modules/'
 */
gulp.task('createapp', ["resolveTpl"], function () {
    // 创建部署入口js文件，如 index.js
    gulp.src(devPath + '/tmod/app/dest/app.tpl')
        .pipe(plugins.rename({
            basename: appData.app,
            extname: ".js"
        }))
        .pipe(gulp.dest(devPath + '/target/'+appData.app));

    // 创建部署业务逻辑js文件，如 indexDo.js
    gulp.src(devPath + '/tmod/app/dest/appDo.tpl')
        .pipe(plugins.rename({
            basename: appData.appDo,
            extname: ".js"
        }))
        .pipe(gulp.dest(devPath + '/target/'+appData.app));

    // 创建部署html页面文件，如 index.html
    gulp.src([devPath + '/tmod/app/dest/*.html'])
        .pipe(plugins.rename({
            basename: appData.app,
            extname: ".html"
        }))
        .pipe(gulp.dest(devPath + '/target/'+appData.app));

    // 创建部署api接口js文件，如 indexApi.js
    gulp.src(devPath + '/tmod/app/dest/appApi.tpl')
        .pipe(plugins.rename({
            basename: appData.app + 'Api',
            extname: ".js"
        }))
        .pipe(gulp.dest(devPath + '/target/clientApi'));

    // 创建部署跨平台接口js文件，如 indexapiInterFace.js
    gulp.src(devPath + '/tmod/app/dest/appapiInterFace.tpl')
        .pipe(plugins.rename({
            basename: appData.app + 'apiInterFace',
            extname: ".js"
        }))
        .pipe(gulp.dest(devPath + '/target/clientApi'));
});

```

# package.json #

```
{
  "name": "app",
  "project": "app",
  "version": "1.0.0",
  "host": "http://10.0.69.79",
  "path": "/home/huangjian/workstation/bridge/newssdk/bin",
  "devDependencies": {
    "gulp": "^3.9.0",
    "gulp-data": "^1.2.0",
    "gulp-file-include": "^0.13.7",
    "gulp-load-plugins": "^0.10.0",
    "gulp-rename": "^1.2.0",
    "gulp-template": "^2.1.0",
    "gulp-util": "^3.0.6"
  }
}

```

大家重在研究代码的思路和各个组件的用法及配合，不要去研究代码的细节，比如这个构建出来的项目有什么用啊？当然对于你来说没什么用，因为这个是应用在公司项目中的，这个是为了给大家方便，抽离出来的，所以大家把握好重点。



