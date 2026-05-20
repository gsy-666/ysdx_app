import os
import re

file_path = r'c:\Users\gsy_666\Desktop\MDF-ADTP-MS-main\ysdx_app\pkg_eval\pages\diagnose\diagnose.wxml'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('<scroll-view class="radar-scroll-area" scroll-y>', '<view class="radar-scroll-area">')
content = content.replace('</scroll-view>', '</view>')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Replaced scroll-view with view')
