// pages/community/detail.js
const { request } = require('../../utils/request.js')

function normalizeImages(rawImages) {
  if (!Array.isArray(rawImages)) return [];
  return rawImages.filter((item) => typeof item === 'string' && item && !item.startsWith('wxfile://'));
}

function resolveSingleCloudFile(fileID) {
  return new Promise((resolve) => {
    if (!fileID || !wx.cloud || typeof wx.cloud.getTempFileURL !== 'function') {
      resolve(fileID || '');
      return;
    }

    wx.cloud.getTempFileURL({
      fileList: [fileID],
      success: (res) => {
        const info = (res.fileList || [])[0] || {};
        if (info.tempFileURL) {
          resolve(info.tempFileURL);
          return;
        }

        if (typeof wx.cloud.downloadFile === 'function') {
          wx.cloud.downloadFile({
            fileID,
            success: (downloadRes) => resolve(downloadRes.tempFilePath || fileID),
            fail: () => resolve(fileID)
          });
          return;
        }

        resolve(fileID);
      },
      fail: () => {
        if (typeof wx.cloud.downloadFile === 'function') {
          wx.cloud.downloadFile({
            fileID,
            success: (downloadRes) => resolve(downloadRes.tempFilePath || fileID),
            fail: () => resolve(fileID)
          });
          return;
        }
        resolve(fileID);
      }
    });
  });
}

function parseImageField(rawImages, coverImg) {
  if (Array.isArray(rawImages)) {
    return rawImages;
  }

  if (typeof rawImages === 'string' && rawImages.trim()) {
    let value = rawImages.trim();

    // Compatible with JSON array and double-encoded JSON string formats.
    for (let i = 0; i < 2; i++) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
        if (typeof parsed === 'string' && parsed.trim()) {
          value = parsed.trim();
          continue;
        }
      } catch (e) {
        break;
      }
    }

    // Legacy format: comma-separated URLs/fileIDs
    if (value.includes(',') || value.includes('，')) {
      return value.split(/[,，]/).map((s) => s.trim()).filter(Boolean);
    }

    // Single URL/fileID string
    return [value];
  }

  if (coverImg) {
    return [coverImg];
  }

  return [];
}

function resolveCloudFileIds(images) {
  const cloudIds = images.filter((item) => item.startsWith('cloud://'));
  if (!cloudIds.length || !wx.cloud || typeof wx.cloud.getTempFileURL !== 'function') {
    return Promise.resolve(images);
  }

  return Promise.all(images.map(async (img) => {
    if (!img.startsWith('cloud://')) return img;
    const tempUrl = await resolveSingleCloudFile(img);
    return tempUrl || img;
  }));
}

Page({
  data: {
    postInfo: {}, // 帖子详情
    commentList: [], // 评论列表
    commentContent: '', // 评论输入内容
    replyId: '', // 回复的评论ID
    replyContent: '', // 回复内容
    loadingComment: false,
    triggered: false,
    postId: '',
    likeSubmitting: false,
    collectSubmitting: false
  },

  noopTap() {},

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
    const userId = wx.getStorageSync('id');
    request('/article/getById', 'GET', { id: this.data.postId, userId: userId || undefined })
      .then(async (res) => {
        let post = res || {};
        post.images = parseImageField(post.images, post.coverImg);

        post.images = normalizeImages(post.images || []);
        post.images = await resolveCloudFileIds(post.images);

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
        const list = Array.isArray(res.records) ? res.records : [];
        this.setData({
          commentList: list,
          'postInfo.commentCount': list.length,
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

    const userId = wx.getStorageSync('id');
    if (!userId) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    if (this.data.likeSubmitting) return;
    this.setData({ likeSubmitting: true });

    request('/article/like', 'POST', { id: postId, userId }, 'application/json')
      .then((res) => {
        const newPostInfo = { ...this.data.postInfo };
        newPostInfo.isLiked = !!res?.liked;
        newPostInfo.likeCount = Number(res?.likeCount || 0);
        this.setData({ postInfo: newPostInfo });
      })
      .catch(err => {
        console.error('点赞失败：', err);
        wx.showToast({ title: '操作失败', icon: 'none' });
      })
      .finally(() => {
        this.setData({ likeSubmitting: false });
      });
  },

  // 收藏/取消收藏帖子
  toggleCollect() {
    const postId = this.data.postId;
    if (!postId) return;

    const userId = wx.getStorageSync('id');
    if (!userId) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    if (this.data.collectSubmitting) return;
    this.setData({ collectSubmitting: true });

    request('/article/collect', 'POST', { id: postId, userId }, 'application/json')
      .then((res) => {
        const newPostInfo = { ...this.data.postInfo };
        newPostInfo.isCollected = !!res?.collected;
        newPostInfo.collectCount = Number(res?.collectCount || 0);
        this.setData({ postInfo: newPostInfo });
      })
      .catch(err => {
        console.error('收藏失败：', err);
        wx.showToast({ title: '操作失败', icon: 'none' });
      })
      .finally(() => {
        this.setData({ collectSubmitting: false });
      });
  },

  // 分享帖子
  onShareAppMessage() {
    return {
      title: this.data.postInfo.title || '炎黄济世',
      path: `/pages/community/detail?id=${this.data.postId}`
    };
  },

  onShareTimeline() {
    return {
      title: this.data.postInfo.title || '炎黄济世',
      query: `id=${this.data.postId}`
    };
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