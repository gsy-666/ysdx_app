
const fs = require("fs");
const path = require("path");

const basePath = path.join(__dirname);

const pages = {
  "my_appointment": {
    title: "我的预约"
  },
  "my_followup": {
    title: "我的复诊"
  },
  "followup_form": {
    title: "复诊表单"
  },
  "my_block": {
    title: "我的屏蔽"
  },
  "patient_manage": {
    title: "就诊人管理"
  },
  "bmi_calculator": {
    title: "BMI计算器"
  },
  "medical_advice": {
    title: "建议医嘱"
  },
  "address_manage": {
    title: "地址管理"
  },
  "function_guide": {
    title: "功能引导"
  },
  "feedback": {
    title: "意见反馈"
  },
  "settings": {
    title: "设置"
  }
};

const wxmlTemplate = (title) => `<view class=\"container\">
  <!-- ${title} 页面内容 -->
  <view class=\"header-bg\"></view>
  <view class=\"card main-card\">
    <view class=\"card-title\">${title}</view>
    <view class=\"empty-state\">
      <image class=\"empty-img\" src=\"/static/default_avatar.svg\" mode=\"aspectFit\"></image>
      <text class=\"empty-text\">暂无内容</text>
    </view>
  </view>
</view>`;

const wxssTemplate = () => `page {
  background-color: var(--bg-color);
}
.header-bg {
  background: linear-gradient(180deg, #E6F3FB 0%, #F0F4F7 100%);
  height: 200rpx;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
}
.main-card {
  margin-top: 40rpx;
  min-height: 400rpx;
}
.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: var(--text-main);
  margin-bottom: 40rpx;
  display: flex;
  align-items: center;
}
.card-title::before {
  content: "";
  display: inline-block;
  width: 8rpx;
  height: 30rpx;
  background: linear-gradient(180deg, #3B99FC 0%, #1A7DF9 100%);
  border-radius: 4rpx;
  margin-right: 16rpx;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}
.empty-img {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 30rpx;
  opacity: 0.6;
}
.empty-text {
  font-size: 28rpx;
  color: var(--text-sub);
}
.card {
  background: #FFFFFF;
  border-radius: 20rpx;
  margin: 0 30rpx 24rpx;
  padding: 36rpx 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
}
`;

for (const [key, val] of Object.entries(pages)) {
  const dir = path.join(basePath, key);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, key + ".wxml"), wxmlTemplate(val.title));
  fs.writeFileSync(path.join(dir, key + ".wxss"), wxssTemplate());
  console.log("Updated", key);
}

