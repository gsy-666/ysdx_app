// pages/profile/profile.js
Page({
  data: {
    userInfo: {},
    isLoggedIn: false,
    functions: [
      { name: '我的预约', icon: '/static/report.svg' },
      { name: '我的复诊', icon: '/static/report.svg' },
      { name: '复诊表单', icon: '/static/assessment.svg' },
      { name: '我的屏蔽', icon: '/static/filter.svg' },
      { name: '就诊人管理', icon: '/static/profile.svg' },
      { name: 'BMI计算器', icon: '/static/weight.svg' },
      { name: '建议医嘱', icon: '/static/report.svg' },
      { name: '地址管理', icon: '/static/home.svg' },
      { name: '功能引导', icon: '/static/article.svg' },
      { name: '意见反馈', icon: '/static/message.svg' },
      { name: '设置', icon: '/static/filter.svg' }
    ]
  },

  onShow: function () {
    const token = wx.getStorageSync('token');
    const name = wx.getStorageSync('name');
    const phone = wx.getStorageSync('phone');

    if (token) {
      this.setData({
        isLoggedIn: true,
        userInfo: {
          name: name || '用户',
          phone: phone || ''
        }
      });
    } else {
      this.setData({
        isLoggedIn: false,
        userInfo: {}
      });
    }
  },

  goToLogin: function () {
    wx.navigateTo({
      url: '/pages/login/login',
    });
  },

  handleLogout: function () {
    wx.removeStorageSync('token');
    wx.removeStorageSync('name');
    wx.removeStorageSync('id');
    wx.removeStorageSync('phone');

    this.setData({ isLoggedIn: false, userInfo: {} });
    wx.showToast({ title: '已退出登录', icon: 'none' });
  },

  navTo(e) {
    const url = e.currentTarget.dataset.url;
    if (url) wx.navigateTo({ url });
  },

  navToMenu(e) {
    const idx = e.currentTarget.dataset.idx;
    const item = this.data.functions[idx];
    wx.showToast({ title: item.name + ' 暂未开放', icon: 'none' });
  }
})
