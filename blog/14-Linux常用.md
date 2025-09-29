# Linux常用

## 解压缩

```ts
// 打包目录 → tar.gz
tar -czvf archive.tar.gz /path/to/dir
c 新建
z 用 gzip 压缩
v 显示过程
f 指定文件名
// 指定输出文件保存位置
tar -czvf /backup/fruit-2025-09-29.tar.gz /fruit


// 解压到当前目录
tar -xzvf archive.tar.gz
// 解压到指定目录
tar -xzvf archive.tar.gz -C /target/path
```

