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

    // 尝试获取微信头像信息
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中
      success: (res) => {
        console.log('GetUserProfile success:', res);
        wx.setStorageSync('avatar', res.userInfo.avatarUrl);
        // 可以选择是否覆盖名字
        // wx.setStorageSync('wechatName', res.userInfo.nickName); 
        this.executeLoginRequest();
      },
      fail: (err) => {
        console.log('GetUserProfile/Auth failed:', err);
        // 依然继续登录流程
        this.executeLoginRequest();
      }
    });
  },

  executeLoginRequest: function() {
    this.setData({ loading: true });

    request('/sysAdmin/login', 'POST', {
      phone: this.data.phone,
      password: this.data.password
    }).then(res => {
      // res is `content` from response
      wx.setStorageSync('token', res.token);
      wx.setStorageSync('id', res.id);
      wx.setStorageSync('role', res.role);
      
      // 优先保留后端返回的名字，如果后端没有名字，才可能考虑微信昵称(这里暂不处理)
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
