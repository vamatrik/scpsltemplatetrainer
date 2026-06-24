import re

with open('app.js', 'r', encoding='utf-8') as f:
    js_code = f.read()

# 1. Add Endroom mappings to TEXTURE_MAPPING
js_code = js_code.replace("'LczThreeWay': 'LCZ/LCZ_ThreeWay.png',", "'LczThreeWay': 'LCZ/LCZ_ThreeWay.png',\n    'LczEndroom': 'LCZ/LCZ_LargeEnd.png',")
js_code = js_code.replace("'HczThreeWay': 'HCZ/HCZ_ThreeWay.png',", "'HczThreeWay': 'HCZ/HCZ_ThreeWay.png',\n    'HczEndroom': 'HCZ/HCZ_EndSmall.png',")
js_code = js_code.replace("'EzThreeWay': 'EZ/EZ_ThreeWay.png',", "'EzThreeWay': 'EZ/EZ_ThreeWay.png',\n    'EzEndroom': 'EZ/EZ_NonGateEnd.png',")

# 2. Add checkpoint exceptions and update the draw logic
new_logic = '''        if (mode === 'game') {
            const showSpecial = document.getElementById('showSpecialRoomsCheck')?.checked;
            let key = showSpecial ? r.originalName : '';
            
            if (!showSpecial) {
                let prefix = '';
                if (r.zoneName === 'LightContainment') prefix = 'Lcz';
                if (r.zoneName === 'HeavyContainment') prefix = 'Hcz';
                if (r.zoneName === 'Entrance') prefix = 'Ez';
                
                // Keep checkpoints even in generic mode
                if (r.originalName.includes('Checkpoint')) {
                    key = r.originalName;
                } else {
                    let s = r.shape;
                    if (s === 'XShape') s = 'Cross';
                    if (s === 'TShape') s = 'ThreeWay';
                    key = prefix + s;
                }
            }
            
            if (key === 'Unnamed' || !loadedImages[key]) {
                let prefix = '';
                if (r.zoneName === 'LightContainment') prefix = 'Lcz';
                if (r.zoneName === 'HeavyContainment') prefix = 'Hcz';
                if (r.zoneName === 'Entrance') prefix = 'Ez';
                let s = r.shape;
                if (s === 'XShape') s = 'Cross';
                if (s === 'TShape') s = 'ThreeWay';
                key = prefix + s;
            }'''

js_code = re.sub(r'[ \t]*if \(mode === \'game\'\) \{\s*const showSpecial = .*?key = prefix \+ s;\s*\}', new_logic, js_code, flags=re.MULTILINE|re.DOTALL)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js_code)

print("Done app.js texture map patch")
