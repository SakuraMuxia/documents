

# TomCat

Tomcat的作用是作为Web服务器部署Web项目，从而让客户端能够访问，在这个过程中它扮演者两个角色: Web服务器和Servlet容器。

**Tomcat** 是 Apache 提供的开源 **Servlet 容器** 和 **Web 服务器**。

它实现了 **Servlet、JSP、WebSocket** 等规范，常用于 Java Web 应用。

Tomcat本身也是Java写的，他的里边有很多jar包。

**Web服务器**

![image-20250912161303779](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250912161303779.png)

**Servlet容器**

![image-20250912161247285](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250912161247285.png)



## 安装与配置

下载解压

```ts
官网：https://tomcat.apache.org/
下载 Binary Distribution → Core，例如 apache-tomcat-8.0.XX.zip

解压到任意目录，例如：
D:\tools\tomcat8.x
```

**配置环境变量（可选）**

```java
CATALINA_HOME：Tomcat 根目录
JAVA_HOME：JDK 根目录（是由Java写的）
```

**修改端口**

```ts
默认 8080，如果占用，可修改 conf/server.xml 中 <Connector port="8080" ...>
```

**查看日志**

```java
logs/catalina.out 查看启动日志
logs/localhost.*.log 查看应用日志
```

**修改编码，控制台乱码**

```java
控制台中文乱码的问题
    找到 Tomcat 目录下 conf 文件夹中的 logging.properties 文件
    打开该文件，找到`java.util.logging.ConsoleHandler.encoding`这一项修改编码为GBK
    保存后再重启Tomcat试下
    
窗口标题的中文乱码解决
	使用文本编辑器打开 bin 目录下的 catalina.bat 文件
   	用notepad++编辑器把 catalina.bat 进行转码操作，由UTF-8转为ANSI编码
     修改后再次重启Tomcat
```

![image-20250905115440241](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250905115440241.png)

## Tomcat日志乱码

修改Tomcat源文件中的/conf/logging.[properties](https://so.csdn.net/so/search?q=properties&spm=1001.2101.3001.7020)中的几个编码方式如下

![image-20250919094050061](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250919094050061.png)

```java

```

**作为服务启动**

按下快捷键`Win`+`r`打开`cmd`

切换到 Tomcat9 安装目录下的 bin 目录，输入`service.bat install`回车，或者 直接拖动`service.bat`文件到`cmd`窗口，接着输入`install`也可。出现`The service 'Tomcat9' has been installed.`就说明服务安装成功了。不确定的话可以打开`服务`看下。

![image-20250905162322882](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250905162322882.png)

(另外如果日后需要卸载Tomcat服务的话，执行`service.bat remove Tomcat9`即可完成服务卸载)

**两个启动文件的区别：**

```ts
在 Windows 下启动 Tomcat，你会看到 bin 目录下有两个常用脚本
startup.bat
作用：快捷启动脚本
本质上它只是做了一点环境检查，然后调用 catalina.bat start。
所以我们平常双击 startup.bat，Tomcat 就能跑起来。

catalina.bat
作用：核心启动脚本
它才是真正启动 Tomcat 的脚本，支持不同的参数，例如：
catalina.bat start    :: 启动
catalina.bat stop     :: 停止
catalina.bat run      :: 前台运行（调试用）
catalina.bat configtest :: 测试配置
```

**修改端口号**

```java
在 conf 目录中，修改server.xml配置文件
```

## 部署 Web

方式一：webapps 目录

```java
将你的 .war 文件放到 webapps 目录，Tomcat 会自动解压部署。
    
访问：http://localhost:8080/项目名
```

方式二：`server.xml` 配置

```java
在 conf/server.xml 中配置 <Context>，指定应用路径和目录。
```

## IDEA整合TOMCAT

1、创建JavaWeb项目：

```java
方式1：直接在创建项目的时候勾选 Web Application 4.0 版本
    
方式2：在已创建好的项目中，在项目文件夹上，鼠标右键，Add Framework Support...
    然后勾选 Web Application，就会在项目根目录新增一个web目录，就是tomcat中的webapp里面的项目目录
```

2、在IDEA中配置Tomcat路径，点击 Edit Configurations。 

![image-20250904173607139](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250904173607139.png)

​	2.1 点击 + 号

![image-20250904173643227](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250904173643227.png)

​	2.2 选择本地 Tomcat

![image-20250904173739759](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250904173739759.png)

​	2.3、 配置Tomcat根目录：根目录，bin目录的上一级即可。

​	2.4、 点击 Deployment 部署选项卡，点击 + 号，选择Artifact，选择部署包。

​	2.5、 配置 Application content，/ 不能少，后面xxx为 url中的路径。

```ts
localhost:8080/xxx
```

![image-20250905113528106](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250905113528106.png)

​	2.6 、配置服务启动后访问的地址

![image-20250905113858462](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250905113858462.png)

```java
http://localhost:8080/fruit/index.html
```

2、配置Tomcat的jre目录

![image-20250917111459655](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250917111459655.png)

3、启动Tomcat，使用debug模式（run模式）。

4、如果出现多个 部署包，则可以通过 project structure，来进行删除多余的，部署包。

​	4.1、选中项目文件夹，然后点击File，就会出现。

![image-20250905112937580](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250905112937580.png)

​	4.2、找到 Artifacts 选项卡，就可以删除。然后点击 + 号，选择 WebApplication:Exploded，选择 From Module。选择对应的 java-web 项目（有的是Java项目，有的是Web项目，有的是JavaWeb项目）

## Tomcat依赖包

Tomcat依赖包 servlet-api.jar 和 tomcat-api.jar 包路径找不到报错

选中当前项目，然后点击File，选中Project Structure，

![image-20250917102038328](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250917102038328.png)

双击Tomcat，重新选中，以上两个包（位置在tomcat安装目录的lib文件夹下），然后应用即可。

## Idea更改web项目2

点击 项目structure，然后点击 Facets，选择Web，选择module，然后就会重新生成Artifacts制品

![image-20250917110105423](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250917110105423.png)

配置好之后，查看制品Artifacts，如下，

![image-20250917113501524](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250917113501524.png)

然后在Tomcat Configuration中配置部署Artifacts中的Web文件夹

![image-20250917113611892](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250917113611892.png)



## Tomcat作用

**Tomcat的角色**

- **Tomcat 并不会去实现 `Servlet` 接口的方法**。
- 这些方法由 **我们写的 Servlet 类**（通常继承 `HttpServlet`）来实现。

Tomcat 的作用是：

1. 读取 `web.xml` 或 `@WebServlet` 注解，找到你写的 Servlet 类。
2. 反射创建你的 Servlet 对象。
3. 在合适的时机调用：
   - `init()`（只调用一次，初始化）
   - `service()`（每次请求都会调用，内部再分发到 `doGet()`、`doPost()`）
   - `destroy()`（服务器关闭时调用一次，销毁）

Tomcat 是一个 **Servlet 容器（Web 服务器）**，它的主要作用是：

1. **接收 HTTP 请求**（相当于门卫，把浏览器的请求收下）
2. **调用对应的 Servlet 或 JSP 引擎** 处理请求
3. **把 Servlet/JSP 的处理结果返回给浏览器**

👉 换句话说，Tomcat **只是运行环境**，它不会主动去渲染页面。
