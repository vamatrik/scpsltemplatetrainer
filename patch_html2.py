with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Revert main menu
html = html.replace('''<div class="header" style="justify-content: flex-start; gap: 20px;">
            <button class="primary-btn" onclick="window.openMainMenu()">На главную</button>
            <label style="color: white; display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" id="showSpecialRoomsCheck" onchange="if(typeof drawCanvas === 'function') drawCanvas();" />
                Показывать спец. комнаты
            </label>
        </div>''', '''<div class="header">
            <button class="primary-btn" onclick="window.openMainMenu()">На главную</button>
        </div>''')

# Add toggle to layoutsApp
sidebar_addition = '''
            <div class="control-group" style="margin-bottom: 1.5rem; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px;">
                <label style="color: white; display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="checkbox" id="showSpecialRoomsCheck" onchange="if(typeof drawCanvas === 'function') drawCanvas();" />
                    Показывать уникальные комнаты
                </label>
            </div>
'''
html = html.replace('''<div class="control-group" style="margin-bottom: 1.5rem;">
                <label style="margin-bottom: 0.5rem; display: block; color: var(--text-secondary); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em;">Зона</label>''', sidebar_addition + '''<div class="control-group" style="margin-bottom: 1.5rem;">
                <label style="margin-bottom: 0.5rem; display: block; color: var(--text-secondary); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em;">Зона</label>''')

html = html.replace('v=8', 'v=9')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
