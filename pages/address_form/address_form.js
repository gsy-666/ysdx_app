Page({
  data: {
    name: '',
    phone: '',
    region: [],
    detail: ''
  },
  onLoad(options) {
    if (options.edit === '1') {
      wx.setNavigationBarTitle({ title: '编辑地址' });
      const name = wx.getStorageSync('name');
      const phone = wx.getStorageSync('phone');
      const loc = wx.getStorageSync('userLocationData') || {};
      
      this.setData({
        name: name || '',
        phone: phone || '',
        region: loc.province ? [loc.province, loc.city, loc.district] : [],
        detail: loc.address ? loc.address.replace(loc.province||'', '').replace(loc.city||'', '').replace(loc.district||'', '').trim() : ''
      });
    } else {
      wx.setNavigationBarTitle({ title: '添加新地址' });
    }
  },
  onNameInput(e) { this.setData({ name: e.detail.value }) },
  onPhoneInput(e) { this.setData({ phone: e.detail.value }) },
  onRegionChange(e) { this.setData({ region: e.detail.value }) },
  onDetailInput(e) { this.setData({ detail: e.detail.value }) },
  saveAddress() {
    const { name, phone, region, detail } = this.data;
    if (!name || !phone || region.length === 0 || !detail) {
      return wx.showToast({ title: '请填写完整', icon: 'none' });
    }
    
    // 更新缓存
    wx.setStorageSync('name', name);
    wx.setStorageSync('phone', phone);
    
    let loc = wx.getStorageSync('userLocationData') || {};
    loc.province = region[0];
    loc.city = region[1];
    loc.district = region[2];
    loc.address = region.join('') + detail;
    wx.setStorageSync('userLocationData', loc);

    wx.showToast({
      title: '保存成功',
      icon: 'success',
      success: () => {
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    });
  }
});