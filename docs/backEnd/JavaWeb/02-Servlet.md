# Servlet技术

Servlet 技术本质上是 **处理请求的，不是专门用来渲染页面的**。

## 基本概念

1、Servlet 是JavaEE 规范之一。规范就是接口

2、Servlet 就JavaWeb 三大组件之一。三大组件分别是：Servlet 程序、Filter 过滤器、Listener 监听器。

3、Servlet 是运行在服务器上的一个java 小程序，它可以接收客户端发送过来的请求，并响应数据给客户端。

## Servlet依赖问题

**Servlet** 是 **Java EE（Jakarta EE）规范**，只是一套接口和规范（比如 `javax.servlet` 包），定义了如何编写 Web 组件。

**Tomcat** 是 Servlet 规范的一个 **实现容器（Servlet 容器 / Web 服务器）**，负责解析 HTTP 请求、调用 Servlet、返回响应

Servlet 是 **标准**

Tomcat 是 **实现**

- Tomcat 安装包的 `lib` 目录里确实有 `servlet-api.jar` 或 `javax.servlet-api.jar`。
- 但是这些 jar 只是 **编译用的接口定义**，并不是 Tomcat 自己写的 Servlet。
- 你写的 Servlet 程序（`@WebServlet` 标注的类）运行时，会交给 Tomcat 来调用。

因此，有时候会产生一种错觉：**“好像 Servlet 就是 Tomcat 提供的”**。 实际上，Servlet 属于 **规范**，Tomcat 只是 **实现了规范**

## 继承关系

```ts
1) javax.servlet.Servlet接口
2) javax.servlet.GenericServlet抽象子类
3) javax.servlet.http.HttpServlet这个抽象类是GenericServlet抽象子类
```



## API

### Servlet类

**位置**：`javax.servlet.Servlet`

**定义**：这是最顶层的 Servlet 接口，规定了 `init()`、`service()`、`destroy()` 等生命周期方法。

**作用**：所有 Servlet 都必须实现它（直接实现，或者通过 `GenericServlet` / `HttpServlet` 间接实现）。

```java
public interface Servlet {
    void init(ServletConfig config) throws ServletException;
    ServletConfig getServletConfig();
    void service(ServletRequest req, ServletResponse res) throws ServletException, IOException;
    String getServletInfo();
    void destroy();
}

```

**方法**

service()

```java
作用：是 HttpServlet 接收请求的总入口;

参数：ServletRequest req, ServletResponse resp
    
返回值：无
    
示例：

void service(ServletRequest req, ServletResponse resp) throws ServletException, IOException

```

init()

```java
作用：初始化方法;

参数：ServletConfig config
    
返回值：无
    
示例：

void init(ServletConfig config)

```

getServletConfig()

```java
作用：返回当前 Servlet 的配置对象 ServletConfig，可以通过它获取初始化参数（init-param）或 Servlet 名称

参数：无
    
返回值：ServletConfig对象
    
示例：

@Override
public void init() throws ServletException {
    ServletConfig config = getServletConfig();
    String initParam = config.getInitParameter("paramName");
    System.out.println("初始化参数：" + initParam);
}
```

getServletInfo()

```java
作用：返回 Servlet 的信息（如版本、作者、描述）

参数：无
    
返回值：String，Servlet 信息
    
示例：
@Override
public String getServletInfo() {
    return "FruitServlet v1.0 by Liu";
}
```

destroy()

```java
作用：销毁方法;

参数：无
    
返回值：无
    
示例：
void destroy()
```



### GenericServlet类

**位置**：`javax.servlet.GenericServlet`

**定义**：这是一个抽象类，实现了 `Servlet` 接口，帮你写好了大部分通用方法，只留下 `service()` 让你实现。

**作用**：简化 Servlet 开发。

**说明**：

- `GenericServlet` 是一个 **抽象类**，实现了 `Servlet` 接口。
- 它对 `Servlet` 接口的大部分方法提供了**空实现**（除了 `service()` 需要子类实现）。
- 简化了 Servlet 的开发，只需要继承 `GenericServlet` 并重写 `service()` 方法即可。

**常用方法**：

- `getServletConfig()`：获取 `ServletConfig` 对象。
- `getServletContext()`：获取 `ServletContext` 对象。
- `getInitParameter(String name)`：获取初始化参数。

**示例**

```java
public class MyServlet extends GenericServlet {
    @Override
    public void service(ServletRequest req, ServletResponse res) 
            throws ServletException, IOException {
        res.getWriter().println("Hello GenericServlet!");
    }
}
```

**构造方法**

```java
// 创建Servlet实例
public GenericServlet() {
}
```

**方法**

destroy()

```java
作用：销毁方法;

参数：无
    
返回值：无
    
示例：
@Override
public void destroy() {
    System.out.println("Servlet 正在被销毁，释放资源...");
    // 例如关闭数据库连接
}
```

init()

```java
/**
 * 作用：Servlet 初始化方法，当容器加载 Servlet 时调用
 * 参数：ServletConfig config
 * 返回值：无
 */
@Override
public void init() throws ServletException {
    System.out.println("Servlet 初始化");
    // 获取初始化参数示例
    String initParam = getServletConfig().getInitParameter("paramName");
    System.out.println("初始化参数：" + initParam);
}
```

service()

```java
/**
 * 作用：处理客户端请求的总入口方法
 * 参数：ServletRequest req, ServletResponse resp
 * 返回值：无
 */
@Override
public void service(ServletRequest req, ServletResponse resp) throws ServletException, IOException {
    resp.setContentType("text/html;charset=UTF-8");
    resp.getWriter().write("<h1>Hello GenericServlet</h1>");
}
```

getServletConfig()

```java
/**
 * 作用：获取当前 Servlet 的配置信息对象 ServletConfig
 * 参数：无
 * 返回值：ServletConfig
 */
ServletConfig config = getServletConfig();
String initParam = config.getInitParameter("paramName");
```

getServletContext()

```java
/**
 * 作用：获取 ServletContext 对象（全局作用域）
 * 参数：无
 * 返回值：ServletContext
 */
ServletContext context = getServletContext();
context.setAttribute("appName", "FruitApp");
String appName = (String) context.getAttribute("appName");
```

getInitParameter(String name)

```java
/**
 * 作用：获取初始化参数值
 * 参数：String name - 参数名
 * 返回值：String - 参数值
 */
String paramValue = getServletConfig().getInitParameter("paramName");
System.out.println("初始化参数：" + paramValue);
```

示例

```java
import javax.servlet.*;
import java.io.IOException;

public class MyGenericServlet extends GenericServlet {

    @Override
    public void init() throws ServletException {
        System.out.println("Servlet 初始化");
        String param = getServletConfig().getInitParameter("paramName");
        System.out.println("初始化参数：" + param);
    }

    @Override
    public void service(ServletRequest req, ServletResponse resp) throws ServletException, IOException {
        resp.setContentType("text/html;charset=UTF-8");
        resp.getWriter().write("<h1>Hello from GenericServlet</h1>");
        // 使用 ServletContext
        getServletContext().setAttribute("appName", "FruitApp");
    }

    @Override
    public void destroy() {
        System.out.println("Servlet 销毁，释放资源");
    }
}

```



### HttpServlet类

`HttpServlet` 是 **GenericServlet 的子类**，专门用来处理 HTTP 协议请求（GET、POST 等）。

源代码结构

```java
public abstract class HttpServlet extends GenericServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) {}
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) {}
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) {
        // 内部会根据请求方式分发到 doGet/doPost
    }
}

```

通常我们写业务 Servlet 的时候，都会继承 `HttpServlet`，而不是直接用 `GenericServlet`。

### HttpServletRequest接口

属于包 `javax.servlet.http.HttpServletRequest`

`HttpServletRequest` **是 `ServletRequest` 的子接口**

**作用**：代表一次 **HTTP 请求**，用于 **获取客户端（浏览器）发来的数据**

**常用方法**：

1. **获取请求参数**

   ```java
   String uname = request.getParameter("uname");
   // 获取post请求中的参数同样也是如此
   String fname = req.getParameter("fname");
   String price = req.getParameter("price");
   // 转为大数
   BigDecimal bigPrice = new BigDecimal(price.trim());
   Integer count = Integer.parseInt(req.getParameter("count"));
   String remark = req.getParameter("remark");
   Integer id = Integer.parseInt(req.getParameter("id"));
   
   // 如果请求参数中一个参数有多个值，可以使用getParameterValues获取，得到一个数组
   // localhost/fruit.do?hobby=football&hobby=pingpang&hobby=basketball
   String[] hobbys = request.getParameterValues("hobby");
   ```

   （获取表单 / URL 里传过来的参数）

2. **获取请求头信息**

   ```java
   String agent = request.getHeader("User-Agent");
   ```

3. **获取请求方式（GET/POST）**

   ```java
   String method = request.getMethod();
   ```

4. **获取请求的 URI/URL**

   ```java
   // 假设访问的语句是 http://localhost/fruit.do?id=1&name=aqua
   // uri = /fruit.do
   String uri = request.getRequestURI();
   String url = request.getRequestURL().toString();
   ```

5. **获取客户端 IP 地址**

   ```java
   String ip = request.getRemoteAddr();
   ```

6. **获取 session 对象**

   ```java
   HttpSession session = request.getSession();
   ```

7. 设置request作用域属性

   ```java
   httpReq.setAttribute("age",18);
   无返回值
   ```

8. 获取application属性，也称为Servlet上下文

   ```java
   ServletContext context = httpReq.getServletContext();
   ```

9. 设置请求的编码格式

   ```java
   // 设置请求的编码，防止乱码
   req.setCharacterEncoding("utf-8");
   ```

10. 查询 查询字符串

   ```java
   // 获取查询字符串
   Sting queryString = req.getQueryString() // id=1&name=aqua
   ```

   

### HttpServletResponse接口

**作用**：代表一次 **HTTP 响应**，用于 **向客户端返回数据**。

`HttpServletResponse` 是 `ServletResponse` 的 **子接口**，专门给 HTTP 协议用的，里面扩展了很多方法，比如：

- `sendRedirect(String location)`
- `addCookie(Cookie cookie)`
- `setHeader(String name, String value)`

**常用方法：**

1. **设置响应内容类型**

   ```java
   response.setContentType("text/html;charset=UTF-8");
   ```

2. **获取输出流 / writer 输出内容**

   ```java
   PrintWriter out = response.getWriter();
   out.println("<h1>Hello Servlet</h1>");
   ```

3. **设置响应头**

   ```java
   response.setHeader("Refresh", "3"); // 3秒后刷新
   ```

4. **重定向**

   ```java
   response.sendRedirect("login.html");
   ```

5. **下载文件**（设置响应头、输出流写文件数据）

   ```java
   response.setHeader("Content-Disposition", "attachment;filename=xxx.txt");
   ```

### ServletRequest接口

**包名**：`javax.servlet`

**说明**：

- `ServletRequest` 是 Servlet 的请求对象，封装了客户端请求的数据（请求参数、请求体、请求头等）。
- `HttpServletRequest` 是它的子接口，扩展了 HTTP 协议相关方法。

**方法**

getParameter()

```java
作用：获取请求中的参数值（通常是表单提交或 URL 参数）。
    
参数：String类型的参数名
    
返回值：String —— 参数值（如果参数不存在，返回 null）
    
示例：
// 2 获取请求参数
String uname = req.getParameter("uname");
String pwd = req.getParameter("pwd");
```

getRequestDispatcher()

```java
作用：获取请求转发器，用于在服务器内部进行资源跳转（转发）。
    
参数：String path —— 目标资源路径（相对当前应用的路径，如 "index.html"）
    
返回值：RequestDispatcher —— 请求转发器对象
    
示例：
req.getRequestDispatcher("index.html").forward(req,res)

```

> **`getRequestDispatcher()`**：内部转发（一次请求，地址栏不变）。

getSession()

```java
作用：获取客户端的Session对象
    
参数：
    
返回值：如果客户端没有，则会给客户端分配一个Session
    
示例：


```

setCharacterEncoding()

```java
作用：设置请求时编码
    
参数：String类型的UTF-8
    
返回值：无
    
示例：

req.setCharacterEncoding("utf-8")
```

### ServletResponse接口

`ServletResponse` 是一个 **顶层接口**（通用的响应对象），它本身只定义了最基本的方法，比如：`getWriter()`、`getOutputStream()` 等。

**方法**

getWriter()

```java
作用：获取字符输出流，用于向客户端输出文本数据（如 HTML、字符串）。
    
参数：无
    
返回值：PrintWriter（字符输出流）
    
示例：
PrintWriter out = res.getWriter();
out.println("<h1>Hello, Servlet!</h1>");
```

sendRedirect()

```java
作用：作用：通知客户端重新访问另一个 URL（浏览器会发起新的请求，地址栏会改变）。
    
参数：location（String 类型，重定向的目标路径或完整 URL）
    
返回值：void（无返回值）
    
示例：
// sendRedirect() 不是 ServletResponse 接口的方法，而是 HttpServletResponse 扩展的方法  
// 因为编译器只知道 res 是 ServletResponse 类型，它没有 sendRedirect()
HttpServletResponse httpRes = (HttpServletResponse) res;
httpRes.sendRedirect("success.html");

```

**为什么能强转成功？**

```java
因为在 Servlet 容器 (Tomcat、Jetty...) 里，真正传进来的对象就是 HttpServletResponse的实现类（比如 Tomcat 里的 org.apache.catalina.connector.ResponseFacade）它本来就实现了 HttpServletResponse 接口。

只是 service() 方法的参数写的是 父接口：
public void service(ServletRequest req, ServletResponse res)

为了保持 Servlet 通用性（不仅能处理 HTTP，也能处理其他协议，比如早期还有 FTP、SMTP），设计时只给了最基础的 ServletRequest / ServletResponse。
    
 但我们在 Web 项目里用的几乎都是 HTTP 协议，所以需要手动向下转型。
```

### HttpSession接口

**获取 Session 对象**

```ts
这里的request是Service方法中的参数，是HttpServletRequest类型
HttpSession session = request.getSession();
```

**常用方法**

| 方法                                      | 作用                                  |
| ----------------------------------------- | ------------------------------------- |
| `setAttribute(String name, Object value)` | 设置会话属性，保存属性到Session对象中 |
| `getAttribute(String name)`               | 获取会话属性，获取Session对象中的属性 |
| `removeAttribute(String name)`            | 移除会话属性                          |
| `getId()`                                 | 获取会话 ID（JSESSIONID）             |
| `invalidate()`                            | 使 session 立即失效                   |
| `setMaxInactiveInterval(int interval)`    | 设置会话最大不活动时间（秒）          |

示例：

```java
// 强转为HttpServletRequest
HttpServletRequest httpReq = (HttpServletRequest) req;
HttpServletResponse httpRes = (HttpServletResponse) res;

// 从请求中获取Session对象
HttpSession session = httpReq.getSession();
// 获取SessionID
String id = session.getId();
// 设置会话属性
session.setAttribute("uname","aqua");
// 获取Session对象
Object uname = session.getAttribute("uname");
System.out.println("uname = " + uname);
// 重定向到另一个请求中
httpRes.sendRedirect("marin");
```

**生命周期**

- 创建：第一次调用 `request.getSession()` 时。
- 销毁：超过默认 30 分钟未使用 / 手动调用 `invalidate()`。

### ServletContext接口

**包名**：`javax.servlet.ServletContext`

**作用**：

- `ServletContext` 代表 **整个 Web 应用的上下文对象**。
- 它在 Web 应用启动时由 **Tomcat 容器创建**，整个项目中 **只有一个实例**。
- 所有 Servlet 都可以通过 `ServletContext` 来 **共享数据、获取应用信息、操作资源**。

**获取上下文对象**

```java
// 方式1：通过 Servlet 获取，调用父类中的方法
ServletContext context = this.getServletContext();

// 方式2：通过 request 获取
ServletContext context = request.getServletContext();

// 方式3：通过 session 获取
ServletContext context = session.getServletContext();

// 方式4：通过 ServletConfig对象获取
ServletConfig config = getServletConfig();
ServletContext context = config.getServletContext();
```

**常用方法**

获取应用信息

```java
String path = context.getContextPath();  // 获取当前项目的上下文路径  eg: /myapp
String realPath = context.getRealPath("/index.html"); // 获取服务器上某资源的真实路径
String serverInfo = context.getServerInfo(); // 获取服务器信息 eg: Apache Tomcat/9.0
```

获取全局初始化参数（web.xml 里配置的）

```java
<context-param>
    <param-name>encoding</param-name>
    <param-value>UTF-8</param-value>
</context-param>

String encoding = context.getInitParameter("encoding");
```

全局共享数据

```java
// 存数据（全局有效）
context.setAttribute("username", "Tom");

// 取数据
String user = (String) context.getAttribute("username");

// 移除数据
context.removeAttribute("username");

```

读取资源文件（常用于加载配置文件）

```java
InputStream in = context.getResourceAsStream("/WEB-INF/config.properties");
Properties props = new Properties();
props.load(in);

```

### ServletConfig接口

**方法**

getInitParameter(String name)

```java
/**
 * 作用：获取指定初始化参数的值
 * 参数：String name - 初始化参数名
 * 返回值：String - 对应参数值，如果参数不存在返回 null
 */
ServletConfig config = getServletConfig();
String value = config.getInitParameter("paramName");
System.out.println("初始化参数：" + value);
```

getInitParameterNames()

```java
/**
 * 作用：获取所有初始化参数名的枚举
 * 参数：无
 * 返回值：Enumeration<String> - 初始化参数名集合
 */
Enumeration<String> names = getServletConfig().getInitParameterNames();
while (names.hasMoreElements()) {
    String paramName = names.nextElement();
    System.out.println("初始化参数名：" + paramName);
}

```

getServletName()

```java
/**
 * 作用：获取当前 Servlet 的名称
 * 参数：无
 * 返回值：String - Servlet 名称
 */
String servletName = getServletConfig().getServletName();
System.out.println("Servlet 名称：" + servletName);

```

getServletContext()

```java
/**
 * 作用：获取 ServletContext 对象（全局应用作用域）
 * 参数：无
 * 返回值：ServletContext - 当前 Web 应用的上下文对象
 */
ServletContext context = getServletConfig().getServletContext();
context.setAttribute("appName", "FruitApp");
String appName = (String) context.getAttribute("appName");
System.out.println("应用名称：" + appName);

```

示例

```java
import javax.servlet.*;
import java.io.IOException;
import java.util.Enumeration;

public class MyServletConfigServlet extends GenericServlet {

    @Override
    public void init() throws ServletException {
        ServletConfig config = getServletConfig();
        
        // 获取 Servlet 名称
        System.out.println("Servlet 名称：" + config.getServletName());

        // 获取单个初始化参数
        String param = config.getInitParameter("paramName");
        System.out.println("初始化参数：" + param);

        // 获取所有初始化参数名
        Enumeration<String> names = config.getInitParameterNames();
        while (names.hasMoreElements()) {
            String name = names.nextElement();
            String value = config.getInitParameter(name);
            System.out.println(name + " = " + value);
        }

        // 获取 ServletContext
        ServletContext context = config.getServletContext();
        context.setAttribute("appName", "FruitApp");
        System.out.println("应用名称：" + context.getAttribute("appName"));
    }

    @Override
    public void service(ServletRequest req, ServletResponse resp) throws ServletException, IOException {
        resp.getWriter().write("查看控制台输出 ServletConfig 信息");
    }

    @Override
    public void destroy() {
        System.out.println("Servlet 销毁");
    }
}

```



## Servlet基本使用

### 方式一

1、首先将`GenericServlet类`导入到Idea环境变量中；

```java
GenericServlet 类位于 Tomcat 安装目录中的 tomcat安装目录/lib/servlet-api.jar 包中

点击项目文件夹，点击File，选择 Project Structure，选择Modules，切换到Dependencies选项卡。
    
点击 + 号，选择library，选择Tomcat（如果在Idea中配置过Tomcat，这里会有显示）
```

![image-20250910142738704](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250910142738704.png)

2、编写一个Servlet类；

```java
package com.fruit.servlet;

import javax.servlet.GenericServlet;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

public class loginServlet extends GenericServlet {
    // 当请求到来时，service会被自动调用(通过tomcat利用反射技术进行调用)
    @Override
    public void service(ServletRequest req, ServletResponse res) throws ServletException, IOException {
        // 1. 设置响应类型
        // 这里告诉浏览器返回的是文本内容，编码为UTF-8，避免中文乱码
        res.setContentType("text/html;charset=UTF-8");

        // 2 获取请求参数
        String uname = req.getParameter("uname");
        String pwd = req.getParameter("pwd");

        // 3. 打印到控制台（便于调试）
        System.out.println("账号密码分别为" + uname + pwd);

        // 4. 获取输出流，向浏览器返回响应
        PrintWriter out = res.getWriter();

        // 5. 返回简单HTML响应
        if ("admin".equals(uname) && "123456".equals(pwd)) {
            out.println("<h1>登录成功，欢迎：" + uname + "</h1>");
        } else {
            out.println("<h1>登录失败，请检查用户名或密码</h1>");
        }

        // 6. 关闭流
        out.close();
    }
}
```

```java
service方法中：
    参数中req是请求对象，res是响应对象。

```

3、更改Tomcat配置，设置更新重新部署，IDEA失去焦点重新编译资源（可选）。

![image-20250910142820828](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250910142820828.png)

3、实现service 方法，处理请求，并响应数据；

4、到web.xml 中去配置servlet 程序的访问地址；

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
         version="4.0">
<!--登陆请求-->
    <servlet>
        <servlet-name>login</servlet-name>
        <servlet-class>com.fruit.servlet.loginServlet</servlet-class>
    </servlet>
    <servlet-mapping>
        <servlet-name>login</servlet-name>
        <url-pattern>/login</url-pattern>
    </servlet-mapping>
</web-app>
```

5、新建前端页面 login.html

```html
<!DOCTYPE html>
<html lang="" xmlns="http://www.w3.org/1999/html">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>
        TomCat
    </title>
</head>

<body>
    
    <div id="app">Welcome</div>
    <form action="abcd" method="post">
        账号: <input type="text" name="uname"></br>
        密码: <input type="password" name="pwd"></br>
        <button>登陆</button>
    </form>
</body>
```

✨ 注意：

```java
注意：<url-pattern>/hello</url-pattern>中的地址必须以斜杠打头
```

### 方式二

使用 Servlet3 + 注解方式实现（无需 web.xml）

步骤：

1、下载 **Servlet API 3.x JAR**

```java
例如 javax.servlet-api-3.1.0.jar
    
Maven 仓库下载地址：https://mvnrepository.com/artifact/javax.servlet/javax.servlet-api/3.1.0
```

2、将 JAR 添加到项目的 **classpath** 或 IDE 的 **Libraries** 中

```java
package com.fruit.servlet;

import javax.servlet.annotation.WebServlet;
import javax.servlet.GenericServlet;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.ServletException;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * 使用 Servlet 3.0 注解方式
 */
@WebServlet("/login")  // 设置访问路径为 /login
public class LoginServlet extends GenericServlet {

    @Override
    public void service(ServletRequest req, ServletResponse res) throws ServletException, IOException {
        res.setContentType("text/html;charset=UTF-8");

        String uname = req.getParameter("uname");
        String pwd = req.getParameter("pwd");

        PrintWriter out = res.getWriter();

        if ("admin".equals(uname) && "123456".equals(pwd)) {
            out.println("<h1>登录成功，欢迎：" + uname + "</h1>");
        } else {
            out.println("<h1>登录失败，请检查用户名或密码</h1>");
        }

        out.close();
    }
}

```

3、Tomcat 自带 Servlet API，一般无需打包到 WAR 文件中。

**小结**

- **包**：`javax.servlet` 和 `javax.servlet.annotation`
- **核心类**：`GenericServlet`, `HttpServlet`, `ServletRequest`, `ServletResponse`, `@WebServlet` 等
- **注意**：运行时依赖 Tomcat，不要把 `javax.servlet-api` 打包到 WAR

访问路径：

```java
http://localhost:8080/yourWebApp/login?uname=admin&pwd=123456
```

## 设置跳转

### 服务端内部转发

Tomcat服务内部转发。客户端的URL地址没有发生改变。

**特点**

- **客户端地址栏不变**（始终是第一次请求的 URL）。
- **一次请求**，同一个 `request` 和 `response` 对象。
- 可以在多个 Servlet/JSP 之间共享请求数据。

通过使用ServletRequest类中的 `getRequestDispatcher()`方法

```ts
RequestDispatcher dispatcher = request.getRequestDispatcher("/targetServlet");
dispatcher.forward(request, response);
// 或
if ("admin".equals(uname) && "123456".equals(pwd)) {
    // 使用内部分发器内部转发
    req.getRequestDispatcher("index.html").forward(req,res);
} else {
    out.println("<h1>登录失败，请检查用户名或密码</h1>");
}
```

**适用场景**：

- 登录验证后，转发到主页。
- 控制器（Controller）转发到视图层（View）。

### 客户端重定向

**概念**：由 **服务器通知浏览器**，让浏览器重新发起一个新请求。

**特点**：

- **客户端地址栏会改变**。
- **两次请求**，`request` 不共享（数据无法直接传递）。
- 可以重定向到站外网站。

**实现方式**：

```ts
if ("admin".equals(uname) && "123456".equals(pwd)) {
    // 强转为 HttpServletResponse类型，因为HttpServletResponse中有重定向的方法。
    HttpServletResponse httpRes = (HttpServletResponse) res;
    httpRes.sendRedirect("index.html");
} else {
    out.println("<h1>登录失败，请检查用户名或密码</h1>");
}
```

**适用场景**：

- 登录失败，重定向到登录页面。
- 操作成功后，重定向到列表页面（避免表单重复提交）。

## 会话Session

**会话（Session）**：指浏览器与服务器之间从建立连接到断开连接的一段时间。在 Web 开发中，会话表示“一个用户与网站交互的过程”。

**特点**：

- 一个会话可以包含多次请求和响应。
- HTTP 是无状态的协议，服务器无法主动记住用户，需要借助技术维持会话。
- HttpSession是会话跟踪技术最常用的技术之一，除了HttpSession还有Cookie、URL 重写、隐藏表单域等方式来进行会话跟踪。

### HttpSession 工作原理

服务端会在相应头把SessionID传给客户端，客户端接受到后把SessionID存放在Cookie中，客户端再次发送请求时，会在请求头中的Cookie字段中，携带SessionID。

第一次请求（创建 Session）：客户端（浏览器）第一次访问服务器资源时：

1. 服务器调用 `request.getSession()` → 创建一个新的 **HttpSession** 对象。
2. Tomcat 生成一个唯一的 **SessionID**（例如：`JSESSIONID=ABC123XYZ`）。
3. 服务器在 **响应头 Response Header** 中加入：
4. 客户端浏览器收到响应后，会把这个 **Cookie（JSESSIONID）** 保存起来。

```java
public class AquaServlet extends GenericServlet {
    @Override
    public void service(ServletRequest req, ServletResponse res) throws ServletException, IOException {
        // 强转为HttpServletRequest
        HttpServletRequest httpReq = (HttpServletRequest) req;
        // 从请求中获取SessionID，如果获取不到则分配一个
        HttpSession session = httpReq.getSession();
        // 获取SessionID
        String id = session.getId();
        System.out.println("id = " + id); // 获取有ID D27E119F8D8F593411F1C30385F8A98D

    }
}
```

后续请求（携带 SessionID）：客户端再次访问服务器时：

1. 浏览器会自动在 **请求头 Request Header** 中加入之前保存的 Cookie：

2. Tomcat 收到请求，解析出 `JSESSIONID`，找到对应的 Session 对象。

3. 从而识别这是同一个用户的会话，取出之前保存的属性数据。

![image-20250916163654548](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250916163654548.png)



### 生命周期管理

- **默认失效时间**：30 分钟（Tomcat 可在 `web.xml` 中配置 `<session-timeout>`）。
- **手动失效**：调用 `session.invalidate()`。
- **SessionID 丢失场景**：
  - 浏览器禁用 Cookie（需要 URL 重写传递 `;jsessionid=xxx`）。
  - 浏览器关闭（会话 Cookie 丢失）。



## Cookie

**概念**：小段文本信息，由服务器发送到客户端并保存。

**API**：

```ts
Cookie cookie = new Cookie("username", "Tom");
response.addCookie(cookie);

Cookie[] cookies = request.getCookies();
```

**特点**：

- 存在浏览器端。
- 默认在浏览器关闭后失效，可设置 `cookie.setMaxAge(seconds)` 控制生命周期。

**区别：**

| 特性     | Cookie                   | Session                        |
| -------- | ------------------------ | ------------------------------ |
| 存储位置 | 客户端浏览器             | 服务器端                       |
| 安全性   | 明文，容易被查看         | 相对安全                       |
| 存储容量 | 一般每个 4KB             | 受服务器内存限制               |
| 应用场景 | 保存简单信息，如自动登录 | 保存用户数据、购物车、登录状态 |

## Servlet保存作用域

在 Servlet / JSP 中，可以通过 **保存属性（Attribute）** 的方式，在不同范围内存储和共享数据。这种数据存储的“可见范围”就叫做 **保存作用域（Attribute Scope）**。👉 **作用域就是：某个数据从哪里能被取到、能用多久。**

### 四大保存作用域

Servlet 规范定义了 **四个属性域**（Attribute Scope）：

1. **page**
   - 数据只在当前 JSP 页面内有效。
   - 生命周期：页面创建 → 页面结束。
   - 使用场景：仅在 JSP 内临时存取（现代开发基本不用）。
2. **request**
   - 数据在一次请求中有效，可以在 **请求转发** 的多个资源之间共享。
   - 生命周期：请求创建 → 请求完成。
   - 典型场景：表单提交后，Servlet 把校验结果传给 JSP 显示。
3. **session**
   - 数据在一次会话中有效，可以在同一用户的多次请求之间共享。
   - 生命周期：会话开始（`getSession()`）→ 会话超时/销毁。
   - 典型场景：保存登录用户信息、购物车。
4. **application（ServletContext）**
   - 数据在整个 Web 应用中有效，所有用户、所有请求都能共享。
   - 生命周期：应用启动 → 应用关闭（Tomcat 启动/关闭）。
   - 典型场景：网站访问计数器，全局配置参数。

### 为什么需作用域

- **HTTP 协议是无状态的**，服务器不能自动记住用户。
- 通过 **作用域对象（request、session、application）**，我们可以保存数据并在合适的范围内共享，维持状态。

### 快速记忆口诀

- **一次页面 → page**
- **一次请求（客户端） → request**
- **一次会话 → session**
- **整个应用（只要服务器不停，就一直存在） → application**



> 目前我们使用前后端分离或者使用thymeleaf作为视图技术，不再使用JSP技术（除非是传统项目维护），因此page这个属性域基本不用。

作用域为session的案例：可以获取到Servlet作用域中的数据。

```java
// aquaServlet
@Override
    public void service(ServletRequest req, ServletResponse res) throws ServletException, IOException {
        // 强转为HttpServletRequest
        HttpServletRequest httpReq = (HttpServletRequest) req;
        HttpServletResponse httpRes = (HttpServletResponse) res;

        // 从请求中获取Session对象
        HttpSession session = httpReq.getSession();
        // 获取SessionID
        String id = session.getId();
        // 设置会话属性
        session.setAttribute("uname","aqua");
        
        // 重定向到另一个请求中
        httpRes.sendRedirect("marin");
    }
```

```java
// marinServlet 伪代码
@Override
    public void service(ServletRequest req, ServletResponse res) throws ServletException, IOException {
        // 强转为HttpServletRequest
        HttpServletRequest httpReq = (HttpServletRequest) req;
        HttpServletResponse httpRes = (HttpServletResponse) res;

        // 获取Session对象
        HttpSession session = httpReq.getSession();
        Object uname = session.getAttribute("uname");
        System.out.println("uname = " + uname);
    }
```

作用域为request的案例：可以获取到Servlet作用域中的数据。

```java
// aquaServlet
@Override
    public void service(ServletRequest req, ServletResponse res) throws ServletException, IOException {
        // 强转为HttpServletRequest
        HttpServletRequest httpReq = (HttpServletRequest) req;
        HttpServletResponse httpRes = (HttpServletResponse) res;

        // 向request作用域中设置属性
        httpReq.setAttribute("age",18);
        // 内部转发到marin请求
        RequestDispatcher marin = httpReq.getRequestDispatcher("marin");
        marin.forward(req,res);
    }
```

```java
// marinServlet 伪代码
@Override
    public void service(ServletRequest req, ServletResponse res) throws ServletException, IOException {
        // 强转为HttpServletRequest
        HttpServletRequest httpReq = (HttpServletRequest) req;
        HttpServletResponse httpRes = (HttpServletResponse) res;

        // 获取request属性
        Object age = httpReq.getAttribute("age");
        System.out.println("age = " + age);
    }
```

作用域为application（所有人共用的）的案例：

```java
// marinServlet 伪代码
@Override
    public void service(ServletRequest req, ServletResponse res) throws ServletException, IOException {
        // 强转为HttpServletRequest
        HttpServletRequest httpReq = (HttpServletRequest) req;
        HttpServletResponse httpRes = (HttpServletResponse) res;

        // 获取context属性
        ServletContext context = httpReq.getServletContext();
        Object uname = context.getAttribute("uname");
        System.out.println("uname = " + uname);
    }
```

```java
// aquaServlet
@Override
    public void service(ServletRequest req, ServletResponse res) throws ServletException, IOException {
        // 强转为HttpServletRequest
        HttpServletRequest httpReq = (HttpServletRequest) req;
        HttpServletResponse httpRes = (HttpServletResponse) res;

        // 向request作用域中设置属性
        ServletContext context = httpReq.getServletContext();
        // 设置属性
        context.setAttribute("uname","hanser Is My Angle");
        // 重定向到 marin请求
        httpRes.sendRedirect("marin");
    }
```

## WebServlet注解

`@WebServlet` 注解 **完全属于 Servlet 规范（Servlet 3.0+）的内容**，和Thymeleaf 没有关系。

作用：

- 它用来声明一个 Servlet 类，并指定它的访问 URL 映射。
- 替代了早期在 `web.xml` 里配置 `<servlet>` 和 `<servlet-mapping>` 的方式。

示例：

```java
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/hello")
public class HelloServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.getWriter().write("Hello Servlet!");
    }
}
```

访问路径：`http://localhost:8080/项目名/hello`

`@WebServlet` 在哪里定义：

- 包：`javax.servlet.annotation.WebServlet`（Servlet 3.x 规范）
- 所属：Servlet API（比如 `javax.servlet-api-4.0.1.jar`）

不是 Spring、不是 Thymeleaf 的东西。

### 常见属性

`@WebServlet` 注解里有几个常用参数：

1、urlPatterns` / `value

* 指定 Servlet 的 URL 映射，可以写多个。

```java
@WebServlet(urlPatterns = {"/hello", "/hi"})
public class HelloServlet extends HttpServlet { ... }

// 如果一个servlet只有一个路径可以省略为
@WebServlet("/hello")
public class HelloServlet extends HttpServlet { ... }
```

2、**`name`**

- 指定 Servlet 的名字，等价于 `<servlet-name>`。

```java
@WebServlet(name = "helloServlet", urlPatterns = "/hello")
```

3、loadOnStartup

* 是否在服务器启动时加载（默认为 `-1`：首次访问时才加载）。

```java
@WebServlet(urlPatterns = "/init", loadOnStartup = 1)
```

4、initParams

* 配置初始化参数，等价于 `<init-param>`。

```java
@WebServlet(
    urlPatterns = "/config",
    initParams = {
        @WebInitParam(name = "username", value = "admin"),
        @WebInitParam(name = "password", value = "123456")
    }
)
public class ConfigServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String user = getServletConfig().getInitParameter("username");
        String pwd = getServletConfig().getInitParameter("password");
        resp.getWriter().write("Config: " + user + " / " + pwd);
    }
}

```

**与 web.xml的关系**

- `@WebServlet` 是 **注解方式配置 Servlet**。
- `web.xml` 是 **XML 配置方式**。
- 两者可以并存，但优先级是 **`web.xml` > 注解**。

### 使用场景

- 传统 Java Web 项目（基于 Servlet + JSP/Thymeleaf）开发。
- 用来接收请求，处理业务逻辑，最后转发到视图层。

## 生命周期

实例化：调用无参构造方法

初始化：调用init方法

服务：调用service方法

销毁：调用destroy方法

```java
//演示Servlet生命周期
//loadOnStartup用来设置Servlet的启动时机，默认值是-1，表示第一次访问时才会被实例化初始化
//loadOnStartup的取值是正整数，数字越小越在前面启动
//@WebServlet(urlPatterns = "/hello01",loadOnStartup = 1)
public class Hello01Servlet extends GenericServlet {

    public Hello01Servlet(){
        System.out.println("Hello01Servlet正在实例化...");
    }

    @Override
    public void init() throws ServletException {
        System.out.println("Hello01Servlet正在初始化...");
    }


    @Override
    public void service(ServletRequest servletRequest, ServletResponse servletResponse) throws ServletException, IOException {
        System.out.println("Hello01Servlet正在服务...");
    }

    @Override
    public void destroy() {
        System.out.println("Hello01Servlet正在销毁...");
    }
}
```



> Servlet默认情况下tomcat在启动的时候，它不会实例化初始化。
>
> 当第一次给Hello01Servlet发请求时，它会实例化、初始化、服务。以后每次访问都是直接服务；
>
> 当tomcat服务器停止时，Hello01Servlet的销毁方法会被执行；

## 启动时机

`loadOnStartup`属性的概念，默认值为-1，

使用注解方式设置 loadOnStartup；

```java
// Web 应用启动时就立即创建并初始化 Servlet
// Tomcat/Jetty 启动时就会调用 Servlet 的 init() 方法
@WebServlet(urlPatterns = "/hello01",loadOnStartup = 1)
```

使用web.xml方式设置loadOnStartup；

```java
<servlet>
    <servlet-name>Hello02Servlet</servlet-name>
    <servlet-class>com.atguigu.servlet.Hello02Servlet</servlet-class>
    <init-param>
        <param-name>uname</param-name>
        <param-value>lina</param-value>
    </init-param>
    <init-param>
        <param-name>count</param-name>
        <param-value>100</param-value>
    </init-param>
    <!--注意loadOnStartup配置需要在initParam后边，这是servlet定义的规则-->
    <!--<load-on-startup>1</load-on-startup>-->
</servlet>
```



## 初始化

web.xml配置文件配置初始化参数

```xml
<!--load-on-startup标签 必须放在init-param标签的后边 -->

<servlet>
    <servlet-name>Hello02Servlet</servlet-name>
    <servlet-class>com.atguigu.servlet.Hello02Servlet</servlet-class>
    <init-param>
        <param-name>uname</param-name>
        <param-value>lina</param-value>
    </init-param>
    <init-param>
        <param-name>count</param-name>
        <param-value>100</param-value>
    </init-param>
    <!--<load-on-startup>1</load-on-startup>-->
</servlet>
<servlet-mapping>
    <servlet-name>Hello02Servlet</servlet-name>
    <url-pattern>/hello02</url-pattern>
</servlet-mapping>
```

使用注解配置初始化参数

```java

//演示Servlet的初始化
/*
@WebServlet(urlPatterns = "/hello02",
        initParams = {
            @WebInitParam(name = "uname",value = "lina"),
            @WebInitParam(name="count",value = "100")
        })
*/
public class Hello02Servlet extends GenericServlet {

    //初始化方法可以用来读取一些初始化的参数
    @Override
    public void init() throws ServletException {
        //ServletConfig表示当前Servlet的配置信息
        ServletConfig config = getServletConfig();
        String uname = config.getInitParameter("uname");
        System.out.println("uname = " + uname);
        String count = config.getInitParameter("count");
        System.out.println("count = " + count);
    }

    @Override
    public void service(ServletRequest servletRequest, ServletResponse servletResponse) throws ServletException, IOException {
        System.out.println("Hello02Servlet正在服务...");
    }
}
```

## 上下文参数

在Servlet初始化阶段获取web.xml的上下文参数。这个作用在 封装ViewBaseServlet中使用过。

```xml
<context-param>
    <param-name>hello</param-name>
    <param-value>world</param-value>
</context-param>
```

```java
@WebServlet("/hello03")
public class Hello03Servlet extends GenericServlet {

    @Override
    public void service(ServletRequest servletRequest, ServletResponse servletResponse) throws ServletException, IOException {

        //获取ServletContext有如下几种方式：
        //1.通过request对象可以获取
        //ServletContext context = servletRequest.getServletContext();
        //2.通过session对象也可以获取
        //HttpSession session = ((HttpServletRequest)servletRequest).getSession();
        //ServletContext context = session.getServletContext();
        //3.直接调用父类中的getServletContext()方法
        //ServletContext context = getServletContext();
        //4.通过ServletConfig对象也可以获取
        ServletConfig config = getServletConfig();
        ServletContext context = config.getServletContext();

        String hello = context.getInitParameter("hello");
        System.out.println("hello = " + hello);

        System.out.println("Hello03Servlet正在服务...");
    }
}
```

