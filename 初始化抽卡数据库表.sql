-- 初始化抽卡数据库的脚本

-- "chouka"为数据库表名，请随意修改
CREATE TABLE `chouka` (
  -- ！以下信息请不要修改
  -- id请不要修改
  `id` INT(1) NOT NULL AUTO_INCREMENT,
  -- 用户摩点id
  `userid` VARCHAR(50) NOT NULL COMMENT '用户id',
  -- 用户摩点昵称
  `nickname` VARCHAR(50) NOT NULL COMMENT '用户昵称',
  -- 卡的信息
  `record` TEXT NOT NULL COMMENT '卡的数量，json格式',
  -- 积分
  `points` int(10) unsigned zerofill DEFAULT 0000000000 COMMENT '积分',
  INDEX `id` (`id`)
)
COMMENT='抽卡'
COLLATE='utf8_general_ci'
ENGINE=InnoDB;