<template>
  <div class="user-list-page">
    <!-- 搜索表单 -->
    <div class="mb-4">
      <a-form layout="inline" @submit.prevent="() => handleSearch()">
        <a-form-item label="手机号">
          <a-input
            v-model:value="formState.phone"
            placeholder="请输入手机号"
            style="width: 200px"
          />
        </a-form-item>

        <a-form-item label="是否尊享卡会员">
          <a-select
            v-model:value="formState.vip"
            placeholder="请选择"
            style="width: 200px"
          >
            <a-select-option value="1">是</a-select-option>
            <a-select-option value="0">否</a-select-option>
          </a-select>
        </a-form-item>

        <!-- 新增最小余额输入 -->
        <a-form-item label="最小余额">
          <a-input-number
            v-model:value="formState.minBalance"
            placeholder="请输入最小余额"
            style="width: 200px"
            :min="0"
          />
        </a-form-item>

        <!-- 新增最大余额输入 -->
        <a-form-item label="最大余额">
          <a-input-number
            v-model:value="formState.maxBalance"
            placeholder="请输入最大余额"
            style="width: 200px"
            :min="0"
          />
        </a-form-item>

        <a-space>
          <a-button type="primary" html-type="submit">搜索</a-button>
          <a-button @click="handleReset">重置</a-button>
          <!-- 新增添加用户按钮 -->
          <a-button type="primary" @click="addModalVisible = true"
            >添加用户</a-button
          >
        </a-space>
      </a-form>
    </div>

    <!-- 数据表格 -->
    <a-card :bordered="false">
      <a-table
        :columns="columns"
        :dataSource="userList"
        :rowKey="(record) => record.id"
        :loading="loading"
        :pagination="false"
        :locale="{ emptyText: '暂无用户数据' }"
        bordered
        tableLayout="fixed"
        size="middle"
        @change="handlePageChange"
      >
        <template #token="{ record }">
          <div class="line-clamp-3 overflow-hidden">{{ record.token }}</div>
        </template>
        <template #action="{ record }">
          <!-- <a-button type="link" size="small" @click="handleEdit(record)"
            >编辑</a-button
          > -->
          <a-button
            type="link"
            size="small"
            danger
            @click="handleDelete(record)"
            >删除</a-button
          >
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
    <!-- 添加用户模态框 -->
    <a-modal
      v-model:open="addModalVisible"
      title="添加用户"
      @ok="handleAddUser"
      @cancel="addModalVisible = false"
      okText="添加"
      cancelText="取消"
    >
      <a-form layout="vertical">
        <a-form-item label="手机号" required>
          <a-input
            v-model:value="addForm.phone"
            placeholder="请输入手机号"
            style="width: 300px"
          />
        </a-form-item>
        <a-form-item label="Token" required>
          <a-input
            v-model:value="addForm.token"
            placeholder="请输入Token"
            style="width: 300px"
          />
        </a-form-item>
      </a-form>
    </a-modal>
    <!-- 编辑用户模态框 -->
    <a-modal
      v-model:open="editModalVisible"
      title="编辑用户"
      @ok="handleEditSubmit"
      @cancel="editModalVisible = false"
      okText="保存"
      cancelText="取消"
    >
      <a-form layout="vertical">
        <a-form-item label="手机号" required>
          <a-input
            v-model:value="editForm.phone"
            placeholder="请输入手机号"
            style="width: 300px"
          />
        </a-form-item>
        <a-form-item label="Token" required>
          <a-input
            v-model:value="editForm.token"
            placeholder="请输入Token"
            style="width: 300px"
          />
        </a-form-item>
        <a-form-item label="是否尊享卡会员" required>
          <a-select
            v-model:value="editForm.vip"
            placeholder="请选择"
            style="width: 300px"
          >
            <a-select-option value="1">是</a-select-option>
            <a-select-option value="0">否</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import {
  getUserList,
  addUser,
  deleteUser,
  checkVip,
  getBalance,
  getVgold,
  queryCoupon,
} from "@/api";
import { message, Modal } from "ant-design-vue"; // Add Modal import
import { reactive } from "vue";

// 表单状态
const formState = reactive({
  phone: "",
  vip: "",
  minBalance: null, // 新增最小余额
  maxBalance: null, // 新增最大余额
});

// 表格数据
const userList = ref([]);
const loading = ref(false);
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
    title: "token",
    dataIndex: "token",
    minWidth: 150,
    slots: { customRender: "token" },
  },
  {
    title: "手机号",
    dataIndex: "phone",
    width: 180,
  },
  {
    title: "余额",
    dataIndex: "balance",
    width: 180,
  },
  {
    title: "是否尊享卡",
    dataIndex: "vip",
    width: 150,
    customRender: ({ record }) => {
      return record.vip === 1 ? "是" : "否";
    },
  },
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
    const res = await getUserList(params);
    userList.value = res.data;
    pagination.total = res.count;
    pagination.current = +res.pageNum;
    pagination.pageSize = +res.pageSize;
  } catch (err) {
    message.error("查询失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

// 重置表单
const handleReset = () => {
  formState.phone = "";
  formState.vip = "";
  formState.minBalance = null; // 新增重置最小余额
  formState.maxBalance = null; // 新增重置最大余额
  handleSearch({
    pageNum: 1,
  });
};

const handleDelete = async (record) => {
  Modal.confirm({
    title: "确认删除",
    content: "是否确认删除该用户？删除后无法恢复",
    okText: "确认",
    okType: "danger",
    cancelText: "取消",
    onOk: async () => {
      try {
        await deleteUser({ id: record.id });
        message.success("删除成功");
        handleSearch({
          pageNum: pagination.current,
        });
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

// 添加用户相关状态
const addModalVisible = ref(false);
const addForm = reactive({
  phone: "",
  token: "",
});

// 添加用户提交逻辑
const handleAddUser = async () => {
  if (!addForm.phone || !addForm.token) {
    message.warning("请填写完整手机号和Token");
    return;
  }
  try {
    await addUser(addForm); // 调用添加用户接口
    message.success("用户添加成功");
    addModalVisible.value = false;
    handleSearch({
      pageNum: 1,
    }); // 刷新第一页数据
    addForm.phone = ""; // 清空表单
    addForm.token = "";
  } catch (err) {
    message.error(err.toString());
  }
};

// 编辑用户相关状态
const editModalVisible = ref(false);
const editForm = reactive({
  phone: "",
  token: "",
  vip: "",
});

// 编辑用户点击事件（替换原有handleEdit）
const handleEdit = (record) => {
  editForm.phone = record.phone;
  editForm.token = record.token;
  editForm.vip = record.vip.toString();
  editModalVisible.value = true;
};

// 编辑用户提交逻辑
const handleEditSubmit = async () => {
  if (!editForm.phone || !editForm.token || editForm.vip === "") {
    message.warning("请填写完整手机号、Token和尊享卡状态");
    return;
  }
  try {
    // 假设接口需要number类型的vip，转换回数字
    const params = { ...editForm, vip: Number(editForm.vip) };
    // await editUser(params); // 调用编辑用户接口（需在@/api中实现）
    // message.success("用户编辑成功");
    // editModalVisible.value = false;
    // handleSearch(pagination.current); // 刷新当前页数据
  } catch (err) {
    message.error("用户编辑失败，请稍后重试");
  }
};
const handlePageChange = (pageNum, pageSize) => {
  handleSearch({
    pageNum: pageNum,
    pageSize,
  });
};

const handlePageSizeChange = (current, size) => {};
</script>

<style scoped></style>
