const request = require('../../utils/request.js').request;
Page({
  data: {
    article: {}
  },
  onLoad: function (options) {
    const id = options.id;
    if (id) {
      this.fetchDetail(id);
    }
  },
  fetchDetail: function (id) {
    const that = this;
    request({
      url: '/article/getById',
      method: 'GET',
      data: { id: id }
    }).then(res => {
      that.setData({
        article: res
      });
    }).catch(err => {
      console.error(err);
      wx.showToast({
        title: '加载文章失败',
        icon: 'none'
      });
    });
  }
})
