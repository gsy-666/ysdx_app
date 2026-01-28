// pages/patient/detail.js
const request = require('../../utils/request.js').request;

// Options Dictionaries for display
const BreathOptions = {
  cough: [{ label: '1', value: '咳嗽' }, { label: '2', value: '干咳' }, { label: '3', value: '新病咳嗽' }],
  phlegmQuality: [{ label: '4', value: '吐痰' }, { label: '5', value: '痰多质稠' }, { label: '6', value: '痰少质稠' }, { label: '7', value: '痰黏难咳' }, { label: '8', value: '痰多质稀' }, { label: '9', value: '痰少质稀' }, { label: '10', value: '痰中带血' }, { label: '11', value: '泡沫痰多' }],
  phlegmColor: [{ label: '12', value: '白' }, { label: '13', value: '黄' }, { label: '14', value: '绿' }],
  breathing: [{ label: '15', value: '气喘' }, { label: '16', value: '气短' }]
};

const FoodOptions = {
  mouth: [{ label: '1', value: '口不渴' }, { label: '2', value: '口渴' }, { label: '3', value: '口苦' }, { label: '4', value: '口臭' }, { label: '5', value: '口酸' }, { label: '6', value: '口淡' }, { label: '7', value: '口黏腻' }, { label: '8', value: '口甜' }],
  thirstType: [{ label: '渴欲饮冷', value: '渴欲饮冷' }, { label: '渴欲饮热', value: '渴欲饮热' }, { label: '渴不欲饮', value: '渴不欲饮' }],
  diet: [{ label: '9', value: '纳呆恶食(食欲减退甚至不欲进食)' }, { label: '10', value: '长期食少' }, { label: '11', value: '新病食少' }, { label: '12', value: '进食无味' }, { label: '13', value: '饥不欲食' }, { label: '14', value: '久不欲食' }, { label: '15', value: '食后痞胀(进食后腹胀不适)' }, { label: '16', value: '多食易饥(吃得多仍感觉饿)' }]
};

const StoolOptions = {
  abnormal: [{ label: '1', value: '新起腹泻' }, { label: '2', value: '经常腹泻' }, { label: '3', value: '五更腹泻' }, { label: '4', value: '新病便秘' }, { label: '5', value: '经常便秘' }],
  form: [{ label: '6', value: '大便干结' }, { label: '7', value: '大便如水样' }, { label: '8', value: '大便先干后稀' }, { label: '9', value: '大便时溏时结' }, { label: '10', value: '大便腥腐臭气' }, { label: '11', value: '完谷不化' }, { label: '12', value: '便血' }],
  sensation: [{ label: '13', value: '肛门灼热' }, { label: '14', value: '肛门坠胀' }, { label: '15', value: '里急后重' }, { label: '16', value: '大便不爽' }]
};

const UrineOptions = {
  volume: [{ label: '1', value: '尿少' }, { label: '2', value: '尿清长量多' }],
  frequency: [{ label: '3', value: '长期尿频' }, { label: '4', value: '新病尿频' }, { label: '5', value: '夜尿多' }],
  color: [{ label: '6', value: '尿短黄' }, { label: '7', value: '尿黄褐' }, { label: '8', value: '尿血' }],
  sensation: [{ label: '9', value: '排尿灼热' }, { label: '10', value: '排尿涩痛' }, { label: '11', value: '余尿不尽' }, { label: '12', value: '排尿无力' }]
};

const FemaleOptions = {
  cycle: [{ label: '1', value: '闭经' }, { label: '2', value: '月经量少' }, { label: '3', value: '月经量多' }, { label: '4', value: '月经推迟' }, { label: '5', value: '月经错乱' }, { label: '6', value: '月经提前' }],
  quality: [{ label: '7', value: '月经深红' }, { label: '8', value: '月经紫黯' }, { label: '9', value: '月经稀淡' }, { label: '10', value: '经断复来' }, { label: '11', value: '经期延长' }],
  other: [{ label: '12', value: '痛经' }, { label: '13', value: '带下色黄气臭' }, { label: '14', value: '带下多而黏' }, { label: '15', value: '带下多而稀' }, { label: '16', value: '带下色白气腥' }, { label: '17', value: '遗精' }, { label: '18', value: '早泄' }, { label: '19', value: '阳痿' }]
};

const BleedingOptions = [
  { label: '1', value: '出血浅淡' }, { label: '2', value: '痰中带血' }, { label: '3', value: '出血色鲜红' }, { label: '4', value: '阴道流血' }
];

Page({
  data: {
    id: null,
    patient: null,
    diagnose: null,
    screen: null,
    grade: null,
    four: null,
    fourDisplay: null, // text formatted
    screenDisplay: null,
    bmi: '--'
  },

  onLoad: function (options) {
    if (options.id) {
      this.setData({ id: options.id });
      this.fetchDetail(options.id);
      this.fetchDiagnose(options.id);
      this.fetchScreen(options.id);
      this.fetchGrade(options.id);
      this.fetchFour(options.id);
    }
  },

  fetchDetail: function (id) {
    wx.showLoading({ title: '加载中...' });
    request('/sysAdmin/getById', 'GET', { id: id }).then(res => {
      // wx.hideLoading(); // Don't hide yet, wait for others or rely on async
      this.setData({ patient: res });
      this.calculateBMI(res);
    }).catch(err => {
      console.error(err);
    });
    // Hide loading after a short delay/timeout or when all done? 
    // For simplicity, just hide after a timeout in onLoad or let first request hide it (risky). 
    // Better to hide in individual catch/finally or just let users wait.
    setTimeout(() => { wx.hideLoading(); }, 1000);
  },

  fetchDiagnose: function (id) {
    request('/diagnose/getByPatientId', 'GET', { patientId: id }).then(res => {
      if (res) this.setData({ diagnose: res });
    });
  },

  fetchScreen: function (id) {
    request('/screen/getByPatientId', 'GET', { patientId: id }).then(res => {
      if (res) {
        this.setData({
          screen: res,
          screenDisplay: this.processScreenData(res)
        });
      }
    });
  },

  processScreenData: function (screen) {
    if (!screen) return null;
    const result = {
      metabolicRisk: false,
      metabolicCount: 0,
      findriscLevel: '',
      nfsLevel: '',
      egfrLevel: '',
      phq9Level: '',
      gad7Level: ''
    };

    // 1. 代谢综合征 (Metabolic Syndrome)
    let count = 0;
    if (screen.abdominalObesity == 1) count++;
    if (screen.highBloodSugar == 1) count++;
    if (screen.hypertension == 1) count++;
    if (parseFloat(screen.highTriglycerides) >= 1.7) count++;
    if (parseFloat(screen.lowhdl) < 1.04) count++;
    result.metabolicCount = count;
    if (count >= 3) result.metabolicRisk = true;

    // 2. 糖尿病风险 (FINDRISC)
    if (screen.findriscScore != null) {
      const s = screen.findriscScore;
      if (s < 7) result.findriscLevel = '低风险';
      else if (s < 15) result.findriscLevel = '中风险';
      else result.findriscLevel = '高风险';
    }

    // 3. 肝纤维化风险 (NFS)
    if (screen.nfsScore != null) {
      const s = screen.nfsScore;
      if (s <= -1.455) result.nfsLevel = '低风险';
      else if (s >= 0.676) result.nfsLevel = '高风险';
      else result.nfsLevel = '中风险-建议复查';
    }

    // 4. 肾功能 (eGFR)
    if (screen.egfr != null) {
      const s = screen.egfr;
      if (s >= 90) result.egfrLevel = '正常或轻度下降 (CKD 1-2期)';
      else if (s >= 60) result.egfrLevel = '轻度至中度下降 (CKD 3a期)';
      else if (s >= 30) result.egfrLevel = '中重度下降 (CKD 3b-4期)';
      else if (s >= 15) result.egfrLevel = '重度下降 (CKD 4期)';
      else result.egfrLevel = '肾衰竭 (CKD 5期)';
    }

    // 5. 抑郁风险 (PHQ-9)
    if (screen.phq9Score != null) {
      const s = screen.phq9Score;
      if (s <= 4) result.phq9Level = '没有抑郁症';
      else if (s <= 9) result.phq9Level = '轻微抑郁症';
      else if (s <= 14) result.phq9Level = '中度抑郁症';
      else if (s <= 19) result.phq9Level = '中重度抑郁症';
      else result.phq9Level = '重度抑郁症';
    }

    // 6. 焦虑风险 (GAD-7)
    if (screen.gad7Score != null) {
      const s = screen.gad7Score;
      if (s <= 4) result.gad7Level = '没有焦虑症';
      else if (s <= 9) result.gad7Level = '轻微焦虑症';
      else if (s <= 13) result.gad7Level = '中度焦虑症';
      else if (s <= 18) result.gad7Level = '中重度焦虑症';
      else result.gad7Level = '重度焦虑症';
    }

    // 7. 心血管疾病风险 (CVD - China-PAR/Framingham)
    // 假设 screen.cvdRisk 为 10年风险百分比 (例如 5.5 代表 5.5%)
    if (screen.cvdRisk != null) {
      const r = parseFloat(screen.cvdRisk);
      if (r < 10) result.cvdLevel = '低风险';
      else if (r < 20) result.cvdLevel = '中风险';
      else result.cvdLevel = '高风险';
    }

    // 8. 抑郁自评量表 (SDS)
    // 假设 screen.sdsIndex 为标准分指数 (0-1.0) 或 screen.sdsScore 为标准分 (25-100)
    // 图片显示Index: <0.5 无, 0.5-0.59 轻微至轻度, 0.60-0.69 中至重度, >0.70 重度
    if (screen.sdsIndex != null) {
      const idx = parseFloat(screen.sdsIndex);
      if (idx < 0.5) result.sdsLevel = '无抑郁症状';
      else if (idx < 0.6) result.sdsLevel = '轻微至轻度抑郁';
      else if (idx < 0.7) result.sdsLevel = '中至重度抑郁';
      else result.sdsLevel = '重度抑郁';
    }

    return result;
  },

  fetchGrade: function (id) {
    request('/grade/getByPatientId', 'GET', { patientId: id }).then(res => {
      if (res) this.setData({ grade: res });
    });
  },

  fetchFour: function (id) {
    request('/four/getByPatientId', 'GET', { patientId: id }).then(res => {
      if (res && res.length > 0) {
        // Take the latest one
        const latest = res[res.length - 1];
        this.setData({ four: latest });
        this.processFourData(latest);
      }
    });
  },

  processFourData(four) {
    // Helper to safely parse
    const safeParse = (str) => {
      try { return str ? JSON.parse(str) : null; } catch (e) { return null; }
    };

    // Helper to find labels
    const findLabels = (keys, options) => {
      if (!keys || !options) return [];
      return keys.map(k => {
        const found = options.find(opt => opt.label == k);
        return found ? found.value : k;
      });
    };

    const display = {};

    // 1. Life
    const life = safeParse(four.life);
    if (life && life.selected && life.items) {
      display.life = findLabels(life.selected, life.items).join(', ');
    }

    // 2. ColdHot (Array of {name, checked})
    const coldHot = safeParse(four.coldHot);
    if (coldHot) {
      display.coldHot = coldHot.filter(i => i.checked).map(i => i.name).join(', ');
    }

    // 3. Sweat
    const sweat = safeParse(four.sweat);
    if (sweat) {
      display.sweat = sweat.filter(i => i.checked).map(i => i.name).join(', ');
    }

    // 4. Pain (Locations -> Natures)
    const hurt = safeParse(four.hurt);
    if (hurt) {
      const painList = [];
      hurt.filter(l => l.checked).forEach(l => {
        const nature = l.natures.filter(n => n.checked).map(n => n.name).join('/');
        painList.push(`${l.name}${nature ? '(' + nature + ')' : ''}`);
      });
      display.pain = painList.join(', ');
    }

    // 5. HeadBody
    const headBody = safeParse(four.headBody);
    if (headBody) {
      const parts = [];
      if (headBody.head) parts.push(...headBody.head.filter(i => i.checked).map(i => '头面:' + i.name));
      if (headBody.throat) parts.push(...headBody.throat.filter(i => i.checked).map(i => '咽喉:' + i.name));
      if (headBody.chest) parts.push(...headBody.chest.filter(i => i.checked).map(i => '胸部:' + i.name));
      display.headBody = parts.join('; ');
    }

    // 6. Sleep
    const sleep = safeParse(four.sleep);
    if (sleep) {
      display.sleep = sleep.filter(i => i.checked).map(i => i.name).join(', ');
    }

    // 7. Breath (Object with keys)
    const breath = safeParse(four.breath);
    if (breath) {
      const bList = [];
      if (breath.cough) bList.push(...findLabels(breath.cough, BreathOptions.cough));
      if (breath.phlegm && breath.phlegm.quality) bList.push(...findLabels(breath.phlegm.quality, BreathOptions.phlegmQuality));
      if (breath.phlegm && breath.phlegm.color) bList.push(...findLabels([breath.phlegm.color], BreathOptions.phlegmColor));
      if (breath.breathing) bList.push(...findLabels(breath.breathing, BreathOptions.breathing));
      display.breath = bList.join(', ');
    }

    // 8. Food
    const food = safeParse(four.food);
    if (food) {
      const fList = [];
      if (food.mouth) fList.push(...findLabels(food.mouth, FoodOptions.mouth));
      if (food.thirstType) fList.push(food.thirstType); // Value directly stored? Check four.js. Yes, thirstType is string value.
      if (food.diet) fList.push(...findLabels(food.diet, FoodOptions.diet));
      display.food = fList.join(', ');
    }

    // 9. Stool
    const stool = safeParse(four.stool);
    if (stool) {
      const sList = [];
      if (stool.abnormal) sList.push(...findLabels(stool.abnormal, StoolOptions.abnormal));
      if (stool.form) sList.push(...findLabels(stool.form, StoolOptions.form));
      if (stool.sensation) sList.push(...findLabels(stool.sensation, StoolOptions.sensation));
      display.stool = sList.join(', ');
    }

    // 10. Urine
    const urine = safeParse(four.urine);
    if (urine) {
      const uList = [];
      if (urine.volume) uList.push(...findLabels(urine.volume, UrineOptions.volume));
      if (urine.frequency) uList.push(...findLabels(urine.frequency, UrineOptions.frequency));
      if (urine.color) uList.push(...findLabels(urine.color, UrineOptions.color));
      if (urine.sensation) uList.push(...findLabels(urine.sensation, UrineOptions.sensation));
      display.urine = uList.join(', ');
    }

    // 11. Female
    const female = safeParse(four.female);
    if (female) {
      const femList = [];
      if (female.cycle) femList.push(...findLabels(female.cycle, FemaleOptions.cycle));
      if (female.quality) femList.push(...findLabels(female.quality, FemaleOptions.quality));
      if (female.other) femList.push(...findLabels(female.other, FemaleOptions.other));
      display.female = femList.join(', ');
    }

    // 12. Bleeding
    const bleeding = safeParse(four.bleeding);
    if (bleeding && bleeding.length) {
      display.bleeding = findLabels(bleeding, BleedingOptions).join(', ');
    }

    // 13. Voice
    const voice = safeParse(four.voice);
    if (voice) {
      display.voice = voice.filter(i => i.checked).map(i => i.name).join(', ');
    }

    this.setData({ fourDisplay: display });
  },

  calculateBMI: function (patient) {
    if (patient && patient.height && patient.weight) {
      const h = patient.height / 100;
      const bmi = (patient.weight / (h * h)).toFixed(1);
      this.setData({ bmi });
    }
  },

  callPatient: function () {
    if (this.data.patient && this.data.patient.phone) {
      wx.makePhoneCall({
        phoneNumber: this.data.patient.phone
      });
    } else {
      wx.showToast({ title: '无联系方式', icon: 'none' });
    }
  },

  viewHealthReport: function () {
    wx.showToast({
      title: '健康档案功能开发中',
      icon: 'none'
    });
  }
})
