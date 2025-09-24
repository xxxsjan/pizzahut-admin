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
import { reactive } from 'vue';
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

// 复制文本到剪切板
const copyToClipboard = async (text) => {
  try {
    // 优先使用现代的 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // 降级到传统方法
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('复制到剪切板失败:', err);
    return false;
  }
};

const handleOk = async () => {
  try {
    const res = await addCardOrder({
      packageId: props.record.id,
      count: form.count,
      autoPay: form.autoPay,
    });
    if (res.code === 0) {
      console.log('新建卡密订单成功，返回数据:', res.data);
      
      // 处理返回的卡密链接数据
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        // 将所有卡密链接合并成一个字符串，每行一个链接
        const cardLinks = res.data.join('\n');
        
        console.log('准备复制的卡密链接:', cardLinks);
        
        // 复制到剪切板
        const copySuccess = await copyToClipboard(cardLinks);
        
        if (copySuccess) {
          // 成功复制，显示详细信息
          const linkCount = res.data.length;
          const successMsg = linkCount === 1 
            ? `新建卡密订单成功！已自动复制卡密链接到剪切板` 
            : `新建卡密订单成功！已自动复制 ${linkCount} 个卡密链接到剪切板`;
          message.success(successMsg, 4); // 显示4秒
        } else {
          // 复制失败，提供备选方案
          message.warning("新建卡密订单成功，但自动复制失败，请手动复制以下链接：", 6);
          console.log('🔗 卡密链接 (请手动复制):', cardLinks);
          
          // 尝试显示一个包含链接的弹窗供用户手动复制
          Modal.info({
            title: '卡密链接',
            content: `请手动复制以下链接：\n\n${cardLinks}`,
            width: 600,
            okText: '已复制'
          });
        }
      } else {
        message.success("新建卡密订单成功");
        console.warn('未收到卡密链接数据:', res);
      }
      
      // 关闭弹窗
      open.value = false;
      emits("ok", form);
    }
  } catch (err) {
    console.error('新建卡密订单失败:', err);
    message.error("新建卡密订单失败");
  }
};
</script>
