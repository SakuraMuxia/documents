# Web项目

基于传统 Tomcat + Servlet 的查询物联网卡的 Web 项目

## 封装基类



## 打包

**配置 Tomcat**

1、打开 IDEA → **File → Settings → Build, Execution, Deployment → Application Servers**

2、点击 **+ → Tomcat Server** → 选择 **Tomcat 安装目录**

3、填写 Tomcat Home（Tomcat 解压路径）

4、点击 **OK** 保存

**配置 Artifact（打包配置）**

1、打开 **File → Project Structure → Artifacts**

2、点击 **+ → Web Application: Exploded** 或 **Web Application: Archive (WAR)**

- **Exploded**：编译输出的目录结构，可直接调试
- **Archive (WAR)**：生成 WAR 文件用于部署

3、**Output Directory**：指定生成路径，比如 `out/artifacts/MyWebProject_war/`

4、**Add** → **Directory Content** 或 **Module Output**

- 选择项目的 **WebContent** 文件夹和编译后的 classes
- 自动包含 `WEB-INF/lib` 和 `WEB-INF/classes`

> IDEA 会自动帮你打包 WEB-INF 下的目录结构

## 部署

**部署到 Tomcat（运行配置）**

1、打开 **Run → Edit Configurations → + → Tomcat Server → Local**

2、**Server → Application Server**：选择之前配置好的 Tomcat

3、**Deployment → + → Artifact → 选择刚才创建的 Artifact**

4、**Application context**：填写访问路径（如 `/MyWebProject`）

5、**启动/调试选项**：勾选 `On 'Update' action → Update classes and resources` 可热部署

**打包 WAR（可选）**

如果你想生成 WAR 文件用于其它 Tomcat 服务器：

1、打开 **Build → Build Artifacts → Build**

2、选择 **MyWebProject:war → Build**

3、在输出目录找到 `MyWebProject.war`

4、复制到其它 Tomcat 的 `webapps` 下即可部署

## 访问

1、点击 IDEA **Run/Debug** 启动 Tomcat

2、浏览器访问：

```ts
调试或热部署代码，修改后 Build → Build Project → Update
```

**注意事项**

1、**依赖 jar 包**

- 非 Maven 项目，所有依赖放在 `WEB-INF/lib` 下
- IDEA Artifact 配置时要包含这些 jar

2、**Servlet 配置**

- `web.xml` 或 `@WebServlet` 注解都可以用
- 父类 + 子类封装下载逻辑都可以直接运行

3、**中文文件名**

- 父类中设置 `Content-Disposition` 时，使用 URL 编码避免乱码
