const ANALYSIS_STORAGE_KEY = 'diag_model_analysis_v1';
const LABEL_COLUMNS = ['脾', '肝', '肾', '肺', '心', '胃', '热', '痰', '湿', '阴虚', '阳虚', '气滞', '气虚', '血瘀', '血虚'];

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function riskFromRange(value, normalLow, normalHigh) {
  const v = toNum(value);
  if (!v) return 0;
  if (v >= normalLow && v <= normalHigh) return 20;
  if (v < normalLow) {
    return clamp(((normalLow - v) / Math.max(1, normalLow)) * 100, 0, 100);
  }
  return clamp(((v - normalHigh) / Math.max(1, normalHigh)) * 100 + 30, 0, 100);
}

function riskFromLow(value, thresholdLow) {
  const v = toNum(value);
  if (!v) return 0;
  if (v >= thresholdLow) return 20;
  return clamp(((thresholdLow - v) / Math.max(1, thresholdLow)) * 100 + 20, 0, 100);
}

function riskFromHigh(value, thresholdHigh) {
  const v = toNum(value);
  if (!v) return 0;
  if (v <= thresholdHigh) return 20;
  return clamp(((v - thresholdHigh) / Math.max(1, thresholdHigh)) * 100 + 25, 0, 100);
}

function average(list) {
  if (!list.length) return 0;
  return list.reduce((a, b) => a + b, 0) / list.length;
}

function pad(n) {
  return n < 10 ? `0${n}` : String(n);
}

function formatDateTime(date) {
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${y}-${m}-${d} ${hh}:${mm}`;
}

Page({
  data: {
    genderOptions: ['男', '女'],
    vectorPlaceholder: '可粘贴以 Tab 分隔的完整向量（可选）',
    form: {
      age: '',
      gender: '',
      weight: '',
      height: '',
      waist: '',
      sbp: '',
      dbp: '',
      glucose: '',
      hba1c: '',
      tc: '',
      tg: '',
      hdl: '',
      ldl: '',
      alt: '',
      ast: '',
      creatinine: '',
      urea: '',
      uric: '',
      smoking: false,
      exercise: false,
      intestineRaw: '',
      tongueRaw: ''
    },
    bmi: '--'
  },

  onInput(e) {
    const key = e.currentTarget.dataset.key;
    const value = e.detail.value;
    this.setData({ [`form.${key}`]: value }, () => {
      if (key === 'weight' || key === 'height') {
        this.recalculateBmi();
      }
    });
  },

  onSwitch(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ [`form.${key}`]: e.detail.value });
  },

  onGenderChange(e) {
    const idx = Number(e.detail.value);
    const gender = this.data.genderOptions[idx] || '';
    this.setData({ 'form.gender': gender });
  },

  recalculateBmi() {
    const weight = toNum(this.data.form.weight);
    const heightCm = toNum(this.data.form.height);
    if (!weight || !heightCm) {
      this.setData({ bmi: '--' });
      return;
    }
    const bmi = weight / Math.pow(heightCm / 100, 2);
    this.setData({ bmi: bmi.toFixed(1) });
  },

  validateRequired() {
    const requiredKeys = ['age', 'weight', 'height', 'waist', 'sbp', 'dbp', 'glucose', 'tc', 'tg', 'hdl', 'ldl', 'creatinine'];
    const missing = requiredKeys.filter((k) => !String(this.data.form[k]).trim());
    return {
      ok: missing.length === 0,
      missing
    };
  },

  buildModelInput() {
    const f = this.data.form;
    const bmiNum = this.data.bmi === '--' ? 0 : toNum(this.data.bmi);

    const basic = {
      '年龄': toNum(f.age),
      '体重(KG)': toNum(f.weight),
      '身高(CM)': toNum(f.height),
      'BMI': bmiNum,
      '腹围(CM)': toNum(f.waist),
      '收缩压（mmHg）': toNum(f.sbp),
      '舒张压（mmHg）': toNum(f.dbp),
      '糖(mmol/L)': toNum(f.glucose),
      'HbA1C': toNum(f.hba1c),
      '总胆固醇(mmol/L)': toNum(f.tc),
      '甘油三酯(mmol/L)': toNum(f.tg),
      '高密度脂蛋白(mmol/L)': toNum(f.hdl),
      '低密度脂蛋白(mmol/L)': toNum(f.ldl),
      '谷丙转氨酶(U/L)': toNum(f.alt),
      '肌酐(umol/L)': toNum(f.creatinine),
      '尿素氮(mmol/L)': toNum(f.urea),
      '尿酸(umol/L)': toNum(f.uric)
    };

    return {
      basic,
      intestine: f.intestineRaw || '',
      tongue: f.tongueRaw || ''
    };
  },

  buildAnalysis() {
    const f = this.data.form;
    const bmiNum = this.data.bmi === '--' ? 0 : toNum(this.data.bmi);

    const ageRisk = riskFromRange(f.age, 20, 55);
    const sbpRisk = riskFromRange(f.sbp, 100, 130);
    const dbpRisk = riskFromRange(f.dbp, 60, 85);
    const glucoseRisk = riskFromRange(f.glucose, 3.9, 6.1);
    const tcRisk = riskFromRange(f.tc, 3.1, 5.2);
    const tgRisk = riskFromRange(f.tg, 0.5, 1.7);
    const ldlRisk = riskFromRange(f.ldl, 1.8, 3.4);
    const hdlRisk = riskFromLow(f.hdl, 1.0);
    const bmiRisk = riskFromRange(bmiNum, 18.5, 24);
    const waistRisk = riskFromRange(f.waist, 70, 90);
    const altRisk = riskFromRange(f.alt, 0, 40);
    const astRisk = riskFromRange(f.ast, 0, 40);
    const creatinineRisk = riskFromRange(f.creatinine, 44, 106);
    const ureaRisk = riskFromRange(f.urea, 2.8, 7.2);
    const uricRisk = riskFromRange(f.uric, 150, 420);

    const smokingPenalty = f.smoking ? 18 : 0;
    const sedentaryPenalty = f.exercise ? 0 : 12;

    const heart = clamp(Math.round(average([
      ageRisk,
      sbpRisk,
      dbpRisk,
      tcRisk,
      ldlRisk,
      hdlRisk,
      glucoseRisk
    ]) + smokingPenalty * 0.7), 8, 95);

    const liver = clamp(Math.round(average([
      altRisk,
      astRisk,
      tgRisk,
      bmiRisk,
      waistRisk
    ])), 8, 95);

    const spleen = clamp(Math.round(average([
      bmiRisk,
      waistRisk,
      glucoseRisk,
      tgRisk
    ]) + sedentaryPenalty * 0.4), 8, 95);

    const lung = clamp(Math.round(average([
      ageRisk,
      bmiRisk,
      hdlRisk
    ]) + smokingPenalty + sedentaryPenalty * 0.3), 8, 95);

    const kidney = clamp(Math.round(average([
      creatinineRisk,
      ureaRisk,
      uricRisk,
      sbpRisk,
      glucoseRisk
    ])), 8, 95);

    const lowBmiRisk = riskFromLow(bmiNum || 18.5, 18.5);
    const lowDbpRisk = riskFromLow(f.dbp || 60, 60);
    const lowSbpRisk = riskFromLow(f.sbp || 100, 100);
    const lowHemodynamicRisk = clamp(Math.round(average([lowSbpRisk, lowDbpRisk])), 0, 100);

    const radarValues = [heart, liver, spleen, lung, kidney];
    const names = ['心系', '肝系', '脾系', '肺系', '肾系'];

    const labelScores = {
      '脾': spleen,
      '肝': liver,
      '肾': kidney,
      '肺': lung,
      '心': heart,
      '胃': clamp(Math.round(average([spleen, liver, glucoseRisk, waistRisk])), 8, 95),
      '热': clamp(Math.round(average([glucoseRisk, uricRisk, altRisk, tgRisk])), 8, 95),
      '痰': clamp(Math.round(average([tgRisk, bmiRisk, waistRisk, ldlRisk])), 8, 95),
      '湿': clamp(Math.round(average([bmiRisk, waistRisk, tgRisk, glucoseRisk])) + 4, 8, 95),
      '阴虚': clamp(Math.round(average([ageRisk, kidney, riskFromHigh(f.glucose, 6.1), riskFromHigh(f.uric, 420)])), 8, 95),
      '阳虚': clamp(Math.round(average([lowHemodynamicRisk, lowBmiRisk, sedentaryPenalty * 4])), 8, 95),
      '气滞': clamp(Math.round(average([sedentaryPenalty * 5, waistRisk, liver, heart * 0.6])), 8, 95),
      '气虚': clamp(Math.round(average([sedentaryPenalty * 5, lowBmiRisk, ageRisk, lowHemodynamicRisk])), 8, 95),
      '血瘀': clamp(Math.round(average([heart, sbpRisk, ldlRisk]) + smokingPenalty * 0.6), 8, 95),
      '血虚': clamp(Math.round(average([lowBmiRisk, lowHemodynamicRisk, hdlRisk])), 8, 95)
    };

    const labelRiskList = LABEL_COLUMNS.map((name) => ({
      name,
      score: clamp(Math.round(labelScores[name] || 0), 0, 100)
    }));

    const sorted = names
      .map((name, idx) => ({ name, score: radarValues[idx] }))
      .sort((a, b) => b.score - a.score);

    const top = sorted[0];
    const second = sorted[1];

    const riskLevelText = top.score >= 75 ? '偏高' : top.score >= 55 ? '中等' : '可控';
    const secondText = second.score >= 65 ? '需要重点关注' : '建议持续跟踪';

    const analysisText = `您的【${top.name}】负担${riskLevelText}；【${second.name}】${secondText}。建议结合近1-3个月体检指标持续复测并优化生活方式。`;

    return {
      radarValues,
      analysisText,
      labelScores,
      labelRiskList
    };
  },

  submitCollection() {
    const check = this.validateRequired();
    if (!check.ok) {
      wx.showToast({
        title: '请完善必填指标',
        icon: 'none'
      });
      return;
    }

    const modelInput = this.buildModelInput();
    const analysis = this.buildAnalysis();
    const updatedAt = formatDateTime(new Date());

    wx.setStorageSync(ANALYSIS_STORAGE_KEY, {
      updatedAt,
      modelInput,
      radarValues: analysis.radarValues,
      analysisText: analysis.analysisText,
      labelScores: analysis.labelScores,
      labelRiskList: analysis.labelRiskList
    });

    wx.showToast({
      title: '分析完成',
      icon: 'success'
    });

    setTimeout(() => {
      wx.navigateBack();
    }, 500);
  }
});
