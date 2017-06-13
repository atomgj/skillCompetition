CREATE TABLE `t_commodity` (
  `commodityId` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `price` varchar(100) DEFAULT NULL,
  `img` varchar(100) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `updateTime` varchar(100) DEFAULT NULL,
  `userId` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`commodityId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `t_like` (
  `userId` int(11) DEFAULT NULL,
  `commodityId` int(11) DEFAULT NULL,
  `updateTime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `t_role` (
  `userId` int(11) DEFAULT NULL,
  `type` int(11) DEFAULT NULL,
  `module` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `t_user` (
  `userId` int(11) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `role` varchar(100) NOT NULL DEFAULT '0',
  `mobile` int(11) DEFAULT NULL,
  PRIMARY KEY (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
