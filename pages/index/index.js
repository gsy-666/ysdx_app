// pages/index/index.js
const request = require('../../utils/request.js').request;

Page({
  data: {
    weatherData: {
      city: '定位中...',
      temperature: '',
      weather: ''
    },
    isDoctor: false,
    doctorStats: {
      patientCount: 0,
      todayVisits: 0
    },
    patientList: [],
    menuItems: [
      { path: '/pages/four/four', name: '中医状态评估', desc: '中医辨证与体质测评', icon: '/static/four_diag.svg' },
      { path: '/pages/diagnose/diagnose', name: '风险预警', desc: '多维健康风险预警', icon: '/static/report.svg' },
      { path: '/pages/connect/connect', name: '名医对话', desc: 'AI辅助与专家团队', icon: '/static/doctor_contact.svg' },
      { path: '/pages/article/article', name: '中医科普', desc: '养生知识与视频', icon: '/static/article.svg' },
    ]
  },

  onShow: function () {
    this.checkRole();
    this.getLocationAndWeather();
  },

  refreshWeather: function () {
    this.getLocationAndWeather();
  },

  getLocationAndWeather: function () {
    const that = this;
    wx.getLocation({
      type: 'gcj02', // 高德地图使用 GCJ02 坐标系
      success(res) {
        const latitude = res.latitude
        const longitude = res.longitude
        // 使用您提供的 高德地图 Web服务 Key
        const key = '849c6c557123db917b6d95b4cf2a7921';

        // 1. 逆地理编码 (获取 adcode 和 城市名)
        wx.request({
          url: `https://restapi.amap.com/v3/geocode/regeo?location=${longitude},${latitude}&key=${key}&extensions=base`,
          success(geoRes) {
            if (geoRes.data.status === '1') {
              const addressComponent = geoRes.data.regeocode.addressComponent;
              // 某些直辖市 city 是空的 ([], string)，此时取 province
              let city = addressComponent.city;
              if (Array.isArray(city)) city = '';
              
              let province = addressComponent.province;
              if (Array.isArray(province)) province = '';

              let district = addressComponent.district;
              if (Array.isArray(district)) district = '';

              // 优先显示 区 > 市 > 省
              let displayCity = district || city || province || '未知城市';
              
              let targetAdcode = addressComponent.adcode;
              
              // 如果获取不到有效的adcode（例如在模拟器默认位置），降级处理
              if (!targetAdcode || typeof targetAdcode !== 'string' || targetAdcode.length === 0) {
                 console.warn("地理位置获取不完整，自动切换至默认城市（北京）演示");
                 targetAdcode = '110000'; // 北京
                 if (displayCity === '未知城市') {
                   displayCity = '北京市';
                 }
              }

              that.setData({
                'weatherData.city': displayCity
              });

              // 2. 获取实时天气
              wx.request({
                url: `https://restapi.amap.com/v3/weather/weatherInfo?city=${targetAdcode}&key=${key}&extensions=base`,
                success(weatherRes) {
                  if (weatherRes.data.status === '1' && weatherRes.data.lives && weatherRes.data.lives.length > 0) {
                    const live = weatherRes.data.lives[0];
                    that.setData({
                      'weatherData.temperature': live.temperature,
                      'weatherData.weather': live.weather
                    });
                  } else {
                    console.error("Gaode Weather API Error:", weatherRes.data);
                  }
                },
                fail(err) {
                  console.error("Weather request failed", err);
                }
              });
            } else {
              console.error("Gaode Regeo API Error:", geoRes.data);
              that.setData({ 'weatherData.city': '定位未知' });
            }
          },
          fail(err) {
            console.error("GeoAPI failed", err);
            that.setData({ 'weatherData.city': '定位失败' });
          }
        });
      },
      fail(err) {
        console.log('Access location failed', err);
        that.setData({
          'weatherData.city': '未定位置'
        });
        // 提示用户开启权限
        wx.getSetting({
          success(res) {
            if (!res.authSetting['scope.userLocation']) {
              // 可以在这里引导用户打开设置
            }
          }
        })
      }
    })
  },

  checkRole: function () {
    const role = wx.getStorageSync('role');
    const isDoctor = (role === 0 || role === 1);
    this.setData({ isDoctor });

    if (isDoctor) {
      this.fetchDoctorData();
    }
  },

  fetchDoctorData: function () {
    request('/sysAdmin/getPatientCount', 'GET').then(res => {
      this.setData({ 'doctorStats.patientCount': res });
    });

    request('/sysAdmin/listPatients', 'GET', { pageNo: 1, pageSize: 5 }).then(res => {
      const list = res.records || res;
      this.setData({ patientList: list });
    });
  },

  viewPatientDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({ title: '查看患者 ' + id, icon: 'none' });
  },

  navigateTo: function (e) {
    const path = e.currentTarget.dataset.path;
    wx.navigateTo({
      url: path,
      fail: (err) => {
        console.error('Navigation failed:', err);
        wx.showToast({
          title: '跳转失败',
          icon: 'none'
        });
      }
    });
  }
})
