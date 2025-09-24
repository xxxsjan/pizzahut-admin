<template>
  <div class="log-list-page">
    <!-- 统计卡片 -->
    <div class="mb-4">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card size="small">
            <a-statistic
              title="总日志数"
              :value="statistics.total_logs || 0"
              style="color: #1890ff"
            />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card size="small">
            <a-statistic
              title="ERROR日志"
              :value="statistics.level_stats?.ERROR || 0"
              style="color: #ff4d4f"
            />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card size="small">
            <a-statistic
              title="WARNING日志"
              :value="statistics.level_stats?.WARNING || 0"
              style="color: #faad14"
            />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card size="small">
            <a-statistic
              title="统计天数"
              :value="statistics.days || 7"
              suffix="天"
            />
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 搜索表单 -->
    <div class="mb-4">
      <a-card size="small" title="日志筛选">
        <a-form layout="inline" @submit.prevent="() => handleSearch()">
          <a-form-item label="日志级别">
            <a-select
              v-model:value="formState.log_level"
              placeholder="请选择日志级别"
              style="width: 120px"
              allowClear
            >
              <a-select-option value="DEBUG">DEBUG</a-select-option>
              <a-select-option value="INFO">INFO</a-select-option>
              <a-select-option value="WARNING">WARNING</a-select-option>
              <a-select-option value="ERROR">ERROR</a-select-option>
              <a-select-option value="CRITICAL">CRITICAL</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="日志类型">
            <a-select
              v-model:value="formState.log_type"
              placeholder="请选择日志类型"
              style="width: 120px"
              allowClear
            >
              <a-select-option value="SYSTEM">SYSTEM</a-select-option>
              <a-select-option value="USER_OP">USER_OP</a-select-option>
              <a-select-option value="ORDER">ORDER</a-select-option>
              <a-select-option value="VIP">VIP</a-select-option>
              <a-select-option value="API">API</a-select-option>
              <a-select-option value="DATABASE">DATABASE</a-select-option>
              <a-select-option value="PAYMENT">PAYMENT</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="模块名称">
            <a-input
              v-model:value="formState.module_name"
              placeholder="请输入模块名称"
              style="width: 120px"
              allowClear
            />
          </a-form-item>

          <a-form-item label="函数名称">
            <a-input
              v-model:value="formState.function_name"
              placeholder="请输入函数名称"
              style="width: 120px"
              allowClear
            />
          </a-form-item>

          <a-form-item label="关键词">
            <a-input
              v-model:value="formState.keyword"
              placeholder="请输入关键词"
              style="width: 160px"
              allowClear
            />
          </a-form-item>

          <a-form-item label="开始时间">
            <a-date-picker
              v-model:value="formState.startTime"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="开始时间"
              style="width: 180px"
            />
          </a-form-item>

          <a-form-item label="结束时间">
            <a-date-picker
              v-model:value="formState.endTime"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="结束时间"
              style="width: 180px"
            />
          </a-form-item>

          <a-form-item>
            <a-space>
              <a-button type="primary" html-type="submit">搜索</a-button>
              <a-button @click="handleReset">重置</a-button>
              <a-button @click="handleRefreshStats">刷新统计</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </a-card>
    </div>

    <!-- 数据表格 -->
    <a-card :bordered="false">
      <a-table
        :columns="columns"
        :dataSource="logList"
        :rowKey="(record) => record.id"
        :loading="loading"
        :pagination="false"
        :locale="{ emptyText: '暂无日志数据' }"
        bordered
        size="middle"
        :scroll="{ x: 1500 }"
      >
        <template #log_level="{ record }">
          <a-tag 
            :color="getLevelColor(record.log_level)"
          >
            {{ record.log_level }}
          </a-tag>
        </template>
        
        <template #log_type="{ record }">
          <a-tag color="blue">
            {{ record.log_type }}
          </a-tag>
        </template>
        
        <template #message="{ record }">
          <div class="log-message" :title="record.message">
            {{ record.message }}
          </div>
        </template>
        
        <template #create_time="{ record }">
          <span>{{ formatTime(record.create_time) }}</span>
        </template>

        <template #execution_time="{ record }">
          <span v-if="record.execution_time">{{ record.execution_time }}ms</span>
          <span v-else>-</span>
        </template>

        <template #status_code="{ record }">
          <a-tag :color="getStatusColor(record.status_code)">
            {{ record.status_code || '-' }}
          </a-tag>
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
  </div>
</template>

<script setup>
import { getLogList, getLogStatistics } from "@/api";
import { message } from "ant-design-vue";
import { reactive, ref, onMounted } from "vue";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

// 扩展 dayjs UTC 插件
dayjs.extend(utc);

// 时间格式化函数
const formatTime = (time) => {
  if (!time) return '-';
  return dayjs.utc(time).format('YYYY-MM-DD HH:mm:ss');
};

// 获取日志级别颜色
const getLevelColor = (level) => {
  const colors = {
    DEBUG: 'default',
    INFO: 'blue',
    WARNING: 'orange',
    ERROR: 'red',
    CRITICAL: 'magenta',
  };
  return colors[level] || 'default';
};

// 获取状态码颜色
const getStatusColor = (code) => {
  if (!code) return 'default';
  const statusCode = parseInt(code);
  if (statusCode >= 200 && statusCode < 300) return 'green';
  if (statusCode >= 400 && statusCode < 500) return 'orange';
  if (statusCode >= 500) return 'red';
  return 'default';
};

// 表单状态
const formState = reactive({
  log_level: "",
  log_type: "",
  module_name: "",
  function_name: "",
  keyword: "",
  startTime: null,
  endTime: null,
});

// 表格数据
const logList = ref([]);
const loading = ref(false);
const statistics = ref({});

const pagination = reactive({
  current: 1,
  pageSize: 50,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
});

// 列配置
const columns = [
  {
    title: "时间",
    dataIndex: "create_time",
    width: 180,
    slots: { customRender: "create_time" },
  },
  {
    title: "级别",
    dataIndex: "log_level",
    width: 100,
    slots: { customRender: "log_level" },
  },
  {
    title: "类型",
    dataIndex: "log_type",
    width: 100,
    slots: { customRender: "log_type" },
  },
  {
    title: "模块",
    dataIndex: "module_name",
    width: 120,
    ellipsis: true,
  },
  {
    title: "日志内容",
    dataIndex: "message",
    slots: { customRender: "message" },
  },
//   {
//     title: "状态码",
//     dataIndex: "status_code",
//     width: 100,
//     slots: { customRender: "status_code" },
//   },
//   {
//     title: "耗时",
//     dataIndex: "execution_time",
//     width: 100,
//     slots: { customRender: "execution_time" },
//   },
//   {
//     title: "IP地址",
//     dataIndex: "ip_address",
//     width: 140,
//   },
//   {
//     title: "用户Token",
//     dataIndex: "user_token",
//     width: 150,
//     ellipsis: true,
//   },
];

// 获取统计数据
const getStatistics = async () => {
  try {
    const res = await getLogStatistics({ days: 7 });
    statistics.value = res.data || {};
  } catch (err) {
    console.error("获取统计数据失败:", err);
  }
};

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

    // 格式化时间参数
    if (params.startTime) {
      params.startTime = dayjs(params.startTime).format('YYYY-MM-DD HH:mm:ss');
    }
    if (params.endTime) {
      params.endTime = dayjs(params.endTime).format('YYYY-MM-DD HH:mm:ss');
    }

    const res = await getLogList(params);
    logList.value = res.data || [];
    pagination.total = res.count || 0;
    pagination.current = +res.pageNum || 1;
    pagination.pageSize = +res.pageSize || 50;
  } catch (err) {
    message.error("查询失败，请稍后重试");
    console.error("获取日志列表失败:", err);
  } finally {
    loading.value = false;
  }
};

// 重置表单
const handleReset = () => {
  formState.log_level = "";
  formState.log_type = "";
  formState.module_name = "";
  formState.function_name = "";
  formState.keyword = "";
  formState.startTime = null;
  formState.endTime = null;
  handleSearch({
    pageNum: 1,
  });
};

// 刷新统计
const handleRefreshStats = () => {
  getStatistics();
  message.success("统计数据已刷新");
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
  getStatistics();
  handleSearch();
});
</script>

<style scoped>
.log-list-page {
  padding: 0;
}

.log-message {
  width: 100%;
  word-break: break-all;
  white-space: pre-wrap;
  line-height: 1.4;
  max-height: 120px;
  overflow-y: auto;
}
</style>