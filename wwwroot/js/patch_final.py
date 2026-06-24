import re

with open('app.js', 'r', encoding='utf-8') as f:
    js_code = f.read()

# 1. Fix Rotation (dynamicRot = -90 instead of 90)
js_code = js_code.replace('dynamicRot = 90;', 'dynamicRot = -90;')

# 2. Fix hideText logic
new_text_logic = '''    const showSpecialText = document.getElementById('showSpecialRoomsCheck')?.checked;
    const hideText = document.getElementById('hideTextCheck')?.checked || !showSpecialText;
    if (!hideText) {'''
js_code = re.sub(r'[ \t]*const hideText = document\.getElementById\(\'hideTextCheck\'\)\?\.checked;\s*if \(\!hideText\) \{', new_text_logic, js_code)

# 3. Fix aliases
new_aliases = '''const roomAliases = {
    // LCZ
    'Lcz330': '330',
    'LczCheckpointB': 'Лифт B',
    'LczCheckpointA': 'Лифт A',
    'LczClassDSpawn': 'D блок',
    'Lcz914': '914',
    'LczToilets': 'Туалеты',
    'LczComputerRoom': 'PC-15',
    'LczArmory': 'Оружейка',
    'LczAirlock': 'AL-01/02',
    'Lcz173': '173',
    'LczGreenhouse': 'Оранжерея',
    'LczGlassroom': 'Стекляшка',
    
    // HCZ
    'HczCheckpointA': 'Лифт A',
    'HczCheckpointB': 'Лифт B',
    'HczWarhead': 'Боеголовка',
    'HczServers': 'Сервера',
    'Hcz939': '939',
    'HczTestroom': 'Стенд',
    'HczTesla': 'Тесла',
    'HczArmory': 'Оружейка',
    'Hcz049': '049',
    'Hcz096': '096',
    'Hcz106': '106',
    
    // EZ
    'EzGateA': 'Гейт А',
    'EzGateB': 'Гейт В',
    'EzEvacShelter': 'Эвак. Убежище',
    'EzOfficeLarge': 'Офис',
    'EzOfficeStoried': '2-Этажный Офис',
    'EzCollapsedTunnel': 'Обвал',
    'EzIntercom': 'Интерком',
    'EzCheckpoint': 'Проход на чек',
    'EzRedroom': 'Красная Комната'
};'''

js_code = re.sub(r'const roomAliases = \{.*?\};', new_aliases, js_code, flags=re.DOTALL)

# Fix checkpoints aliases
js_code = js_code.replace("shortName = 'Р вЂ™Р ВµРЎР‚РЎвЂ¦Р Р…Р С‘Р в„– РЎвЂЎР ВµР С”';", "shortName = 'Верхний чек';")
js_code = js_code.replace("shortName = 'Р СњР С‘Р В¶Р Р…Р С‘Р в„– РЎвЂЎР ВµР С”';", "shortName = 'Нижний чек';")

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js_code)

print("Done")
