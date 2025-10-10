# Filter过滤器

Servlet规范包含了三大组件：

> Servlet：实例化，初始化，服务，销毁
>
> Filter：过滤器
>
> Listener：监听器

JavaWeb基本工作过程：当请求到来时，执行顺序。

![image-20250929145833124](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250929145833124.png)



## API

### Filter接口

包名：javax.servlet.Filter;

**核心方法**

```java
// 初始化方法
init(FilterConfig filterConfig)
public void init(FilterConfig filterConfig) throws ServletException
// 作用：在过滤器创建时执行一次，用于完成初始化操作，例如读取配置参数、建立资源连接等。
// 相当于 Servlet 的 init() 方法。
    
    
// 过滤器方法    
doFilter(ServletRequest req,ServletRespon resp,FilterChain chain)

// 销毁方法
destory()
```

init()

```java
作用：在过滤器创建时执行一次，用于完成初始化操作，例如读取配置参数、建立资源连接等
    
参数：FilterConfig filterConfig
    由容器传入，包含当前 Filter 的配置信息，可以通过它读取
    在 web.xml 中配置的初始化参数；
	当前 Filter 的名称；
	ServletContext 对象
    
返回值：无（void）
    
示例：
@Override
public void init(FilterConfig filterConfig) throws ServletException {
    System.out.println("Filter 初始化...");
    String encoding = filterConfig.getInitParameter("encoding");
    System.out.println("初始化参数 encoding = " + encoding);
}
```

doFilter()

```java
public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
        throws IOException, ServletException
    
作用：是过滤器的核心方法，在每次请求到达目标资源（如 Servlet、JSP）之前都会执行;
	你可以在这里：
        拦截请求（如登录校验、权限控制）；
        修改请求或响应；
        实现日志、编码统一处理；
        或在调用目标资源前后添加逻辑。
    
参数：
    ServletRequest request：请求对象。
    ServletResponse response：响应对象。
    FilterChain chain：过滤器链对象，用于将请求传递给下一个过滤器或目标资源。
    
返回值：无（void）
    
示例：
@Override
public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain)
        throws IOException, ServletException {

    System.out.println("请求进入过滤器...");

    // 设置编码（常见示例）
    req.setCharacterEncoding("UTF-8");
    resp.setCharacterEncoding("UTF-8");

    // 放行请求，交给下一个过滤器或目标 Servlet
    chain.doFilter(req, resp);

    System.out.println("响应返回过滤器...");
}

注意：如果不调用 chain.doFilter(req, resp)，请求就不会继续传递，相当于被当前 Filter 拦截了
```

destory()

```java
作用：在过滤器销毁前调用一次，通常用于资源清理，如关闭连接、释放内存等
    
参数：无。
    
返回值：无（void）。
    
示例：
@Override
public void destroy() {
    System.out.println("Filter 被销毁，释放资源...");
}
```

### Filter配置方式

两种方式：

```java
// 第一种可以使用注解 @WebFilter,推荐使用XML配置(因为过滤器链的执行顺序问题)
 
// 第二种可以使用XML配置
```

**方式一：注解（简便写法）**

```java
import javax.servlet.annotation.WebFilter;
import javax.servlet.*;

@WebFilter("/*")  // 过滤所有请求
public class EncodingFilter implements Filter {
    // 实现上面三个方法
}
```

**方式二：`web.xml` 配置（推荐）**

```xml
<filter>
    <filter-name>EncodingFilter</filter-name>
    <filter-class>com.example.EncodingFilter</filter-class>
    <init-param>
        <param-name>encoding</param-name>
        <param-value>UTF-8</param-value>
    </init-param>
</filter>

<filter-mapping>
    <filter-name>EncodingFilter</filter-name>
    <url-pattern>/*</url-pattern>
</filter-mapping>

```



### FilterConfig

包名：javax.servlet.FilterConfig

类似于 `ServletConfig`，用于读取过滤器的初始化参数和获取 `ServletContext` 对象。

**常用方法**

```java
// 获取过滤器的名称
String getFilterName()

// 获取指定的初始化参数值
String getInitParameter(String name)

// 获取所有初始化参数的名称
Enumeration<String> getInitParameterNames()

// 获取 ServletContext 对象
ServletContext getServletContext()
```

| 方法                            | 作用                       | 参数   | 返回值                |
| ------------------------------- | -------------------------- | ------ | --------------------- |
| `getFilterName()`               | 获取过滤器名称             | 无     | 过滤器名（字符串）    |
| `getInitParameter(String name)` | 根据参数名获取初始化参数值 | 参数名 | 参数值                |
| `getInitParameterNames()`       | 获取所有初始化参数名称     | 无     | 枚举对象              |
| `getServletContext()`           | 获取全局上下文对象         | 无     | `ServletContext` 对象 |

示例：

```java
@WebFilter("/demo")
public class DemoFilter implements Filter {
    @Override
    public void init(FilterConfig config) throws ServletException {
        System.out.println("Filter名称：" + config.getFilterName());
        String value = config.getInitParameter("encoding");
        System.out.println("初始化参数 encoding：" + value);
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain)
            throws IOException, ServletException {
        chain.doFilter(req, resp);
    }

    @Override
    public void destroy() {}
}

```



### FilterChain

作用：用于控制过滤器链的调用流程。通过 `chain.doFilter(request, response)` 将请求交给下一个过滤器或目标资源（Servlet）。

**常用方法**

doFilter()

```java
void doFilter(ServletRequest request, ServletResponse response)
    
作用：用于控制过滤器链的调用流程。
    
参数：请求与响应对象
    
返回值：无
    
示例：
    
@WebFilter("/*")
public class LoginCheckFilter implements Filter {
    @Override
    public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain)
            throws IOException, ServletException {
        System.out.println("进入过滤器 A");
        chain.doFilter(req, resp); // 放行
        System.out.println("离开过滤器 A");
    }
}

```

### ThreadLocal类

**作用：**为每个线程提供独立的变量副本，避免多线程间共享变量导致的冲突。常用于在过滤器或拦截器中保存用户信息、数据库连接等。

**常用方法：**

set(T value)

```java
作用：为当前线程设置一个线程独立的变量值。
    每个线程都有自己的 ThreadLocal 存储副本，互不影响。
    
参数：value —— 要为当前线程存储的值。
    
返回值：无（void）。
    
示例：
ThreadLocal<String> threadLocal = new ThreadLocal<>();
threadLocal.set("Hello Thread A"); // 当前线程独有的值
```

get()

```java
作用：获取当前线程在 ThreadLocal 中存储的值。
    如果当前线程从未设置过值，则返回 null。
    
参数：无。
    
返回值：当前线程对应的值（类型为 T）。
    
示例：
    
ThreadLocal<String> threadLocal = new ThreadLocal<>();
threadLocal.set("Data for current thread");
System.out.println(threadLocal.get()); // 输出：Data for current thread
```

remove()

```java
作用：移除当前线程在 ThreadLocal 中存储的值，防止内存泄漏。
    通常在线程使用完 ThreadLocal 后调用。
    
参数：无。
    
返回值：无。
    
示例：
ThreadLocal<String> threadLocal = new ThreadLocal<>();
threadLocal.set("Temporary data");
threadLocal.remove(); // 删除当前线程的数据
System.out.println(threadLocal.get()); // 输出：null
```



## 生命周期

```java
当Tomcat启动时：
    Filter初始化init执行
    
当请求到来时：
    Servlet初始化init -> Filter过滤doFilter执行 -> 拦截了请求请求到来执行 -> 放行 -> servlet服务执行Service方法 -> 响应到来时执行
    
当Tomcat结束时：
    Servlet销毁 -> Filter销毁
```

## 过滤器链

初始化时：过滤器链的执行顺序：

```java
不是按照严格的顺序执行的。
```

请求到来时：过滤器链的执行顺序：

![image-20250929145741007](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250929145741007.png)

## 事务管理

事务管理动作，应该基于业务方法，事务应该建立在`业务层`，而不是`数据访问层`。

```ts
JDBC中默认情况下，执行一个SQL会自动提交。
但是，在实际情况下，我们应该以业务功能为单位进行事务管理。
	注册是一个业务功能，其中包含了多个Dao方法;
	-查询用户名是否可被注册-select操作;
	-向用户表添加一条记录-insert操作;
	-向系统日志表添加一条记录-insert操作;
我们应该发现，事务应该建立在注册这个方法上，而不是在其中的三个方法分别建立事务,
也就是说，这三步操作应该要么都成功要么都失败。
```



![image-20251009161012908](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20251009161012908.png)

```java
传动带 ThreadLocal 的理解：

1、当一个客户端发一个请求过来的时候，http协议，底层是tcp/ip协议，发来一个请求实则就是发来一个Socket；
2、Tomcat服务器接受到这个Socket，会专门开辟一个线程，用来接待你，对你做响应，是一个新的线程，所以后续的组件都是由这一个线程调用执行的。
3、只要这几个组件是由同一个线程执行的，就可以获取到 ThreadLocal 对象，这个ThreadLocal（传送带上带有属性也就是工具）可以被同一个线程上的组件获取到。
4、我们可以把这个工具箱（Connection对象）放在传送带上（ThreadLocal），
5、这样我们就可以在Filter层获取Dao层的对象数据了。
    
过滤器 OpenSessionInViewFilter 的理解和作用：
    当客户端发来一个请求，Filter过滤器拦截到，执行开启事务，然后doFilter放行，然后执行DispatcherServlet中的方法，执行控制层，执行服务层，执行DAO层，成功了，然后返回到，提交事务，如果不成功则返回到 回滚事务。用来做事务管理（调用TransactionManager中的方法）。
    
TransactionManager 类的理解和作用：
    作用：用于管理事务
```

## Filter应用

### 抽离操作

把Servlet中公共部分抽离放置在Filter中。例如设置编码。

```java

```

同时需要在web.xml中配置filter字段

```xml

```

### 事务管理

创建OpenSessionInViewFilter.java类，用于事务管理，开启拦截事务。

```java

```

配置xml配置。

```xml

```

创建 TransActionManager类；作用：用于管理JDBC中的事务；

```java

```

**TransActionManager类需要做的功能：**

```ts
1、开启事务；
	获取 Dao层的连接对象Connection对象：通过ThreadLocal对象获取；
    设置自动提交关闭；
2、提交事务；
3、归滚事务；
```

1、获取Connection对象：通过TreadLocal获取，因为Connection对象是在Dao层，需要修改数据库连接工具类，使用TreadLocal获取连接，可以在同一个线程上获取数据，数据通信。新建一个工具类：ConnUtil，作用：获取ThreadLocal对象，从而获取Connection对象，同时修改BaseDao中的代码，把初始化数据库连接池，加载配置的方法，创建连接方法，关闭连接方法都移植过来，

```java

```

2、BaseDao中的获取连接的方法，和关闭方法进行修改

```ts
BaseDao中的获取连接的方法，通过调用 TransActionManager 中的获取连接的方法实现。
关闭方法不关闭Connect连接，关闭其他两个，因为同一个事务不同的操作，使用的是同一个连接。
```

## 统一异常处理

目的是：在通用代码中，把编译型的异常，转换位运行时异常，ssm包中不再有try catch，不用担心异常处理了。

**🔥潜在问题**：内部组件trycatch到的问题，打印出来了，但在外部的组件就catch不到了；

**🐛解决办法**：统一对异常做处理；内部的组件出现问题之后，往外抛异常，让外部组件可以捕捉到；

3、定义一个 类的运行时异常。BaseDaoRunTimeException 类，继承 RuntimeException 类。

```java

```

4、JDBC中大部分的异常都是编译时异常，分别在 BaseDao中抛出运行时异常，DispatcherServlet抛出运行时异常，ConUtil类中抛出运行时异常，TransActionManeger类中抛出运行时异常；

```ts
// 方式1：向外抛出自定义异常
throw new BaseDaoRunTimeException(e.getMessage)
// 方式2：向外抛出运行时异常
throw new RuntimeException("xxxxxx")
```

### 抛异常区别

方法中的throws抛异常和try catch 中的 throw new RuntimeException("xxxxxx") 异常的区别

```ts
// Java 异常机制中 “声明抛出”（throws）和 “实际抛出”（throw）的区别
```

throws —— 声明“我可能会抛出异常”

```ts
public void readFile() throws IOException {
    // 可能出现受检异常
    FileReader fr = new FileReader("test.txt");
}

告诉调用者：“我这个方法里可能会抛出某种异常，你得自己处理（try-catch 或继续往上抛）。”
它是方法签名的一部分，相当于“声明一个风险”。

特点：

1、只是声明，不是真正抛出异常。它告诉别人可能会抛出，但不一定真的抛。
2、必须用于受检异常（Checked Exception）。
    比如：
        IOException
        SQLException
        ParseException
        等必须显式声明或捕获的异常。
3、调用者必须处理。

调用者必须处理
public static void main(String[] args) {
    try {
        readFile();
    } catch (IOException e) {
        e.printStackTrace();
    }
}

```

`throw new RuntimeException("xxx")` —— 实际抛出异常

```ts
public void test() {
    throw new RuntimeException("发生了错误！");
}
```

**真的创建一个异常对象并抛出**，程序会从当前点直接中断执行，进入异常传播流程。

```ts
特点：
throw 是实际动作，立即抛出异常对象。
你可以抛出任何 Throwable 的子类对象（Exception、RuntimeException、Error）。

如果抛出的是运行时异常（RuntimeException）或其子类：
    不需要在方法签名中写 throws。
    不要求调用者显式处理。
```

| 对比点             | throws                        | throw                  |
| ------------------ | ----------------------------- | ---------------------- |
| 位置               | 写在方法声明处                | 写在方法体中           |
| 意义               | 声明可能抛出的异常            | 实际抛出一个异常对象   |
| 是否创建异常对象   | ❌ 否，只是声明                | ✅ 是，会创建并抛出异常 |
| 是否中断程序       | ❌ 不会                        | ✅ 会（若未捕获）       |
| 常用于             | 受检异常（Checked Exception） | 实际运行时报错         |
| 是否强制调用者处理 | ✅ 是（受检异常）              | ❌ 否（运行时异常）     |
