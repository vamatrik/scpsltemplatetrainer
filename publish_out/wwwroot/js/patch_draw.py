import re

with open('app.js', 'r', encoding='utf-8') as f:
    js_code = f.read()

new_logic = '''        if (mode === 'game') {
            let prefix = '';
            if (r.zoneName === 'LightContainment') prefix = 'Lcz';
            if (r.zoneName === 'HeavyContainment') prefix = 'Hcz';
            if (r.zoneName === 'Entrance') prefix = 'Ez';
            
            let s = r.shape;
            if (s === 'XShape') s = 'Cross';
            if (s === 'TShape') s = 'ThreeWay';
            let key = prefix + s;'''

js_code = re.sub(r'[ \t]*if \(mode === \'game\'\) \{\s*let key = r\.originalName;.*?if \(s === \'TShape\'\) s = \'ThreeWay\';\s*key = prefix \+ s;\s*\}', new_logic, js_code, flags=re.MULTILINE|re.DOTALL)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js_code)

print("Done")
