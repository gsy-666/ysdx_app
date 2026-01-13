// app.js
App({
  onLaunch() {
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
