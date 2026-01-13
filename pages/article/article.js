// pages/article/article.js
// const request = require('../../utils/request.js').request;

Page({
  data: {
    articles: [
      { id: 1, title: '初秋养生要点', summary: '秋季干燥，注意养肺...', createTime: '2025-08-20' },
      { id: 2, title: '糖尿病饮食指南', summary: '控制血糖，从每一餐做起...', createTime: '2025-08-18' },
      { id: 3, title: '中医体质辨识', summary: '了解自己的体质，调理更有效...', createTime: '2025-08-15' },
      { id: 4, title: '运动与健康', summary: '适量运动，增强免疫力...', createTime: '2025-08-10' },
      { id: 5, title: '高血压防治', summary: '低盐饮食，定期监测...', createTime: '2025-08-05' }
    ]
  },
  onLoad: function () {
    // this.fetchArticles();
  },
  /*
  fetchArticles: function () {
    request('/article/list', 'GET', {
      pageNo: 1,
      pageSize: 10
    }).then(res => {
      if (res && res.records) {
        this.setData({
          articles: res.records
        });
      }
    }).catch(err => {
      console.error(err);
    });
  },
  */
  goToDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/article/detail?id=' + id,
    });
  }
})
