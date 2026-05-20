import os

file_path = r'c:\Users\gsy_666\Desktop\MDF-ADTP-MS-main\ysdx_app\pkg_eval\pages\diagnose\diagnose.wxml'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the missing closing tag
invalid_str = '''      <view class="radar-header">
        <text class="radar-title">五脏平衡·健康态势</text>
        <view class="close-btn" bindtap="hideRadar">×</view>
      <scroll-view class="radar-scroll-area" scroll-y>
        <view class="radar-scroll-area-inner">
          <!-- Chart needs wx:if to render correctly when shown -->'''

valid_str = '''      <view class="radar-header">
        <text class="radar-title">五脏平衡·健康态势</text>
        <view class="close-btn" bindtap="hideRadar">×</view>
      </view>
      <scroll-view class="radar-scroll-area" scroll-y>
        <view class="radar-scroll-area-inner">
          <!-- Chart needs wx:if to render correctly when shown -->'''

# Let's use regex instead since encoding is tricky
import re
content = re.sub(r'(<view class="close-btn" bindtap="hideRadar">[^<]+</view>)\s*<scroll-view class="radar-scroll-area" scroll-y>', r'\1\n      </view>\n      <scroll-view class="radar-scroll-area" scroll-y>', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed missing view tag')

