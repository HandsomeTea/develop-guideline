# cemeta-project-specification

cemeta项目规范



## nodejs相关

- nodejs版本使用`v18.16.0`，npm版本为`9.5.1`，[参考](https://nodejs.org/zh-cn/download/releases)。


## eslint相关

- eslint配置文件`.eslintrc.js`中rules的配置，请使用`eslint/rules.js`提供的内容。
- 使用`husky`在git操作钩子中进行提交前的代码检查。
  - `husky`配置过程如下：
    - 安装依赖：`npm install husky --save-dev`
    - 在`package.json`中添加如下内容：

    - ```

        ...,

        "scripts": {
          ...
          "prepare": "./node_modules/.bin/husky install",
          ...
        },

        ...

      ```
    - 开始配置，运行一次：`npm run prepare`
    - 设置执行git的`commit`指令前的钩子：`npx husky add .husky/pre-commit "npm run eslint"`
    - 设置执行git的`push`指令前的钩子：`npx husky add .husky/pre-push "npm run build"`





## git相关

- 请使用尽量使用`git`命令行提交代码，尤其commit部分，务必使用`npm run commit`指令。`commit`指令配置如下：

  - 安装相关依赖：`npm install -D cz-customizable`。
  - 在项目根目录创建`.cz-config.js`，内容如`git-cz/config.js`，可根据项目实际情况，修改自定义内容。

  - `package.json`添加内容：

    - ```

      ...,

      "scripts": {
        ...
        "commit": "./node_modules/cz-customizable/standalone.js",
        ...
      },

      ...

      "config": {
        "commitizen": {
          "path": "node_modules/cz-customizable"
        }
      },

      ...

      ```



## 服务器log
- 请使用`log/logger.ts`提供的日志模块。
- 安装相关依赖：`npm install --save log4js`。
- 所有后端服务，请务必在请求入口和出口打印追踪日志。


## Api接口

- 所有api后端请求接口，均以`/api/${cemeta/cemetaadm/cemetamgr/cemetapub/cemetaext}/${服务名}/${接口版本号}/`开头。
  - `${cemeta/cemetaadm/cemetamgr/cemetapub/cemetaext}`：
    - 使用`cemeta`的接口必须为客户端在登录状态下调用。
    - 使用`cemetaadm`的接口必须为管理员角色在客户端才可以调用。
    - 使用`cemetamgr`的接口是服务器之间调用.
    - 使用`cemetapub`的接口为无鉴权的接口，客户端在未登录状态下调用。
    - 使用`cemetaext`的接口为专门对外提供的接口，由外部客户端/服务器调用。
  - 服务名：指的是单独部署的后端程序的模块名称，一个程序一个服务名，区分的后端程序，用途为服务端接到请求时区分请求以便分发到对应的后端程序。
  - 接口版本号：一般为`v1`，`v2`等。
- api接口遵循restful接口规范。
- 所有api接口地址全部为小写字母组成(不包含路由变量)。
- 接口请求成功的结果不要做任何处理，不需要统一的数据格式。
- 接口请求不成功的结果，返回统一的数据格式，例如：
  - ```

    {
      "status": 404
      "code": "FORBIDDEN", // 错误码
      "message": "错误提示内容", // 如果message中有变量，会用js的占位符替换，占位符的值取自reason，一般code和message中的变量一致
      "reason": {}, // 可选项，code中如果有变量，变量的值依次按顺序在reason中取
      "source": [] // 记录的是错误信息在各个nodejs服务间的传播链路，数组中存放的是服务名
    }

      ```
- 接口文档使用[apidoc](https://apidocjs.com/)，不要单独去写接口文档，同时接口文档需要提供错误码文档。
  - 安装相关依赖：`npm install -D apidoc`。
  - 在项目根目录创建`apidoc.json`，内容如`apidoc/apidoc.json`。
  - `package.json`添加内容：

    - ```

      ...,

      "scripts": {
        ...
        "doc": "./node_modules/.bin/apidoc -i ./src -o ./apidoc",
        ...
      },

      ...

      ```

  - 生成文档：`npm run doc`
- 关于header
  - 所有接口如果header中需要做日志追踪，请遵循Zipkin B3链路传播规范，在header中设置：
    - `X-B3-TraceId`：整个调用链路的id，长度为32，由小写字母和数字组合的随机字符串(16进制的数字)。
    - `X-B3-ParentSpanId`：上个链路的id，长度为16，由小写字母和数字组合的随机字符串(16进制的数字)。
    - `X-B3-SpanId`：当前链路的id，长度为16，由小写字母和数字组合的随机字符串(16进制的数字)。
    - `X-B3-Sampled`：取值为字符串1。
- 关于鉴权
  - 后端服务器之间相互调用，接口的鉴权请使用`jwt`：请求方在`header`中设置`Authorization`，值为`JWT ${jwt生成的token}`。
  - 接口的鉴权，参考`${cemeta/cemetaadm/cemetamgr/cemetapub/cemetaext}`中的说明，其中`cemeta/cemetaadm`类型的接口鉴权，请求方在`header`中设置以下数据：
    - `x-user`：用户id。
    - `x-auth`：用户登录时的token。
  - `cemetamgr`类型的接口鉴权，请求方在`header`中设置以下数据：
    - `authorization`：服务器之间鉴权的jwt数据，格式为`JWT ${jwt-token}`。
- controller和service
  - 在controller，如express的`router`，nestjs的`controller`中，不应出现业务逻辑的代码，而是直接调用service中的程序。
  - controller调用service传值时，不应直接将如`req.body`的对象当做参数传入，要将具体的参数传入，如：`{ userId: req.body.userId }`。
  - service中的逻辑代码，如果返回给controller的是单一的返回参数，如只返回一个数字或字符串或boolean，应使用Object设置键值返回，如：`{ result: 0 }`


## 数据库相关
- 统一采用mongodb数据库和`mongoose`ORM包。
- 在使用`mongoose`时，务必做统一封装，我们希望对数据的操作在程序上有一个统一的可以控制的地方。
- 数据库表统一使用蛇形命名法，如：`temp_data`，全小写，且表名不加`s`。
- 数据库字段统一使用驼峰命名法，如：`userName`。
- 尽量不要指定mongodb的`_id`，最好使用mongodb自带的`ObjectId`的数据结构。
- 使用`mongoose`时开启为数据自动添加`createdAt`和`updatedAt`字段的配置。

## 环境变量
- 所有后端`express`框架的项目请采用`configs/env.ts`中提供的方式配置和读取环境变量：
  - 其中`developConfig`中配置的数据应为开发环境下的数据，同时如果生产环境没有配置所需的环境变量，应在提交代码时，将其设置为生产环境配置的数据。
  - 调用方式举例：`getENV('NODE_ENV')`。
- 所有后端`nestjs`框架的项目，请直接使用如：`process.env.NODE_ENV`的方式或取环境变量
  - 如果`nestjs`项目在服务器环境不配置环境变量，则应在`.env.local`中设置默认的环境变量并提交到仓库。


## 其它
- 前后端项目均要求使用typescript。
- 前端项目要求前后端分离。
- 所有项目均需在根目录下编写运行所需的完整`Dockerfile`，前端项目还需根据需要在根目录提供nginx部署的配置文件`nginx.conf`。
- 所有`express`框架的项目，在`package.json`中：
  - 需要指定依赖包的版本号如：`1.2.3`而不是`^1.2.3`，同时要提供对应的`package-lock.json`。
- 所有`nestjs`框架的项目，`package.json`中的依赖包，除了nestjs自身的包外，其它依赖包，需要指定依赖包的版本号如：`1.2.3`而不是`^1.2.3`，同时要提供对应的`package-lock.json`。
- 命令和脚本：
  - 所有前后端项目打包命令统一为：`npm run build`。
  - 所有前后端项目开发模式统一启动命令为：`npm run start`。
  - 测试命令统一为(如有)：`npm run test`，`nestjs`项目使用框架自带的测试命令即可。
  - 所有前后端生成文档命令统一为：`npm run doc`。
  - eslint检查统一命令为：`npm run eslint`，`nestjs`项目使用框架自带的`lint`命令即可。
