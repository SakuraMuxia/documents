# Servlet技术

## 基本概念

1、Servlet 是JavaEE 规范之一。规范就是接口

2、Servlet 就JavaWeb 三大组件之一。三大组件分别是：Servlet 程序、Filter 过滤器、Listener 监听器。

3、Servlet 是运行在服务器上的一个java 小程序，它可以接收客户端发送过来的请求，并响应数据给客户端。

## API

### Servlet类

**位置**：`javax.servlet.Servlet`

**定义**：这是最顶层的 Servlet 接口，规定了 `init()`、`service()`、`destroy()` 等生命周期方法。

**作用**：所有 Servlet 都必须实现它（直接实现，或者通过 `GenericServlet` / `HttpServlet` 间接实现）。

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



### ServletRequest类

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

### HttpSession接口

**获取 Session 对象**

```ts
这里的request是Service方法中的参数
HttpSession session = request.getSession();
```

**常用方法**

| 方法                                      | 作用                         |
| ----------------------------------------- | ---------------------------- |
| `setAttribute(String name, Object value)` | 设置会话属性                 |
| `getAttribute(String name)`               | 获取会话属性                 |
| `removeAttribute(String name)`            | 移除会话属性                 |
| `getId()`                                 | 获取会话 ID（JSESSIONID）    |
| `invalidate()`                            | 使 session 立即失效          |
| `setMaxInactiveInterval(int interval)`    | 设置会话最大不活动时间（秒） |

**生命周期**

- 创建：第一次调用 `request.getSession()` 时。
- 销毁：超过默认 30 分钟未使用 / 手动调用 `invalidate()`。

### ServletResponse类

`ServletResponse` 是一个 **顶层接口**（通用的响应对象），它本身只定义了最基本的方法，比如：`getWriter()`、`getOutputStream()` 等。

`HttpServletResponse` 是 `ServletResponse` 的 **子接口**，专门给 HTTP 协议用的，里面扩展了很多方法，比如：

- `sendRedirect(String location)`
- `addCookie(Cookie cookie)`
- `setHeader(String name, String value)`

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



## 基本使用

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
response.sendRedirect("http://www.example.com");
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

```

后续请求（携带 SessionID）：客户端再次访问服务器时：

1. 浏览器会自动在 **请求头 Request Header** 中加入之前保存的 Cookie：

2. Tomcat 收到请求，解析出 `JSESSIONID`，找到对应的 Session 对象。

3. 从而识别这是同一个用户的会话，取出之前保存的属性数据。

```java

```



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

```

作用域为request的案例：可以获取到Servlet作用域中的数据。

```java

```

作用域为application（所有人共用的）的案例：

```java

```

