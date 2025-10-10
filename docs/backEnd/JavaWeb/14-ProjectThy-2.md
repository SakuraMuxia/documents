# ProjectThy-2

## 更改项目结构

把 公共的部分 放置在同一个目录内，然后进行打包，模拟框架的形成。

把 servlet 相关，utils相关，IOC相关，数据库连接相关，放在 myssm 目录中。方便以后打包使用。

项目结构：

依赖jar包：

![image-20251010110422121](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20251010110422121.png)

资源文件：

![image-20251010110437744](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20251010110437744.png)

源文件：

![image-20251010110449375](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20251010110449375.png)

web文件：

![image-20251010110511736](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20251010110511736.png)

## 过滤器

**抽离编码设置到过滤器中**

使用过滤器，新建 myssm 目录下一个 filter 目录，新建文件CharacterEncodingFilter.java 文件。

```java
package com.fruit.yuluo.myssm.filter;

import com.fruit.yuluo.myssm.utils.StringUtils;

import javax.servlet.*;
import java.io.IOException;

/*
* 这个过滤器是为了统一编码
* */

public class CharacterEncodingFilter implements Filter {
    private final String ENCODING_KEY = "encoding";
    // 设置一个静态常量
    private String defaultEncoding = "UTF-8";

    @Override
    public void init(FilterConfig config) throws ServletException {
        // 从web.xml读取初始化参数
        String encoding = config.getInitParameter(ENCODING_KEY);
        // 判断,如果没有配置则为 UTF-8
        if (StringUtils.isNotEmpty(encoding)){
            defaultEncoding = encoding;
        }
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain) throws IOException, ServletException {
        // 设置 统一编码
        req.setCharacterEncoding(defaultEncoding);
        // 放行
        chain.doFilter(req,resp);
    }

    @Override
    public void destroy() {
        Filter.super.destroy();
    }
}

```

在web.xml中配置filter，类似于Servlet配置。

```xml
<!--filter配置类似Servlet配置-->
    <filter>
        <filter-name>CharacterEncodingFilter</filter-name>
        <filter-class>com.fruit.yuluo.myssm.filter.CharacterEncodingFilter</filter-class>
    </filter>
    <filter-mapping>
        <filter-name>CharacterEncodingFilter</filter-name>
        <url-pattern>*.do</url-pattern>
    </filter-mapping>
```

**使用 OpenSessionViewFilter过滤器 应用事务管理**

新建 com.fruit.yuluo.myssm.filter.OpenSessionViewFilter.java 文件

```java

```

配置 OpenSessionViewFilter的 web.xml 

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

## 线程传送带

创建 ConnUtil 工具类 用于获取同一个线程对象上的 connection 对象，同时修改之前的 DBUtil工具类。

ConnUtil 类：此时ConnUtil实现了 DBUtil类的所有功能，不再需要DBUtil工具类了，修改BaseDao类中的代码引用。

```java

```

BaseDao类：

```java

```

## 事务管理类

**创建 TransactionFilter 类用于管理事务的开启，提交，回滚。**

com.fruit.yuluo.myssm.transaction.TransactionManager

```java

```

## 统一异常处理

