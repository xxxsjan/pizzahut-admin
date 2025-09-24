<template>
  <a-config-provider :locale="locale">
    <a-layout style="height: 100vh">
      <!-- 顶部 Header -->
      <a-layout-header
        style="
          color: white;
          font-size: 24px;
          width: 100%;
          background-color: #001529;
        "
      >
        必胜客管理系统
      </a-layout-header>

      <!-- 左侧导航和主体内容 -->
      <a-layout>
        <!-- 左侧导航 -->
        <a-layout-sider width="256" class="site-layout-background">
          <a-menu
            mode="inline"
            theme="dark"
            :selectedKeys="[selectedKey]"
            @click="handleMenuClick"
          >
            <a-menu-item v-for="(item, index) in menuItems" :key="item.key">{{
              item.name
            }}</a-menu-item>

            <!-- <a-menu-item key="/store-directory">店铺管理</a-menu-item> -->
            <!-- <a-menu-item key="/package-manager">套餐管理</a-menu-item> -->
            <!-- <a-menu-item key="/card-secret-manager">卡密管理</a-menu-item> -->
            <!-- <a-menu-item key="/user-info">sid管理</a-menu-item> -->
            <!-- <a-menu-item key="/bulk_ordering">预约记录</a-menu-item> -->
            <!-- <a-menu-item key="/daily_profit">每日利润</a-menu-item> -->
            <!-- <a-menu-item key="/card-delente">卡密删除</a-menu-item> -->
          </a-menu>
        </a-layout-sider>

        <!-- 主要内容区域 -->
        <a-layout-content class="overflow-y-auto p-5">
          <router-view />
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-config-provider>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import zhCN from "ant-design-vue/es/locale/zh_CN";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
dayjs.locale("zh-cn");
const locale = zhCN;
const router = useRouter();
const route = useRoute();

const selectedKey = computed(() => {
  return route.path;
});
const menuItems = [
  {
    key: "/package-list",
    name: "套餐管理",
  },
  {
    key: "/user-list",
    name: "用户列表",
  },
  {
    key: "/order-list",
    name: "卡密订单管理",
  },
  {
    key: "/goods-list",
    name: "商品管理",
  },
  {
    key: "/log-list",
    name: "日志管理",
  },
  {
    key: "/phone-list",
    name: "手机号管理",
  },
];

const handleMenuClick = ({ key }) => {
  router.push(key);
};
</script>

<style>
.site-layout-background {
  background: #fff;
}

a-layout-header {
  background: #001529;
  width: 100%;
  color: white;
  font-size: 24px;
  line-height: 64px;
  padding-left: 20px;
}
</style>
