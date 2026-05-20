Page({
  data: {
    tabs: ['待就诊', '历史预约', '已取消'],
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
      records: [] // 切换时先清空列表
    });
    this.fetchData();
  },
  fetchData: function() {
    // 模拟调用后端接口
    wx.showLoading({ title: '加载中' });
    setTimeout(() => {
      wx.hideLoading();
      this.setData({
        records: [] // 暂时设置为空数组展示缺省页
      });
    }, 400);
  }
})