Page({
  data: {
    height: "",
    weight: "",
    bmiResult: "",
    bmiDesc: "",
    isNormal: true
  },
  onLoad: function (options) {},
  onHeightInput: function(e) {
    this.setData({ height: e.detail.value });
  },
  onWeightInput: function(e) {
    this.setData({ weight: e.detail.value });
  },
  calculateBMI: function() {
    let h = parseFloat(this.data.height) / 100;
    let w = parseFloat(this.data.weight);
    if (!h || !w) {
      wx.showToast({ title: "请输入完整信息", icon: "none" });
      return;
    }
    let bmi = (w / (h * h)).toFixed(1);
    let desc = "正常";
    if (bmi < 18.5) desc = "偏瘦";
    else if (bmi >= 24 && bmi < 28) desc = "超重";
    else if (bmi >= 28) desc = "肥胖";
    
    let isNormal = (desc === "正常");
    this.setData({ bmiResult: bmi, bmiDesc: desc, isNormal: isNormal });
  }
})