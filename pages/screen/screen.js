// pages/screen/screen.js
Page({
  data: {
    // Basic fields
    abdominalObesity: null, // true/false
    highBloodSugar: null,
    diabetesType: [],

    hypertension: null,
    hypertensionType: [],

    highTriglycerides: 0,
    lowhdl: 0,

    // Exclusion
    exclusion1: null,
    exclusion2: null,
    exclusion3: null
  },

  // Event Handlers for Radio Groups
  onRadioChange(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [field]: e.detail.value === 'true'
    });
  },

  // Event Handlers for Checkbox/Picker Groups (Simulating Select Multiple)
  // Simplified for Mini Program: use checkbox-group for multiselect
  onTypeChange(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [field]: e.detail.value
    });
  },

  onInputChange(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [field]: e.detail.value
    });
  },

  submitForm() {
    const d = this.data;

    // 1. Check Exclusion
    if (d.exclusion1 || d.exclusion2 || d.exclusion3) {
      wx.showModal({ title: '提示', content: '存在排除标准项，不符合入组要求。', showCancel: false });
      return;
    }

    // 2. Check Inclusion (>3 items)
    let count = 0;
    if (d.abdominalObesity) count++;
    if (d.highBloodSugar) count++; // Ideally check types too
    if (d.hypertension) count++;   // Ideally check types too
    if (Number(d.highTriglycerides) > 0) count++; // Simplified check logic from name
    if (Number(d.lowhdl) > 0) count++;

    // Note: Real logic might be stricter (specific thresholds), here mimicking user's input reliance
    if (count >= 3) {
      wx.showToast({ title: '符合入组要求', icon: 'success' });
    } else {
      wx.showModal({ title: '提示', content: '未满足3项及以上诊断标准。', showCancel: false });
    }
  }
})