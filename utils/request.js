// utils/request.js
const baseURL = 'http://127.0.0.1:8080'; // Change to https in production

const request = (url, method = 'GET', data = {}) => {
  return new Promise((resolve, reject) => {
    // Loading indicator
    wx.showLoading({
      title: '加载中...',
    });

    const header = {
      'content-type': 'application/json' // Default
    };

    // Get token from storage
    const token = wx.getStorageSync('token');
    if (token) {
      header['token'] = token;
    }

    // Handle form data for POST if needed, though JSON is standard. 
    // The original axios config used FormData for POST, which in wx.request implies content-type: multipart/form-data or application/x-www-form-urlencoded
    // if simple key-value pairs. But wx.request 'data' handles objects fine.
    // If your backend specifically expects FormData (multipart), we might need special handling.
    // Based on axios code:
    // if (method === 'post') { const formData = new FormData()... } 
    // This implies the backend might expect form-data.
    if (method === 'POST') {
      header['content-type'] = 'application/x-www-form-urlencoded';
    }

    wx.request({
      url: baseURL + url,
      method: method,
      data: data,
      header: header,
      success: (res) => {
        if (res.statusCode === 200) {
          const result = res.data;
          if (result.code === 200) {
            resolve(result.content);
          } else if (result.code === 401) {
            wx.showToast({
              title: '请先登录',
              icon: 'none'
            });
            wx.reLaunch({
              url: '/pages/login/login',
            });
            reject(result);
          } else {
            wx.showToast({
              title: result.message || '请求失败',
              icon: 'none'
            });
            reject(result);
          }
        } else {
          reject(res);
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络连接失败',
          icon: 'none'
        });
        reject(err);
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  });
};

module.exports = {
  request
};
