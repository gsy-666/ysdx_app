// pages/doctor/detail/detail.js
const doctors = require('../../../data/doctors');

Page({
  data: {
    doctorId: '',
    doctor: null
  },

  onLoad(options) {
    const doctorId = options.doctorId || '';
    const doctor = doctors.find(d => d.id === doctorId) || null;
    this.setData({ doctorId, doctor });
  },

  goChat(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/connect/chat/chat?type=doctor&doctorId=${encodeURIComponent(id)}`,
    });
  },

  goBack() {
    wx.navigateBack();
  }
});
