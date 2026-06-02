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
      // 格式化时间，只保留 YYYY-MM-DD
      if (res.createTime) {
        res.createTimeFormatted = res.createTime.substring(0, 10);
      }
      
      // 双保险防越界：为图片添加样式确保不超过屏幕
      if (res.content) {
        res.content = res.content.replace(/<img[^>]*>/gi, function(match){
          if(match.indexOf('style=') === -1) {
             return match.replace('<img', '<img style="max-width:100%;height:auto;display:block;margin:10px auto;"');
          } else {
             // If style exists, append it gently, though naive replace might be fine 
             // here we assume our extractor set the right style, but we wrap it anyway just in case if someone posts via admin
             return match.replace(/style="/i, 'style="max-width:100%;height:auto;');
          }
        });
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
