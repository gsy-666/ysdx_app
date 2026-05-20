// pages/connect/chat/chat.js
const request = require('../../../utils/request.js').request;

Page({
  data: {
    patientId: '', // Here assuming this page acts as Doctor view OR Patient view
    chatType: 'doctor', // 'doctor' or 'ai'
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
    // Multi-threading simulated via WebSocket
    this.connectBox();
  },

  connectBox() {
    // Real implementation would use wx.connectSocket with STOMP protocol
    // Since we cannot easily import Stomp.js without npm build steps in simple project, 
    // we simulate the "Multi-threaded" async messing feeling.

    // In a real scenario:
    /*
    wx.connectSocket({
        url: 'ws://127.0.0.1:8080/ws',
    });
    wx.onSocketOpen(() => {
        // STOMP Connect Frame
        const connectFrame = "CONNECT\naccept-version:1.1\n\n\0";
        wx.sendSocketMessage({ data: connectFrame });
    });
    */

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
      // 调用火山引擎（火山方舟） AI 接口
      wx.showLoading({ title: '思考中...' });
      wx.request({
        url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions', // 火山方舟 OpenAI 兼容接口地址
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 4627f616-bbd0-4cf7-ba6b-0fb4781c2383'
        },
        data: {
          model: 'ep-m-20260215231635-7l2n5',
          messages: [
            { role: 'system', content: '你是AI中医助手，请用专业且友善的语气回答患者的问题。' },
            { role: 'user', content: msg.content }
          ]
        },
        success: (res) => {
          wx.hideLoading();
          if (res.data && res.data.choices && res.data.choices.length > 0) {
            const aiReply = res.data.choices[0].message.content;
            const reply = {
              id: Date.now() + 1,
              type: 'other',
              content: aiReply,
              time: new Date().toTimeString().substring(0, 5)
            };
            const newList = this.data.chatList;
            newList.push(reply);
            this.setData({ chatList: newList });
          } else {
            wx.showToast({ title: 'AI回复异常', icon: 'none' });
          }
        },
        fail: (err) => {
          wx.hideLoading();
          wx.showToast({ title: '请求AI失败', icon: 'none' });
          console.error('AI API Error:', err);
        }
      });
    } else {
      // Simulate Async/Multi-thread reply for Doctor
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