// utils/request.js
const BASE_URL = 'https://springboot-ookp-237425-9-1378676965.sh.run.tcloudbase.com';

const request = (url, method = 'GET', data = {}, contentType = null) => {
  return new Promise((resolve, reject) => {
    wx.showLoading({
      title: '加载中...',
    });

    const header = {
      'content-type': contentType || 'application/json'
    };

    // Get token from storage
    const token = wx.getStorageSync('token');
    if (token) {
      header['token'] = token;
    }

    wx.request({
      url: BASE_URL + url,
      method: method,
      data: data,
      header: header,
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 401 || (res.statusCode === 200 && res.data && res.data.code === 401)) {
          wx.showToast({
            title: '请先登录',
            icon: 'none'
          });
          wx.reLaunch({
            url: '/pages/login/login',
          });
          reject(res.data || res);
        } else if (res.statusCode === 200) {
          const result = res.data;
          if (result.code === 200) {
            resolve(result.content);
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
  request,
  getBaseURL: () => BASE_URL
};
