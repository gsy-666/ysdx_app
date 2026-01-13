// pages/diagnose/diagnose.js
const request = require('../../utils/request.js').request;

Page({
  data: {
    systemList: [
      { name: '消化系统', key: 'digestive', type: 'digestiveType' },
      { name: '呼吸系统', key: 'respiratory', type: 'respiratoryType' },
      { name: '循环系统', key: 'circulatory', type: 'circulatoryType' },
      { name: '神经系统', key: 'nervous', type: 'nervousType' },
    ],
    formData: {
      digestive: false, digestiveType: '',
      respiratory: false, respiratoryType: '',
      circulatory: false, circulatoryType: '',
      nervous: false, nervousType: '',

      surgeryHistory: '',
      allergyHistory: '',
      smokingHistory: '',
      drinkingHistory: '',

      diagnosisDate: new Date().toISOString().split('T')[0],
      medicationList: []
    }
  },

  onLoad(options) {

  },

  bindDateChange(e) {
    this.setData({
      'formData.diagnosisDate': e.detail.value
    });
  },

  toggleSystem(e) {
    const key = e.currentTarget.dataset.key;
    const currentVal = this.data.formData[key];
    this.setData({
      [`formData.${key}`]: !currentVal
    });
  },

  bindTypeChange(e) {
    const key = e.currentTarget.dataset.key;
    const val = e.detail.value;
    const types = ['中医', '西医'];
    this.setData({
      [`formData.${key}`]: types[val]
    });
  },

  inputHistory(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`formData.${field}`]: e.detail.value
    });
  },

  addMedication() {
    const list = this.data.formData.medicationList;
    list.push({ name: '', dosage: '', startDate: '', endDate: '' });
    this.setData({
      'formData.medicationList': list
    });
  },

  submitDiagnose() {
    console.log('Submit', this.data.formData);
    wx.showToast({ title: '保存成功' });
    // request('/diagnose/save', 'POST', this.data.formData)...
  }
})