// pages/register/register.js
const request = require('../../utils/request.js').request;

Page({
  data: {
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: '1', // 1: Male, 2: Female
    age: '',
    height: '',
    weight: '',
    loading: false
  },

  handleRegister() {
    const { name, phone, password, confirmPassword, gender, age, height, weight } = this.data;

    if (!name || !phone || !password || !confirmPassword) {
      wx.showToast({ title: '请填写所有信息', icon: 'none' });
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({ title: '手机号格式错误', icon: 'none' });
      return;
    }

    if (password.length < 6) {
      wx.showToast({ title: '密码长度需大于6位', icon: 'none' });
      return;
    }

    if (password !== confirmPassword) {
      wx.showToast({ title: '两次输入的密码不一致', icon: 'none' });
      return;
    }

    this.setData({ loading: true });

    // Call backend API
    request('/sysAdmin/register', 'POST', {
      name, phone, password, gender, age, height, weight
    }).then(res => {
      // Assuming res is the data part. Adjust if wrapper exists.
      wx.showToast({ title: '注册成功', icon: 'success' });
      setTimeout(() => {
        wx.navigateBack(); // Go back to login
      }, 1500);
    }).catch(err => {
      console.error(err);
      // request.js usually handles error toast, but just in case
      // wx.showToast({ title: '注册失败', icon: 'none' });
    }).finally(() => {
      this.setData({ loading: false });
    });
  },

  goToLogin() {
    wx.navigateBack();
  }
})
