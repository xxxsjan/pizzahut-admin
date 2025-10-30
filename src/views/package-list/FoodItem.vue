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
      <div class="flex gap-2 items-center text-sm">
        白名单：{{
          {
            0: "关闭",
            1: "启用",
          }[data.status]
        }}
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
      <div class="flex gap-2 items-center w-full px-2 mb-2">
        <div class="font-medium">白名单：</div>
        <a-select
          v-model:value="status"
          show-search
          show-arrow
          placeholder="请选择"
          class="flex-1"
          :default-active-first-option="false"
          :show-arrow="false"
          :filter-option="false"
          :not-found-content="null"
          :options="[
            { value: 0, label: '关闭' },
            { value: 1, label: '启用' },
          ]"
        ></a-select>
      </div>
      <div
        class="flex gap-2 items-center w-full px-2 mb-2 cursor-pointer text-blue-500 font-medium"
        @click="handleEdit"
      >
        编辑配料
      </div>
      <!-- {{ goodsConfigs }} -->
    </div>
  </div>
  <a-modal
    v-model:open="editOptionsModalVisible"
    title="编辑选项"
    @ok="handleEditOptionsSubmit"
    @cancel="editOptionsModalVisible = false"
    okText="保存"
    cancelText="取消"
  >
    <div
      v-for="(item, index) in editOptionData.optionsList || []"
      :key="index"
      class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow"
    >
      <div class=" ">
        <div
          class="text-lg font-medium text-gray-800 mb-3 pb-2 border-b border-gray-200"
        >
          {{ item.groupName }}
        </div>
        <a-checkbox-group v-model:value="item.value" class="w-full">
          <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-1">
            <div
              v-for="(td, tdIdx) in item.options"
              :key="tdIdx"
              class="p-1 rounded hover:bg-gray-100 transition-colors flex items-center justify-between"
            >
              <a-checkbox
                :value="td.value"
                class="text-gray-700 hover:text-primary transition-colors"
              >
                {{ td.label }}
              </a-checkbox>
              <ScaledNumberInput v-model="td.price" />
            </div>
          </div>
        </a-checkbox-group>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { getGoodsList } from "@/api";
import {
  getOptionsList,
  getConfigByList,
  objRemoveEmpty,
} from "@/views/package-list/utils/getOptionsList.js";
import { cleanGroupName } from "./utils/index.js";
import { PlusCircleOutlined, CloseCircleOutlined } from "@ant-design/icons-vue";
import ScaledNumberInput from "./ScaledNumberInput.vue";
import { message } from "ant-design-vue";

import { usePackageEditStore } from "@/stores/packageEdit";

const packageEditStore = usePackageEditStore();
const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  type: {
    type: String,
    default: "view",
  },
  idx: {
    type: Number,
    default: 0,
  },
});
const emits = defineEmits(["updateConfig"]);
const { vip, coupon, status } = toRefs(props.data);
const imgUrl = ref(props.data.img);
const linkId = ref(props.data.linkId);
const editOptionsModalVisible = ref(false);
const editOptionData = reactive({
  optionsList: [],
});
const handleEdit = async () => {
  const linkId = props.data.linkId;
  console.log("props: ", props);
  if (linkId) {
    const res = await getOptionsList(linkId);
    if (!res.success) {
      // message.error(res.msg);
      const s_linkId = props.data.s_linkId;
      console.log("s_linkId: ", s_linkId);
      emits("editPackage", { linkId, s_linkId });
      return;
    }

    if (res) {
      // 解析goodsConfigs
      const s_linkId = props.data.s_linkId;
      const key = s_linkId || `${props.idx}_${linkId}`;
      res.optionsList.forEach((item) => {
        const groupName = cleanGroupName(item.groupName);
        const data = packageEditStore.goodsConfigs[key] || {};
        const data2 = data[groupName] || {};
        item.value = Object.keys(data2);

        item.options = item.options.map((m) => {
          return {
            ...m,
            price: data2[m.label]?.price || 0,
          };
        });
      });

      editOptionData.optionsList = res.optionsList;
      editOptionsModalVisible.value = true;
    }
  }
};

if (!imgUrl.value || !linkId.value) {
  getGoodsList({
    keyword: props.data.name,
  }).then((res) => {
    if (res.code === 0) {
      if (res.data.length > 0) {
        // imgUrl.value = res.data[0].img;
        linkId.value = res.data[0].linkId;
      }
    }
  });
}

const handleEditOptionsSubmit = async () => {
  console.log("editOptionData.optionsList: ", editOptionData.optionsList);
  const params = {
    linkId: linkId.value,
    configs: getConfigByList(editOptionData.optionsList),
  };
  const s_linkId = props.data.s_linkId;
  const key = s_linkId || `${props.idx}_${linkId.value}`;
  console.log("修改配置", key, params.configs);

  const configMap = objRemoveEmpty(params.configs);

  emits("updateConfig", {
    key,
    value: configMap,
  });
  editOptionsModalVisible.value = false;
};
</script>
