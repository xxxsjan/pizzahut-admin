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
          >
            <!-- <a-select-option value="">全部</a-select-option> -->
            <a-select-option value="0">未使用</a-select-option>
            <a-select-option value="1">已使用</a-select-option>
          </a-select>
        </a-form-item>

        <a-space>
          <a-button type="primary" html-type="submit">搜索</a-button>
          <a-button @click="handleReset">重置</a-button>
        </a-space>
      </a-form>
    </div>

    <!-- 订单表格 -->
    <a-card>
      <a-table
        :columns="columns"
        :data-source="orderList"
        :loading="loading"
        :pagination="false"
        row-key="id"
        size="middle"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'operation'">
            <div class="flex gap-2">
              <a-button type="primary" danger @click="handleDelete(record)"
                >删除</a-button
              >
            </div>
          </template>
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

// 搜索表单状态
const searchForm = reactive({
  sn: "", // 卡密
  status: "0", // 订单状态（0未使用，1已使用）
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
    title: "创建时间",
    dataIndex: "createTime",
    width: 180,
    customRender: ({ record }) => {
      return dayjs(record.createTime).subtract(8, 'hour').format("YYYY-MM-DD HH:mm:ss");
    },
  },
  {
    title: "操作",
    dataIndex: "operation",
    width: 50,
  },
];

// 搜索订单
const handleSearch = async (currentPage = 1) => {
  loading.value = true;
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
  searchForm.status = "0";
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

<style scoped></style>
