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
package com.fruit.yuluo.myssm.filter;

/*
* 这个过滤器作用是 管理事务的回滚
* */

import com.fruit.yuluo.myssm.transaction.TransactionManager;

import javax.servlet.*;
import java.io.IOException;

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
package com.fruit.yuluo.myssm.utils;

import com.alibaba.druid.pool.DruidDataSource;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Properties;

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
    public static void closeConn() {
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

BaseDao类：

```java
package com.fruit.yuluo.myssm.dao;

import com.fruit.yuluo.myssm.exception.BaseDaoRunTimeException;
import com.fruit.yuluo.myssm.utils.ClassUtil;
import com.fruit.yuluo.myssm.utils.ConnUtil;

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

## 事务管理类

**创建 TransactionFilter 类用于管理事务的开启，提交，回滚。**

com.fruit.yuluo.myssm.transaction.TransactionManager

```java
package com.fruit.yuluo.myssm.transaction;

import com.fruit.yuluo.myssm.utils.ConnUtil;

import java.sql.Connection;
import java.sql.SQLException;

/*
* 这个类的作用是为了 事务管理
* 定义成抽象，是为了避免被new对象
* */
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

## 统一异常处理

目的是：在通用代码中，把编译型的异常，转换位运行时异常，ssm包中不再有try catch，不用担心异常处理了。

**🔥潜在问题**：内部组件trycatch到的问题，打印出来了，但在外部的组件就catch不到了；

**🐛解决办法**：统一对异常做处理；内部的组件出现问题之后，往外抛异常，让外部组件可以捕捉到；

1、封装一个运行时异常类。BaseDaoRunTimeException 类，继承 RuntimeException 类。

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

2、JDBC中大部分的异常都是编译时异常，分别在 BaseDao中抛出运行时异常，DispatcherServlet抛出运行时异常，ConUtil类中抛出运行时异常，TransActionManeger类中抛出运行时异常；

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

## 监听器初始化JavaBean

IOC容器创建对象在DispatcherServlet的代码中，当第一个请求到来时，Ioc容器才会创建对象，这对第一个请求不公平，于是使用 ServletContextListener 监听器在Tomcat启动时，就使用IOC工具类创建对象，这样效率更高。

创建 .myssm/listener/ContextLoaderListener.java 监听器用来监听Tomcat容器启动。

```ts
思路和目的作用：
	实现 ServletContextListener 类
    在 web.xml 中配置 Listener项目
	在初始化时，创建 beanFactory 对象，创建容器
    保存在 application 作用域中
    修改 DispatcherServlet 类中的代码：
    	手动调用父类中的init方法	
    	在 init 方法中通过application作用域中取出BeanFactory对象。
    修改ClassPathXmlApplicaktionContext代码内容
    	把无参构造方法修改为有参构造方法，参数是文件目录字符串
        无参构造方法调用有参构造方法
    修改ContextLoaderListener监听器中的初始化IOC容器的方法
    	如果xml配置文件中没有配置，则使用无参构造的方法，
        如果xml配置文件中配置了"contextConfigLocation"参数，则使用有参构造的方法。
   	创建 IOC 工具类，IocUtil.java。
		通过一个静态关键字，从application作用域中获取对象。
		提供 getBeanFactory方法 获取BeanFactory对象
    
```

ClassPathXmlApplicationContext.java

```java
public class ClassPathXmlApplicationContext implements BeanFactory {

    // 创建一个Map集合，键值对集合，每一个键值，键为String类型的接口类型，值为接口的实现类实例。
    // 这些实例中根据xml的配置，有的有属性且指向另一个实例对象，有的没有属性
    // {{"fruitDao":@xxcc},{"fruiService":@xxzz}}
    /*
    * @xxcc: new FruitDaoImpl 实例
    * @xxzz: new FruitServiceImpl 实例，且包含 @xxzz.fruitDao = @xxcc 属性
    * */
    private Map<String,Object> beanMap = new HashMap<>();

    ...

    // 无参构造中调用 bean.xml
    public ClassPathXmlApplicationContext() {
        this("bean.xml");
    }

    // 在构造方法中解析xml文件配置
    public ClassPathXmlApplicationContext(String configName){
        try {
            // 加载xml
            InputStream in = this.getClass().getClassLoader().getResourceAsStream(configName);
            // 如果为空则抛异常
            if (in == null){
                throw new RuntimeException(configName + "找不到，或者非法！");
            }
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
            // 手写 IoC 容器中的“自动注入依赖”核心逻辑
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

ContextLoaderListener.java

```java
package com.fruit.yuluo.myssm.listener;

import com.fruit.yuluo.myssm.ioc.BeanFactory;
import com.fruit.yuluo.myssm.ioc.impl.ClassPathXmlApplicationContext;
import com.fruit.yuluo.myssm.utils.StringUtils;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

@WebListener
public class ContextLoaderListener implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent sce) {
        // 声明 beanFactory 对象
        BeanFactory beanFactory = null;
        // 获取 context 对象
        ServletContext ctx = sce.getServletContext();
        // 获取 初始化参数配置
        String contextConfigLocation = ctx.getInitParameter("contextConfigLocation");
        // 创建Ioc容器
        if (StringUtils.isNotEmpty(contextConfigLocation)){
            beanFactory = new ClassPathXmlApplicationContext(contextConfigLocation);
        }else{
            beanFactory = new ClassPathXmlApplicationContext();
        }
        // 放在 application 作用域中
        ctx.setAttribute("IOC_CONTAINER_KEY",beanFactory);
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        System.out.println("ServletContext对象被销毁...");
    }
}

```

DispatcherServlet.java

```java
@WebServlet("*.do")
public class DispatcherServlet extends ViewBaseServlet {

    private BeanFactory beanFactory;
    // 创建 bean 实例
    // private BeanFactory beanFactory = new ClassPathXmlApplicationContext();
    // 在 Listener 中创建实例
    // 在 application 作用域中 获取 bean实例


    @Override
    public void init() throws ServletException {
        super.init();//这句话不能省略。因为父类的初始化方法中也有操作，需要创建模板引擎对象
        ServletContext ctx = this.getServletContext();
        beanFactory = IocUtil.getBeanFactory(ctx);
    }
...
}

```

IocUtil.java

```java
package com.fruit.yuluo.myssm.utils;

import com.fruit.yuluo.myssm.ioc.BeanFactory;

import javax.servlet.ServletContext;

public class IocUtil {
    // 定义一个静态常量
    private static final String IOC_CONTAINER_KEY = "IOC_CONTAINER_KEY";

    // 定义方法-通过 application 作用域获取 beanFactory 对象
    public static BeanFactory getBeanFactory(ServletContext servletContext){
        return (BeanFactory) servletContext.getAttribute(IOC_CONTAINER_KEY);
    }
}

```

xml配置文件

```xml
<!--配置初始化参数-->
    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value></param-value>
    </context-param>
```

✨**注意：**

如果提示找不到文件，又可能是out目录中的文件没有及时更新，需要把out文件删除重新编译一边即可。
