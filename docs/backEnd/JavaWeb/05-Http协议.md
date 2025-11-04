# HTTP协议

HTTP协议由请求和响应两部分构成，请求是由客户端往服务器传输数据，响应是由服务器往客户端传输数据。

## URL

**URL 就是互联网上资源的地址**。

它告诉浏览器：

- **用什么协议**访问
- **在哪台主机**
- **哪个端口**
- **哪个路径**
- **附带哪些参数**

比如：

```ts
https://www.example.com:8080/fruit/detail?id=1&name=apple#section2

```

URL 的组成部分

```ts
协议://主机:端口/路径?查询字符串#片段
```

1. **协议（Scheme）**
   - 决定了访问方式。
   - 常见的有：
     - `http://` → 普通网页传输
     - `https://` → 安全加密网页传输
     - `ftp://` → 文件传输
     - `mailto:` → 邮件链接
2. **主机（Host）**
   - 域名（`www.example.com`）或 IP 地址（`192.168.1.1`）。
3. **端口（Port）**
   - 服务运行的端口，HTTP 默认 `80`，HTTPS 默认 `443`。
   - 如果是默认端口，可以省略。
4. **路径（Path）**
   - 指定服务器上的资源位置，比如 `/fruit/detail`。
5. **查询字符串（Query String）**
   - `?` 开始，键值对形式，用 `&` 分隔。
   - 示例：`?id=1&name=apple`
6. **片段标识符（Fragment / Anchor）**
   - `#` 开始，用来定位页面内部的锚点，不会发给服务器。
   - 示例：`#section2`

例子

```ts
https://shop.example.com:443/products/list?page=2&category=fruit#reviews
```

- 协议：`https`
- 主机：`shop.example.com`
- 端口：`443`（HTTPS 默认端口）
- 路径：`/products/list`
- 查询字符串：`page=2&category=fruit`
- 片段：`#reviews`（页面内评论区域）

**URL 和 URI 的区别**

- **URI**（统一资源标识符，Uniform Resource Identifier）：用来唯一标识资源，可以是名字或位置。
- **URL**（统一资源定位符）：是 URI 的一种，专门描述资源的**位置**。

## 查询字符串

**位置**：跟在 **URL** 的 `?` 后面，多个参数用 `&` 连接。

**作用**：向服务器传递 **键值对形式的数据**。

**特点**：一般用于 **GET 请求**，数据会显示在 URL 上。

示例：

```ts
GET /search?keyword=apple&page=2 HTTP/1.1
```

对应的查询字符串是：

```ts
keyword=apple&page=2
```



## 请求报文

请求报文的三个部分

![image-20250917162548302](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250917162548302.png)

**请求行**

作用: 展示当前请求的最基本信息

- 请求方式
- 访问地址
- HTTP协议的版本

**请求消息头**

作用: 通过具体的参数对本次请求进行详细的说明

格式: 键值对，键和值之间使用冒号隔开

相对比较重要的请求消息头：

| 名称           | 功能                                                 |
| -------------- | ---------------------------------------------------- |
| Host           | 服务器的主机地址                                     |
| Accept         | 声明当前请求能够接受的『媒体类型』                   |
| Referer        | 当前请求来源页面的地址                               |
| Content-Length | 请求体内容的长度                                     |
| Content-Type   | 请求体的内容类型，这一项的具体值是媒体类型中的某一种 |
| Cookie         | 浏览器访问服务器时携带的Cookie数据                   |

**请求体**

作用：作为请求的主体，发送数据给服务器。具体来说其实就是POST请求方式下的请求参数。

格式：

**1. form data**

含义：当前请求体是一个表单提交的请求参数。

查看源码后，发现格式如下：

> username=tom&password=123456

- 每一组请求参数是一个键值对
- 键和值中间是等号
- 键值对之间是&号

**2.Request Payload**

含义：整个请求体以某种特定格式来组织数据，例如JSON格式。

![image-20250917162726518](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250917162726518.png)

## 请求方式

八种方式

- GET：从服务器端获取数据
- POST：将数据保存到服务器端
- PUT：命令服务器对数据执行更新
- DELETE：命令服务器删除数据
- HEAD
- CONNECT
- OPTIONS
- TRACE

**GET请求**

- 特征1：没有请求体
- 特征2：请求参数附着在URL地址后面
- 特征3：请求参数在浏览器地址栏能够直接被看到，存在安全隐患
- 特征4：在URL地址后面携带请求参数，数据容量非常有限。如果数据量大，那么超出容量的数据会丢失
- 特征5：从报文角度分析，请求参数是在请求行中携带的，因为访问地址在请求行

**POST请求**

- 特征1：有请求体
- 特征2：请求参数放在请求体中
- 特征3：请求体发送数据的大小没有限制
- 特征4：可以发送各种不同类型的数据
- 特征5：从报文角度分析，请求参数是在请求体中携带的
- 特征6：由于请求参数是放在请求体中，所以浏览器地址栏看不到

## 媒体类型

Multipurpose Internet Mail Extensions：HTTP协议中的MIME类型

作用：为了让用户通过浏览器和服务器端交互的过程中有更好、更丰富的体验，HTTP协议需要支持丰富的数据类型。

MIME类型定义参考：

## 响应报文

![image-20250917163002317](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250917163002317.png)

**响应状态行**

> HTTP/1.1 200 OK

- HTTP协议版本
- 响应状态码
- 响应状态的说明文字

**响应消息头**

- 响应体的说明书。
- 服务器端对浏览器端设置数据，例如：服务器端返回Cookie信息。

| 名称           | 功能                                             |
| -------------- | ------------------------------------------------ |
| Content-Type   | 响应体的内容类型                                 |
| Content-Length | 响应体的内容长度                                 |
| Set-Cookie     | 服务器返回新的Cookie信息给浏览器                 |
| location       | 在重定向的情况下，告诉浏览器访问下一个资源的地址 |

**响应体**

服务器返回的数据主体，有可能是各种数据类型。

- HTML页面
- 图片
- 视频
- 以下载形式返回的文件
- CSS文件
- JavaScript文件

**响应状态码**

作用：以编码的形式告诉浏览器当前请求处理的结果

| 状态码 | 含义                                                      |
| ------ | --------------------------------------------------------- |
| 200    | 服务器成功处理了当前请求，成功返回响应                    |
| 302    | 重定向                                                    |
| 400    | [SpringMVC特定环境]请求参数问题                           |
| 403    | 没有权限                                                  |
| 404    | 找不到目标资源                                            |
| 405    | 请求方式和服务器端对应的处理方式不一致                    |
| 406    | [SpringMVC特定环境]请求扩展名和实际返回的响应体类型不一致 |
| 50X    | 服务器端内部错误，通常都是服务器端抛异常了                |

404产生的具体原因：

- 访问地址写错了，确实是没有这个资源
- 访问了WEB-INF目录下的资源
- Web应用启动的时候，控制台已经抛出异常，导致整个Web应用不可用，访问任何资源都是404
- 服务器端缓存

## Session

**Session（会话）** 是服务器在用户访问网站时，为该用户创建的一个「会话状态」记录。
 它通常用于存储用户登录信息、购物车数据、权限状态等临时信息。

在 HTTP 是「无状态协议」的前提下，Session 用于**保持用户状态**。

例如：

- 用户登录后，服务器生成一个 Session 来记录该用户的登录状态；
- 用户在后续请求中带上 Session ID，服务器就能识别出这是同一个用户。

### 常用操作方法

PHP

```php
// 启动 session（必须在输出前）
session_start();

// 设置 session
$_SESSION['username'] = 'liu';

// 获取 session
echo $_SESSION['username'];

// 删除单个 session
unset($_SESSION['username']);

// 删除所有 session
session_destroy();

```

Node.js 使用 `express-session`

```js
const session = require('express-session');
app.use(session({
  secret: 'my_secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 } // 有效期 1 分钟
}));

// 设置 session
req.session.user = { name: 'liu' };

// 读取 session
console.log(req.session.user);

// 销毁 session
req.session.destroy();

```

Python Flask 框架

```python
from flask import Flask, session
app.secret_key = 'secret'

@app.route('/')
def index():
    session['user'] = 'liu'
    return session['user']

```

Java中

| 方法                                      | 说明                            |
| ----------------------------------------- | ------------------------------- |
| `getId()`                                 | 获取当前 Session 的唯一 ID      |
| `setAttribute(String name, Object value)` | 向 Session 中保存数据           |
| `getAttribute(String name)`               | 从 Session 中获取数据           |
| `removeAttribute(String name)`            | 删除指定属性                    |
| `invalidate()`                            | 使 Session 立即失效（登出常用） |
| `getCreationTime()`                       | 获取 Session 创建时间           |
| `getLastAccessedTime()`                   | 获取最后一次访问时间            |
| `setMaxInactiveInterval(int seconds)`     | 设置最大空闲时间（单位：秒）    |
| `getMaxInactiveInterval()`                | 获取 Session 最大空闲时间       |

### 使用Session

创建或获取 Session

```java
// 若没有 Session，会自动创建一个新的
HttpSession session = request.getSession(); 
// 如果只想获取已有 Session（不创建新的
HttpSession session = request.getSession(false);
if (session == null) {
    // 当前请求没有 Session
}
```

设置 Session 属性

```java
session.setAttribute("username", "liu");
session.setAttribute("role", "admin");
```

获取 Session 属性

```java
String username = (String) session.getAttribute("username");
System.out.println("当前用户：" + username);
```

删除或使 Session 失效

```java
session.removeAttribute("username"); // 删除单个属性
session.invalidate();                // 销毁整个 Session
```

设置 Session 有效时长

```java
// 在代码中设置
session.setMaxInactiveInterval(30 * 60); // 30分钟（单位：秒）

// 在 web.xml 中全局设置
<session-config>
    <session-timeout>30</session-timeout> <!-- 单位：分钟 -->
</session-config>

// Spring Boot 中配置
server:
  servlet:
    session:
      timeout: 30m   # 30分钟
```

Session 生命周期

```java
创建：
 1 用户第一次访问时自动创建（request.getSession()）。

活跃期：
 1 在 setMaxInactiveInterval() 指定的时间内，用户持续访问会延长 Session 生命周期。

过期：
 1 超过最大空闲时间（无请求交互）后，服务器会销毁 Session。

销毁：
 1 Session 超时
 2 调用 invalidate() 手动销毁
 3 服务器重启或内存清理
```



### 过期机制

**服务器端存储的 Session 生命周期**

- 每个 Session 通常有一个 `maxInactiveInterval`（最大空闲时间）。
- 默认时长根据语言/框架不同而异：
  - PHP：默认 24 分钟 (`session.gc_maxlifetime = 1440`)
  - Express：可通过 `cookie.maxAge` 控制
  - Java：默认 30 分钟，可在 `web.xml` 中配置

```xml
<session-config>
    <session-timeout>30</session-timeout> <!-- 单位：分钟 -->
</session-config>

```

**客户端 Cookie 中保存的 Session ID 生命周期**

- 浏览器端保存的 Cookie（比如 `PHPSESSID`）如果过期或被删除，Session 就无法再被识别。
- 通常与服务器端 Session 同步设置。

⚠️ 注意：

即使 Cookie 还在，若服务器清理了 Session 存储（内存/Redis/文件），Session 也会失效。

**Session 与 Cookie 的关系**

| 项目     | Session                         | Cookie           |
| -------- | ------------------------------- | ---------------- |
| 存储位置 | 服务器端                        | 客户端（浏览器） |
| 安全性   | 较高（数据不暴露）              | 较低（数据可见） |
| 容量     | 无明显限制                      | 通常 4KB         |
| 依赖     | 通常依赖 Cookie 存放 Session ID | 无需依赖 Session |

Session 实际上依赖 **Cookie（或 URL 参数）** 来在每次请求中标识用户身份。

### 存储方式

| 存储方式        | 特点                     |
| --------------- | ------------------------ |
| 内存（默认）    | 速度快，但服务重启后丢失 |
| 文件系统        | 简单，但并发性能一般     |
| Redis/Memcached | 常用于分布式项目         |
| 数据库          | 可持久化存储，适合小项目 |

常见问题与注意事项

**Session 丢失**

- 原因可能是服务器重启、Session 存储未共享、Cookie 禁用等。

**Session 固定攻击**

- 解决方式：登录后重新生成 Session ID。

**Session 清理**

- 定期清理过期 Session，避免内存或存储过多。

**前后端分离项目**

- 常使用 Token（如 JWT）替代传统 Session。

### 应用场景

用户登录验证

```java
// 登录接口
protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String username = request.getParameter("username");
    String password = request.getParameter("password");

    if ("admin".equals(username) && "123456".equals(password)) {
        HttpSession session = request.getSession();
        session.setAttribute("user", username);
        response.getWriter().write("登录成功");
    } else {
        response.getWriter().write("用户名或密码错误");
    }
}

```

访问权限检查

```java
HttpSession session = request.getSession(false);
if (session == null || session.getAttribute("user") == null) {
    response.sendRedirect("/login.jsp");
} else {
    // 已登录，继续执行
}

```

