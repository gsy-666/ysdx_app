// pages/grade/questionnaire/questionnaire.js
const request = require('../../../utils/request.js').request;

// SAS Questions
const sasQuestions = [
  { text: '我觉得比平时容易紧张或着急' },
  { text: '我无缘无故在感到害怕' },
  { text: '我容易心里烦乱或感到惊恐' },
  { text: '我觉得我可能将要发疯' },
  { text: '我觉得一切都很好' }, // Reverse
  { text: '我手脚发抖打颤' },
  { text: '我因为头疼、颈痛和背痛而苦恼' },
  { text: '我觉得容易衰弱和疲乏' },
  { text: '我觉得心平气和，并且容易安静坐着' }, // Reverse
  { text: '我觉得心跳得很快' },
  { text: '我因为一阵阵头晕而苦恼' },
  { text: '我有晕倒发作，或觉得要晕倒似的' },
  { text: '我吸气呼气都感到很容易' }, // Reverse
  { text: '我的手脚麻木和刺痛' },
  { text: '我因为胃痛和消化不良而苦恼' },
  { text: '我常常要小便' },
  { text: '我的手脚常常是干燥温暖的' }, // Reverse
  { text: '我脸红发热' },
  { text: '我容易入睡并且一夜睡得很好' }, // Reverse
  { text: '我作恶梦' }
];

// SDS Questions
const sdsQuestions = [
  { text: '我感到情绪沮丧、郁闷。' },
  { text: '我感到早晨心情最好。' }, // Reverse
  { text: '我要哭或想哭。' },
  { text: '我夜间睡眠不好。' },
  { text: '我吃饭象平时一样多。' }, // Reverse
  { text: '我的性功能正常。' }, // Reverse
  { text: '我感到体重减轻。' },
  { text: '我为便秘烦恼。' },
  { text: '我的心跳比平时快。' },
  { text: '我无故感到疲劳。' },
  { text: '我的头脑象往常一样清楚。' }, // Reverse
  { text: '我做事象平时一样不感到困难。' }, // Reverse
  { text: '我坐卧不安，难以保持平静。' },
  { text: '我对未来感到有希望。' }, // Reverse
  { text: '我比平时更容易激怒。' },
  { text: '我觉得决定什么事很容易。' }, // Reverse
  { text: '我感到自己是有用的和不可缺少的人。' }, // Reverse
  { text: '我的生活很有意义。' }, // Reverse
  { text: '假若我死了别人会过得更好。' },
  { text: '我仍旧喜爱自己平时喜爱的东西。' } // Reverse
];

Page({
  data: {
    type: '', // 'sas' or 'sds'
    title: '',
    questions: [],
    options: [],
    // Results
    showResult: false,
    totalScore: 0,
    completionRate: 0,
    evaluation: ''
  },

  onLoad(options) {
    const type = options.type;
    this.setData({ type });
    this.initForm(type);
  },

  initForm(type) {
    if (type === 'sas') {
      this.setData({
        title: '生活状态测评表（一）- 焦虑倾向测评',
        questions: sasQuestions.map(q => ({ text: q.text, answer: null })),
        options: [
          { label: 'A 没有或很少时间', value: 'A' },
          { label: 'B 小部分时间', value: 'B' },
          { label: 'C 相当多时间', value: 'C' },
          { label: 'D 绝大部分或全部时间', value: 'D' }
        ]
      });
    } else {
      this.setData({
        title: '生活状态测评表（二）- 抑郁倾向测评',
        questions: sdsQuestions.map(q => ({ text: q.text, answer: null })),
        options: [
          { label: '从无或偶尔有', value: 'A' },
          { label: '很少有', value: 'B' },
          { label: '经常有', value: 'C' },
          { label: '总是如此', value: 'D' }
        ]
      });
    }
  },

  handleOptionChange(e) {
    const idx = e.currentTarget.dataset.idx;
    const val = e.detail.value;
    const key = `questions[${idx}].answer`;
    this.setData({ [key]: val });
  },

  resetAnswers() {
    wx.showModal({
      title: '提示',
      content: '确定要重置所有答案吗？',
      success: (res) => {
        if (res.confirm) {
          const resetQ = this.data.questions.map(q => ({ ...q, answer: null }));
          this.setData({ questions: resetQ });
        }
      }
    });
  },

  submit() {
    const questions = this.data.questions;
    const answeredCount = questions.filter(q => q.answer).length;
    const rate = Math.round((answeredCount / questions.length) * 100);

    if (rate < 100) {
      wx.showModal({ title: '提示', content: '当前项目尚未完成，不可进行提交', showCancel: false });
      // Although blocked, we update rate for display if we had a progress bar
      return;
    }

    this.calculateScore(questions);
  },

  calculateScore(questions) {
    let rawScore = 0;
    // Indices (0-based) for Reverse Scoring
    let reverseIndices = [];

    if (this.data.type === 'sas') {
      // SAS: 5, 9, 13, 17, 19 text indices -> 4, 8, 12, 16, 18
      reverseIndices = [4, 8, 12, 16, 18];
    } else {
      // SDS: 2, 5, 6, 11, 12, 14, 16, 17, 18, 20 text indices -> 1, 4, 5, 10, 11, 13, 15, 16, 17, 19
      reverseIndices = [1, 4, 5, 10, 11, 13, 15, 16, 17, 19];
    }

    questions.forEach((q, idx) => {
      // A=1, B=2, C=3, D=4
      const valMap = { 'A': 1, 'B': 2, 'C': 3, 'D': 4 };
      let score = valMap[q.answer];

      if (reverseIndices.includes(idx)) {
        score = 5 - score;
      }
      rawScore += score;
    });

    const standardScore = Math.floor(rawScore * 1.25);
    let evaluation = '';

    if (this.data.type === 'sas') {
      if (standardScore < 50) evaluation = '无明显焦虑倾向';
      else if (standardScore < 60) evaluation = '轻度焦虑倾向';
      else if (standardScore < 70) evaluation = '中度焦虑倾向';
      else evaluation = '重度焦虑倾向';
    } else {
      if (standardScore < 53) evaluation = '无明显抑郁倾向';
      else if (standardScore < 63) evaluation = '轻度抑郁倾向';
      else if (standardScore < 73) evaluation = '中度抑郁倾向';
      else evaluation = '重度抑郁倾向';
    }

    this.setData({
      totalScore: standardScore,
      completionRate: 100,
      evaluation: evaluation,
      showResult: true
    });

    // Mock Submit to backend
    // request('/grade/update', 'POST', { ...Data... })
  },

  closeResult() {
    this.setData({ showResult: false });
    wx.navigateBack();
  }
})
