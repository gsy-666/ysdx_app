const request = require('../../utils/request.js').request;

Page({
  data: {
    article: {}
  },
  onLoad: function (options) {
    const id = options.id;
    if (id) {
      this.fetchDetail(id);
    } else {
      wx.showToast({
        title: '文章参数缺失',
        icon: 'none'
      });
    }
  },
  fetchDetail: function (id) {
    const that = this;
    request('/article/getById', 'GET', { id: id }).then(res => {
      if (res.createTime) {
        res.createTimeFormatted = res.createTime.substring(0, 10);
      }

      that.setData({
        article: res
      });
    }).catch(err => {
      wx.showToast({
        title: '加载文章失败',
        icon: 'none'
      });
    });
  }
})
