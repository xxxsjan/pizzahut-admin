/**
 * HTTP轮询器 - 替代WebSocket的解决方案
 * 提供与WebSocket相似的API接口，实现实时通信功能
 */
class HttpPoller {
  constructor(options = {}) {
    // 配置参数
    this.baseUrl = options.baseUrl || '/api';
    this.interval = options.interval || 2000; // 默认2秒轮询
    this.minInterval = options.minInterval || 1000; // 最小1秒
    this.maxInterval = options.maxInterval || 30000; // 最大30秒
    this.messageTypes = options.messageTypes || 'all';
    this.debug = options.debug || false;
    
    // 状态管理
    this.isPolling = false;
    this.lastVersion = 0;
    this.pollTimer = null;
    this.retryCount = 0;
    this.maxRetries = 5;
    
    // WebSocket兼容属性
    this.readyState = 0; // 0: CONNECTING, 1: OPEN, 2: CLOSING, 3: CLOSED
    
    // 事件处理器 (WebSocket兼容)
    this.onOpen = null;
    this.onMessage = null;
    this.onClose = null;
    this.onError = null;
    
    this.log('HttpPoller 初始化完成');
  }
  
  /**
   * 启动轮询 (相当于WebSocket的connect)
   */
  start() {
    if (this.isPolling) {
      this.log('轮询已经在运行中');
      return;
    }
    
    this.log('启动HTTP轮询...');
    this.isPolling = true;
    this.readyState = 0; // CONNECTING
    this.retryCount = 0;
    
    // 立即进行第一次轮询
    this.poll();
  }
  
  /**
   * 停止轮询 (相当于WebSocket的close)
   */
  stop() {
    this.log('停止HTTP轮询...');
    this.isPolling = false;
    this.readyState = 3; // CLOSED
    
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
    
    // 触发关闭事件
    if (this.onClose) {
      this.onClose({ code: 1000, reason: '主动关闭' });
    }
  }
  
  /**
   * 发送消息 (WebSocket兼容接口)
   * HTTP轮询模式下，这个方法主要用于兼容性
   */
  send(data) {
    this.log('HTTP轮询模式下发送消息:', data);
    // 在HTTP轮询模式下，消息发送通常通过其他API接口处理
    // 这里主要是为了保持WebSocket接口兼容性
  }
  
  /**
   * 执行轮询请求
   */
  async poll() {
    if (!this.isPolling) {
      return;
    }
    
    try {
      const url = `${this.baseUrl}/token-monitor/poll?last_version=${this.lastVersion}&types=${this.messageTypes}`;
      this.log(`发起轮询请求: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000 // 10秒超时
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // 检查响应格式
      if (data.code !== 200 && data.code !== 0) {
        throw new Error(data.message || '服务器返回错误');
      }
      
      // 处理成功响应
      this.handlePollSuccess(data.data);
      
    } catch (error) {
      this.handlePollError(error);
    }
  }
  
  /**
   * 处理轮询成功响应
   */
  handlePollSuccess(data) {
    // 第一次连接成功
    if (this.readyState === 0) {
      this.readyState = 1; // OPEN
      this.log('HTTP轮询连接成功');
      if (this.onOpen) {
        this.onOpen({ type: 'open' });
      }
    }
    
    // 重置重试计数
    this.retryCount = 0;
    
    // 更新版本号
    if (data.version) {
      this.lastVersion = data.version;
    }
    
    // 处理新消息
    if (data.has_changes && data.messages && data.messages.length > 0) {
      this.log(`收到 ${data.messages.length} 条新消息`);
      
      data.messages.forEach(message => {
        // 模拟WebSocket消息格式
        const event = {
          data: JSON.stringify(message),
          type: 'message'
        };
        
        if (this.onMessage) {
          this.onMessage(event);
        }
      });
    }
    
    // 调度下次轮询
    this.scheduleNextPoll();
  }
  
  /**
   * 处理轮询错误
   */
  handlePollError(error) {
    this.log(`轮询错误: ${error.message}`);
    this.retryCount++;
    
    // 触发错误事件
    if (this.onError) {
      this.onError({
        error: error,
        retryCount: this.retryCount,
        type: 'error'
      });
    }
    
    // 检查是否超过最大重试次数
    if (this.retryCount >= this.maxRetries) {
      this.log(`重试次数超过限制 (${this.maxRetries})，停止轮询`);
      this.stop();
      return;
    }
    
    // 指数退避重试
    const retryDelay = Math.min(this.interval * Math.pow(2, this.retryCount - 1), this.maxInterval);
    this.log(`${retryDelay}ms 后重试 (第${this.retryCount}次)`);
    
    this.scheduleNextPoll(retryDelay);
  }
  
  /**
   * 调度下次轮询
   */
  scheduleNextPoll(delay = null) {
    if (!this.isPolling) {
      return;
    }
    
    const nextDelay = delay || this.interval;
    
    this.pollTimer = setTimeout(() => {
      this.poll();
    }, nextDelay);
  }
  
  /**
   * 调试日志
   */
  log(...args) {
    if (this.debug) {
      console.log('[HttpPoller]', ...args);
    }
  }
  
  /**
   * 获取当前状态信息
   */
  getStatus() {
    return {
      isPolling: this.isPolling,
      readyState: this.readyState,
      lastVersion: this.lastVersion,
      retryCount: this.retryCount,
      interval: this.interval
    };
  }
  
  /**
   * 动态调整轮询间隔
   */
  setInterval(newInterval) {
    this.interval = Math.max(this.minInterval, Math.min(newInterval, this.maxInterval));
    this.log(`轮询间隔调整为: ${this.interval}ms`);
  }
}

// WebSocket兼容层 - 提供完全兼容WebSocket的接口
class WebSocketCompat extends HttpPoller {
  constructor(url, protocols = []) {
    // 从WebSocket URL中提取baseUrl
    let baseUrl = '/api';
    if (url) {
      try {
        const wsUrl = new URL(url);
        baseUrl = `/api`; // 固定使用 /api 作为基础路径
      } catch (e) {
        // 忽略URL解析错误，使用默认值
      }
    }
    
    super({
      baseUrl: baseUrl,
      debug: true
    });
    
    this.url = url;
    this.protocol = protocols[0] || '';
    
    // 自动启动连接
    setTimeout(() => {
      this.start();
    }, 0);
  }
  
  // WebSocket标准方法
  close(code = 1000, reason = '') {
    this.stop();
  }
  
  // WebSocket标准属性
  get url() { return this._url; }
  set url(value) { this._url = value; }
  
  get protocol() { return this._protocol; }
  set protocol(value) { this._protocol = value; }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HttpPoller, WebSocketCompat };
} else if (typeof window !== 'undefined') {
  window.HttpPoller = HttpPoller;
  window.WebSocketCompat = WebSocketCompat;
}

export { HttpPoller, WebSocketCompat };
