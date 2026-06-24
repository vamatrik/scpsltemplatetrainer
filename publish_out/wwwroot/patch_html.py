import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

toggle_html = '''
        <div class="header" style="justify-content: flex-start; gap: 20px;">
            <button class="primary-btn" onclick="window.openMainMenu()">На главную</button>
            <label style="color: white; display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" id="showSpecialRoomsCheck" onchange="if(typeof drawCanvas === 'function') drawCanvas();" />
                Показывать спец. комнаты
            </label>
        </div>
'''

html = re.sub(r'<div class="header">.*?</div>', toggle_html, html, flags=re.MULTILINE|re.DOTALL)
html = html.replace('v=8', 'v=9')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
