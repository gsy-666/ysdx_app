// utils/request.js
// 根据环境自动切换 baseURL
const accountInfo = wx.getAccountInfoSync();
const envVersion = accountInfo.miniProgram.envVersion; // 'develop', 'trial', 'release'

let baseURL = '';

if (envVersion === 'release') {
  // 正式版：请替换为你的云服务器公网 IP 或域名
  baseURL = 'http://Your_Production_Server_IP:8080';
} else if (envVersion === 'trial') {
  // 体验版：测试服务器地址
  baseURL = 'http://Your_Test_Server_IP:8080';
} else {
  // 开发版 (develop)
  const sysInfo = wx.getSystemInfoSync();
  if (sysInfo.platform === 'devtools') {
    // 开发者工具 (电脑模拟器)：自动使用 localhost
    baseURL = 'http://127.0.0.1:8080';
  } else {
    // 真机调试 (手机预览)：必须使用电脑的局域网 IP
    // 注意：如果你的 IP 变了，这里还是需要手动修改
    baseURL = 'http://172.20.10.6:8080';
  }
}

const request = (url, method = 'GET', data = {}, contentType = null) => {
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

    // Handle Content-Type
    if (contentType) {
      header['content-type'] = contentType;
    } else {
      // Default legacy behavior: POST sends form-data
      if (method === 'POST') {
        header['content-type'] = 'application/x-www-form-urlencoded';
      }
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
