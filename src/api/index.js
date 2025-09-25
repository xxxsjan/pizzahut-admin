import request from "@/utils/request";
/**
 * 关键词查询数据库商品
 * @param {Object} params - 请求参数对象
 * @param {string} params.keyword - 搜索关键词
 * @returns
 */
export const getGoodsList = (params) => {
  return request.get("/goods/getGoodsList", {
    params,
  });
};

/**
 * 更新商品数据库
 * @param {Object} params - 请求参数对象
 * @param {string} params.storeCode - 店铺代码
 * @returns
 */
export const updateGoodsDB = (params) => {
  return request.get("/goods/updateGoodsDB", {
    params,
  });
};

/**
 * 更新商品信息
 * @param {Object} params - 请求参数对象
 * @param {string} params.linkId - 商品linkId
 * @param {string} params.name - 商品名称（可选）
 * @param {number} params.price - 商品价格（可选）
 * @returns
 */
export const updateGoodsName = (params) => {
  return request.post("/goods/updateGoodsName", params);
};

/**
 * 删除商品
 * @param {Object} params - 请求参数对象
 * @param {string} params.linkId - 商品linkId
 * @returns
 */
export const deleteGoods = (params) => {
  return request.delete("/goods/deleteGoods", {
    params,
  });
};

/**
 * 获取套餐列表
 * @param {Object} params - 请求参数对象
 * @param {string} params.keyword - 搜索关键词
 * @param {string|number} params.pageNum - 页码
 * @param {string|number} params.pageSize - 每页数量
 * @param {string} params.packageId - 套餐ID
 * @returns
 */
export const getPackageList = (params) => {
  return request.get("/package/getPackageList", {
    params,
  });
};

/**
 * 添加套餐
 * @param {Object} params - 请求参数对象
 * @param {Object} params.packageDetail - 套餐详情对象
 * @param {string} params.packageName - 套餐名称
 * @returns
 */
export const addPackage = (params) => {
  return request.post("/package/addPackage", params);
};
/**
 * 更新套餐
 * @param {Object} params - 请求参数对象
 * @param {Object} params.packageDetail - 套餐详情对象
 * @param {string} params.packageName - 套餐名称
 * @param {string} params.packageId - 套餐ID
 * @returns
 */
export const updatePackage = (params) => {
  return request.post("/package/updatePackage", params);
};
/**
 * 删除套餐
 * @param {Object} params - 请求参数对象
 * @param {string|number} params.id - 套餐ID
 * @returns
 */
export const deletePackage = (params) => {
  return request.delete("/package/deletePackage", {
    params,
  });
};

/**
 * 获取用户列表
 * @param {Object} params - 请求参数对象
 * @param {string|number} params.pageNum - 页码
 * @param {string|number} params.pageSize - 数量
 * @param {string|number} params.vip - VIP标识
 * @param {string|number} params.minBalance - 最小余额
 * @param {string|number} params.maxBalance - 最大余额
 * @param {string} params.phone - 手机号
 * @returns
 */
export const getUserList = (params) => {
  return request.get("/users/getUserList", {
    params,
  });
};

/**
 * 获取一个用户
 * @param {Object} params - 请求参数对象
 * @param {string|number} params.vip - 是否为尊享卡会员标识
 * @returns
 */
export const getUser = (params) => {
  return request.get("/users/getToken", {
    params,
  });
};

/**
 * 添加用户
 * @param {Object} params - 请求参数对象
 * @param {string} params.phone - 手机号
 * @param {string} params.token - 用户令牌
 * @returns
 */
export const addUser = (params) => {
  return request.post("/users/addUser", params);
};

/**
 * 删除账号
 * @param {Object} params - 请求参数对象
 * @param {string|number} params.id - 账号ID
 * @returns
 */
export const deleteUser = (params) => {
  return request.delete("/users/deleteUser", {
    params,
  });
};

/**
 * 切换用户状态
 * @param {Object} params - 请求参数对象
 * @param {string} params.token - 用户token
 * @returns
 */
export const switchStatus = (params) => {
  return request.post("/users/switchStatus", params);
};

/**
 * 获取卡密订单列表
 * @param {Object} params - 请求参数对象
 * @param {string|number} params.pageNum - 页码
 * @param {string|number} params.pageSize - 每页数量
 * @param {string} params.sn - 卡密
 * @param {string|number} params.status - 订单状态（0未使用，1已使用）
 * @returns
 */
export const getCardOrderList = (params) => {
  return request.get("/orders/getOrderList", {
    params,
  });
};
/**
 * 删除卡密订单
 * @param {Object} params - 请求参数对象
 * @param {string|number} params.id - 订单ID
 * @returns
 */
export const deleteCardOrder = (params) => {
  return request.delete("/orders/deleteOrder", {
    params,
  });
};

/**
 * 检测是否为尊享卡
 * @param {Object} params - 请求参数对象
 * @param {string} params.token - 登录令牌
 * @returns
 */
export const checkVip = (params) => {
  return request.get("/check_vip", {
    params,
  });
};
/**
 * 获得余额
 * @param {Object} params - 请求参数对象
 * @param {string} params.token - 登录令牌
 * @returns
 */
export const getBalance = (params) => {
  return request.get("/get_balance", {
    params,
  });
};
/**
 * 获得v金余额
 * @param {Object} params - 请求参数对象
 * @param {string} params.token - 登录令牌
 * @returns
 */
export const getVgold = (params) => {
  return request.get("/get_vgold", {
    params,
  });
};
/**
 * 查询优惠券
 * @param {Object} params - 请求参数对象
 * @param {string} params.token - 登录令牌
 * @returns
 */
export const queryCoupon = (params) => {
  return request.get("/query_coupon", {
    params,
  });
};
/**
 * 新建卡密订单
 * @param {Object} params - 请求参数对象
 * @param {string} params.packageId - 套餐ID
 * @returns
 */
export const addCardOrder = (params) => {
  return request.post("/orders/addOrder", params);
};

/**
 * 获取日志列表
 * @param {Object} params - 请求参数对象
 * @param {number} params.pageNum - 页码，从1开始，默认为1
 * @param {number} params.pageSize - 每页数量，默认为50，最大100
 * @param {string} params.logLevel - 日志级别过滤（DEBUG、INFO、WARNING、ERROR、CRITICAL）
 * @param {string} params.logType - 日志类型过滤（SYSTEM、USER_OP、ORDER、VIP、API等）
 * @param {string} params.moduleName - 模块名称过滤
 * @param {string} params.startTime - 开始时间，格式：YYYY-MM-DD HH:MM:SS
 * @param {string} params.endTime - 结束时间，格式：YYYY-MM-DD HH:MM:SS
 * @param {string} params.keyword - 关键词搜索
 * @returns
 */
export const getLogList = (params) => {
  return request.get("/logs/getLogList", {
    params,
  });
};

/**
 * 获取日志统计
 * @param {Object} params - 请求参数对象
 * @param {number} params.days - 统计天数，默认为7天，最大30天
 * @returns
 */
export const getLogStatistics = (params) => {
  return request.get("/logs/getStatistics", {
    params,
  });
};

/**
 * 批量添加手机号
 * @param {Object} params - 请求参数对象
 * @param {Array} params.phones - 手机号数组
 * @param {string} params.created_by - 创建者
 * @returns
 */
export const batchAddPhone = (params) => {
  return request.post("/phone/batchAdd", params);
};

/**
 * 获取手机号列表
 * @param {Object} params - 请求参数对象
 * @param {number} params.page_num - 页码
 * @param {number} params.page_size - 每页数量
 * @param {string} params.keyword - 关键词
 * @param {string} params.group_name - 分组名称
 * @param {number} params.status - 状态
 * @returns
 */
export const getPhoneList = (params) => {
  return request.get("/phone/list", {
    params,
  });
};

/**
 * 更新手机号记录
 * @param {Object} params - 请求参数对象
 * @param {number} params.phone_id - 手机号ID
 * @param {string} params.phone - 手机号
 * @param {string} params.name - 姓名
 * @param {number} params.status - 状态
 * @param {string} params.updated_by - 更新者
 * @returns
 */
export const updatePhone = (params) => {
  return request.post("/phone/update", params);
};

/**
 * 删除手机号记录
 * @param {Object} params - 请求参数对象
 * @param {number} params.phone_id - 手机号ID
 * @returns
 */
export const deletePhone = (params) => {
  return request.post("/phone/delete", params);
};

/**
 * 获取分组列表
 * @returns
 */
export const getPhoneGroups = () => {
  return request.get("/phone/groups");
};

/**
 * 获取Token监控状态
 * @returns
 */
export const getTokenMonitorStatus = () => {
  return request.get("/token-monitor/status");
};

/**
 * 启动Token监控
 * @returns
 */
export const startTokenMonitor = () => {
  return request.post("/token-monitor/start");
};

/**
 * 停止Token监控
 * @returns
 */
export const stopTokenMonitor = () => {
  return request.post("/token-monitor/stop");
};

/**
 * 获取过期用户列表
 * @returns
 */
export const getExpiredUsers = () => {
  return request.get("/token-monitor/expired-users");
};

/**
 * HTTP轮询接口 - 替代WebSocket
 * @param {Object} params - 请求参数对象
 * @param {number} params.last_version - 上次接收的消息版本号
 * @param {string} params.types - 消息类型过滤，默认'all'
 * @returns
 */
export const pollTokenMonitor = (params) => {
  return request.get("/token-monitor/poll", {
    params,
  });
};

/**
 * 获取轮询配置
 * @returns
 */
export const getPollConfig = () => {
  return request.get("/token-monitor/poll/config");
};

/**
 * 获取商品详情
 * @param {Object} data - 请求参数对象
 * @param {string} data.token
 * @param {string} data.thirdId  生成随机字符串作为 thirdId
 * @param {string} data.storeCode   当前订单的店铺代码
 * @param {string} data.linkId  商品的链接ID，用于获取具体商品详情
 * @returns
 */
export const getProductDetail = (data) => {
  return request.post("/scan/product/detail", data);
};

export const updateEnabledOptions = (data) => {
  return request.post("/goods/updateEnabledOptions", data);
};

export const getEnabledOptions = (params) => {
  return request.get("/goods/getEnabledOptions", {
    params,
  });
};
