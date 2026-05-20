// pages/diagnose/detail/detail.js
const request = require('../../../../utils/request.js').request;

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
      // CVD Risk Specific
      age: '',
      isSmoking: false,
      treatedSbp: false,
      // FINDRISC Specific
      bmi: '',
      gender: '',
      waistline: '',
      physicalActivity: false,
      hasHypertension: false,
      bloodSugarLevel: '',
      // Other Extended fields
      scr: '',
      hasDiabetesOrIgt: false,
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
    },

    // Page intro data
    pageDesc: '',
    riskItems: [],
    riskLevel: ''
  },

  onLoad(options) {
    const type = options.type || 'all';
    let typeName = '详细评估';
    let pageDesc = '';
    let riskItems = [];
    let riskLevel = '';
    let pageTips = '';
    let evalMethod = '';

    const organInfo = {
      'emotion': { name: '情绪与神经障碍', desc: '代谢综合征常伴胰岛素抵抗与慢性炎症，影响神经与情绪，增加焦虑、抑郁及周围神经病变风险。', tips: '建议定期进行情绪评估，如有持续情绪低落或肢体感觉异常，请及时就医神经内科或心理科。神经病变可通过10克尼龙丝触觉检查等进行专业筛查。', evalMethod: 'PHQ-9、GAD-7', items: ['焦虑', '抑郁', '四肢麻木', '刺痛', '感觉迟钝', '肌肉无力'], level: 'low' },
      'retina': { name: '眼部并发症', desc: '高血糖会损害视网膜微血管，导致视网膜病变、白内障和青光眼风险显著增加。', tips: '一旦确诊代谢综合征或糖尿病，应立即进行首次眼底检查。之后如果结果正常，也应每年复查一次。如果出现视物模糊、变形或有黑影，应立即就诊眼科。', evalMethod: '', items: ['视力下降', '视物变形', '白内障', '青光眼'], level: 'medium' },
      'cardio': { name: '心脑血管疾病', desc: '胰岛素抵抗、高血压、血脂异常共同导致动脉粥样硬化，大幅增加冠心病、脑卒中等事件风险。', tips: '定期监测血压和血脂，控制饮食，戒烟限酒，如有胸闷或头晕等症状需及时就医排查。', evalMethod: '弗明汉风险评分', items: ['冠心病', '心绞痛', '心力衰竭', '脑血栓', '偏瘫'], level: 'high' },
      'cerebro': { name: '心脑血管疾病', desc: '胰岛素抵抗、高血压、血脂异常共同导致动脉粥样硬化，大幅增加冠心病、脑卒中等事件风险。', tips: '定期监测血压和血脂，控制饮食，戒烟限酒，如有胸闷或头晕等症状需及时就医排查。', evalMethod: '弗明汉风险评分', items: ['冠心病', '心绞痛', '心力衰竭', '脑血栓', '偏瘫'], level: 'high' },
      'liver': { name: '代谢相关脂肪肝', desc: '超过70%的2型糖尿病患者伴有脂肪肝。它不仅是肝脏问题，更是全身代谢紊乱的预警，可进展为脂肪性肝炎、肝纤维化甚至肝癌。', tips: '建议通过超声检查筛查脂肪肝。减重（减轻体重 5-10%）是治疗脂肪肝最有效的方法。需同时控制血糖和血脂，并限制酒精摄入。', evalMethod: 'NFS 肝纤维化评分', items: ['肝脏纤维化', '肝硬化', '肝衰竭'], level: 'medium' },
      'kidney': { name: '肾脏并发症', desc: '长期高血糖与高血压会损伤肾小球，引发慢性肾病。早期需通过特定指标（如UACR）发现。', tips: '建议每年检测尿白蛋白/肌酐比值（UACR）和血肌酐（用于估算肾小球滤过率）。对于糖尿病患者，血压控制目标通常<130/80 mmHg。出现眼睑或下肢浮肿、尿中泡沫明显增多时需警惕。', evalMethod: 'eGFR', items: ['慢性肾病', '尿毒症', '肾衰竭'], level: 'high' },
      'diabetes': { name: '糖尿病及相关并发症', desc: '2型糖尿病是代谢综合征最常见的并发症，以胰岛素抵抗为核心。高血糖长期作用会引发神经病变、血管病变及糖尿病足。', tips: '建议血糖异常患者自我管理教育与支持，定期监测空腹血糖、餐后血糖和糖化血红蛋白(HbA1c)。每天检查双足，保持清洁干燥，选择宽松的鞋袜，任何伤口都需认真对待。', evalMethod: 'FINDRISC 评分', items: ['胰岛素抵抗', '2型糖尿病', '糖尿病足'], level: 'high' }
    };

    if (organInfo[type]) {
      typeName = organInfo[type].name;
      pageDesc = organInfo[type].desc;
      riskItems = organInfo[type].items;
      riskLevel = organInfo[type].level;
      pageTips = organInfo[type].tips || '';
      evalMethod = organInfo[type].evalMethod || '';
    }

    // Set today's date
    const today = new Date().toISOString().split('T')[0];

    this.setData({
      type,
      typeName,
      pageDesc,
      riskItems,
      riskLevel,
      pageTips,
      evalMethod,
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
