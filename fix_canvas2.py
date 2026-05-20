import os

file_path = r'c:\Users\gsy_666\Desktop\MDF-ADTP-MS-main\ysdx_app\pkg_eval\pages\diagnose\diagnose.wxml'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_str = '''      <view class="radar-header">
        <text class="radar-title">五脏平衡·健康态势</text>
        <view class="close-btn" bindtap="hideRadar">×</view>
      </view>

      <!-- Chart needs wx:if to render correctly when shown -->
        <view class="radar-chart-box">
          <ec-canvas wx:if="{{showRadar}}" id="mychart-dom-radar" canvas-id="mychart-radar" ec="{{ec}}"></ec-canvas>
        </view>

        <view class="radar-standard-tip">标准范围：0-60 为建议区间，超过 60 的区域会以红色提示。</view>

        <scroll-view class="radar-scroll-area" scroll-y>
          <view class="radar-scroll-area-inner">'''

new_str = '''      <view class="radar-header">
        <text class="radar-title">五脏平衡·健康态势</text>
        <view class="close-btn" bindtap="hideRadar">×</view>
      </view>

      <scroll-view class="radar-scroll-area" scroll-y>
        <view class="radar-scroll-area-inner">
          <!-- Chart needs wx:if to render correctly when shown -->
          <view class="radar-chart-box">
            <ec-canvas wx:if="{{showRadar}}" id="mychart-dom-radar" canvas-id="mychart-radar" ec="{{ec}}"></ec-canvas>
          </view>

          <view class="radar-standard-tip">标准范围：0-60 为建议区间，超过 60 的区域会以红色提示。</view>'''

# Because Chinese characters might have decoding mismatch in console output earlier vs file, we use regex or direct search with ignoring whitespaces.
import re

# Fallback robust replacement
pattern = re.compile(r'<!-- Chart needs wx:if to render correctly when shown -->\s*<view class="radar-chart-box">\s*<ec-canvas wx:if="\{\{showRadar\}\}" id="mychart-dom-radar" canvas-id="mychart-radar" ec="\{\{ec\}\}"></ec-canvas>\s*</view>\s*<view class="radar-standard-tip">[^<]+</view>\s*<scroll-view class="radar-scroll-area" scroll-y>\s*<view class="radar-scroll-area-inner">')

replacement = '''<scroll-view class="radar-scroll-area" scroll-y>
        <view class="radar-scroll-area-inner">
          <!-- Chart needs wx:if to render correctly when shown -->
          <view class="radar-chart-box">
            <ec-canvas wx:if="{{showRadar}}" id="mychart-dom-radar" canvas-id="mychart-radar" ec="{{ec}}"></ec-canvas>
          </view>

          <view class="radar-standard-tip">标准范围：0-60 为建议区间，超过 60 的区域会以红色提示。</view>'''

match = pattern.search(content)
if match:
    content = content[:match.start()] + replacement + content[match.end():]
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Match and replaced successfully!")
else:
    print("Pattern not matched!")
