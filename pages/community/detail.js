// pages/community/detail.js
const request = require('../../utils/request.js').request

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

    if (value.includes(',') || value.includes('，')) {
      return value.split(/[,，]/).map((s) => s.trim()).filter(Boolean);
    }

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

function stripHtml(html) {
  return String(html || '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

Page({
  data: {
    postInfo: {},
    commentList: [],
    commentContent: '',
    replyId: '',
    replyContent: '',
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

  getPostDetail() {
    const userId = wx.getStorageSync('id');
    request('/article/getById', 'GET', { id: this.data.postId, userId: userId || undefined })
      .then(async (res) => {
        let post = res || {};
        post.images = parseImageField(post.images, post.coverImg);
        post.images = normalizeImages(post.images || []);
        post.images = await resolveCloudFileIds(post.images);
        post.content = stripHtml(post.content);
        this.setData({ postInfo: post });
      }).catch(err => {
        console.error('获取帖子详情失败：', err);
        wx.showToast({ title: '加载失败', icon: 'none' });
        wx.navigateBack();
      });
  },

  getCommentList() {
    this.setData({ loadingComment: true });
    request('/community/comment/list', 'GET', {
      articleId: this.data.postId,
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

  toggleFollow() {
    const authorId = this.data.postInfo.authorId;
    if (!authorId) return;

    const newPostInfo = { ...this.data.postInfo };
    newPostInfo.isFollowed = !newPostInfo.isFollowed;
    this.setData({ postInfo: newPostInfo });

    request('/community/follow/toggle', 'POST', { authorId }, 'application/json')
      .catch(err => {
        console.error('关注失败：', err);
        newPostInfo.isFollowed = !newPostInfo.isFollowed;
        this.setData({ postInfo: newPostInfo });
      });
  },

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

  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    const list = e.currentTarget.dataset.list;
    wx.previewImage({
      current: url,
      urls: list
    });
  },

  bindCommentInput(e) {
    this.setData({ commentContent: e.detail.value || '' });
  },

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
      articleId: this.data.postId,
      content: content,
      authorId: authorId,
      authorName: authorName,
      authorAvatar: authorAvatar
    }, 'application/json').then(() => {
      wx.showToast({ title: '评论发布成功' });
      this.setData({ commentContent: '' });
      this.getCommentList();
    }).catch(err => {
      console.error('发布评论失败：', err);
      wx.showToast({ title: '评论发布失败', icon: 'none' });
    });
  },

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

  replyComment(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      replyId: id,
      replyContent: ''
    });
  },

  bindReplyInput(e) {
    this.setData({ replyContent: e.detail.value || '' });
  },

  publishReply(e) {
    const commentId = e.currentTarget.dataset.id;
    const content = this.data.replyContent.trim();
    if (!commentId || !content) return;

    const authorName = wx.getStorageSync('name') || '匿名用户';
    const authorId = wx.getStorageSync('id');
    const authorAvatar = wx.getStorageSync('avatar') || '';

    request('/community/comment/reply', 'POST', {
      parentId: commentId,
      articleId: this.data.postId,
      content: content,
      authorId: authorId,
      authorName: authorName,
      authorAvatar: authorAvatar
    }, 'application/json').then(() => {
      wx.showToast({ title: '回复成功' });
      this.setData({ replyId: '', replyContent: '' });
      this.getCommentList();
    }).catch(err => {
      console.error('回复失败：', err);
      wx.showToast({ title: '回复失败', icon: 'none' });
    });
  },

  onPullDownRefresh() {
    this.setData({ triggered: true });
    this.getPostDetail();
    this.getCommentList();
    this.setData({ triggered: false });
  }
})