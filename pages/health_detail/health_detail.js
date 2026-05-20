Page({
  data: {
    currentDateStr: '',
    lunarStr: '',
    solarTermName: '',
    solarTermDesc: '',
    solarTermRec: ''
  },

  onLoad: function (options) {
    this.initDate();
  },

  initDate: function() {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const date = new Date();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const monthStr = month.toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    const dayOfWeek = days[date.getDay()];

    const terms = [
      { m: 1, d: 5, name: '小寒', desc: '起居要保暖，饮食宜温热', rec: '推荐：生姜羊肉汤' },
      { m: 1, d: 20, name: '大寒', desc: '防寒保暖，固护脾肾', rec: '推荐：红枣桂圆茶' },
      { m: 2, d: 4, name: '立春', desc: '春气始至，养肝护阳', rec: '推荐：玫瑰花茶' },
      { m: 2, d: 19, name: '雨水', desc: '春雨至，湿气重，健脾祛湿', rec: '推荐：陈皮薄荷茶' },
      { m: 3, d: 5, name: '惊蛰', desc: '春生肝；宣发肝阳', rec: '推荐：枸杞菊花茶' },
      { m: 3, d: 20, name: '春分', desc: '阴阳相半，平和心态', rec: '推荐：百合花茶' },
      { m: 4, d: 4, name: '清明', desc: '气候温暖，多做户外运动', rec: '推荐：决明子茶' },
      { m: 4, d: 20, name: '谷雨', desc: '暖湿交加，祛湿健脾', rec: '推荐：薏米红豆汤' },
      { m: 5, d: 5, name: '立夏', desc: '万物繁茂，养心安神', rec: '推荐：莲子心茶' },
      { m: 5, d: 21, name: '小满', desc: '气候炎热，防暑降温', rec: '推荐：绿豆金银花汤' },
      { m: 6, d: 5, name: '芒种', desc: '气温高，湿度大，清热健脾', rec: '推荐：酸梅汤' },
      { m: 6, d: 21, name: '夏至', desc: '炎热至极，防暑清心', rec: '推荐：乌梅汤' },
      { m: 7, d: 7, name: '小暑', desc: '天气炎热，注意防晒', rec: '推荐：苦瓜汤' },
      { m: 7, d: 23, name: '大暑', desc: '高温酷暑，清热解毒', rec: '推荐：绿豆汤' },
      { m: 8, d: 7, name: '立秋', desc: '秋气始至，养阴清热', rec: '推荐：百合莲子汤' },
      { m: 8, d: 23, name: '处暑', desc: '暑气渐退，润肺养胃', rec: '推荐：银耳雪梨汤' },
      { m: 9, d: 7, name: '白露', desc: '天气转凉，防秋燥', rec: '推荐：川贝炖雪梨' },
      { m: 9, d: 23, name: '秋分', desc: '昼夜平分，平补气血', rec: '推荐：蜂蜜柚子茶' },
      { m: 10, d: 8, name: '寒露', desc: '露水凝结，润肺防燥', rec: '推荐：玉竹炖猪肉' },
      { m: 10, d: 23, name: '霜降', desc: '天气渐冷，防寒保暖', rec: '推荐：红糖生姜水' },
      { m: 11, d: 7, name: '立冬', desc: '万物收藏，注重冬藏', rec: '推荐：当归生姜羊肉汤' },
      { m: 11, d: 22, name: '小雪', desc: '气温下降，防寒保肾', rec: '推荐：黑芝麻糊' },
      { m: 12, d: 7, name: '大雪', desc: '天气寒冷，温补肾阳', rec: '推荐：核桃红枣粥' },
      { m: 12, d: 22, name: '冬至', desc: '寒阴极，一阳生，滋补养生', rec: '推荐：阿胶炖乌鸡' }
    ];

    let currentTerm = terms[terms.length - 1]; 
    for (let i = 0; i < terms.length; i++) {
         if (month < terms[i].m || (month === terms[i].m && day < terms[i].d)) {
             currentTerm = i === 0 ? terms[terms.length - 1] : terms[i - 1];
             break;
         }
    }

    // Get true Chinese lunar calendar date safely
    let lunarDateStr = '';
    try {
      const formatted = new Intl.DateTimeFormat('zh-CN-u-ca-chinese', {dateStyle:'full'}).format(date);
      const match = formatted.match(/年(.+?)(星期|$)/);
      if (match) lunarDateStr = match[1];
    } catch(e) {}
    
    const displayLunarStr = lunarDateStr ? `农历${lunarDateStr}` : currentTerm.name;

    this.setData({
      currentDateStr: `${monthStr}月${dayStr}日 ${dayOfWeek}`,
      lunarDateStr: lunarDateStr,     
      lunarStr: `${displayLunarStr} - ${currentTerm.name}养生卡`,
      solarTermName: currentTerm.name,
      solarTermDesc: currentTerm.desc,
      solarTermRec: currentTerm.rec
    });
  }
});