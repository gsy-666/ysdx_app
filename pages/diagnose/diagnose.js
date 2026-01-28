// pages/diagnose/diagnose.js
import * as echarts from '../../components/ec-canvas/echarts';

function initChart(canvas, width, height, dpr) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr
  });
  canvas.setChart(chart);

  const option = {
    backgroundColor: 'transparent',
    radar: {
      center: ['50%', '50%'],
      radius: '65%',
      indicator: [
        { name: '心系', max: 100 },
        { name: '肝系', max: 100 },
        { name: '脾系', max: 100 },
        { name: '肺系', max: 100 },
        { name: '肾系', max: 100 }
      ],
      shape: 'circle',
      splitNumber: 4,
      name: {
        textStyle: {
          color: '#00FFCC',
          fontSize: 12
        }
      },
      splitLine: {
        lineStyle: {
          color: [
            'rgba(0, 255, 204, 0.1)', 
            'rgba(0, 255, 204, 0.2)',
            'rgba(0, 255, 204, 0.4)',
            'rgba(0, 255, 204, 0.6)'
          ].reverse(),
          width: 1
        }
      },
      splitArea: {
        show: false
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 255, 204, 0.3)'
        }
      }
    },
    series: [{
      name: '健康态势',
      type: 'radar',
      data: [{
        value: [80, 50, 60, 70, 40],
        name: '评估值'
      }],
      symbol: 'circle',
      symbolSize: 6,
      itemStyle: {
        color: '#D4A024',
        borderColor: '#fff',
        borderWidth: 1
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
          offset: 0,
          color: 'rgba(0, 255, 204, 0.6)'
        }, {
          offset: 1,
          color: 'rgba(0, 102, 255, 0.2)'
        }])
      },
      lineStyle: {
        color: '#00FFCC',
        width: 2,
        shadowColor: 'rgba(0, 255, 204, 0.5)',
        shadowBlur: 10
      }
    }]
  };

  chart.setOption(option);
  return chart;
}

Page({
  data: {
    ec: {
      onInit: initChart
    },
    showRadar: false,
    // 尝试使用相对路径以避免根目录解析问题
    bodyImage: '../../static/body_structure.jpg', 
    currentScale: 1.0,
    // 根据UI图icon位置调整热点坐标 (x, y 为百分比)
    // 调整策略：第二行下移12%，第三行下移17%
    organNodes: [
      { key: 'emotion', title: '情绪障碍', riskItems: ['焦虑', '抑郁'], riskLevel: 'low', position: { x: 8, y: 12 }, route: '/pages/diagnose/detail/detail?type=emotion' },
      { key: 'retina', title: '视网膜病变', riskItems: ['视力下降', '飞蚊症'], riskLevel: 'high', position: { x: 80, y: 12 }, route: '/pages/diagnose/detail/detail?type=retina' },
      { key: 'cardio_cerebro', title: '心脑血管疾病', riskItems: ['头晕', '心悸'], riskLevel: 'high', position: { x: 8, y: 42 }, route: '/pages/diagnose/detail/detail?type=cardio' },
      { key: 'liver', title: '代谢脂肪肝', riskItems: ['肝硬化'], riskLevel: 'medium', position: { x: 80, y: 42 }, route: '/pages/diagnose/detail/detail?type=liver' },
      { key: 'kidney', title: '慢性肾病', riskItems: ['蛋白尿', '水肿'], riskLevel: 'low', position: { x: 8, y: 72 }, route: '/pages/diagnose/detail/detail?type=kidney' },
      { key: 'diabetes', title: '糖尿病并发症', riskItems: ['足部溃疡', '感染'], riskLevel: 'low', position: { x: 80, y: 72 }, route: '/pages/diagnose/detail/detail?type=diabetes' }
    ]
  },

  showRadar() {
    this.setData({ showRadar: true });
  },

  hideRadar() {
    this.setData({ showRadar: false });
  },

  preventTouchMove() {
    // 阻止底层页面滚动
    return;
  },

  onLoad(options) { },

  onReady() { },

  onImageError(e) {
    console.error('图片加载失败：', e);
  },

  onImageLoad(e) {
    console.log('图片加载成功');
  },

  handleNodeClick(e) {
    const { route } = e.currentTarget.dataset;
    if (!route) return;
    wx.navigateTo({
      url: route,
      fail: (err) => {
        console.warn('跳转失败：', err);
        wx.showToast({ title: '页面跳转失败', icon: 'none' });
      }
    });
  },

  onScale(e) {
    this.setData({ currentScale: e.detail.scale });
  },

  onMovableChange(e) { }
});
