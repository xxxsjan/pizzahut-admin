<template>
  <div class=" ">
    <!-- 搜索表单 -->
    <div class="mb-4">
      <a-form layout="inline" @submit.prevent="() => handleSearch()">
        <a-form-item label="卡密">
          <a-input
            v-model:value="searchForm.sn"
            placeholder="请输入卡密"
            style="width: 200px"
          />
        </a-form-item>

        <a-form-item label="订单状态">
          <a-select
            v-model:value="searchForm.status"
            placeholder="请选择状态"
            style="width: 200px"
            allowClear
          >
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="0">未使用</a-select-option>
            <a-select-option value="1">已使用</a-select-option>
            <a-select-option value="2">待支付</a-select-option>
            <a-select-option value="4">已支付</a-select-option>
            <a-select-option value="3">已退款</a-select-option>
          </a-select>
        </a-form-item>

        <a-space>
          <a-button type="primary" html-type="submit">搜索</a-button>
          <a-button @click="handleReset">重置</a-button>
        </a-space>
      </a-form>
    </div>

    <!-- 批量操作按钮 -->
    <div class="batch-operations" v-if="selectedRowKeys.length > 0">
      <a-space>
        <a-alert
          :message="`已选择 ${selectedRowKeys.length} 项`"
          type="info"
          show-icon
          closable
          @close="clearSelection"
        />
        <a-button type="primary" @click="handleBatchCopy">
          <template #icon>
            <CopyOutlined />
          </template>
          批量复制卡密
        </a-button>
        <a-button type="primary" danger @click="handleBatchDelete">
          <template #icon>
            <DeleteOutlined />
          </template>
          批量删除
        </a-button>
      </a-space>
    </div>

    <!-- 订单表格 -->
    <a-card>
      <a-table
        :columns="columns"
        :data-source="orderList"
        :loading="loading"
        :pagination="false"
        :row-selection="rowSelection"
        row-key="id"
        size="middle"
      >
        <template #status="{ record }">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>
        <template #operation="{ record }">
          <div class="flex gap-2">
            <a-button type="primary" danger @click="handleDelete(record)"
              >删除</a-button
            >
          </div>
        </template>
      </a-table>

      <!-- 分页组件 -->
      <div class="mt-2">
        <a-pagination
          class="mt-4"
          :current="pagination.current"
          :pageSize="pagination.pageSize"
          :total="pagination.total"
          @change="handlePageChange"
          @showSizeChange="handlePageSizeChange"
          showSizeChanger
          showQuickJumper
          :pageSizeOptions="['10', '20', '50']"
        />
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { getCardOrderList, deleteCardOrder } from "@/api"; // 假设已定义订单列表接口
import dayjs from "dayjs"; // 需要安装dayjs依赖
import { message, Modal } from "ant-design-vue";
import { CopyOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import { reactive, ref, onMounted, computed } from "vue";

// 搜索表单状态
const searchForm = reactive({
  sn: "", // 卡密
  status: "", // 订单状态（1已使用，2待支付，3已支付，4已退款）
});

// 表格数据状态
const orderList = ref([]);
const loading = ref(false);

// 分页状态
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
});

// 多选状态
const selectedRowKeys = ref([]);
const selectedRows = ref([]);

// 行选择配置
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys, rows) => {
    selectedRowKeys.value = keys;
    selectedRows.value = rows;
  },
  onSelectAll: (selected, rows, changeRows) => {
    console.log('全选状态:', selected, '当前行:', rows, '变化行:', changeRows);
  },
}));

// 表格列配置
const columns = [
  {
    title: "订单ID",
    dataIndex: "orderId",
    width: 220,
  },
  {
    title: "卡密",
    dataIndex: "sn",
    width: 150,
  },
  {
    title: "订单状态",
    dataIndex: "status",
    width: 120,
    slots: { customRender: "status" },
  },
  {
    title: "创建时间",
    dataIndex: "createTime",
    width: 180,
    customRender: ({ record }) => {
      return dayjs(record.createTime).subtract(8, 'hour').format("YYYY-MM-DD HH:mm:ss");
    },
  },
  {
    title: "更新时间",
    dataIndex: "updateTime",
    width: 180,
    customRender: ({ record }) => {
      return dayjs(record.updateTime).subtract(8, 'hour').format("YYYY-MM-DD HH:mm:ss");
    },
  },
  {
    title: "操作",
    dataIndex: "operation",
    width: 50,
    slots: { customRender: "operation" },
  },
];

// 获取状态文本
const getStatusText = (status) => {
  // 如果status为空、null、undefined或0，显示"未使用"
  if (!status || status === '0' || status === 0) {
    return '未使用';
  }
  
  // 转换为数字以确保匹配
  const statusNum = parseInt(status);
  const statusMap = {
    1: '已使用',
    2: '待支付', 
    3: '已退款',
    4: '已支付'
  };
  return statusMap[statusNum] || `未知状态(${status})`;
};

// 获取状态颜色
const getStatusColor = (status) => {
  // 如果status为空、null、undefined或0，显示灰色（未使用）
  if (!status || status === '0' || status === 0) {
    return 'default';
  }
  
  // 转换为数字以确保匹配
  const statusNum = parseInt(status);
  const colorMap = {
    1: 'green',     // 已使用 - 绿色
    2: 'orange',    // 待支付 - 橙色
    3: 'blue',      // 已支付 - 蓝色
    4: 'red'        // 已退款 - 红色
  };
  return colorMap[statusNum] || 'default';
};

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

// 清除选择
const clearSelection = () => {
  selectedRowKeys.value = [];
  selectedRows.value = [];
};

// 批量复制卡密
const handleBatchCopy = async () => {
  if (selectedRows.value.length === 0) {
    message.warning('请先选择要复制的订单');
    return;
  }

  // 提取所有选中行的卡密
  const cardNumbers = selectedRows.value
    .map(row => row.sn)
    .filter(sn => sn && sn.trim()) // 过滤空值
    .join('\n'); // 每行一个卡密

  if (!cardNumbers) {
    message.warning('选中的订单中没有有效的卡密');
    return;
  }

  console.log('准备复制的卡密:', cardNumbers);

  // 复制到剪切板
  const copySuccess = await copyToClipboard(cardNumbers);

  if (copySuccess) {
    const count = selectedRows.value.length;
    message.success(`已成功复制 ${count} 个卡密到剪切板`, 3);
    clearSelection(); // 复制成功后清除选择
  } else {
    message.error('复制失败，请手动复制以下卡密：');
    console.log('🔗 卡密列表 (请手动复制):', cardNumbers);
    
    // 显示弹窗供用户手动复制
    Modal.info({
      title: '卡密列表',
      content: `请手动复制以下卡密：\n\n${cardNumbers}`,
      width: 500,
      okText: '已复制'
    });
  }
};

// 批量删除
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    message.warning('请先选择要删除的订单');
    return;
  }

  const count = selectedRows.value.length;
  const cardNumbers = selectedRows.value.map(row => row.sn).join('、');

  Modal.confirm({
    title: '批量删除确认',
    content: `确认要删除选中的 ${count} 个订单吗？\n\n卡密：${cardNumbers.length > 100 ? cardNumbers.substring(0, 100) + '...' : cardNumbers}\n\n删除后无法恢复！`,
    okText: '确认删除',
    okType: 'danger',
    cancelText: '取消',
    width: 500,
    onOk: async () => {
      const deletePromises = selectedRows.value.map(row => 
        deleteCardOrder({ sn: row.sn })
      );

      try {
        loading.value = true;
        await Promise.all(deletePromises);
        message.success(`成功删除 ${count} 个订单`);
        clearSelection();
        handleSearch(); // 刷新列表
      } catch (err) {
        console.error('批量删除失败:', err);
        message.error('批量删除失败，请重试');
      } finally {
        loading.value = false;
      }
    },
    onCancel: () => {
      message.info('已取消批量删除');
    },
  });
};

// 搜索订单
const handleSearch = async (currentPage = 1) => {
  loading.value = true;
  // 搜索时清除选择状态
  clearSelection();
  
  try {
    const params = {
      ...searchForm,
      pageNum: currentPage,
      pageSize: pagination.value.pageSize,
    };

    const res = await getCardOrderList(params);

    if (res.code === 0) {
      orderList.value = res.data;
      pagination.value = {
        ...pagination.value,
        current: currentPage,
        total: res.count,
      };
    } else {
      message.error("获取订单列表失败");
    }
  } catch (err) {
    console.log("err: ", err);
    message.error("网络请求异常");
  } finally {
    loading.value = false;
  }
};

// 重置搜索
const handleReset = () => {
  searchForm.sn = "";
  searchForm.status = "";
  handleSearch(1);
};

// 分页变化
const handlePageChange = (current) => {
  handleSearch(current);
};

// 每页数量变化
const handlePageSizeChange = (current, size) => {
  pagination.value.pageSize = size;
  handleSearch(1);
};
const handleDelete = async (record) => {
  Modal.confirm({
    title: "确认删除",
    content: "是否确认删除该套餐？删除后无法恢复",
    okText: "确认",
    okType: "danger",
    cancelText: "取消",
    onOk: async () => {
      try {
        await deleteCardOrder({ sn: record.sn });
        message.success("删除成功");
        handleSearch();
      } catch (err) {
        message.error("删除失败");
      }
    },
    onCancel: () => {
      message.info("已取消删除");
    },
  });
};
// 初始化加载
onMounted(() => {
  handleSearch();
});
</script>

<style scoped>
.batch-operations {
  padding: 12px 16px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  margin-bottom: 16px;
}

.batch-operations .ant-space {
  width: 100%;
  justify-content: space-between;
}

.batch-operations .ant-alert {
  flex: 1;
  margin-right: 16px;
}

.ant-table-selection-column {
  width: 50px !important;
}

/* 选中行高亮 */
.ant-table-tbody > tr.ant-table-row-selected > td {
  background-color: #e6f7ff;
}

/* 批量操作按钮动画 */
.batch-operations .ant-btn {
  transition: all 0.3s ease;
}

.batch-operations .ant-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
