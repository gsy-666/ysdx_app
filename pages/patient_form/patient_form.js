Page({
  data: {
    relations: ['本人', '父母', '子女', '配偶', '其他'],
    relationIndex: 0,
    formData: {
      name: '',
      relation: '',
      gender: '',
      age: '',
      idCard: '',
      phone: ''
    }
  },

  onLoad: function (options) {
    if (options.action === 'edit') {
      wx.setNavigationBarTitle({ title: '编辑就诊人' });
      // If editing "本人", we can auto-fill. For now, simulate edit:
      const name = wx.getStorageSync('name') || '';
      const phone = wx.getStorageSync('phone') || '';
      this.setData({
        formData: {
          name: name,
          relation: '本人',
          gender: '男',
          age: '28',
          idCard: '',
          phone: phone
        }
      });
    } else {
      wx.setNavigationBarTitle({ title: '添加就诊人' });
    }
  },

  onInput: function (e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`formData.${field}`]: e.detail.value
    });
  },

  onRelationChange: function (e) {
    const index = e.detail.value;
    this.setData({
      relationIndex: index,
      'formData.relation': this.data.relations[index]
    });
  },

  onGenderChange: function (e) {
    this.setData({
      'formData.gender': e.detail.value
    });
  },

  submitForm: function () {
    const { name, relation, gender, age, idCard, phone } = this.data.formData;
    
    if (!name) return wx.showToast({ title: '请输入姓名', icon: 'none' });
    if (!relation) return wx.showToast({ title: '请选择关系', icon: 'none' });
    if (!gender) return wx.showToast({ title: '请选择性别', icon: 'none' });
    if (!phone || phone.length !== 11) return wx.showToast({ title: '请输入正确的手机号', icon: 'none' });

    wx.showLoading({ title: '保存中...' });
    
    // Simulate API request
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ title: '保存成功', icon: 'success' });
      
      // Update local storage (just for demo purposes in this project)
      if (relation === '本人') {
        if (name) wx.setStorageSync('name', name);
        if (phone) wx.setStorageSync('phone', phone);
      }

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }, 800);
  }
})