const app = getApp()
const requestModule = require('../../utils/request.js');
const request = requestModule.request;
const getBaseURL = requestModule.getBaseURL;

Page({
  data: {
    step: 1,
    activeSection: '1',
    activeTab: 'body', // 'body' or 'coating'

    // Tongue diagnosis is kept for future development
    tongueData: {
      logo: '',
      label: '',
      tongueBody: {
        color: 8,
        oldYoung: 0,
        fatThin: 0,
        teethMark: 0,
        prick: { checkedAreas: [], severity: { tip: 0, sides: 0, center: 0, root: 0 } },
        crack: { checkedAreas: [], severity: { tip: 0, sides: 0, center: 0, root: 0 } },
        soft: 0, stiff: 0, deviate: 0, tremble: 0, protrude: 0, shorten: 0
      },
      tongueCoating: {
        color: { tip: 'white', sides: 'white', center: 'white', root: 'white' },
        colorDepth: { tip: 1, sides: 1, center: 1, root: 1 },
        thickThin: { tip: 0, sides: 0, center: 0, root: 0 },
        thickThinChange: 'normal',
        dryMoist: 0,
        dryMoistChange: 'normal',
        greasy: { checkedAreas: [], type: { tip: 'greasy', sides: 'greasy', center: 'greasy', root: 'greasy' } }
      }
    },

    coatingColors: [
      { value: 'white', label: '白' }, { value: 'yellow', label: '黄' }, { value: 'grayBlack', label: '灰黑' }
    ],
    tongueAreas: [
      { value: 'tip', label: '舌尖' }, { value: 'sides', label: '舌边' }, { value: 'center', label: '舌中' }, { value: 'root', label: '舌根' }
    ],

    // === Step 2: 13 Sections ===
    life: {
      items: [
        { label: '1', value: '嗜食辛辣' }, { label: '2', value: '嗜食肥甘厚味' }, { label: '3', value: '感受风寒' },
        { label: '4', value: '环境潮湿' }, { label: '5', value: '过食生冷' }, { label: '6', value: '外伤所致' },
        { label: '7', value: '手术后遗症' }, { label: '8', value: '嗜烟/酒' }, { label: '9', value: '无' }
      ],
      selected: [],
      supplements: {}
    },

    coldHotItems: [
      { id: 1, name: '发热', subOptions: ['新起微发热', '发热重', '烦躁发热', '阵发烘热', '自觉发热', '骨蒸发热', '喜凉恶热'], checked: false, selectedSub: [], severity: 1 },
      { id: 2, name: '恶风寒', checked: false, severity: 1 },
      { id: 3, name: '恶寒发热', checked: false, severity: 1 },
      { id: 4, name: '关节冷', checked: false, severity: 1 },
      { id: 5, name: '手足心烧', checked: false, severity: 1 },
      { id: 6, name: '经常恶风', checked: false, severity: 1 },
    ],

    sweatItems: [
      { id: 1, name: '自汗', checked: false, severity: 1 },
      { id: 2, name: '暑天汗多', checked: false, severity: 1 },
      { id: 3, name: '但头汗多', checked: false, severity: 1 },
      { id: 4, name: '盗汗', checked: false, severity: 1 },
      { id: 5, name: '热甚汗多', checked: false, severity: 1 },
      { id: 6, name: '局部汗多', checked: false, severity: 1 },
      { id: 7, name: '阵发汗出', checked: false, severity: 1 },
      { id: 8, name: '出虚汗', checked: false, severity: 1 },
      { id: 9, name: '汗多无不适', checked: false, severity: 1 },
      { id: 10, name: '无汗', checked: false, severity: 1 },
    ],

    painLocations: [], // Initialized in onLoad

    headBodyItems: {
      head: [
        { id: 1, name: '头晕', checked: false, severity: 1 },
        { id: 2, name: '头重', checked: false, severity: 1 },
        { id: 3, name: '头蒙如裹', checked: false, severity: 1 },
        { id: 4, name: '目黄', checked: false, severity: 1 },
        { id: 5, name: '眼屎多', checked: false, severity: 1 },
        { id: 6, name: '眼花', checked: false, severity: 1 },
        { id: 7, name: '眼干涩', checked: false, severity: 1 },
        { id: 8, name: '视物模糊', checked: false, severity: 1 },
        { id: 9, name: '畏光', checked: false, severity: 1 },
        { id: 10, name: '耳鸣', subOptions: ['耳久鸣', '耳暴鸣'], checked: false, selectedSub: '', severity: 1 },
        { id: 11, name: '鼻塞', subOptions: ['有涕', '无涕'], checked: false, selectedSub: '', severity: 1 },
        { id: 12, name: '鼻唇干燥', checked: false, severity: 1 },
        { id: 13, name: '鼻衄', checked: false, severity: 1 },
        { id: 14, name: '流涕', subOptions: ['清涕', '黄涕'], checked: false, selectedSub: '', severity: 1 },
      ],
      throat: [
        { id: 15, name: '喉痒', checked: false, severity: 1 },
        { id: 16, name: '咽干', checked: false, severity: 1 },
        { id: 17, name: '咽部异物感', checked: false, severity: 1 },
      ],
      chest: [
        { id: 18, name: '心悸', checked: false, severity: 1 },
        { id: 19, name: '心烦', checked: false, severity: 1 },
        { id: 20, name: '心慌', checked: false, severity: 1 },
        { id: 21, name: '胸闷', checked: false, severity: 1 },
        { id: 22, name: '胁胀', checked: false, severity: 1 },
      ],
      abdomen: [
        { id: 23, name: '脘痞', checked: false, severity: 1 },
        { id: 24, name: '胃脘嘈杂', checked: false, severity: 1 },
        { id: 25, name: '脘腹腰背冷', checked: false, severity: 1 },
        { id: 26, name: '腹胀', checked: false, severity: 1 },
      ],
      other: [
        { id: 27, name: '身重', checked: false, severity: 1 },
        { id: 28, name: '肢体肌肤麻木', checked: false, severity: 1 },
        { id: 29, name: '四肢麻木', checked: false, severity: 1 },
        { id: 30, name: '筋惕肉瞤', checked: false, severity: 1 },
        { id: 31, name: '倦怠乏力', checked: false, severity: 1 },
        { id: 32, name: '恶心', checked: false, severity: 1 },
        { id: 33, name: '皮肤瘙痒', checked: false, severity: 1 },
        { id: 34, name: '阴部瘙痒', checked: false, severity: 1 },
      ]
    },

    sleepItems: [
      { id: 1, name: '失眠', checked: false, severity: 1 },
      { id: 2, name: '睡眠不实', checked: false, severity: 1 },
      { id: 3, name: '鼾声不止', checked: false, severity: 1 },
      { id: 4, name: '多梦', checked: false, severity: 1 },
      { id: 5, name: '嗜睡', checked: false, severity: 1 },
      { id: 6, name: '急躁易怒', checked: false, severity: 1 },
      { id: 7, name: '胆怯易惊', checked: false, severity: 1 },
      { id: 8, name: '神疲', subOptions: ['动则益甚', '动后稍舒'], checked: false, selectedSub: '', severity: 1 },
      { id: 9, name: '情绪易激动', checked: false, severity: 1 },
      { id: 10, name: '病情与情志有关', checked: false, severity: 1 },
      { id: 11, name: '情志抑郁', checked: false, severity: 1 },
    ],

    breath: {
      cough: [],
      phlegm: { quality: [], color: '' },
      breathing: [],
      edema: { checked: false, type: '' }
    },
    breathOptions: {
      cough: [{ label: '1', value: '咳嗽' }, { label: '2', value: '干咳' }, { label: '3', value: '新病咳嗽' }],
      phlegmQuality: [{ label: '4', value: '吐痰' }, { label: '5', value: '痰多质稠' }, { label: '6', value: '痰少质稠' }, { label: '7', value: '痰黏难咳' }, { label: '8', value: '痰多质稀' }, { label: '9', value: '痰少质稀' }, { label: '10', value: '痰中带血' }, { label: '11', value: '泡沫痰多' }],
      phlegmColor: [{ label: '12', value: '白' }, { label: '13', value: '黄' }, { label: '14', value: '绿' }],
      breathing: [{ label: '15', value: '气喘' }, { label: '16', value: '气短' }],
      edemaType: [{ label: '反复', value: '反复' }, { label: '局部', value: '局部' }, { label: '新起', value: '新起' }]
    },

    food: { mouth: [], thirstType: '', diet: [] },

    foodOptions: {
      mouth: [{ label: '1', value: '口不渴' }, { label: '2', value: '口渴' }, { label: '3', value: '口苦' }, { label: '4', value: '口臭' }, { label: '5', value: '口酸' }, { label: '6', value: '口淡' }, { label: '7', value: '口黏腻' }, { label: '8', value: '口甜' }],
      thirstType: [{ label: '渴欲饮冷', value: '渴欲饮冷' }, { label: '渴欲饮热', value: '渴欲饮热' }, { label: '渴不欲饮', value: '渴不欲饮' }],
      diet: [{ label: '9', value: '纳呆恶食(食欲减退甚至不欲进食)' }, { label: '10', value: '长期食少' }, { label: '11', value: '新病食少' }, { label: '12', value: '进食无味' }, { label: '13', value: '饥不欲食' }, { label: '14', value: '久不欲食' }, { label: '15', value: '食后痞胀(进食后腹胀不适)' }, { label: '16', value: '多食易饥(吃得多仍感觉饿)' }]
    },

    stool: { abnormal: [], form: [], sensation: [] },
    stoolOptions: {
      abnormal: [{ label: '1', value: '新起腹泻' }, { label: '2', value: '经常腹泻' }, { label: '3', value: '五更腹泻(黎明前腹痛腹泻)' }, { label: '4', value: '新病便秘(最近才开始便秘)' }, { label: '5', value: '经常便秘' }],
      form: [{ label: '6', value: '大便干结' }, { label: '7', value: '大便如水样' }, { label: '8', value: '大便先干后稀' }, { label: '9', value: '大便时溏时结(大便时稀时干)' }, { label: '10', value: '大便腥腐臭气' }, { label: '11', value: '完谷不化(大便中有许多未消化食物)' }, { label: '12', value: '便血(大便带血)' }],
      sensation: [{ label: '13', value: '肛门灼热' }, { label: '14', value: '肛门坠胀(肛门有下坠胀满感)' }, { label: '15', value: '里急后重(腹痛，时时欲腹泻，便出不爽)' }, { label: '16', value: '大便不爽(排便不顺畅，排完还想排)' }]
    },

    urine: { volume: [], frequency: [], color: [], sensation: [] },
    urineOptions: {
      volume: [{ label: '1', value: '尿少' }, { label: '2', value: '尿清长量多' }],
      frequency: [{ label: '3', value: '长期尿频' }, { label: '4', value: '新病尿频' }, { label: '5', value: '夜尿多' }],
      color: [{ label: '6', value: '尿短黄(色黄而短少)' }, { label: '7', value: '尿黄褐' }, { label: '8', value: '尿血' }],
      sensation: [{ label: '9', value: '排尿灼热' }, { label: '10', value: '排尿涩痛' }, { label: '11', value: '余尿不尽(排尿后仍有点滴排出)' }, { label: '12', value: '排尿无力' }]
    },

    female: { cycle: [], quality: [], other: [] },
    femaleOptions: {
      cycle: [{ label: '1', value: '闭经' }, { label: '2', value: '月经量少' }, { label: '3', value: '月经量多' }, { label: '4', value: '月经推迟' }, { label: '5', value: '月经错乱' }, { label: '6', value: '月经提前' }],
      quality: [{ label: '7', value: '月经深红' }, { label: '8', value: '月经紫黯' }, { label: '9', value: '月经稀淡' }, { label: '10', value: '经断复来(经期停止后又来)' }, { label: '11', value: '经期延长' }],
      other: [{ label: '12', value: '痛经' }, { label: '13', value: '带下色黄气臭' }, { label: '14', value: '带下多而黏' }, { label: '15', value: '带下多而稀' }, { label: '16', value: '带下色白气腥' }, { label: '17', value: '遗精' }, { label: '18', value: '早泄' }, { label: '19', value: '阳痿' }]
    },

    bleeding: [],

    voiceItems: [
      { id: 1, name: '嗳气', subOptions: ['酸馊', '无酸馊'], checked: false, selectedSub: '' },
      { id: 2, name: '喜叹气', checked: false },
      { id: 3, name: '气喘', checked: false },
      { id: 4, name: '矢气', subOptions: ['多', '甚臭'], checked: false, selectedSub: '' },
      { id: 5, name: '呃逆', checked: false },
      { id: 6, name: '声音洪亮', checked: false },
      { id: 7, name: '声低', checked: false },
      { id: 8, name: '声音重浊', checked: false },
      { id: 9, name: '呕吐', subOptions: ['呕吐酸水', '清水', '酸馊食物'], checked: false, selectedSub: '' },
    ]
  },

  onLoad(options) {
    this.initPainData();
    const step = options && options.step ? String(options.step) : '1';
    this.setData({
      step,
      activeSection: '1',
      activeTab: 'body'
    });
  },

  // === Tongue Logic ===
  chooseImage() {
    const that = this;

    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success(res) {
        const filePath = res.tempFiles[0].tempFilePath;
        that.setData({
          'tongueData.logo': filePath,
          'tongueData.label': ''
        });

        // 写死：模拟AI分析，2秒后直接显示"黄苔"
        wx.showLoading({ title: 'AI分析中' });
        setTimeout(() => {
          wx.hideLoading();
          that.setData({
            'tongueData.label': '黄苔',
            // 自动切换到望舌苔 tab，并预设苔色为黄
            activeTab: 'coating',
            'tongueData.tongueCoating.color.tip': 'yellow',
            'tongueData.tongueCoating.color.sides': 'white',
            'tongueData.tongueCoating.color.center': 'yellow',
            'tongueData.tongueCoating.color.root': 'yellow',
            'tongueData.tongueCoating.colorDepth.tip': 2,
            'tongueData.tongueCoating.colorDepth.sides': 2,
            'tongueData.tongueCoating.colorDepth.center': 3,
            'tongueData.tongueCoating.colorDepth.root': 2,
            'tongueData.tongueCoating.dryMoist': 0
          });
          wx.showToast({ title: '舌诊完成', icon: 'success' });
        }, 2000);
      },
      fail() {
        wx.showToast({ title: '未选择图片', icon: 'none' });
      }
    });
  },

  switchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab });
  },

  onSliderDeep(e) {
    const path = e.currentTarget.dataset.path;
    this.setData({ [path]: e.detail.value });
  },

  // === Navigation ===
  nextStep() {
    this.setData({ step: 2 });
    wx.pageScrollTo({ scrollTop: 0 });
  },

  prevStep() {
    this.setData({ step: 1 });
    wx.pageScrollTo({ scrollTop: 0 });
  },

  toggleSection(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ activeSection: this.data.activeSection === id ? '' : id });
  },

  prevQuestion() {
    let current = parseInt(this.data.activeSection);
    if (current === 1) {
      this.prevStep();
    } else {
      this.setData({ activeSection: String(current - 1) });
      wx.pageScrollTo({ duration: 300, scrollTop: 0 });
    }
  },

  nextQuestion() {
    let current = parseInt(this.data.activeSection);
    if (current === 13) {
      this.submitForm();
    } else {
      this.setData({ activeSection: String(current + 1) });
      wx.pageScrollTo({ duration: 300, scrollTop: 0 });
    }
  },

  // === Data Handling ===
  initPainData() {
    const basePainNature = [
      { id: 1, name: '胀痛', checked: false, severity: 1 },
      { id: 2, name: '窜痛', checked: false, severity: 1 },
      { id: 3, name: '固定痛', checked: false, severity: 1 },
      { id: 4, name: '刺痛', checked: false, severity: 1 },
      { id: 5, name: '闷痛', checked: false, severity: 1 },
      { id: 6, name: '灼痛', checked: false, severity: 1 },
      { id: 7, name: '隐痛', checked: false, severity: 1 },
      { id: 8, name: '空痛', checked: false, severity: 1 },
      { id: 9, name: '酸重痛', checked: false, severity: 1 },
      { id: 10, name: '冷痛', checked: false, severity: 1 },
      { id: 11, name: '阴雨天疼痛加剧', checked: false, severity: 1 },
      { id: 12, name: '排尿涩痛', checked: false, severity: 1 },
      { id: 13, name: '夜间痛甚', checked: false, severity: 1 },
      { id: 14, name: '痛拒按', checked: false, severity: 1 },
      { id: 15, name: '进食缓解', checked: false, severity: 1 },
      { id: 16, name: '进食痛甚', checked: false, severity: 1 }
    ];
    const locations = [
      { id: 1, name: '头', subOptions: ['头顶', '后脑勺', '半边头'], checked: false, selectedSub: [], severity: 1 },
      { id: 2, name: '颈部', checked: false, severity: 1 },
      { id: 3, name: '肩部', checked: false, severity: 1 },
      { id: 4, name: '面', subOptions: ['目', '腮', '鼻', '口', '舌', '耳'], checked: false, selectedSub: [], severity: 1 },
      { id: 5, name: '胸部', subOptions: ['胸骨后', '心', '乳房', '胁肋'], checked: false, selectedSub: [], severity: 1 },
      { id: 6, name: '腹部', subOptions: ['右/左', '脐周', '小腹', '全腹'], checked: false, selectedSub: [], severity: 1 },
      { id: 7, name: '背部', checked: false, severity: 1 },
      { id: 8, name: '腰部', checked: false, severity: 1 },
      { id: 9, name: '膝痛', checked: false, severity: 1 },
      { id: 10, name: '四肢', checked: false, severity: 1 },
      { id: 11, name: '足部', checked: false, severity: 1 },
    ];
    this.setData({
      painLocations: locations.map(l => ({ ...l, natures: JSON.parse(JSON.stringify(basePainNature)) }))
    });
  },

  // Generic Toggle
  toggleItem(e) {
    const { group, index } = e.currentTarget.dataset;

    // Handle nested paths (e.g. "headBodyItems.head")
    const paths = group.split('.');
    let val = this.data;
    for (let p of paths) {
      if (val) val = val[p];
    }

    if (val && val[index]) {
      this.setData({ [`${group}[${index}].checked`]: !val[index].checked });
    }
  },

  togglePainLoc(e) {
    const idx = e.currentTarget.dataset.index;
    this.setData({ [`painLocations[${idx}].checked`]: !this.data.painLocations[idx].checked });
  },

  togglePainNature(e) {
    const { locIndex, natIndex } = e.currentTarget.dataset;
    const key = `painLocations[${locIndex}].natures[${natIndex}].checked`;
    this.setData({ [key]: !this.data.painLocations[locIndex].natures[natIndex].checked });
  },

  onLifeChange(e) {
    this.setData({ 'life.selected': e.detail.value });
  },

  onGenericCheckbox(e) {
    this.setData({ [e.currentTarget.dataset.path]: e.detail.value });
  },
  onGenericRadio(e) {
    this.setData({ [e.currentTarget.dataset.path]: e.detail.value });
  },

  updateSeverity(e) {
    const { group, index } = e.currentTarget.dataset;
    this.setData({ [`${group}[${index}].severity`]: parseInt(e.detail.value) });
  },

  updatePainSeverity(e) {
    const { locIndex, natIndex } = e.currentTarget.dataset;
    this.setData({ [`painLocations[${locIndex}].natures[${natIndex}].severity`]: parseInt(e.detail.value) });
  },

  // Submit
  submitForm() {
    const patientId = wx.getStorageSync('id');
    if (!patientId) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    const payload = {
      patientId: patientId,
      life: JSON.stringify(this.data.life),
      coldHot: JSON.stringify(this.data.coldHotItems),
      sweat: JSON.stringify(this.data.sweatItems),
      hurt: JSON.stringify(this.data.painLocations),
      headBody: JSON.stringify(this.data.headBodyItems),
      sleep: JSON.stringify(this.data.sleepItems),
      breath: JSON.stringify(this.data.breath),
      food: JSON.stringify(this.data.food),
      stool: JSON.stringify(this.data.stool),
      urine: JSON.stringify(this.data.urine),
      female: JSON.stringify(this.data.female),
      bleeding: JSON.stringify(this.data.bleeding),
      voice: JSON.stringify(this.data.voiceItems),
      others: ''
    };

    wx.showLoading({ title: '提交中' });

    request('/four/add', 'POST', payload).then(res => {
      wx.hideLoading();
      wx.showToast({ title: '保存成功' });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }).catch(err => {
      wx.hideLoading();
      console.error(err);
      wx.showToast({ title: '保存失败', icon: 'none' });
    });
  }
})

