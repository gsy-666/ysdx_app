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
    articleList: [],
    pageNo: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    triggered: false,
    keyword: '',
    activeType: 'all', // 分类：all/health/experience/question
    activeSort: 'hot', // 排序：hot/ time
    likeLoadingMap: {},
    collectLoadingMap: {}
  },

  noopTap() {},

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
    const userId = wx.getStorageSync('id');

    const params = {
      pageNo,
      pageSize: this.data.pageSize,
      title: this.data.keyword?.trim() || '',
      categoryId: this.data.activeType === 'all' ? '' : this.data.activeType,
      userId: userId || undefined
    };

    request('/article/list', 'GET', params).then(async (res) => {
      const records = await Promise.all((res.records || []).map(async (item) => {
        // Parse images from multiple legacy/new formats
        let imgs = parseImageField(item.images, item.coverImg);

        imgs = normalizeImages(imgs);
        imgs = await resolveCloudFileIds(imgs);

        // Map fields
        return {
          ...item,
          images: imgs,
          categoryName: CATEGORY_MAP[item.categoryId] || '其他',
          createTime: item.createTime ? item.createTime.replace('T', ' ').substring(0, 16) : '',
          authorName: item.author, // Map author to authorName for wxml compatibility
        };
      }));

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

    const userId = wx.getStorageSync('id');
    if (!userId) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    if (this.data.likeLoadingMap[postId]) return;

    const index = this.data.articleList.findIndex(item => item.id === postId);
    if (index === -1) return;

    this.setData({ [`likeLoadingMap.${postId}`]: true });

    request('/article/like', 'POST', { id: postId, userId }, 'application/json')
      .then((res) => {
        const newList = [...this.data.articleList];
        newList[index].isLiked = !!res?.liked;
        newList[index].likeCount = Number(res?.likeCount || 0);
        this.setData({ articleList: newList });
      })
      .catch(err => {
        console.error('点赞失败：', err);
        wx.showToast({ title: '操作失败', icon: 'none' });
      })
      .finally(() => {
        this.setData({ [`likeLoadingMap.${postId}`]: false });
      });
  },

  // 收藏/取消收藏
  toggleCollect(e) {
    const postId = e.currentTarget.dataset.id;
    if (!postId) return;

    const userId = wx.getStorageSync('id');
    if (!userId) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    if (this.data.collectLoadingMap[postId]) return;

    const index = this.data.articleList.findIndex(item => item.id === postId);
    if (index === -1) return;

    this.setData({ [`collectLoadingMap.${postId}`]: true });

    request('/article/collect', 'POST', { id: postId, userId }, 'application/json')
      .then((res) => {
        const newList = [...this.data.articleList];
        newList[index].isCollected = !!res?.collected;
        newList[index].collectCount = Number(res?.collectCount || 0);
        this.setData({ articleList: newList });
      })
      .catch(err => {
        console.error('收藏失败：', err);
        wx.showToast({ title: '操作失败', icon: 'none' });
      })
      .finally(() => {
        this.setData({ [`collectLoadingMap.${postId}`]: false });
      });
  },

  // 分享帖子
  onShareAppMessage(options) {
    if (options.from === 'button') {
      const { id, title } = options.target.dataset;
      return {
        title: title || '炎黄济世-健康社区',
        path: `/pages/community/detail?id=${id}`
      };
    }
    return {
      title: '炎黄济世-健康社区',
      path: '/pages/community/community'
    };
  },

  onShareTimeline() {
    return {
      title: '炎黄济世-健康社区',
      query: ''
    };
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