<template>
  <div
    class="border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all flex flex-col items-center relative"
  >
    <div
      v-if="type === 'edit'"
      class="absolute top-2 right-2 cursor-pointer hover:text-red-500"
      @click="emits('delete')"
    >
      <CloseCircleOutlined />
    </div>

    <img
      v-if="imgUrl"
      :src="imgUrl"
      alt="商品图"
      class="w-32 h-24 object-cover rounded mb-2"
      onerror="this.src='https://via.placeholder.com/128x96?text=无图片'"
    />
    <div
      v-else
      class="w-32 h-24 bg-gray-100 rounded mb-2 flex items-center justify-center text-gray-400"
    >
      无图片
    </div>

    <div class="" v-if="type === 'view'">
      <div class="flex gap-2 items-center text-sm font-medium">
        产品名： {{ data.name }}
      </div>
      <div class="flex gap-2 items-center text-sm">
        优惠方式：{{
          {
            0: "原价",
            1: "尊享卡",
            2: "优惠券",
          }[data.vip]
        }}
      </div>
      <div class="flex gap-2 items-center text-sm">
        优惠券名字：{{ data.coupon || "无" }}
      </div>
    </div>

    <div v-else>
      <div class="flex gap-2 items-center w-full px-2 mb-2 text-sm font-medium">
        产品名： {{ data.name }}
      </div>
      <div class="flex gap-2 items-center w-full px-2 mb-2">
        <div class="font-medium">优惠方式：</div>
        <a-select
          v-model:value="vip"
          show-search
          show-arrow
          placeholder="请选择"
          class="flex-1"
          :default-active-first-option="false"
          :show-arrow="false"
          :filter-option="false"
          :not-found-content="null"
          :options="[
            { value: 0, label: '原价' },
            { value: 1, label: '尊享卡' },
            { value: 2, label: '优惠券' },
          ]"
        ></a-select>
      </div>
      <div class="flex gap-2 items-center w-full px-2 mb-2">
        <div class="font-medium">优惠券名字：</div>
        <a-input
          v-model:value="coupon"
          class="flex-1"
          placeholder="输入优惠券名字"
        ></a-input>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getGoodsList } from "@/api";
import { PlusCircleOutlined, CloseCircleOutlined } from "@ant-design/icons-vue";

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  type: {
    type: String,
    default: "view",
  },
});
const emits = defineEmits(["delete"]);
const { vip, coupon } = toRefs(props.data);
const imgUrl = ref(props.data.img);

getGoodsList({
  keyword: props.data.name,
}).then((res) => {
  if (res.code === 0) {
    if (res.data.length > 0) {
      imgUrl.value = res.data[0].img;
    }
  }
});
</script>
