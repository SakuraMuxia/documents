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

// 过滤器方法    
doFilter(ServletRequest req,ServletRespon resp,FilterChain chain)

// 销毁方法
destory()
```

init()

```java
作用：
    
参数：
    
返回值：
    
示例：
```

doFilter()

```java
作用：
    
参数：
    
返回值：
    
示例：
```

destory()

```java
作用：
    
参数：
    
返回值：
    
示例：
```

示例

**Filter配置**

两种方式：

```java
// 第一种可以使用注解 @WebFilter,推荐使用XML配置(因为过滤器链的执行顺序问题)
    
    
// 第二种可以使用XML配置
    
    
```



### FilterConfig

类似于ServletConfig，作用：用于读取初始化信息。

**常用方法**

```
作用：
    
参数：
    
返回值：
    
示例：
```



### FilterChain

**常用方法**

doFilter()

```java
作用：
    
参数：
    
返回值：
    
示例：
```

### ThreadLocal类

作用：

常用方法：

set()

```java

```

get()

```java

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

```java
当一个请求过来的时候，http协议，底层是tcp/ip协议，发来一个请求实则就是发来一个Socket；
Tomcat服务器接受到这个Socket，会专门开辟一个线程，用来接待你，对你做响应，是一个新的线程，所以后续的组件都是由这一个线程调用执行的。
    
只要这几个组件是由同一个线程执行的，就可以获取到 ThreadLocal 对象，这个ThreadLocal（传送带上带有属性也就是工具）可以被同一个线程上的组件获取到。
    
我们可以把这个工具箱（Connection对象）放在传送带上（ThreadLocal），
```



## Filter应用

### 抽离操作

把Servlet中公共部分抽离放置在Filter中。例如设置编码。

### 事务管理

事务管理动作，应该基于业务方法，事务应该建立在业务层，而不是数据访问层。

使用实例：

创建OpenSessionInViewFilter.java类，配置xml配置

```java

```

```xml

```

创建 TransActionManager类；作用：用于管理JDBC中的事务；

```java

```

TransActionManager类说明：

获取Connection对象：通过TreadLocal获取，因为Connection对象是在Dao层，需要修改数据库连接工具类，使用TreadLocal获取连接，可以在同一个线程上获取数据，数据通信。

```java

```

新建一个工具类：ConnUtil，作用：获取ThreadLocal对象，获取Connection对象；

```java

```

潜在问题：内部组件trycatch到的问题，打印出来了，但在外部的组件就catch不到了；

```java

```

解决办法：统一对异常做处理；内部的组件出现问题之后，往外抛异常，让外部组件可以捕捉到；

自定义一个 类的运行时异常 或 直接抛出一个 运行时异常

```java

```

分别在 BaseDao中抛出运行时异常，DispatcherServlet抛出运行时异常，ConUtil类中抛出运行时异常，TransActionManeger类中；

```

```

### 统一异常处理

在通用代码中，把编译型的异常，转换位运行时异常；