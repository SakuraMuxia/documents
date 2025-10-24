# thymeleaf

Thymeleaf是做页面渲染的。

Thymeleaf 需要你在 Servlet（或者 Spring MVC Controller）里调用它的 API 来做页面渲染。

**作用**

- **替代 JSP**：解决 JSP 在开发体验上的不足，比如和 HTML 混写后难以在前端工具中直接预览。
- **天然支持 HTML**：Thymeleaf 的模板就是合法的 HTML 文件，可以直接在浏览器中打开预览，而 JSP 必须运行在服务器中才行。
- **更强的标签表达式**：比如 EL 表达式、条件渲染、循环渲染等。
- **和 Spring MVC 无缝集成**（常见用法）：用作前端视图层技术。

## MVC概念

M：Model模型

V：View视图

C：Controller控制器

MVC是在表述层开发中运用的一种设计理念。主张把**封装数据的『模型』**、**显示用户界面的『视图』**、**协调调度的『控制器』**分开。

好处：

- 进一步实现各个组件之间的解耦
- 让各个组件可以单独维护
- 将视图分离出来以后，我们后端工程师和前端工程师的对接更方便

**MVC和三层架构之间关系**

![image-20250915110216934](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250915110216934.png)

## 简介

Thymeleaf是一款用于渲染XML/XHTML/HTML5内容的模板引擎。类似JSP，Velocity，FreeMaker等， 它也可以轻易的与Spring MVC等Web框架进行集成作为Web应用的模板引擎。它的主要作用是在静态页面上渲染显示动态数据。

**优势**

- SpringBoot官方推荐使用的视图模板技术，和SpringBoot完美整合。

- 不经过服务器运算仍然可以直接查看原始值，对前端工程师更友好。

```java
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
    <p th:text="${username}">Original Value</p>
</body>
</html>
```

**物理视图和逻辑视图**

在Servlet中，将请求转发到一个HTML页面文件时，使用的完整的转发路径就是物理视图。

```ts
/pages/user/login_success.html
```

如果我们把所有的HTML页面都放在某个统一的目录下，那么转发地址就会呈现出明显的规律：

```ts
/pages/user/login.html
/pages/user/login_success.html
/pages/user/regist.html
/pages/user/regist_success.html

……
```

```ts
路径的开头都是：/pages/user/，路径的结尾都是：.html。
```

所以，路径开头的部分我们称之为视图前缀，路径结尾的部分我们称之为视图后缀。

**逻辑视图**

物理视图=视图前缀+逻辑视图+视图后缀

| 视图前缀     | 逻辑视图      | 视图后缀 | 物理视图                       |
| ------------ | ------------- | -------- | ------------------------------ |
| /pages/user/ | login         | .html    | /pages/user/login.html         |
| /pages/user/ | login_success | .html    | /pages/user/login_success.html |

## 基本使用

1、加入jar包

![image-20250915110605082](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250915110605082.png)

2、配置上下文参数

![image-20250915110622992](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250915110622992.png)

```ts
<!-- 在上下文参数中配置视图前缀和视图后缀 -->
<context-param>
    <param-name>view-prefix</param-name>
    <param-value>/WEB-INF/view/</param-value>
</context-param>
<context-param>
    <param-name>view-suffix</param-name>
    <param-value>.html</param-value>
</context-param>
```

说明：param-value中设置的前缀、后缀的值不是必须叫这个名字，可以根据实际情况和需求进行修改。

### 模版页面位置

> 为什么要放在WEB-INF目录下？
>
> 原因：WEB-INF目录不允许浏览器直接访问，所以我们的视图模板文件放在这个目录下，是一种保护。以免外界可以随意访问视图模板文件。
>
> 访问WEB-INF目录下的页面，都必须通过Servlet转发过来，简单说就是：不经过Servlet访问不了。
>
> 这样就方便我们在Servlet中检查当前用户是否有权限访问。
>
> 那放在WEB-INF目录下之后，重定向进不去怎么办？
>
> 重定向到Servlet，再通过Servlet转发到WEB-INF下。

视图前缀和后缀

![image-20250917104356955](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250917104356955.png)

当我们把Thymeleaf的视图模板文件统一存放在WEB-INF/pages目录下时，它们转发的路径就有规律了

- 路径开头：都是/WEB-INF/pages/（正好是我们设置的viewPrefix），例如：/WEB-INF/pages/
- 路径结尾：都是.html（正好是我们设置的viewSuffix）例如：.html
- 物理视图：完整的转发路径，例如：/WEB-INF/pages/apple.html
- 逻辑视图：去除前缀、后缀之后剩余的部分，例如：apple

3、创建Servlet基类

这个类大家直接复制粘贴即可，将来使用框架后，这些代码都将被取代。

```java
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.WebContext;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ServletContextTemplateResolver;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class ViewBaseServlet extends HttpServlet {

    private TemplateEngine templateEngine;

    @Override
    public void init() throws ServletException {

        // 1.获取ServletContext对象
        ServletContext servletContext = this.getServletContext();

        // 2.创建Thymeleaf解析器对象
        ServletContextTemplateResolver templateResolver = new ServletContextTemplateResolver(servletContext);

        // 3.给解析器对象设置参数
        // ①HTML是默认模式，明确设置是为了代码更容易理解
        templateResolver.setTemplateMode(TemplateMode.HTML);

        // ②设置前缀
        String viewPrefix = servletContext.getInitParameter("view-prefix");

        templateResolver.setPrefix(viewPrefix);

        // ③设置后缀
        String viewSuffix = servletContext.getInitParameter("view-suffix");

        templateResolver.setSuffix(viewSuffix);

        // ④设置缓存过期时间（毫秒）
        templateResolver.setCacheTTLMs(60000L);

        // ⑤设置是否缓存
        templateResolver.setCacheable(true);

        // ⑥设置服务器端编码方式
        templateResolver.setCharacterEncoding("utf-8");

        // 4.创建模板引擎对象
        templateEngine = new TemplateEngine();

        // 5.给模板引擎对象设置模板解析器
        templateEngine.setTemplateResolver(templateResolver);

    }

    protected void processTemplate(String templateName, HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // 1.设置响应体内容类型和字符集
        resp.setContentType("text/html;charset=UTF-8");

        // 2.创建WebContext对象
        WebContext webContext = new WebContext(req, resp, getServletContext());

        // 3.处理模板数据
        templateEngine.process(templateName, webContext, resp.getWriter());
    }
}
```

3、两种基类（新）

```java
package com.atguigu.demo.servlet.parent;  
  
import jakarta.servlet.ServletContext;  
import jakarta.servlet.ServletException;  
import jakarta.servlet.http.HttpServlet;  
import jakarta.servlet.http.HttpServletRequest;  
import jakarta.servlet.http.HttpServletResponse;  
import org.thymeleaf.TemplateEngine;  
import org.thymeleaf.context.WebContext;  
import org.thymeleaf.templatemode.TemplateMode;  
import org.thymeleaf.templateresolver.WebApplicationTemplateResolver;  
import org.thymeleaf.web.IWebApplication;  
import org.thymeleaf.web.servlet.IServletWebExchange;  
import org.thymeleaf.web.servlet.JakartaServletWebApplication;  
  
import java.io.IOException;  
import java.lang.reflect.Method;  
  
public class ServletParent extends HttpServlet {  
  
    private TemplateEngine templateEngine;  
  
    // view：视图  
    // prefix：前缀  
    private String viewPrefix = "/WEB-INF/pages/";
    
    // suffix：后缀  
    private String viewSuffix = ".html";
    
    @Override  
    public void init() throws ServletException {

        // 1.获取ServletContext对象    
		ServletContext servletContext = this.getServletContext();  

        // 2.创建Thymeleaf解析器对象
		IWebApplication webApplication = JakartaServletWebApplication.buildApplication(servletContext);  
        WebApplicationTemplateResolver templateResolver = new WebApplicationTemplateResolver(webApplication);  
  
        // 3.给解析器对象设置参数    
		// ①HTML是默认模式，明确设置是为了代码更容易理解    
		templateResolver.setTemplateMode(TemplateMode.HTML);  
		  
		 // ②设置视图前缀    
		templateResolver.setPrefix(viewPrefix);  
		  
		// ③设置视图后缀    
		templateResolver.setSuffix(viewSuffix);  
		  
		// ④设置缓存过期时间（毫秒）    
		templateResolver.setCacheTTLMs(60000L);  
		  
		// ⑤设置是否缓存    
		templateResolver.setCacheable(true);  
		  
		// ⑥设置服务器端编码方式    
		templateResolver.setCharacterEncoding("utf-8");  
		  
		// 4.创建模板引擎对象    
		templateEngine = new TemplateEngine();  
		  
		// 5.给模板引擎对象设置模板解析器    
		templateEngine.setTemplateResolver(templateResolver);  
  
    }  
  
    protected void processTemplate(String templateName, HttpServletRequest req, HttpServletResponse resp) throws IOException {  
        // 1.设置响应体内容类型和字符集    
resp.setContentType("text/html;charset=UTF-8");  
  
        // 2.创建WebContext对象    
JakartaServletWebApplication jakartaServletWebApplication = JakartaServletWebApplication.buildApplication(getServletContext());  
        IServletWebExchange webExchange = jakartaServletWebApplication.buildExchange(req, resp);  
  
        WebContext webContext = new WebContext(webExchange, req.getLocale(), jakartaServletWebApplication.getAttributeMap());  
  
        // 3.处理模板数据    
templateEngine.process(templateName, webContext, resp.getWriter());  
    }  
  
    @Override  
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {  
        doPost(req, resp);  
    }  
  
    @Override  
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {  
        try {  
            String requestURI = request.getRequestURI();  
            if (requestURI.contains(";")) {  
                requestURI = requestURI.substring(0, requestURI.indexOf(";"));  
            }  
            String[] split = requestURI.split("/");  
            String methodName = split[split.length - 1];  
            Method method = this.getClass().getDeclaredMethod(methodName, HttpServletRequest.class, HttpServletResponse.class);  
            method.setAccessible(true);  
            method.invoke(this, request, response);  
        } catch (Throwable e) {  
            e.printStackTrace();  
            throw new RuntimeException(e);  
        }  
    }  
  
}
```

4、创建page1.html文件

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
    <h3>Hello yuluo,have fun,good day for you!</h3>
</body>
</html>
```

5、创建Servlet

```ts
<!--配置first Servlet-->
<servlet>
    <servlet-name>firstServlet</servlet-name>
    <servlet-class>com.fruit.yuluo.servlet.firstServlet.firstServlet</servlet-class>
</servlet>
<servlet-mapping>
    <servlet-name>firstServlet</servlet-name>
    <url-pattern>/firstReq</url-pattern>
</servlet-mapping>
```

自定义Servlet让其继承ViewBaseServlet

```java
package com.fruit.yuluo.servlet.firstServlet;

import com.fruit.yuluo.servlet.ViewBaseServlet;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class firstServlet extends ViewBaseServlet {

    // 重写 HttpServlet 方法
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 之前渲染方式：request.getRequestDispatcher("index.html").forward(request,response);
        // 现在使用 thymeleaf 渲染：super.processTemplate("逻辑视图名称",request,response);
        // 物理视图名称  =  视图前缀 + 逻辑视图名称 + 视图后缀
        // /page01.html=   /          page01        .html
        super.processTemplate("page1",req,resp);
    }
}
```

## 基本语法

### th名称空间



### 循环遍历

```html
<!-- th:each 表示准备迭代 -->
<!-- ${} 这是thymeleaf的语法，表示thymeleaf表达式 -->
<!-- session.key 相当于 session.getAttribute(key) -->
<tr th:each="item ${session.keyList}">
	<td th:text="${item.fname}">苹果</td>
    <td th:text="${item.price}">5</td>
    <td th:text="${item.fcont}">2</td>
</tr>
```



### th:*语法

> ${} 是thymeleaf的语法，表示thymeleaf表达式，里边写 thymeleaf 表达式

**普通字符串**

```html
<p th:text="标签体新值">标签体原始值</p>

<p th:text="'Hello World'"></p>
<!--外层 ' ' 包裹普通字符串 -->
<!--渲染后：-->
<p>Hello World</p>
```

th:text作用

- 不经过服务器解析，直接用浏览器打开HTML文件，看到的是标签体原始值
- 经过服务器解析，Thymeleaf引擎根据th:text属性指定的标签体新值去替换标签体原始值

**变量（对象属性）**

```html
<!--${fruit.name} 是表达式-->
<!--Thymeleaf 会解析为对象的属性值（可以是数字、布尔、字符串等）-->
<!--渲染后会自动转换成字符串显示在 HTML 中-->

<p th:text="${fruit.name}"></p>
```

**修改属性值**

```html
<input type="text" name="username" th:value="文本框新值" value="文本框旧值" />
```

语法：任何HTML标签原有的属性，前面加上th:就都可以通过Thymeleaf来设定新值。

**表达式拼接 / 计算**

```html
<!--字符串 + 表达式 → 最终渲染为完整字符串-->
<p th:text="'水果名称：' + ${fruit.name} + ', 价格：' + ${fruit.price}"></p>
<!--渲染后：-->
<p>水果名称：苹果, 价格：10</p>
```

```html
<!--文字字符串必须用单引号-->
<p th:text="'欢迎 ' + ${user} + ' 登录'"></p>

<!--路径拼接（常见场景）-->
<!-- 拼接 URL 参数 -->
<a th:href="@{'/fruit/detail/' + ${fruit.id}}">查看详情</a>
<a th:href="@{'/search?key=' + ${keyword}}">查看详情</a>
<!-- 结果 -->
<a href="/fruit/detail/10">查看详情</a>
```

**文本模板表达式**

Thymeleaf 提供了 **文本模板表达式**，用 `| ... |` 包裹，里面直接用 `${变量}` 插值。

在 `|...|` 中直接写变量占位 `${变量}`，Thymeleaf 会自动替换成值。

```html
<p th:text="|欢迎 ${user} 登录|"></p>
<p th:text="|价格：${price} 元|"></p>
<a th:href="@{|/fruit/detail/${fruit.id}|}">查看详情</a>

<!--必须用 | 包裹，中间写模板内容。-->
th:text="|Hello ${name}|"
<!--变量用 ${...}，可以有多个。-->
th:text="|${user} 的余额是 ${balance} 元|"
<!--可以混合普通文字和变量-->
th:text="|商品名：${product.name}，价格：${product.price} 元|"
<!--支持 URL 表达式 @{}-->
<a th:href="@{|/fruit/detail/${fruit.id}|}">查看详情</a>
<!--等价于字符串拼接-->
th:text="|欢迎 ${user} 登录|"
```

动态拼接 一段 JavaScript 调用

```java
th:href="|javascript:delTopic(${topic.id})|"
    假设 topic.id = 10，渲染后浏览器看到的 HTML 实际是
<a href="javascript:delTopic(10)">删除</a>
    这等价于点击这个链接时执行
delTopic(10)
```

**布尔值 / 条件判断**

```html
<!--这里 th:if / th:unless 接收的是 布尔表达式，不是字符串-->
<!--用于控制标签是否渲染-->
<p th:if="${fruit.count > 0}">有库存</p>
<p th:unless="${fruit.count > 0}">缺货</p>
```

**URL表达式**

```html
<!--@{} URL表达式 -->
<!--th:href / th:onclick 最终需要生成字符串，但可以 通过表达式拼接生成-->
<!--拼接中可以包含数字、对象属性等-->
<a th:href="@{/fruit/delete(id=${fruit.id})}">删除</a>
<button th:onclick="'delFruit(' + ${fruit.id} + ')'">删除</button>

<!--如果有多个参数-->
<!--=号两边不能有空格-->
<a th:href="@{/fruit/delete(id=${fruit.id}, name=${fruit.name})}" onclick="return confirm('确定要删除这个水果吗？');">删除</a>
```

@{}的作用是在字符串前附加上下文路径

> 这个语法的好处是：实际开发过程中，项目在不同环境部署时，Web应用的名字有可能发生变化。所以上下文路径不能写死。而通过@{}动态获取上下文路径后，不管怎么变都不怕啦！

**首页使用URL地址解析**

如果我们直接访问index.html本身，那么index.html是不需要通过Servlet，当然也不经过模板引擎，所以index.html上的Thymeleaf的任何表达式都不会被解析。

![image-20250915111424737](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250915111424737.png)

解决办法：通过Servlet访问index.html，这样就可以让模板引擎渲染页面了：

![image-20250915111455023](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250915111455023.png)

> 进一步的好处：
>
> 通过上面的例子我们看到，所有和业务功能相关的请求都能够确保它们通过Servlet来处理，这样就方便我们统一对这些请求进行特定规则的限定。

**统一绑定对象**

```html
<!--th:object="${fruit}" 表示当前表单中所有的属性，都来自这个对象-->
<!--*{属性名} 表示引用上面的fruit对象上的属性-->
<table th:object=${fruit}>
    <tr>
    	<td th:value="*{fname}"></td>
        <td th:value="*{price}"></td>
        <td th:value="*{count}"></td>
    </tr>
</table>

<!--指定表单绑定的对象为 fruit-->
<!--表单内部所有 th:field 都以 fruit 为基础对象-->
<!--th:field="*{属性名}"-->
<!--*{name} → 等价于 ${fruit.name}-->
<!--Thymeleaf 会自动生成对应的 name 属性-->
<!--提交表单时，后端就能直接接收到 fruit.name、fruit.price 等属性-->
<form th:action="@{/fruit/save}" th:object="${fruit}" method="post">
    <div>
        <label>名称：</label>
        <input type="text" th:field="*{name}" />
    </div>
    <div>
        <label>价格：</label>
        <input type="number" th:field="*{price}" />
    </div>
    <div>
        <label>库存：</label>
        <input type="number" th:field="*{count}" />
    </div>
    <button type="submit">提交</button>
</form>

```

### 操作域对象

**域对象使用**

域对象是在服务器中有一定作用域范围的对象，在这个范围内的所有动态资源都能够共享域对象中保存的数据。

**域对象的类型**

在请求转发的场景下，我们可以借助HttpServletRequest对象内部给我们提供的存储空间，帮助我们携带数据，把数据发送给转发的目标资源。

**请求域**：HttpServletRequest对象内部给我们提供的存储空间

**会话域**：会话域的范围是一次会话

**应用域**：应用域的范围是整个项目全局

我们通常的做法是，在Servlet中将数据存储到域对象中，而在使用了Thymeleaf的前端页面中取出域对象中的数据并展示。

**操作请求域**

Servlet中代码：

```java
String requestAttrName = "helloRequestAttr";
String requestAttrValue = "helloRequestAttr-VALUE";

request.setAttribute(requestAttrName, requestAttrValue);
```

Thymeleaf表达式：

```html
<!-- 可以省略 request ，直接写请求域中的属性-->
<p th:text="${helloRequestAttr}">request field value</p>
```

**操作会话域**

Servlet中代码：

```java
// ①通过request对象获取session对象
HttpSession session = request.getSession();

// ②存入数据
session.setAttribute("helloSessionAttr", "helloSessionAttr-VALUE");
```

Thymeleaf表达式：

```html
<p th:text="${session.helloSessionAttr}">这里显示会话域数据</p>
```

**操作应用域**

Servlet中代码：

```java
// ①通过调用父类的方法获取ServletContext对象
ServletContext servletContext = getServletContext();

// ②存入数据
servletContext.setAttribute("helloAppAttr", "helloAppAttr-VALUE");
```

Thymeleaf表达式：

```html
<p th:text="${application.helloAppAttr}">这里显示应用域数据</p>
```

### 获取请求参数

 **获取请求参数的语法**

```ts
${param.参数名}
```

**根据一个参数名获取一个参数值**

```html
<p th:text="${param.username}">这里替换为请求参数的值</p>
```

页面显示效果

![image-20250915112250210](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250915112250210.png)

**根据一个参数名获取多个参数值**

页面代码

```html
<p th:text="${param.team}">这里替换为请求参数的值</p>
```

![image-20250915112342766](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250915112342766.png)

如果想要精确获取某一个值，可以使用数组下标。页面代码：

```html
<p th:text="${param.team[0]}">这里替换为请求参数的值</p>
<p th:text="${param.team[1]}">这里替换为请求参数的值</p>
```

![image-20250915112415821](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250915112415821.png)

### 内置对象

内置对象的概念：所谓内置对象其实就是在Thymeleaf的表达式中可以直接使用的对象。

![image-20250915152826904](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250915152826904.png)

用法举例：

```html
<h3>表达式的基本内置对象</h3>
<p th:text="${#request.getContextPath()}">调用#request对象的getContextPath()方法</p>
<p th:text="${#request.getAttribute('helloRequestAttr')}">调用#request对象的getAttribute()方法，读取属性域</p>
```

基本思路：

- 如果不清楚这个对象有哪些方法可以使用，那么就通过getClass().getName()获取全类名，再回到Java环境查看这个对象有哪些方法
- 内置对象的方法可以直接调用
- 调用方法时需要传参的也可以直接传入参数

公共内置对象

![image-20250915152853840](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250915152853840.png)

Servlet中将List集合数据存入请求域：

```java
request.setAttribute("aNotEmptyList", Arrays.asList("aaa","bbb","ccc"));
request.setAttribute("anEmptyList", new ArrayList<>());
```

页面代码：

```html
<p>#list对象isEmpty方法判断集合整体是否为空aNotEmptyList：<span th:text="${#lists.isEmpty(aNotEmptyList)}">测试#lists</span></p>
<p>#list对象isEmpty方法判断集合整体是否为空anEmptyList：<span th:text="${#lists.isEmpty(anEmptyList)}">测试#lists</span></p>
```

公共内置对象对应的源码位置

![image-20250915153006724](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250915153006724.png)

## OGNL

### OGNL概念

OGNL：Object-Graph Navigation Language对象-图 导航语言，实际上调用的是这个对象的getter方法。

```java
Apache OGNL
独立的表达式语言库，全称 Object Graph Navigation Language
需要引入 ognl-x.x.x.jar 使用
可以用 Ognl.getValue("xxx", context, root) 解析和执行表达式
Struts2、Spring WebFlow 等框架早期广泛用它

Thymeleaf 表达式 (有时也被叫作 OGNL)
Thymeleaf 在 2.x 版本里，默认使用 OGNL 作为表达式解析器
表达式写法类似 th:text="${user.name}"
实际上底层就是在调用 OGNL 库去解析 ${...} 里的内容
从 Thymeleaf 3.x 开始，已经换成了 Spring EL (SpEL) 作为默认表达式语言
```



**对象图的概念**

从根对象触发，通过特定的语法，逐层访问对象的各种属性。

![image-20250915153154442](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250915153154442.png)

**OGNL语法**

在Thymeleaf环境下，${}中的表达式可以从下列元素开始：

**起点**

- 访问属性域的起点
  - 请求域属性名
  - session
  - application

- param
- 内置对象
  - request
  - session
  - lists
  - strings


**属性访问语法**

- 访问对象属性：使用getXxx()、setXxx()方法定义的属性
  - 对象.属性名
  
- 访问List集合或数组
  - 集合或数组[下标]

- 访问Map集合
  - Map集合.key
  - Map集合['key']


### 分支与迭代

**分支**

**if和unless**

让标记了th:if、th:unless的标签根据条件决定是否显示。

示例的实体类：

```java
package com.atguigu.bean;

/**
 * 包名:com.atguigu.bean
 *
 * @author Leevi
 * 日期2021-05-13  10:58
 */
public class Teacher {
    private String teacherName;

    public Teacher() {
    }

    public Teacher(String teacherName) {
        this.teacherName = teacherName;
    }

    public String getTeacherName() {
        return teacherName;
    }

    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
    }
}
```

示例的Servlet代码：

```java
protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    // 1.创建ArrayList对象并填充
    List<Employee> employeeList = new ArrayList<>();

    employeeList.add(new Employee(1, "tom", 500.00));
    employeeList.add(new Employee(2, "jerry", 600.00));
    employeeList.add(new Employee(3, "harry", 700.00));

    // 2.将集合数据存入请求域
    request.setAttribute("employeeList", employeeList);

    // 3.调用父类方法渲染视图
    super.processTemplate("list", request, response);
}
```

示例的HTML代码：

```html
<table>
    <tr>
        <th>员工编号</th>
        <th>员工姓名</th>
        <th>员工工资</th>
    </tr>
    <tr th:if="${#lists.isEmpty(employeeList)}">
        <td colspan="3">抱歉！没有查询到你搜索的数据！</td>
    </tr>
    <tr th:if="${not #lists.isEmpty(employeeList)}">
        <td colspan="3">有数据！</td>
    </tr>
    <tr th:unless="${#lists.isEmpty(employeeList)}">
        <td colspan="3">有数据！</td>
    </tr>
</table>
```

if配合not关键词和unless配合原表达式效果是一样的，看自己的喜好。

**switch**

```html
<h3>测试switch</h3>
<div th:switch="${user.memberLevel}">
    <p th:case="level-1">银牌会员</p>
    <p th:case="level-2">金牌会员</p>
    <p th:case="level-3">白金会员</p>
    <p th:case="level-4">钻石会员</p>
</div>
```

**迭代**

在迭代过程中，可以参考下面的说明使用迭代状态：

```html
<!--遍历显示请求域中的teacherList-->
<table border="1" cellspacing="0" width="500">
    <tr>
        <th>编号</th>
        <th>姓名</th>
    </tr>
    <tbody th:if="${#lists.isEmpty(teacherList)}">
        <tr>
            <td colspan="2">教师的集合是空的!!!</td>
        </tr>
    </tbody>

<!-- 集合不为空，遍历展示数据 -->
    <tbody th:unless="${#lists.isEmpty(teacherList)}">
<!--
使用th:each遍历
用法:
1. th:each写在什么标签上？ 每次遍历出来一条数据就要添加一个什么标签，那么th:each就写在这个标签上
2. th:each的语法    th:each="遍历出来的数据,数据的状态 : 要遍历的数据"
3. status表示遍历的状态，它包含如下属性:
3.1 index 遍历出来的每一个元素的下标
3.2 count 遍历出来的每一个元素的计数
3.3 size 遍历的集合的长度
3.4 current 遍历出来的当前元素
3.5 even/odd 表示遍历出来的元素是否是奇数或者是否是偶数
3.6 first 表示遍历出来的元素是否是第一个
3.7 last 表示遍历出来的元素是否是最后一个
-->
        <tr th:each="teacher,status : ${teacherList}">
            <td th:text="${status.count}">这里显示编号</td>
            <td th:text="${teacher.teacherName}">这里显示老师的名字</td>
        </tr>
    </tbody>
</table>
```

### 模板文件

**应用场景**

抽取各个页面的公共部分

![image-20250915161439984](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250915161439984.png)

**操作步骤**

创建页面的公共代码片段

使用th:fragment来给这个片段命名

```html
<div th:fragment="header">
    <p>被抽取出来的头部内容</p>
</div>
```

在需要的页面中进行包含

| 语法       | 效果                                                     | 特点                                       |
| ---------- | -------------------------------------------------------- | ------------------------------------------ |
| th:insert  | 把目标的代码片段整个插入到当前标签内部                   | 它会保留页面自身的标签                     |
| th:replace | 用目标的代码替换当前标签                                 | 它不会保留页面自身的标签                   |
| th:include | 把目标的代码片段去除最外层标签，然后再插入到当前标签内部 | 它会去掉片段外层标记，同时保留页面自身标记 |

页面代码举例：

```html
<!-- 代码片段所在页面的逻辑视图 :: 代码片段的名称 -->
<div id="badBoy" th:insert="segment :: header">
    div标签的原始内容
</div>

<div id="worseBoy" th:replace="segment :: header">
    div标签的原始内容
</div>

<div id="worstBoy" th:include="segment :: header">
    div标签的原始内容
</div>
```

## 基本使用2

1、添加Jar包

```java
把 thymeleaf 包导入到项目根目录，lib目录中。
然后选中module文件夹，向medule文件夹中，添加thymeleaf依赖和tomcat依赖。
然后修复一下Fix Artifacts 依赖
```

2、添加依赖，模块添加，jar包时，需要更新一下Artifact制品依赖。

3、在web.xml文件中，配置视图前后缀。这样写的目的是让 `ViewBaseServlet` 能根据逻辑视图名，自动拼接真实路径。

```xml
<!--视图前缀-->
<context-param>
    <param-name>view-prefix</param-name>
    <param-value>/WEB-INF/pages/</param-value>
</context-param>
<!--视图后缀-->
<context-param>
    <param-name>view-suffix</param-name>
    <param-value>.html</param-value>
</context-param>
```

4、在src目录下复制一个Servlet：ViewBaseServlet，模拟 Spring MVC 的 `InternalResourceViewResolver` 功能，统一管理页面跳转和渲染：

```java
package com.fruit.yuluo.servlet;

import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.WebContext;
import org.thymeleaf.templateresolver.ServletContextTemplateResolver;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class ViewBaseServlet extends HttpServlet {
    private TemplateEngine templateEngine;

    @Override
    public void init() throws ServletException {
        // 初始化 Thymeleaf 模板解析器
        ServletContextTemplateResolver resolver =
                new ServletContextTemplateResolver(this.getServletContext());

        resolver.setPrefix(getServletContext().getInitParameter("view-prefix"));
        resolver.setSuffix(getServletContext().getInitParameter("view-suffix"));
        resolver.setCharacterEncoding("utf-8");

        templateEngine = new TemplateEngine();
        templateEngine.setTemplateResolver(resolver);
    }
    // 渲染模版
    protected void processTemplate(String templateName,
                                   HttpServletRequest req,
                                   HttpServletResponse resp) throws IOException {
        // 设置响应类型为 HTML，字符集 UTF-8
        resp.setContentType("text/html;charset=UTF-8");
        // 构建 Thymeleaf 的上下文对象（包含 request、response、servletContext 等）
        WebContext webContext = new WebContext(req, resp, getServletContext());
        // 调用 Thymeleaf 的模板引擎，把指定模板渲染为 HTML 并写入响应流
        templateEngine.process(templateName, webContext, resp.getWriter());
    }
}
```

> 这个Servlet继承自HttpServlet，他重写了init方法，service方法。
>
> 同时写了模版处理方法，这个方法有两个功能：服务器内部转发，视图渲染。

5、编写一个自定义的Servlet，继承自ViewBaseServlet。继承 `ViewBaseServlet`，使用 `processTemplate()` 渲染页面：

```java
package com.fruit.yuluo.servlet.firstServlet;

import com.fruit.yuluo.servlet.ViewBaseServlet;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class firstServlet extends ViewBaseServlet {

    // 重写 HttpServlet 方法
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 之前渲染方式：request.getRequestDispatcher("index.html").forward(request,response);
        // 现在使用 thymeleaf 渲染：super.processTemplate("逻辑视图名称",request,response);
        // 物理视图名称  =  视图前缀 + 逻辑视图名称 + 视图后缀
        // /page01.html=   /          page01        .html
        super.processTemplate("page1",req,resp);
    }
}

```

总结：**基本使用步骤**：引入依赖 → 配置前后缀 → 写 `ViewBaseServlet` → 写业务 Servlet → 写页面模板。

## 封装Jar包

把自己常用的工具类、基类（比如你刚写的 `ViewBaseServlet`）封装成 **Jar 包**。

**使用命令打包方式**

1、准备项目结构

2、编译生成 `.class` 文件

如果不是 Maven 项目，可以直接用 `javac` 编译

```java
javac -d out src/main/java/com/fruit/utils/*.java
```

这样会在 `out` 文件夹下生成对应的 `.class` 文件。

3、打包成 Jar

用 `jar` 命令

```java
jar cvf my-utils.jar -C out .
```

这会在当前目录生成一个 `my-utils.jar`，里面包含所有编译好的 `.class`

4、在别的项目中使用

把 `my-utils.jar` 放到项目的 `lib/` 目录，然后在编译/运行时加上 classpath

```java
javac -cp lib/my-utils.jar Main.java
java -cp .;lib/my-utils.jar Main
```

**使用Idea打包方式**

1、随意选中一个项目文件，选择 structure，新增制品Artifacts，添加jar，选中空jar包。

![image-20250917113436313](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250917113436313.png)

2、配置jar包名称，配置名称，配置目录结构

![image-20250917114208424](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250917114208424.png)

3、编译你写的java类文件，选中你编写的类，然后编译这个文件，这些文件会在这个项目的out文件中找到。

![image-20250917114317524](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250917114317524.png)

4、把编译好的类class文件，添加到Artifacts jar包制品中对应的目录中

![image-20250917114557083](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250917114557083.png)

![image-20250917114857294](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250917114857294.png)



5、添加完毕后，选中Build，Build Artifacts，选择你创建的Jar包的Artifacts

![image-20250917114913229](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250917114913229.png)

6、Build完成后，会在这个项目的out目录中，找到artifacts目录，找到对应名称的制品，这个jar包就是打包好的

![image-20250917115052668](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250917115052668.png)

7、把这个Jar包导入别的项目中，添加到library中，就可以使用

**使用第三方Jar包的方式导出Jar包；**

```java
handy-export-jar 包进行导出；
```



## 各自作用

**TomCat Servlet Thymeleaf 的各自作用**

### 1. Tomcat

- **定位**：Web 服务器 / Servlet 容器
- **主要作用**：
  1. 接收浏览器发送的 **HTTP 请求**
  2. 根据 URL，把请求分发给对应的 **Servlet**
  3. 负责运行 Servlet/JSP，并把结果封装成 **HTTP 响应** 返回给浏览器
- **本质**：运行环境 + 请求调度员

### 2. Servlet

- **定位**：运行在服务器上的 **Java 程序**
- **主要作用**：
  1. 处理请求（读取 `HttpServletRequest`）
  2. 执行业务逻辑（调用数据库、服务层等）
  3. 生成响应数据（`HttpServletResponse`）
- **本质**：**请求处理器**，但它自己不会写复杂的页面

### 3. Thymeleaf

- **定位**：模板引擎（类似 JSP、Freemarker、Velocity）
- **主要作用**：
  1. 把 Servlet/Controller 传递的数据（Model、Request Attribute）填充到 HTML 模板中
  2. 生成最终的 **动态 HTML 页面**
- **本质**：**页面渲染工具**

### 三者关系（流程）

1. 浏览器发请求 → **Tomcat** 接收
2. Tomcat 找到对应的 **Servlet** → 调用它的 `service/doGet/doPost` 方法
3. Servlet 处理业务逻辑，把数据传给 **Thymeleaf**
4. Thymeleaf 渲染 HTML 页面 → 返回给 Servlet
5. Servlet 把最终结果交给 **Tomcat** → Tomcat 以 HTTP 响应发回浏览器