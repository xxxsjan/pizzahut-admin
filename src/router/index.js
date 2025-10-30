import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";

const routes = [
  {
    path: "/",
    name: "store-directory",
    redirect: "/package-list",
  },
  {
    path: "/package-list",
    name: "package-list",
    component: () => import("../views/package-list/index.vue"),
  },
  {
    path: "/user-list",
    name: "user-list",
    component: () => import("../views/user-list/index.vue"),
  },
  {
    path: "/order-list",
    name: "order-list",
    component: () => import("../views/order-list/index.vue"),
  },
  {
    path: "/goods-list",
    name: "goods-list",
    component: () => import("../views/goods-list/index.vue"),
  },
  {
    path: "/log-list",
    name: "log-list",
    component: () => import("../views/log-list/index.vue"),
  },
  {
    path: "/phone-list",
    name: "phone-list",
    component: () => import("../views/phone-list/index.vue"),
  },
];

const router = createRouter({
  // 强制使用hash模式，避免宝塔服务器路由问题
  history: createWebHashHistory(),
  routes,
});

export default router;
