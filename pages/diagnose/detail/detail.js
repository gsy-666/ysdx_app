// pages/diagnose/detail/detail.js
const request = require('../../../utils/request.js').request;

Page({
  data: {
    type: '', // emotion, diabetes, etc.
    typeName: '详细评估',
    // ... Copying data structure from diagnose.js ...
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
      // Extended fields
      sbp: '',
      totalCholesterol: '',
      scr: '',
      dailyActivity: false,
      dailyVegetable: false,
      historyHighGlucose: false,
      familyDiabetes: '',
      ast: '',
      alt: '',
      platelets: '',
      albumin: '',
      // Diagnosis basic info
      diagnosisDate: '2023-01-01', // Default or today
      surgeryHistory: '',
      allergyHistory: '',
      medicationList: [],
      // Systems
      digestive: false, digestiveType: '',
      respiratory: false, respiratoryType: '',
      circulatory: false, circulatoryType: '',
      nervous: false, nervousType: '',
    }
  },

  onLoad(options) {
    const type = options.type || 'all';
    let typeName = '详细评估';
    switch (type) {
      case 'emotion': typeName = '情绪风险评估'; break;
      case 'diabetes': typeName = '糖尿病风险筛查'; break;
      case 'cerebro': typeName = '脑血管疾病风险'; break;
      case 'cardio': typeName = '心血管疾病风险'; break;
      case 'kidney': typeName = '慢性肾病风险'; break;
      case 'retina': typeName = '视网膜疾病风险'; break;
      case 'nerve': typeName = '神经病变风险'; break;
    }

    // Set today's date
    const today = new Date().toISOString().split('T')[0];

    this.setData({
      type,
      typeName,
      'formData.diagnosisDate': today
    });
  },

  // ... Copying methods from diagnose.js ...

  onScreenSwitch(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ [`formData.${key}`]: e.detail.value });
  },

  bindScreenPick(e) {
    const key = e.currentTarget.dataset.key;
    const ranges = {
      diabetesType: ['空腹血糖>6.1mmol/L', '餐后2h血糖>7.8mmol/L', '已确诊糖尿病'],
      hypertensionType: ['血压>130/85mmHg', '已确诊为高血压病治疗者'],
      familyDiabetes: ['无', '祖父母/姑姨叔舅/表亲', '父母/兄弟姐妹/子女']
    };
    const idx = e.detail.value;
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
    // Implement submission logic
    console.log('Submission data:', this.data.formData);
    wx.showToast({
      title: '提交成功',
      icon: 'success'
    });
    setTimeout(() => { wx.navigateBack() }, 1500);
  }
});
