// pages/connect/chat/chat.js
Page({
  data: {
    patientId: '',
    chatType: 'doctor',
    chatList: [
      { id: 1, type: 'other', content: '您好，请问有什么可以帮您？', time: '10:00' }
    ],
    inputValue: '',
    wsClosed: true
  },

  onLoad(options) {
    if (options.type) {
      this.setData({ chatType: options.type });
    }
    this.connectBox();
  },

  connectBox() {
    this.setData({ wsClosed: false });
  },

  buildAiMessages(currentInput) {
    const systemPrompt = [
      '你是AI中医助手，请先自然交流，再在合适的时候给出专业建议。',
      '语气要有人情味、耐心、像在认真陪伴患者，不要一上来就像模板答题。',
      '当用户明显在问诊、症状分析、处方建议、调护方案时，再使用以下固定结构输出：',
      '一、辨病辨证',
      '二、药剂药方',
      '三、日常计划',
      '其中"药剂药方"必须尽量具体，写清楚方名、药味组成、每味药剂量（克），并说明用法用量与加减思路。',
      '平时可以先简短回应、安抚、追问关键症状。',
      '如果信息不足，优先追问病情，再给出保守建议。',
      '避免输出 Markdown 符号和代码块。'
    ].join('');
    const recentMessages = this.data.chatList.slice(-6).map(item => ({
      role: item.type === 'self' ? 'user' : 'assistant',
      content: item.content
    }));

    return [
      { role: 'system', content: systemPrompt },
      ...recentMessages,
      { role: 'user', content: currentInput }
    ];
  },

  formatAiReply(text) {
    if (!text) return '';
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\s*###\s*/g, '\n\n一、')
      .replace(/\s*##\s*/g, '\n\n')
      .replace(/\s*#\s*/g, '\n\n')
      .replace(/\s*[-•]\s*/g, '\n- ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  },

  send() {
    if (!this.data.inputValue) return;

    const msg = {
      id: Date.now(),
      type: 'self',
      content: this.data.inputValue,
      time: new Date().toTimeString().substring(0, 5)
    };

    const list = this.data.chatList;
    list.push(msg);
    this.setData({ chatList: list, inputValue: '' });

    if (this.data.chatType === 'ai') {
      // 测试阶段：直接调豆包 API，不走云托管
      wx.showLoading({ title: '思考中...' });
      wx.request({
        url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 4627f616-bbd0-4cf7-ba6b-0fb4781c2383'
        },
        data: {
          model: 'ep-m-20260215231635-7l2n5',
          messages: this.buildAiMessages(msg.content)
        },
        success: (res) => {
          wx.hideLoading();
          if (res.data && res.data.choices && res.data.choices.length > 0) {
            const aiReply = this.formatAiReply(res.data.choices[0].message.content);
            const reply = {
              id: Date.now() + 1,
              type: 'other',
              content: aiReply,
              time: new Date().toTimeString().substring(0, 5)
            };
            const newList = this.data.chatList;
            newList.push(reply);
            this.setData({ chatList: newList });
          } else {
            wx.showToast({ title: 'AI回复异常', icon: 'none' });
          }
        },
        fail: (err) => {
          wx.hideLoading();
          wx.showToast({ title: '请求AI失败', icon: 'none' });
          console.error('AI API Error:', err);
        }
      });
    } else {
      // 医生模式
      setTimeout(() => {
        const reply = {
          id: Date.now() + 1,
          type: 'other',
          content: '收到您的消息：' + msg.content,
          time: new Date().toTimeString().substring(0, 5)
        };
        const newList = this.data.chatList;
        newList.push(reply);
        this.setData({ chatList: newList });
      }, 1000);
    }
  },

  bindInput(e) {
    this.setData({ inputValue: e.detail.value });
  }
})
