Page({
  data: {
    tabs: ['进行中', '已完成'],
    currentTab: 0,
    records: []
  },
  onLoad: function (options) {
    this.fetchData();
  },
  switchTab: function(e) {
    const index = e.currentTarget.dataset.index;
    if (this.data.currentTab === index) return;
    this.setData({
      currentTab: index,
      records: [] 
    });
    this.fetchData();
  },
  fetchData: function() {
    wx.showLoading({ title: '加载中' });
    setTimeout(() => {
      wx.hideLoading();
      this.setData({
        records: [] 
      });
    }, 400);
  }
})