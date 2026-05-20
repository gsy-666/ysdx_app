const SOLAR_TERMS_2026 = {
  '1-5': { name: '小寒', info: '注意防寒保暖，尤其是头部和脚部；饮食宜温补，多吃羊肉、鸡肉等。' },
  '1-20': { name: '大寒', info: '冬去春来，注意关节保暖；睡前泡脚，促进血液循环。' },
  '2-3': { name: '立春', info: '春季开始，应养护阳气；多吃韭菜、香菜等辛温食物，少吃酸。' },
  '2-18': { name: '雨水', info: '降水增多，湿气重；饮食宜健脾利湿，多吃山药、薏米。' },
  '3-5': { name: '惊蛰', info: '万物复苏，预防感冒；饮食清淡，多吃梨子润肺。' },
  '3-20': { name: '春分', info: '昼夜平分，注意情绪调节；保持心情舒畅，防止肝火上炎。' },
  '4-4': { name: '清明', info: '气温转暖，注意花粉过敏；踏青出游，放松身心。' },
  '4-20': { name: '谷雨', info: '春夏交替，湿气加重；注意祛湿，多吃红豆、冬瓜。' },
  '5-5': { name: '立夏', info: '夏季开始，养心为主；饮食宜清淡，多吃苦瓜、莲子。' },
  '5-21': { name: '小满', info: '气温升高，注意防晒；多喝水，防止皮肤病。' },
  '6-5': { name: '芒种', info: '梅雨季节，注意防霉防湿；饮食宜清补，多吃鸭肉。' },
  '6-21': { name: '夏至', info: '阳气最盛，注意防暑降温；午睡片刻，养阴护阳。' },
  '7-6': { name: '小暑', info: '天气炎热，不仅要防暑，还要防湿；多吃绿豆汤。' },
  '7-23': { name: '大暑', info: '全年最热，注意中暑；避免烈日暴晒，多吃瓜果。' },
  '8-7': { name: '立秋', info: '秋季开始，养肺为主；少吃辛辣，多吃酸味食物收敛肺气。' },
  '8-23': { name: '处暑', info: '秋燥初起，注意滋阴润肺；多吃百合、银耳。' },
  '9-7': { name: '白露', info: '昼夜温差大，防止受凉；注意保暖，多吃温润食物。' },
  '9-23': { name: '秋分', info: '阴阳平衡，注意防燥；多喝水，多吃芝麻、核桃。' },
  '10-8': { name: '寒露', info: '露气寒冷，注意脚部保暖；多吃山药、红枣。' },
  '10-23': { name: '霜降', info: '深秋时节，进补好时机；多吃柿子、板栗。' },
  '11-7': { name: '立冬', info: '冬季开始，养藏为主；早睡晚起，多吃温补食物。' },
  '11-22': { name: '小雪', info: '天气转冷，注意防寒；多吃黑米、黑豆等黑色食物。' },
  '12-7': { name: '大雪', info: '各种进补好时节；多吃羊肉、萝卜，增强免疫力。' },
  '12-21': { name: '冬至', info: '阴极阳生，注意此时最为寒冷；吃饺子、汤圆。' }
};

Page({
  data: {
    aiUnread: 0,
    lastAiTime: '刚刚',

    // Calendar Data
    currentYear: 2026,
    currentMonth: 1, // 1-12
    calendarDays: [],
    todayDate: '', // Format: YYYY-M-D
    selectedDate: '', // Format: YYYY-M-D
    selectedTerm: null,
    weeks: ['日', '一', '二', '三', '四', '五', '六']
  },

  onLoad: function () {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    this.setData({
      currentYear: year,
      currentMonth: month,
      todayDate: `${year}-${month}-${day}`,
      selectedDate: `${year}-${month}-${day}`
    });

    this.generateCalendar(year, month);
    this.checkSelectedTerm(`${year}-${month}-${day}`);
  },

  onShow: function () {
    // Check local storage or API for unread count
  },

  // Calendar Logic
  generateCalendar: function (year, month) {
    const days = [];

    // First day of the month
    const firstDay = new Date(year, month - 1, 1);
    const startingDay = firstDay.getDay(); // 0-6

    // Days in this month
    const daysInMonth = new Date(year, month, 0).getDate();

    // Previous month filler
    const prevMonthDays = new Date(year, month - 1, 0).getDate();
    for (let i = 0; i < startingDay; i++) {
      days.push({
        day: prevMonthDays - startingDay + 1 + i,
        isCurrentMonth: false,
        dateStr: '' // We ignore selection for prev month in this simple version
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateKey = `${month}-${i}`;
      const dateStr = `${year}-${month}-${i}`;
      const term = SOLAR_TERMS_2026[dateKey];

      days.push({
        day: i,
        isCurrentMonth: true,
        dateStr: dateStr,
        isToday: dateStr === this.data.todayDate,
        termName: term ? term.name : ''
      });
    }

    this.setData({ calendarDays: days });
  },

  changeMonth: function (e) {
    const type = e.currentTarget.dataset.type;
    let { currentYear, currentMonth } = this.data;

    if (type === 'prev') {
      currentMonth--;
      if (currentMonth < 1) {
        currentMonth = 12;
        currentYear--;
      }
    } else {
      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }

    this.setData({ currentYear, currentMonth });
    this.generateCalendar(currentYear, currentMonth);
  },

  selectDate: function (e) {
    const dateStr = e.currentTarget.dataset.date;
    if (!dateStr) return; // for padding days

    this.setData({ selectedDate: dateStr });
    this.checkSelectedTerm(dateStr);
  },

  checkSelectedTerm: function (dateStr) {
    // dateStr: YYYY-M-D
    if (!dateStr) {
      this.setData({ selectedTerm: null });
      return;
    }
    const parts = dateStr.split('-');
    const key = `${parts[1]}-${parts[2]}`; // M-D

    const term = SOLAR_TERMS_2026[key];
    if (term) {
      this.setData({
        selectedTerm: {
          ...term,
          dateStr: dateStr
        }
      });
    } else {
      this.setData({ selectedTerm: null });
    }
  },

  goToChat: function () {
    // Navigate to Chat page
    wx.navigateTo({
      url: '/pages/connect/chat/chat?type=ai&doctorId=1&doctorName=AI 健康助手'
    })
  },
  goToSystem: function () {
    wx.showToast({ title: '暂无新通知', icon: 'none' })
  }
})
