# Cookie

## API

构造方法

```java

```

常用方法：

setMaxAge()

```java

```



## 特点

> 每个Cookie 的大小不能超过4kb
>
> 客户端有了Cookie 后，每次请求都发送给服务器
>
> Cookie 是服务器通知客户端保存键值对的一种技术

## Server创建Cookie

![image-20251105165318944](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20251105165318944.png)

Servlet程序中的代码

```java
protected void createCookie(HttpServletRequest req, HttpServletResponse resp) {
    //1 创建Cookie 对象
    Cookie cookie = new Cookie("key4", "value4");
    //2 通知客户端保存Cookie
    resp.addCookie(cookie);
    //1 创建Cookie 对象
    Cookie cookie1 = new Cookie("key5", "value5");
    //2 通知客户端保存Cookie
    resp.addCookie(cookie1);
    resp.getWriter().write("Cookie 创建成功");
}
```

## Server获取Cookie

![image-20251105165429664](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20251105165429664.png)

Cookie的工具类

```java
public class CookieUtils {
    /**
    * 查找指定名称的Cookie 对象
    * @param name
    * @param cookies
    * @return
    */
public static Cookie findCookie(String name , Cookie[] cookies){
    // 
    if (name == null || cookies == null || cookies.length == 0) {
    	return null;
    }
    // 遍历cookie
    for (Cookie cookie : cookies) {
    	if (name.equals(cookie.getName())){
    		return cookie;
    	}
    }
}
```

## 修改Cookie

方式一：先创建一个要修改的同名（指的就是key）的Cookie 对象

```java
// 方案一：
// 1、先创建一个要修改的同名的Cookie 对象
// 2、在构造器，同时赋于新的Cookie 值。
Cookie cookie = new Cookie("key1","newValue1");
// 3、调用response.addCookie( Cookie ); 通知客户端保存修改
resp.addCookie(cookie);
```

方式二：先查找到需要修改的Cookie 对象，调用setValue()方法赋于新的Cookie 值。

```java
// 方案二：
// 1、先查找到需要修改的Cookie 对象
	Cookie cookie = CookieUtils.findCookie("key2", req.getCookies());
if (cookie != null) {
    // 2、调用setValue()方法赋于新的Cookie 值。
    cookie.setValue("newValue2");
    // 3、调用response.addCookie()通知客户端保存修改
    resp.addCookie(cookie);
}
```

## 生命周期

Cookie的生命控制指的是如何管理Cookie什么时候销毁

使用 `setMaxAge()`方法

> 正数，表示在指定的秒数后过期；
>
> 负数，表示浏览器一关，Cookie 就会被删除（默认值是-1）；
>
> 零，表示马上删除Cookie；

## 有效路径Path和Domain

Cookie 的path 属性可以有效的控制 哪些Cookie 可以发送给服务器。哪些可以不用发给服务器。

path 属性是通过请求的地址来进行有效的过滤；

```java
protected void testPath(HttpServletRequest req, HttpServletResponse resp){
    Cookie cookie = new Cookie("key1", "aqua");
     // /工程路径/abc,只有这个路径下可以发送key1这个cookie
    cookie.setPath( req.getContextPath() + "/abc" );
    resp.addCookie(cookie);
    resp.getWriter().write("创建了一个带有Path 路径的Cookie");
}
```

Domain 属性用于过滤，根据域名来判断给哪个服务器发送cookie，例如淘宝的cookie，不会发给京东的服务器。

## 免密登陆

通过设置 cookie 的方式实现，免密登陆，同时设置cookie的生效时长，相当于把cookie中的信息保存在了客户的本地磁盘中，账号密码信息进行了加密处理。

## SessionID

session中的id默认会保存在cookie中。