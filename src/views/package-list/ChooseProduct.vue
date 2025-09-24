<template>
  <a-modal
    v-model:open="open"
    title="添加产品"
    @ok="handleOk"
    style="width: 600px"
    destroy-on-close
    okText="保存"
    cancelText="取消"
  >
    <div class="mb-4">
      <a-form
        layout="inline"
        :model="formState"
        @finish="handleFinish"
        @finishFailed="handleFinishFailed"
      >
        <a-form-item>
          <a-input
            v-model:value="formState.keyword"
            placeholder="请输入产品名"
            allowClear
          >
            <!-- <template #prefix
            ><UserOutlined style="color: rgba(0, 0, 0, 0.25)"
          /></template> -->
          </a-input>
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit">查询</a-button>
        </a-form-item>
      </a-form>
    </div>
    <div class="space-y-2 max-h-[400px] overflow-y-auto">
      <div
        v-for="item in productList"
        :key="item.id"
        class="flex items-center p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
        :class="
          selectedId === item.id
            ? 'bg-blue-50 border-blue-500'
            : 'bg-white border-gray-200'
        "
        @click="selectedId = item.id"
      >
        <!-- 商品图片 -->
        <img
          :src="item.img"
          alt="商品图"
          class="w-16 h-12 object-cover rounded mr-4"
        />

        <!-- 商品信息 -->
        <div class="flex-1">
          <h3 class="text-sm font-medium">{{ item.name }}</h3>
          <p class="text-xs text-gray-600 mt-1">{{ item.desCn }}</p>
        </div>

        <!-- 选中状态图标 -->
        <div v-if="selectedId === item.id" class="text-blue-500">
          <CheckCircleOutlined />
        </div>
      </div>
    </div>
  </a-modal>
</template>
<script setup>
import { getGoodsList } from "@/api";
import { CheckCircleOutlined } from "@ant-design/icons-vue";
console.log("ChooseProduct");
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(["confirm"]);
const open = defineModel();
const formState = reactive({
  keyword: "",
});
const selectedId = ref(null);
const productList = ref([]);
const handleOk = () => {
  console.log("selectedId: ", selectedId);
  if (selectedId) {
    const selectedProduct = productList.value.find(
      (item) => item.id === selectedId.value
    );
    emits("confirm", selectedProduct);
  }
};
const handleFinish = async (values) => {
  try {
    const res = await getGoodsList({ keyword: formState.keyword });
    productList.value = res.data;
  } catch (err) {
    console.error("查询失败:", err);
  }
};
const handleFinishFailed = (errors) => {
  console.log(errors);
};
onMounted(() => {
  handleFinish();
});
</script>
