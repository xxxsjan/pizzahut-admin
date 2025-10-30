<template>
  <a-modal
    v-model:open="open"
    title="编辑套餐"
    @ok="handleOk"
    style="width: 1200px"
    :destroyOnClose="true"
    okText="保存"
    cancelText="取消"
    destroyOnClose
    :afterClose="afterClose"
  >
    <div v-for="(item, idx) in tdComboContentInfos" :key="item.roundName">
      <div
        class="text-lg font-bold text-gray-800 mb-2 pb-1 border-b border-gray-200"
      >
        {{ item.roundName }}
      </div>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
        <div
          v-for="tc in item.tdComboContentInfo"
          :key="tc.linkId"
          class="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 text-gray-700 flex"
        >
          <img
            :src="getImgUrl(tc.linkId)"
            alt="套餐图片"
            class="w-12 h-12 rounded-full inline-block mr-2"
          />
          <div>
            {{ tc.comboContentName }}
            <div
              @click="handleEdit(tc, idx)"
              class="text-blue-500 cursor-pointer"
            >
              编辑
            </div>
          </div>
        </div>
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
  </a-modal>
</template>

<script setup>
import { onMounted, toRaw, watch } from "vue";
import { getProductDetail } from "@/api";
import {
  getOptionsList,
  getConfigByList,
  objRemoveEmpty,
} from "@/views/package-list/utils/getOptionsList.js";

import { usePackageEditStore } from "@/stores/packageEdit";
import { cleanGroupName } from "../utils/index.js";

const packageEditStore = usePackageEditStore();
const open = defineModel();
const tdComboContentInfos = ref([]);

const resData = ref({});
const props = defineProps({
  linkId: {
    type: String,
    default: "",
  },
  packageEditData: {
    type: Object,
    default: () => {},
  },
});
const editOptionsModalVisible = ref(false);
const editOptionData = reactive({
  optionsList: [],
});
watch(
  () => props.linkId,
  (newVal) => {
    if (newVal) {
      getProductDetail({
        linkId: newVal,
      }).then((res) => {
        console.log("res: ", res);
        resData.value = res;

        const root = res.data.root || {};

        tdComboContentInfos.value = root.tdComboContentInfos || [];
      });
    }
  }
);

const getImgUrl = (linkId) => {
  const res = resData.value;
  const data = res.data.productGroup[linkId] || res.data.menus[linkId];
  return data?.imgUrl || "";
};
const curFood = ref({});
const handleEdit = async (tc, idx) => {
  const linkId = tc.linkId;
  curFood.value = {
    ...toRaw(tc),
    s_linkId: `${idx}_${linkId}`,
  };
  if (linkId) {
    const res = await getOptionsList(linkId);
    if (!res.success) {
      // emits("editPackage", linkId);
      return;
    }

    if (res) {
      // 解析goodsConfigs
      const key = `${idx}_${linkId}`;
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

const handleEditOptionsSubmit = () => {
  console.log(curFood);
  console.log("packageEditData: ", props.packageEditData);

  // packageEditStore
  console.log(packageEditStore.goodsConfigs);

  const s_linkId = curFood.value.s_linkId;
  const key = s_linkId;
  const configMap = objRemoveEmpty(getConfigByList(editOptionData.optionsList));

  // emits("updateConfig", {
  //   key,
  //   value: configMap,
  // });
};

const handleOk = () => {
  console.log("handleOk");
};
const afterClose = () => {
  console.log("afterClose");
};
onMounted(() => {});
</script>
