# Thymeleaf案例

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
