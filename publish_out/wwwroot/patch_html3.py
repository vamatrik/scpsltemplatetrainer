with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Remove hidden input
html = html.replace('<input type="hidden" id="designModeSelect" value="game" />', '')

# Add the select right before showSpecialRoomsCheck
new_ui = '''
            <div class="control-group" style="margin-bottom: 1.5rem; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px;">
                <label style="margin-bottom: 0.5rem; display: block; color: var(--text-secondary); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em;">Оформление</label>
                <select id="designModeSelect" class="primary-btn" style="width: 100%; margin-bottom: 15px; padding: 0.5rem; font-size: 0.9rem;" onchange="if(typeof drawCanvas === 'function') drawCanvas();">
                    <option value="game" selected>Игровое (из 079)</option>
                    <option value="basic">Базовое (схема)</option>
                </select>
                
                <label style="color: white; display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="checkbox" id="showSpecialRoomsCheck" onchange="if(typeof drawCanvas === 'function') drawCanvas();" />
                    Показывать уникальные комнаты
                </label>
            </div>
'''
html = html.replace('''            <div class="control-group" style="margin-bottom: 1.5rem; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px;">
                <label style="color: white; display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="checkbox" id="showSpecialRoomsCheck" onchange="if(typeof drawCanvas === 'function') drawCanvas();" />
                    Показывать уникальные комнаты
                </label>
            </div>''', new_ui)

html = html.replace('v=10', 'v=11')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Done index patch")
