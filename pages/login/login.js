const request = require('../../utils/request.js').request;

Page({
  data: {
    phone: '',
    password: '',
    loading: false
  },

  handleLogin: function () {
    if (!this.data.phone || !this.data.password) {
      wx.showToast({
        title: '请输入手机号和密码',
        icon: 'none'
      });
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(this.data.phone)) {
      wx.showToast({
        title: '手机号格式错误',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    request('/sysAdmin/login', 'POST', {
      phone: this.data.phone,
      password: this.data.password
    }).then(res => {
      // res is `content` from response
      wx.setStorageSync('token', res.token);
      wx.setStorageSync('id', res.id);
      wx.setStorageSync('role', res.role);
      wx.setStorageSync('name', res.name);
      wx.setStorageSync('phone', res.phone);

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });

      // Navigate based on role (similar to Vue logic)
      if (res.role === 0 || res.role === 1) { // Doctor or Admin
        // Mobile app for patients primarily, but handled anyway
        wx.switchTab({
          url: '/pages/index/index',
        });
      } else {
        wx.switchTab({
          url: '/pages/index/index', // Or plan? keeping index
        });
      }

    }).catch(err => {
      // Error handled in request interceptor usually, but safe to log
      console.error(err);
    }).finally(() => {
      this.setData({ loading: false });
    });
  },

  goToRegister: function () {
    wx.navigateTo({
      url: '/pages/register/register',
    });
  }
})
