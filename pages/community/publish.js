// pages/community/publish.js
const request = require('../../utils/request.js')

Page({
  data: {
    title: '', // 帖子标题
    content: '', // 帖子内容
    categoryList: [ // 分类列表
      { id: 'health', name: '健康科普' },
      { id: 'experience', name: '经验分享' },
      { id: 'question', name: '提问求助' }
    ],
    categoryIndex: 0, // 选中的分类索引
    categoryId: '', // 选中的分类ID
    images: [], // 上传的图片列表
    publishing: false // 发布中状态
  },

  onLoad() {
    // 初始化分类ID
    this.setData({ categoryId: this.data.categoryList[0].id });
  },

  // 标题输入
  bindTitleInput(e) {
    this.setData({ title: e.detail.value || '' });
  },

  // 内容输入
  bindContentInput(e) {
    this.setData({ content: e.detail.value || '' });
  },

  // 选择分类
  changeCategory(e) {
    const index = e.detail.value;
    const categoryId = this.data.categoryList[index].id;
    this.setData({
      categoryIndex: index,
      categoryId: categoryId
    });
  },

  // 选择图片
  chooseImage() {
    const maxCount = 9 - this.data.images.length;
    if (maxCount <= 0) {
      wx.showToast({ title: '最多上传9张图片', icon: 'none' });
      return;
    }

    wx.chooseImage({
      count: maxCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        // 临时文件路径
        const tempFilePaths = res.tempFilePaths;
        this.setData({
          images: [...this.data.images, ...tempFilePaths]
        });
      }
    });
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const newImages = [...this.data.images];
    newImages.splice(index, 1);
    this.setData({ images: newImages });
  },

  // 上传图片（实际项目需上传到服务器，这里模拟）
  uploadImages() {
    if (this.data.images.length === 0) return Promise.resolve([]);

    // 模拟图片上传，实际项目替换为真实上传接口
    return new Promise((resolve) => {
      // 这里只是返回临时路径，实际需要上传到OSS/服务器，返回真实URL
      setTimeout(() => {
        resolve(this.data.images);
      }, 1000);
    });
  },

  // 发布帖子
  async publishPost() {
    const { title, content, categoryId } = this.data;
    // 二次校验
    if (!title.trim() || !content.trim() || !categoryId) {
      wx.showToast({ title: '标题/内容/分类不能为空', icon: 'none' });
      return;
    }

    this.setData({ publishing: true });

    try {
      // 1. 上传图片
      const imageUrls = await this.uploadImages();

      // 2. 发布帖子
      const res = await request.request({
        url: '/community/post/publish',
        method: 'POST',
        data: {
          title: title.trim(),
          content: content.trim(),
          categoryId,
          images: imageUrls
        }
      });

      wx.showToast({ title: '发布成功', icon: 'success' });
      // 发布成功后返回社区首页
      setTimeout(() => {
        wx.navigateBack({
          delta: 1,
          success: () => {
            // 通知首页刷新
            const pages = getCurrentPages();
            const communityPage = pages[pages.length - 2];
            if (communityPage) {
              communityPage.getArticleList(true);
            }
          }
        });
      }, 1500);

    } catch (err) {
      console.error('发布帖子失败：', err);
      wx.showToast({ title: '发布失败，请稍后重试', icon: 'none' });
      this.setData({ publishing: false });
    }
  }
})