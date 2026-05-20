// pages/diagnose/diagnose.js
import * as echarts from '../../components/ec-canvas/echarts';

const ANALYSIS_STORAGE_KEY = 'diag_model_analysis_v1';
const DEFAULT_RADAR_VALUES = [62, 48, 54, 46, 58];
const STANDARD_LIMIT = 60;
const RADAR_MAX = 100;
const RADAR_LABELS = ['心系', '肝系', '脾系', '肺系', '肾系'];
const LABEL_COLUMNS = ['脾', '肝', '肾', '肺', '心', '胃', '热', '痰', '湿', '阴虚', '阳虚', '气滞', '气虚', '血瘀', '血虚'];

let currentRadarValues = DEFAULT_RADAR_VALUES.slice();
let radarChart = null;

function buildRadarOption(values) {
  const safeValues = values.map((v) => Math.min(v, STANDARD_LIMIT));
  const exceedValues = values.map((v) => (v > STANDARD_LIMIT ? v : STANDARD_LIMIT));
  const hasExceed = values.some((v) => v > STANDARD_LIMIT);

  const series = [
    {
      name: '标准上限',
      type: 'radar',
      data: [{ value: new Array(RADAR_LABELS.length).fill(STANDARD_LIMIT), name: '标准' }],
      symbol: 'none',
      lineStyle: {
        color: 'rgba(56, 161, 105, 0.9)',
        width: 1,
        type: 'dashed'
      },
      areaStyle: {
        color: 'rgba(56, 161, 105, 0.08)'
      }
    },
    {
      name: '评估值(标准内)',
      type: 'radar',
      data: [{ value: safeValues, name: '标准内' }],
      symbol: 'circle',
      symbolSize: 5,
      itemStyle: {
        color: '#2F80ED',
        borderColor: '#fff',
        borderWidth: 1
      },
      areaStyle: {
        color: 'rgba(47, 128, 237, 0.35)'
      },
      lineStyle: {
        color: '#2F80ED',
        width: 2
      }
    }
  ];

  if (hasExceed) {
    series.push({
      name: '超标区',
      type: 'radar',
      data: [{ value: exceedValues, name: '超标' }],
      symbol: 'none',
      lineStyle: {
        color: '#E53935',
        width: 2
      },
      areaStyle: {
        color: 'rgba(229, 57, 53, 0.32)'
      },
      z: 3
    });
  }

  return {
    radar: {
      center: ['50%', '50%'],
      radius: '65%',
      indicator: RADAR_LABELS.map((name) => ({ name, max: RADAR_MAX })),
      shape: 'circle',
      splitNumber: 5,
      name: {
        textStyle: {
          color: '#1F3A56',
          fontSize: 12,
          fontWeight: 'bold'
        }
      },
      splitLine: {
        lineStyle: {
          color: [
            'rgba(47, 128, 237, 0.08)',
            'rgba(47, 128, 237, 0.15)',
            'rgba(47, 128, 237, 0.24)',
            'rgba(47, 128, 237, 0.34)',
            'rgba(47, 128, 237, 0.45)'
          ]
        }
      },
      splitArea: {
        show: false
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(47, 128, 237, 0.3)'
        }
      }
    },
    tooltip: {
      confine: true,
      formatter: () => {
        return RADAR_LABELS.map((name, idx) => {
          const v = values[idx];
          return `${name}: ${v}${v > STANDARD_LIMIT ? ' (超标)' : ''}`;
        }).join('<br/>');
      }
    },
    series
  };
}

function initChart(canvas, width, height, dpr) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr
  });
  canvas.setChart(chart);

  radarChart = chart;
  chart.setOption(buildRadarOption(currentRadarValues));
  return chart;
}

Page({
  data: {
    ec: {
      onInit: initChart
    },
    showRadar: false,
    radarValues: DEFAULT_RADAR_VALUES,
    standardLimit: STANDARD_LIMIT,
    labelRiskList: LABEL_COLUMNS.map((name, idx) => ({
      name,
      score: idx < 5 ? DEFAULT_RADAR_VALUES[idx] : 50,
      exceed: idx < 5 ? DEFAULT_RADAR_VALUES[idx] > STANDARD_LIMIT : false
    })),
    analysisText: '尚未采集模型数据，请先点击“信息采集”完成录入。',
    analysisUpdatedAt: '',
    bodyImage: '../../../static/body_origin.jpg',
    currentScale: 1.0,
    organNodes: [
      // 头部区域 - 情绪与神经障碍 (Brain) - 缩小范围集中在脑部
      {
        key: 'emotion',
        title: '情绪与神经障碍',
        position: { x: 44, y: 6 },
        width: 12,
        height: 6,
        route: '/pkg_eval/pages/diagnose/detail/detail?type=emotion'
      },
      // 眼部 - 左眼 (图上右侧) - 上移修正
      {
        key: 'retina_left',
        title: '眼部并发症',
        position: { x: 53, y: 11 }, // x调大(右移), y调小(上移)
        width: 8,
        height: 4,
        route: '/pkg_eval/pages/diagnose/detail/detail?type=retina'
      },
      // 眼部 - 右眼 (图上左侧) - 上移修正
      {
        key: 'retina_right',
        title: '眼部并发症',
        position: { x: 39, y: 11 }, // x调小(左移), y调小(上移)
        width: 8,
        height: 4,
        route: '/pkg_eval/pages/diagnose/detail/detail?type=retina'
      },
      // 胸部区域 - 心脑血管疾病 (Heart)
      {
        key: 'cardio_cerebro',
        title: '心脑血管疾病',
        position: { x: 46, y: 22 }, // 略微上移
        width: 10,
        height: 8,
        route: '/pkg_eval/pages/diagnose/detail/detail?type=cardio'
      },
      // 腹部右上 - 肝脏 (Liver)
      {
        key: 'liver',
        title: '代谢相关脂肪肝',
        position: { x: 38, y: 33 }, // 略微上移
        width: 12,
        height: 8,
        route: '/pkg_eval/pages/diagnose/detail/detail?type=liver'
      },
      // 腹部/胰腺 - 糖尿病 (Pancreas)
      {
        key: 'diabetes',
        title: '糖尿病及相关并发症',
        position: { x: 44, y: 37 }, // 略微上移
        width: 12,
        height: 4,
        route: '/pkg_eval/pages/diagnose/detail/detail?type=diabetes'
      },
      // 腰部 - 左肾 (图上右侧) - 内收并上移
      {
        key: 'kidney_l',
        title: '肾脏并发症',
        position: { x: 55, y: 40 }, // x减小(内收), y减小(上移)
        width: 8,
        height: 7,
        route: '/pkg_eval/pages/diagnose/detail/detail?type=kidney'
      },
      // 腰部 - 右肾 (图上左侧) - 内收并上移
      {
        key: 'kidney_r',
        title: '肾脏并发症',
        position: { x: 37, y: 40 }, // x增大(内收), y减小(上移)
        width: 8,
        height: 7,
        route: '/pkg_eval/pages/diagnose/detail/detail?type=kidney'
      }
    ]
  },

  onShow() {
    this.loadAnalysisFromStorage();
  },

  loadAnalysisFromStorage() {
    const stored = wx.getStorageSync(ANALYSIS_STORAGE_KEY);
    if (!stored || !stored.radarValues) {
      currentRadarValues = DEFAULT_RADAR_VALUES.slice();
      this.setData({
        radarValues: DEFAULT_RADAR_VALUES,
        labelRiskList: LABEL_COLUMNS.map((name, idx) => ({
          name,
          score: idx < 5 ? DEFAULT_RADAR_VALUES[idx] : 50,
          exceed: idx < 5 ? DEFAULT_RADAR_VALUES[idx] > STANDARD_LIMIT : false
        })),
        analysisText: '尚未采集模型数据，请先点击“信息采集”完成录入。',
        analysisUpdatedAt: ''
      });
      return;
    }

    const radarValues = Array.isArray(stored.radarValues) && stored.radarValues.length === 5
      ? stored.radarValues
      : DEFAULT_RADAR_VALUES;

    currentRadarValues = radarValues.slice();
    const labelRiskList = Array.isArray(stored.labelRiskList) && stored.labelRiskList.length
      ? stored.labelRiskList.map((item) => ({
        name: item.name,
        score: Math.max(0, Math.min(100, Number(item.score) || 0)),
        exceed: (Number(item.score) || 0) > STANDARD_LIMIT
      }))
      : LABEL_COLUMNS.map((name, idx) => ({
        name,
        score: idx < 5 ? radarValues[idx] : 50,
        exceed: idx < 5 ? radarValues[idx] > STANDARD_LIMIT : false
      }));

    this.setData({
      radarValues,
      labelRiskList,
      analysisText: stored.analysisText || '已生成模型分析结果。',
      analysisUpdatedAt: stored.updatedAt || ''
    });

    if (radarChart) {
      radarChart.setOption(buildRadarOption(currentRadarValues), true);
    }
  },

  showRadar() {
    this.loadAnalysisFromStorage();
    this.setData({ showRadar: true });
  },

  hideRadar() {
    this.setData({ showRadar: false });
  },

  goToCollect() {
    wx.navigateTo({
      url: '/pkg_eval/pages/diagnose/collect/collect'
    })
  },

  preventTouchMove() {
    return;
  },

  onImageError(e) {
    console.error('图片加载失败：', e);
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
  }
});
