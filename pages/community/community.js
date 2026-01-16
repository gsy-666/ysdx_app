// pages/community/community.js
const { request } = require('../../utils/request.js')

const CATEGORY_MAP = {
  'health': '健康科普',
  'experience': '经验分享',
  'question': '提问求助'
};
const CATEGORY_COLORS = {
  'health': '#52c41a',
  'experience': '#1890ff',
  'question': '#faad14'
};

Page({
  data: {
    articleList: [],
    pageNo: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    triggered: false,
    keyword: '',
    activeType: 'all', // 分类：all/health/experience/question
    activeSort: 'hot'  // 排序：hot/ time
  },

  onLoad(options) {
    this.getArticleList(true);
  },

  // ====================== 筛选/排序 ======================
  changeType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      activeType: type,
      pageNo: 1,
      hasMore: true
    });
    this.getArticleList(true);
  },

  changeSort() {
    this.setData({
      activeSort: this.data.activeSort === 'hot' ? 'time' : 'hot',
      pageNo: 1,
      hasMore: true
    });
    this.getArticleList(true);
  },

  // ====================== 搜索 ======================
  bindSearchInput(e) {
    this.setData({ keyword: e.detail.value || '' });
  },

  onSearch() {
    this.setData({ pageNo: 1, hasMore: true });
    this.getArticleList(true);
    wx.hideKeyboard();
  },

  // ====================== 数据请求 ======================
  getArticleList(reset = false) {
    if (this.data.loading) return;
    if (!reset && !this.data.hasMore) return;

    this.setData({ loading: true });
    const pageNo = reset ? 1 : this.data.pageNo;

    const params = {
      pageNo,
      pageSize: this.data.pageSize,
      title: this.data.keyword?.trim() || '',
      categoryId: this.data.activeType === 'all' ? '' : this.data.activeType
    };

    request('/article/list', 'GET', params).then(res => {
      const records = (res.records || []).map(item => {
        // Parse images
        let imgs = [];
        try {
          if (item.images) {
            imgs = JSON.parse(item.images);
          } else if (item.coverImg) {
            imgs = [item.coverImg];
          }
        } catch (e) { }

        // Map fields
        return {
          ...item,
          images: imgs,
          categoryName: CATEGORY_MAP[item.categoryId] || '其他',
          createTime: item.createTime ? item.createTime.replace('T', ' ').substring(0, 16) : '',
          authorName: item.author, // Map author to authorName for wxml compatibility
        };
      });

      const total = Number(res.total) || 0;
      const newList = reset ? records : [...this.data.articleList, ...records];

      this.setData({
        articleList: newList,
        pageNo: pageNo + 1,
        hasMore: newList.length < total,
        loading: false,
        triggered: false
      });
    }).catch(err => {
      console.error('获取帖子列表失败：', err);
      this.setData({ loading: false, triggered: false });
      wx.showToast({ title: '加载失败，请稍后重试', icon: 'none' });
    });
  },

  // ====================== 互动功能 ======================
  // 关注/取消关注作者
  toggleFollow(e) {
    const authorId = e.currentTarget.dataset.authorId;
    if (!authorId) return;

    // 找到当前帖子索引
    const index = this.data.articleList.findIndex(item => item.authorId === authorId);
    if (index === -1) return;

    // 临时更新UI（优化体验）
    const newList = [...this.data.articleList];
    newList[index].isFollowed = !newList[index].isFollowed;
    this.setData({ articleList: newList });

    // 发起关注请求
    request('/community/follow/toggle', 'POST', { authorId }, 'application/json')
      .catch(err => {
        console.error('关注失败：', err);
        // 回滚UI
        newList[index].isFollowed = !newList[index].isFollowed;
        this.setData({ articleList: newList });
        wx.showToast({ title: '操作失败', icon: 'none' });
      });
  },

  // 点赞/取消点赞
  toggleLike(e) {
    const postId = e.currentTarget.dataset.id;
    if (!postId) return;

    const index = this.data.articleList.findIndex(item => item.id === postId);
    if (index === -1) return;

    // 临时更新UI
    const newList = [...this.data.articleList];
    newList[index].isLiked = !newList[index].isLiked;
    newList[index].likeCount = newList[index].isLiked
      ? (newList[index].likeCount || 0) + 1
      : Math.max(0, (newList[index].likeCount || 0) - 1);
    this.setData({ articleList: newList });

    // 发起点赞请求
    request('/article/like', 'POST', { id: postId }, 'application/json')
      .catch(err => {
        console.error('点赞失败：', err);
        // 回滚UI
        newList[index].isLiked = !newList[index].isLiked;
        newList[index].likeCount = newList[index].isLiked
          ? (newList[index].likeCount || 0) + 1
          : Math.max(0, (newList[index].likeCount || 0) - 1);
        this.setData({ articleList: newList });
        wx.showToast({ title: '操作失败', icon: 'none' });
      });
  },

  // 收藏/取消收藏
  toggleCollect(e) {
    const postId = e.currentTarget.dataset.id;
    if (!postId) return;

    const index = this.data.articleList.findIndex(item => item.id === postId);
    if (index === -1) return;

    // 临时更新UI
    const newList = [...this.data.articleList];
    newList[index].isCollected = !newList[index].isCollected;
    this.setData({ articleList: newList });

    // 发起收藏请求
    request('/article/collect', 'POST', { id: postId }, 'application/json')
      .catch(err => {
        console.error('收藏失败：', err);
        // 回滚UI
        newList[index].isCollected = !newList[index].isCollected;
        this.setData({ articleList: newList });
        wx.showToast({ title: '操作失败', icon: 'none' });
      });
  },

  // 分享帖子
  sharePost(e) {
    const postId = e.currentTarget.dataset.id;
    if (!postId) return;

    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  // ====================== 页面交互 ======================
  onPullDownRefresh() {
    this.setData({ triggered: true });
    this.getArticleList(true);
  },

  onReachBottom() {
    this.getArticleList(false);
  },

  // 图片加载失败处理
  onImageError(e) {
    const { pindex, imgindex } = e.currentTarget.dataset;
    // Update the specific image url to a fallback
    const key = `articleList[${pindex}].images[${imgindex}]`;
    this.setData({
      [key]: '/static/default_avatar.png'
    });
  },

  // 跳转到帖子详情
  goToDetail(e) {
    const id = e.currentTarget?.dataset?.id;
    if (!id) {
      wx.showToast({ title: '帖子ID异常', icon: 'none' });
      return;
    }
    wx.navigateTo({
      url: `/pages/community/detail?id=${id}`,
      fail: () => wx.showToast({ title: '页面跳转失败', icon: 'none' })
    });
  },

  // 跳转到发布帖子页
  goToPublish() {
    wx.navigateTo({
      url: '/pages/community/publish',
      fail: () => wx.showToast({ title: '页面跳转失败', icon: 'none' })
    });
  }
})