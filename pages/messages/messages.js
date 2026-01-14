Page({
  data: {
    aiUnread: 0,
    lastAiTime: '刚刚'
  },
  onShow: function() {
    // Check local storage or API for unread count
  },
  goToChat: function() {
    // Navigate to Chat page
    wx.navigateTo({
      url: '/pages/connect/chat/chat?doctorId=1&doctorName=AI 健康助手'
    })
  },
  goToSystem: function() {
    wx.showToast({ title: '暂无新通知', icon: 'none' })
  }
})
