<template>
  <div class="phone-list-page">
    <!-- 搜索表单 -->
    <div class="mb-4">
      <a-card size="small" title="手机号筛选">
        <a-form layout="inline" @submit.prevent="() => handleSearch()">
          <a-form-item label="关键词">
            <a-input
              v-model:value="formState.keyword"
              placeholder="请输入手机号或姓名"
              style="width: 200px"
              allowClear
            />
          </a-form-item>

          <a-form-item label="分组">
            <a-select
              v-model:value="formState.group_name"
              placeholder="请选择分组"
              style="width: 150px"
              allowClear
            >
            <a-select-option :value="A组">A组</a-select-option>
            <a-select-option :value="B组">B组</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="状态">
            <a-select
              v-model:value="formState.status"
              placeholder="请选择状态"
              style="width: 120px"
              allowClear
            >
              <a-select-option :value="1">启用</a-select-option>
              <a-select-option :value="0">禁用</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item>
            <a-space>
              <a-button type="primary" html-type="submit">搜索</a-button>
              <a-button @click="handleReset">重置</a-button>
              <a-button type="primary" @click="batchUploadVisible = true">
                批量上传
              </a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </a-card>
    </div>

    <!-- 数据表格 -->
    <a-card :bordered="false">
      <a-table
        :columns="columns"
        :dataSource="phoneList"
        :rowKey="(record) => record.phone_id || record.id || record.phoneId"
        :loading="loading"
        :pagination="false"
        :locale="{ emptyText: '暂无手机号数据' }"
        bordered
        size="middle"
        :scroll="{ x: 1200 }"
      >
        <template #status="{ record }">
          <a-tag :color="record.status === 1 ? 'green' : 'red'">
            {{ record.status === 1 ? '启用' : '禁用' }}
          </a-tag>
        </template>
        
        <template #tags="{ record }">
          <span v-if="record.tags">
            <a-tag 
              v-for="tag in record.tags.split(',')" 
              :key="tag"
              color="blue"
            >
              {{ tag.trim() }}
            </a-tag>
          </span>
        </template>
        
        <template #create_time="{ record }">
          <span>{{ formatTime(record.create_time) }}</span>
        </template>

        <template #update_time="{ record }">
          <span>{{ formatTime(record.update_time) }}</span>
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
          :pageSizeOptions="['20', '50', '100']"
        />
      </div>
    </a-card>

    <!-- 批量上传模态框 -->
    <a-modal
      v-model:open="batchUploadVisible"
      title="批量上传手机号"
      @ok="handleBatchUpload"
      @cancel="batchUploadVisible = false"
      okText="上传"
      cancelText="取消"
      width="800px"
      :confirmLoading="uploadLoading"
    >
      <div class="mb-4">
        <a-alert
          type="info"
          show-icon
          message="上传格式说明"
          description="每行一个手机号，格式：手机号----姓名----状态----分组名（用----分隔，状态：1启用/0禁用）"
        />
      </div>
      
      <a-form layout="vertical">
        <a-form-item label="手机号数据" required>
          <a-textarea
            v-model:value="batchUploadData"
            placeholder="示例：&#10;17681092653----xy----1---A组&#10;13800138000----李四----1----B组"
            :rows="10"
            style="width: 100%"
          />
        </a-form-item>
        
        <a-form-item label="创建者">
          <a-input
            v-model:value="batchUploadForm.created_by"
            placeholder="请输入创建者"
            style="width: 200px"
          />
        </a-form-item>
      </a-form>
      
      <div class="mt-2">
        <a-text type="secondary">
          解析结果：{{ parsedData.length }} 条有效数据
        </a-text>
      </div>
    </a-modal>

    <!-- 编辑模态框 -->
    <a-modal
      v-model:open="editModalVisible"
      title="编辑手机号"
      @ok="handleEditSubmit"
      @cancel="editModalVisible = false"
      okText="保存"
      cancelText="取消"
      :confirmLoading="editLoading"
    >
      <a-form layout="vertical">
        <a-form-item label="手机号" required>
          <a-input
            v-model:value="editForm.phone"
            placeholder="请输入手机号"
            style="width: 100%"
          />
        </a-form-item>
        
        <a-form-item label="姓名">
          <a-input
            v-model:value="editForm.name"
            placeholder="请输入姓名"
            style="width: 100%"
          />
        </a-form-item>
        
        <a-form-item label="状态" required>
          <a-select
            v-model:value="editForm.status"
            placeholder="请选择状态"
            style="width: 100%"
          >
            <a-select-option :value="1">启用</a-select-option>
            <a-select-option :value="0">禁用</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="分组">
          <a-select
            v-model:value="editForm.group_name"
            placeholder="请选择分组"
            style="width: 100%"
            allowClear
          >
          <a-select-option :value="A组">A组</a-select-option>
          <a-select-option :value="B组">B组</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="标签">
          <a-input
            v-model:value="editForm.tags"
            placeholder="请输入标签，多个用逗号分隔"
            style="width: 100%"
          />
        </a-form-item>
        
        <a-form-item label="备注">
          <a-textarea
            v-model:value="editForm.remark"
            placeholder="请输入备注"
            :rows="3"
            style="width: 100%"
          />
        </a-form-item>
        
        <a-form-item label="更新者">
          <a-input
            v-model:value="editForm.updated_by"
            placeholder="请输入更新者"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { 
  getPhoneList, 
  batchAddPhone, 
  updatePhone, 
  deletePhone, 
  getPhoneGroups 
} from "@/api";
import { message, Modal } from "ant-design-vue";
import { reactive, ref, onMounted, computed } from "vue";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

// 扩展 dayjs UTC 插件
dayjs.extend(utc);

// 时间格式化函数
const formatTime = (time) => {
  if (!time) return '-';
  return dayjs.utc(time).format('YYYY-MM-DD HH:mm:ss');
};

// 表单状态
const formState = reactive({
  keyword: "",
  group_name: "",
  status: null,
});

// 表格数据
const phoneList = ref([]);
const loading = ref(false);
const groupList = ref([]);

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
});

// 批量上传相关
const batchUploadVisible = ref(false);
const batchUploadData = ref("");
const uploadLoading = ref(false);
const batchUploadForm = reactive({
  created_by: "管理员",
});

// 编辑相关
const editModalVisible = ref(false);
const editLoading = ref(false);
const editForm = reactive({
  phone_id: null,
  phone: "",
  name: "",
  status: 1,
  group_name: "",
  tags: "",
  remark: "",
  updated_by: "管理员",
});

// 解析批量上传数据
const parsedData = computed(() => {
  if (!batchUploadData.value) return [];
  
  const lines = batchUploadData.value.split('\n').filter(line => line.trim());
  const validData = [];
  
  lines.forEach(line => {
    const parts = line.split('----');
    if (parts.length >= 3) {
      const phone = parts[0]?.trim();
      const name = parts[1]?.trim();
      const status = parts[2]?.trim();
      const group_name = parts[3]?.trim() || "";
      const tags = parts[4]?.trim() || "";
      const remark = parts[5]?.trim() || "";
      
      if (phone && /^1[3-9]\d{9}$/.test(phone)) {
        validData.push({
          phone,
          name: name || "",
          status: status === '1' ? 1 : 0,
          group_name,
          tags,
          remark,
        });
      }
    }
  });
  
  return validData;
});

// 列配置
const columns = [
  {
    title: "手机号",
    dataIndex: "phone",
    width: 140,
  },
  {
    title: "姓名",
    dataIndex: "name",
    width: 120,
  },

  {
    title: "分组",
    dataIndex: "group_name",
    width: 120,
  },
  {
    title: "备注",
    dataIndex: "remark",
    width: 200,
    ellipsis: true,
  },
  {
    title: "状态",
    dataIndex: "status",
    width: 100,
    slots: { customRender: "status" },
  },
  {
    title: "创建时间",
    dataIndex: "create_time",
    width: 180,
    slots: { customRender: "create_time" },
  },
  {
    title: "更新时间",
    dataIndex: "update_time",
    width: 180,
    slots: { customRender: "update_time" },
  },
  {
    title: "操作",
    dataIndex: "action",
    width: 150,
    slots: { customRender: "action" },
  },
];

// 获取分组列表
const getGroups = async () => {
  try {
    const res = await getPhoneGroups();
    groupList.value = res.data || [];
  } catch (err) {
    console.error("获取分组列表失败:", err);
  }
};

// 搜索逻辑
const handleSearch = async (payload = {}) => {
  loading.value = true;
  try {
    const params = {
      page_num: 1,
      page_size: pagination.pageSize,
      ...formState,
      ...payload,
    };

    const res = await getPhoneList(params);
    // 处理嵌套的data结构
    const responseData = res.data || {};
    phoneList.value = responseData.data || [];
    pagination.total = responseData.total || 0;
    pagination.current = +responseData.page_num || 1;
    pagination.pageSize = +responseData.page_size || 20;
  } catch (err) {
    message.error("查询失败，请稍后重试");
    console.error("获取手机号列表失败:", err);
  } finally {
    loading.value = false;
  }
};

// 重置表单
const handleReset = () => {
  formState.keyword = "";
  formState.group_name = "";
  formState.status = null;
  handleSearch({
    page_num: 1,
  });
};

// 批量上传
const handleBatchUpload = async () => {
  if (parsedData.value.length === 0) {
    message.warning("请输入有效的手机号数据");
    return;
  }
  
  if (!batchUploadForm.created_by) {
    message.warning("请输入创建者");
    return;
  }
  
  uploadLoading.value = true;
  try {
    await batchAddPhone({
      phones: parsedData.value,
      created_by: batchUploadForm.created_by,
    });
    
    message.success(`成功上传 ${parsedData.value.length} 条手机号`);
    batchUploadVisible.value = false;
    batchUploadData.value = "";
    handleSearch({
      page_num: 1,
    });
  } catch (err) {
    message.error("批量上传失败，请稍后重试");
    console.error("批量上传失败:", err);
  } finally {
    uploadLoading.value = false;
  }
};

// 编辑手机号
const handleEdit = (record) => {
  console.log("编辑记录:", record); // 调试信息
  
  const phoneId = record.phone_id || record.id || record.phoneId;
  editForm.phone_id = phoneId;
  editForm.phone = record.phone;
  editForm.name = record.name || "";
  editForm.status = record.status;
  editForm.group_name = record.group_name || "";
  editForm.tags = record.tags || "";
  editForm.remark = record.remark || "";
  editModalVisible.value = true;
};

// 编辑提交
const handleEditSubmit = async () => {
  if (!editForm.phone) {
    message.warning("请输入手机号");
    return;
  }
  
  if (!/^1[3-9]\d{9}$/.test(editForm.phone)) {
    message.warning("请输入正确的手机号格式");
    return;
  }
  
  editLoading.value = true;
  try {
    await updatePhone(editForm);
    message.success("手机号更新成功");
    editModalVisible.value = false;
    handleSearch({
      page_num: pagination.current,
    });
  } catch (err) {
    message.error("手机号更新失败，请稍后重试");
    console.error("更新手机号失败:", err);
  } finally {
    editLoading.value = false;
  }
};

// 删除手机号
const handleDelete = async (record) => {
  // 调试：打印record对象查看字段名
  console.log("删除记录:", record);
  
  // 尝试不同的ID字段名
  const phoneId = record.phone_id || record.id || record.phoneId;
  
  if (!phoneId) {
    message.error("无法获取手机号ID，删除失败");
    console.error("Record中没有找到ID字段:", record);
    return;
  }
  
  Modal.confirm({
    title: "确认删除",
    content: `是否确认删除手机号"${record.phone}"？删除后无法恢复`,
    okText: "确认",
    okType: "danger",
    cancelText: "取消",
    onOk: async () => {
      try {
        console.log("发送删除请求，phone_id:", phoneId);
        await deletePhone({ phone_id: phoneId });
        message.success("手机号删除成功");
        handleSearch({
          page_num: pagination.current,
        });
      } catch (err) {
        message.error("手机号删除失败，请稍后重试");
        console.error("删除手机号失败:", err);
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
    page_num: pageNum,
    page_size: pageSize,
  });
};

const handlePageSizeChange = (current, size) => {
  handleSearch({
    page_num: 1,
    page_size: size,
  });
};

// 初始化加载
onMounted(() => {
  getGroups();
  handleSearch();
});
</script>

<style scoped>
.phone-list-page {
  padding: 0;
}
</style>
