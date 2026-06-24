import re

with open('app.js', 'r', encoding='utf-8') as f:
    js_code = f.read()

new_logic = '''        if (mode === 'game') {
            const showSpecial = document.getElementById('showSpecialRoomsCheck')?.checked;
            let key = showSpecial ? r.originalName : '';
            
            if (!showSpecial || key === 'Unnamed' || !loadedImages[key]) {
                let prefix = '';
                if (r.zoneName === 'LightContainment') prefix = 'Lcz';
                if (r.zoneName === 'HeavyContainment') prefix = 'Hcz';
                if (r.zoneName === 'Entrance') prefix = 'Ez';
                
                let s = r.shape;
                if (s === 'XShape') s = 'Cross';
                if (s === 'TShape') s = 'ThreeWay';
                key = prefix + s;
            }'''

js_code = re.sub(r'[ \t]*if \(mode === \'game\'\) \{\s*let prefix = \'\';.*?if \(s === \'TShape\'\) s = \'ThreeWay\';\s*let key = prefix \+ s;', new_logic, js_code, flags=re.MULTILINE|re.DOTALL)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js_code)

print("Done")
