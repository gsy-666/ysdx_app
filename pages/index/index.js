// pages/index/index.js
// const request = require('../../utils/request.js').request;

Page({
  data: {
    menuItems: [
      { path: '/pages/four/four', name: '四诊分析', desc: '全面中医体质辨识', icon: '/static/four_diag.svg' },
      { path: '/pages/diagnose/diagnose', name: '病情诊断', desc: '专业病情分析报告', icon: '/static/report.svg' },
      { path: '/pages/grade/grade', name: '测评表', desc: '健康状况自我评估', icon: '/static/assessment.svg' },
      { path: '/pages/screen/screen', name: '入组筛选表', desc: '参与研究筛选', icon: '/static/filter.svg' },
      { path: '/pages/connect/connect', name: '联系医生', desc: '在线咨询专家', icon: '/static/doctor_contact.svg' },
      { path: '/pages/article/article', name: '每日文章', desc: '精选健康资讯', icon: '/static/article.svg' },
    ],
    articles: [
      { id: 1, title: '初秋养生要点', summary: '秋季干燥，注意养肺...', createTime: '2025-08-20' },
      { id: 2, title: '糖尿病饮食指南', summary: '控制血糖，从每一餐做起...', createTime: '2025-08-18' },
      { id: 3, title: '中医体质辨识', summary: '了解自己的体质，调理更有效...', createTime: '2025-08-15' }
    ]
  },
  onLoad: function (options) {
    // this.fetchArticles();
  },

  navigateTo: function (e) {
    const path = e.currentTarget.dataset.path;
    wx.navigateTo({
      url: path,
    });
  },

  /*
  fetchArticles: function () {
    request('/article/list', 'GET', {
      pageNo: 1,
      pageSize: 3 // Limit for home page
    }).then(res => {
      if (res && res.records) {
        this.setData({
          articles: res.records
        });
      }
    }).catch(err => {
      console.error(err);
    });
  }
  */
})
