// pages/plan/plan.js
const request = require('../../utils/request.js').request;

Page({

  /**
   * Page initial data
   */
  data: {
    healthInfo: {}
  },

  /**
   * Lifecycle function--Called when page load
   */
  onShow: function (options) {
    this.fetchPatientHealthInfo();
  },

  fetchPatientHealthInfo: function () {
    const patientId = wx.getStorageSync('id');
    if (!patientId) return;

    // Parallel requests like Promise.allSettled
    const p1 = request('/message/getByPatientId', 'GET', { patientId: patientId }).catch(e => ({}));
    const p2 = request('/screen/getByPatientId', 'GET', { patientId: patientId }).catch(e => ({}));

    Promise.all([p1, p2]).then(([messageData, screenData]) => {
      messageData = messageData || {};
      screenData = screenData || {};

      this.setData({
        healthInfo: {
          high: messageData.high,
          weight: messageData.weight,
          bloodHigh: messageData.bloodHigh,
          bloodLow: messageData.bloodLow,
          lowhdl: screenData.lowhdl // Mapping 'lowhdl' to Blood Sugar slot as per discovery, or just keep it as is
        }
      });
    });
  },

  joinPlan() {
    // Navigate to Diagnosis or appropriate page to start a plan
    wx.navigateTo({
      url: '/pages/diagnose/diagnose',
    });
  },

  onToolInteract(e) {
    const name = e.currentTarget.dataset.name;
    wx.showToast({
      title: name + ' 功能开发中',
      icon: 'none'
    });
  }
})
