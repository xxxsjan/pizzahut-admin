<template>
  <a-modal
    v-model:open="open"
    title="新建卡密订单"
    @ok="handleOk"
    style="width: 400px"
    destroy-on-close
    okText="确认"
    cancelText="取消"
  >
    <a-form :form="form">
      <a-form-item label="数量" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-input-number v-model:value="form.count" />
      </a-form-item>
      <a-radio-group v-model:value="form.autoPay">
        <a-radio :value="1">支付</a-radio>
        <a-radio :value="0">不支付</a-radio>
      </a-radio-group>
    </a-form>
  </a-modal>
</template>

<script setup>
import { message, Modal } from "ant-design-vue";
import { getPackageList, deletePackage, addCardOrder } from "@/api";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  record: {
    type: Object,
    default: () => ({}),
  },
});

const emits = defineEmits(["ok"]);

const open = defineModel();
const form = reactive({
  count: 1,
  autoPay: 1,
});

const handleOk = async () => {
  try {
    const res = await addCardOrder({
      packageId: props.record.id,
      count: form.count,
      autoPay: form.autoPay,
    });
    if (res.code === 0) {
      console.log(res.data);
      message.success("新建卡密订单成功");
      emits("ok", form);
    }
  } catch (err) {
    message.error("新建卡密订单失败");
  }
};
</script>
