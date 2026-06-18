// pages/connect/chat/chat.js
Page({
  data: {
    patientId: '',
    chatType: 'doctor',
    chatList: [
      { id: 1, type: 'other', content: '您好，请问有什么可以帮您？', time: '10:00' }
    ],
    inputValue: '',
    wsClosed: true
  },

  onLoad(options) {
    if (options.type) {
      this.setData({ chatType: options.type });
    }
    this.connectBox();
  },

  connectBox() {
    this.setData({ wsClosed: false });
  },

  send() {
    if (!this.data.inputValue) return;

    const msg = {
      id: Date.now(),
      type: 'self',
      content: this.data.inputValue,
      time: new Date().toTimeString().substring(0, 5)
    };

    const list = this.data.chatList;
    list.push(msg);
    this.setData({ chatList: list, inputValue: '' });

    if (this.data.chatType === 'ai') {
      // ⚠️ 已废弃：直接调用豆包 API（安全风险）
      // 新逻辑：调用后端报告生成接口
      wx.showLoading({ title: '分析中...' });

      // TODO: 替换为实际的后端地址
      const backendUrl = 'http://localhost:8080/api/report/generate/mock';

      wx.request({
        url: backendUrl,
        method: 'POST',
        header: {
          'Content-Type': 'application/json'
          // 如需用户认证，添加 Authorization header
        },
        data: {
          // Mock 模式：传空或不传，使用默认 Mock 数据
          // 真实模式：传入三视图数据
        },
        success: (res) => {
          wx.hideLoading();
          if (res.data && res.data.success) {
            const reportData = res.data.data;
            const reply = {
              id: Date.now() + 1,
              type: 'other',
              content: reportData.finalReport || '报告生成失败',
              time: new Date().toTimeString().substring(0, 5)
            };
            const newList = this.data.chatList;
            newList.push(reply);
            this.setData({ chatList: newList });
          } else {
            wx.showToast({
              title: res.data.message || '生成报告失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          wx.hideLoading();
          wx.showToast({ title: '请求失败，请检查网络', icon: 'none' });
          console.error('Backend API Error:', err);
        }
      });
    } else {
      // 医生模式
      setTimeout(() => {
        const reply = {
          id: Date.now() + 1,
          type: 'other',
          content: '收到您的消息：' + msg.content,
          time: new Date().toTimeString().substring(0, 5)
        };
        const newList = this.data.chatList;
        newList.push(reply);
        this.setData({ chatList: newList });
      }, 1000);
    }
  },

  bindInput(e) {
    this.setData({ inputValue: e.detail.value });
  }
})
