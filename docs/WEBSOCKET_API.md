# Token监控系统 WebSocket API 对接文档

## 📋 概述
本文档介绍如何对接Token监控系统的WebSocket实时通信接口。

**WebSocket地址**: `ws://localhost:8765`

---

## 🔌 连接和断开

### 连接
```javascript
const websocket = new WebSocket('ws://localhost:8765');

websocket.onopen = () => {
  console.log('WebSocket连接成功');
};

websocket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  handleMessage(data);
};

websocket.onclose = () => {
  console.log('WebSocket连接关闭');
};

websocket.onerror = (error) => {
  console.error('WebSocket连接错误:', error);
};
```

---

## 📨 消息类型和格式

### 1. 欢迎消息 (welcome)
**触发时机**: 连接建立时
```json
{
  "type": "welcome",
  "message": "WebSocket连接成功",
  "server_time": "2025-09-03T09:26:58.653925",
  "client_address": "('::1', 53678, 0, 0)"
}
```

### 2. 当前状态 (current_status)
**触发时机**: 连接建立后，定期状态更新
```json
{
  "type": "current_status",
  "total_expired": 4,
  "expired_users": [
    {
      "user_id": "12345",
      "phone": "13800138000",
      "token": "abc123...",
      "expired_time": "2025-09-03T09:27:57.108204"
    }
  ],
  "last_check": "2025-09-03T09:25:25.058973",
  "check_round": 3,
  "is_running": true,
  "total_users": 410
}
```

### 3. 检查开始 (check_started) ⭐
**触发时机**: 每轮Token检查开始时
```json
{
  "type": "check_started",
  "check_round": 4,
  "timestamp": "2025-09-03T09:27:57.108718",
  "message": "开始第 4 轮Token检查"
}
```

### 4. 检查进度 (check_progress) ⭐
**触发时机**: Token检查过程中，实时进度更新
```json
{
  "type": "check_progress",
  "current": 120,
  "total": 410,
  "percentage": 29.3,
  "check_round": 4,
  "expired_found": 3,
  "timestamp": "2025-09-03T09:27:40.120950"
}
```

### 5. Token过期通知 (token_expired) ⭐ 核心消息
**触发时机**: 发现Token过期时
```json
{
  "type": "token_expired",
  "count": 4,
  "total_expired": 4,
  "expired_users": [
    {
      "user_id": "12345",
      "phone": "13800138000",
      "token": "abc123...",
      "expired_time": "2025-09-03T09:27:57.108204"
    },
    {
      "user_id": "67890",
      "phone": "13900139000",
      "token": "def456...",
      "expired_time": "2025-09-03T09:27:57.108204"
    }
  ],
  "timestamp": "2025-09-03T09:27:57.108204",
  "check_round": 4
}
```

### 6. 检查完成 (check_completed) ⭐
**触发时机**: 每轮Token检查完成时
```json
{
  "type": "check_completed",
  "timestamp": "2025-09-03T09:27:57.108204",
  "check_round": 4,
  "duration": 59.46917390823364,
  "total_users": 410,
  "total_expired": 4,
  "new_expired_this_round": 2
}
```

### 7. 心跳响应 (pong)
**触发时机**: 响应客户端心跳包
```json
{
  "type": "pong",
  "timestamp": "2025-09-03T09:27:28.657779",
  "server_time": "2025-09-03T09:27:28.657779",
  "latency_ms": 12.5
}
```

---

## 💻 前端处理示例

### 完整消息处理函数
```javascript
const handleWebSocketMessage = (data) => {
  console.log('收到WebSocket消息:', data);
  
  switch (data.type) {
    case 'welcome':
      console.log('WebSocket欢迎消息:', data.message);
      break;
      
    case 'current_status':
      updateMonitorStatus(data);
      break;
      
    case 'check_started':
      handleCheckStarted(data);
      break;
      
    case 'check_progress':
      handleCheckProgress(data);
      break;
      
    case 'token_expired':
      handleTokenExpiredNotification(data);
      break;
      
    case 'check_completed':
      handleCheckCompleted(data);
      break;
      
    case 'pong':
      console.log('心跳响应:', data.latency_ms + 'ms');
      break;
      
    default:
      console.log('未知消息类型:', data.type);
  }
};
```

### Token过期通知处理
```javascript
const handleTokenExpiredNotification = (data) => {
  console.log('🔔 收到Token过期通知:', data);
  
  try {
    // 更新过期用户信息 - 注意字段名已更改
    const count = data.count || 0;
    const users = Array.isArray(data.expired_users) ? data.expired_users : [];
    
    console.log(`🔔 处理过期通知 - 数量: ${count}, 用户: `, users);
    
    if (count > 0 && users.length > 0) {
      // 显示弹窗通知
      showExpiredNotification(users);
      
      // 语音播报
      if (voiceEnabled) {
        speakExpiredNotification(users);
      }
    }
  } catch (error) {
    console.error('处理Token过期通知时出错:', error);
  }
};
```

### 检查进度处理
```javascript
const handleCheckProgress = (data) => {
  console.log('Token检查进度:', data);
  
  // 更新进度条
  updateProgressBar({
    current: data.current || 0,
    total: data.total || 0,
    percentage: data.percentage || 0,
    round: data.check_round || 0,
    expiredFound: data.expired_found || 0
  });
};
```

### 检查完成处理
```javascript
const handleCheckCompleted = (data) => {
  console.log('✅ 检查完成:', data);
  
  // 可以在这里触发额外的通知逻辑
  if (alwaysNotify && data.total_expired > 0) {
    // 获取最新过期用户列表并重新播报
    getAndNotifyExpiredUsers();
  }
  
  // 隐藏进度条
  setTimeout(() => {
    hideProgressBar();
  }, 3000);
};
```

---

## 🎯 关键字段变更说明

### ⚠️ 重要变更
- **过期用户字段名变更**: `new_expired_users` → `expired_users`
- **影响消息**: `token_expired`
- **兼容性**: 需要更新前端代码以使用新字段名

### 变更对比
```javascript
// 旧版本 ❌
const users = data.new_expired_users || [];

// 新版本 ✅
const users = data.expired_users || [];
```

---

## 🔧 实现建议

### 1. 错误处理
```javascript
websocket.onerror = (error) => {
  console.error('WebSocket错误:', error);
  // 显示用户友好的错误提示
  showErrorMessage('连接失败，请检查网络');
};

websocket.onclose = (event) => {
  console.log('WebSocket关闭，code:', event.code);
  
  // 自动重连逻辑
  if (event.code !== 1000) { // 非正常关闭
    setTimeout(() => {
      connectWebSocket();
    }, 5000);
  }
};
```

### 2. 心跳保活
```javascript
// 每30秒发送心跳
setInterval(() => {
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(JSON.stringify({
      type: 'ping',
      timestamp: new Date().toISOString()
    }));
  }
}, 30000);
```

### 3. 消息去重
```javascript
let lastNotificationTime = 0;
const NOTIFICATION_INTERVAL = 5000; // 5秒内不重复通知

const handleTokenExpiredNotification = (data) => {
  const now = Date.now();
  if (now - lastNotificationTime < NOTIFICATION_INTERVAL) {
    console.log('跳过重复通知');
    return;
  }
  
  lastNotificationTime = now;
  // 处理通知...
};
```

---

## 📊 完整的工作流程

```
1. 连接建立 → welcome消息
2. 获取当前状态 → current_status消息
3. 检查开始 → check_started消息
4. 检查进度 → check_progress消息 (多次)
5. 发现过期 → token_expired消息
6. 检查完成 → check_completed消息
7. 等待下轮 → 重复步骤3-6
```

---

## 🚀 快速集成代码

```javascript
class TokenMonitorWebSocket {
  constructor(url = 'ws://localhost:8765') {
    this.url = url;
    this.websocket = null;
    this.reconnectTimer = null;
    this.heartbeatTimer = null;
  }
  
  connect() {
    this.websocket = new WebSocket(this.url);
    
    this.websocket.onopen = () => {
      console.log('WebSocket连接成功');
      this.startHeartbeat();
    };
    
    this.websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };
    
    this.websocket.onclose = (event) => {
      console.log('WebSocket连接关闭');
      this.stopHeartbeat();
      
      if (event.code !== 1000) {
        this.reconnectTimer = setTimeout(() => {
          this.connect();
        }, 5000);
      }
    };
    
    this.websocket.onerror = (error) => {
      console.error('WebSocket错误:', error);
    };
  }
  
  handleMessage(data) {
    switch (data.type) {
      case 'token_expired':
        this.onTokenExpired(data.expired_users, data.count);
        break;
      case 'check_progress':
        this.onProgress(data.current, data.total, data.percentage);
        break;
      case 'check_completed':
        this.onCheckCompleted(data);
        break;
      // ... 其他消息类型
    }
  }
  
  // 重写这些方法以实现自定义逻辑
  onTokenExpired(users, count) {
    console.log(`发现${count}个过期用户:`, users);
  }
  
  onProgress(current, total, percentage) {
    console.log(`检查进度: ${current}/${total} (${percentage}%)`);
  }
  
  onCheckCompleted(data) {
    console.log('检查完成:', data);
  }
  
  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.websocket?.readyState === WebSocket.OPEN) {
        this.websocket.send(JSON.stringify({
          type: 'ping',
          timestamp: new Date().toISOString()
        }));
      }
    }, 30000);
  }
  
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
  
  disconnect() {
    if (this.websocket) {
      this.websocket.close(1000, '主动断开');
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.stopHeartbeat();
  }
}

// 使用示例
const monitor = new TokenMonitorWebSocket();
monitor.onTokenExpired = (users, count) => {
  alert(`发现${count}个Token过期用户!`);
};
monitor.connect();
```

---

## 🔍 调试建议

1. **开启详细日志**: 在处理每种消息类型时都添加 `console.log`
2. **监控消息频率**: 注意 `check_progress` 消息的频率，避免UI卡顿
3. **测试重连机制**: 模拟网络断开，验证自动重连功能
4. **性能优化**: 对高频消息（如进度更新）进行防抖处理

---

这份文档涵盖了Token监控系统WebSocket API的所有消息类型和字段变更。最重要的变更是 `token_expired` 消息中的 `new_expired_users` 字段改为了 `expired_users`。



