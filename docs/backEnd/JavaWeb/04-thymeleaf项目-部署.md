# thymeleaf项目-部署

基于传统 Tomcat + Servlet 的查询物联网卡的 Web 项目

## 封装基类



## 打包方式1

使用 IDE（IntelliJ IDEA）打包 WAR

1. 打开项目 → `File > Project Structure > Artifacts`
2. 点击 `+` → `Web Application: Exploded` 或 `Web Application: WAR`
3. 直接从当前项目打包，不从空项目。
4. 选择输出目录
5. 点击 **Build > Build Artifacts > Build**
6. 生成 WAR 文件在指定输出目录

## 部署

**部署到 Tomcat**

1、复制 WAR 文件到 Tomcat 的 `webapps` 目录：

```ts
cp myapp.war /usr/local/tomcat9/webapps/
```

2、启动 Tomcat（如果已经启动，Tomcat 会自动解压并部署 WAR）：

```ts
systemctl start tomcat
```

3、访问：

```ts
http://服务器IP:8080/myapp/
```

## 安装Tomcat

## 配置Java环境

Tomcat 需要 JDK 环境（至少 JDK 8，推荐 JDK 11 或以上）。

```java
# 查看是否已安装 JDK
java -version

# 如果没有安装 JDK 8，可以执行：
yum install -y java-1.8.0-openjdk java-1.8.0-openjdk-devel

```

```java
java -version

```

## 下载 Tomcat

比如下载 **Tomcat 9**：

```ts
cd /usr/local/
```

## 解压安装

```java
tar -zxvf apache-tomcat-9.0.94.tar.gz
mv apache-tomcat-9.0.94 tomcat9
```

配置环境变量（可选）

```java
编辑配置文件：
    
export JAVA_HOME=/usr/local/jdk1.8
export PATH=$PATH:$JAVA_HOME/bin
export CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
export CATALINA_HOME=/usr/local/tomcat9
export PATH=$PATH:$CATALINE_HOME/bin

    
    
vim /etc/profile
在文件最后添加：

export CATALINA_HOME=/usr/local/tomcat9
export PATH=$PATH:$CATALINA_HOME/bin
保存退出后：

source /etc/profile
    
```

## 启动 Tomcat

```java
cd /usr/local/tomcat9/bin
./startup.sh
```

如果启动成功，会看到类似：

```ts
Tomcat started.
```

日志查看：

```java
tail -f /usr/local/tomcat9/logs/catalina.out
```

## 防火墙放行

```ts
firewall-cmd --zone=public --add-port=8080/tcp --permanent
firewall-cmd --reload
```

## 访问

## 部署 Web 项目

将打好的 `xxx.war` 放到：

```ts
/usr/local/tomcat9/webapps/
```

Tomcat 会自动解压 `xxx.war`

```ts
http://服务器IP:8080/xxx
```

## 后台运行

Tomcat 默认是前台运行的，可以用 `nohup` 或 systemd

### 创建Tomcat用户

如果你希望用专用用户启动 Tomcat（推荐）：

```java
# 创建用户和用户组
groupadd tomcat
useradd -r -g tomcat -d /usr/local/tomcat9 -s /sbin/nologin tomcat

# 给 tomcat 目录赋权
chown -R tomcat:tomcat /usr/local/tomcat9
    
    
-r 创建系统用户，-s /sbin/nologin 表示不能登录，只能用于运行服务。
    
systemctl daemon-reload
systemctl start tomcat
systemctl status tomcat
    
    
用 root 启动（不推荐生产环境）

如果你暂时测试，可以去掉 User 和 Group：
```



### nohup 方式：

```ts
cd /usr/local/tomcat9/bin
nohup ./startup.sh &
```

### systemd 服务方式：

新建服务文件：

```ts
vim /etc/systemd/system/tomcat.service
```

```java
[Unit]
Description=Apache Tomcat 9
After=network.target

[Service]
Type=simple
# 设置环境变量
Environment="JAVA_HOME=/usr/local/jdk1.8"
Environment="CATALINA_HOME=/usr/local/tomcat9"
Environment="CATALINA_BASE=/usr/local/tomcat9"
Environment="CATALINA_PID=/usr/local/tomcat9/temp/tomcat.pid"
# 使用 catalina.sh run 前台运行
ExecStart=/usr/local/tomcat9/bin/catalina.sh run
ExecStop=/usr/local/tomcat9/bin/catalina.sh stop
# 自动重启
Restart=on-failure
RestartSec=10
# 使用 tomcat 用户
User=tomcat
Group=tomcat
# 设置工作目录
WorkingDirectory=/usr/local/tomcat9

[Install]
WantedBy=multi-user.target

```

保存后执行

```java
systemctl daemon-reexec
systemctl daemon-reload
systemctl enable tomcat
systemctl restart tomcat
systemctl status tomcat
```

## 配置Tomcat

### 修改端口号

默认是 `8080`，如果被占用或者需要修改：

编辑：

```ts
vim /usr/local/tomcat9/conf/server.xml
```

找到：

```ts
<Connector port="8080" protocol="HTTP/1.1"
           connectionTimeout="20000"
           redirectPort="8443" />
```

把 `8080` 改为你想要的端口，例如 `8081`。
 改完重启：

```ts
systemctl restart tomcat
```

### 配置Tomcat内存

```ts
线程数：Tomcat 默认线程可能不足，导致请求排队。可以在 server.xml 中增加

<Connector port="8080" protocol="HTTP/1.1"
           maxThreads="200" minSpareThreads="50"
           connectionTimeout="20000"
           redirectPort="8443" />
```

### 配置JVM内存

```ts
JVM 内存：如果内存不足，可能频繁 GC。可以在 catalina.sh 或 setenv.sh 设置：

export CATALINA_OPTS="-Xms512m -Xmx2g -XX:+UseG1GC"
```

1. 进入 `bin` 目录：

   ```ts
   cd /usr/local/tomcat9/bin
   ```

2. 新建文件：

   ```ts
   vi setenv.sh
   ```

3. 写入 JVM 参数（例如内存配置）：

   ```ts
   export CATALINA_OPTS="-Xms512m -Xmx1024m -XX:PermSize=256m -XX:MaxPermSize=512m -XX:+UseG1GC"
   ```

4. 保存后赋执行权限：

   ```ts
   chmod +x setenv.sh
   ```

5. 重启 Tomcat：

   ```ts
   systemctl restart tomcat
   ```

   或者

   ```ts
   ./shutdown.sh
   ./startup.sh
   ```

⚠️ 注意：

- `setenv.sh` 必须放在 `bin` 目录下，Tomcat 启动脚本会自动检测并加载。
- 如果是 Windows，文件名对应的是 `setenv.bat`。

要不要我帮你写一个适合 **你服务器内存大小** 的 `setenv.sh` 示例



### 查看JVM内存

```ts
export CATALINA_OPTS="-Xms512m -Xmx2g -XX:+UseG1GC"

-Xms：JVM 初始内存
-Xmx：JVM 最大内存
-Xmn：年轻代内存

-XX:+UseG1GC：垃圾回收策略

可以通过查看启动脚本确认：
ps aux | grep java
使用 jstat 查看运行时内存
假设你的 Tomcat PID 是 12345：
jstat -gc 12345 1000
会输出 Eden、Survivor、Old、Perm/Metaspace 等区的使用情况
1000 表示每 1 秒刷新一次

EC/EU：Eden 区容量/已用
OC/OU：老年代容量/已用
MC/MU：Metaspace 容量/已用
YGC/FGC：年轻代/老年代 GC 次数
GCT：总 GC 时间

使用 jconsole 或 VisualVM
图形化工具，可以直接连接到 JVM：
jconsole：随 JDK 自带，输入 PID 或远程连接地址
VisualVM：监控内存、线程、GC、CPU 使用
📌 优点：直观显示堆、非堆内存、垃圾回收情况

在应用中打印内存使用
在 Java 代码中可以直接打印：
Runtime runtime = Runtime.getRuntime();
System.out.println("最大内存: " + runtime.maxMemory()/1024/1024 + "MB");
System.out.println("已分配内存: " + runtime.totalMemory()/1024/1024 + "MB");
System.out.println("空闲内存: " + runtime.freeMemory()/1024/1024 + "MB");
maxMemory()：JVM 最大能用内存
totalMemory()：当前已向系统申请的内存
freeMemory()：当前可用内存
```



### 配置虚拟路径（应用访问路径）

默认情况下，把 `myapp.war` 放到 `webapps` 目录，访问路径是：

```ts
http://IP:8080/myapp
```

如果你想直接用根路径访问（省略 `/myapp`），可以修改 **server.xml**：

在 `<Host>` 标签内添加：

```ts
<Context path="" docBase="/usr/local/tomcat9/webapps/myapp" reloadable="true" />
```

其中：

- `path=""` → 表示根路径
- `docBase` → 你的项目目录或 war 包解压后的路径

### 配置编码（防止中文乱码）

编辑：

```ts
vim /usr/local/tomcat9/conf/server.xml
```

在 `<Connector>` 标签里加上：

```ts
URIEncoding="UTF-8"
```

完整示例：

```ts
<Connector port="8080" protocol="HTTP/1.1"
           connectionTimeout="20000"
           redirectPort="8443"
           URIEncoding="UTF-8" />
```

这样请求参数（GET/POST）都能正常处理中文。

### 设置 JVM 内存参数（提升性能）

编辑启动脚本：

```ts
vim /usr/local/tomcat9/bin/catalina.sh
```

在开头添加（放在 `JAVA_OPTS` 部分）：

```ts
JAVA_OPTS="-Xms512m -Xmx1024m -XX:PermSize=128m -XX:MaxPermSize=256m"
```

- `-Xms`：初始堆内存
- `-Xmx`：最大堆内存
- `PermSize` / `MaxPermSize` → 仅 JDK 8 以前需要

### 配置日志路径

Tomcat 默认日志在：

```ts
/usr/local/tomcat9/logs/catalina.out
```

如果你想分开存储业务日志，可以修改：

```ts
vim /usr/local/tomcat9/conf/logging.properties
```

比如：

```ts
1catalina.org.apache.juli.FileHandler.directory = /var/log/tomcat
```

------

### 开启远程访问管理（Manager & Host Manager）

默认情况下，`/manager` 管理页面只允许本地访问。
 要远程访问，需要修改：

```ts
vim /usr/local/tomcat9/webapps/manager/META-INF/context.xml
```

注释掉：

```ts
<Valve className="org.apache.catalina.valves.RemoteAddrValve"
       allow="127\.\d+\.\d+\.\d+|::1" />
```

再在 `tomcat-users.xml` 添加用户：

```ts
vim /usr/local/tomcat9/conf/tomcat-users.xml
```

增加：

```ts
<role rolename="manager-gui"/>
<user username="admin" password="123456" roles="manager-gui"/>
```

保存后重启，就能用 `http://IP:8080/manager` 登录了。

### 配置多应用（多个 war）

只要把多个 `.war` 包放进：

```ts
/usr/local/tomcat9/webapps/
```

Tomcat 会自动解压，每个 war 对应一个路径：

```ts
http://IP:8080/app1
http://IP:8080/app2
```

如果你想不同的域名绑定到不同的项目，可以在 `server.xml` 的 `<Host>` 里配置多个虚拟主机。

你想要在 **同一个 Tomcat 上跑多个站点（不同域名或 IP 访问对应不同项目）**，这就是 **虚拟主机 (Virtual Host)** 的配置。

### Tomcat 配置多个虚拟主机

Tomcat 的虚拟主机是在 `server.xml` 的 `<Engine>` → `<Host>` 标签里配置的。

```ts
vim /usr/local/tomcat9/conf/server.xml
```

找到：

```ts
<Engine name="Catalina" defaultHost="localhost">
    <Host name="localhost" appBase="webapps"
          unpackWARs="true" autoDeploy="true">
        ...
    </Host>
</Engine>
```

### 新增虚拟主机

比如你有两个域名：

- `www.site1.com` → 部署项目 `site1`
- `www.site2.com` → 部署项目 `site2`

你可以这样配置：

```ts
<Engine name="Catalina" defaultHost="localhost">

    <!-- 默认主机 -->
    <Host name="localhost"  appBase="webapps"
          unpackWARs="true" autoDeploy="true">
    </Host>

    <!-- 虚拟主机 1 -->
    <Host name="www.site1.com"  appBase="/usr/local/tomcat9/site1"
          unpackWARs="true" autoDeploy="true">
        <Context path="" docBase="/usr/local/tomcat9/site1" reloadable="true" />
    </Host>

    <!-- 虚拟主机 2 -->
    <Host name="www.site2.com"  appBase="/usr/local/tomcat9/site2"
          unpackWARs="true" autoDeploy="true">
        <Context path="" docBase="/usr/local/tomcat9/site2" reloadable="true" />
    </Host>

</Engine>
```

说明：

- `name="www.site1.com"` → 访问的域名
- `appBase` → 项目部署目录
- `<Context path="">` → 设置为空，表示直接根路径访问（不带 `/项目名`）

部署项目

把 war 包或解压目录放到对应目录：

```ts
/usr/local/tomcat9/site1/
/usr/local/tomcat9/site2/
```

### 配置 hosts (测试用)

如果你还没在公网解析域名，可以在 CentOS 本地测试：

编辑：

```ts
vim /etc/hosts
```

增加：

```ts
127.0.0.1   www.site1.com
127.0.0.1   www.site2.comts
```

这样在本机浏览器访问：

```ts
http://www.site1.com:8080
http://www.site2.com:8080
```

就能访问不同项目。

------

### 修改默认虚拟主机

`<Engine name="Catalina" defaultHost="localhost">`
 这里的 `defaultHost` 决定了 **未匹配到域名时，落到哪个虚拟主机**。

比如改成：

```ts
<Engine name="Catalina" defaultHost="www.site1.com">
```

那么访问 `http://IP:8080/` 没有指定域名时，就会进入 `site1`。

## 问题

数据库连接池问题

- **刚重启 Tomcat 服务时**，访问快；
- **放置一段时间后**，访问开始变慢甚至卡顿。

这种情况通常不是“Tomcat坏了”，而是 **应用运行时的资源、缓存、线程、数据库连接等问题**导致的。

原因：

**数据库连接池问题**

- 长时间无请求时，数据库连接可能被数据库端关闭（超时回收）。
- 当 Tomcat 再次请求时，连接池里的连接已经失效，需要重新建立连接，导致响应变慢。
- **排查点**：
  - 连接池配置（`maxIdle`, `minIdle`, `validationQuery`, `testWhileIdle` 等参数）。
  - 数据库的连接超时策略（`wait_timeout`）。

解决：

- 在连接池里启用“空闲连接检测”，定时检测连接可用性。
- 常见连接池（HikariCP、Druid、C3P0）都有 `testWhileIdle` / `keepAlive` 配置。

JVM 内存回收（GC）

- Tomcat 长时间运行后，堆内存里可能产生很多对象，GC 压力上升。
- 如果发生 **Full GC**，会导致应用短暂卡顿。
- **排查点**：
  - 查看 GC 日志（是否频繁 Full GC）。
  - `jstat`, `jvisualvm` 等工具监控内存和 GC 情况。

✅ 解决：

- 调整 JVM 内存参数（`-Xms`, `-Xmx`）。
- 分析是否有内存泄漏（比如 Session 没清理、静态集合持有对象）。

应用层缓存过期或未预热

- 重启后响应快，可能是因为 **缓存还在内存里**（比如 Redis/本地缓存预热）。
- 一段时间没访问，缓存过期或被回收，再次访问时需要重新查询数据库 → 慢。

✅ 解决：

- 检查是否有缓存预热逻辑。
- 优化缓存过期时间。

线程/连接耗尽

- 如果应用里有未正确释放的资源（数据库连接、IO流、线程），随着时间推移会被耗尽。
- 一段时间后 Tomcat 无法快速分配资源，响应就变慢。

✅ 解决：

- 检查日志里是否有 “Too many connections” / “Thread pool exhausted” 等报错。
- 监控 Tomcat 的线程池、数据库连接池。

操作系统层面

- TCP 长连接空闲太久，可能被操作系统或防火墙回收，导致重建连接变慢。
- 磁盘 IO、CPU 长时间 idle 后进入省电/降频模式，首次恢复时可能慢。

建议排查步骤

1. **查看 Tomcat 日志**

   - `catalina.out`
   - 是否有异常、连接池报错。

2. **监控数据库连接池**

   - 空闲连接是否过期？
   - 是否有 “连接不可用” 的报错？

3. **开启 GC 日志**

   ```
   -XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:/var/log/tomcat/gc.log
   ```

   看看是不是 GC 引起的卡顿。

4. **监控系统指标**

   - CPU、内存、磁盘 IO、网络。

### 解决办法

数据库连接池的问题，没有在代码中关闭连接

监控druid

在web.xml配置

```xml
<!--数据库连接池-->
    <!-- Druid StatViewServlet -->
    <servlet>
        <servlet-name>DruidStatView</servlet-name>
        <servlet-class>com.alibaba.druid.support.http.StatViewServlet</servlet-class>
        <init-param>
            <param-name>loginUsername</param-name>
            <param-value>admin</param-value>
        </init-param>
        <init-param>
            <param-name>loginPassword</param-name>
            <param-value>admin123</param-value>
        </init-param>
        <init-param>
            <param-name>allow</param-name>
            <param-value></param-value> <!-- 空表示允许所有IP -->
        </init-param>
    </servlet>

    <servlet-mapping>
        <servlet-name>DruidStatView</servlet-name>
        <url-pattern>/druid/*</url-pattern>
    </servlet-mapping>

    <!-- Druid WebStatFilter -->
    <filter>
        <filter-name>DruidWebStatFilter</filter-name>
        <filter-class>com.alibaba.druid.support.http.WebStatFilter</filter-class>
        <init-param>
            <param-name>exclusions</param-name>
            <param-value>*.js,*.css,*.jpg,*.png,*.gif,/druid/*</param-value>
        </init-param>
    </filter>

    <filter-mapping>
        <filter-name>DruidWebStatFilter</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>
```

访问

```ts
 http://localhost:8080/项目名/druid/ 
```

同时在 jdbc.properties中配置 jdbc

```bash
# 公共连接池参数
db.POOL.INITIAL_SIZE=5
db.POOL.MIN_IDLE=5
db.POOL.MAX_ACTIVE=20
db.POOL.MAX_WAIT=60000
db.POOL.VALIDATION_QUERY=SELECT 1
db.POOL.TEST_ON_BORROW=true
db.POOL.TEST_WHILE_IDLE=true
db.POOL.TIME_BETWEEN_EVICTION_RUNS_MILLIS=30000
db.POOL.REMOVE_ABANDONED=true
db.POOL.REMOVE_ABANDONED_TIMEOUT=180
db.POOL.LOG_ABANDONED=true
```

优化 DBUtil.java

```java
package com.iot.yl.utils;

import com.alibaba.druid.pool.DruidDataSource;

import java.io.InputStream;
import java.sql.*;
import java.util.Properties;

public class DButil {
    // 两个数据库连接池
    private static DruidDataSource dataSource1;
    private static DruidDataSource dataSource2;

    // 静态代码块，在类加载时读取配置
    static {
        try {
            // 创建Properties Map集合类
            Properties prop = new Properties();
            // 获取当前类加载器，获取 jdbc的读取流
            InputStream in = DButil.class.getClassLoader().getResourceAsStream("jdbc.properties");
            // 加载配置文件
            prop.load(in);

            // db1 配置
            dataSource1 = new DruidDataSource();
            dataSource1.setDriverClassName(prop.getProperty("db1.DRIVER"));
            dataSource1.setUrl(prop.getProperty("db1.URL"));
            dataSource1.setUsername(prop.getProperty("db1.USER"));
            dataSource1.setPassword(prop.getProperty("db1.PWD"));
            configDataSource(dataSource1, prop);
            // db2 配置
            dataSource2 = new DruidDataSource();
            dataSource2.setDriverClassName(prop.getProperty("db2.DRIVER"));
            dataSource2.setUrl(prop.getProperty("db2.URL"));
            dataSource2.setUsername(prop.getProperty("db2.USER"));
            dataSource2.setPassword(prop.getProperty("db2.PWD"));
            configDataSource(dataSource2, prop);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // 通用获取连接
    public static Connection getConnection(DBType type) throws SQLException {
        switch (type) {
            case DB1: return dataSource1.getConnection();
            case DB2: return dataSource2.getConnection();
            default: throw new IllegalArgumentException("Unknown DBType");
        }
    }

    // 关闭连接
    public static void close(Connection conn, Statement stmt, ResultSet rs) {
        try {
            if (rs != null) rs.close();
            if (stmt != null) stmt.close();
            if (conn != null) conn.close(); // Druid 会自动把连接放回连接池
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    // 配置数据库连接池
    private static void configDataSource(DruidDataSource ds, Properties prop) {
        ds.setInitialSize(Integer.parseInt(prop.getProperty("db.POOL.INITIAL_SIZE")));
        ds.setMinIdle(Integer.parseInt(prop.getProperty("db.POOL.MIN_IDLE")));
        ds.setMaxActive(Integer.parseInt(prop.getProperty("db.POOL.MAX_ACTIVE")));
        ds.setMaxWait(Long.parseLong(prop.getProperty("db.POOL.MAX_WAIT")));
        ds.setValidationQuery(prop.getProperty("db.POOL.VALIDATION_QUERY"));
        ds.setTestOnBorrow(Boolean.parseBoolean(prop.getProperty("db.POOL.TEST_ON_BORROW")));
        ds.setTestWhileIdle(Boolean.parseBoolean(prop.getProperty("db.POOL.TEST_WHILE_IDLE")));
        ds.setTimeBetweenEvictionRunsMillis(
                Long.parseLong(prop.getProperty("db.POOL.TIME_BETWEEN_EVICTION_RUNS_MILLIS")));
        ds.setRemoveAbandoned(Boolean.parseBoolean(prop.getProperty("db.POOL.REMOVE_ABANDONED")));
        ds.setRemoveAbandonedTimeout(
                Integer.parseInt(prop.getProperty("db.POOL.REMOVE_ABANDONED_TIMEOUT")));
        ds.setLogAbandoned(Boolean.parseBoolean(prop.getProperty("db.POOL.LOG_ABANDONED")));
    }
}

```

