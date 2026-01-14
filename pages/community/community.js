const request = require('../../utils/request.js')

Page({
  data: {
    articleList: [],
    pageNo: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    triggered: false, // For pull down refresh
    keyword: ''
  },

  onLoad: function (options) {
    this.getArticleList(true);
  },

  bindSearchInput: function(e) {
    this.setData({
      keyword: e.detail.value
    });
  },

  onSearch: function() {
    this.getArticleList(true);
  },

  getArticleList: function (reset = false) {
    if (this.data.loading) return;
    if (!reset && !this.data.hasMore) return;

    this.setData({ loading: true });

    let pageNo = reset ? 1 : this.data.pageNo;

    request.request({
      url: '/article/list',
      method: 'GET',
      data: {
        pageNo: pageNo,
        pageSize: this.data.pageSize,
        title: this.data.keyword
      }
    }).then(res => {
      // Backend returns IPage object: { records: [...], current, size, total, pages }
      // Or result.data is the IPage.
      // Usually request.js returns the `data` part of ResultJson.
      // Check response structure carefully.
      
      // Assuming res is the data payload (IPage object)
      const records = res.records || [];
      const total = res.total || 0;
      
      this.setData({
        articleList: reset ? records : this.data.articleList.concat(records),
        pageNo: pageNo + 1,
        hasMore: this.data.articleList.length + records.length < total,
        loading: false,
        triggered: false // Stop refresher
      });
    }).catch(err => {
      console.error(err);
      this.setData({ loading: false, triggered: false });
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    });
  },

  onPullDownRefresh: function () {
    this.setData({ triggered: true });
    this.getArticleList(true);
  },

  onReachBottom: function () {
    this.getArticleList(false);
  },

  goToDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/article/detail?id=' + id
    });
  }
})
