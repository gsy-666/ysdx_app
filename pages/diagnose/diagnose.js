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
      // Screen Data
      abdominalObesity: false,
      highBloodSugar: false, diabetesType: '',
      hypertension: false, hypertensionType: '',
      highTriglycerides: '',
      lowhdl: '',

      // Diagnose Data
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

  // Screen handlers
  onScreenSwitch(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ [`formData.${key}`]: e.detail.value });
  },
  bindScreenPick(e) {
    const key = e.currentTarget.dataset.key;
    const idx = e.detail.value;
    const ranges = {
      diabetesType: ['空腹血糖>6.1mmol/L', '餐后2h血糖>7.8mmol/L', '已确诊糖尿病'],
      hypertensionType: ['血压>130/85mmHg', '已确诊为高血压病治疗者']
    };
    this.setData({ [`formData.${key}`]: ranges[key][idx] });
  },
  inputScreen(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ [`formData.${key}`]: e.detail.value });
  },

  goTest(e) {
    const type = e.currentTarget.dataset.type;
    // Map type 1 -> sas, 2 -> sds
    const typeStr = type == 1 ? 'sas' : 'sds';
    wx.navigateTo({
      url: `/pages/grade/questionnaire/questionnaire?type=${typeStr}`,
    });
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
    const patientId = wx.getStorageSync('id');
    if (!patientId) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    const { formData } = this.data;
    wx.showLoading({ title: '保存中' });

    // 1. Prepare Diagnose Payload
    // Map frontend keys to backend entity fields
    const diagnosePayload = {
      patientId: patientId,
      digestiveSelected: formData.digestive,
      digestiveType: formData.digestiveType,
      respiratorySelected: formData.respiratory,
      respiratoryType: formData.respiratoryType,
      cardiovascularSelected: formData.circulatory,
      cardiovascularType: formData.circulatoryType,
      neuroPsychiatricSelected: formData.nervous,
      neuroPsychiatricType: formData.nervousType,
      eyeEarNoseThroatSelected: false,
      urinaryReproductiveSelected: false,
      bloodSelected: false,
      endocrineSelected: false,
      motorSelected: false,
      surgeryHistory: formData.surgeryHistory,
      allergyHistory: formData.allergyHistory,
      smokingHistory: formData.smokingHistory,
      drinkingHistory: formData.drinkingHistory,
      diagnosisDate: formData.diagnosisDate,
      medications: JSON.stringify(formData.medicationList)
    };

    // 2. Prepare Screen Payload
    const screenPayload = {
      patientId: patientId,
      abdominalObesity: formData.abdominalObesity ? 1 : 0,
      highBloodSugar: formData.highBloodSugar ? 1 : 0,
      diabetesType: formData.diabetesType,
      hypertension: formData.hypertension ? 1 : 0,
      hypertensionType: formData.hypertensionType,
      highTriglycerides: formData.highTriglycerides,
      lowhdl: formData.lowhdl
    };

    const p1 = request('/diagnose/add', 'POST', diagnosePayload);
    const p2 = request('/screen/add', 'POST', screenPayload);

    Promise.all([p1, p2]).then(res => {
      wx.hideLoading();
      wx.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => { wx.navigateBack(); }, 1500);
    }).catch(err => {
      wx.hideLoading();
      console.error(err);
      wx.showToast({ title: '保存失败', icon: 'none' });
    });
  }
})