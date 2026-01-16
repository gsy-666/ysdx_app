// pages/community/detail.js
const { request } = require('../../utils/request.js')

Page({
  data: {
    postInfo: {}, // 帖子详情
    commentList: [], // 评论列表
    commentContent: '', // 评论输入内容
    replyId: '', // 回复的评论ID
    replyContent: '', // 回复内容
    loadingComment: false,
    triggered: false,
    postId: ''
  },

  onLoad(options) {
    const postId = options.id;
    if (!postId) {
      wx.showToast({ title: '帖子ID异常', icon: 'none' });
      wx.navigateBack();
      return;
    }
    this.setData({ postId });
    this.getPostDetail();
    this.getCommentList();
  },

  // 获取帖子详情
  getPostDetail() {
    request('/article/getById', 'GET', { id: this.data.postId })
      .then(res => {
        let post = res || {};
        try {
          if (post.images && typeof post.images === 'string') {
            post.images = JSON.parse(post.images);
          } else if (post.coverImg) {
            post.images = [post.coverImg];
          }
        } catch (e) { }
        this.setData({ postInfo: post });
      }).catch(err => {
        console.error('获取帖子详情失败：', err);
        wx.showToast({ title: '加载失败', icon: 'none' });
        wx.navigateBack();
      });
  },

  // 获取评论列表
  getCommentList() {
    this.setData({ loadingComment: true });
    request('/community/comment/list', 'GET', {
      articleId: this.data.postId, // Map postId to articleId
      pageNo: 1, pageSize: 100
    })
      .then(res => {
        this.setData({
          commentList: Array.isArray(res.records) ? res.records : [],
          loadingComment: false
        });
      }).catch(err => {
        console.error('获取评论失败：', err);
        this.setData({ loadingComment: false });
        wx.showToast({ title: '评论加载失败', icon: 'none' });
      });
  },

  // 关注/取消关注作者
  toggleFollow() {
    const authorId = this.data.postInfo.authorId;
    if (!authorId) return;

    // 临时更新UI
    const newPostInfo = { ...this.data.postInfo };
    newPostInfo.isFollowed = !newPostInfo.isFollowed;
    this.setData({ postInfo: newPostInfo });

    request('/community/follow/toggle', 'POST', { authorId }, 'application/json')
      .catch(err => {
        console.error('关注失败：', err);
        // fallback
        newPostInfo.isFollowed = !newPostInfo.isFollowed;
        this.setData({ postInfo: newPostInfo });
      });
  },

  // 点赞/取消点赞帖子
  toggleLike() {
    const postId = this.data.postId;
    if (!postId) return;

    const newPostInfo = { ...this.data.postInfo };
    newPostInfo.isLiked = !newPostInfo.isLiked;
    newPostInfo.likeCount = newPostInfo.isLiked
      ? (newPostInfo.likeCount || 0) + 1
      : Math.max(0, (newPostInfo.likeCount || 0) - 1);
    this.setData({ postInfo: newPostInfo });

    request('/article/like', 'POST', { id: postId }, 'application/json')
      .catch(err => {
        console.error('点赞失败：', err);
        // rollback
        newPostInfo.isLiked = !newPostInfo.isLiked;
        newPostInfo.likeCount = newPostInfo.isLiked
          ? (newPostInfo.likeCount || 0) + 1
          : Math.max(0, (newPostInfo.likeCount || 0) - 1);
        this.setData({ postInfo: newPostInfo });
        wx.showToast({ title: '操作失败', icon: 'none' });
      });
  },

  // 收藏/取消收藏帖子
  toggleCollect() {
    const postId = this.data.postId;
    if (!postId) return;

    const newPostInfo = { ...this.data.postInfo };
    newPostInfo.isCollected = !newPostInfo.isCollected;
    this.setData({ postInfo: newPostInfo });

    request('/article/collect', 'POST', { id: postId }, 'application/json')
      .catch(err => {
        console.error('收藏失败：', err);
        newPostInfo.isCollected = !newPostInfo.isCollected;
        this.setData({ postInfo: newPostInfo });
        wx.showToast({ title: '操作失败', icon: 'none' });
      });
  },

  // 分享帖子
  sharePost() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  // 预览图片
  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    const list = e.currentTarget.dataset.list;
    wx.previewImage({
      current: url,
      urls: list
    });
  },

  // 评论输入
  bindCommentInput(e) {
    this.setData({ commentContent: e.detail.value || '' });
  },

  // 发布评论
  publishComment() {
    const content = this.data.commentContent.trim();
    if (!content) {
      wx.showToast({ title: '评论内容不能为空', icon: 'none' });
      return;
    }

    const userInfo = wx.getStorageSync('userInfo') || {};
    const authorName = wx.getStorageSync('name') || '匿名用户';
    const authorId = wx.getStorageSync('id');
    const authorAvatar = wx.getStorageSync('avatar') || '';

    request('/community/comment/publish', 'POST', {
      articleId: this.data.postId, // Map to articleId
      content: content,
      authorId: authorId,
      authorName: authorName,
      authorAvatar: authorAvatar
    }, 'application/json').then(() => {
      wx.showToast({ title: '评论发布成功' });
      this.setData({ commentContent: '' });
      this.getCommentList(); // 刷新评论列表
    }).catch(err => {
      console.error('发布评论失败：', err);
      wx.showToast({ title: '评论发布失败', icon: 'none' });
    });
  },

  // 点赞评论
  likeComment(e) {
    const commentId = e.currentTarget.dataset.id;
    if (!commentId) return;

    const index = this.data.commentList.findIndex(item => item.id === commentId);
    if (index === -1) return;

    const newList = [...this.data.commentList];
    newList[index].likeCount = (newList[index].likeCount || 0) + 1;
    this.setData({ commentList: newList });

    request('/community/comment/like', 'POST', { id: commentId }, 'application/json')
      .catch(err => {
        console.error('点赞评论失败：', err);
        newList[index].likeCount = Math.max(0, (newList[index].likeCount || 0) - 1);
        this.setData({ commentList: newList });
        wx.showToast({ title: '操作失败', icon: 'none' });
      });
  },

  // 回复评论
  replyComment(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      replyId: id,
      replyContent: ''
    });
  },

  // 回复输入
  bindReplyInput(e) {
    this.setData({ replyContent: e.detail.value || '' });
  },

  // 发布回复
  publishReply(e) {
    const commentId = e.currentTarget.dataset.id;
    const content = this.data.replyContent.trim();
    if (!commentId || !content) return;

    const authorName = wx.getStorageSync('name') || '匿名用户';
    const authorId = wx.getStorageSync('id');
    const authorAvatar = wx.getStorageSync('avatar') || '';

    request('/community/comment/reply', 'POST', {
      parentId: commentId, // Map to parentId
      articleId: this.data.postId,
      content: content,
      authorId: authorId,
      authorName: authorName,
      authorAvatar: authorAvatar
    }, 'application/json').then(() => {
      wx.showToast({ title: '回复成功' });
      this.setData({ replyId: '', replyContent: '' });
      this.getCommentList(); // 刷新评论列表
    }).catch(err => {
      console.error('回复失败：', err);
      wx.showToast({ title: '回复失败', icon: 'none' });
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({ triggered: true });
    this.getPostDetail();
    this.getCommentList();
    this.setData({ triggered: false });
  }
})