Page({
  data: {
    types: ["功能异常", "体验建议", "服务投诉", "其他"],
    typeIndex: 0,
    content: ""
  },
  onTypeChange: function(e) {
    this.setData({ typeIndex: e.detail.value });
  },
  onContentInput: function(e) {
    this.setData({ content: e.detail.value });
  },
  submitFeedback: function() {
    if(!this.data.content) {
      wx.showToast({ title: "请输入反馈内容", icon: "none" });
      return;
    }
    wx.showToast({ title: "提交成功", icon: "success" });
    setTimeout(() => { wx.navigateBack(); }, 1500);
  }
})