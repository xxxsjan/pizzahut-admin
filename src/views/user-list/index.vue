<template>
  <div class="user-list-page">
    <!-- 搜索表单 -->
    <div class="mb-4">
      <a-form layout="inline" @submit.prevent="() => handleSearch()">
        <a-form-item label="手机号">
          <a-input
            v-model:value="formState.phone"
            placeholder="请输入手机号"
            style="width: 120px !important"
            allowClear
          />
        </a-form-item>

        <a-form-item label="是否尊享卡会员">
          <a-select
            v-model:value="formState.vip"
            placeholder="请选择"
            style="width: 80px !important"
            allowClear
            :getPopupContainer="(triggerNode) => triggerNode.parentNode"
          >
            <a-select-option value="1">是</a-select-option>
            <a-select-option value="0">否</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="用户状态">
          <a-select
            v-model:value="formState.status"
            placeholder="请选择"
            style="width: 80px !important"
            allowClear
            :getPopupContainer="(triggerNode) => triggerNode.parentNode"
          >
            <a-select-option value="1">正常</a-select-option>
            <a-select-option value="0">异常</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="批次号">
          <a-select
            v-model:value="formState.activityId"
            placeholder="请选择"
            style="width: 160px !important"
            allowClear
            :getPopupContainer="(triggerNode) => triggerNode.parentNode"
          >
          <a-select-option value="PHPRIMEOFFER202101194">PHPRIMEOFFER202101194</a-select-option>
            <a-select-option value="PHPRIMEOFFER202001885">PHPRIMEOFFER202001885</a-select-option>
            <a-select-option value="PHPRIMEOFFER202501019">PHPRIMEOFFER202501019</a-select-option>
          </a-select>
        </a-form-item>
        <!-- 新增最小余额输入 -->
        <a-form-item label="最小余额">
          <a-input-number
            v-model:value="formState.minBalance"
            placeholder="请输入最小余额"
            style="width: 80px"
            :min="0"
            allowClear
          />
        </a-form-item>

        <!-- 新增最大余额输入 -->
        <a-form-item label="最大余额">
          <a-input-number
            v-model:value="formState.maxBalance"
            placeholder="请输入最大余额"
            style="width: 80px"
            :min="0"
            allowClear
          />
        </a-form-item>

        <a-space>
          <a-button type="primary" html-type="submit">搜索</a-button>
          <a-button @click="handleReset">重置</a-button>
          <!-- 新增添加用户按钮 -->
          <a-button type="primary" @click="addModalVisible = true"
            >添加用户</a-button
          >
          <!-- Token监控控制按钮 -->
          <a-button 
            :type="tokenMonitor.isRunning ? 'primary' : 'default'"
            :danger="tokenMonitor.isRunning"
            :loading="tokenMonitor.loading"
            @click="toggleTokenMonitor"
            style="position: relative; z-index: 1;"
          >
            <template #icon>
              <span v-if="tokenMonitor.isRunning && tokenMonitor.websocketConnected" style="color: #52c41a;">●</span>
              <span v-else-if="tokenMonitor.isRunning && !tokenMonitor.websocketConnected" style="color: #faad14;">●</span>
              <span v-else style="color: #ff4d4f;">●</span>
            </template>
            {{ getMonitorStatusText() }}
            <span v-if="tokenMonitor.checkProgress.total > 0 && !tokenMonitor.checkProgress.visible" 
                  style="margin-left: 8px; font-size: 12px; opacity: 0.8;"
                  @click.stop="showProgressFromButton">
              [{{ Math.round(tokenMonitor.checkProgress.percentage) }}%]
            </span>
          </a-button>
          <!-- 语音播报开关 -->
          <a-tooltip title="开启/关闭Token过期语音提醒">
            <a-button 
              :type="tokenMonitor.voiceEnabled ? 'primary' : 'default'"
              size="small"
              @click="toggleVoice"
            >
              {{ tokenMonitor.voiceEnabled ? '🔊' : '🔇' }}
            </a-button>
          </a-tooltip>
        </a-space>
      </a-form>
    </div>

    <!-- Token检查进度条 -->
    <div v-if="tokenMonitor.checkProgress.visible" class="token-check-progress">
      <div class="progress-bar-container">
        <div class="progress-header">
          <span class="progress-title">🔍 Token检查进度 - 第{{ tokenMonitor.checkProgress.checkRound }}轮</span>
          <div class="progress-actions">
            <a-button size="small" type="text" @click="minimizeProgress" v-if="!tokenMonitor.checkProgress.minimized">
              最小化
            </a-button>
            <a-button size="small" type="text" @click="showProgress" v-else>
              展开
            </a-button>
            <a-button size="small" type="text" @click="hideProgress">
              ✕
            </a-button>
          </div>
        </div>
        <div v-if="!tokenMonitor.checkProgress.minimized" class="progress-content">
          <a-progress 
            :percent="Math.round(tokenMonitor.checkProgress.percentage)" 
            status="active"
            :show-info="false"
            size="small"
          />
          <div class="progress-info">
            <span>{{ tokenMonitor.checkProgress.current }} / {{ tokenMonitor.checkProgress.total }}</span>
            <span>过期: {{ tokenMonitor.checkProgress.expiredFound }}</span>
            <span>{{ Math.round(tokenMonitor.checkProgress.percentage) }}%</span>
          </div>
        </div>
        <div v-else class="progress-minimized">
          <span class="mini-progress">{{ Math.round(tokenMonitor.checkProgress.percentage) }}% ({{ tokenMonitor.checkProgress.current }}/{{ tokenMonitor.checkProgress.total }})</span>
        </div>
      </div>
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
        <template #status="{ record }">
          <a-tag :color="record.status === '1' || record.status === 1 ? 'green' : 'red'">
            {{ record.status === '1' || record.status === 1 ? '正常' : '异常' }}
          </a-tag>
        </template>
        <template #updateTime="{ record }">
          <span>{{ formatTime(record.updateTime) }}</span>
        </template>
        <template #action="{ record }">
          <a-space>
            <a-button type="link" size="small" @click="handleEdit(record)"
              >编辑状态</a-button
            >
            <a-button
              type="link"
              size="small"
              danger
              @click="handleDelete(record)"
              >删除</a-button
            >
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
    <!-- 编辑用户状态模态框 -->
    <a-modal
      v-model:open="editModalVisible"
      title="编辑用户状态"
      @ok="handleEditSubmit"
      @cancel="editModalVisible = false"
      okText="保存"
      cancelText="取消"
    >
      <a-form layout="vertical">
        <a-form-item label="用户Token">
          <a-input
            v-model:value="editForm.token"
            placeholder="用户Token"
            style="width: 100%"
            disabled
          />
        </a-form-item>
        <a-form-item label="手机号">
          <a-input
            v-model:value="editForm.phone"
            placeholder="手机号"
            style="width: 100%"
            disabled
          />
        </a-form-item>
        <a-form-item label="用户状态" required>
          <a-select
            v-model:value="editForm.status"
            placeholder="请选择用户状态"
            style="width: 100%"
            :getPopupContainer="(triggerNode) => triggerNode.parentNode"
          >
            <a-select-option value="1">正常</a-select-option>
            <a-select-option value="0">异常</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Token过期通知模态框 -->
    <a-modal
      v-model:open="expiredNotificationVisible"
      title="⚠️ Token过期提醒"
      :footer="null"
      :closable="false"
      :maskClosable="false"
      centered
      width="500px"
      :destroy-on-close="true"
    >
      <div v-if="expiredNotification && expiredNotification.users" class="expired-notification">
        <div class="notification-icon">
          <span style="color: #faad14; font-size: 48px;">⚠️</span>
        </div>
        <div class="notification-content">
          <h3>发现 {{ expiredNotification.count || 0 }} 个用户Token过期</h3>
          <div class="expired-users" v-if="expiredNotification.users.length > 0">
            <div 
              v-for="(user, index) in expiredNotification.users" 
              :key="`expired-user-${index}-${user.user_id || user.phone || Date.now()}`"
              class="expired-user-item"
            >
              <a-tag color="red">{{ user.phone || '未知手机号' }}</a-tag>
              <span class="user-token">{{ user.token && user.token.length > 20 ? user.token.substring(0, 20) + '...' : (user.token || '未知Token') }}</span>
            </div>
          </div>
          <div class="notification-footer">
            <p class="manual-close-text">请手动关闭此通知</p>
          </div>
        </div>
      </div>
      <div class="notification-actions">
        <a-button type="primary" @click="closeExpiredNotification">
          知道了
        </a-button>
        <a-button @click="viewExpiredDetails">
          查看详情
        </a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import {
  getUserList,
  addUser,
  deleteUser,
  switchStatus,
  checkVip,
  getBalance,
  getVgold,
  queryCoupon,
  getTokenMonitorStatus,
  startTokenMonitor,
  stopTokenMonitor,
  getExpiredUsers,
  pollTokenMonitor,
  getPollConfig,
} from "@/api";
import { message, Modal } from "ant-design-vue"; // Add Modal import
import { reactive, ref, onMounted, onUnmounted } from "vue";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { WebSocketCompat } from "@/utils/HttpPoller";

// 启用dayjs插件
dayjs.extend(utc);
dayjs.extend(timezone);

// 表单状态
const formState = reactive({
  phone: "",
  vip: "",
  activityId: "",
  status: "",
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

// Token监控相关状态
const tokenMonitor = reactive({
  isRunning: false,
  loading: false,
  totalUsers: 0,
  expiredCount: 0,
  lastCheck: null,
  websocketConnected: false, // 新增WebSocket连接状态
  voiceEnabled: true, // 语音播报开关
  alwaysNotify: true, // 每轮检查完成都通知
  // 检查进度相关
  checkProgress: {
    visible: false,
    minimized: false,
    current: 0,
    total: 0,
    percentage: 0,
    checkRound: 0,
    expiredFound: 0,
  },
});

// HTTP轮询连接 (替代WebSocket)
let httpPoller = null;
let statusCheckTimer = null; // 定期检查后端状态的定时器

// Token过期通知相关状态
const expiredNotificationVisible = ref(false);
const expiredNotification = reactive({
  count: 0,
  users: [],
});
const notificationCountdown = ref(0); // 不再自动倒计时
const notificationProgress = ref(0);
let countdownTimer = null;

// 列配置
const columns = [
  {
    title: "token",
    dataIndex: "token",
    minWidth: 200,
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
    title: "批次号",
    dataIndex: "activityId",
    minWidth: 130,
  },
  {
    title: "更新时间",
    dataIndex: "updateTime",
    width: 150,
    slots: { customRender: "updateTime" },
  },
  {
    title: "用户状态",
    dataIndex: "status",
    width: 150,
    slots: { customRender: "status" },
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

// 时间格式化函数 - 将GMT时间转换为北京时间
const formatTime = (time) => {
  if (!time) return '-';
  
  try {
    // 将GMT时间转换为北京时间 (UTC+8)
    return dayjs.utc(time).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss');
  } catch (error) {
    console.error('时间格式化错误:', error);
    return time; // 如果转换失败，返回原始时间
  }
};

// 重置表单
const handleReset = () => {
  formState.phone = "";
  formState.vip = "";
  formState.activityId = "";
  formState.status = "";
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
  console.log('🚀 用户列表页面已挂载');
  console.log('初始tokenMonitor状态:', tokenMonitor);
  
  // 读取本地存储的设置
  const savedVoiceEnabled = localStorage.getItem('tokenMonitorVoiceEnabled');
  if (savedVoiceEnabled !== null) {
    tokenMonitor.voiceEnabled = savedVoiceEnabled === 'true';
  }
  
  const savedAlwaysNotify = localStorage.getItem('tokenMonitorAlwaysNotify');
  if (savedAlwaysNotify !== null) {
    tokenMonitor.alwaysNotify = savedAlwaysNotify === 'true';
  }
  
  handleSearch();
  // 获取Token监控状态，并根据状态自动恢复连接
  getMonitorStatus();
  
  // 开始定期检查后端状态
  startStatusCheck();
  
  console.log('✅ 页面初始化完成');
});

// 组件卸载时清理资源
onUnmounted(() => {
  disconnectHttpPoller();
  stopStatusCheck(); // 停止定期状态检查
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
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
  status: "", // Changed from vip to status
});

// 编辑用户点击事件（替换原有handleEdit）
const handleEdit = (record) => {
  editForm.phone = record.phone;
  editForm.token = record.token;
  editForm.status = record.status.toString(); // Changed from vip to status
  editModalVisible.value = true;
};

// 编辑用户提交逻辑
const handleEditSubmit = async () => {
  if (editForm.status === "") {
    message.warning("请选择用户状态");
    return;
  }
  try {
    // 调用切换用户状态接口，只需要传递token参数
    await switchStatus({ token: editForm.token });
    message.success("用户状态更新成功");
    editModalVisible.value = false;
    // 刷新当前页数据
    handleSearch({
      pageNum: pagination.current,
    });
  } catch (err) {
    message.error("用户状态更新失败，请稍后重试");
    console.error("更新用户状态失败:", err);
  }
};
const handlePageChange = (pageNum, pageSize) => {
  handleSearch({
    pageNum: pageNum,
    pageSize,
  });
};

const handlePageSizeChange = (current, size) => {};

// ========== Token监控功能 ==========

// 获取监控状态文本
const getMonitorStatusText = () => {
  if (tokenMonitor.isRunning && tokenMonitor.websocketConnected) {
    return 'Token监控(运行中)';
  } else if (tokenMonitor.isRunning && !tokenMonitor.websocketConnected) {
    return 'Token监控(连接中...)';
  } else {
    return 'Token监控(已停止)';
  }
};

// 显示进度条（如果有进度数据的话）
const showProgressFromButton = () => {
  if (tokenMonitor.checkProgress.total > 0) {
    tokenMonitor.checkProgress.visible = true;
    tokenMonitor.checkProgress.minimized = false;
  }
};

// 切换语音播报开关
const toggleVoice = () => {
  tokenMonitor.voiceEnabled = !tokenMonitor.voiceEnabled;
  const status = tokenMonitor.voiceEnabled ? '已开启' : '已关闭';
  message.info(`Token过期语音提醒${status}`);
  
  // 保存到本地存储
  localStorage.setItem('tokenMonitorVoiceEnabled', tokenMonitor.voiceEnabled.toString());
  
  // 如果开启语音，播放测试音
  if (tokenMonitor.voiceEnabled) {
    setTimeout(() => {
      speakTest();
    }, 500);
  }
};

// 测试语音播报
const speakTest = () => {
  try {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('语音提醒已开启');
      utterance.lang = 'zh-CN';
      utterance.rate = 0.8;
      utterance.volume = 0.6;
      window.speechSynthesis.speak(utterance);
    }
  } catch (error) {
    console.error('测试语音播报失败:', error);
  }
};

// 开始定期检查后端状态
const startStatusCheck = () => {
  // 每30秒检查一次后端状态，确保前后端同步
  statusCheckTimer = setInterval(async () => {
    console.log('🔄 定期检查后端监控状态...');
    await getMonitorStatus();
  }, 30000);
};

// 停止定期检查
const stopStatusCheck = () => {
  if (statusCheckTimer) {
    clearInterval(statusCheckTimer);
    statusCheckTimer = null;
    console.log('⏹️ 已停止定期状态检查');
  }
};

// 获取Token监控状态
const getMonitorStatus = async () => {
  console.log('📡 正在获取Token监控状态...');
  try {
    const res = await getTokenMonitorStatus();
    console.log('📡 获取监控状态响应:', res);
    if (res.code === 200) {
      const monitor = res.data.monitor || {};
      const websocketInfo = res.data.websocket || {};
      
      // 更新监控状态
      tokenMonitor.isRunning = monitor.is_running || false;
      tokenMonitor.totalUsers = monitor.total_users || 0;
      tokenMonitor.expiredCount = monitor.total_expired || 0;
      tokenMonitor.lastCheck = monitor.last_check_time;
      
      console.log('✅ 监控状态更新完成:', tokenMonitor);
      
      // 如果后端监控正在运行，但前端WebSocket未连接，则自动连接
      if (tokenMonitor.isRunning && !tokenMonitor.websocketConnected) {
        console.log('🔄 检测到后端监控运行中，自动连接WebSocket...');
        setTimeout(() => {
          connectHttpPoller();
        }, 1000);
      }
      
      // 如果后端监控已停止，但前端WebSocket还连着，则断开连接
      if (!tokenMonitor.isRunning && tokenMonitor.websocketConnected) {
        console.log('🔄 检测到后端监控已停止，断开WebSocket连接...');
        disconnectHttpPoller();
      }
    } else {
      console.warn('⚠️ 获取监控状态失败:', res);
    }
  } catch (err) {
    console.error('❌ 获取监控状态失败:', err);
  }
};

// 切换Token监控状态
const toggleTokenMonitor = async () => {
  console.log('点击了Token监控按钮，当前状态:', tokenMonitor.isRunning);
  tokenMonitor.loading = true;
  
  try {
    if (tokenMonitor.isRunning) {
      // 停止监控：先断开WebSocket，再停止后端监控
      console.log('正在停止Token监控...');
      disconnectHttpPoller();
      
      const res = await stopTokenMonitor();
      if (res.code === 200) {
        message.success('Token监控已停止');
        tokenMonitor.isRunning = false;
      } else {
        // 即使停止失败，也要更新状态，可能后端已经停止了
        console.warn('停止Token监控API失败，但仍更新前端状态:', res);
        message.warning('Token监控可能已停止，请刷新页面确认状态');
        tokenMonitor.isRunning = false;
      }
    } else {
      // 启动监控：先检查后端状态，避免重复启动
      console.log('正在启动Token监控...');
      
      // 先检查当前状态，避免重复启动
      await getMonitorStatus();
      
      if (tokenMonitor.isRunning) {
        // 后端已经在运行，只需连接WebSocket
        message.info('Token监控已在运行，正在连接WebSocket...');
        if (!tokenMonitor.websocketConnected) {
          setTimeout(() => {
            connectHttpPoller();
          }, 500);
        }
      } else {
        // 后端未运行，启动监控
        const res = await startTokenMonitor();
        if (res.code === 200) {
          message.success('Token监控已启动，正在连接WebSocket...');
          tokenMonitor.isRunning = true;
          
          // 延迟一点再连接WebSocket，确保后端服务完全启动
          setTimeout(() => {
            connectHttpPoller();
          }, 1000);
        } else {
          message.error(res.message || 'Token监控启动失败');
          console.error('启动Token监控失败:', res);
        }
      }
    }
  } catch (err) {
    message.error('操作失败，请稍后重试');
    console.error('切换监控状态失败:', err);
  } finally {
    tokenMonitor.loading = false;
  }
};

// HTTP轮询连接 (替代WebSocket)
const connectHttpPoller = () => {
  if (httpPoller) {
    httpPoller.stop();
  }
  
  console.log('正在启动HTTP轮询...');
  tokenMonitor.websocketConnected = false;
  
  // 添加网络检测
  console.log('🌐 当前网络信息:', {
    userAgent: navigator.userAgent,
    onLine: navigator.onLine,
    connection: navigator.connection ? {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt
    } : '不支持'
  });
  
  try {
    // 使用WebSocket兼容层
    httpPoller = new WebSocketCompat('http://api', []);
    
    httpPoller.onOpen = () => {
      console.log('✅ HTTP轮询连接成功');
      tokenMonitor.websocketConnected = true;
      message.success('HTTP轮询连接成功');
    };
    
    httpPoller.onMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (err) {
        console.error('解析HTTP轮询消息失败:', err);
      }
    };
    
    httpPoller.onClose = (event) => {
      console.log('HTTP轮询连接关闭，code:', event.code, 'reason:', event.reason);
      tokenMonitor.websocketConnected = false;
      
      // 只有在监控运行且不是主动关闭的情况下才重连
      if (tokenMonitor.isRunning && event.code !== 1000) {
        console.log('HTTP轮询意外断开，5秒后尝试重连...');
        setTimeout(connectHttpPoller, 5000);
      }
    };
    
    httpPoller.onError = (error) => {
      console.error('❌ HTTP轮询连接错误:', error);
      tokenMonitor.websocketConnected = false;
      
      // 检测网络连通性
      if (!navigator.onLine) {
        message.error('网络连接已断开，请检查网络连接');
      } else {
        message.error(`HTTP轮询连接失败，正在重试...`);
      }
    };
    
    // 启动轮询
    httpPoller.start();
    
  } catch (err) {
    console.error('创建HTTP轮询连接失败:', err);
    tokenMonitor.websocketConnected = false;
    message.error('创建HTTP轮询连接失败');
  }
};

// 断开HTTP轮询连接
const disconnectHttpPoller = () => {
  console.log('断开HTTP轮询连接...');
  
  if (httpPoller) {
    httpPoller.stop();
    httpPoller = null;
  }
  
  tokenMonitor.websocketConnected = false;
  console.log('HTTP轮询连接已断开');
};

// 处理WebSocket消息
const handleWebSocketMessage = (data) => {
  console.log('收到WebSocket消息:', data);
  
  switch (data.type) {
    case 'welcome':
      console.log('WebSocket欢迎消息:', data.message);
      break;
      
    case 'token_expired':
      handleTokenExpiredNotification(data);
      break;
      
    case 'current_status':
      updateMonitorStatus(data);
      break;
      
    case 'pong':
      console.log('心跳响应:', data.latency_ms + 'ms');
      break;
      
    case 'check_progress':
      handleCheckProgress(data);
      break;
      
    case 'check_completed':
      handleCheckCompleted(data);
      break;
      
    case 'check_started':
      handleCheckStarted(data);
      break;
      
    default:
      console.log('未知消息类型:', data.type);
  }
};

// 处理检查开始消息
const handleCheckStarted = (data) => {
  console.log('🔄 检查开始:', data);
  // 重置进度条状态
  if (tokenMonitor.checkProgress.visible) {
    tokenMonitor.checkProgress.current = 0;
    tokenMonitor.checkProgress.percentage = 0;
    tokenMonitor.checkProgress.checkRound = data.check_round || 0;
  }
};

// 处理检查完成消息
const handleCheckCompleted = (data) => {
  console.log('✅ 检查完成:', data);
  
  // 如果开启了每轮检查都通知，且有过期用户
  if (tokenMonitor.alwaysNotify && tokenMonitor.expiredCount > 0) {
    console.log(`🔔 检查完成，发现${tokenMonitor.expiredCount}个过期用户，准备播报`);
    
    // 从后端获取当前过期用户列表并播报
    getAndNotifyExpiredUsers();
  } else if (tokenMonitor.expiredCount > 0) {
    console.log(`🔕 检查完成，有${tokenMonitor.expiredCount}个过期用户，但已关闭每轮通知`);
  } else {
    console.log('✅ 检查完成，无过期用户');
  }
  
  // 3秒后隐藏进度条
  if (tokenMonitor.checkProgress.visible) {
    setTimeout(() => {
      tokenMonitor.checkProgress.visible = false;
    }, 3000);
  }
};

// 获取并播报过期用户
const getAndNotifyExpiredUsers = async () => {
  try {
    console.log('📡 获取过期用户列表...');
    const res = await getExpiredUsers();
    
    if (res.code === 200 && res.data && res.data.users) {
      const users = res.data.users;
      const count = res.data.count || users.length;
      
      console.log(`📋 获取到${count}个过期用户:`, users);
      
      if (count > 0 && users.length > 0) {
        // 累积过期用户，不替换之前的
        if (expiredNotificationVisible.value) {
          // 如果弹窗已经显示，累积新的过期用户
          const existingPhones = new Set(expiredNotification.users.map(u => u.phone));
          const newUsers = users.filter(u => !existingPhones.has(u.phone));
          
          if (newUsers.length > 0) {
            expiredNotification.users.push(...newUsers);
            expiredNotification.count = expiredNotification.users.length;
            console.log(`🚨 从API累积新的过期用户 ${newUsers.length} 个，总计 ${expiredNotification.count} 个`);
          }
        } else {
          // 如果弹窗未显示，直接设置新数据
          expiredNotification.count = count;
          expiredNotification.users = users;
          console.log(`🚨 从API获取到${count}个过期用户，准备播报`);
        }
        
        // 显示弹窗通知
        showExpiredNotification();
        
        // 语音播报（仅在开启时）
        if (tokenMonitor.voiceEnabled) {
          console.log('🔊 开始语音播报过期用户...');
          speakExpiredNotification(users);
        } else {
          console.log('🔇 语音播报已关闭，跳过播报');
        }
      }
    }
  } catch (error) {
    console.error('❌ 获取过期用户失败:', error);
  }
};

// 处理Token检查进度
const handleCheckProgress = (data) => {
  console.log('Token检查进度:', data);
  
  // 显示进度条
  tokenMonitor.checkProgress.visible = true;
  tokenMonitor.checkProgress.current = data.current || 0;
  tokenMonitor.checkProgress.total = data.total || 0;
  tokenMonitor.checkProgress.percentage = data.percentage || 0;
  tokenMonitor.checkProgress.checkRound = data.check_round || 0;
  tokenMonitor.checkProgress.expiredFound = data.expired_found || 0;
  
  // 如果检查完成（进度100%），3秒后自动隐藏进度条
  if (data.percentage >= 100) {
    setTimeout(() => {
      tokenMonitor.checkProgress.visible = false;
    }, 3000);
  }
};

// 隐藏进度条
const hideProgress = () => {
  tokenMonitor.checkProgress.visible = false;
};

// 最小化进度条
const minimizeProgress = () => {
  tokenMonitor.checkProgress.minimized = true;
};

// 展开进度条
const showProgress = () => {
  tokenMonitor.checkProgress.minimized = false;
};

// 语音播报功能
const speakExpiredNotification = (users) => {
  console.log('🔊 开始语音播报，用户数量:', users.length);
  try {
    // 检查浏览器是否支持语音合成
    if ('speechSynthesis' in window) {
      // 最多播报前5个手机号，避免播报时间过长
      const maxCount = 5;
      const displayUsers = users.slice(0, maxCount);
      const phoneNumbers = displayUsers.map(user => {
        const phone = user.phone || '未知号码';
        // 直接播报完整手机号，不做任何处理
        return phone;
      }).join('，');
      
      let text;
      if (users.length <= maxCount) {
        text = `注意，以下手机号Token已过期：${phoneNumbers}，请及时处理`;
      } else {
        text = `注意，以下手机号Token已过期：${phoneNumbers}，还有${users.length - maxCount}个，请及时处理`;
      }
      
      console.log(`🔊 准备播报文本: ${text}`);
      
      const speak = (text, times = 0) => {
        if (times >= 2) {
          console.log('🔊 语音播报完成，已播报2次');
          return; // 只播报2次
        }
        
        console.log(`🔊 开始第${times + 1}次语音播报`);
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN'; // 设置为中文
        utterance.rate = 0.7; // 语速适中，确保手机号能听清但不会太慢
        utterance.pitch = 1.0; // 正常音调
        utterance.volume = 0.8; // 音量
        
        utterance.onstart = () => {
          console.log(`🔊 第${times + 1}次语音播报开始`);
        };
        
        utterance.onend = () => {
          console.log(`🔊 第${times + 1}次语音播报结束`);
          // 播报结束后，延迟3秒播报第二次（给更多时间理解手机号）
          if (times < 1) {
            console.log('🔊 3秒后开始第二次播报...');
            setTimeout(() => {
              speak(text, times + 1);
            }, 3000);
          }
        };
        
        utterance.onerror = (event) => {
          console.error('🔊 语音播报失败:', event);
        };
        
        window.speechSynthesis.speak(utterance);
      };
      
      speak(text);
    } else {
      console.warn('浏览器不支持语音合成功能');
    }
  } catch (error) {
    console.error('语音播报出错:', error);
  }
};

// 处理Token过期通知
const handleTokenExpiredNotification = (data) => {
  console.log('🔔 收到Token过期通知:', data);
  
  try {
    // 更新过期用户信息，添加安全检查
    const count = data.count || 0;
    const users = Array.isArray(data.expired_users) ? data.expired_users : [];
    
    console.log(`🔔 处理过期通知 - 数量: ${count}, 用户: `, users);
    
    // 只有当有过期用户时才显示通知和播报
    if (count > 0 && users.length > 0) {
      // 累积过期用户，不替换之前的
      if (expiredNotificationVisible.value) {
        // 如果弹窗已经显示，累积新的过期用户
        const existingPhones = new Set(expiredNotification.users.map(u => u.phone));
        const newUsers = users.filter(u => !existingPhones.has(u.phone));
        
        if (newUsers.length > 0) {
          expiredNotification.users.push(...newUsers);
          expiredNotification.count = expiredNotification.users.length;
          console.log(`🚨 累积新的过期用户 ${newUsers.length} 个，总计 ${expiredNotification.count} 个`);
        }
      } else {
        // 如果弹窗未显示，直接设置新数据
        expiredNotification.count = count;
        expiredNotification.users = users;
        console.log(`🚨 发现 ${count} 个过期用户，准备显示通知和播报`);
      }
      
      // 显示弹窗通知
      showExpiredNotification();
      
      // 语音播报过期通知（仅在开启时）
      if (tokenMonitor.voiceEnabled) {
        console.log('🔊 开始语音播报...');
        speakExpiredNotification(users);
      } else {
        console.log('🔇 语音播报已关闭，跳过播报');
      }
    } else {
      console.log('🔔 未检测到新的过期用户');
    }
    
    // 更新监控状态
    tokenMonitor.expiredCount = data.total_expired || 0;
    console.log('📊 更新总过期数量:', tokenMonitor.expiredCount);
  } catch (error) {
    console.error('处理Token过期通知时出错:', error);
  }
};

// 显示Token过期通知弹窗
const showExpiredNotification = () => {
  try {
    console.log('🚨 显示Token过期通知弹窗');
    
    // 清除之前的定时器（如果有）
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
    
    // 显示弹窗，不再自动关闭
    expiredNotificationVisible.value = true;
    notificationCountdown.value = 0; // 不显示倒计时
    notificationProgress.value = 0;
    
    console.log('🚨 Token过期通知弹窗已显示，需手动关闭');
  } catch (error) {
    console.error('显示过期通知时出错:', error);
  }
};

// 关闭Token过期通知
const closeExpiredNotification = () => {
  console.log('✖️ 关闭Token过期通知弹窗');
  expiredNotificationVisible.value = false;
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  
  // 清空通知数据，为下次通知做准备
  expiredNotification.count = 0;
  expiredNotification.users = [];
  console.log('✖️ Token过期通知已关闭，数据已清空');
};

// 查看过期详情
const viewExpiredDetails = () => {
  closeExpiredNotification();
  // 可以跳转到详细页面或显示更多信息
  message.info('查看详情功能待开发');
};

// 更新监控状态
const updateMonitorStatus = (data) => {
  tokenMonitor.totalUsers = data.total_users || 0;
  tokenMonitor.expiredCount = data.total_expired || 0;
  tokenMonitor.lastCheck = data.last_check;
  tokenMonitor.isRunning = data.is_running || false;
};

// HTTP轮询不需要心跳保活
</script>

<style scoped>
.expired-notification {
  text-align: center;
  padding: 20px 0;
}

.notification-icon {
  margin-bottom: 16px;
}

.notification-content h3 {
  color: #faad14;
  margin-bottom: 16px;
  font-size: 18px;
}

.expired-users {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 16px;
}

.expired-user-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.expired-user-item:last-child {
  border-bottom: none;
}

.user-token {
  color: #666;
  font-size: 12px;
  margin-left: 8px;
}

.notification-footer {
  margin-top: 16px;
}

.auto-close-text {
  margin-top: 8px;
  color: #666;
  font-size: 12px;
}

.notification-actions {
  text-align: center;
  margin-top: 16px;
}

.notification-actions .ant-btn {
  margin: 0 8px;
}

/* Token检查进度条样式 */
.token-check-progress {
  position: relative;
  z-index: 10;
  margin-bottom: 8px;
}

.progress-bar-container {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 8px 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.progress-title {
  font-size: 13px;
  font-weight: 500;
  color: #1890ff;
}

.progress-actions {
  display: flex;
  gap: 4px;
}

.progress-content {
  margin-top: 6px;
}

.progress-info {
  margin-top: 4px;
  font-size: 11px;
  color: #666;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-minimized {
  text-align: center;
}

.mini-progress {
  font-size: 12px;
  color: #1890ff;
  font-weight: 500;
}

@media (max-width: 768px) {
  .progress-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }
  
  .progress-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
