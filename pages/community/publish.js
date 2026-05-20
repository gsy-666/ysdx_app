// pages/community/publish.js
const { request } = require('../../utils/request.js')

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

    // 检查是否登录
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showModal({
        title: '提示',
        content: '发布帖子需要先登录',
        showCancel: false,
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login',
            });
          }
        }
      });
    }
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

    // 上传到微信云存储，返回 fileID（可跨设备访问）
    const uploadTasks = this.data.images.map((filePath, idx) => {
      const extMatch = /\.[a-zA-Z0-9]+$/.exec(filePath || '');
      const ext = extMatch ? extMatch[0] : '.jpg';
      const cloudPath = `community/${Date.now()}_${idx}_${Math.floor(Math.random() * 100000)}${ext}`;

      return new Promise((resolve, reject) => {
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: (res) => resolve(res.fileID),
          fail: (err) => reject(err)
        });
      });
    });

    return Promise.all(uploadTasks);
  },

  isCloudFileIds(list) {
    return Array.isArray(list) && list.every((item) => typeof item === 'string' && item.startsWith('cloud://'));
  },

  // 发布帖子
  async publishPost() {
    const { title, content, categoryId, images } = this.data;
    // 二次校验
    if (!title.trim() || !content.trim() || !categoryId) {
      wx.showToast({ title: '标题/内容/分类不能为空', icon: 'none' });
      return;
    }

    this.setData({ publishing: true });

    try {
      // 1. 上传图片，获得可共享的云文件ID
      const imageUrls = await this.uploadImages();
      if (imageUrls.length > 0 && !this.isCloudFileIds(imageUrls)) {
        throw new Error('图片上传结果异常，未获得云文件ID');
      }

      // 2. 构造文章对象
      const userInfo = wx.getStorageSync('userInfo') || {};
      const authorName = wx.getStorageSync('name') || '匿名用户';
      let authorId = wx.getStorageSync('id');
      if (!authorId) authorId = null; // Ensure partial/empty string doesn't break Integer binding
      const authorAvatar = wx.getStorageSync('avatar') || '';

      // Format date to yyyy-MM-dd HH:mm:ss for backend compatibility
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const createTimeStr = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

      const postData = {
        title: title,
        content: content,
        categoryId: categoryId,
        coverImg: imageUrls[0] || '',
        images: JSON.stringify(imageUrls), // 存为JSON字符串
        author: authorName,
        authorId: authorId,
        authorAvatar: authorAvatar,
        createTime: null, // Let DB handle default or null to avoid format error
        viewCount: 0,
        likeCount: 0
      };

      // 3. 提交到后端
      // Explicitly use 'application/json' because ArticleController @RequestBody expects it
      await request('/article/add', 'POST', postData, 'application/json');

      wx.showToast({ title: '发布成功', icon: 'success' });

      // 4. 返回上一页并刷新
      setTimeout(() => {
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        if (prevPage && prevPage.refreshList) {
          prevPage.refreshList(); // 假设上一页有刷新方法
        }
        wx.navigateBack();
      }, 1500);

    } catch (err) {
      console.error(err);
      wx.showToast({ title: '发布失败', icon: 'none' });
    } finally {
      this.setData({ publishing: false });
    }
  }
})