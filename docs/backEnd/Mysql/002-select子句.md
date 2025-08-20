# Select子句

## 七大子句

在 SQL 中，`SELECT` 语句常见 **7大子句**，它们的书写顺序与执行顺序不同：

```sql
SELECT ... 
FROM ...
ON ...
WHERE ...
GROUP BY ...
HAVING ...
ORDER BY ...
LIMIT ...

```

实际执行顺序

1. **FROM**：确定数据来源表。
2. **ON**：执行表连接时的连接条件。
3. **WHERE**：筛选记录（行过滤）。
4. **GROUP BY**：分组。
5. **HAVING**：对分组后的结果进行条件过滤。
6. **SELECT**：子查询（嵌套查询）。
7. **ORDER BY**：结果排序。
8. **LIMIT**：限制返回的行数。

### where

- `WHERE` 用于 **过滤表中符合条件的行**。
- 通常在 **SELECT、UPDATE、DELETE** 语句中使用。
- 不能直接用于分组后的聚合条件（这时用 `HAVING`）

基本语法：

```sql
SELECT 列名
FROM 表名
WHERE 条件
[ORDER BY 列名]
[LIMIT n];
```

条件类型

```sql
-- 比较运算符
=, <>, >, <, >=, <=

SELECT name, salary
FROM employee
WHERE salary > 5000;

-- 范围条件（BETWEEN ... AND ...）
-- 查询工资在 4000 到 8000 之间的员工
SELECT name, salary
FROM employee
WHERE salary BETWEEN 4000 AND 8000;

-- 集合条件（IN / NOT IN）
-- 查询 IT 和 HR 部门的员工
SELECT name, dept
FROM employee
WHERE dept IN ('IT', 'HR');

-- 模糊匹配（LIKE）
-- 查询名字以 'A' 开头的员工
SELECT name
FROM employee
WHERE name LIKE 'A%';

-- 空值判断（IS NULL / IS NOT NULL）
-- 查询没有部门的员工
SELECT name, dept_id
FROM employee
WHERE dept_id IS NULL;

-- 逻辑运算符（AND / OR / NOT）
-- 查询 IT 部门且工资大于 6000 的员工
SELECT name, dept, salary
FROM employee
WHERE dept = 'IT' AND salary > 6000;
```



### ON

- `ON` 用于 **连接表时指定匹配条件**（通常是主键与外键对应）。
- 主要用于：`INNER JOIN`、`LEFT JOIN`、`RIGHT JOIN`、`FULL JOIN`。
- 作用：**定义连接的逻辑条件**，决定哪些行可以匹配。
- 在 SQL 中，**直接写 `JOIN` 或 `INNER JOIN`**，默认是 **内连接（Inner Join）**，既不是左连接也不是右连接。

> 与 `WHERE` 区别：
>
> - `ON` 控制表之间的连接逻辑。
> - `WHERE` 控制结果集行的过滤。
> - 对外连接（LEFT/RIGHT JOIN）特别重要，因为 `WHERE` 可能会把原本 NULL 的行过滤掉。

基本语法

```sql
SELECT 表1.列名, 表2.列名, ...
FROM 表1
JOIN 表2
ON 表1.列名 = 表2.列名
[WHERE 条件]
[GROUP BY ...]
[HAVING ...]
[ORDER BY ...];

```

使用示例

```sql
-- 内连接（INNER JOIN）
-- 只显示 有匹配部门的员工
-- 不匹配的行不会显示
SELECT e.name, d.dept_name
FROM employee e
INNER JOIN department d
ON e.dept_id = d.id;


-- 右连接（RIGHT JOIN）
-- 显示 所有部门
-- 如果部门没有员工，name 为 NULL
SELECT e.name, d.dept_name
FROM employee e
RIGHT JOIN department d
ON e.dept_id = d.id;


-- 多条件连接
-- 连接条件不仅要求部门匹配，还要求员工工资大于 5000
SELECT e.name, d.dept_name
FROM employee e
JOIN department d
ON e.dept_id = d.id AND e.salary > 5000;

```

使用技巧

- **外连接时要用 ON 而不是 WHERE**，避免把 `NULL` 行过滤掉
- 可以在 ON 中使用 **多个条件**（用 AND / OR）
- 配合别名使用更清晰：

```sql
SELECT e.name, d.dept_name
FROM employee AS e
JOIN department AS d
ON e.dept_id = d.id;
```



### group By

- `GROUP BY` 子句通常要 **结合聚合函数** 一起使用（比如 `COUNT()`、`SUM()`、`AVG()`、`MAX()`、`MIN()`）

**表结构**

```sql
create table employee (
    id int primary key auto_increment,
    name varchar(50),
    dept varchar(50),
    job varchar(50),
    salary decimal(10,2)
);

CREATE TABLE department (
    id INT PRIMARY KEY AUTO_INCREMENT,
    dept_name VARCHAR(50)
);

```

```sql
-- 插入员工数据
insert into employee (name, dept, job, salary) values
('Alice',  'IT', 'Developer', 6000),
('Bob',    'IT', 'Developer', 7000),
('Cathy',  'IT', 'Manager',   12000),
('David',  'HR', 'Recruiter', 5000),
('Ella',   'HR', 'Manager',   9000),
('Frank',  'HR', 'Recruiter', 4000),
('Grace',  'Sales', 'Salesman', 3000),
('Helen',  'Sales', 'Salesman', 3500),
('Ivy',    'Sales', 'Manager', 10000),
('Jack',   'Finance', 'Accountant', 8000),
('Kate',   'Finance', 'Manager',    9500);

-- 插入部门数据
INSERT INTO department (dept_name) VALUES
('IT'),
('HR'),
('Sales'),
('Finance');
```

`GROUP BY` 使用示例：

```sql
-- 分组,通常结合聚合函数来使用
-- 统计每个部门的人数
select dept, count(*) as emp_count
from employee
group by dept;

-- 统计每个部门的平均工资
select dept, avg(salary) as avg_salary
from employee
group by dept;

-- 统计每个部门的最高工资
select dept, max(salary) as max_salary
from employee
group by dept;

-- 按职位统计总工资
select job, sum(salary) as total_salary
from employee
group by job;

-- 语法总结
select 分组字段, 聚合函数(列)
from 表
[where 条件]
group by 分组字段
[having 条件];   -- 对分组结果过滤
```

### HAVING

- `HAVING` 用于 **分组后的结果集** 进行过滤。
- 通常和 **`GROUP BY`** 一起使用。
- 可以使用 **聚合函数**（如 `COUNT()`、`SUM()`、`AVG()` 等）进行条件判断。

语法：

```sql
SELECT 列名, 聚合函数(列名)
FROM 表名
[WHERE 条件]         -- 可选：分组前过滤
GROUP BY 列名
HAVING 聚合函数条件  -- 对分组后的结果过滤
[ORDER BY 列名]      -- 可选：排序

```

```sql
-- 按部门统计员工人数，并筛选人数大于 2 的部门

SELECT dept, COUNT(*) AS emp_count
FROM employee
GROUP BY dept
HAVING COUNT(*) > 2;

-- 统计部门平均工资，筛选平均工资 > 6000 的部门
SELECT dept, AVG(salary) AS avg_salary
FROM employee
GROUP BY dept
HAVING AVG(salary) > 6000;

-- WHERE + HAVING 结合使用
-- 只统计 IT 和 HR 部门员工，筛选人数 > 2
SELECT dept, COUNT(*) AS emp_count
FROM employee
WHERE dept IN ('IT', 'HR')    -- 分组前过滤原始行
GROUP BY dept
HAVING COUNT(*) > 2;          -- 分组后过滤结果

```

### ORDER BY

- `ORDER BY` 用于 **对查询结果进行排序**。
- 可以按 **一个或多个列** 排序，默认升序（ASC）。
- 可以和 `SELECT`、`WHERE`、`GROUP BY`、`HAVING` 配合使用。

基本语法

```sql
SELECT 列名1, 列名2, ...
FROM 表名
[WHERE 条件]
[GROUP BY 列名]
[HAVING 条件]
ORDER BY 列名1 [ASC|DESC], 列名2 [ASC|DESC], ...;
```

使用示例

```sql
-- 按单列升序
-- 按工资升序排列
SELECT name, salary
FROM employee
ORDER BY salary ASC;

-- 按单列降序
-- 按工资降序排列
SELECT name, salary
FROM employee
ORDER BY salary DESC;

-- 按多列排序
-- 先按部门升序，再按工资降序
SELECT name, dept, salary
FROM employee
ORDER BY dept ASC, salary DESC;

-- 与 GROUP BY / HAVING 结合使用
-- 按部门统计员工人数，并按人数降序排列
SELECT dept, COUNT(*) AS emp_count
FROM employee
GROUP BY dept
HAVING COUNT(*) > 1
ORDER BY emp_count DESC;

-- 使用列索引排序
-- SELECT 的第 2 列按降序排列
SELECT name, salary
FROM employee
ORDER BY 2 DESC;
```

### LIMIT

- `LIMIT` 用于 **限制查询返回的行数**。
- 常用于分页查询或只取前 N 条记录。

基本语法：

```sql
-- 只限制返回行数
SELECT 列名1, 列名2
FROM 表名
LIMIT 行数;


-- 指定偏移量 + 返回行数
SELECT 列名1, 列名2
FROM 表名
LIMIT 偏移量, 行数;   -- MySQL 写法

```

使用示例

```sql
-- 取前 5 条员工记录
SELECT name, salary
FROM employee
ORDER BY salary DESC
LIMIT 5;

-- 取第 6 到第 10 条员工记录
SELECT name, salary
FROM employee
ORDER BY salary DESC
LIMIT 5, 5;   -- 偏移 5 行，取 5 行

-- 与分页结合
-- 第 page 页，每页 page_size 条
SET @page = 2;
SET @page_size = 3;

SELECT name, dept, salary
FROM employee
ORDER BY salary DESC
LIMIT (@page-1)*@page_size, @page_size;


-- 与 GROUP BY / HAVING / ORDER BY 结合
-- 按部门统计员工人数，筛选人数>1，按人数降序，取前 3 个部门
SELECT dept, COUNT(*) AS emp_count
FROM employee
GROUP BY dept
HAVING COUNT(*) > 1
ORDER BY emp_count DESC
LIMIT 3;

```

使用技巧

- **必须配合 ORDER BY 才有确定性**，否则返回的前 N 行可能是随机的。
- **分页查询**常用 `LIMIT 偏移量, 行数` 或 `LIMIT 行数 OFFSET 偏移量`。
- 与 `GROUP BY` / `HAVING` / `ORDER BY` 结合，可以快速取**分组统计结果的前几条**。

### 子查询

子查询是指在一个 SQL 语句中嵌套另一个 `SELECT` 语句。嵌套中的SQL语句先执行。

**表结构：**

```sql
-- 表结构
CREATE TABLE student (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50),
  sex CHAR(1),
  age INT
);

-- 考试表
CREATE TABLE exam (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT,
  subject VARCHAR(50),
  score INT,
  FOREIGN KEY (student_id) REFERENCES student(id)
);

-- 插入数据
INSERT INTO student (name, sex, age) VALUES
('张三', 'M', 20),
('李四', 'M', 22),
('王五', 'F', 21),
('赵六', 'F', 23);

-- 插入考试成绩：
INSERT INTO exam (student_id, subject, score) VALUES
(1, '数学', 85),
(1, '英语', 90),
(2, '数学', 76),
(2, '英语', 88),
(3, '数学', 92),
(3, '英语', 95),
(4, '数学', 70),
(4, '英语', 80);

```

📌 `SELECT` 子句中嵌套子查询

```sql
-- 标量子查询：查询每个学生 + 全部考试的最高分
SELECT 
  name,
  (SELECT MAX(score) FROM exam) AS max_score
FROM student;

-- 相关子查询：查询每个学生的最高成绩，两表联查。
SELECT 
  s.name,
  (SELECT MAX(e.score) 
   FROM exam e 
   WHERE e.student_id = s.id) AS max_score
FROM student s;

-- 表子查询：只查询最高分的学生
SELECT 
  s.name, 
  e.score
FROM student s
JOIN exam e ON s.id = e.student_id
WHERE e.score = (SELECT MAX(score) FROM exam);

-- 查询各科最高分的学生（子查询+GROUP BY+JOIN）
-- 子查询：按 subject 分组，取每门课的最高分。
-- 外层：再跟 exam + student 表 JOIN，查出具体是哪位学生。
SELECT 
  e.subject,
  s.name,
  e.score
FROM exam e
JOIN student s ON e.student_id = s.id
JOIN (
  SELECT subject, MAX(score) AS max_score
  FROM exam
  GROUP BY subject
) t ON e.subject = t.subject AND e.score = t.max_score;

```

📌 `WHERE / HAVING` 中嵌套子查询

用于条件过滤，条件中的子查询先执行。

```sql
-- 查询比平均分高的学生
SELECT name, score 
FROM exam 
WHERE score > (SELECT AVG(score) FROM exam);
```

📌 `EXISTS` 型子查询

用于判断是否存在相关记录（布尔值）：根据子查询的查询结果，如果存在则查询，否则则不查询。

```sql
-- 查询有成绩记录的学生
SELECT name 
FROM student s
WHERE EXISTS (SELECT 1 FROM exam e WHERE e.student_id = s.id);

-- SELECT 1 代表的意思是 不返回表中的字段，而是固定输出数字 1，每匹配一行，就输出一行 1


```

📌 `FROM` 子句中嵌套子查询（派生表）

把子查询结果当作一张临时表：

```sql
-- 查询每个部门工资最高的员工
SELECT dept, name, salary
FROM (
    SELECT dept, name, salary,
           RANK() OVER(PARTITION BY dept ORDER BY salary DESC) AS rnk
    FROM employee
) t
WHERE rnk = 1;

```

总结：

- **`WHERE/HAVING` 子查询** 👉 用于筛选
- **`EXISTS` 子查询** 👉 用于存在性判断
- **`SELECT` 子查询** 👉 用于生成列值
- **`FROM` 子查询** 👉 临时表 / 派生表

## 面试问题

**WHERE 和 HAVING 的区别** 

- WHERE：对 原始数据行 进行过滤，不能用聚合函数。

- HAVING：对 分组结果 进行过滤，可以用聚合函数。

一句话总结：

- `WHERE` 是分组之前的过滤条件。
- `HAVING` 是分组之后的过滤条件。
- 一般先用 `WHERE` 粗过滤，再用 `HAVING` 精过滤。

示例：

表结构

```sql
create table employee (
    id int primary key auto_increment,
    name varchar(50),
    dept varchar(50),
    job varchar(50),
    salary decimal(10,2)
);

CREATE TABLE department (
    id INT PRIMARY KEY AUTO_INCREMENT,
    dept_name VARCHAR(50)
);

```

```sql
-- 插入员工数据
insert into employee (name, dept, job, salary) values
('Alice',  'IT', 'Developer', 6000),
('Bob',    'IT', 'Developer', 7000),
('Cathy',  'IT', 'Manager',   12000),
('David',  'HR', 'Recruiter', 5000),
('Ella',   'HR', 'Manager',   9000),
('Frank',  'HR', 'Recruiter', 4000),
('Grace',  'Sales', 'Salesman', 3000),
('Helen',  'Sales', 'Salesman', 3500),
('Ivy',    'Sales', 'Manager', 10000),
('Jack',   'Finance', 'Accountant', 8000),
('Kate',   'Finance', 'Manager',    9500);

-- 插入部门数据
INSERT INTO department (dept_name) VALUES
('IT'),
('HR'),
('Sales'),
('Finance');
```

HAVING示例

```sql
-- 统计每个部门人数，筛选人数大于 2 的部门

select dept, count(*) as emp_count
from employee
group by dept
having count(*) > 2;

```

### 
