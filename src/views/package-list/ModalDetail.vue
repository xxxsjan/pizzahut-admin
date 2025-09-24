<template>
  <a-modal
    v-model:open="open"
    title="套餐详情"
    @ok="handleOk"
    style="width: 1200px"
    destroy-on-close
    okText="保存"
    cancelText="取消"
    :okButtonProps="{ style: { display: 'none' } }"
  >
    <div class="text-base font-medium mb-4 flex">
      <span>套餐名：</span>
      <span> {{ currentPackage.packageName }}</span>
      <span class="ml-2">价格：</span>
      <span> {{ currentPackage.price }}</span>
    </div>
    <div
      class="border border-gray-200 rounded-lg p-4 shadow-md mb-4 transition-shadow"
      v-for="(pd, index) in currentPackage.packageDetail.group"
      :key="index"
    >
      <!-- 区域名标题加粗+颜色强调 -->
      <div class="flex items-center mb-3 text-lg font-semibold text-gray-800">
        区域名：{{ pd.groupName }}
      </div>

      <!-- 响应式网格布局（小屏1列，中屏2列，大屏4列） -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-2">
        <FoodItem
          v-for="(it, index) in pd.productList"
          :key="index"
          :data="it"
        />
      </div>
    </div>
    <div
      v-if="currentPackage.packageDetail.group.length === 0"
      class="text-center text-gray-500"
    >
      暂无套餐分组信息
    </div>
  </a-modal>
</template>

<script setup>
import FoodItem from "./FoodItem.vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  currentPackage: {
    type: Object,
    default: () => ({}),
  },
});

const open = defineModel();

const handleOk = async () => {
  open.value = false;
};
</script>
