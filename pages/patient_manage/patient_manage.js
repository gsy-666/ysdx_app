Page({
  data: {
    patients: []
  },
  onLoad: function (options) {
    this.loadPatientInfo();
  },
  onShow: function() {
    this.loadPatientInfo();
  },
  loadPatientInfo: function() {
    const name = wx.getStorageSync("name");
    const phone = wx.getStorageSync("phone");
    
    if (!name && !phone) {
      this.setData({ patients: [] });
      return;
    }

    let displayPhone = phone || "未绑定手机号";
    if (/^1[3-9]\d{9}$/.test(displayPhone)) {
      displayPhone = displayPhone.replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2");
    }

    this.setData({
      patients: [
        { 
          name: name || "获取中...", 
          relation: "本人", 
          gender: "男", 
          age: "28",       
          idCard: "未绑定身份证", 
          phone: displayPhone 
        }
      ]
    });
  },
  addPatient: function() {
    wx.navigateTo({
      url: "/pages/patient_form/patient_form?action=add"
    });
  },
  editPatient: function() {
    wx.navigateTo({
      url: "/pages/patient_form/patient_form?action=edit"
    });
  }
})
