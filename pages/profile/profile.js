// pages/profile/profile.js
Page({
  data: {
    userInfo: {},
    isLoggedIn: false,
    roleName: '',
    functions: [
      { name: '我的预约', icon: '/static/report.svg', url: '/pages/my_appointment/my_appointment' },
      { name: '我的复诊', icon: '/static/report.svg', url: '/pages/my_followup/my_followup' },
      { name: '复诊表单', icon: '/static/assessment.svg', url: '/pages/followup_form/followup_form' },
      { name: '我的屏蔽', icon: '/static/filter.svg', url: '/pages/my_block/my_block' },
      { name: '就诊人管理', icon: '/static/profile.svg', url: '/pages/patient_manage/patient_manage' },
      { name: 'BMI计算器', icon: '/static/weight.svg', url: '/pages/bmi_calculator/bmi_calculator' },
      { name: '建议医嘱', icon: '/static/report.svg', url: '/pages/medical_advice/medical_advice' },
      { name: '地址管理', icon: '/static/home.svg', url: '/pages/address_manage/address_manage' },
      { name: '功能引导', icon: '/static/article.svg', url: '/pages/function_guide/function_guide' },
      { name: '意见反馈', icon: '/static/message.svg', url: '/pages/feedback/feedback' },
      { name: '设置', icon: '/static/filter.svg', url: '/pages/settings/settings' }
    ]
  },

  onShow: function () {
    const token = wx.getStorageSync('token');
    const name = wx.getStorageSync('name');
    const phone = wx.getStorageSync('phone');
    const role = wx.getStorageSync('role');
    const avatar = wx.getStorageSync('avatar'); // 获取头像

    let roleName = '';
    if (role === 0 || role === 1) roleName = '医生';
    else if (role === 2) roleName = '患者';

    if (token) {
      this.setData({
        isLoggedIn: true,
        userInfo: {
          name: name || '用户',
          phone: phone || '',
          avatar: avatar || '' // 使用存储的头像
        },
        roleName: roleName
      });
    } else {
      this.setData({
        isLoggedIn: false,
        userInfo: {},
        roleName: ''
      });
    }
  },

  onChooseAvatar: function (e) {
    const { avatarUrl } = e.detail;
    console.log('Selected avatar:', avatarUrl);

    // Save to storage
    wx.setStorageSync('avatar', avatarUrl);

    // Update local data
    this.setData({
      'userInfo.avatar': avatarUrl
    });

    // Optional: Upload to server here if needed
  },

  goToLogin: function () {
    if (!this.data.isLoggedIn) {
      wx.navigateTo({ url: '/pages/login/login' });
    }
  },

  navTo: function (e) {
    const url = e.currentTarget.dataset.url;
    if (url) {
      wx.navigateTo({ url: url });
    }
  },

  handleLogout: function () {
    wx.clearStorageSync();
    this.onShow();
    wx.reLaunch({ url: '/pages/index/index' });
  }
})
