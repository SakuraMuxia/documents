# Web项目

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

   ```
   cd /usr/local/tomcat9/bin
   ```

2. 新建文件：

   ```
   vi setenv.sh
   ```

3. 写入 JVM 参数（例如内存配置）：

   ```
   export CATALINA_OPTS="-Xms512m -Xmx1024m -XX:PermSize=256m -XX:MaxPermSize=512m -XX:+UseG1GC"
   ```

4. 保存后赋执行权限：

   ```
   chmod +x setenv.sh
   ```

5. 重启 Tomcat：

   ```
   systemctl restart tomcat
   ```

   或者

   ```
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
