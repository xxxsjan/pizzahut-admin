import axios from "axios";
import { message } from "ant-design-vue";

// 创建axios实例
const service = axios.create({
  baseURL: "/api",
  timeout: 15000, // 请求超时时间
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data;
    // 兼容不同的成功状态码：0 和 200
    if (res.code !== 0 && res.code !== 200) {
      const msg = res.message || res.errMsg || "Error";
      // message.error(msg);
      return Promise.reject(new Error(msg));
    }
    return res;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default service;
