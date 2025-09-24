import { createRouter, createWebHistory } from "vue-router";

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
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
