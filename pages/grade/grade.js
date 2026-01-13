// pages/grade/grade.js
Page({
  data: {

  },

  goTest(e) {
    const type = e.currentTarget.dataset.type;
    // Map type 1 -> sas, 2 -> sds
    const typeStr = type == 1 ? 'sas' : 'sds';
    wx.navigateTo({
      url: `/pages/grade/questionnaire/questionnaire?type=${typeStr}`,
    });
  }
})