# Thymeleaf项目

## 水果案例

### 封装基类

封装BaseDao

```java
package com.fruit.yuluo.dao;

import com.fruit.yuluo.utils.ClassUtil;
import com.fruit.yuluo.utils.DButil;

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

// 定义BaseDao为一个抽象类
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
        connection = DButil.getConnection();

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
            e.printStackTrace();
        } finally {
            // 关闭连接
            DButil.close(connection,pstm,rs);
        }
        return 0;
    }

    // 查询列表的方法
    protected List<T> executeQuery(String sql,Object ...params){
        List<T> list = new ArrayList<>();
        connection = DButil.getConnection();
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
        }finally {
            DButil.close(connection,pstm,rs);
        }
        return list;
    }

    // 查询单个方法
    protected T load(String sql,Object ...params){
        // 获取连接
        connection = DButil.getConnection();
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
        }
        return null;
    }
}

```

封装工具类 反射使用

```java
package com.fruit.yuluo.utils;

import java.lang.reflect.Field;

public class ClassUtil {
    // 获取 Class对象
    public static Class getEntityClass(String entityName){
        try {
            return Class.forName(entityName);
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
        return null;
    }
    // 通过反射创建Class对象的实例
    public static Object createInstance(String entityName){
        try {
            return getEntityClass(entityName).newInstance();
        } catch (InstantiationException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        }
        return null;
    }

    // 通过反射给实例的属性赋值
    public static void setProperty(Object obj,String propertyName,Object propertyValue){
        try {
            Field field = obj.getClass().getDeclaredField(propertyName);
            // 忽略警告
            field.setAccessible(true);
            // 赋值
            field.set(obj,propertyValue);
        } catch (NoSuchFieldException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        }
    }
}

```

封装工具类，数据库连接

```java
package com.fruit.yuluo.utils;

import com.alibaba.druid.pool.DruidDataSource;

import java.io.InputStream;
import java.sql.*;
import java.util.Properties;

public class DButil {
    // 定义静态数据
    private static String DRIVER;
    private static String URL;
    private static String USER;
    private static String PWD;
    // 定义静态的 数据库连接池对象
    private static DruidDataSource dataSource;

    // 静态代码块，在类加载时读取配置
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
        }
    }

    // 获取连接,返回一个连接对象
    public static Connection getConnection() {
        try {
           return dataSource.getConnection();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    // 关闭连接
    public static void close(Connection conn, Statement stmt, ResultSet rs) {
        try {
            if (rs != null) rs.close();
            if (stmt != null) stmt.close();
            if (conn != null) conn.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}

```

封装serlver基类

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

### 定义Dao接口

定义一个FruitDao接口和实现类

```java
package com.fruit.yuluo.dao;
import com.fruit.yuluo.pojo.Fruit;

import java.util.List;

public interface FruitDao {
    // 获取所有的库存记录
    List<Fruit> getFruitList();

    // 添加新库存
    void addFruit(Fruit fruit);

    // 删除指定的库存记录
    void delFruit(Integer id);

    // 获取指定的库存记录
    Fruit getFruit(Integer id);
    Fruit getFruit(String name);

    // 修改库存记录
    void updateFruit(Fruit fruit);
}

```

```java
package com.fruit.yuluo.dao.impl;

import com.fruit.yuluo.dao.BaseDao;
import com.fruit.yuluo.dao.FruitDao;
import com.fruit.yuluo.pojo.Fruit;

import java.util.List;

public class FruitDaoImpl extends BaseDao<Fruit> implements FruitDao {
    @Override
    public List<Fruit> getFruitList() {
        String sql = "select * from goods";
        List<Fruit> fruits = this.executeQuery(sql, null);
        return fruits;
    }

    @Override
    public void addFruit(Fruit fruit) {
        String sql = "insert into goods values(0,?,?,?,?)";
        int resRow = this.executeUpdate(sql, fruit.getFname(), fruit.getPrice(), fruit.getCount(), fruit.getRemark());
    }

    @Override
    public void delFruit(Integer id) {
        String sql = "delete from goods where id = ?";
        int resRow = this.executeUpdate(sql, id);
    }

    @Override
    public Fruit getFruitById(Integer id) {
        String sql = "select * from goods where id = ?";
        Fruit fruit = load(sql, id);
        return fruit;
    }

    @Override
    public Fruit getFruit(String name) {
        return null;
    }

    @Override
    public void updateFruit(Fruit fruit) {
        String sql = "update goods set fname=?,price=?,count=?,remark=? where id=?";
        executeUpdate(sql,fruit.getFname(),fruit.getPrice(),fruit.getCount(),fruit.getRemark(),fruit.getId());
    }
}

```

### 定义Pojo

定义pojo Fruit实体类

```java
package com.fruit.yuluo.pojo;

import java.math.BigDecimal;

public class Fruit {
    // 私有属性
    private Integer id;
    private String fname;
    private BigDecimal price; // 用 BigDecimal 存金额
    private Integer count;
    private String remark;

    public Fruit() {
    }

    public Fruit(Integer id, String fname, BigDecimal price, Integer count, String remark) {
        this.id = id;
        this.fname = fname;
        this.price = price;
        this.count = count;
        this.remark = remark;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getFname() {
        return fname;
    }

    public void setFname(String fname) {
        this.fname = fname;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getCount() {
        return count;
    }

    public void setCount(Integer fcount) {
        this.count = fcount;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    @Override
    public String toString() {
        return "Fruit{" +
                "id=" + id +
                ", fname='" + fname + '\'' +
                ", price=" + price +
                ", count=" + count +
                ", remark='" + remark + '\'' +
                '}';
    }
}

```

创建水果模版页面

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
  <header>
    <h1>欢迎来到水果列表页面</h1>
  </header>
</body>
</html>
```

定义首页Servlet

```java
package com.fruit.yuluo.servlet.fruitServlet;

import com.fruit.yuluo.dao.FruitDao;
import com.fruit.yuluo.dao.impl.FruitDaoImpl;
import com.fruit.yuluo.pojo.Fruit;
import com.fruit.yuluo.servlet.ViewBaseServlet;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.List;

public class fruitServlet extends ViewBaseServlet {
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 创建dao实例
        FruitDao fruitDao = new FruitDaoImpl();
        // 调用查询方法
        List<Fruit> fruitList = fruitDao.getFruitList();
        // 保存到session中
        HttpSession session = req.getSession();
        // 设置属性
        session.setAttribute("fruitList",fruitList);
        // 使用thymeleaf渲染
        super.processTemplate("fruitList",req,resp);

    }
}

```

配置web.xml

```xml
<!--配置水果servlet-->
    <servlet>
        <servlet-name>fruitList</servlet-name>
        <servlet-class>com.fruit.yuluo.servlet.fruitServlet.fruitServlet</servlet-class>
    </servlet>
    <servlet-mapping>
        <servlet-name>fruitList</servlet-name>
        <url-pattern>/fruitList</url-pattern>
    </servlet-mapping>
```

### 增删改查

#### 列表页面

水果列表页面 fruitList.html

```html
<!DOCTYPE html>
<!--添加这行可以在编辑器中提示语法-->
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>水果库存管理系统</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</head>
<body class="bg-light">
    <!-- 页面标题 -->
    <h2 class="text-center mb-4">水果列表</h2>
    <!-- 水果列表 -->
    <!-- 水果列表表格 -->
    <div class="container py-4 d-flex justify-content-center">
        <div class="card shadow-sm" style="width: 60%; background-color: #f5f7fa;">
            <!-- 顶部操作栏 -->
            <div class="d-flex justify-content-end mb-3">
                <a th:href="@{/newFruit}" class="btn btn-primary btn-sm">
                    <i class="bi bi-plus-circle"></i> 添加水果
                </a>
            </div>
            <!-- 水果列表表格 -->
            <div class="card-header bg-success text-white">水果清单</div>
            <div class="card-body p-0">
                <table class="table table-striped table-hover align-middle mb-0">
                    <thead class="table-dark">
                    <tr>
                        <th>编号</th>
                        <th>名称</th>
                        <th>价格</th>
                        <th>库存</th>
                        <th>操作</th>
                    </tr>
                    </thead>
                    <tbody>
                    <!-- 遍历水果列表 这里默认使用请求域中数据 -->
                    <!--
                        th:each 表示准备迭代
                        ${} 这是thymeleaf的语法，表示thymeleaf表达式
                        session.key 相当于  session.getAttribute(key)
                        :  冒号相当于增强for循环中的冒号  , fruit是临时变量
                    -->
                    <!--
                        th:if  表示分支判断   对应的有 th:unless
                        #lists 是一个公共的内置对象（工具类）
                    -->
                    <!--
                         ${fruit.price}
                         这里的.属性名  是一种语法，称之为OGNL语法 。 实际上是调用这个对象的属性的getter方法
                         OGNL: Object Graphic Navigation Language   对象图导航语言
                    -->
                    <tr th:if="${not #lists.isEmpty(session.fruitList)}" th:each="fruit : ${session.fruitList}">
                        <td th:text="${fruit.id}"></td>
                        <td >
                            <a style="text-decoration: none" th:href="@{editFruit(id=${fruit.id})}" th:text="${fruit.fname}"></a>
                        </td>
                        <td th:text="${fruit.price}"></td>
                        <td th:text="${fruit.count}"></td>
                        <td>
                            <!-- 删除按钮 -->
                            <a th:href="@{/delFruit(id=${fruit.id})}"
                               class="btn btn-danger btn-sm"
                               onclick="return confirm('确定要删除这个水果吗？');">删除</a>
                        </td>
                    </tr>
                    <!--空数据展示-->
                    <tr th:unless="${not #lists.isEmpty(session.fruitList)}">
                        <td colspan="5">对不起，库存为空！</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</body>
<script>

</script>
</html>
```

**水果列表Servlet fruitServlet.java**

```java
package com.fruit.yuluo.servlet.fruitServlet;

import com.fruit.yuluo.dao.FruitDao;
import com.fruit.yuluo.dao.impl.FruitDaoImpl;
import com.fruit.yuluo.pojo.Fruit;
import com.fruit.yuluo.servlet.ViewBaseServlet;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.List;

public class fruitServlet extends ViewBaseServlet {
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 创建dao实例
        FruitDao fruitDao = new FruitDaoImpl();
        // 调用查询方法
        List<Fruit> fruitList = fruitDao.getFruitList();

        // 打印查询到的数据
        // for (Fruit fruit : fruitList) {
        //     System.out.println("fruit = " + fruit);
        // }

        // 保存到session中
        HttpSession session = req.getSession();
        // 设置属性
        session.setAttribute("fruitList",fruitList);
        // 使用thymeleaf渲染
        super.processTemplate("fruitList",req,resp);

    }
}

```

#### 新增水果

**新增Servlet addFruit.java**

```java
package com.fruit.yuluo.servlet.fruitServlet;

import com.fruit.yuluo.dao.FruitDao;
import com.fruit.yuluo.dao.impl.FruitDaoImpl;
import com.fruit.yuluo.pojo.Fruit;
import com.fruit.yuluo.servlet.ViewBaseServlet;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.math.BigDecimal;

public class addFruit extends ViewBaseServlet {
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 设置编码
        req.setCharacterEncoding("UTF-8");
        // 获取参数
        String fname = req.getParameter("fname");
        String price = req.getParameter("price");
        // 转为大数
        BigDecimal bigPrice = new BigDecimal(price.trim());
        Integer fcount = Integer.parseInt(req.getParameter("count"));
        String remark = req.getParameter("remark");
        // 调用dao方法
        Fruit fruit = new Fruit(fname,bigPrice,fcount,remark);
        FruitDao fruitDao = new FruitDaoImpl();
        fruitDao.addFruit(fruit);
        // 重定向到列表
        resp.sendRedirect("fruitList");
    }
}

```

**新增页面跳转Servlet newFruit.java**

```java
package com.fruit.yuluo.servlet.fruitServlet;

import com.fruit.yuluo.servlet.ViewBaseServlet;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class newFruit extends ViewBaseServlet {
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        super.processTemplate("newFruit",req,resp);
    }
}

```

**新增页面 newFruit.html**

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
  <meta charset="UTF-8">
  <title>添加水果</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 30px;
    }
    form {
      max-width: 400px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 10px;
      background: #f9f9f9;
    }
    label {
      display: block;
      margin-top: 15px;
    }
    input, select, button {
      width: 100%;
      padding: 8px;
      margin-top: 5px;
      box-sizing: border-box;
    }
    button {
      background-color: #4CAF50;
      color: white;
      border: none;
      margin-top: 20px;
      cursor: pointer;
    }
    button:hover {
      background-color: #45a049;
    }
  </style>
</head>
<body class="bg-light">
  <div class="container py-5">
    <div class="card-body">
      <h2 class="text-center mb-4">添加水果</h2>
      <form action="addFruit" method="post">
        <!-- 水果名称 -->
        <div class="mb-3">
          <label class="form-label">水果名称：</label>
          <input type="text" class="form-control" name="fname">
        </div>
        <!-- 价格 -->
        <div class="mb-3">
          <label class="form-label">价格：</label>
          <input type="number" class="form-control" name="price" step="0.01">
        </div>
        <!-- 库存数量 -->
        <div class="mb-3">
          <label class="form-label">库存数量：</label>
          <input type="number" class="form-control" name="count">
        </div>
        <!-- 备注 -->
        <div class="mb-3">
          <label class="form-label">备注：</label>
          <input type="text" class="form-control" name="remark">
        </div>
        <!-- 操作按钮 -->
        <div class="d-flex justify-content-between">
          <button type="submit" class="btn btn-success">保存</button>
          <button onclick="handleJumpList()" type="button">取消</button>
        </div>
      </form>
    </div>
  </div>
<script>
  const handleJumpList = () => {
    // 方式2：如果你使用的是后端路由，比如 Spring Boot 的 /fruit/list
    window.location.href = '/fruit/fruitList';
  }
</script>
</body>
</html>
```

#### 编辑水果

**编辑水果Servlet，editFruit.java**

```java
package com.fruit.yuluo.servlet.fruitServlet;

import com.fruit.yuluo.dao.FruitDao;
import com.fruit.yuluo.dao.impl.FruitDaoImpl;
import com.fruit.yuluo.pojo.Fruit;
import com.fruit.yuluo.servlet.ViewBaseServlet;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class editFruit extends ViewBaseServlet {
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 接收请求传来的参数
        String idStr = req.getParameter("id");
        // 判断条件,不能为空且不能不传
        if(idStr !=null && !"".equals(idStr)){
            // 转为包装类,同时强转为Integer类
            Integer id = Integer.parseInt(idStr);
            // 创建dao实例
            FruitDao fruitDao = new FruitDaoImpl();
            // 获取实例
            Fruit fruit = fruitDao.getFruitById(id);
            // 将fruit放在request请求域中
            req.setAttribute("fruit",fruit);
            // System.out.println("fruit = " + fruit);
            // 转发到编辑页面
            super.processTemplate("editFruit",req,resp);
        }
    }
}

```

**更新水果Servlet，updateFruit.java**

```java
package com.fruit.yuluo.servlet.fruitServlet;

import com.fruit.yuluo.dao.FruitDao;
import com.fruit.yuluo.dao.impl.FruitDaoImpl;
import com.fruit.yuluo.pojo.Fruit;
import com.fruit.yuluo.servlet.ViewBaseServlet;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.math.BigDecimal;

public class updateFruit extends ViewBaseServlet {
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 设置请求的编码，防止乱码
        req.setCharacterEncoding("utf-8");
        // 获取Post请求中，请求体中的数据
        String fname = req.getParameter("fname");
        String price = req.getParameter("price");
        // 转为大数
        BigDecimal bigPrice = new BigDecimal(price.trim());
        Integer count = Integer.parseInt(req.getParameter("count"));
        String remark = req.getParameter("remark");
        Integer id = Integer.parseInt(req.getParameter("id"));
        // 创建Dao对象
        FruitDao fruitDao = new FruitDaoImpl();
        // 创建水果对象
        Fruit fruit = new Fruit(id,fname,bigPrice,count,remark);
        // 更新数据库数据
        fruitDao.updateFruit(fruit);
        // 转发到 水果列表页面，
        // processTemplate("fruitList",req,resp);
        // 重定向 水果列表页面，重新再次获取请求
        resp.sendRedirect("fruitList");
    }
}

```

**编辑水果页面 edit.html**

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
  <meta charset="UTF-8">
  <title>编辑水果</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 30px;
    }
    form {
      max-width: 400px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 10px;
      background: #f9f9f9;
    }
    label {
      display: block;
      margin-top: 15px;
    }
    input, select, button {
      width: 100%;
      padding: 8px;
      margin-top: 5px;
      box-sizing: border-box;
    }
    button {
      background-color: #4CAF50;
      color: white;
      border: none;
      margin-top: 20px;
      cursor: pointer;
    }
    button:hover {
      background-color: #45a049;
    }
  </style>
</head>
<body>
<h2>编辑水果</h2>

<form th:action="@{/updateFruit}" method="post" th:object="${fruit}">
  <!-- 隐藏id -->
  <input type="hidden" name="id" th:value="*{id}">

  <label>水果名称：</label>
  <input type="text" name="fname" th:value="*{fname}" required>
  <br>

  <label>价格：</label>
  <input type="number" name="price" th:value="*{price}" step="0.01" required>
  <br>

  <label>库存数量：</label>
  <input type="number" name="count" th:value="*{count}" required>
  <br>

  <label>备注：</label>
  <input type="text" name="remark" th:value="*{remark}">
  <br>

  <button type="submit">保存修改</button>
  <button onclick="handleJumpList()" type="button">取消</button>
</form>
  <script>
    function handleJumpList(){
      // 方式1：直接跳转到某个页面
      window.location.href = '/fruit/fruitList'; // 改成你的列表页路径

      // 方式2：如果你使用的是后端路由，比如 Spring Boot 的 /fruit/list
      // window.location.href = '/fruit/list';
    }
  </script>
</body>
</html>

```

#### 删除水果

**删除水果Servlet**

```java
package com.fruit.yuluo.servlet.fruitServlet;

import com.fruit.yuluo.dao.FruitDao;
import com.fruit.yuluo.dao.impl.FruitDaoImpl;
import com.fruit.yuluo.servlet.ViewBaseServlet;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class delFruit extends ViewBaseServlet {
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 解析请求中的id
        Integer id = Integer.parseInt(req.getParameter("id"));
        // 创建fruitDao对象
        FruitDao fruitDao = new FruitDaoImpl();
        // 调用删除
        fruitDao.delFruit(id);
        // 重定向到首页
        resp.sendRedirect("fruitList");
    }
}

```

#### 配置Web

**web.xml文件**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
         version="4.0">
    <!-- 配置thymeleaf -->
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

    <!--配置first Servlet-->
    <servlet>
        <servlet-name>firstServlet</servlet-name>
        <servlet-class>com.fruit.yuluo.servlet.firstServlet.firstServlet</servlet-class>
    </servlet>
    <servlet-mapping>
        <servlet-name>firstServlet</servlet-name>
        <url-pattern>/firstReq</url-pattern>
    </servlet-mapping>
    
    <!--水果列表页面 servlet-->
    <servlet>
        <servlet-name>fruitList</servlet-name>
        <servlet-class>com.fruit.yuluo.servlet.fruitServlet.fruitServlet</servlet-class>
    </servlet>
    <servlet-mapping>
        <servlet-name>fruitList</servlet-name>
        <url-pattern>/fruitList</url-pattern>
    </servlet-mapping>

    <!--编辑水果页面 editFruit-->
    <servlet>
        <servlet-name>editFruit</servlet-name>
        <servlet-class>com.fruit.yuluo.servlet.fruitServlet.editFruit</servlet-class>
    </servlet>
    <servlet-mapping>
        <servlet-name>editFruit</servlet-name>
        <url-pattern>/editFruit</url-pattern>
    </servlet-mapping>
    
    <!-- 更新水果请求 -->
    <servlet>
        <servlet-name>updateFruit</servlet-name>
        <servlet-class>com.fruit.yuluo.servlet.fruitServlet.updateFruit</servlet-class>
    </servlet>
    <servlet-mapping>
        <servlet-name>updateFruit</servlet-name>
        <url-pattern>/updateFruit</url-pattern>
    </servlet-mapping>
    
    <!-- 删除水果请求 -->
    <servlet>
        <servlet-name>delFruit</servlet-name>
        <servlet-class>com.fruit.yuluo.servlet.fruitServlet.delFruit</servlet-class>
    </servlet>
    <servlet-mapping>
        <servlet-name>delFruit</servlet-name>
        <url-pattern>/delFruit</url-pattern>
    </servlet-mapping>

    <!-- 添加水果请求 -->
    <servlet>
        <servlet-name>addFruit</servlet-name>
        <servlet-class>com.fruit.yuluo.servlet.fruitServlet.addFruit</servlet-class>
    </servlet>
    <servlet-mapping>
        <servlet-name>addFruit</servlet-name>
        <url-pattern>/addFruit</url-pattern>
    </servlet-mapping>

    <!-- 添加水果页面 -->
    <servlet>
        <servlet-name>newFruit</servlet-name>
        <servlet-class>com.fruit.yuluo.servlet.fruitServlet.newFruit</servlet-class>
    </servlet>
    <servlet-mapping>
        <servlet-name>newFruit</servlet-name>
        <url-pattern>/newFruit</url-pattern>
    </servlet-mapping>

</web-app>
```

### 分页，检索功能

更新BaseDao代码，添加获取计数的方法

```java
package com.fruit.yuluo.dao;

import com.fruit.yuluo.utils.ClassUtil;
import com.fruit.yuluo.utils.DButil;

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

// 定义BaseDao为一个抽象类
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
        connection = DButil.getConnection();

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
            e.printStackTrace();
        } finally {
            // 关闭连接
            DButil.close(connection,pstm,rs);
        }
        return 0;
    }

    // 查询列表的方法
    protected List<T> executeQuery(String sql,Object ...params){
        List<T> list = new ArrayList<>();
        connection = DButil.getConnection();
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
        }finally {
            DButil.close(connection,pstm,rs);
        }
        return list;
    }

    // 查询单个方法
    protected T load(String sql,Object ...params){
        // 获取连接
        connection = DButil.getConnection();
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
            DButil.close(connection,pstm,rs);
        }
        return null;
    }
    // 查询复杂SQL的方法，此方法的返回值为List集合，List集合中存放的是Object类型的数组
    protected List<Object[]> executeMathQuery(String sql, Object ...params){
        List<Object[]> list = new ArrayList<>();
        connection = DButil.getConnection();
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
        }finally {
            DButil.close(connection,pstm,rs);
        }
        return list;
    }
}

```

重写获取水果接口

com.fruit.yuluo.dao.FruitDao

```java
package com.fruit.yuluo.dao;
import com.fruit.yuluo.pojo.Fruit;

import java.util.List;

public interface FruitDao {
    // 获取所有的库存记录
    @Deprecated
    List<Fruit> getFruitList();
    
    // 分页，检索，每页大小
    List<Fruit> getFruitList(String keyword,Integer pageNo,Integer pageSize);
    
    // 获取库存中的数量
    Integer getTotalCount(String keyword);

    // 添加新库存
    void addFruit(Fruit fruit);

    // 删除指定的库存记录
    void delFruit(Integer id);

    // 获取指定的库存记录
    Fruit getFruitById(Integer id);
    Fruit getFruit(String name);

    // 修改库存记录
    void updateFruit(Fruit fruit);
}
```

在实现类中实现，写SQL

com.fruit.yuluo.dao.impl.FruitDaoImpl

```java
package com.fruit.yuluo.dao.impl;

import com.fruit.yuluo.dao.BaseDao;
import com.fruit.yuluo.dao.FruitDao;
import com.fruit.yuluo.pojo.Fruit;

import java.util.List;

public class FruitDaoImpl extends BaseDao<Fruit> implements FruitDao {
    @Override
    public List<Fruit> getFruitList() {
        String sql = "select * from goods";
        List<Fruit> fruits = this.executeQuery(sql, null);
        return fruits;
    }

    @Override
    public List<Fruit> getFruitList(String keyword, Integer pageNo, Integer pageSize) {
        String sql = "select * from goods where fname like ? or remark like ? limit ? ,?";
        List<Fruit> fruits = this.executeQuery(sql,"%"+keyword+"%","%"+keyword+"%",pageNo,pageSize);
        return fruits;
    }

    @Override
    public Integer getTotalCount(String keyword) {
        String sql = "select count(*) from goods where fname like ? or remark like ?";
        List<Object[]> list = this.executeMathQuery(sql,"%"+keyword+"%","%"+keyword+"%");
        // 获取第一列的数值，强转为Long类型，再转为Int类型
        // 涉及到 涉及到 JDBC 的返回值类型。
        // 如果数据库驱动认为该列可能会超出 int 范围（比如 COUNT(*)），也会返回 Long
        // 如果数据库字段类型是 BIGINT（MySQL 的大整数类型），ResultSet.getObject() 会返回 Long 对象。
        // 如果数据库字段类型是 INT，一般返回 Integer
        Long count = (Long) list.get(0)[0];
        int countInt = count.intValue();
        return countInt;
    }

    @Override
    public void addFruit(Fruit fruit) {
        String sql = "insert into goods values(0,?,?,?,?)";
        int resRow = this.executeUpdate(sql, fruit.getFname(), fruit.getPrice(), fruit.getCount(), fruit.getRemark());
    }

    @Override
    public void delFruit(Integer id) {
        String sql = "delete from goods where id = ?";
        int resRow = this.executeUpdate(sql, id);
    }

    @Override
    public Fruit getFruitById(Integer id) {
        String sql = "select * from goods where id = ?";
        Fruit fruit = load(sql, id);
        return fruit;
    }

    @Override
    public Fruit getFruit(String name) {
        return null;
    }

    @Override
    public void updateFruit(Fruit fruit) {
        String sql = "update goods set fname=?,price=?,count=?,remark=? where id=?";
        executeUpdate(sql,fruit.getFname(),fruit.getPrice(),fruit.getCount(),fruit.getRemark(),fruit.getId());
    }
}
```

**字符串工具类** 来统一判断字符串是否为 `null` 或者为空字符串

StringUtils

```java
public class StringUtils {

    /**
     * 判断字符串是否为null或空字符串
     *
     * @param str 待检查字符串
     * @return true 表示为空或null，false 表示非空
     */
    public static boolean isEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }

    /**
     * 判断字符串是否非空
     *
     * @param str 待检查字符串
     * @return true 表示非空，false 表示空或null
     */
    public static boolean isNotEmpty(String str) {
        return !isEmpty(str);
    }
}

```

在水果列表Servlet中获取 前端传来的参数

```java
package com.fruit.yuluo.servlet.fruitServlet;

import com.fruit.yuluo.dao.FruitDao;
import com.fruit.yuluo.dao.impl.FruitDaoImpl;
import com.fruit.yuluo.pojo.Fruit;
import com.fruit.yuluo.servlet.ViewBaseServlet;
import com.fruit.yuluo.utils.StringUtils;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.List;

public class fruitServlet extends ViewBaseServlet {
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 设置编码
        req.setCharacterEncoding("UTF-8");

        // 定义关键字
        String keyword = "";
        // 定义前端的操作标记
        String operate = req.getParameter("operate");
        // 定义前端页码和每页大小
        Integer pageNo = 1;
        Integer pageSize = 5;
        Integer pageCount = 0;
        // 创建dao实例
        FruitDao fruitDao = new FruitDaoImpl();
        // 获取session对象
        HttpSession session = req.getSession();
        // 搜索操作
        if ("search".equals(operate)){
            // 获取请求参数中关键字
            String keywordStr = req.getParameter("keyword");
            if (StringUtils.isNotEmpty(keywordStr)){
                keyword = keywordStr;
            }
            // 把关键字存储到session中,再会话中始终存在
            session.setAttribute("keyword",keyword);
        }else{ // 下一页操作
            Object keywordObj = session.getAttribute("keyword");
            // 如果不为空
            if (keywordObj != null){
                // 强转为String类型，并复制给keyword
                keyword = (String) keywordObj;
            }
        }
        // 获取前端传来的页码
        String pageNoStr = req.getParameter("pageNo");
        String pageSizeStr = req.getParameter("pageSize");
        // 判断pageNoStr和pageSizeStr 不能为空且不能为null
        if (StringUtils.isNotEmpty(pageNoStr)){
            pageNo = Integer.parseInt(pageNoStr);
        }
        if (StringUtils.isNotEmpty(pageSizeStr)){
            pageSize = Integer.parseInt(pageSizeStr);
        }
        // 查询数据库
        List<Fruit> fruitList = fruitDao.getFruitList(keyword, pageNo, pageSize);
        Integer totalCount = fruitDao.getTotalCount(keyword);
        // 计算总页数
        pageCount = (totalCount + pageSize -1 ) / pageSize;
        // 判断pageNo和pageSize合法范围
        if (pageNo <=0){
            pageNo = 1;
        }
        if (pageNo >= pageCount){
            pageNo = pageCount;
        }
        // 不必放 session，避免并发和数据混乱
        req.setAttribute("fruitList",fruitList);
        req.setAttribute("pageCount",pageCount);
        req.setAttribute("totalCount",totalCount);
        //将pageNo保存到session作用域
        req.setAttribute("pageNo",pageNo);
        req.setAttribute("pageSize",pageSize);
        // 使用thymeleaf渲染
        super.processTemplate("fruitList",req,resp);

    }
}

```

水果列表静态页面

```html
<!DOCTYPE html>
<!--添加这行可以在编辑器中提示语法-->
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>水果库存管理系统</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</head>
<body class="bg-light">
    <!-- 页面标题 -->
    <h2 class="text-center mb-2">水果列表</h2>
    <!-- 水果列表 -->
    <!-- 水果列表表格 -->
    <div class="container py-4 d-flex justify-content-center">
        <div class="card shadow-sm" style="width: 60%; background-color: #f5f7fa;">
            <!-- 顶部操作栏 -->
            <div class="d-flex justify-content-end h-5">
                <!-- 搜索框 -->
                <form th:action="@{/fruitList}" method="post" class="d-flex">
                    <input type="hidden" name="operate" value="search"/>
                    <input class="form-control form-control-sm"
                           type="text"
                           name="keyword"
                           placeholder="输入名称搜索"
                           th:value="${session.keyword}">
                    <button class="btn btn-outline-success btn-sm" type="submit">搜索</button>
                </form>
                <!-- 添加按钮 -->
                <a th:href="@{/newFruit}" class="d-block btn btn-outline-success btn-sm d-flex flex-column">
                    添加
                </a>
            </div>
            <!-- 水果列表表格 -->
            <div class="card-header bg-success text-white">水果清单</div>
            <div class="card-body p-0">
                <table class="table table-striped table-hover align-middle mb-0">
                    <thead class="table-dark">
                    <tr>
                        <th>编号</th>
                        <th>名称</th>
                        <th>价格</th>
                        <th>库存</th>
                        <th>操作</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr th:if="${not #lists.isEmpty(fruitList)}" th:each="fruit : ${fruitList}">
                        <td th:text="${fruit.id}"></td>
                        <td >
                            <a style="text-decoration: none" th:href="@{editFruit(id=${fruit.id})}" th:text="${fruit.fname}"></a>
                        </td>
                        <td th:text="${fruit.price}"></td>
                        <td th:text="${fruit.count}"></td>
                        <td>
                            <!-- 删除按钮 -->
                            <a th:href="@{/delFruit(id=${fruit.id})}"
                               class="btn btn-danger btn-sm"
                               onclick="return confirm('确定要删除这个水果吗？');">删除</a>
                        </td>
                    </tr>
                    <!--空数据展示-->
                    <tr th:unless="${not #lists.isEmpty(fruitList)}">
                        <td colspan="5">对不起，库存为空！</td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <!-- 分页信息 -->
            <div class="card-footer d-flex justify-content-between align-items-center">
                <!-- 左侧显示总数 -->
                <div>
                    共 <span th:text="${totalCount}">0</span> 条记录，
                    每页 <span th:text="${pageSize}">5</span> 条，
                    共 <span th:text="${pageCount}">1</span> 页
                </div>

                <!-- 右侧分页按钮 -->
                <div>
                    <!-- 首页 -->
                    <a th:href="@{/fruitList(pageNo=1)}"
                       class="btn btn-outline-primary btn-sm"
                       th:classappend="${pageNo == 1} ? ' disabled'">
                        首页
                    </a>
                    <a class="btn btn-outline-secondary btn-sm me-1"
                       th:if="${pageNo > 1}"
                       th:href="@{/fruitList(pageNo=${pageNo - 1})}">
                        上一页
                    </a>
                    <span class="btn btn-success btn-sm disabled">
                        第 <span th:text="${pageNo}">1</span> 页
                    </span>
                    <a class="btn btn-outline-secondary btn-sm ms-1"
                       th:if="${pageNo < pageCount}"
                       th:href="@{/fruitList(pageNo=${pageNo + 1})}">
                        下一页
                    </a>
                    <!-- 尾页 -->
                    <a th:href="@{/fruitList(pageNo=${pageCount})}"
                       class="btn btn-outline-primary btn-sm"
                       th:classappend="${pageNo == pageCount} ? ' disabled'">
                        尾页
                    </a>
                </div>
            </div>
        </div>
    </div>
</body>
<script>

</script>
</html>
```

### 使用servlet注解

使用注解 @WebServlet 配置Servlet。修改每一个Servlet，同时删除web.xml中的配置。

```java
@WebServlet("/addFruit")
public class addFruit extends ViewBaseServlet {
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        ...
    }
}
```

删除web.xml中的配置

```xml
<!-- 这一段可以注释不写 添加水果请求 -->
<servlet>
    <servlet-name>addFruit</servlet-name>
    <servlet-class>com.fruit.yuluo.servlet.fruitServlet.addFruit</servlet-class>
</servlet>
<servlet-mapping>
    <servlet-name>addFruit</servlet-name>
    <url-pattern>/addFruit</url-pattern>
</servlet-mapping>
<!--只保留这一个前后缀即可-->
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

使用thymeleaf语法中的@{}语法，写一个pageServlet，用于thymeleaf渲染，跳转页面。

com.fruit.yuluo.servlet.PageServlet

```java
package com.fruit.yuluo.servlet;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/page")
public class PageServlet extends ViewBaseServlet{
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 获取请求page参数
        String page = req.getParameter("page");
        // 转发页面
        processTemplate(page,req,resp);
    }
}
```

更改所有的路径 页面跳转路径 使用@{} 语法，使用绝对路径。

```html
<!DOCTYPE html>
<!--添加这行可以在编辑器中提示语法-->
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>水果库存管理系统</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</head>
<body class="bg-light">
    <!-- 页面标题 -->
    <h2 class="text-center mb-2">水果列表</h2>
    <!-- 水果列表 -->
    <!-- 水果列表表格 -->
    <div class="container py-4 d-flex justify-content-center">
        <div class="card shadow-sm" style="width: 60%; background-color: #f5f7fa;">
            <!-- 顶部操作栏 -->
            <div class="d-flex justify-content-end h-5">
                <!-- 搜索框 -->
                <form th:action="@{/fruitList}" method="post" class="d-flex">
                    <input type="hidden" name="operate" value="search"/>
                    <input class="form-control form-control-sm"
                           type="text"
                           name="keyword"
                           placeholder="输入名称搜索"
                           th:value="${session.keyword}">
                    <button class="btn btn-outline-success btn-sm" type="submit">搜索</button>
                </form>
                <!-- 添加按钮 -->
                <a th:href="@{/page(page='newFruit')}" class="d-block btn btn-outline-success btn-sm d-flex flex-column">
                    添加
                </a>
            </div>
            <!-- 水果列表表格 -->
            <div class="card-header bg-success text-white">水果清单</div>
            <div class="card-body p-0">
                <table class="table table-striped table-hover align-middle mb-0">
                    <thead class="table-dark">
                    <tr>
                        <th>编号</th>
                        <th>名称</th>
                        <th>价格</th>
                        <th>库存</th>
                        <th>操作</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr th:if="${not #lists.isEmpty(fruitList)}" th:each="fruit : ${fruitList}">
                        <td th:text="${fruit.id}"></td>
                        <td >
                            <a style="text-decoration: none" th:href="@{/editFruit(id=${fruit.id})}" th:text="${fruit.fname}"></a>
                        </td>
                        <td th:text="${fruit.price}"></td>
                        <td th:text="${fruit.count}"></td>
                        <td>
                            <!-- 删除按钮 -->
                            <a th:href="@{/delFruit(id=${fruit.id})}"
                               class="btn btn-danger btn-sm"
                               onclick="return confirm('确定要删除这个水果吗？');">删除</a>
                        </td>
                    </tr>
                    <!--空数据展示-->
                    <tr th:unless="${not #lists.isEmpty(fruitList)}">
                        <td colspan="5">对不起，库存为空！</td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <!-- 分页信息 -->
            <div class="card-footer d-flex justify-content-between align-items-center">
                <!-- 左侧显示总数 -->
                <div>
                    共 <span th:text="${totalCount}">0</span> 条记录，
                    每页 <span th:text="${pageSize}">5</span> 条，
                    共 <span th:text="${pageCount}">1</span> 页
                </div>

                <!-- 右侧分页按钮 -->
                <div>
                    <!-- 首页 -->
                    <a th:href="@{/fruitList(pageNo=1)}"
                       class="btn btn-outline-primary btn-sm"
                       th:classappend="${pageNo == 1} ? ' disabled'">
                        首页
                    </a>
                    <a class="btn btn-outline-secondary btn-sm me-1"
                       th:if="${pageNo > 1}"
                       th:href="@{/fruitList(pageNo=${pageNo - 1})}">
                        上一页
                    </a>
                    <span class="btn btn-success btn-sm disabled">
                        第 <span th:text="${pageNo}">1</span> 页
                    </span>
                    <a class="btn btn-outline-secondary btn-sm ms-1"
                       th:if="${pageNo < pageCount}"
                       th:href="@{/fruitList(pageNo=${pageNo + 1})}">
                        下一页
                    </a>
                    <!-- 尾页 -->
                    <a th:href="@{/fruitList(pageNo=${pageCount})}"
                       class="btn btn-outline-primary btn-sm"
                       th:classappend="${pageNo == pageCount} ? ' disabled'">
                        尾页
                    </a>
                </div>
            </div>
        </div>
    </div>
</body>
<script>

</script>
</html>
```

### Servlet优化

将增删改查的Servlet，合并为一个Servlet。

在增删改查的页面上，在发送请求时，添加一个oper参数，用来标识操作。

页面跳转使用 pageServlet进行跳转，请求默认执行完跳转到 fruit.do 的list方法中（原列表Servlet）。

如果是请求转发到 REQ_DO，页面转发到 模版页面 名称。

```java
package com.fruit.yuluo.servlet.fruitServlet;

import com.fruit.yuluo.dao.FruitDao;
import com.fruit.yuluo.dao.impl.FruitDaoImpl;
import com.fruit.yuluo.pojo.Fruit;
import com.fruit.yuluo.servlet.ViewBaseServlet;
import com.fruit.yuluo.utils.StringUtils;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.util.List;

@WebServlet("/fruit.do")
public class fruitServlet extends ViewBaseServlet {
    // 定义一个静态常量
    private static final String REQ_DO = "fruit.do";

    // 请求进来的所有入口
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 设置编码
        req.setCharacterEncoding("UTF-8");
        // 从请求参数中获取一个叫oper的值。这个值和将来要执行的方法名对应
        // 如果oper=list , 那么我们就调用list方法
        // 如果oper=update , 那么我们就调用update方法
        String oper = req.getParameter("oper");
        // 空判断
        if(StringUtils.isEmpty(oper)){
            oper = "list" ;
        }
        // 方法调用
        // 方式1：使用switch case 多了不方便
        // switch(oper){
        //     case "list":
        //         list(req, resp);
        //         break;
        //     ...
        //     default:
        //         throw new RuntimeException("没有找到"+oper+"对应的方法！");
        // }

        // 方式2：使用反射方式

        try {
            // 获取此类实例的方法
            Method method = this.getClass().getDeclaredMethod(oper, HttpServletRequest.class, HttpServletResponse.class);
            // 执行方法
            method.invoke(this,req,resp);
        } catch (Exception e) {
            e.printStackTrace();
        }

    }
    // list方法
    protected void list(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        // 定义关键字
        String keyword = "";
        // 定义前端的操作标记
        String operate = req.getParameter("operate");
        // 定义前端页码和每页大小
        Integer pageNo = 1;
        Integer pageSize = 5;
        Integer pageCount = 0;
        // 创建dao实例
        FruitDao fruitDao = new FruitDaoImpl();
        // 获取session对象
        HttpSession session = req.getSession();
        // 搜索操作
        if ("search".equals(operate)){
            // 获取请求参数中关键字
            String keywordStr = req.getParameter("keyword");
            if (StringUtils.isNotEmpty(keywordStr)){
                keyword = keywordStr;
            }
            // 把关键字存储到session中,再会话中始终存在
            session.setAttribute("keyword",keyword);
        }else{ // 下一页操作
            Object keywordObj = session.getAttribute("keyword");
            // 如果不为空
            if (keywordObj != null){
                // 强转为String类型，并复制给keyword
                keyword = (String) keywordObj;
            }
        }
        // 获取前端传来的页码
        String pageNoStr = req.getParameter("pageNo");
        String pageSizeStr = req.getParameter("pageSize");
        // 判断pageNoStr和pageSizeStr 不能为空且不能为null
        if (StringUtils.isNotEmpty(pageNoStr)){
            pageNo = Integer.parseInt(pageNoStr);
        }
        if (StringUtils.isNotEmpty(pageSizeStr)){
            pageSize = Integer.parseInt(pageSizeStr);
        }
        // 查询数据库
        List<Fruit> fruitList = fruitDao.getFruitList(keyword, pageNo, pageSize);
        Integer totalCount = fruitDao.getTotalCount(keyword);
        // 计算总页数
        pageCount = (totalCount + pageSize -1 ) / pageSize;
        // 判断pageNo和pageSize合法范围
        if (pageNo <=0){
            pageNo = 1;
        }
        if (pageNo >= pageCount){
            pageNo = pageCount;
        }
        // 不必放 session，避免并发和数据混乱
        req.setAttribute("fruitList",fruitList);
        req.setAttribute("pageCount",pageCount);
        req.setAttribute("totalCount",totalCount);
        //将pageNo保存到session作用域
        req.setAttribute("pageNo",pageNo);
        req.setAttribute("pageSize",pageSize);
        // 使用thymeleaf渲染,渲染fruitList页面,在ViewBaseServlet初始化时配置了，读取web.xml中的配置
        super.processTemplate("fruitList",req,resp);
    }

    // add 方法
    protected void add(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 获取参数
        String fname = req.getParameter("fname");
        String price = req.getParameter("price");
        // 转为大数
        BigDecimal bigPrice = new BigDecimal(price.trim());
        Integer fcount = Integer.parseInt(req.getParameter("count"));
        String remark = req.getParameter("remark");
        // 调用dao方法
        Fruit fruit = new Fruit(fname,bigPrice,fcount,remark);
        FruitDao fruitDao = new FruitDaoImpl();
        fruitDao.addFruit(fruit);
        // 重定向到列表请求
        resp.sendRedirect(REQ_DO);
    }

    // edit 方法
    protected void edit(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 接收请求传来的参数
        String idStr = req.getParameter("id");
        // 判断条件,不能为空且不能不传
        if(idStr !=null && !"".equals(idStr)){
            // 转为包装类,同时强转为Integer类
            Integer id = Integer.parseInt(idStr);
            // 创建dao实例
            FruitDao fruitDao = new FruitDaoImpl();
            // 获取实例
            Fruit fruit = fruitDao.getFruitById(id);
            // 将fruit放在request请求域中
            req.setAttribute("fruit",fruit);
            // System.out.println("fruit = " + fruit);
            // 转发到编辑页面
            super.processTemplate("editFruit",req,resp);
        }
    }

    // update 方法
    protected void update(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 获取Post请求中，请求体中的数据
        String fname = req.getParameter("fname");
        String price = req.getParameter("price");
        // 转为大数
        BigDecimal bigPrice = new BigDecimal(price.trim());
        Integer count = Integer.parseInt(req.getParameter("count"));
        String remark = req.getParameter("remark");
        Integer id = Integer.parseInt(req.getParameter("id"));
        // 创建Dao对象
        FruitDao fruitDao = new FruitDaoImpl();
        // 创建水果对象
        Fruit fruit = new Fruit(id,fname,bigPrice,count,remark);
        // 更新数据库数据
        fruitDao.updateFruit(fruit);
        // 转发到 水果列表页面，
        // processTemplate("fruitList",req,resp);
        // 重定向 列表请求
        resp.sendRedirect(REQ_DO);
    }

    // del 方法
    protected void del(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 解析请求中的id
        Integer id = Integer.parseInt(req.getParameter("id"));
        // 创建fruitDao对象
        FruitDao fruitDao = new FruitDaoImpl();
        // 调用删除
        fruitDao.delFruit(id);
        // 重定向 到列表请求
        resp.sendRedirect(REQ_DO);
    }
}

```

修改前端模版页面

web/WEB_INF/pages/fruitList.html

```html
<!DOCTYPE html>
<!--添加这行可以在编辑器中提示语法-->
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>水果库存管理系统</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</head>
<body class="bg-light">
    <!-- 页面标题 -->
    <h2 class="text-center mb-2">水果列表</h2>
    <!-- 水果列表 -->
    <!-- 水果列表表格 -->
    <div class="container py-4 d-flex justify-content-center">
        <div class="card shadow-sm" style="width: 60%; background-color: #f5f7fa;">
            <!-- 顶部操作栏 -->
            <div class="d-flex justify-content-end h-5">
                <!-- 搜索框 -->
                <!-- 默认oper是list，调用list中的方法 -->
                <form th:action="@{/fruit.do}" method="post" class="d-flex">
                    <input type="hidden" name="operate" value="search"/>
                    <input class="form-control form-control-sm"
                           type="text"
                           name="keyword"
                           placeholder="输入名称搜索"
                           th:value="${session.keyword}">
                    <button class="btn btn-outline-success btn-sm" type="submit">搜索</button>
                </form>
                <!-- 添加按钮-使用pageServlet转发页面 -->
                <a th:href="@{/page(page='newFruit')}" class="d-block btn btn-outline-success btn-sm d-flex flex-column">
                    添加
                </a>
            </div>
            <!-- 水果列表表格 -->
            <div class="card-header bg-success text-white">水果清单</div>
            <div class="card-body p-0">
                <table class="table table-striped table-hover align-middle mb-0">
                    <thead class="table-dark">
                    <tr>
                        <th>编号</th>
                        <th>名称</th>
                        <th>价格</th>
                        <th>库存</th>
                        <th>操作</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr th:if="${not #lists.isEmpty(fruitList)}" th:each="fruit : ${fruitList}">
                        <td th:text="${fruit.id}"></td>
                        <td >
                            <a style="text-decoration: none" th:href="@{/fruit.do(id=${fruit.id},oper='edit')}" th:text="${fruit.fname}"></a>
                        </td>
                        <td th:text="${fruit.price}"></td>
                        <td th:text="${fruit.count}"></td>
                        <td>
                            <!-- 删除按钮 -->
                            <a th:href="@{/fruit.do(id=${fruit.id},oper='del')}"
                               class="btn btn-danger btn-sm"
                               onclick="return confirm('确定要删除这个水果吗？');">删除</a>
                        </td>
                    </tr>
                    <!--空数据展示-->
                    <tr th:unless="${not #lists.isEmpty(fruitList)}">
                        <td colspan="5">对不起，库存为空！</td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <!-- 分页信息 -->
            <div class="card-footer d-flex justify-content-between align-items-center">
                <!-- 左侧显示总数 -->
                <div>
                    共 <span th:text="${totalCount}">0</span> 条记录，
                    每页 <span th:text="${pageSize}">5</span> 条，
                    共 <span th:text="${pageCount}">1</span> 页
                </div>

                <!-- 右侧分页按钮 -->
                <div>
                    <!-- 首页 -->
                    <a th:href="@{/fruit.do(pageNo=1,oper='list')}"
                       class="btn btn-outline-primary btn-sm"
                       th:classappend="${pageNo == 1} ? ' disabled'">
                        首页
                    </a>
                    <a class="btn btn-outline-secondary btn-sm me-1"
                       th:if="${pageNo > 1}"
                       th:href="@{/fruit.do(pageNo=${pageNo - 1},oper='list')}">
                        上一页
                    </a>
                    <span class="btn btn-success btn-sm disabled">
                        第 <span th:text="${pageNo}">1</span> 页
                    </span>
                    <a class="btn btn-outline-secondary btn-sm ms-1"
                       th:if="${pageNo < pageCount}"
                       th:href="@{/fruit.do(pageNo=${pageNo + 1})}">
                        下一页
                    </a>
                    <!-- 尾页 -->
                    <a th:href="@{/fruit.do(pageNo=${pageCount})}"
                       class="btn btn-outline-primary btn-sm"
                       th:classappend="${pageNo == pageCount} ? ' disabled'">
                        尾页
                    </a>
                </div>
            </div>
        </div>
    </div>
</body>
<script>

</script>
</html>
```

web/WEB_INF/pages/newFruit.html

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
  <meta charset="UTF-8">
  <title>添加水果</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 30px;
    }
    form {
      max-width: 400px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 10px;
      background: #f9f9f9;
    }
    label {
      display: block;
      margin-top: 15px;
    }
    input, select, button {
      width: 100%;
      padding: 8px;
      margin-top: 5px;
      box-sizing: border-box;
    }
    button {
      background-color: #4CAF50;
      color: white;
      border: none;
      margin-top: 20px;
      cursor: pointer;
    }
    button:hover {
      background-color: #45a049;
    }
  </style>
</head>
<body class="bg-light">
  <div class="container py-5">
    <div class="card-body">
      <h2 class="text-center mb-4">添加水果</h2>
      <form th:action="@{/fruit.do(oper='add')}" method="post">
        <!-- 水果名称 -->
        <div class="mb-3">
          <label class="form-label">水果名称：</label>
          <input type="text" class="form-control" name="fname">
        </div>
        <!-- 价格 -->
        <div class="mb-3">
          <label class="form-label">价格：</label>
          <input type="number" class="form-control" name="price" step="0.01">
        </div>
        <!-- 库存数量 -->
        <div class="mb-3">
          <label class="form-label">库存数量：</label>
          <input type="number" class="form-control" name="count">
        </div>
        <!-- 备注 -->
        <div class="mb-3">
          <label class="form-label">备注：</label>
          <input type="text" class="form-control" name="remark">
        </div>
        <!-- 操作按钮 -->
        <div class="d-flex justify-content-between">
          <button type="submit" class="btn btn-success">保存</button>
          <button onclick="handleJumpList()" type="button">取消</button>
        </div>
      </form>
    </div>
  </div>
<script>
  const handleJumpList = () => {
    // 方式2：如果你使用的是后端路由，比如 Spring Boot 的 /fruit/list
    window.location.href = '/fruit/fruit.do';
  }
</script>
</body>
</html>
```

web/WEB_INF/pages/editFruit.html

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
  <meta charset="UTF-8">
  <title>编辑水果</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 30px;
    }
    form {
      max-width: 400px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 10px;
      background: #f9f9f9;
    }
    label {
      display: block;
      margin-top: 15px;
    }
    input, select, button {
      width: 100%;
      padding: 8px;
      margin-top: 5px;
      box-sizing: border-box;
    }
    button {
      background-color: #4CAF50;
      color: white;
      border: none;
      margin-top: 20px;
      cursor: pointer;
    }
    button:hover {
      background-color: #45a049;
    }
  </style>
</head>
<body>
<h2>编辑水果</h2>

<form th:action="@{/fruit.do(oper='update')}" method="post" th:object="${fruit}">
  <!-- 隐藏id -->
  <input type="hidden" name="id" th:value="*{id}">

  <label>水果名称：</label>
  <input type="text" name="fname" th:value="*{fname}" required>
  <br>

  <label>价格：</label>
  <input type="number" name="price" th:value="*{price}" step="0.01" required>
  <br>

  <label>库存数量：</label>
  <input type="number" name="count" th:value="*{count}" required>
  <br>

  <label>备注：</label>
  <input type="text" name="remark" th:value="*{remark}">
  <br>

  <button type="submit">保存修改</button>
  <button onclick="handleJumpList()" type="button">取消</button>
</form>
  <script>
    function handleJumpList(){
      // 方式1：直接跳转到某个页面
      window.location.href = '/fruit/fruit.do'; // 改成你的列表页路径

      // 方式2：如果你使用的是后端路由，比如 Spring Boot 的 /fruit/list
      // window.location.href = '/fruit/list';
    }
  </script>
</body>
</html>

```

ViewBaseServlet.java

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
        // 初始化 Thymeleaf 模板解析器，这里用于解析Web.xml配置文件
        ServletContextTemplateResolver resolver =
                new ServletContextTemplateResolver(this.getServletContext());
        // 设置前缀和后缀
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

web.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
         version="4.0">
    <!-- 配置thymeleaf -->
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
</web-app>
```

整体代码 ✅ 思路正确，已经实现了一个标准的 **前后端 MVC 模式**：

- `pageServlet` → 负责页面跳转
- `fruitServlet` → 负责 CRUD 请求
- `ViewBaseServlet` → 封装 Thymeleaf 渲染

只需要注意 **路径统一**、**取消按钮写法** 和 **异常处理**，其他地方已经很完善了。

### 添加Service层

新增FruitService.java 接口 com.fruit.yuluo.service.FruitService

```java
package com.fruit.yuluo.service;

import com.fruit.yuluo.pojo.Fruit;

import java.util.List;

public interface FruitService {

    // 根据查询关键字检索指定页的数据
    List<Fruit> getFruitList(String keyword,Integer pageNo,Integer pageSize);

    // 查询总数
    Integer getTotalNum(String keyword);

    // 查询总页数
    Integer getTotalPageNum(String keyword,Integer pageSize);

    // 添加新库存
    void addFruit(Fruit fruit);

    // 修改库存
    void updateFruit(Fruit fruit);

    // 删除指定库存
    void delFruit(Integer id);

    // 查询指定库存
    Fruit getFruitById(Integer id);
}

```

新增FruitServiceImpl实现类 com.fruit.yuluo.service.impl.FruitServiceImpl

```java
package com.fruit.yuluo.service.impl;

import com.fruit.yuluo.dao.FruitDao;
import com.fruit.yuluo.dao.impl.FruitDaoImpl;
import com.fruit.yuluo.pojo.Fruit;
import com.fruit.yuluo.service.FruitService;

import java.util.List;

public class FruitServiceImpl implements FruitService {
    // 创建FruitDao对象
    FruitDao fruitDao = new FruitDaoImpl();

    @Override
    public List<Fruit> getFruitList(String keyword, Integer pageNo, Integer pageSize) {
        return fruitDao.getFruitList(keyword,pageNo,pageSize);
    }

    @Override
    public Integer getTotalNum(String keyword) {
        return fruitDao.getTotalNum(keyword);
    }

    @Override
    public Integer getTotalPageNum(String keyword, Integer pageSize) {
        int totalNum = fruitDao.getTotalNum(keyword).intValue();
        int totalPageNum = (totalNum + pageSize - 1) / pageSize;
        return totalPageNum;
    }

    @Override
    public void addFruit(Fruit fruit) {
        fruitDao.addFruit(fruit);
    }

    @Override
    public void updateFruit(Fruit fruit) {

    }

    @Override
    public void delFruit(Integer id) {

    }

    @Override
    public Fruit getFruitById(Integer id) {
        return null;
    }
}

```

修改fruitServlet.java 代码，让Servlet类操作Service层，不直接操作DAO层

com.fruit.yuluo.servlet.fruitServlet.fruitServlet

```java
package com.fruit.yuluo.servlet.fruitServlet;

import com.fruit.yuluo.dao.FruitDao;
import com.fruit.yuluo.dao.impl.FruitDaoImpl;
import com.fruit.yuluo.pojo.Fruit;
import com.fruit.yuluo.service.FruitService;
import com.fruit.yuluo.service.impl.FruitServiceImpl;
import com.fruit.yuluo.servlet.ViewBaseServlet;
import com.fruit.yuluo.utils.StringUtils;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.util.List;

@WebServlet("/fruit.do")
public class fruitServlet extends ViewBaseServlet {
    // 定义一个静态常量
    private static final String REQ_DO = "fruit.do";
    // 新增一个Service类
    private FruitService fruitService = new FruitServiceImpl();
    // 请求进来的所有入口
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 设置编码
        req.setCharacterEncoding("UTF-8");
        // 从请求参数中获取一个叫oper的值。这个值和将来要执行的方法名对应
        // 如果oper=list , 那么我们就调用list方法
        // 如果oper=update , 那么我们就调用update方法
        String oper = req.getParameter("oper");
        // 空判断
        if(StringUtils.isEmpty(oper)){
            oper = "list" ;
        }
        // 方法调用
        // 方式1：使用switch case 多了不方便
        // switch(oper){
        //     case "list":
        //         list(req, resp);
        //         break;
        //     ...
        //     default:
        //         throw new RuntimeException("没有找到"+oper+"对应的方法！");
        // }

        // 方式2：使用反射方式

        try {
            // 获取此类实例的方法
            Method method = this.getClass().getDeclaredMethod(oper, HttpServletRequest.class, HttpServletResponse.class);
            // 执行方法
            method.invoke(this,req,resp);
        } catch (Exception e) {
            e.printStackTrace();
        }

    }
    // list方法
    protected void list(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 获取session对象
        HttpSession session = req.getSession();
        // 定义关键字
        String keyword = "";
        // 定义前端的操作标记
        String operate = req.getParameter("operate");
        // 定义前端页码和每页大小
        Integer pageNo = 1;
        Integer pageSize = 5;
        Integer pageCount = 0;
        // 删除Dao实现类

        // 搜索操作
        if ("search".equals(operate)){
            // 获取请求参数中关键字
            String keywordStr = req.getParameter("keyword");
            if (StringUtils.isNotEmpty(keywordStr)){
                keyword = keywordStr;
            }
            // 把关键字存储到session中,再会话中始终存在
            session.setAttribute("keyword",keyword);
        }else{ // 下一页操作
            Object keywordObj = session.getAttribute("keyword");
            // 如果不为空
            if (keywordObj != null){
                // 强转为String类型，并复制给keyword
                keyword = (String) keywordObj;
            }
        }
        // 获取前端传来的页码
        String pageNoStr = req.getParameter("pageNo");
        String pageSizeStr = req.getParameter("pageSize");
        // 判断pageNoStr和pageSizeStr 不能为空且不能为null
        if (StringUtils.isNotEmpty(pageNoStr)){
            pageNo = Integer.parseInt(pageNoStr);
        }
        if (StringUtils.isNotEmpty(pageSizeStr)){
            pageSize = Integer.parseInt(pageSizeStr);
        }
        // 查询数据库，使用service层实现
        List<Fruit> fruitList = fruitService.getFruitList(keyword, pageNo, pageSize);
        Integer totalNum = fruitService.getTotalNum(keyword);
        Integer totalPageNum = fruitService.getTotalPageNum(keyword, pageSize);

        // 判断pageNo和pageSize合法范围
        if (pageNo <=0){
            pageNo = 1;
        }
        if (pageNo >= totalPageNum){
            pageNo = totalPageNum;
        }

        // 不必放 session，避免并发和数据混乱
        req.setAttribute("fruitList",fruitList);
        req.setAttribute("pageCount",totalNum);
        req.setAttribute("totalCount",totalPageNum);

        //将pageNo保存到session作用域
        req.setAttribute("pageNo",pageNo);
        req.setAttribute("pageSize",pageSize);

        // 使用thymeleaf渲染,渲染fruitList页面,在ViewBaseServlet初始化时配置了，读取web.xml中的配置
        super.processTemplate("fruitList",req,resp);
    }

    // add 方法
    protected void add(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 获取参数
        String fname = req.getParameter("fname");
        String price = req.getParameter("price");
        // 转为大数
        BigDecimal bigPrice = new BigDecimal(price.trim());
        Integer fcount = Integer.parseInt(req.getParameter("count"));
        String remark = req.getParameter("remark");
        // 调用dao方法
        Fruit fruit = new Fruit(fname,bigPrice,fcount,remark);
        fruitService.addFruit(fruit);
        // 重定向到列表请求
        resp.sendRedirect(REQ_DO);
    }

    // edit 方法
    protected void edit(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 接收请求传来的参数
        String idStr = req.getParameter("id");
        // 判断条件,不能为空且不能不传
        if(idStr !=null && !"".equals(idStr)){
            // 转为包装类,同时强转为Integer类
            Integer id = Integer.parseInt(idStr);
            // 使用service层
            Fruit fruit = fruitService.getFruitById(id);
            // 将fruit放在request请求域中
            req.setAttribute("fruit",fruit);
            // System.out.println("fruit = " + fruit);
            // 转发到编辑页面
            super.processTemplate("editFruit",req,resp);
        }
    }

    // update 方法
    protected void update(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 获取Post请求中，请求体中的数据
        String fname = req.getParameter("fname");
        String price = req.getParameter("price");
        // 转为大数
        BigDecimal bigPrice = new BigDecimal(price.trim());
        Integer count = Integer.parseInt(req.getParameter("count"));
        String remark = req.getParameter("remark");
        Integer id = Integer.parseInt(req.getParameter("id"));
        // 创建水果对象
        Fruit fruit = new Fruit(id,fname,bigPrice,count,remark);
        // 更新数据库数据
        fruitService.updateFruit(fruit);
        // 转发到 水果列表页面，
        // processTemplate("fruitList",req,resp);
        // 重定向 列表请求
        resp.sendRedirect(REQ_DO);
    }

    // del 方法
    protected void del(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 解析请求中的id
        Integer id = Integer.parseInt(req.getParameter("id"));
        // 调用删除
        fruitService.delFruit(id);
        // 重定向 到列表请求
        resp.sendRedirect(REQ_DO);
    }
}

```

### 解耦合

可以看出Service层需要Dao层实例对象操作，Servlet层需要Service层的实例操作，封装JavaBean文件用来解耦合。

新建javaBean配置文件 resource/bean.xml

```xml
<?xml version="1.0" encoding="utf-8" ?>
<!DOCTYPE beans [
    <!--定义元素根节点 * 一个或多个 -->
    <!ELEMENT beans (bean*)>
    <!--定义元素bean子节点 * 一个或多个 -->
    <!ELEMENT bean (property*)>
    <!--定义元素property节点 类型为字符串 -->
    <!ELEMENT property (#PCDATA)>
    <!--定义节点上的属性-->
    <!ATTLIST bean id ID #REQUIRED>
    <!ATTLIST bean class CDATA #REQUIRED>
    <!ATTLIST property name CDATA #REQUIRED>
    <!ATTLIST property ref IDREF #REQUIRED>
]>

<beans>
    <!--bean:使用javaBean组件 定义每个接口的实现类位置 -->
    <bean id="fruitDao" class="com.fruit.yuluo.dao.impl.FruitDaoImpl"></bean>
    <bean id="fruitService" class="com.fruit.yuluo.service.impl.FruitServiceImpl" >
        <!-- 声明FruitServiceImpl实现类中属性名 -->
        <!-- FruitDao fruitDao = new FruitDaoImpl(); -->
        <!-- ref 指向FruitDaoImpl实现类的bean标签的id -->
        <property name="fruitDao" ref="fruitDao"></property>
    </bean>
</beans>
```

### 封装IoC容器

实现一个 **简单版的 IoC 容器**（类似 Spring 的 `ApplicationContext`），根据 `bean.xml` 的配置。

- 负责 **创建对象实例**（反射）。
- 负责 **注入依赖**（属性赋值）。
- 类似一个工厂，负责生产实例。

`beanMap` 就是一个 **简单的单例池**。

- 第一次循环：实例化所有 bean。
- 第二次循环：根据 `<property>` 做依赖注入。

最终效果：

```java
FruitServiceImpl fruitService = new FruitServiceImpl();
fruitService.setFruitDao(new FruitDaoImpl());
```

> `DocumentBuilderFactory.newInstance()` 就够了，内部会自己找实现类。

封装BeanFactory接口

```java
package com.fruit.yuluo.ioc;

// Bean工厂，给一个id返回一个JavaBean实例
public interface BeanFactory {
    Object getBean(String id);
}
```

实现BeanFactory接口，ClassPathXmlApplicationContext类

com.fruit.yuluo.ioc.impl.ClassPathXmlApplicationContext

```java
package com.fruit.yuluo.ioc.impl;

import com.fruit.yuluo.ioc.BeanFactory;
import com.fruit.yuluo.utils.ClassUtil;
import com.sun.org.apache.xerces.internal.jaxp.DocumentBuilderFactoryImpl;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

public class ClassPathXmlApplicationContext implements BeanFactory {

    // 创建一个Map集合，键值对集合，每一个键值，键为String类型的接口类型，值为接口的实现类实例。
    // 这些实例中根据xml的配置，有的有属性且指向另一个实例对象，有的没有属性
    // {{"fruitDao":@xxcc},{"fruiService":@xxzz}}
    /*
    * @xxcc: new FruitDaoImpl 实例
    * @xxzz: new FruitServiceImpl 实例，且包含 @xxzz.fruitDao = @xxcc 属性
    * */
    private Map<String,Object> beanMap = new HashMap<>();

    @Override
    public Object getBean(String id) {
        // 获取map集合中的键的值
        return beanMap.get(id);
    }

    // 在构造方法中解析xml文件配置
    public ClassPathXmlApplicationContext() {
        try {
            // 加载xml
            InputStream in = this.getClass().getClassLoader().getResourceAsStream("bean.xml");
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            // 获取doc对象
            Document doc = builder.parse(in);
            // 解析doc对象，每个Node标签节点称为一个bean
            NodeList beanNodeList = doc.getElementsByTagName("bean");
            // 获取bean节点
            for (int i = 0; i < beanNodeList.getLength(); i++) {
                // 获取bean节点
                Node beanNode = beanNodeList.item(i);
                // 判断如果是元素节点
                if (beanNode.getNodeType() == Node.ELEMENT_NODE){
                    // 强制转为元素节点
                    Element beanElement = (Element) beanNode;
                    // 获取bean元素上属性
                    String id = beanElement.getAttribute("id"); // fruitDao
                    String className = beanElement.getAttribute("class"); // com.yuluo.dao.impl.FruitDaoImpl
                    // 通过反射获取实现类的实例，bean，种子
                    Object beanInstance = ClassUtil.createInstance(className); // new FruitDaoImpl @xxcc
                    // 把这个实例对象存放在map集合中
                    beanMap.put(id,beanInstance); // {{"fruitDao": @xxcc},{"fruiService":@xxzz}}
                    /*
                    *  {{"fruitDao":@xxcc},{"fruiService":@xxzz}}
                    *
                    * */

                }
            }
            // 重新遍历 beanNodeList 节点
            for (int i = 0; i < beanNodeList.getLength(); i++) {
                Node beanNode = beanNodeList.item(i);
                if (beanNode.getNodeType() == Node.ELEMENT_NODE){
                    Element beanElement = (Element) beanNode;
                    // 获取beanEle标签上的id的值
                    String id = beanElement.getAttribute("id"); // fruitService
                    // 从Map集合中取出 bean实例
                    Object bean = beanMap.get(id); // @xxzz

                    // 解析Xml中的子标签中的属性
                    NodeList beanChildNodeList = beanElement.getChildNodes();
                    for (int j = 0; j < beanChildNodeList.getLength(); j++) {
                        Node beanChildNode = beanChildNodeList.item(j);
                        // 判断子节点的元素的标签名称是否是property元素节点
                        // 没有则直接跳过，表示当前类中没有属性需要工厂类的需求
                        if (beanChildNode.getNodeType() == Node.ELEMENT_NODE && "property".equalsIgnoreCase(beanChildNode.getNodeName())){
                            // 强转为Element元素
                            Element propertyElement = (Element) beanChildNode;
                            // 获取属性名和属性值
                            String propertyName = propertyElement.getAttribute("name"); // fruitDao
                            // 这里的Ref指向id，也就是属性名
                            String propertyRef = propertyElement.getAttribute("ref"); // fruitDao
                            // 将propertyRef对应的实例取出来
                            Object refObj = beanMap.get(propertyRef); // 这里取出来的是 @xxcc 实例
                            // 将refObj赋值给bean的 propertyName 属性
                            // 给fruitService实例（@xxzz）中添加了 fruitDao 属性，并指定属性的指向为 FruitDao的实例（@xxcc）
                            ClassUtil.setProperty(bean,propertyName,refObj);
                            // 相当于在FruitService类中执行了 FruitDao fruitDao = new FruitDaoImpl()
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

```



### FruitServlet转为控制器

将 FruitServlet 转为控制器，作为一个普通类，把请求拦截功能删除，统一上交到DispatcherServlet类中处理。

新建 controller 目录，新建  com.fruit.yuluo.controller.FruitController 类，把原FruitServlet，增删改查的逻辑放在此处，控制页面的渲染。

```java
package com.fruit.yuluo.controller;

import com.fruit.yuluo.ioc.BeanFactory;
import com.fruit.yuluo.pojo.Fruit;
import com.fruit.yuluo.service.FruitService;
import com.fruit.yuluo.servlet.ViewBaseServlet;
import com.fruit.yuluo.utils.StringUtils;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

public class FruitController extends ViewBaseServlet {
    // 定义一个静态常量
    private static final String REQ_DO = "fruit.do";
    // 新增一个Service类 (使用Ioc工厂类获取实例对象)
    // private FruitService fruitService = new FruitServiceImpl();
    /* 在 bean.xml 中添加了 配置
    <bean id="fruit" class="com.fruit.yuluo.controller.FruitController">
        <property name="fruitService" ref="fruitService"></property>
    </bean>
    * */
    private FruitService fruitService;

    // list方法
    protected void list(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 获取session对象
        HttpSession session = req.getSession();
        // 定义关键字
        String keyword = "";
        // 定义前端的操作标记
        String operate = req.getParameter("oper");
        // 定义前端页码和每页大小
        Integer pageNo = 1;
        Integer pageSize = 5;
        Integer pageCount = 0;

        // 搜索操作
        if ("search".equals(operate)){
            // 获取请求参数中关键字
            String keywordStr = req.getParameter("keyword");
            if (StringUtils.isNotEmpty(keywordStr)){
                keyword = keywordStr;
            }
            // 把关键字存储到session中,再会话中始终存在
            session.setAttribute("keyword",keyword);
        }else{ // 下一页操作
            Object keywordObj = session.getAttribute("keyword");
            // 如果不为空
            if (keywordObj != null){
                // 强转为String类型，并复制给keyword
                keyword = (String) keywordObj;
            }
        }
        // 获取前端传来的页码
        String pageNoStr = req.getParameter("pageNo");
        String pageSizeStr = req.getParameter("pageSize");
        // 判断pageNoStr和pageSizeStr 不能为空且不能为null
        if (StringUtils.isNotEmpty(pageNoStr)){
            pageNo = Integer.parseInt(pageNoStr);
        }
        if (StringUtils.isNotEmpty(pageSizeStr)){
            pageSize = Integer.parseInt(pageSizeStr);
        }
        // 查询数据库，使用service层实现
        List<Fruit> fruitList = fruitService.getFruitList(keyword, pageNo, pageSize);
        Integer totalNum = fruitService.getTotalNum(keyword);
        Integer totalPageNum = fruitService.getTotalPageNum(keyword, pageSize);

        // 判断pageNo和pageSize合法范围
        if (pageNo <=0){
            pageNo = 1;
        }
        if (pageNo >= totalPageNum){
            pageNo = totalPageNum;
        }

        // 不必放 session，避免并发和数据混乱
        req.setAttribute("fruitList",fruitList);
        req.setAttribute("pageCount",totalPageNum);
        req.setAttribute("totalCount",totalNum);

        //将pageNo保存到session作用域
        req.setAttribute("pageNo",pageNo);
        req.setAttribute("pageSize",pageSize);

        // 使用thymeleaf渲染,渲染fruitList页面,在ViewBaseServlet初始化时配置了，读取web.xml中的配置
        super.processTemplate("fruitList",req,resp);
    }

    // add 方法
    protected void add(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 获取参数
        String fname = req.getParameter("fname");
        String price = req.getParameter("price");
        // 转为大数
        BigDecimal bigPrice = new BigDecimal(price.trim());
        Integer fcount = Integer.parseInt(req.getParameter("count"));
        String remark = req.getParameter("remark");
        // 调用service
        Fruit fruit = new Fruit(fname,bigPrice,fcount,remark);
        fruitService.addFruit(fruit);
        // 重定向到列表请求
        resp.sendRedirect(REQ_DO);
    }

    // edit 方法
    protected void edit(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 接收请求传来的参数
        String idStr = req.getParameter("id");
        // 判断条件,不能为空且不能不传
        if(idStr !=null && !"".equals(idStr)){
            // 转为包装类,同时强转为Integer类
            Integer id = Integer.parseInt(idStr);
            // 使用service层
            Fruit fruit = fruitService.getFruitById(id);
            // 将fruit放在request请求域中
            req.setAttribute("fruit",fruit);
            // System.out.println("fruit = " + fruit);
            // 转发到编辑页面
            super.processTemplate("editFruit",req,resp);
        }
    }

    // update 方法
    protected void update(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 获取Post请求中，请求体中的数据
        String fname = req.getParameter("fname");
        String price = req.getParameter("price");
        // 转为大数
        BigDecimal bigPrice = new BigDecimal(price.trim());
        Integer count = Integer.parseInt(req.getParameter("count"));
        String remark = req.getParameter("remark");
        Integer id = Integer.parseInt(req.getParameter("id"));
        // 创建水果对象
        Fruit fruit = new Fruit(id,fname,bigPrice,count,remark);
        // 更新数据库数据
        fruitService.updateFruit(fruit);
        // 转发到 水果列表页面，
        // processTemplate("fruitList",req,resp);
        // 重定向 列表请求
        resp.sendRedirect(REQ_DO);
    }

    // del 方法
    protected void del(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 解析请求中的id
        Integer id = Integer.parseInt(req.getParameter("id"));
        // 调用删除
        fruitService.delFruit(id);
        // 重定向 到列表请求
        resp.sendRedirect(REQ_DO);
    }
}

```

删除 FruitServlet 类。

### 封装中央Servlet类

新建一个请求分发Servlet，用来拦截所有的请求 （*.do），DispatcherServlet类。用来接管原 FruitServlet 的请求处理功能。这个类可用于所有功能的请求处理。

com.fruit.yuluo.myssm.servlet.DispatcherServlet

```java
package com.fruit.yuluo.myssm.servlet;

import com.fruit.yuluo.ioc.BeanFactory;
import com.fruit.yuluo.ioc.impl.ClassPathXmlApplicationContext;
import com.fruit.yuluo.servlet.ViewBaseServlet;
import com.fruit.yuluo.utils.StringUtils;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

@WebServlet("*.do")
public class DispatcherServlet extends ViewBaseServlet {
    // 创建 bean 实例
    private BeanFactory beanFactory = new ClassPathXmlApplicationContext();
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 统一设置请求头
        req.setCharacterEncoding("UTF-8");
        // 获取URI
        // http://localhost/fruit.do?id=9&fname=apple&price=10
        // uri:/fruit.do 截取字符串得到 fruit.do
        // String uri = req.getRequestURI().substring(7);
        String servletPath = req.getServletPath(); // 返回 "/fruit.do"
        String uri = servletPath.substring(1, servletPath.lastIndexOf(".do"));
        String oper = req.getParameter("oper");
        // 截取字符串 得到fruit
        // uri = uri.substring(0, endIndex);
        System.out.println("uri = " + uri);
        // 根据 得到的 请求 fruit 从 IOC容器中 取出bean实例
        // 需要在bean.xml中配置fruit的id,uri假如是 fruit，对应是 FruitController的实例
        /*
        <bean id="fruit" class="com.fruit.yuluo.controller.FruitController">
            <property name="fruitService" ref="fruitService"></property>
        </bean>
        * */
        Object bean = beanFactory.getBean(uri);
        
        // 这里的bean是一个FruitController对象 @xxzz,且 @xxzz.fruitService = new fruitServiceImpl
        // 默认不传操作是列表功能
        if (StringUtils.isEmpty(oper)){
            oper = "list";
        }
        // 通过反射,获取bean实例 控制器实例 的Class对象
        Class beanClass = bean.getClass();
        // 获取 控制器实例中的方法
        // 由于 方法中参数类型数量不同，这里使用获取方法列表
        Method[] methods = beanClass.getDeclaredMethods();
        for (int i = 0; i < methods.length; i++) {
            Method method = methods[i];
            // 判断操作名与方法名一致
            if (oper.equals(method.getName())){
                try {
                    // 调用控制器中的方法
                    method.setAccessible(true);
                    method.invoke(bean,req,resp);
                    // 结束循环,页面转发和重定向,由控制器中的方法统一处理
                    return ;
                } catch (Exception e) {
                    e.printStackTrace();
                    throw new RuntimeException("未找到"+oper+"方法");
                }
            }
        }
    }
}

```

注意：

> 在封装中央Servlet类之后，FruitController就不是Servlet类了，其中继承的父类，原本ViewBaseServlet.java中的init方法，在Tomcat启动时就不在调用了，thymeleaf的初始化就出现了问题，就出现了报错。

解决办法：暂不解决，以后代码会解决。

```java

```

### 中央Servlet类统一处理视图

解决上方的问题，使用中央Servlet类，DispatcherServlet类统一处理视图。

1、改装 FruitController类，取消转发页面功能，取代为返回一个字符串，描述跳转的地址，

同时删除多余参数，取消继承Servlet类，取消使用HttpReq之类的参数。

可以使用 javaBean，ONGL工具类，对方法中的参数进一步的封装（未实现）。

```java
package com.fruit.yuluo.controller;

import com.fruit.yuluo.pojo.Fruit;
import com.fruit.yuluo.service.FruitService;
import com.fruit.yuluo.utils.StringUtils;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.math.BigDecimal;
import java.util.List;

public class FruitController{
    // 定义一个静态常量
    private static final String REQ_DO = "fruit.do";
    // 新增一个Service类 (使用Ioc工厂类获取实例对象)
    // private FruitService fruitService = new FruitServiceImpl();
    /* 在 bean.xml 中添加了 配置
    <bean id="fruit" class="com.fruit.yuluo.controller.FruitController">
        <property name="fruitService" ref="fruitService"></property>
    </bean>
    * */
    private FruitService fruitService;

    // list方法
    protected String list(HttpServletRequest req,HttpSession session,String operate,String keyword,Integer pageNo,Integer pageSize){
        if(StringUtils.isEmpty(keyword)){
            keyword = "" ;
        }
        if (pageNo == null){
            pageNo = 1;
        }
        if (pageSize == null){
            pageSize = 5;
        }
        // 搜索逻辑判断，非空且是search操作
        if(StringUtils.isNotEmpty(operate) && "search".equals(operate)){
            session.setAttribute("keyword",keyword);
        }else{
            Object keywordObj = session.getAttribute("keyword");
            if(keywordObj != null){
                keyword = (String)keywordObj;
            }
        }

        // 查询数据库，使用service层实现
        List<Fruit> fruitList = fruitService.getFruitList(keyword, pageNo, pageSize);
        Integer totalNum = fruitService.getTotalNum(keyword);
        Integer totalPageNum = fruitService.getTotalPageNum(keyword, pageSize);

        // 判断pageNo和pageSize合法范围
        if (pageNo <=0){
            pageNo = 1;
        }
        if (pageNo >= totalPageNum){
            pageNo = totalPageNum;
        }

        // 不必放 session，避免并发和数据混乱
        req.setAttribute("fruitList",fruitList);
        req.setAttribute("pageCount",totalPageNum);
        req.setAttribute("totalCount",totalNum);

        //将pageNo保存到session作用域
        req.setAttribute("pageNo",pageNo);
        req.setAttribute("pageSize",pageSize);

        // 使用thymeleaf渲染,渲染fruitList页面,在ViewBaseServlet初始化时配置了，读取web.xml中的配置
        // super.processTemplate("fruitList",req,resp);
        // 使用中央Servlet控制器处理视图转发，跳转到 fruitList.html 页面
        return "fruitList";
    }

    // add 方法
    protected String add(String fname,String price,Integer count,String remark){
        // 转为大数
        BigDecimal bigPrice = new BigDecimal(price.trim());
        // 调用service
        Fruit fruit = new Fruit(fname,bigPrice,count,remark);
        fruitService.addFruit(fruit);
        // 重定向到列表请求
        // resp.sendRedirect(REQ_DO);
        // 使用中央控制器处理题图
        return "redirect:" + REQ_DO;
    }

    // edit 方法
    protected String edit(HttpServletRequest req,Integer id){
        // 判断条件,不能为空且不能不传
        if(id != null){
            // 使用service层
            Fruit fruit = fruitService.getFruitById(id);
            // 将fruit放在request请求域中
            req.setAttribute("fruit",fruit);
            // System.out.println("fruit = " + fruit);
            // 跳转到 editFruit.html 页面
            return "editFruit";
        }
        return null;
    }

    // update 方法
    protected String update(Integer id,String fname,String price,Integer count,String remark){

        // 转为大数
        BigDecimal bigPrice = new BigDecimal(price.trim());
        // 创建水果对象
        Fruit fruit = new Fruit(id,fname,bigPrice,count,remark);
        // 更新数据库数据
        fruitService.updateFruit(fruit);
        // 转发到 水果列表页面，
        // processTemplate("fruitList",req,resp);
        // 重定向 列表请求
        return "redirect:" + REQ_DO;
    }

    // del 方法
    protected String del(Integer id){
        // 调用删除
        fruitService.delFruit(id);
        // 重定向 到列表请求
        return "redirect:" + REQ_DO;
    }
}

```

改装 DispatcherServlet 类，对视图进行统一处理

需要现在 编辑器中配置 编译时显示参数名字 `-parameters`

> idea的菜单file->settings->builder->compiler->java compiler -> additional command line ...
>
> 设置完成之后需要把out目录重新删除编译一次。

```java
package com.fruit.yuluo.myssm.servlet;

import com.fruit.yuluo.ioc.BeanFactory;
import com.fruit.yuluo.ioc.impl.ClassPathXmlApplicationContext;
import com.fruit.yuluo.servlet.ViewBaseServlet;
import com.fruit.yuluo.utils.StringUtils;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;

@WebServlet("*.do")
public class DispatcherServlet extends ViewBaseServlet {
    // 创建 bean 实例
    private BeanFactory beanFactory = new ClassPathXmlApplicationContext();
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 统一设置请求头
        req.setCharacterEncoding("UTF-8");
        // 获取URI
        // http://localhost/fruit.do?id=9&fname=apple&price=10
        // uri:/fruit.do 截取字符串得到 fruit.do
        // String uri = req.getRequestURI().substring(7);
        String servletPath = req.getServletPath(); // 返回 "/fruit.do"
        String uri = servletPath.substring(1, servletPath.lastIndexOf(".do"));
        String oper = req.getParameter("oper");
        // 截取字符串 得到fruit
        // uri = uri.substring(0, endIndex);
        System.out.println("uri = " + uri);
        // 根据 得到的 请求 fruit 从 IOC容器中 取出bean实例
        // 需要在bean.xml中配置fruit的id,uri假如是 fruit，对应是 FruitController的实例
        /*
        <bean id="fruit" class="com.fruit.yuluo.controller.FruitController">
            <property name="fruitService" ref="fruitService"></property>
        </bean>
        * */
        Object bean = beanFactory.getBean(uri);
        
        // 这里的bean是一个FruitController对象 @xxzz,且 @xxzz.fruitService = new fruitServiceImpl
        // 默认不传操作是列表功能
        if (StringUtils.isEmpty(oper)){
            oper = "list";
        }
        // 通过反射,获取bean实例 控制器实例 的Class对象
        Class beanClass = bean.getClass();
        // 获取 控制器实例中的方法
        // 由于 方法中参数类型数量不同，这里使用获取方法列表
        Method[] methods = beanClass.getDeclaredMethods();
        for (int i = 0; i < methods.length; i++) {
            Method method = methods[i];
            // 判断操作名与方法名一致
            if (oper.equals(method.getName())){
                try {
                    // 调用控制器中的方法
                    method.setAccessible(true);
                    // 获取方法列表
                    Parameter[] parameters = method.getParameters();
                    // 创建一个参数结果的列表
                    Object[] parameterValueArr = new Object[parameters.length];
                    // 遍历
                    for (int j = 0;j<parameterValueArr.length;j++){
                        // 获取参数对象
                        Parameter parameter = parameters[j];
                        // 获取参数名字-需要在编辑器中配置 -parameters
                        String parameterName = parameter.getName();
                        // java.lang.Integer;typeName为Integer
                        String typeName = parameter.getType().getName();
                        // 设置参数值
                        Object parameterValue = null;
                        // 分支结构
                        switch (parameterName){
                            case "session":
                                parameterValue = req.getSession(); // 值是一个session对象
                                break;
                            case "req":
                                parameterValue = req;
                                break;
                            case "resp":
                                parameterValue = resp;
                                break;
                            default:
                                // 默认情况 从 请求域中获取到的 基本数据类型
                                String reqParameter = req.getParameter(parameterName);
                                //此处我们不考虑一个名称对应多个值的情况
                                //http://localhost/fruit.do?hobby=football&hobby=basketball&hobby=pingpong
                                //String[] hobbies = request.getParameterValues("hobby");
                                if (StringUtils.isNotEmpty(reqParameter)){
                                    switch (typeName){
                                        case "java.lang.Integer":
                                            parameterValue = Integer.parseInt(reqParameter);
                                            break;
                                        case "java.lang.Double":
                                            parameterValue = Double.parseDouble(reqParameter);
                                            break;
                                        default:
                                            parameterValue = reqParameter;
                                            break;
                                    }
                                }
                                break;

                        }
                        // 存放参数值
                        parameterValueArr[j] = parameterValue;
                    }
                    for (Object o : parameterValueArr) {
                        System.out.println("o = " + o);
                    }
                    // 执行方法
                    Object returnObj = method.invoke(bean, parameterValueArr);
                    // 处理视图转发
                    if (returnObj != null){
                        // 强转为String类型
                        String returnStr = (String) returnObj;
                        // 判断
                        if (returnStr.startsWith("redirect:")){
                            // 获取后边的字符串
                            returnStr = returnStr.substring("redirect:".length());
                            // 重定向
                            resp.sendRedirect(returnStr);
                        }else {
                            // 转发页面
                            processTemplate(returnStr,req,resp);
                        }
                    }
                    // 结束循环
                    return ;

                } catch (Exception e) {
                    e.printStackTrace();
                    throw new RuntimeException("未找到"+oper+"方法");
                }
            }
        }
    }
}

```

使用这种方法，一定要注意，前端HTML页面中的参数要和后端控制器中的方法中的参数名保持一致，否则会获取不到数据，是null。
