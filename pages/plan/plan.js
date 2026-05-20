const request = require('../../utils/request.js').request;

Page({
  data: {
    healthInfo: {},
    points: 0,
    tasks: [],
    leaderboard: []
  },

  onShow: function (options) {
    this.fetchPatientHealthInfo();
    this.initTasks();
    this.fetchLeaderboard();
  },

      initTasks: function() {
    let tasks = [];
    try {
      const today = new Date().toISOString().slice(0, 10);
      const storedDate = wx.getStorageSync('tasksDate');
      tasks = wx.getStorageSync('dailyTasks');

      if (!tasks || !Array.isArray(tasks) || tasks.length === 0 || storedDate !== today) {
        tasks = [
          { id: 1, name: '早起测量血压', desc: '+ 10 分', points: 10, completed: false, icon: '/static/article.svg' },
          { id: 2, name: '完成中医体质测评', desc: '+ 30 分', points: 30, completed: false, icon: '/static/report.svg' },
          { id: 3, name: '记录今日饮食', desc: '+ 15 分', points: 15, completed: false, icon: '/static/four_diag.svg' }
        ];
        wx.setStorageSync('dailyTasks', tasks);
        wx.setStorageSync('tasksDate', today);
      }
    } catch(e) {
      console.error('initTasks err', e);
      tasks = [];
    }
    this.setData({ tasks: tasks || [] });
  },

  completeTask: function(e) {
    const taskId = e.currentTarget.dataset.id;
    const patientId = wx.getStorageSync('id');
    let tasks = this.data.tasks;
    let currentTask = tasks.find(t => t.id === taskId);
    
    if (!patientId) {
      wx.showToast({ title: '请先登录', icon: 'error' });
      return;
    }

    if (currentTask && !currentTask.completed) {
      currentTask.completed = true;
      let addedPoints = currentTask.points;
      
      // Update locally first for snappiness
      let newPoints = this.data.points + addedPoints;
      this.setData({ tasks, points: newPoints });
      wx.setStorageSync('dailyTasks', tasks);
      wx.setStorageSync('userPoints', newPoints); // fallback
      
      wx.showToast({
        title: `打卡成功 +${addedPoints}积分`,
        icon: 'success'
      });
      
      // Call backend to add points and refresh leaderboard
      const pointsData = { id: patientId, points: addedPoints };

      request('/sysAdmin/addPoints', 'POST', pointsData).then(res => {
         this.fetchLeaderboard();
      }).catch(err => {
         console.error('增加积分调用失败:', err);
      });
    }
  },

  fetchPatientHealthInfo: function () {
    const patientId = wx.getStorageSync('id');
    if (!patientId) return;

    const p1 = request('/message/getByPatientId', 'GET', { patientId: patientId }).catch(e => ({}));
    const p2 = request('/screen/getByPatientId', 'GET', { patientId: patientId }).catch(e => ({}));
    const p3 = request('/sysAdmin/getById', 'GET', { id: patientId }).catch(e => ({}));

    Promise.all([p1, p2, p3]).then(([messageData, screenData, userData]) => {   
      messageData = messageData || {};
      screenData = screenData || {};
      userData = userData || {};

      let currentRemote = Number(userData.points) || 0;
      let localTotal = Number(wx.getStorageSync('userPoints')) || 0;

      // 后端同步
      if (localTotal > 0 && currentRemote === 0) {
        request('/sysAdmin/addPoints', 'POST', { id: patientId, points: localTotal }).then(() => {
           this.fetchLeaderboard();
        }).catch(err => {
           console.log("Syn points failed:", err);
        });
        currentRemote = localTotal;
      } else if (currentRemote > 0) {
        wx.setStorageSync('userPoints', currentRemote);
      }

      this.setData({
        points: currentRemote,
        healthInfo: {
          high: messageData.high || userData.height,
          weight: messageData.weight || userData.weight,
          bloodHigh: messageData.bloodHigh,
          bloodLow: messageData.bloodLow,
          lowhdl: screenData.lowhdl
        }
      });
    });
  },

  fetchLeaderboard: function() {
    request('/sysAdmin/leaderboard', 'GET', {}).then(res => {
      if (res && res.length > 0) {
        let board = res.map((user, index) => {
          let displayName = user.name || '匿名用户';
          // 如果名字是电话号码，脱敏处理
          if (user.name && /^1[3-9]\d{9}$/.test(user.name)) {
            displayName = user.name.substring(0,3) + '****' + user.name.substring(7);
          } else if (!user.name && user.phone) {
            displayName = user.phone.substring(0,3) + '****' + user.phone.substring(7);
          }
          
          return {
            rank: index + 1,
            name: displayName,
            points: user.points || 0,
            avatar: user.avatar || '/static/default_avatar.svg'
          };
        });
        
        // 过滤掉积分为0的，以免排行榜太空或者全是0分用户
board = board.filter(u => u.points >= 0);
        
        // 重写index，因为滤掉了一些
        board.forEach((b, i) => b.rank = i + 1);

        this.setData({ leaderboard: board });
      }
    }).catch(err => {
      console.error("加载排行榜失败:", err);
    });
  },

  joinPlan() {
    wx.navigateTo({ url: '/pkg_eval/pages/diagnose/diagnose' });
  }
})