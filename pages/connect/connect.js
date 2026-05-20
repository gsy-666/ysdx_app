// pages/connect/connect.js
const doctors = require('../../data/doctors');

function normalizeKey(s) {
  return String(s || '').trim() || '未填写';
}

function buildGroups(list) {
  const provinces = new Map();

  for (const d of list) {
    const province = normalizeKey(d.province);
    const hospital = normalizeKey(d.hospital);
    const department = normalizeKey(d.department);

    if (!provinces.has(province)) provinces.set(province, new Map());
    const hospitals = provinces.get(province);

    if (!hospitals.has(hospital)) hospitals.set(hospital, new Map());
    const departments = hospitals.get(hospital);

    if (!departments.has(department)) departments.set(department, []);
    departments.get(department).push(d);
  }

  return Array.from(provinces.entries())
    .sort((a, b) => a[0].localeCompare(b[0], 'zh-Hans-CN'))
    .map(([province, hospitals]) => {
      const hospitalList = Array.from(hospitals.entries())
        .sort((a, b) => a[0].localeCompare(b[0], 'zh-Hans-CN'))
        .map(([hospital, departments]) => {
          const departmentList = Array.from(departments.entries())
            .sort((a, b) => a[0].localeCompare(b[0], 'zh-Hans-CN'))
            .map(([department, doctors]) => ({
              department,
              doctors: doctors
                .slice()
                .sort((x, y) => (x.name || '').localeCompare(y.name || '', 'zh-Hans-CN'))
            }));

          return { hospital, departments: departmentList };
        });

      return { province, hospitals: hospitalList };
    });
}

Page({
  data: {
    groups: buildGroups(doctors),
    openProvince: null,
    openHospital: null,
    openDepartment: null
  },

  goAIChat() {
    wx.navigateTo({
      url: '/pages/connect/chat/chat?type=ai'
    });
  },

  toggleProvince(e) {
    const { province } = e.currentTarget.dataset;
    this.setData({
      openProvince: this.data.openProvince === province ? null : province,
      openHospital: null,
      openDepartment: null
    });
  },

  toggleHospital(e) {
    const { hospital } = e.currentTarget.dataset;
    this.setData({
      openHospital: this.data.openHospital === hospital ? null : hospital,
      openDepartment: null
    });
  },

  toggleDepartment(e) {
    const { department } = e.currentTarget.dataset;
    this.setData({
      openDepartment: this.data.openDepartment === department ? null : department
    });
  },

  goChat(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/connect/chat/chat?type=doctor&doctorId=${encodeURIComponent(id)}`
    });
  },

  goDoctorDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/doctor/detail/detail?doctorId=${encodeURIComponent(id)}`
    });
  }
});
