# Listener监听器

监视器或监听器

## API

### ServletContextEvent类

包名：javax.servlet

作用：用于监听 **整个 Web 应用的生命周期事件**（即：启动与销毁）。

常用方法：

| 方法                  | 说明                                                        |
| --------------------- | ----------------------------------------------------------- |
| `getServletContext()` | 获取当前 Web 应用的 `ServletContext` 对象（全局上下文环境） |

示例1：创建监听器

```java
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

@WebListener // 或者在 web.xml 中配置
public class AppContextListener implements ServletContextListener {

    // Web 应用启动时调用（ServletContext 初始化）
    @Override
    public void contextInitialized(ServletContextEvent sce) {
        System.out.println("🌟 Web 应用启动中...");

        // 获取 ServletContext 对象
        var context = sce.getServletContext();

        // 示例：读取 web.xml 中的参数
        String configPath = context.getInitParameter("configPath");
        System.out.println("配置文件路径: " + configPath);

        // 示例：保存一些全局数据
        context.setAttribute("onlineCount", 0);
    }

    // Web 应用关闭时调用（ServletContext 销毁）
    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        System.out.println("🧹 Web 应用关闭，开始清理资源...");
        
        // 执行清理逻辑，例如关闭数据库连接池
        // DataSource.close() 等操作
    }
}

```

配置xml

```xml
<listener>
    <listener-class>com.example.listener.AppContextListener</listener-class>
</listener>

<context-param>
    <param-name>configPath</param-name>
    <param-value>/WEB-INF/config.properties</param-value>
</context-param>

```

示例2：在应用启动时加载配置文件

```java
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

public class MyContextListener implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent sce) {
        System.out.println("Web 应用启动！");
        var context = sce.getServletContext();
    	try (InputStream in = context.getResourceAsStream("/WEB-INF/config.properties")) {
            Properties props = new Properties();
            props.load(in);
            context.setAttribute("config", props);
            System.out.println("配置加载成功！");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        System.out.println("Web 应用关闭！");
        var context = sce.getServletContext();
        ExecutorService pool = (ExecutorService) context.getAttribute("threadPool");
        if (pool != null && !pool.isShutdown()) {
            pool.shutdown();
        }
        System.out.println("线程池关闭完成");
    }
}

```

配置

```xml
<listener>
    <listener-class>com.example.listener.AppContextListener</listener-class>
</listener>
```

## Listener应用

在Tomcat启动时，就在IOC 容器中创建对象，而不是在 Servlet 加载时创建对象，因为默认Servlet类被加载是在请求到来时才开始加载。使用Listener监听器，监听到Tomcat启动就开始创建 IOC容器 对象，这样效率更高。

## 监听器分类

### 1**ServletContextListener**

作用：监听ServletContext对象的创建与销毁

| 方法名                                      | 作用                     |
| ------------------------------------------- | ------------------------ |
| contextInitialized(ServletContextEvent sce) | ServletContext创建时调用 |
| contextDestroyed(ServletContextEvent sce)   | ServletContext销毁时调用 |

ServletContextEvent对象代表从ServletContext对象身上捕获到的事件，通过这个事件对象我们可以获取到ServletContext对象。

### 2**HttpSessionListener**

作用：监听HttpSession对象的创建与销毁

| 方法名                                 | 作用                      |
| -------------------------------------- | ------------------------- |
| sessionCreated(HttpSessionEvent hse)   | HttpSession对象创建时调用 |
| sessionDestroyed(HttpSessionEvent hse) | HttpSession对象销毁时调用 |

HttpSessionEvent对象代表从HttpSession对象身上捕获到的事件，通过这个事件对象我们可以获取到触发事件的HttpSession对象。

### 3**ServletRequestListener**

作用：监听ServletRequest对象的创建与销毁

| 方法名                                      | 作用                         |
| ------------------------------------------- | ---------------------------- |
| requestInitialized(ServletRequestEvent sre) | ServletRequest对象创建时调用 |
| requestDestroyed(ServletRequestEvent sre)   | ServletRequest对象销毁时调用 |

ServletRequestEvent对象代表从HttpServletRequest对象身上捕获到的事件，通过这个事件对象我们可以获取到触发事件的HttpServletRequest对象。另外还有一个方法可以获取到当前Web应用的ServletContext对象。

### 4**ServletContextAttributeListener**

作用：监听ServletContext中属性的创建、修改和销毁

| 方法名                                               | 作用                                 |
| ---------------------------------------------------- | ------------------------------------ |
| attributeAdded(ServletContextAttributeEvent scab)    | 向ServletContext中添加属性时调用     |
| attributeRemoved(ServletContextAttributeEvent scab)  | 从ServletContext中移除属性时调用     |
| attributeReplaced(ServletContextAttributeEvent scab) | 当ServletContext中的属性被修改时调用 |

ServletContextAttributeEvent对象代表属性变化事件，它包含的方法如下：

| 方法名              | 作用                     |
| ------------------- | ------------------------ |
| getName()           | 获取修改或添加的属性名   |
| getValue()          | 获取被修改或添加的属性值 |
| getServletContext() | 获取ServletContext对象   |

### 5**HttpSessionAttributeListener**

作用：监听HttpSession中属性的创建、修改和销毁

| 方法名                                        | 作用                              |
| --------------------------------------------- | --------------------------------- |
| attributeAdded(HttpSessionBindingEvent se)    | 向HttpSession中添加属性时调用     |
| attributeRemoved(HttpSessionBindingEvent se)  | 从HttpSession中移除属性时调用     |
| attributeReplaced(HttpSessionBindingEvent se) | 当HttpSession中的属性被修改时调用 |

HttpSessionBindingEvent对象代表属性变化事件，它包含的方法如下：

| 方法名       | 作用                          |
| ------------ | ----------------------------- |
| getName()    | 获取修改或添加的属性名        |
| getValue()   | 获取被修改或添加的属性值      |
| getSession() | 获取触发事件的HttpSession对象 |

### 6**ServletRequestAttributeListener**

作用：监听ServletRequest中属性的创建、修改和销毁

| 方法名                                               | 作用                                 |
| ---------------------------------------------------- | ------------------------------------ |
| attributeAdded(ServletRequestAttributeEvent srae)    | 向ServletRequest中添加属性时调用     |
| attributeRemoved(ServletRequestAttributeEvent srae)  | 从ServletRequest中移除属性时调用     |
| attributeReplaced(ServletRequestAttributeEvent srae) | 当ServletRequest中的属性被修改时调用 |

ServletRequestAttributeEvent对象代表属性变化事件，它包含的方法如下：

| 方法名               | 作用                             |
| -------------------- | -------------------------------- |
| getName()            | 获取修改或添加的属性名           |
| getValue()           | 获取被修改或添加的属性值         |
| getServletRequest () | 获取触发事件的ServletRequest对象 |

### 7**HttpSessionBindingListener**

作用：监听某个对象在Session域中的创建与移除

| 方法名                                      | 作用                              |
| ------------------------------------------- | --------------------------------- |
| valueBound(HttpSessionBindingEvent event)   | 该类的实例被放到Session域中时调用 |
| valueUnbound(HttpSessionBindingEvent event) | 该类的实例从Session中移除时调用   |

HttpSessionBindingEvent对象代表属性变化事件，它包含的方法如下：

| 方法名       | 作用                          |
| ------------ | ----------------------------- |
| getName()    | 获取当前事件涉及的属性名      |
| getValue()   | 获取当前事件涉及的属性值      |
| getSession() | 获取触发事件的HttpSession对象 |

### 8**HttpSessionActivationListener**

作用：监听某个对象在Session中的序列化与反序列化。

| 方法名                                    | 作用                                  |
| ----------------------------------------- | ------------------------------------- |
| sessionWillPassivate(HttpSessionEvent se) | 该类实例和Session一起钝化到硬盘时调用 |
| sessionDidActivate(HttpSessionEvent se)   | 该类实例和Session一起活化到内存时调用 |

HttpSessionEvent对象代表事件对象，通过getSession()方法获取事件涉及的HttpSession对象。

## 使用案例

### ServletContextListener

ServletContextListener是监听ServletContext对象的创建和销毁的，因为ServletContext对象是在服务器启动的时候创建、在服务器关闭的时候销毁，所以ServletContextListener也可以监听服务器的启动和关闭。

### 使用场景

将来学习SpringMVC的时候，会用到一个ContextLoaderListener，这个监听器就实现了ServletContextListener接口，表示对ServletContext对象本身的生命周期进行监控。

### 代码实现

创建监听器类

```java
package com.atguigu.listener;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

/**
 * 包名:com.atguigu.listener
 *
 * @author Leevi
 * 日期2021-05-18  14:10
 * ServletContextLisneter监听器可以监听服务器的启动和关闭
 * 1. contextInitialized()方法可以监听服务器的启动
 * 2. contextDestroyed()方法可以监听服务器的关闭
 */
public class MyContextListener implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent servletContextEvent) {
        System.out.println("服务器启动了...");
        // 获取servletContext对象
        ServletContent cxt = servletContextEvent.getServletContext()
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        System.out.println("服务器关闭了...");
    }
}
```

注册监听器

```xml
<!--配置Listener-->
<listener>
    <listener-class>com.atguigu.listener.MyContextListener</listener-class>
</listener>

<!--配置上下文参数-->
<content-param>
	<param-name>hello</param-name>
    <param-value>world</param-value>
</content-param>

```

或者在代码中使用注解的方式配置Listener

```java
@WebListener
```

