# 赛事通前端项目（SaiShiTongFE）

本项目为 **赛事通（智能运动会系统）** 的前端工程，基于 **Vue 技术栈** 构建，提供赛事管理、用户管理、视频流展示、帧界篮球等相关页面的交互界面。

前端可通过开发服务器运行，也可打包后部署在任意静态资源服务器（如 Nginx、Apache、Docker、OSS、Vercel 等）上。

***

## 📦 技术栈

* Vue 2 / Vue CLI

* Vue Router

* Axios

* Element UI

* ECharts（可选）

* 前后端分离架构

***

## 🚀 项目运行

### 1. 安装依赖

npm install

### 2. 开发环境启动（含热更新）

npm run serve

启动后默认访问：

[http://localhost:8081](http://localhost:8081)

### 3. 生产环境打包

npm run build

打包完成后，将生成 dist/ 目录，可部署至任意静态资源服务器。

***

## 📁 部署方式

### 方式一：使用 Vue 开发服务器

适合本地调试或后端联调。

npm run serve

### 方式二：部署至 Nginx / Apache / 静态资源服务器

将 dist/ 内所有文件复制到服务器根目录，例如 Nginx：

/usr/share/nginx/html/

示例 Nginx 配置：

server {\
 listen 80;\
 server\_name your-domain.com;

 location / {\
  root /usr/share/nginx/html;\
  try\_files $uri $uri/ /index.html;\
 }\
}

***

## 🔧 后端地址配置方式

前端支持 **动态修改后端地址**，无需重新打包。

### 方式一：系统内设置页面修改（推荐）

入口路径：

我的 → 设置（小齿轮） → 系统配置

可配置：

* 后端 Base URL

* WebSocket / 流媒体地址

* 静态资源访问路径

### 方式二：直接访问配置路由

/system-settings

无需菜单入口，直接访问即可更改系统配置。

***

## 🗂 项目结构

src/\
├── api/（接口封装）\
├── assets/（静态资源）\
├── components/（公共组件）\
├── router/（路由配置）\
├── store/（Vuex）\
├── views/（页面）\
├── utils/（工具函数）\
└── main.js

***

## 🔗 配套后端项目

后端仓库地址：

<https://github.com/BLUEINGs/SaiShiTong>

***

## 🌐 公网部署信息（示例）

* 赛事通前端（v0.1.0）：\
  <http://blueing.moenya.net:90>

* 后端地址：\
  <http://blueing.moenya.net:8080>

⚠ 注：由于服务器性能限制，公网部署暂不支持帧界篮球模块。
