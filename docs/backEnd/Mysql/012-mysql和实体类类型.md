# mysql数据类型

mysql数据类型经过JDBC映射Java数据类型

## 类型映射

| MySQL 类型        | 范围/精度                      | Java 对应基本类型 | Java 包装类           | 推荐说明                                                     |
| ----------------- | ------------------------------ | ----------------- | --------------------- | ------------------------------------------------------------ |
| **TINYINT(1)**    | -128 ~ 127                     | `byte`            | `Byte`                | 如果是布尔用 `Boolean`（MySQL 里常用 `TINYINT(1)` 表示布尔） |
| **SMALLINT**      | -32,768 ~ 32,767               | `short`           | `Short`               | 小整数                                                       |
| **MEDIUMINT**     | -8,388,608 ~ 8,388,607         | `int`             | `Integer`             | 不常用，但一般映射 `Integer`                                 |
| **INT / INTEGER** | -2,147,483,648 ~ 2,147,483,647 | `int`             | `Integer`             | 常用整型                                                     |
| **BIGINT**        | -2^63 ~ 2^63-1                 | `long`            | `Long`                | 大整数                                                       |
| **DECIMAL(M,D)**  | 精确小数 (M 总位数, D 小数位)  | ❌                 | `BigDecimal`          | **推荐** 用 `BigDecimal`，避免精度丢失（特别是金额）         |
| **NUMERIC(M,D)**  | 同 DECIMAL                     | ❌                 | `BigDecimal`          | MySQL 中 `NUMERIC` == `DECIMAL`                              |
| **FLOAT(p)**      | 4 字节，近似值                 | `float`           | `Float`               | 不建议存钱，存在精度问题                                     |
| **DOUBLE / REAL** | 8 字节，近似值                 | `double`          | `Double`              | 科学计算可用，不建议存钱                                     |
| **BIT(M)**        | 位字段（M ≤ 64）               | ❌                 | `Boolean` 或 `byte[]` | `BIT(1)` → `Boolean`，`BIT(n)` → `byte[]`                    |

补充说明

**金额 / 精确数值**
 一定要用 `DECIMAL → BigDecimal`，不能用 `float/double`，否则会丢精度。

**布尔值**

- MySQL 没有专门的 `BOOLEAN` 类型。
- `BOOLEAN` 在 MySQL 里实际就是 `TINYINT(1)`。
- Java 里最好映射成 `Boolean`。

**大整数**

- 如果 `BIGINT` 已经不够（超过 Long 范围），就要用 `DECIMAL`，然后在 Java 里映射成 `BigDecimal` 或 `BigInteger`。

**无符号类型 (UNSIGNED)**

- MySQL 支持 `UNSIGNED`，但 Java 没有无符号基本类型。
- 比如 `BIGINT UNSIGNED` 范围到 2^64-1，超过 `Long`，只能用 `BigInteger`。

## 常用推荐映射

- **TINYINT(1)** → `Boolean`
- **INT** → `Integer`
- **BIGINT** → `Long`
- **DECIMAL** → `BigDecimal`
- **FLOAT/DOUBLE** → `Double`（非财务场景）