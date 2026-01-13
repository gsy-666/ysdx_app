// pages/connect/chat/chat.js
const request = require('../../../utils/request.js').request;

Page({
  data: {
    patientId: '', // Here assuming this page acts as Doctor view OR Patient view
    chatList: [
      { id: 1, type: 'other', content: '您好，请问有什么可以帮您？', time: '10:00' }
    ],
    inputValue: '',
    wsClosed: true
  },

  onLoad(options) {
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

    // Simulate Async/Multi-thread reply
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
  },

  bindInput(e) {
    this.setData({ inputValue: e.detail.value });
  }
})