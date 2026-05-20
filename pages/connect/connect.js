// pages/connect/connect.js
Page({
  data: {
    doctors: [
      { name: '王主任', title: '主任医师', dept: '内分泌科' },
      { name: '李医生', title: '主治医师', dept: '减重中心' },
      { name: '张医生', title: '主治医师', dept: '中医科' }
    ]
  },
  goAIChat() {
    wx.navigateTo({
      url: '/pages/connect/chat/chat?type=ai',
    });
  },
  goChat(e) {
    wx.navigateTo({
      url: '/pages/connect/chat/chat?type=doctor',
    });
  }
})