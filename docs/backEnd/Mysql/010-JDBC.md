# JDBC

## 概念

JDBC：Java Database Connectivity，它是代表一组独立于任何数据库管理系统（DBMS）的API，声明在java.sql与javax.sql包中，是SUN(现在Oracle)提供的一组接口规范。由各个数据库厂商来提供实现类，这些实现类的集合构成了数据库驱动jar。

![image-20250826154855771](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250826154855771.png)

![image-20250826155215758](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20250826155215758.png)

```java
JDBC是SUN公司提供的一套规范，一套接口，位于java.sql包中。
具体实现类有各个厂商负责实现来连接各自的数据库。
```

## 基本使用

### 准备驱动

```ts
前提操作：
1.选中项目文件 右键new directory 创建名为lib的文件夹
2.将mysql jdbc对应的jar文件粘贴到此目录，例如：mysql-connector-java-8.0.25.jar
3.选中lib文件夹 右键 add as library，这样就可以下拉查看里边的class文件了
```

### 使用步骤

```java
try {
    // 1. 加载驱动
    Class.forName("com.mysql.cj.jdbc.Driver");
    // 2. 获取连接对象
    String url = "jdbc:mysql://192.168.1.38:3306/chatai";
    String userName = "xxx";
    String password = "xxx";
    // 获取对象
    Connection connection = DriverManager.getConnection(url, userName, password);
    // 3. 创建执行SQL语句st对象
    Statement st = connection.createStatement();
    // 4. 编写SQL
    String sql = "select * from student";
    // 5. 执行SQL
    ResultSet resultSet = st.executeQuery(sql);
    // 6. 遍历结果集
    while (resultSet.next()){
        int anInt = resultSet.getInt(1);
        String anString = resultSet.getString(2);
        System.out.println("第一列数据为:" + anInt);
        System.out.println("第二列数据为:" + anString);
    }
} catch (ClassNotFoundException e) {
    e.printStackTrace();
} catch (SQLException e) {
    e.printStackTrace();
}
```

## API

### DriverManager类

位于java.sql包中，驱动管理类。

**构造方法**：

```java
无
```

**方法**：

getConnection()（静态方法）

```java
作用：获取数据库连接对象
    
参数：url地址,用户名,密码
    
返回值：Connection对象
    
示例：
String url = "jdbc:mysql://xxx.xxx.xxx.xxx:3306/数据库名称";
String userName = "xxx";
String password = "xxx";
// 获取对象
Connection connection = DriverManager.getConnection(url, userName, password);
```



### Connection接口

位于java.sql包中，数据库连接对象，他的实现类就是我们导入的mysql公司提供的jar包中的文件。

**构造方法**：

```java
无
```

**方法**：

createStatement()

```java
作用：创建SQL语句对象
    
参数：无
    
返回值：Statement对象
    
示例：
// 获取对象
Connection connection = DriverManager.getConnection(url, userName, password);
// 3. 创建执行SQL语句st对象
Statement st = connection.createStatement();
```

close()

```java
作用：关闭连接
    
参数：无
    
返回值：无
    
示例：
// 获取对象
Connection connection = DriverManager.getConnection(url, userName, password);
// 3. 创建执行SQL语句st对象
Statement st = connection.createStatement();
// 关闭连接
connection.close;
```



### Statement接口

位于java.sql包中，用来执行sql的对象，他的实现类就是我们导入的mysql公司提供的jar包中的文件。

**构造方法**：

```java
无
```

**方法**：

executeUpdate()

```java
作用：执行SQL更新语句
    
参数：SQL语句string类型
    
返回值：int类型，大于0成功，小于0失败
    
示例：
// 获取对象
Connection connection = DriverManager.getConnection(url, userName, password);
// 创建执行SQL语句st对象
Statement st = connection.createStatement();
// 编写SQL
String sql = "xxx";
// 执行SQL
Int aint = st.executeUpdate(sql);
```

executeQuery()

```java
作用：执行SQL查询语句
    
参数：SQL语句string类型
    
返回值：ResultSet类型
    
示例：
// 获取对象
Connection connection = DriverManager.getConnection(url, userName, password);
// 创建执行SQL语句st对象
Statement st = connection.createStatement();
// 编写SQL
String sql = "select * from student";
// 执行SQL
ResultSet resultSet = st.executeQuery(sql);
```

close()

```java
作用：关闭连接
    
参数：SQL语句string类型
    
返回值：int类型，大于0成功，小于0失败
    
示例：
// 获取对象
Connection connection = DriverManager.getConnection(url, userName, password);
// 创建执行SQL语句st对象
Statement st = connection.createStatement();
// 编写SQL
String sql = "select * from student";
// 执行SQL
ResultSet resultSet = st.executeQuery(sql);
```



### PreparedStatement接口

位于java.sql包中，用来执行sql的类，他的父类是Statement类。

**构造方法**：

```java

```

**方法**：

getConnection()

```java
作用：获取数据库连接对象
    
参数：url地址,用户名,密码
    
返回值：Connection对象
    
示例：
```

### ResultSet接口

是一个接口，位于java.sql包中，表示数据库结果集的数据表，通常通过执行查询数据库的语句生成。

（类似于数据库软件中的Excel表格形式）

无序的，没有下标，Set集合特性。

**构造方法**：

```java
无
```

**方法**：

next()

```java
作用：是否存在下一条数据
    
参数：无
    
返回值：布尔类型
    
示例：
// 6. 遍历结果集
while (resultSet.next()){
    int anInt = resultSet.getInt(1);
    String anString = resultSet.getString(2);
    System.out.println("第一列数据为:" + anInt);
    System.out.println("第二列数据为:" + anString);
}
```

getInt()

```java
作用：获取结果集数据表中的列的数据，列的数据类型是Int类型
    
参数：
    当为int类型时，表示第几列的数据；
    当为string类型时，表示列的名称；
    
返回值：Int类型
    
示例：
// 6. 遍历结果集
while (resultSet.next()){
    int anInt = resultSet.getInt(1);
    String anString = resultSet.getString(2);
    System.out.println("第一列数据为:" + anInt);
    System.out.println("第二列数据为:" + anString);
}
```

getString()

```java
作用：获取结果集数据表中的列的数据，列的数据类型是String类型
    
参数：
    当为int类型时，表示第几列的数据；
    当为string类型时，表示列的名称；
    
返回值：String类型
    
示例：
// 6. 遍历结果集
while (resultSet.next()){
    int anInt = resultSet.getInt(1);
    String anString = resultSet.getString(2);
    System.out.println("第一列数据为:" + anInt);
    System.out.println("第二列数据为:" + anString);
}
```

## CRUD

### 增删改

### 查询

## 数据库连接池



## 封装JDBCTools



## 封装BasicDAOImpl

