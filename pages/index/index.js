// pages/index/index.js
const request = require('../../utils/request.js').request;

Page({
  data: {
    isDoctor: false,
    doctorStats: {
      patientCount: 0,
      todayVisits: 0
    },
    patientList: [],
    menuItems: [
      { path: '/pages/four/four', name: '四诊分析', desc: '全面中医体质辨识', icon: '/static/four_diag.svg' },
      { path: '/pages/diagnose/diagnose', name: '病情诊断', desc: '专业病情分析报告', icon: '/static/report.svg' },
      { path: '/pages/grade/grade', name: '测评表', desc: '健康状况自我评估', icon: '/static/assessment.svg' },
      { path: '/pages/screen/screen', name: '入组筛选表', desc: '参与研究筛选', icon: '/static/filter.svg' },
      { path: '/pages/connect/connect', name: '联系医生', desc: '在线咨询专家', icon: '/static/doctor_contact.svg' },
      { path: '/pages/article/article', name: '每日文章', desc: '精选健康资讯', icon: '/static/article.svg' },
    ]
  },

  onShow: function () {
    this.checkRole();
  },

  checkRole: function() {
    const role = wx.getStorageSync('role');
    const isDoctor = (role === 0 || role === 1);
    this.setData({ isDoctor });
    
    if (isDoctor) {
      this.fetchDoctorData();
    }
  },

  fetchDoctorData: function() {
    request('/sysAdmin/getPatientCount', 'GET').then(res => {
      this.setData({ 'doctorStats.patientCount': res });
    });
    
    request('/sysAdmin/listPatients', 'GET', { pageNo: 1, pageSize: 5 }).then(res => {
       const list = res.records || res;
       this.setData({ patientList: list });
    });
  },
  
  viewPatientDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({ title: '查看患者 ' + id, icon: 'none' });
  },

  navigateTo: function (e) {
    const path = e.currentTarget.dataset.path;
    wx.navigateTo({
      url: path,
    });
  }
})
