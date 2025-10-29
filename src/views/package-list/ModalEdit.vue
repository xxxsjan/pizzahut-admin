<template>
  <a-modal
    v-model:open="open"
    :title="type === 'add' ? '新增套餐' : '编辑套餐'"
    @ok="handleOk"
    style="width: 1200px"
    destroy-on-close
    okText="保存"
    cancelText="取消"
    destroyOnClose
    :afterClose="afterClose"
  >
    <div class="text-base font-medium mb-4 flex items-center">
      <span>套餐名：</span>
      <div class="w-[200px]">
        <a-input v-model:value="packageName" placeholder="输入套餐名称" />
      </div>
      <span class="ml-2">价格：</span>
      <div class="w-[200px]">
        <a-input-number
          v-model:value="price"
          placeholder="请输入价格"
          style="width: 100%"
        />
      </div>
    </div>
    <div
      class="border border-gray-200 rounded-lg p-3 shadow-sm mb-4 relative"
      v-for="(pd, index) in packageDetail.group"
      :key="index"
    >
      <div
        class="absolute top-2 right-2 cursor-pointer hover:text-red-500"
        @click="handleDeleteArea(index)"
      >
        <CloseCircleOutlined />
      </div>
      <div class="flex items-center mb-2">
        <div>区域名：</div>
        <div>
          <a-input v-model:value="pd.groupName" placeholder="输入区域名称" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
        <FoodItem
          v-for="(item, index) in pd.productList"
          :key="index"
          :idx="index"
          :data="item"
          :goodsConfigs="props.currentPackage.goodsConfigs"
          type="edit"
          @delete="handleDeleteProduct(pd, index)"
          @updateConfig="handleUpdateConfig"
        />

        <div
          class="border border-dashed border-gray-600 rounded-md p-4 hover:border-sky-600 transition-colors flex justify-center items-center"
          @click="handleAddProduct(index)"
        >
          <PlusCircleOutlined style="color: #4b5563" />
        </div>
      </div>
    </div>
    <div
      class="border border-gray-300 rounded-md p-4 transition-colors hover:border-sky-600 flex justify-center items-center"
      @click="handleAddArea"
    >
      <PlusCircleOutlined style="color: #4b5563" />
    </div>
  </a-modal>
  <ChooseProduct v-model="showChoose" @confirm="onChoose" />
</template>

<script setup>
import { PlusCircleOutlined, CloseCircleOutlined } from "@ant-design/icons-vue";
import ChooseProduct from "./ChooseProduct.vue";
import { addPackage, updatePackage, getProductDetail } from "@/api";
import { message } from "ant-design-vue";
import FoodItem from "./FoodItem.vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: "view",
  },
  currentPackage: {
    type: Object,
    default: () => ({
      packageDetail: {
        group: [],
      },
    }),
  },
});
const emits = defineEmits(["confirm", "updateConfig"]);
const { packageDetail, packageName, price } = toRefs(props.currentPackage);
const open = defineModel();

const showChoose = ref(false);
const addIdx = ref();
const handleAddProduct = (idx) => {
  showChoose.value = true;
  addIdx.value = idx;
};

const handleAddArea = () => {
  packageDetail.value.group.push({
    groupName: "",
    productList: [],
  });
};
const handleOk = async () => {
  if (!packageName.value) {
    message.warn("请输入套餐名称");
    return;
  }
  if (packageDetail.value.group.find((f) => !Boolean(f.groupName))) {
    message.warn("区域名未填写");
    return;
  }
  const goodsConfigsMap = JSON.parse(
    JSON.stringify(props.currentPackage.goodsConfigs)
  );
  // console.log(
  //   Object.keys(goodsConfigsMap).map((key) => {
  //     console.log("key: ", key);
  //     // console.log(goodsConfigsMap[key]);
  //   })
  // );
  const params = {
    packageDetail: {
      group: packageDetail.value.group.map((item) => {
        return {
          groupName: item.groupName,
          amount: item.productList.length,
          productList: item.productList.map((it) => {
            return {
              name: it.name,
              vip: it.vip,
              coupon: it.coupon,
              status: it.status,
              img: it.img,
              linkId: it.linkId,
            };
          }),
        };
      }),
    },
    packageName: packageName.value,
    price: price.value,
    goodsConfigs: goodsConfigsMap,
  };
  if (props.type === "edit") {
    params.packageId = props.currentPackage.id;
  }
  const api = props.type === "add" ? addPackage : updatePackage;
  debugger;
  try {
    const res = await api(params);
    if (res.code === 0) {
      message.success("添加成功");
      emits("confirm");
      open.value = false;
    }
  } catch (error) {
    console.log(error);
  }
};
const handleDeleteProduct = (pd, productIndex) => {
  pd.productList.splice(productIndex, 1);
};

const onChoose = async (data) => {
  console.log("data: ", data);

  showChoose.value = false;
  packageDetail.value.group[addIdx.value].productList =
    packageDetail.value.group[addIdx.value].productList || [];
  packageDetail.value.group[addIdx.value].productList.push({
    ...data,
    vip: data.vip || 0,
    coupon: "",
  });
};
const afterClose = () => {
  // packageDetail.value.group = [];
  // packageName.value = "";
};
const handleDeleteArea = (index) => {
  packageDetail.value.group.splice(index, 1);
};

const handleUpdateConfig = (params) => {
  console.log("ModalEdit params: ", params);
  emits("updateConfig", params);
};
</script>
