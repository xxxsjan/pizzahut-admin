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
