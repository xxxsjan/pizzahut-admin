<template>
  <a-input-number
    prefix="￥"
    v-model:value="displayValue"
    :min="min"
    :max="max"
    @blur="handleBlur"
  />
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from "vue";

// 定义组件名称
const __name = "ScaledNumberInput";

defineExpose({
  __name,
});

// 定义props
const props = defineProps({
  // 实际值（放大100倍后的值）
  modelValue: {
    type: Number,
    default: 0,
  },
  // 占位提示文字
  placeholder: {
    type: String,
    default: "请输入数字",
  },
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 99999,
  },
  allowDecimal: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const displayValue = ref("");
const errorMessage = ref("");

watch(
  () => props.modelValue,
  (val) => {
    displayValue.value = val / 100;
  },
  { immediate: true }
);

// 失去焦点时格式化显示
const handleBlur = (e) => {
  const inputValue = e.target.value;
  console.log("inputValue: ", inputValue);

  // 空值处理
  if (inputValue === "") {
    emit("update:modelValue", 0);
    return;
  }

  // 转换为数字
  const num = Number(inputValue);

  // 非数字校验
  if (isNaN(num)) {
    errorMessage.value = "请输入有效的数字";
    return;
  }

  // 小数校验
  if (!props.allowDecimal && !Number.isInteger(num)) {
    errorMessage.value = "请输入整数";
    return;
  }

  // 范围校验
  if (num < props.min || num > props.max) {
    errorMessage.value = `请输入${props.min}至${props.max}之间的数字`;
    return;
  }

  // 计算实际值（放大100倍）并emit
  const actualValue = num * 100;
  emit("update:modelValue", actualValue);
};
</script>

<style scoped></style>
