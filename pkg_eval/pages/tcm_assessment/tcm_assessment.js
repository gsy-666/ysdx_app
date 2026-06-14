import * as echarts from '../../components/ec-canvas/echarts';

let leftChartInstance = null;
let rightChartInstance = null;
let ecLeftComponent = null;
let ecRightComponent = null;

function initChartLeft(canvas, width, height, dpr) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr,
    renderer: 'canvas'
  });
  canvas.setChart(chart);
  leftChartInstance = chart;

  chart.setOption({
    backgroundColor: 'transparent',
    color: ['#FF9F7F', '#FFDB5C', '#37A2DA'],
    series: [{
      type: 'gauge',
      center: ['50%', '60%'],
      radius: '100%',
      startAngle: 180,
      endAngle: 0,
      min: 0,
      max: 100,
      splitNumber: 5,
      axisLine: {
        lineStyle: {
          width: 6,
          color: [
            [0.3, '#67e0e3'],
            [0.7, '#37a2da'],
            [1, '#fd666d']
          ]
        }
      },
      pointer: { itemStyle: { color: 'auto' }, width: 3, length: '60%' },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      detail: {
        valueAnimation: true,
        formatter: '{value}',
        color: 'auto',
        fontSize: 20
      },
      data: [{ value: 85 }]
    }]
  });
  return chart;
}

function initChartRight(canvas, width, height, dpr) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr,
    renderer: 'canvas'
  });
  canvas.setChart(chart);
  rightChartInstance = chart;

  chart.setOption({
    backgroundColor: 'transparent',
    color: ['#32C5E9'],
    sidebar: { show: false },
    xAxis: { show: false, data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    yAxis: { show: false },
    series: [{
      type: 'bar',
      data: [10, 52, 200, 334, 390, 330, 220],
      itemStyle: { borderRadius: 5 }
    }]
  });
  return chart;
}

Page({
  data: {
    ecLeft: { onInit: initChartLeft, lazyLoad: false, disableTouch: true },
    ecRight: { onInit: initChartRight, lazyLoad: false, disableTouch: true },
    features: [
      { id: 1, title: '望诊', sub: '面色 / 面部特征', icon: '👁️', bgClass: 'bg-1' },
      { id: 2, title: '闻诊', sub: '听声 / 嗅气', icon: '👂', bgClass: 'bg-2' },
      { id: 3, title: '问诊', sub: '体质问卷', icon: '📝', bgClass: 'bg-3' },
      { id: 4, title: '切诊', sub: '脉象分析', icon: '💓', bgClass: 'bg-4' }
    ],
    scrollTop: 0
  },

  onReady() {
    ecLeftComponent = this.selectComponent('#mychart-dom-left');
    ecRightComponent = this.selectComponent('#mychart-dom-right');
    this.fixEchartsPosition(ecLeftComponent);
    this.fixEchartsPosition(ecRightComponent);
  },

  fixEchartsPosition(ecComponent) {
    if (!ecComponent || !ecComponent.canvas) return;
    const canvas = ecComponent.canvas;
    if (canvas && canvas.style) {
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.right = '0';
      canvas.style.bottom = '0';
      canvas.style.zIndex = '1';
      canvas.addEventListener = canvas.addEventListener || function () { };
      canvas.removeEventListener = canvas.removeEventListener || function () { };
    }
  },

  onPageScroll(e) {
    this.setData({ scrollTop: e.scrollTop });
    if (leftChartInstance) leftChartInstance.resize();
    if (rightChartInstance) rightChartInstance.resize();
    if (ecLeftComponent && ecLeftComponent.canvas) ecLeftComponent.canvas.style.transform = `translateY(-${e.scrollTop}px)`;
    if (ecRightComponent && ecRightComponent.canvas) ecRightComponent.canvas.style.transform = `translateY(-${e.scrollTop}px)`;
  },

  onUnload() {
    try {
      if (leftChartInstance) { leftChartInstance.dispose(); leftChartInstance = null; }
      if (rightChartInstance) { rightChartInstance.dispose(); rightChartInstance = null; }
      ecLeftComponent = null;
      ecRightComponent = null;
    } catch (err) {
      console.log('销毁图表实例时的兼容报错（可忽略）：', err);
    }
  },

  onIdentify() {
    wx.showToast({
      title: '开始一键辨识...',
      icon: 'loading'
    });
  },

  onFeatureTap(e) {
    const idx = e.currentTarget.dataset.index;
    const item = this.data.features[idx];
    console.log("Tapped", item.title);

    if (item.title === '望诊') {
      wx.showToast({ title: '面诊功能开发中', icon: 'none' });
    } else if (item.title === '问诊') {
      wx.navigateTo({ url: '/pages/four/four?step=2' });
    } else if (item.title === '闻诊') {
      wx.showToast({ title: '声音采集功能开发中', icon: 'none' });
    } else {
      wx.showToast({ title: '脉诊设备连接中...', icon: 'loading' });
    }
  }
});