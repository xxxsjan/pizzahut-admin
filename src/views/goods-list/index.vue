<template>
  <div class="goods-list-page">
    <!-- 搜索表单 -->
    <div class="mb-4">
      <a-form layout="inline" @submit.prevent="() => handleSearch()">
        <a-form-item label="商品关键词">
          <a-input
            v-model:value="formState.keyword"
            placeholder="请输入商品关键词"
            style="width: 160px !important"
            allowClear
          />
        </a-form-item>

        <a-form-item label="店铺代码">
          <a-input
            v-model:value="formState.storeCode"
            placeholder="请输入店铺代码"
            style="width: 160px !important"
            allowClear
          />
        </a-form-item>

        <a-space>
          <a-button type="primary" html-type="submit">搜索</a-button>
          <a-button @click="handleReset">重置</a-button>
          <a-button type="primary" @click="handleUpdateGoods" :loading="updateLoading">
            更新商品数据
          </a-button>
        </a-space>
      </a-form>
    </div>

    <!-- 数据表格 -->
    <a-card :bordered="false">
      <a-table
        :columns="columns"
        :dataSource="goodsList"
        :rowKey="(record) => record.id"
        :loading="loading"
        :pagination="false"
        :locale="{ emptyText: '暂无商品数据' }"
        bordered
        tableLayout="fixed"
        size="middle"
        @change="handlePageChange"
      >
        <template #image="{ record }">
          <div v-if="record.img" class="flex justify-center">
            <img 
              :src="record.img" 
              :alt="record.name"
              class="w-12 h-12 object-cover rounded"
            />
          </div>
          <div v-else class="text-gray-400 text-center">暂无图片</div>
        </template>
        
        <template #startPrice="{ record }">
          <span class="text-blue-500 font-medium">￥{{ record.startPrice || 0 }}</span>
        </template>
        
        <template #price="{ record }">
          <span class="text-red-500 font-medium">￥{{ record.price ? (record.price / 100).toFixed(2) : '0.00' }}</span>
        </template>
        
        <template #status="{ record }">
          <a-tag :color="record.status === 1 ? 'red' : 'green'">
            {{ record.status === 1 ? '下架' : '上架' }}
          </a-tag>
        </template>
        
        <template #updateTime="{ record }">
          <span>{{ formatTime(record.updateTime) }}</span>
        </template>
        
        <template #createTime="{ record }">
          <span>{{ formatTime(record.createTime) }}</span>
        </template>

        <template #action="{ record }">
          <a-space>
            <a-button type="link" size="small" @click="handleEdit(record)">
              编辑
            </a-button>
            <a-button type="link" size="small" danger @click="handleDelete(record)">
              删除
            </a-button>
          </a-space>
        </template>
      </a-table>
      
      <div style="margin-top: 10px;display: flex;justify-content: flex-end;">
        <a-pagination
          :current="pagination.current"
          :pageSize="pagination.pageSize"
          :total="pagination.total"
          @change="handlePageChange"
          @showSizeChange="handlePageSizeChange"
          showSizeChanger
          showQuickJumper
          size="small"
        />
      </div>
    </a-card>
    
    <!-- 编辑商品模态框 -->
    <a-modal
      v-model:open="editModalVisible"
      title="编辑商品"
      @ok="handleEditSubmit"
      @cancel="editModalVisible = false"
      okText="保存"
      cancelText="取消"
    >
      <a-form layout="vertical">
        <a-form-item label="商品名称" required>
          <a-input
            v-model:value="editForm.name"
            placeholder="请输入商品名称"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="商品价格" required>
          <a-input-number
            v-model:value="editForm.price"
            placeholder="请输入商品价格"
            :min="0"
            :precision="2"
            :step="0.01"
            style="width: 100%"
          >
            <template #addonBefore>￥</template>
          </a-input-number>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { getGoodsList, updateGoodsDB, updateGoodsName, deleteGoods } from "@/api";
import { message, Modal } from "ant-design-vue";
import { reactive, ref, onMounted } from "vue";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

// 扩展 dayjs UTC 插件
dayjs.extend(utc);

// 时间格式化函数
const formatTime = (time) => {
  if (!time) return '-';
  // 使用UTC模式，不进行时区转换，显示GMT原始时间
  return dayjs.utc(time).format('YYYY-MM-DD HH:mm:ss');
};

// 表单状态
const formState = reactive({
  keyword: "",
  storeCode: "",
});

// 表格数据
const goodsList = ref([]);
const loading = ref(false);
const updateLoading = ref(false); // 更新商品数据的loading状态

// 编辑商品相关状态
const editModalVisible = ref(false);
const editForm = reactive({
  linkId: "",
  name: "",
  price: null,
});

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ["10", "20", "50", "100"],
});

// 列配置
const columns = [
  {
    title: "商品图片",
    dataIndex: "img",
    width: 100,
    slots: { customRender: "image" },
  },
  {
    title: "商品名称",
    dataIndex: "name",
    minWidth: 200,
  },
  {
    title: "商品id",
    dataIndex: "linkId",
    minWidth: 100,
    ellipsis: true,
  },
  {
    title: "商品价格",
    dataIndex: "startPrice",
    width: 120,
    slots: { customRender: "startPrice" },
  },
  {
    title: "自定义价格",
    dataIndex: "price",
    width: 120,
    slots: { customRender: "price" },
  },
  {
    title: "状态",
    dataIndex: "status",
    width: 100,
    slots: { customRender: "status" },
  },
  // {
  //   title: "创建时间",
  //   dataIndex: "createTime",
  //   width: 180,
  //   slots: { customRender: "createTime" },
  // },
  // {
  //   title: "更新时间",
  //   dataIndex: "updateTime",
  //   width: 180,
  //   slots: { customRender: "updateTime" },
  // },
  {
    title: "操作",
    dataIndex: "action",
    width: 150,
    slots: { customRender: "action" },
  },
];

// 搜索逻辑
const handleSearch = async (payload = {}) => {
  loading.value = true;
  try {
    const params = {
      ...formState,
      pageNum: 1,
      pageSize: pagination.pageSize,
      ...payload,
    };
    const res = await getGoodsList(params);
    goodsList.value = res.data || [];
    pagination.total = res.count || 0;
    pagination.current = +res.pageNum || 1;
    pagination.pageSize = +res.pageSize || 10;
  } catch (err) {
    message.error("查询失败，请稍后重试");
    console.error("获取商品列表失败:", err);
  } finally {
    loading.value = false;
  }
};

// 重置表单
const handleReset = () => {
  formState.keyword = "";
  formState.storeCode = "";
  handleSearch({
    pageNum: 1,
  });
};

// 更新商品数据
const handleUpdateGoods = async () => {
  if (!formState.storeCode) {
    message.warning("请输入店铺代码");
    return;
  }
  
  updateLoading.value = true;
  try {
    await updateGoodsDB({ storeCode: formState.storeCode });
    message.success("商品数据更新成功");
    // 更新完成后刷新商品列表
    handleSearch({
      pageNum: pagination.current,
    });
  } catch (err) {
    message.error("商品数据更新失败，请稍后重试");
    console.error("更新商品数据失败:", err);
  } finally {
    updateLoading.value = false;
  }
};

// 编辑商品
const handleEdit = (record) => {
  editForm.linkId = record.linkId;
  editForm.name = record.name;
  editForm.price = record.price || 0;
  editModalVisible.value = true;
};

// 编辑商品提交
const handleEditSubmit = async () => {
  if (!editForm.name.trim()) {
    message.warning("请输入商品名称");
    return;
  }
  
  if (editForm.price === null || editForm.price === undefined || editForm.price < 0) {
    message.warning("请输入有效的商品价格");
    return;
  }
  
  try {
    await updateGoodsName({
      linkId: editForm.linkId,
      name: editForm.name.trim(),
      price: editForm.price,
    });
    message.success("商品信息更新成功");
    editModalVisible.value = false;
    // 刷新当前页数据
    handleSearch({
      pageNum: pagination.current,
    });
  } catch (err) {
    message.error("商品更新失败，请稍后重试");
    console.error("更新商品失败:", err);
  }
};

// 删除商品
const handleDelete = async (record) => {
  Modal.confirm({
    title: "确认删除",
    content: `是否确认删除商品"${record.name}"？删除后无法恢复`,
    okText: "确认",
    okType: "danger",
    cancelText: "取消",
    onOk: async () => {
      try {
        await deleteGoods({ linkId: record.linkId });
        message.success("商品删除成功");
        handleSearch({
          pageNum: pagination.current,
        });
      } catch (err) {
        message.error("商品删除失败，请稍后重试");
        console.error("删除商品失败:", err);
      }
    },
    onCancel: () => {
      message.info("已取消删除");
    },
  });
};

// 分页处理
const handlePageChange = (pageNum, pageSize) => {
  handleSearch({
    pageNum: pageNum,
    pageSize,
  });
};

const handlePageSizeChange = (current, size) => {
  handleSearch({
    pageNum: 1,
    pageSize: size,
  });
};

// 初始化加载
onMounted(() => {
  handleSearch();
});
</script>

<style scoped>
.goods-list-page {
  padding: 0;
}
</style> 