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
    <div
      v-for="(item, idx) in tempProduct.data.root.tdComboContentInfos"
      :key="item.roundName"
    >
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
            <ScaledNumberInput v-model="tc.price" />
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
import {
  getOptionsList,
  getConfigByList,
  objRemoveEmpty,
} from "@/views/package-list/utils/getOptionsList.js";
import ScaledNumberInput from "../components/ScaledNumberInput.vue";

import { usePackageEditStore } from "@/stores/packageEdit";
import { cleanGroupName } from "../utils/index.js";

const packageEditStore = usePackageEditStore();
const open = defineModel();

const props = defineProps({
  // linkId: {
  //   type: String,
  //   default: "",
  // },
  pData: {
    type: Object,
    default: () => {},
  },
  currentProduct: { type: Object, default: null },
});
const editOptionsModalVisible = ref(false);
const editOptionData = reactive({
  optionsList: [],
});
const tempProduct = ref({});

watch(
  () => props.currentProduct,
  (newVal) => {
    if (newVal) {
      tempProduct.value = JSON.parse(JSON.stringify(newVal));
    }
  },
  { immediate: true }
);
const getImgUrl = (linkId) => {
  const res = tempProduct.value;
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
    const s_linkId = `${idx}_${linkId}`;
    const p_s_linkId = props.pData.s_linkId;

    const res = await getOptionsList(linkId);
    if (!res.success) {
      return;
    }

    if (res) {
      // 解析goodsConfigs
      const draftConfig = packageEditStore.dialog.draftConfig[s_linkId] || {};
      const remoteConfig =
        packageEditStore.goodsConfigs[p_s_linkId]?.[s_linkId] || {};

      res.optionsList.forEach((item) => {
        const groupName = cleanGroupName(item.groupName);

        const data2 = draftConfig[groupName] || remoteConfig[groupName] || {};
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
  console.log("pData: ", props.pData);

  const s_linkId = curFood.value.s_linkId;
  const key = s_linkId;
  const configMap = objRemoveEmpty(getConfigByList(editOptionData.optionsList));

  const p_s_linkId = props.pData.s_linkId;
  console.log(packageEditStore.goodsConfigs);
  console.log("p_s_linkId: ", p_s_linkId);
  console.log("configMap: ", configMap);

  packageEditStore.pushDraftConfig(key, configMap, p_s_linkId);

  editOptionsModalVisible.value = false;
};

const handleOk = () => {
  console.log("handleOk");
  const p_s_linkId = props.pData.s_linkId;

  packageEditStore.mergeDraftConfig(
    p_s_linkId,
    JSON.parse(JSON.stringify(tempProduct.value.data.root.tdComboContentInfos))
  );

  open.value = false;
};
const afterClose = () => {
  console.log("afterClose");
  packageEditStore.closeEditDialog();
};
onMounted(() => {});
</script>
