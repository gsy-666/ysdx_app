Page({
  data: {},
  onLogout: function () {
    wx.showModal({
      title: "提示",
      content: "确定要退出登录吗？",
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: "已退出", icon: "none" });
          setTimeout(() => { wx.navigateBack(); }, 1000);
        }
      }
    });
  }
})