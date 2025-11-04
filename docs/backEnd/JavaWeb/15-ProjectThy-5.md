# 书城项目

## 设计数据库

```sql
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for t_book
-- ----------------------------
DROP TABLE IF EXISTS `t_book`;
CREATE TABLE `t_book`  (
`id` int NOT NULL AUTO_INCREMENT,
`bookName` varchar(40) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
`author` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
`price` double(5, 2) NULL DEFAULT NULL,
`saleCount` int NULL DEFAULT NULL,
`bookCount` int NULL DEFAULT NULL,
`bookImg` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
`status` int NULL DEFAULT NULL,
PRIMARY KEY (`id`) USING BTREE,
UNIQUE INDEX `bookName`(`bookName`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 12 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of t_book
-- ----------------------------
INSERT INTO `t_book` VALUES (1, 'C语言入门经典', '亚历山大', 99.00, 8, 197, 'cyuyanrumenjingdian.jpg', NULL);
INSERT INTO `t_book` VALUES (2, '三体', '周杰伦', 48.95, 18, 892, 'santi.jpg', NULL);
INSERT INTO `t_book` VALUES (3, '艾伦图灵传', '刘若英', 50.00, 12, 143, 'ailuntulingzhuan.jpg', NULL);
INSERT INTO `t_book` VALUES (4, '百年孤独', '王力宏', 40.00, 3, 98, 'bainiangudu.jpg', NULL);
INSERT INTO `t_book` VALUES (5, '边城', '刘德华', 30.00, 2, 99, 'biancheng.jpg', NULL);
INSERT INTO `t_book` VALUES (6, '解忧杂货店', '东野圭吾', 27.00, 5, 100, 'jieyouzahuodian.jpg', NULL);
INSERT INTO `t_book` VALUES (7, '中国哲学史', '冯友兰', 45.00, 3, 100, 'zhongguozhexueshi.jpg', NULL);
INSERT INTO `t_book` VALUES (8, '忽然七日', '劳伦', 19.00, 50, 200, 'huranqiri.jpg', NULL);
INSERT INTO `t_book` VALUES (9, '苏东坡传', '林语堂', 20.00, 50, 300, 'sudongpozhuan.jpg', NULL);
INSERT INTO `t_book` VALUES (10, '扶桑', '严歌岑', 20.00, 10, 89, 'fusang.jpg', NULL);
INSERT INTO `t_book` VALUES (11, '给孩子的诗', '北岛', 23.00, 5, 99, 'geihaizideshi.jpg', NULL);

-- ----------------------------
-- Table structure for t_cart
-- ----------------------------
DROP TABLE IF EXISTS `t_cart`;
CREATE TABLE `t_cart`  (
`id` int NOT NULL AUTO_INCREMENT,
`book` int NOT NULL,
`bookName` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
`price` double NOT NULL,
`buyCount` int NULL DEFAULT NULL,
`user` int NULL DEFAULT NULL,
PRIMARY KEY (`id`) USING BTREE,
INDEX `PK_cart_book`(`book`) USING BTREE,
INDEX `PK_cart_user`(`user`) USING BTREE,
CONSTRAINT `PK_cart_book` FOREIGN KEY (`book`) REFERENCES `t_book` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
CONSTRAINT `PK_cart_user` FOREIGN KEY (`user`) REFERENCES `t_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of t_cart
-- ----------------------------

-- ----------------------------
-- Table structure for t_order
-- ----------------------------
DROP TABLE IF EXISTS `t_order`;
CREATE TABLE `t_order`  (
`id` int NOT NULL AUTO_INCREMENT,
`orderNo` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
`orderDate` datetime NOT NULL,
`orderMoney` double NULL DEFAULT NULL,
`orderCount` int NULL DEFAULT NULL,
`orderStatus` tinyint NULL DEFAULT NULL,
`user` int NULL DEFAULT NULL,
PRIMARY KEY (`id`) USING BTREE,
UNIQUE INDEX `orderNo`(`orderNo`) USING BTREE,
INDEX `PK_order_user`(`user`) USING BTREE,
CONSTRAINT `PK_order_user` FOREIGN KEY (`user`) REFERENCES `t_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of t_order
-- ----------------------------

-- ----------------------------
-- Table structure for t_order_detail
-- ----------------------------
DROP TABLE IF EXISTS `t_order_detail`;
CREATE TABLE `t_order_detail`  (
`id` int NOT NULL AUTO_INCREMENT,
`book` int NULL DEFAULT NULL,
`bookName` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
`price` double NOT NULL,
`buyCount` int NULL DEFAULT NULL,
`orderBean` int NULL DEFAULT NULL,
PRIMARY KEY (`id`) USING BTREE,
INDEX `PK_order_detail_book`(`book`) USING BTREE,
INDEX `PK_order_detail_order`(`orderBean`) USING BTREE,
CONSTRAINT `PK_order_detail_book` FOREIGN KEY (`book`) REFERENCES `t_book` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
CONSTRAINT `PK_order_detail_order` FOREIGN KEY (`orderBean`) REFERENCES `t_order` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of t_order_detail
-- ----------------------------

-- ----------------------------
-- Table structure for t_user
-- ----------------------------
DROP TABLE IF EXISTS `t_user`;
CREATE TABLE `t_user`  (
`id` int NOT NULL AUTO_INCREMENT,
`uname` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
`pwd` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
`email` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
`role` tinyint NULL DEFAULT NULL,
PRIMARY KEY (`id`) USING BTREE,
UNIQUE INDEX `uname`(`uname`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of t_user
-- ----------------------------
INSERT INTO `t_user` VALUES (1, 'lina', 'ok', 'lina@126.com', 0);
INSERT INTO `t_user` VALUES (2, 'rose', 'ok', 'rose@sina.com.cn', 1);

SET FOREIGN_KEY_CHECKS = 1;
```

## 创建配置文件

 applicationContext.xml

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
    <!--1. DAO配置 -->

    <!--2. Service配置 -->

    <!--3. Controller配置 -->

</beans>
```

jdbc.properties

```java
DRIVER=com.mysql.cj.jdbc.Driver
URL=jdbc:mysql://39.106.41.164:3306/bookstore?useSSL=false&serverTimezone=UTC&characterEncoding=utf8
USER=m
PWD=Y
```



## 创建pojo

类的关系

![image-20251029150941603](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20251029150941603.png)



每一个 键值对 相当于一个购物袋，袋子上贴的标签是图书id，内容是书的信息。

![image-20251029145046816](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20251029145046816.png)

User

```java
public class User {
    private Integer id ;
    private String uname ;
    private String pwd ;
    private String email ;
    private Integer role ;
    // 订单列表
    private List<OrderBean> orderBeanList;
}
```

Book

```java
public class Book {

    private Integer id ;
    private String bookName ;
    private String author ;
    private Double price ;
    private Integer saleCount ;
    private Integer bookCount ;
    private String bookImg ;
    private Integer status ;

    public Book() {
    }
    ...
}
```

CartItem

```java
public class CartItem {
    private Integer id ;
    private Book book ;
    private String bookName ;
    private Double price ;
    private Integer buyCount ;
    private User user;
    
}
```

CartList

```java
public class CartList {
    // 每一个 CartItem 相当于一个购物袋, 这些袋子放在购物车中
    // 袋子上贴上标签，key，value指向图书。
    // 定义一个 Map集合存放 每一图书
    private Map<Integer,CartItem> cartItemMap = new HashMap<>();
    private Integer totalCount = 0 ;//总商品数量
    private Double totalMoney = 0.0;//总商品金额
    
}
```

OrderBean

```java
public class OrderBean {
    private Integer id ;
    private String orderNo ;
    private Date orderDate ;
    private Double orderMoney ;
    private Integer orderCount ;
    private Integer orderStatus ;
    private User user ;

    private List<OrderDetail> orderDetailList ;
    ...
}
```

OrderDetail

```java
public class OrderDetail {
    private Integer id ;
    private Book book ;
    private String bookName ;
    private Double price ;
    private Integer buyCount ;
    private OrderBean orderBean ;
}
```

## 配置静态资源

把所有的静态资源放置在 WEB-INF 目录下的 pages 目录中；

同时把 static 静态资源文件夹 放置在 WEB-INF 同级目录中；

配置 web.xml； 

```xml
<context-param>
    <param-name>view-prefix</param-name>
    <param-value>/WEB-INF/pages/</param-value>
</context-param>
<context-param>
    <param-name>view-suffix</param-name>
    <param-value>.html</param-value>
</context-param>
```

配置 myssm 中的 过滤器和侦听器，以及配置文件路径

```xml
<filter>
    <filter-name>CharacterEncodingFilter</filter-name>
    <filter-class>com.muxia.bookstore.myssm.filter.CharacterEncodingFilter</filter-class>
    <init-param>
        <param-name>encoding</param-name>
        <param-value>UTF-8</param-value>
    </init-param>
</filter>
<filter-mapping>
    <filter-name>CharacterEncodingFilter</filter-name>
    <url-pattern>*.do</url-pattern>
</filter-mapping>

<filter>
    <filter-name>OpenSessionInViewFilter</filter-name>
    <filter-class>com.muxia.bookstore.myssm.filter.OpenSessionViewFilter</filter-class>
</filter>
<filter-mapping>
    <filter-name>OpenSessionInViewFilter</filter-name>
    <url-pattern>*.do</url-pattern>
</filter-mapping>

<listener>
    <listener-class>com.muxia.bookstore.myssm.listener.ContextLoaderListener</listener-class>
</listener>

<context-param>
    <param-name>contextConfigLocation</param-name>
    <param-value>applicationContext.xml</param-value>
</context-param>
```

## 功能

### 图书列表

新建 bookController 控制器，添加 list 方法。

```java
...
private BookService bookService ;
public String list(HttpSession session){
    // 获取图书列表
    List<Book> bookList = bookService.getBookList();
    // 把数据放在session中
    session.setAttribute("bookList",bookList);
    return "index";
}
...
```

新增 bookService 服务，添加 getBookList 方法

```java

...
private BookDao bookDao;
@Override
public List<Book> getBookList() {
    return bookDao.getBookList();
}
...
```

新增 bookDao Dao，添加 getBookList 方法

```java
public class BookDaoImpl extends BaseDao<Book> implements BookDao {
    ...
    @Override
    public List<Book> getBookList() {
        return executeQuery("select * from t_book");
    }
    ...
}
```

更新 myssm 中的代码：修改 utils/ClassUtil中的代码

```java
...
    // 判断是否是自定义类型
    public static boolean isMyType(String className){
        switch (className){
            case "java.lang.String":
                // 添加 double类型
            case "java.lang.Double":
            case "java.lang.Integer":
            case "java.lang.Long":
            case "java.util.Date":
            case "java.sql.Date":
            case "java.time.LocalDateTime":
                return false;
            default:
                return true;
        }
    }
...
```

配置 applicationContext

```xml
<beans>
    <!--1. DAO配置 -->
    <bean id="bookDao" class="com.muxia.bookstore.dao.impl.BookDaoImpl"/>
    <!--2. Service配置 -->
    <bean id="bookService" class="com.muxia.bookstore.service.impl.BookServiceImpl">
        <property name="bookDao" ref="bookDao"/>
    </bean>
    <!--3. Controller配置 -->
    <bean id="book" class="com.muxia.bookstore.controller.BookController">
        <property name="bookService" ref="bookService"/>
    </bean>
</beans>
```

前端 index 渲染 session 中的数据

```html
<div class="list-content">
  <div class="list-item" th:each="book : ${session.bookList}" th:object="${book}">
    <img th:src="@{|/static/uploads/*{bookImg}|}" alt="">
    <p th:text="|书名:*{bookName}|">书名:活着</p>
    <p th:text="|作者:*{author}|">作者:余华</p>
    <p th:text="|价格:*{price}|">价格:￥66.6</p>
    <p th:text="|销量:*{saleCount}|">销量:230</p>
    <p th:text="|库存:*{bookCount}|">库存:1000</p>
    <button th:onclick="|addToCart(*{id})|">加入购物车</button>
  </div>
</div>
```

访问请求

> 访问 localhost:8080/book.do 来执行 bookController 中的 list 方法。
>
> 访问 localhost:8080/page?page=index 访问首页，只会渲染页面，但是不会执行控制器中的 list 方法。

### 购物车功能

在加入购物车时，判断登陆状态，未登录则跳转到登陆页面，已登录则执行加入购物车方法。

创建 用户登陆 控制器 UserController

```java
public class UserController {

    private static final String LOGIN_FAIL_PAGE = "user/login" ;
    private static final String LOGIN_SUCC = "redirect:book.do" ;

    private UserService userService;

    public String login(String uname, String pwd, HttpSession session) {
        User user = userService.getUserByUnameAndPwd(uname, pwd);
        if (user == null) {
            return LOGIN_FAIL_PAGE; //"redirect:page?page=user/login";
        } else {
            session.setAttribute("currUser", user);
            return LOGIN_SUCC;
        }
    }
}
```

创建 用户登陆 服务 UserService

```java
public class UserServiceImpl implements UserService {
    private UserDao userDao;

    @Override
    public User getUserByUnameAndPwd(String uname, String pwd) {
        return userDao.getUserByUnameAndPwd(uname,pwd);
    }
}
```

创建 用户登陆 Dao UserDao

```java
public class UserDaoImpl extends BaseDao<User> implements  UserDao {
    @Override
    public User getUserByUnameAndPwd(String uname, String pwd) {
        String sql = "select * from t_user where uname = ? and pwd = ?";
        return load(sql,uname,pwd);
    }
}
```

渲染 用户登陆 页面

```html

<form th:action="@{/user.do}" method="post">
    <input type="hidden" name="oper" value="login"/>
    <label>用户名称：</label>
    <input class="itxt" type="text" placeholder="请输入用户名" autocomplete="off"
      tabindex="1" name="uname" id="username" value="lina"/>
    <br />
    <br />
    <label>用户密码：</label>
    <input class="itxt" type="password" placeholder="请输入密码"
      autocomplete="off" tabindex="1" name="pwd" id="password" value="ok" />
    <br />
    <br />
    <input type="submit" value="登录" id="sub_btn" />
</form>
```

配置 bean 

```xml
<!--1. DAO配置 -->
<bean id="bookDao" class="com.muxia.bookstore.dao.impl.BookDaoImpl"/>
<bean id="userDao" class="com.muxia.bookstore.dao.impl.UserDaoImpl"/>
<!--2. Service配置 -->
<bean id="bookService" class="com.muxia.bookstore.service.impl.BookServiceImpl">
    <property name="bookDao" ref="bookDao"/>
</bean>
<bean id="userService" class="com.muxia.bookstore.service.impl.UserServiceImpl">
    <property name="userDao" ref="userDao"/>
</bean>
<!--3. Controller配置 -->
<bean id="book" class="com.muxia.bookstore.controller.BookController">
    <property name="bookService" ref="bookService"/>
</bean>
<bean id="user" class="com.muxia.bookstore.controller.UserController">
    <property name="userService" ref="userService"/>
</bean>
```

根据 图书Id 获取图书信息

```java
// service

public Book getBook(Integer bookId) {
    return bookDao.getBook(bookId);
}
```

```java
// dao
public Book getBook(Integer bookId) {
    return load("select * from t_book where id = ? " , bookId);
}
```

根据用户获取用的购物车列表

```java
// service
public List<CartItem> getCartItemList(User user) {
    List<CartItem> cartItemList = cartItemDao.getCartItemListByUserId(user.getId());
    // 遍历 cartItemList
    cartItemList.forEach(cartItem -> {
        // 获取书信息
        Integer bookId = cartItem.getBook().getId();
        Book book = bookService.getBook(bookId);
        // 把书的信息填充到 cartItem 上
        cartItem.setBook(book);
    });
    return cartItemList;
}
```

```java
// dao
public List<CartItem> getCartItemListByUserId(Integer userId) {
    return executeQuery("select * from t_cart where user = ? " , userId);
}
```

创建 购物车控制器 CartController，判断是否登陆，未登录则跳转登陆，已登录获取用户购物列表信息，同时创建一个购物车对象Map集合，把购物信息添加到Map集合中，把购物车对象绑定到用户信息上。

执行添加 书 到购物车逻辑，当购物车中包含了 当前书本，则当前书本的购买数量加1，否则添加一个新的书本对象到Map集合中。

执行 在t_cart表中 更新书本 信息方法

```java
// service cartItemServiceImpl 类
public void updateCartItem(CartItem cartItem) {
    cartItemDao.updateCartItem(cartItem);
}
```

```java
// dao cartItemDao 类
@Override
public void updateCartItem(CartItem cartItem) {
    String sql = "update t_cart set buyCount = ? where id = ?";
    executeUpdate(sql,cartItem.getBuyCount(),cartItem.getId());
}
```

执行 在t_cart表中 添加书本 信息方法 cartItemServiceImpl 类

```java
// service cartItemServiceImpl 类
public void addCartItem(CartItem cartItem) {
    cartItemDao.addCartItem(cartItem);
}
```

```java
// dao cartItemDao 类
public void addCartItem(CartItem cartItem) {
    Integer id = cartItem.getBook().getId();
    String bookName = cartItem.getBookName();
    Double price = cartItem.getPrice();
    Integer buyCount = cartItem.getBuyCount();
    Integer id1 = cartItem.getUser().getId();
    String sql = "insert into t_cart values (0,?,?,?,?,?)";
    executeUpdate(sql,id,bookName,price,buyCount,id1);
}
```

cartController 添加书本到购物车方法；

```java
private CartItemService cartItemService;
private BookService bookService;

// 添加到购物车
public String addToCart(Integer bookId, HttpSession session, HttpServletResponse resp) throws IOException {
    // 获取当前用户信息
    Object currUser = session.getAttribute("currUser");
    // 判断是否登陆
    if (currUser == null){
        // 设置响应编码
        resp.setCharacterEncoding("UTF-8");
        resp.setContentType("text/html;charset=utf-8");
        // 创建一个写入流，返回给客户端
        PrintWriter writer = resp.getWriter();
        writer.println("<script>alert('请先登录！');window.location.href='page?page=user/login';</script>");
        writer.flush();
        writer.close();
        return null;
    }else{
        User user = (User)currUser;
        // 获取用户的 商品列表
        List<CartItem> cartItemList = cartItemService.getCartItemList(user);
        // 创建一个Map集合用于保存用户的购物车列表
        Map<Integer,CartItem> cartItemMap = new HashMap<>();
        // cartItemList添加到cartItemMap集合中
        // key 指向 图书Id，value指向购物袋子
        cartItemList.forEach(cartItem -> {
            cartItemMap.put(cartItem.getBook().getId(),cartItem);
        });
        // 创建一个购物车对象
        Cart cart = new Cart(cartItemMap);
        // 绑定购物车信息到user对象上
        user.setCart(cart);

        // 执行添加 书 到购物车逻辑，当购物车中包含了 当前书本，则数量加1，否则添加一个新的书本对象到Map集合中
        if (cartItemMap.containsKey(bookId)){
            // 执行更新操作
            // 获取书本信息
            CartItem cartItem = cartItemMap.get(bookId);
            cartItem.setBuyCount(cartItem.getBuyCount() + 1);
            // 更新购物袋信息到数据库t_cart表中
            cartItemService.updateCartItem(cartItem);
        }else{
            // 执行添加操作,首先获取图书信息
            Book book = bookService.getBook(bookId);
            // 创建 一个 cartItem 对象
            CartItem cartItem = new CartItem(book,book.getId(),book.getBookName(),book.getPrice(),1,user);
            // 把 cartItem 这个信息添加到 数据库t_cart表中
            cartItemService.addCartItem(cartItem);
        }
        // 重定向到 购物车列表 的 list 方法中
        return "redirect:cart.do";
    }
}
```

CartController中 展示 购物车列表 list 方法

```java
// 展示购物车列表方法
public String list(HttpSession session,HttpServletResponse resp){
    // 获取用户信息
    Object currUser = session.getAttribute("currUser");
    // 判断是否登陆
    if (currUser == null){
        // 设置响应编码
        resp.setCharacterEncoding("UTF-8");
        resp.setContentType("text/html;charset=utf-8");
        // 创建一个写入流，返回给客户端
        PrintWriter writer = null;
        try {
            writer = resp.getWriter();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        writer.println("<script>alert('请先登录！');window.location.href='page?page=user/login';</script>");
        writer.flush();
        writer.close();
        return null;
    }else{
        User user = (User)currUser;
        // 获取用户的 商品列表
        List<CartItem> cartItemList = cartItemService.getCartItemList(user);
        // 创建一个Map集合用于保存用户的购物车列表
        Map<Integer,CartItem> cartItemMap = new HashMap<>();
        // cartItemList添加到cartItemMap集合中
        // key 指向 图书Id，value指向购物袋子
        cartItemList.forEach(cartItem -> {
            cartItemMap.put(cartItem.getBook().getId(),cartItem);
        });
        // 创建一个购物车对象
        Cart cart = new Cart(cartItemMap);
        // 绑定购物车信息到user对象上
        user.setCart(cart);
        // 转发页面到 购物车页面
        return "cart/cart";
    }
}
```

向 Book，Cart，CartItem，OrderBean，OrderDetail，User pojo类中添加 有参id构造方法，和无参构造方法

CartItem 构造函数方法

```java
...
public CartItem(Book book, String bookName, Double price, Integer buyCount, User user) {
    this.book = book;
    this.bookName = bookName;
    this.price = price;
    this.buyCount = buyCount;
    this.user = user;
}
...
```

前端 渲染 购物车 页面：cart/cart

```html
<tbody>
<tr th:each="cartItemEntry : ${session.currUser.cart.cartItemMap}">
  <td>
    <img th:src="@{|/static/uploads/${cartItemEntry.value.book.bookImg}|}" alt="" />
  </td>
  <td th:text="${cartItemEntry.value.bookName}">活着</td>
  <td>
    <span class="count">-</span>
    <input class="count-num" type="text" th:value="${cartItemEntry.value.buyCount}" />
    <span class="count">+</span>
  </td>
<!-- #numbers.formatDecimal(待格式化数字,整数部分至少多少位,'COMMA',小数部分保留的为数,'POINT') -->
<!-- 'POINT' 固定写法，表示小数点   , 'COMMA' 固定写法，表示千分位用逗号隔开 -->
  <td th:text="${#numbers.formatDecimal(cartItemEntry.value.price,0,'COMMA',2,'POINT')}">36.8</td>
  <td th:text="${#numbers.formatDecimal(cartItemEntry.value.price*cartItemEntry.value.buyCount,0,'COMMA',2,'POINT')}">36.8</td>
  <td><a href="">删除</a></td>
</tr>
</tbody>
```

前端 发送 加购物车请求：addToCart(id)

```html
<script type="text/javascript">
  function addToCart(id){
    window.location.href="cart.do?oper=addToCart&id="+id;
  }
</script>
```

配置 javaBean

```properties
<!--1. DAO配置 -->
<bean id="bookDao" class="com.muxia.bookstore.dao.impl.BookDaoImpl"/>
<bean id="userDao" class="com.muxia.bookstore.dao.impl.UserDaoImpl"/>
<bean id="cartItemDao" class="com.muxia.bookstore.dao.impl.CartItemDaoImpl"/>
<!--2. Service配置 -->
<bean id="bookService" class="com.muxia.bookstore.service.impl.BookServiceImpl">
    <property name="bookDao" ref="bookDao"/>
</bean>
<bean id="userService" class="com.muxia.bookstore.service.impl.UserServiceImpl">
    <property name="userDao" ref="userDao"/>
</bean>
<bean id="cartItemService" class="com.muxia.bookstore.service.impl.CartItemServiceImpl">
    <property name="cartItemDao" ref="cartItemDao"/>
    <property name="bookService" ref="bookService"/>
</bean>
<!--3. Controller配置 -->
<bean id="book" class="com.muxia.bookstore.controller.BookController">
    <property name="bookService" ref="bookService"/>
</bean>
<bean id="user" class="com.muxia.bookstore.controller.UserController">
    <property name="userService" ref="userService"/>
</bean>
<bean id="cart" class="com.muxia.bookstore.controller.CartController">
    <property name="cartItemService" ref="cartItemService"/>
    <property name="bookService" ref="bookService"/>
</bean>
```

### 金额日期显示

**金额显示（NumberUtils）**

方法 1：在控制层格式化后再传入模板

```java
import org.apache.commons.lang3.math.NumberUtils;
import java.text.DecimalFormat;

double price = NumberUtils.toDouble("1234.5");
DecimalFormat df = new DecimalFormat("#,##0.00");
String formattedPrice = df.format(price);

model.addAttribute("price", formattedPrice);

```

方法 2：在 Thymeleaf 中使用内置格式化

```html
<p>金额：￥<span th:text="${#numbers.formatDecimal(price, 1, 2)}"></span></p>
```

> #numbers.formatDecimal(数值, 最少小数位, 最多小数位)
>
> 示例：`#numbers.formatDecimal(1234.5, 1, 2)` → `1,234.5`

```java
#numbers.formatDecimal(数字, 整数位最少位数, 'COMMA', 小数位数, 'POINT')
```

| 参数           | 含义                                                  |
| -------------- | ----------------------------------------------------- |
| 数字           | 要格式化的数值（可以是表达式，如 `price * buyCount`） |
| 整数位最少位数 | 不足时补零，例如写 `2` 表示至少两位整数               |
| `'COMMA'`      | 是否启用千分位分隔（固定写法）                        |
| 小数位数       | 保留多少位小数                                        |
| `'POINT'`      | 小数点标记（固定写法）                                |

```html
<td th:text="${#numbers.formatDecimal(36.8, 0, 'COMMA', 2, 'POINT')}"></td>
```

**日期显示**

日期格式化通常依赖 Java 自带的 `DateTimeFormatter` 或 `DateUtils`

方法 1：后台处理

```java
import org.apache.commons.lang3.time.DateUtils;
import java.text.SimpleDateFormat;
import java.util.Date;

Date now = new Date();
SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
String formattedDate = sdf.format(now);

model.addAttribute("now", formattedDate);

```

模版中

```html
<p>当前时间：<span th:text="${now}"></span></p>
```

方法2：Thymeleaf 内置格式化

```html
<p>创建时间：
    <span th:text="${#dates.format(order.createTime, 'yyyy-MM-dd HH:mm:ss')}"></span>
    <td th:text="*{#dates.format(orderDate,'yyyy-MM-dd HH:mm:ss')}">
</p>
```

## 语言选择

语言概览

| 语言                            | 类型      | 执行方式           | 内存管理                | 特点                                  |
| ------------------------------- | --------- | ------------------ | ----------------------- | ------------------------------------- |
| Python                          | 高级脚本  | 解释/字节码        | 自动 GC                 | 简单易学，库丰富，开发效率高          |
| C++                             | 系统/底层 | 编译               | 手动/RAII               | 高性能，底层控制强，复杂              |
| Rust                            | 系统/安全 | 编译               | 所有权机制（安全无 GC） | 高性能 + 内存安全，现代化系统语言     |
| Go                              | 系统/网络 | 编译               | GC                      | 并发简单，部署方便，语法简单          |
| Java                            | 企业级    | 编译为字节码 → JVM | GC                      | 跨平台，面向对象，生态成熟            |
| C                               | 系统/底层 | 编译               | 手动管理                | 简单语法，接近硬件，性能高            |
| C#                              | 企业/应用 | 编译为 IL → CLR    | GC                      | 面向对象，语言现代化，UI & Web 开发强 |
| JavaScript / TypeScript（可选） | Web 前端  | 解释/编译          | GC                      | 前端开发必备，Node.js 可做后端        |

学习成本

| 语言   | 入门难度 | 学习曲线 | 上手时间 | 深入时间                            |
| ------ | -------- | -------- | -------- | ----------------------------------- |
| Python | 低       | 平缓     | 1-2 周   | 1-2 月熟练 Web/数据分析             |
| C      | 高       | 陡峭     | 1-2 月   | 3-6 月掌握指针/内存/系统编程        |
| C++    | 高       | 很陡     | 1-2 月   | 6-12 月掌握 STL/模板/内存管理       |
| Rust   | 高       | 很陡     | 1-2 月   | 6-12 月掌握所有权/生命周期/安全并发 |
| Go     | 中       | 平缓     | 2-3 周   | 1-2 月熟练 Web/网络工具             |
| Java   | 中       | 平缓     | 2-3 周   | 1-2 月熟练企业应用                  |
| C#     | 中       | 平缓     | 2-3 周   | 1-2 月熟练桌面/Unity/Web 开发       |

主要应用方向

| 语言   | 核心应用方向                                               |
| ------ | ---------------------------------------------------------- |
| Python | 数据分析、AI/机器学习、Web 开发、自动化脚本                |
| C      | 操作系统、嵌入式、驱动开发、性能核心                       |
| C++    | 游戏引擎、图形渲染、系统库、高性能计算                     |
| Rust   | 系统安全、嵌入式、区块链、高性能服务、WebAssembly          |
| Go     | Web 后端、微服务、网络工具、云计算、容器生态（Docker/K8s） |
| Java   | 企业级 Web 应用、后端服务、Android 开发                    |
| C#     | Unity 游戏脚本、桌面应用（WinForms/WPF）、Web（ASP.NET）   |

## 购物车总数总金额

更新 Cart类 中总数和总金额属性，同时添加 getter 方法

```java
public Integer getTotalCount() {
    if(cartItemMap!=null && cartItemMap.size()>0){
        cartItemMap.forEach((k,v)->{
            totalCount += v.getBuyCount();
        });
    }else{
        totalCount = 0 ;
    }
    return totalCount;
}

public Double getTotalMoney() {
    if(cartItemMap!=null && cartItemMap.size()>0){
        cartItemMap.forEach((k,v)->{
            totalMoney += (v.getPrice()*v.getBuyCount());
        });
    }else{
        totalMoney = 0.0;
    }
    return totalMoney;
}
```

前端 渲染 数据

```html
<div class="footer-right">
<div>共<span th:text="${session.currUser.cart.totalCount}">3</span>件商品</div>
<div class="total-price">总金额456<span th:text="${#numbers.formatDecimal(session.currUser.cart.totalMoney,0,'COMMA',2,'POINT')}">99.9</span>元</div>
<a class="pay" th:href="@{/orderBean.do(oper='checkout')}">去结账</a>
</div>
```

## 订单功能

### 结算页面列表

向 t_order 表中添加订单选项

```java
// Service
private OrderBeanDao orderBeanDao;
@Override
public void addOrderBean(OrderBean orderBean) {
    orderBeanDao.addOrderBean(orderBean);
}
```

```java
// Dao
@Override
public void addOrderBean(OrderBean orderBean) {
    String sql = "insert into t_order values(0,?,?,?,?,?,?)";
    Integer id = executeUpdate(sql,orderBean.getOrderNo(),orderBean.getOrderDate(),orderBean.getOrderMoney(),orderBean.getOrderCount(),orderBean.getOrderStatus(),orderBean.getUser().getId());
    // 把 订单号 的 id 设置到 orderBean对象上
    orderBean.setId(id);
}
```

修改 pojo 层 orderBean 类中的有参构造

```java
// 使用 
public OrderBean(Date orderDate, Double orderMoney, Integer orderCount, Integer orderStatus, User user) {
    this.orderDate = orderDate;
    this.orderMoney = orderMoney;
    this.orderCount = orderCount;
    this.orderStatus = orderStatus;
    this.user = user;
}
```

新增一个工具类 生成订单号，使用UUID类

```java
public class OrderBeanUtil {
    // SimpleDateFormat是一个日期格式化类
    // 它有两个常用的方法：
    // String -> Date            sdf.parse(str)
    // Date   -> String          sdf.format(date)
    private static SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
    public static String generateOrderNoStr(Date date){
        String orderStr = sdf.format(date);
        String uuidSrt = UUID.randomUUID().toString().replaceAll("-", "");
        return uuidSrt+"_"+orderStr;
    }
}
```

新增 将OrderBean 添加到订单表 方法 addOrderBean

```java
// Dao
public void addOrderBean(OrderBean orderBean) {
    String sql = "insert into t_order values(0,?,?,?,?,?,?)";
    Integer id = executeUpdate(sql,orderBean.getOrderNo(),orderBean.getOrderDate(),orderBean.getOrderMoney(),orderBean.getOrderCount(),orderBean.getOrderStatus(),orderBean.getUser().getId());
    // 把 订单号 的 id 设置到 orderBean对象上
    orderBean.setId(id);
}
```

```java
// Servcice
private OrderBeanDao orderBeanDao;
@Override
public void addOrderBean(OrderBean orderBean) {
    orderBeanDao.addOrderBean(orderBean);
}
```

新增 将购物车列表 信息 添加到订单详情表 方法 

```java
// Dao
@Override
public void addOrderDetail(OrderDetail orderDetail) {
    String sql = "insert into t_order_detail values(0,?,?,?,?,?)";
    executeUpdate(sql,orderDetail.getBook().getId(),orderDetail.getBookName(),orderDetail.getPrice(),orderDetail.getBuyCount(),orderDetail.getOrderBean().getId());
}
```

```java
// Servcice
private OrderDetailDao orderDetailDao;
@Override
public void addOrderDetail(OrderDetail orderDetail) {
    orderDetailDao.addOrderDetail(orderDetail);
}
```

新增 更新 Book 表信息方法 updateBook 方法

```java
// Dao
@Override
public void updateBook(Book book) {
    executeUpdate("update t_book set saleCount = ? , bookCount = ? where id = ?",book.getSaleCount(),book.getBookCount(),book.getId());
}
```

```java
// Servcice
@Override
public void updateBook(Book book) {
    bookDao.updateBook(book);
}
```

删除 购物车表中的 CartItem

```java
// Dao
@Override
public void delCartItem(CartItem cartItem) {
    executeUpdate("delete from t_cart where id = ? " , cartItem.getId());
}
```

```java
// Servcice
@Override
public void delCartItem(CartItem cartItem) {
    cartItemDao.delCartItem(cartItem);
}
```

配置 applicationContext.xml

```xml
<!--1. DAO配置 -->
<bean id="bookDao" class="com.muxia.bookstore.dao.impl.BookDaoImpl"/>
<bean id="userDao" class="com.muxia.bookstore.dao.impl.UserDaoImpl"/>
<bean id="cartItemDao" class="com.muxia.bookstore.dao.impl.CartItemDaoImpl"/>
<bean id="orderBeanDao" class="com.muxia.bookstore.dao.impl.OrderBeanDaoImpl"/>
<bean id="orderDetailDao" class="com.muxia.bookstore.dao.impl.OrderDetailDaoImpl"/>
<!--2. Service配置 -->
<bean id="bookService" class="com.muxia.bookstore.service.impl.BookServiceImpl">
    <property name="bookDao" ref="bookDao"/>
</bean>
<bean id="userService" class="com.muxia.bookstore.service.impl.UserServiceImpl">
    <property name="userDao" ref="userDao"/>
</bean>
<bean id="cartItemService" class="com.muxia.bookstore.service.impl.CartItemServiceImpl">
    <property name="cartItemDao" ref="cartItemDao"/>
    <property name="bookService" ref="bookService"/>
</bean>
<bean id="orderBeanService" class="com.muxia.bookstore.service.impl.OrderBeanServiceImpl">
    <property name="orderBeanDao" ref="orderBeanDao"/>
</bean>
<bean id="orderDetailService" class="com.muxia.bookstore.service.impl.OrderDetailServiceImpl">
    <property name="orderDetailDao" ref="orderDetailDao"/>
</bean>
<!--3. Controller配置 -->
<bean id="book" class="com.muxia.bookstore.controller.BookController">
    <property name="bookService" ref="bookService"/>
</bean>
<bean id="user" class="com.muxia.bookstore.controller.UserController">
    <property name="userService" ref="userService"/>
</bean>
<bean id="cart" class="com.muxia.bookstore.controller.CartController">
    <property name="cartItemService" ref="cartItemService"/>
    <property name="bookService" ref="bookService"/>
</bean>
<bean id="orderBean" class="com.muxia.bookstore.controller.OrderBeanController">
    <property name="bookService" ref="bookService"/>
    <property name="cartItemService" ref="cartItemService"/>
    <property name="orderBeanService" ref="orderBeanService"/>
    <property name="orderDetailService" ref="orderDetailService"/>
</bean>
```

前端页面 渲染 数据

```html
<div class="footer-right">
<div>共<span th:text="${session.currUser.cart.totalCount}">3</span>件商品</div>
<div class="total-price">总金额<span th:text="${#numbers.formatDecimal(session.currUser.cart.totalMoney,0,'COMMA',2,'POINT')}">99.9</span>元</div>
<a class="pay" th:href="@{/orderBean.do(oper='checkout')}">去结账</a>
</div>
```

### 登陆判断

**配置一个filter/UserFilter过滤器判断是否经过登陆**

```java
// 用户登陆 filter
public class UserFilter implements Filter {
    private List<String> writeList;

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        String writeStr = filterConfig.getInitParameter("write");
        // 判断白名单是否是空
        if (StringUtils.isNotEmpty(writeStr)){
            // String转为数组
            String[] writeArr = writeStr.split(",");
            // String类型的数组转为list集合
            writeList = Arrays.asList(writeArr);
        }
        Filter.super.init(filterConfig);
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        // 强转为 HTTPServlet
        HttpServletRequest request= (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;
        // 获取参数
        String uri = request.getRequestURI();
        String oper = request.getParameter("oper");
        oper = StringUtils.isNotEmpty(oper) ? oper : "list";
        // 拼接
        String accessURL = uri+"_"+oper;
        // 判断URL是否是在白名单中
        if (writeList.contains(accessURL)){
            //如果当前的请求包含在白名单中，直接放行
            filterChain.doFilter(request,response);
        }else {
            // 获取session中用户对象信息
            HttpSession session = request.getSession();
            Object userObj = session.getAttribute("currUser");
            if (userObj == null){
                response.setCharacterEncoding("UTF-8");
                response.setContentType("text/html;charset=utf-8");
                PrintWriter out = response.getWriter();
                out.println("<script>alert('请先登录！');window.location.href='page?page=user/login';</script>");
                out.flush();
                out.close();
                return;
            }else{
                // 放行
                filterChain.doFilter(request,response);
            }
        }
    }

    @Override
    public void destroy() {
        Filter.super.destroy();
    }
}
```

配置 web.xml 

```xml
<filter>
    <filter-name>UserFilter</filter-name>
    <filter-class>com.muxia.bookstore.filter.UserFilter</filter-class>
    <init-param>
        <param-name>write</param-name>
        <param-value>/user.do_login,/user.do_regist,/book.do_list</param-value>
    </init-param>
</filter>
<filter-mapping>
    <filter-name>UserFilter</filter-name>
    <url-pattern>*.do</url-pattern>
</filter-mapping>
```

删除购物车时列表时，用户登陆判断代码

**封装一个获取用户购物车Map集合的方法，在Service层的CartItemServiceImpl实现类上**

```java
@Override
public void getUserCartInfo(User user) {
    // 调用上边的方法，获取购物袋中的数据
    List<CartItem> cartItemList = getCartItemList(user);
    // 创建一个Map集合
    Map<Integer,CartItem> cartItemMap = new HashMap<>();
    // 遍历Map集合，把每个购物袋放在其中，同时把书的id作为key
    cartItemList.forEach(cartItem -> {
        cartItemMap.put(cartItem.getBook().getId(),cartItem);
    });
    Cart cart = new Cart(cartItemMap);
    // 在user上设置cart属性
    user.setCart(cart);
}
```

替换Usercontroller，CartController类中的代码，使用cartItemService.getUserCartInfo(user);方法替代。

配置 web.xml 

```xml
<bean id="cart" class="com.muxia.bookstore.controller.CartController">
    <property name="cartItemService" ref="cartItemService"/>
    <property name="bookService" ref="bookService"/>
</bean>
```

**前端修改继续购物链接跳转，注销请求地址**

```html
<a th:href="@{/user.do(oper='logout')}" class="register">注销</a>
<a th:href="@{/cart.do}" class="cart iconfont icon-gouwuche"> 购物车
```

### 注销功能实现

```java
// service
```

```java
// Contorller 注销的原理就是强制让session失效。

public String logout(HttpSession session, HttpServletRequest req, HttpServletResponse resp) throws IOException {
    // session默认的有效时长是30分钟
    // session.setMaxInactiveInterval(60*5);//设置session的有效时长是5分钟
    // 强制让当前session失效
    session.invalidate();
    resp.setCharacterEncoding("UTF-8");
    resp.setContentType("text/html;charset=utf-8");
    PrintWriter out = resp.getWriter();
    out.println("<script>alert('注销成功！');window.location.href='book.do';</script>");
    out.flush();
    return null;
}
```

### 订单列表页面

OrderBeanController控制器添加list方法

```java
public String list(HttpSession session){
    // 获取用户信息
    User user = (User)session.getAttribute("currUser");
    // 获取订单列表
    List<OrderBean> orderBeanList = orderBeanService.getOrderBeanList(user);
    // 把内容设置到用户属性上
    user.setOrderBeanList(orderBeanList);
    // 转发到 订单页面
    return "order/order";
}
```

```java
@Override
public List<OrderBean> getOrderBeanList(User user) {
    return orderBeanDao.getOrderBeanList(user);
}
```

```java
public List<OrderBean> getOrderBeanList(User user) {
    String sql = "select * from t_order where user = ? order by orderDate desc";
    return executeQuery(sql,user.getId());
}
```

前端渲染数据

```html
<tr th:each="orderBean : ${session.currUser.orderBeanList}" th:object="${orderBean}">
<td th:text="*{orderNo}">12354456895</td>
<td th:text="*{orderDate}">
2015.04.23
</td>
<td th:text="${#numbers.formatDecimal(orderBean.orderMoney,0,'COMMA',2,'POINT')}">90.00</td>
<td th:text="*{orderCount}">88</td>
<td th:switch="*{orderStatus}">
<a href="" class="send" th:case="0">等待发货</a>
<a href="" class="send" th:case="1">已发货</a>
<a href="" class="send" th:case="2">未评价</a>
</td>
<td><a href="">查看详情</a></td>
</tr>
```

### 注册功能实现

UserController添加register方法

```java
public String regist(String uname , String pwd , String email,String yourCode , HttpSession session , HttpServletResponse resp) throws IOException {
    // 获取 kaptcha 包默认生成的 验证码值
    String code = (String)session.getAttribute("KAPTCHA_SESSION_KEY");
    if(code.equals(yourCode)) {
        User user = new User(uname, pwd, email);
        userService.addUser(user);
        return "redirect:book.do";
    }else{
        resp.setCharacterEncoding("utf-8");
        resp.setContentType("text/html;charset=utf-8");
        PrintWriter out = resp.getWriter();
        //out.println("<script>alert('验证码不对！');window.location.href='page?page=user/regist';</script>");
        out.println("<script>alert('验证码不对！');window.history.back();</script>");
        out.flush();
        return null ;
    }
}
```

```java
@Override
public void addUser(User user) {
    userDao.addUser(user);
}
```

```java
@Override
public void addUser(User user) {
    String sql = "insert into t_user values(0,?,?,?,?)";
    executeUpdate(sql,user.getUname(),user.getPwd(),user.getEmail(),user.getRole());
}
```

前端渲染页面

```html
<form th:action="@{/user.do}" method="post">
  <input type="hidden" name="oper" value="regist"/>
  <div class="form-item">
    <div>
      <label>用户名称:</label>
      <input type="text" name="uname" placeholder="请输入用户名" />
    </div>
    <span class="errMess">用户名应为6~16位数组和字母组成</span>
  </div>
  <div class="form-item">
    <div>
      <label>用户密码:</label>
      <input type="password"  name="pwd"  placeholder="请输入密码" />
    </div>
    <span class="errMess">密码的长度至少为8位</span>
  </div>
  <div class="form-item">
    <div>
      <label>确认密码:</label>
      <input type="password" name="pwd2" placeholder="请输入确认密码" />
    </div>
    <span class="errMess">密码两次输入不一致</span>
  </div>
  <div class="form-item">
    <div>
      <label>用户邮箱:</label>
      <input type="text" name="email" placeholder="请输入邮箱" />
    </div>
    <span class="errMess">请输入正确的邮箱格式</span>
  </div>
  <div class="form-item">
    <div>
      <label>验证码:</label>
      <div class="verify">
        <input type="text" placeholder="" name="yourCode"/>
        <img th:src="@{/code.jpg}" alt="" />
      </div>
    </div>
    <span class="errMess">请输入正确的验证码</span>
  </div>
  <button class="btn" type="submit">注册</button>
</form>
```



### 验证码功能实现

1、把 kaptcha包导入到项目中

2、配置 kaptcha，静态参数在源码包中的com.google.code.kaptcha.Constants中，在web.xml 中配置。

```xml
放在最后
<servlet>
    <servlet-name>KaptchaServlet</servlet-name>
    <servlet-class>com.google.code.kaptcha.servlet.KaptchaServlet</servlet-class>
    <init-param>
        <param-name>kaptcha.image.width</param-name>
        <param-value>100</param-value>
    </init-param>
    <init-param>
        <param-name>kaptcha.image.height</param-name>
        <param-value>40</param-value>
    </init-param>
    <init-param><!-- 验证码的长度 -->
        <param-name>kaptcha.textproducer.char.length</param-name>
        <param-value>4</param-value>
    </init-param>
    <init-param><!-- 验证码的可选字符 -->
        <param-name>kaptcha.textproducer.char.string</param-name>
        <param-value>0123456789</param-value>
    </init-param>
    <init-param><!-- 不需要干扰因素 -->
        <param-name>kaptcha.noise.impl</param-name>
        <param-value>com.google.code.kaptcha.impl.NoNoise</param-value>
    </init-param>
    <init-param>
        <param-name>kaptcha.textproducer.font.size</param-name>
        <param-value>28</param-value>
    </init-param>
</servlet>
<servlet-mapping>
    <servlet-name>KaptchaServlet</servlet-name>
    <url-pattern>/code.jpg</url-pattern>
</servlet-mapping>
```

作用：按照配置生成验证码图片，同时把这个验证吗中值存放在session中，从session中取出属性

```java
// 获取 kaptcha 包默认生成的 验证码值
String code = (String)session.getAttribute("KAPTCHA_SESSION_KEY");
if(code.equals(yourCode)) {
    User user = new User(uname, pwd, email);
    userService.addUser(user);
    return "redirect:book.do";
}else{
    resp.setCharacterEncoding("utf-8");
    resp.setContentType("text/html;charset=utf-8");
    PrintWriter out = resp.getWriter();
    //out.println("<script>alert('验证码不对！');window.location.href='page?page=user/regist';</script>");
    out.println("<script>alert('验证码不对！');window.history.back();</script>");
    out.flush();
    return null ;
}
```

### fragment的使用

thymeleaf中的语法，把重复的代码封装成一个组件，然后引入使用。

新建一个目录 component/title.html

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<!-- th:fragment 表示给一段代码取了一个名字，welcome -->
<div th:fragment="welcome">
  <h3>欢迎<span th:text="${session.currUser.uname}">张总</span>光临尚硅谷书城</h3>
  <div class="order"><a th:href="@{/orderBean.do}">我的订单</a></div>
  <div class="destory"><a th:href="@{/user.do(oper='logout')}" class="register">注销</a></div>
  <div class="gohome">
    <a th:href="@{/book.do}">返回</a>
  </div>
</div>
</body>
</html>
```

在 页面上引用

```html
<!-- 在页面上引用 -->
<div class="header-right" th:include="component/title::welcome" ></div>
```

