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
      { path: '/pkg_eval/pages/tcm_assessment/tcm_assessment', name: '中医状态评估', desc: '中医辨证与体质测评', icon: '/static/four_diag.svg' },
      { path: '/pkg_eval/pages/diagnose/diagnose', name: '风险预警', desc: '多维健康风险预警', icon: '/static/report.svg' },
      { path: '/pages/connect/connect', name: '名医对话', desc: 'AI辅助与专家团队', icon: '/static/doctor_contact.svg' },
      { path: '/pages/article/article', name: '中医科普', desc: '养生知识与视频', icon: '/static/article.svg' },
    ],
    currentDateStr: '',
    lunarStr: '惊蛰 - 春养肝'
  },

  onShow: function () {
    this.checkRole();
    this.getLocationAndWeather();
    this.initDate();
  },

  initDate: function () {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const monthStr = String(month).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekDay = weekDays[today.getDay()];

    const terms = [
      { m: 1, d: 5, name: '小寒' }, { m: 1, d: 20, name: '大寒' },
      { m: 2, d: 4, name: '立春' }, { m: 2, d: 19, name: '雨水' },
      { m: 3, d: 5, name: '惊蛰' }, { m: 3, d: 20, name: '春分' },
      { m: 4, d: 4, name: '清明' }, { m: 4, d: 20, name: '谷雨' },
      { m: 5, d: 5, name: '立夏' }, { m: 5, d: 21, name: '小满' },
      { m: 6, d: 5, name: '芒种' }, { m: 6, d: 21, name: '夏至' },
      { m: 7, d: 7, name: '小暑' }, { m: 7, d: 23, name: '大暑' },
      { m: 8, d: 7, name: '立秋' }, { m: 8, d: 23, name: '处暑' },
      { m: 9, d: 7, name: '白露' }, { m: 9, d: 23, name: '秋分' },
      { m: 10, d: 8, name: '寒露' }, { m: 10, d: 23, name: '霜降' },
      { m: 11, d: 7, name: '立冬' }, { m: 11, d: 22, name: '小雪' },
      { m: 12, d: 7, name: '大雪' }, { m: 12, d: 22, name: '冬至' }
    ];

    let currentTerm = terms[terms.length - 1];
    for (let i = 0; i < terms.length; i++) {
      if (month < terms[i].m || (month === terms[i].m && day < terms[i].d)) {
        currentTerm = i === 0 ? terms[terms.length - 1] : terms[i - 1];
        break;
      }
    }

    // Get true Chinese lunar calendar date safely
    let lunarDateStr = '';
    try {
      const formatted = new Intl.DateTimeFormat('zh-CN-u-ca-chinese', { dateStyle: 'full' }).format(today);
      const match = formatted.match(/年(.+?)(星期|$)/);
      if (match) lunarDateStr = match[1];
    } catch (e) { }

    const displayLunarStr = lunarDateStr ? `农历${lunarDateStr}` : currentTerm.name;

    this.setData({
      currentDateStr: `${monthStr}月${dayStr}日 周${weekDay}`,
      lunarStr: `${displayLunarStr} - ${currentTerm.name}养护季`
    });
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
        // 使用您提供的高德地图 Web服务 Key
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

              wx.setStorageSync('userLocationData', {
                province: province,
                city: city,
                district: district,
                address: geoRes.data.regeocode.formatted_address
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
    wx.navigateTo({
      url: `/pages/patient/detail?id=${id}`,
      fail: (err) => {
        console.error('Navigate to detail failed:', err);
        wx.showToast({ title: '无法跳转', icon: 'none' });
      }
    });
  },

  navigateTo: function (e) {
    const path = e.currentTarget.dataset.path;

    if (!path) {
      wx.showToast({
        title: '详细页暂未配置',
        icon: 'none'
      });
      return;
    }

    const tabPages = [
      '/pages/index/index',
      '/pages/community/community',
      '/pages/plan/plan',
      '/pages/messages/messages',
      '/pages/profile/profile'
    ];

    // Check if the target is a tab bar page
    const isTab = tabPages.some(tab => path.split('?')[0] === tab);

    if (isTab) {
      wx.switchTab({
        url: path,
        fail: (err) => {
          console.error('SwitchTab failed:', err);
        }
      });
    } else {
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
  }
})
