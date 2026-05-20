// app.js
const DEFAULT_TCB_ENV_ID = 'prod-4gvasw7le7719ebb';

function normalizeEnvId(envId) {
  // Keep a single env across all devices to avoid cross-device fileID resolve issues.
  return DEFAULT_TCB_ENV_ID;
}

App({
  onLaunch() {
    // 初始化云开发环境（用于云托管 callContainer）
    if (wx.cloud) {
      const savedEnvId = wx.getStorageSync('tcbEnvId');
      const finalEnvId = normalizeEnvId(savedEnvId);
      wx.setStorageSync('tcbEnvId', finalEnvId);
      wx.cloud.init({
        env: finalEnvId,
        traceUser: true,
      });
    }

    // Check if token exists
    const token = wx.getStorageSync('token')
    if (!token) {
      // Logic to redirect to login if needed, though usually handled in page specific onShow or requests
    }
  },
  globalData: {
    userInfo: null
  }
})
