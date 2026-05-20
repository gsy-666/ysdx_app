import os

file_path = r'c:\Users\gsy_666\Desktop\MDF-ADTP-MS-main\ysdx_app\pkg_eval\pages\diagnose\diagnose.wxml'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("wx:if=\"{{{'showRadar'}}}\"", "wx:if=\"{{showRadar}}\"")
content = content.replace("ec=\"{{{' ec '}}}\"", "ec=\"{{ec}}\"")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed double braces')
