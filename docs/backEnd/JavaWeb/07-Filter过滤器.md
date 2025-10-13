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

## 匹配规则

 **四种匹配规则**

精确匹配

指定被拦截资源的完整路径：

```xml
<!-- 配置Filter要拦截的目标资源 -->
<filter-mapping>
    <!-- 指定这个mapping对应的Filter名称 -->
    <filter-name>FilterDemo01</filter-name>

    <!-- 通过请求地址模式来设置要拦截的资源 -->
    <url-pattern>/demo01</url-pattern>
</filter-mapping>
```

上述例子表示要拦截映射路径为`/demo01`的这个资源

**模糊匹配**

相比较精确匹配，使用模糊匹配可以让我们创建一个Filter就能够覆盖很多目标资源，不必专门为每一个目标资源都创建Filter，提高开发效率。

在我们配置了url-pattern为/user/*之后，请求地址只要是/user开头的那么就会被匹配。

```xml
<filter-mapping>
    <filter-name>Target02Filter</filter-name>

    <!-- 模糊匹配：前杠后星 -->
    <!--
        /user/demo01
        /user/demo02
        /user/demo03
		/demo04
    -->
    <url-pattern>/user/*</url-pattern>
</filter-mapping>
```

极端情况：/*匹配所有请求

**扩展名匹配**

```xml
<filter>
    <filter-name>Target04Filter</filter-name>
    <filter-class>com.atguigu.filter.filter.Target04Filter</filter-class>
</filter>
<filter-mapping>
    <filter-name>Target04Filter</filter-name>
    <url-pattern>*.png</url-pattern>
</filter-mapping>
```

上述例子表示拦截所有以`.png`结尾的请求

**匹配Servlet名称**

```xml
<filter-mapping>
    <filter-name>Target05Filter</filter-name>

    <!-- 根据Servlet名称匹配 -->
    <servlet-name>Target01Servlet</servlet-name>
</filter-mapping>
```

## 过滤器链

初始化时：过滤器链的执行顺序：

```java
不是按照严格的顺序执行的。
```

请求到来时：过滤器链的执行顺序：

**过滤器链的顺序**

过滤器链中每一个Filter执行的顺序是由web.xml中filter-mapping配置的顺序决定的。

```xml
<filter-mapping>
    <filter-name>TargetChain03Filter</filter-name>
    <url-pattern>/Target05Servlet</url-pattern>
</filter-mapping>
<filter-mapping>
    <filter-name>TargetChain02Filter</filter-name>
    <url-pattern>/Target05Servlet</url-pattern>
</filter-mapping>
<filter-mapping>
    <filter-name>TargetChain01Filter</filter-name>
    <url-pattern>/Target05Servlet</url-pattern>
</filter-mapping>
```

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

### 过滤非法字符

实现CommentServlet发布评论内容的时候将评论内容中的非法字符替换成*；

将固定的非法字符串替换成从illegal.txt文件中读取非法字符串；

IllegalFilter的代码 V2版本

```java
public class IllegalCharFilter implements Filter {
    
    private List<String> illegalTextList = new ArrayList<>();
    @Override
    public void destroy() {
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain) throws ServletException, IOException {
        //使用动态代理改变req对象的getParameter方法
        HttpServletRequest request = (HttpServletRequest) req;
        Class<? extends HttpServletRequest> clazz = request.getClass();
        HttpServletRequest proxyRequest = (HttpServletRequest) Proxy.newProxyInstance(clazz.getClassLoader(), clazz.getInterfaces(), new InvocationHandler() {
            @Override
            public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
                //改变getParameter()方法
                if(method.getName().equals("getParameter")){
                    //1. 调用原本的getParameter()方法，先获取到请求参数
                    String oldValue = (String) method.invoke(request, args);
                    //2. 判断oldValue中是否包含非法字符，如果包含则将非法字符替换成*
                    for (String illegalText : illegalTextList) {
                        if(oldValue.contains(illegalText)){
                            //非法字符串有几个字符就生成几个*
                            String star = "";
                            for (int i = 0; i < illegalText.length(); i++) {
                                star += "*";
                            }
                            //然后使用star替换oldValue中的非法字符串
                            oldValue = oldValue.replace(illegalText,star);
                        }
                    }
                    return oldValue;
                }
                return method.invoke(request,args);
            }
        });

        //放行过去的请求，一定要是代理请求
        chain.doFilter(proxyRequest, resp);
    }

    @Override
    public void init(FilterConfig config) throws ServletException {
        //在这里读取illegal.txt文件,就只需要在项目部署的时候读取一次
        //将字节输入流进行包装--->InputStreamReader()----->BufferedReader()---->readLine
        BufferedReader bufferedReader = null;
        try {
            bufferedReader = new BufferedReader(new InputStreamReader(IllegalCharFilter.class.getClassLoader().getResourceAsStream("illegal.txt"), "UTF-8"));
            String illegalText = null;
            while ((illegalText = bufferedReader.readLine()) != null) {
                //将读到的那个字符串存储到集合中
                illegalTextList.add(illegalText);
            }
        }catch (Exception e){
            e.printStackTrace();
        }finally {
            try {
                bufferedReader.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
```

V1 版本代码

```java
public class IllegalCharFilter implements Filter {
    @Override
    public void destroy() {
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain) throws ServletException, IOException {
        //1. 获取客户端提交的评论内容
        String content = req.getParameter("content");
        if (content != null) {
            //2. 判断content中是否包含非法字符
            if (content.contains("你大爷的")) {
                resp.getWriter().write("评论内容中包含非法字符，评论发布失败!!!");
                return;
            }
        }
        chain.doFilter(req, resp);
    }

    @Override
    public void init(FilterConfig config) throws ServletException {

    }

}
```

xml配置

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
         version="4.0">
    <filter>
        <filter-name>EncodingFilter</filter-name>
        <filter-class>com.atguigu.filter.EncodingFilter</filter-class>
    </filter>
    <filter-mapping>
        <filter-name>EncodingFilter</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>

    <filter>
        <filter-name>IllegalCharFilter</filter-name>
        <filter-class>com.atguigu.filter.IllegalCharFilter</filter-class>
    </filter>
    <filter-mapping>
        <filter-name>IllegalCharFilter</filter-name>
        <url-pattern>/illegal/*</url-pattern>
    </filter-mapping>

    <servlet>
        <servlet-name>CommentServlet</servlet-name>
        <servlet-class>com.atguigu.servlet.CommentServlet</servlet-class>
    </servlet>
    <servlet-mapping>
        <servlet-name>CommentServlet</servlet-name>
        <url-pattern>/illegal/comment</url-pattern>
    </servlet-mapping>
</web-app>
```

httpServlet代码：

```java
public class CommentServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doGet(request, response);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        //1. 获取评论内容
        String content = request.getParameter("content");
        //2. 向客户端输出评论内容
        response.getWriter().write("恭喜你评论成功，评论内容是:"+content);
    }
}
```



### 事务管理

创建OpenSessionInViewFilter.java类，用于事务管理，开启拦截事务。

```java
public class OpenSessionViewFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        Filter.super.init(filterConfig);
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain){
        try {
            // 开启事务
            TransactionManager.begin();
            // 放行
            chain.doFilter(req,resp);
            // 提交事务
            TransactionManager.submit();
        } catch (Exception e) {
            e.printStackTrace();
            // 回滚事务
            TransactionManager.rollback();
        }finally {
            ConnUtil.closeConn();
        }
    }

    @Override
    public void destroy() {
        Filter.super.destroy();
    }
}
```

配置xml配置。

```xml
<!--filter配置类似Servlet配置-->
<filter>
    <filter-name>CharacterEncodingFilter</filter-name>
    <filter-class>com.fruit.yuluo.myssm.filter.CharacterEncodingFilter</filter-class>
    <!--配置初始化参数-->
    <init-param>
        <param-name>encoding</param-name>
        <param-value>UTF-8</param-value>
    </init-param>
</filter>
<filter-mapping>
    <filter-name>CharacterEncodingFilter</filter-name>
    <url-pattern>*.do</url-pattern>
</filter-mapping>
<!--这里有顺序，过滤器链，应该先执行上边的，再执行下边的-->
<filter>
    <filter-name>OpenSessionViewFilter</filter-name>
    <filter-class>com.fruit.yuluo.myssm.filter.OpenSessionViewFilter</filter-class>
</filter>
<filter-mapping>
    <filter-name>OpenSessionViewFilter</filter-name>
    <url-pattern>*.do</url-pattern>
</filter-mapping>
```

创建 TransActionManager类；作用：用于管理JDBC中的事务；

```java
public abstract class TransactionManager {
    // 开启事务
    public static void begin(){
        // 关闭自动提交
        try {
            System.out.println("开启事务...");
            Connection connection = ConnUtil.getConnection();
            connection.setAutoCommit(false);
            System.out.println("connect对象的 hashCode："+ connection.hashCode());
        } catch (SQLException e) {
            throw new RuntimeException(e.getMessage());
        }

    };
    // 提交事务
    public static void submit(){
        try {
            System.out.println("提交事务...");
            Connection connection = ConnUtil.getConnection();
            connection.commit();
            System.out.println("connect对象的 hashCode："+ connection.hashCode());
            
        } catch (SQLException e) {
            throw new RuntimeException(e.getMessage());
        }
    };
    // 回滚事务
    public static void rollback(){
        try {
            System.out.println("回滚事务...");
            Connection connection = ConnUtil.getConnection();
            connection.rollback();
            System.out.println("connect对象的 hashCode："+ connection.hashCode());
            
        } catch (SQLException e) {
            throw new RuntimeException(e.getMessage());
        }
    };
}
```

**TransActionManager类需要做的功能：**

```ts
1、开启事务；
	获取 Dao层的连接对象Connection对象：通过ThreadLocal对象获取；
    设置自动提交关闭；
2、提交事务；
	正常执行则提交事务；
3、归滚事务；
	出现异常则回滚事务；
```

**新建一个工具类：ConnUtil类**

作用：获取ThreadLocal对象，从而获取Connection对象，

获取Connection对象：通过TreadLocal获取，因为Connection对象是在Dao层，需要修改数据库连接工具类，使用TreadLocal获取连接，可以在同一个线程上获取数据，数据通信。同时修改BaseDao中的代码，把初始化数据库连接池，加载配置的方法，创建连接方法，关闭连接方法都移植过来，

```java
public class ConnUtil {
    // 定义静态数据
    private static String DRIVER;
    private static String URL;
    private static String USER;
    private static String PWD;
    // 定义静态的 数据库连接池对象
    private static DruidDataSource dataSource;
    // 定义一个线程传送带对象
    private static ThreadLocal<Connection> threadLocal = new ThreadLocal<>();
    // 设置数据库连接池信息
    static {
        try {
            // 创建Properties Map集合类
            Properties prop = new Properties();
            // 获取当前类加载器，获取 jdbc的读取流
            InputStream in = DButil.class.getClassLoader().getResourceAsStream("jdbc.properties");
            // 加载配置文件
            prop.load(in);

            // 获取数据库连接池对象(方式1)
            // 方式 1：DruidDataSourceFactory.createDataSource(prop)
            // 直接用 工厂方法 根据 Properties 配置生成一个 DruidDataSource 对象
            // 配置集中在 jdbc.properties 文件里，支持 Druid 的各种高级配置
            // dataSource = DruidDataSourceFactory.createDataSource(prop);

            // 创建数据库连接池对象(方式2)
            // 手动创建 Druid 连接池对象，然后逐个设置属性
            dataSource = new DruidDataSource();

            // 获取properties文件中的值
            DRIVER = prop.getProperty("DRIVER");
            URL = prop.getProperty("URL");
            USER = prop.getProperty("USER");
            PWD = prop.getProperty("PWD");

            // 加载mysql驱动(数据库连接池 Druid会自动加载mysql驱动)
            // Class.forName(DRIVER);

            // 设置用户名，密码
            dataSource.setDriverClassName(DRIVER);
            dataSource.setUrl(URL);
            dataSource.setUsername(USER);
            dataSource.setPassword(PWD);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException(e.getMessage());
        }
    }

    // 创建连接对象
    public static Connection createConnection() {
        try {
            return dataSource.getConnection();
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException(e.getMessage());
        }
    }

    // 从线程传送带上获取连接对象
    public static Connection getConnection(){
        // 从线程传送带上获取工具
        Connection connection = threadLocal.get();
        // 如果不存在
        if (connection == null){
            // 创建一个connection对象
            connection = createConnection();
            // 放置在传送带上
            threadLocal.set(connection);
        }
        return connection;
    }

    // 关闭连接对象
    public static void closeConn(){
        // 从传送带上取出
        Connection connection = threadLocal.get();
        if (connection != null){
            // 关闭连接
            try {
                connection.close();
            } catch (SQLException e) {
                throw new RuntimeException(e.getMessage());
            }
            threadLocal.set(null);
        }
    }

    // 关闭流对象
    public static void closeStream(Statement stmt,ResultSet rs) {
        try {
            if (rs != null) rs.close();
            if (stmt != null) stmt.close();
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException(e.getMessage());
        }
    }
}
```

### 关闭连接的时机

```java
// 在一次事务中，同一个 Connection 需要贯穿整个操作（多次 SQL 执行）
// 如果在 submit() 或 rollback() 里就 close()，那事务中的后续操作就会失效（连接被提前释放了

// 所以这里不应该立即关闭，而应该在 请求处理完成（整个事务结束）后 统一关闭

正确的关闭时机
// 方式1：在事务提交或回滚后手动关闭
// 适用于单次业务操作（非容器托管事务）的情况，比如在 Servlet 或 Controller 层的 finally 块里
try {
    TransactionManager.begin();
    // 调用 service -> dao 执行多条 SQL
    TransactionManager.submit();
} catch (Exception e) {
    TransactionManager.rollback();
} finally {
    ConnUtil.closeConnection(); // <-- 这里统一关闭连接
}

// 方式2：使用拦截器（或过滤器 Filter）统一管理
// 在 Web 应用中更推荐这种方式：
// 你可以在每个请求进入时开启事务，在请求结束时提交或回滚，然后关闭连接。
public class OpenSessionFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        try {
            TransactionManager.begin();
            chain.doFilter(request, response); // 放行执行业务逻辑
            TransactionManager.submit();
        } catch (Exception e) {
            TransactionManager.rollback();
            e.printStackTrace();
            throw new RuntimeException(e);
        } finally {
            ConnUtil.closeConnection(); // <-- 统一关闭连接
        }
    }
}
// 这样每个请求只使用一个数据库连接，用完即释放
    
// 方式3：ConnUtil.closeConnection() 的实现示例
package com.fruit.yuluo.myssm.utils;

import java.sql.Connection;
import java.sql.SQLException;

public class ConnUtil {
    private static ThreadLocal<Connection> threadLocal = new ThreadLocal<>();

    public static Connection getConnection() throws SQLException {
        Connection conn = threadLocal.get();
        if (conn == null) {
            conn = DataSourceUtil.getDataSource().getConnection();
            threadLocal.set(conn);
        }
        return conn;
    }

    public static void closeConnection() {
        Connection conn = threadLocal.get();
        if (conn != null) {
            try {
                conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            } finally {
                threadLocal.remove();
            }
        }
    }
}
// 这样每个线程（每个请求）拥有自己的连接，避免线程间冲突。    
```

2、修改BaseDao中的获取连接的方法，和关闭方法进行修改

```ts
public abstract class BaseDao<T> {
    // 定义泛型的名称
    private String entityClassName;
    // 定义ResultSet结果集
    private ResultSet rs;
    // 连接池对象
    Connection connection = null;
    // sql语句对象
    PreparedStatement pstm = null;

    // 在无参构造中，获取泛型类型，子类调用构造，默认调用父类的无参构造
    public BaseDao(){
        // 调用
        getEntityClassName();

    }
    // 获取子类实例给父类泛型T传入的名称
    private void getEntityClassName(){
        // 通过子类实例对象，获取父类（自己）的泛型T的实际名称
        // 此处的this代表的是FruitDaoImpl实例，而不是BaseDao
        // this.getClass()得到的就是FruitDaoImpl的Class对象
        // getGenericSuperclass() 获取带有泛型的父类,因此可以获取到 BaseDao<Fruit>
        // 因为我们是这样定义的：class FruitDaoImpl extends BaseDao<Fruit>，所以泛型父类是： BaseDao<Fruit>
        Type genericSuperclass = this.getClass().getGenericSuperclass();
        // 把父类的泛型信息，从通用的 Type 强转为 ParameterizedType，以便后续获取实际的泛型参数。
        // 强转为ParameterizedType类型
        ParameterizedType parameterizedType = (ParameterizedType) genericSuperclass;
        // getActualTypeArguments 获取实际的类型参数
        Type[] actualTypeArguments = parameterizedType.getActualTypeArguments();
        // 因为当前BaseDao<T>后面只有一个泛型位置，所以此处我们使用的是[0]
        // getTypeName() 获取类型名称
        // getTypeName() 返回完整类名，例如 "com.xxx.pojo.Fruit"
        String typeName = actualTypeArguments[0].getTypeName();
        entityClassName = typeName;
    }

    // 定义设置参数的方法
    private void setParams(PreparedStatement psmt , Object... params) throws SQLException {
        if(params!=null && params.length>0){
            for (int i = 0; i < params.length; i++) {
                psmt.setObject(i+1,params[i]);
            }
        }
    }

    // 执行增删改的操作
    protected int executeUpdate(String sql,Object ...params){
        // 去除空格，并转为小写
        sql = sql.trim().toUpperCase();
        // 设置标记是否是插入语句
        boolean insertFlag = sql.startsWith("INSERT INTO");
        // 获取连接对象
        connection = ConnUtil.getConnection();

        try {
            // 判断是否是插入语句
            if (insertFlag){
                // 获取sql执行语句对象,插入语句
                pstm = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            }else{ // 非插入语句
                pstm = connection.prepareStatement(sql);
            }
            // 给sql语句传入参数
            setParams(pstm,params);

            // 执行sql
            int resRow = pstm.executeUpdate();
            // 返回
            if(insertFlag) { // 如果是插入语句
                // 获取自增id
                rs = pstm.getGeneratedKeys();
                // 如果返回有值
                if(rs.next()){
                    // 获取第一列数据
                    return (rs.getInt(1));
                }
            }else{
                return resRow; // 返回默认受影响行数
            }
        } catch (SQLException e) {
            // e.printStackTrace();
            // 向外抛出异常
            throw new BaseDaoRunTimeException(e.getMessage());
        } finally {
            // 关闭流
            ConnUtil.closeStream(pstm,rs);
        }
        return 0;
    }

    // 查询列表的方法
    protected List<T> executeQuery(String sql,Object ...params){
        List<T> list = new ArrayList<>();
        connection = ConnUtil.getConnection();
        try {
            // 获取statement对象
             pstm = connection.prepareStatement(sql);
             // 设置SQL参数
            setParams(pstm,params);

            // 执行SQL
            rs = pstm.executeQuery();
            // 方式1：通过反射来处理
            // 方式2：通过数据解析器来处理（见JDBC章节）
            // 获取结果集的元数据，也就是每一行的数据
            ResultSetMetaData metaData = rs.getMetaData();
            // 获取元数据的列数
            int columnCount = metaData.getColumnCount();
            // 遍历结果集
            while(rs.next()){
                // 通过反射获取实体类的Class对象
                Class entityClass = ClassUtil.getEntityClass(entityClassName);
                // 通过反射创建实例,强转为T类型
                T instance = (T)ClassUtil.createInstance(entityClassName);
                // 遍历
                for (int i = 0; i < columnCount; i++) {
                    // 读取列名
                    String columnName = metaData.getColumnName(i + 1);
                    // 获取当前行指定列的值
                    Object columnValue = rs.getObject(i + 1);
                    // 给实例赋值
                    ClassUtil.setProperty(instance,columnName,columnValue);
                }
                // 集合中添加元素
                list.add(instance);
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new BaseDaoRunTimeException(e.getMessage());
        }finally {
            // 老版本关闭流
            // DButil.close(connection,pstm,rs);
            // 使用事务
            ConnUtil.closeStream(pstm,rs);
        }
        return list;
    }

    // 查询单个方法
    protected T load(String sql,Object ...params){
        // 获取连接
        connection = ConnUtil.getConnection();
        try{
            // 获取statement对象
            pstm = connection.prepareStatement(sql);
            // 设置SQL参数
            setParams(pstm,params);

            // 执行SQL
            rs = pstm.executeQuery();
            // 获取结果集的元数据，也就是每一行的数据
            ResultSetMetaData metaData = rs.getMetaData();
            // 获取元数据的列数
            int columnCount = metaData.getColumnCount();
            // 遍历结果集
            if(rs.next()){
                // 获取水果类的实体类
                Class entityClass = ClassUtil.getEntityClass(entityClassName);
                // 创建实例
                T instance = (T)ClassUtil.createInstance(entityClassName);
                // 给实例附属性
                for(int i = 1 ; i<=columnCount;i++){
                    //获取列明,其实我们故意将列名和属性名保持一致，就是为了此处的反射赋值
                    String columnName = metaData.getColumnName(i);
                    Object columnValue = rs.getObject(i);
                    ClassUtil.setProperty(instance,columnName,columnValue);
                }
                // 把这个实例返回
                return instance;
            }
        }catch (SQLException e) {
            throw new RuntimeException(e);

        }finally {
            // 关闭连接
            ConnUtil.closeStream(pstm,rs);
        }
        return null;
    }
    // 查询复杂SQL的方法，此方法的返回值为List集合，List集合中存放的是Object类型的数组
    protected List<Object[]> executeMathQuery(String sql, Object ...params){
        List<Object[]> list = new ArrayList<>();
        connection = ConnUtil.getConnection();
        try {
            // 获取statement对象
            pstm = connection.prepareStatement(sql);
            // 设置SQL参数
            setParams(pstm,params);

            // 执行SQL
            rs = pstm.executeQuery();
            // 方式1：通过反射来处理
            // 方式2：通过数据解析器来处理（见JDBC章节）
            // 获取结果集的元数据，也就是每一行的数据
            ResultSetMetaData metaData = rs.getMetaData();
            // 获取元数据的列数
            int columnCount = metaData.getColumnCount();
            // 遍历结果集
            while(rs.next()){
                // 创建一个数组
                Object[] arr = new Object[columnCount];
                // 遍历
                for (int i = 0; i < columnCount; i++) {
                    // 获取当前行指定列的值
                    Object columnValue = rs.getObject(i + 1);
                    // 把当前行的值放在数组中
                    arr[i] = columnValue;
                }
                // 集合中添加元素
                list.add(arr);
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new BaseDaoRunTimeException(e.getMessage());
        }finally {
            ConnUtil.closeStream(pstm,rs);
        }
        return list;
    }
}
```

## 统一异常处理

目的是：在通用代码中，把编译型的异常，转换位运行时异常，ssm包中不再有try catch，不用担心异常处理了。

**🔥潜在问题**：内部组件trycatch到的问题，打印出来了，但在外部的组件就catch不到了；

**🐛解决办法**：统一对异常做处理；内部的组件出现问题之后，往外抛异常，让外部组件可以捕捉到；

3、定义一个 类的运行时异常。BaseDaoRunTimeException 类，继承 RuntimeException 类。

```java
package com.fruit.yuluo.myssm.exception;

/*
* 封装一个异常
* */
public class BaseDaoRunTimeException extends RuntimeException{
    public BaseDaoRunTimeException(String msg){
        super(msg);
    }
}

```

4、JDBC中大部分的异常都是编译时异常，分别在 BaseDao中抛出运行时异常，DispatcherServlet抛出运行时异常，ConUtil类中抛出运行时异常，TransActionManeger类中抛出运行时异常；

```ts
在 BaseDao 类、ConnUtil类、DispatcherServlet类、TransactionManager类、OpenSessionViewFilter中，catch到异常后，抛出异常。

catch (Exception e) {
    e.printStackTrace();
    throw new RuntimeException("未找到"+oper+"方法");
}

// 方式1：向外抛出自定义异常
throw new BaseDaoRunTimeException(e.getMessage)
// 方式2：向外抛出运行时异常
throw new RuntimeException("xxxxxx")
throw new BaseDaoRunTimeException(e.getMessage());
// 打印 异常堆栈信息
e.printStackTrace();
// 抛出运行时异常
throw new RuntimeException("未找到"+oper+"方法");
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
