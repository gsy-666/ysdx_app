import os

file_path = r'c:\Users\gsy_666\Desktop\MDF-ADTP-MS-main\ysdx_app\pkg_eval\pages\diagnose\diagnose.wxss'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_css = '''.radar-scroll-area {
  flex: 1;
  min-height: 0;
  width: 100%;
}'''

new_css = '''.radar-scroll-area {
  flex: 1;
  min-height: 0;
  width: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}'''

content = content.replace(old_css, new_css)
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated CSS')
