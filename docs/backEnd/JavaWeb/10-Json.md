# Json

服务端通常要对象转为Json字符串，然后通过TCP协议传输过去。

前端项目上使用JSON对象对json数据进行转换，在java后端中使用Gson类对json数据进行转换。

## Gson类

包：第三方包

**构造方法**：

```java
Gson gson = new Gson();
```

**常用方法**：

fromJson()

```java
作用：从Json转为对象
    
参数：json字符串,对象class
    
返回值：对象类型
    
示例：
    
// 创建一个读取流 获取 请求体 中的数据
BufferedReader reader = req.getReader();
// 创建一个StringBuilder，往String中添加数据
StringBuilder stringBuilder = new StringBuilder();
String temp = null;
while((temp = reader.readLine()) !=null){
    // 往String中追加数据
    stringBuilder.append(temp)
}
// 转为String打印
String jsonStr = stringBuilder.toString();
// 把 String类型的转为 对象类型
// 使用第三方jar包 Gson 转换
// fromJson 转为对象类型
// toJson 转为json字符串
Gson gson = new Gson();
User user = gson.fromJson(jsonStr,User.class);
```

toJson()

```java
作用：从Json转为对象
    
参数：对象
    
返回值：json字符串
    
示例：
    
req.setCharacterEncoding("UTF-8"); // 防止中文乱码
req.setContentType("text/html;charset=utf-8");
User user = new User("Aqua","123123");
Gson gson = new Gson();
String userStr = gson.toJson(user)
// 响应
// resp.getWriter().write(userStr);
PrintWriter out = resp.getWriter();
out.print(userStr);
out.flush;
```

