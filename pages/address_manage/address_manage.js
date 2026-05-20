Page({
  data: {
    addresses: []
  },
  onLoad: function (options) {},
  onShow: function() {
    this.loadAddress();
  },
  loadAddress: function() {
    const name = wx.getStorageSync('name');
    const phone = wx.getStorageSync('phone');
    const location = wx.getStorageSync('userLocationData');
    
    let displayPhone = phone || "未绑定手机号";
    
    let province = "北京市";
    let city = "北京市";
    let district = "朝阳区";
    let detail = "某某街道某某小区1号楼";
    
    if (location) {
      if (location.province) province = location.province;
      if (location.city) city = location.city;
      if (location.district) district = location.district;
      if (location.address) {
        detail = location.address;
        if (province && detail.startsWith(province)) detail = detail.replace(province, '');
        if (city && detail.startsWith(city)) detail = detail.replace(city, '');
        if (district && detail.startsWith(district)) detail = detail.replace(district, '');
        
        detail = detail.trim();
        if (!detail) detail = "暂无详细街道信息";
      }
    }

    if (name || phone) {
      this.setData({
        addresses: [
          { 
            name: name || "获取中...", 
            phone: displayPhone, 
            province: province, 
            city: city, 
            district: district, 
            detail: detail, 
            isDefault: true 
          }
        ]
      });
    } else {
      this.setData({ addresses: [] });
    }
  },
  addAddress: function() {
    wx.navigateTo({ url: '/pages/address_form/address_form' });
  },
  editAddress: function() {
    wx.navigateTo({ url: '/pages/address_form/address_form?edit=1' });
  }
});