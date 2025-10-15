# ProjectThy-4

QQZone项目记录

## 数据库设计

![image-20251014101935564](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20251014101935564.png)

```sql
create database qqzonedb char set utf8;

use qqzonedb;

create table `t_user_basic`(
   `id` int(11) not null auto_increment,
   `loginId` varchar(20) not null ,
   `nickName` varchar(50) not null ,
   `pwd` varchar(20) not null ,
   `headImg` varchar(20) default null ,
   PRIMARY KEY (`id`),
   UNIQUE key `loginId` (`loginId`)
)engine = INNODB AUTO_INCREMENT=6 DEFAULT CHARSET =utf8;

insert into `t_user_basic` (id, loginId, nickName, pwd, headImg) values
 (1,'u0001','Aqua','123456','Aqua.png'),
 (2,'u0002','marin','123456','marin.png'),
 (3,'u0003','fbk','123456','fbk.png'),
 (4,'u0004','mio','123456','mio.png')

-- 定义外键约束（foreign key constraint）
-- PRIMARY KEY ('id') 定义主键
-- CONSTRAINT 'FK_detail_basic' 定义了一个外键约束的名字，叫做 FK_detail_basic
-- 这个名字是随便取的，用于区分和管理外键（方便以后修改或删除）
-- FOREIGN KEY ('id') REFERENCES 't_user_basic' ('id')
-- 当前表（比如 t_user_detail）的 id 列是一个外键
-- 它引用（对应）的是 t_user_basic 表里的 id 列
-- 外键约束的作用
-- 保证数据一致性（不能插入“孤立”的 detail 记录）
-- 防止误删（删除 t_user_basic 中的用户时，如果对应的 t_user_detail 还存在，会报错）

create table `t_user_detail`(
    `id` int(11) not null ,
    `realName` varchar(20) default null,
    `tel` varchar(11) default null,
    `email` varchar(30) default null,
    `birth` datetime default null,
    `star` varchar(10) default null,
    primary key (`id`),
    constraint `FK_detail_basic` foreign key (`id`) REFERENCES `t_user_basic` (`id`)
)engine = INNODB DEFAULT CHARSET =utf8;
-- KEY 'FK_friend_basic_uid' ('uid')
-- 这是在 uid 字段上建立一个普通索引（或辅助索引）它的作用是：
-- 提高根据 uid 查询的效率；
-- 为后面的外键约束提供索引支持（MySQL 要求外键列必须有索引）

-- CONSTRAINT 'FK_friend_basic_fid' FOREIGN KEY ('fid') REFERENCES 't_user_basic' ('id')
-- 定义了一个外键约束：当前表的 fid 字段,引用 t_user_basic 表的 id 字段。
-- fid 必须是 t_user_basic 表中已经存在的用户 ID，否则不能插入

-- FK_friend_basic_uid 这个确实是外键约束的名字（别名）:用于区分不同的外键约束;用于管理或修改外键
--
create table `t_friend` (
`id` int(11) not null auto_increment,
`uid` int(11) default null,
`fid` int(11) default null,
primary key (`id`),
key `FK_friend_basic_uid` (`uid`),
key `FK_friend_basic_fid` (`fid`),
constraint `FK_friend_basic_fid` foreign key (`fid`) references `t_user_basic` (`id`),
constraint `FK_friend_basic_uid` foreign key (`uid`) references `t_user_basic` (`id`)
) engine = INNODB AUTO_INCREMENT=11 DEFAULT CHARSET =utf8;

insert into `t_friend`(`id`,`uid`,`fid`) values
(1,1,2),
(2,1,3),
(3,1,4),
(4,2,3),
(5,2,4),
(6,3,4);

create table `t_topic`(
`id` int(11) not null auto_increment,
`title` varchar(100) not null ,
`content` varchar(500) not null ,
`topicDate` datetime not null ,
`author` int(11) not null ,
primary key (`id`),
key `FK_topic_basic` (`author`),
constraint `FK_topic_basic` foreign key (`author`) references `t_user_basic` (`id`)
)engine = INNODB AUTO_INCREMENT=4 DEFAULT CHARSET =utf8;

insert into `t_topic` (`id`,`title`,`content`,`topicDate`,`author`) values
(1,'我的空间已开通','Hello 我是 Aqua','2025-10-14 14:29:50',1);

create table `t_reply`(
`id` int(11) not null auto_increment,
`content` varchar(500) not null ,
`replyDate` DATETIME not null ,
`author` int(11) not null ,
`topic` int(11) not null ,
primary key (`id`),
key `FK_reply_basic` (`author`),
key `FK_reply_topic` (`topic`),
constraint `FK_reply_basic` foreign key (`author`) references `t_user_basic` (`id`),
constraint `FK_reply_topic` foreign key (`topic`) references `t_topic` (`id`)
)engine = INNODB AUTO_INCREMENT = 17 DEFAULT CHARSET utf8;

insert into `t_reply` (`id`,`content`,`replyDate`,`author`,`topic`) values
(1,'这里是回复2','2025-10-14 14:36:00',1,1),
(2,'这里是回复3','2025-10-14 14:37:00',1,2);

create table `t_host_reply`(
   `id` int(11) not null auto_increment,
   `content` varchar(500) not null ,
   `hostReplyDate` DATETIME not null ,
   `author` int(11) not null ,
   `reply` int(11) not null ,
   primary key (`id`),
   key `FK_host_basic` (`author`),
   key `FK_host_reply` (`reply`),
   constraint `FK_host_basic` foreign key (`author`) references `t_user_basic` (`id`),
   constraint `FK_host_reply` foreign key (`reply`) references `t_reply` (`id`)
)engine = INNODB AUTO_INCREMENT = 4 DEFAULT CHARSET utf8;

insert into `t_host_reply` (`id`,`content`,`hostReplyDate`,`author`,`reply`)
values(1,'这里是主人回复','2025-10-14 14:46:30',1,1);
```



## 封装Pojo

## 登陆功能