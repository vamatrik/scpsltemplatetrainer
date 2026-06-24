import re

with open('app.js', 'r', encoding='utf-8') as f:
    js_code = f.read()

new_logic = '''        if (mode === 'game') {
            const showSpecial = document.getElementById('showSpecialRoomsCheck')?.checked;
            let key = showSpecial ? r.originalName : '';
            let dynamicRot = 0;
            
            if (!showSpecial) {
                let prefix = '';
                if (r.zoneName === 'LightContainment') prefix = 'Lcz';
                if (r.zoneName === 'HeavyContainment') prefix = 'Hcz';
                if (r.zoneName === 'Entrance') prefix = 'Ez';
                
                // Keep checkpoints even in generic mode ONLY FOR ENTRANCE ZONE
                if (r.zoneName === 'Entrance' && r.originalName.includes('Checkpoint')) {
                    key = r.originalName;
                } else {
                    let s = r.shape;
                    if (s === 'XShape') s = 'Cross';
                    if (s === 'TShape') s = 'ThreeWay';
                    key = prefix + s;
                    
                    // User requested rotations
                    if (r.originalName === 'LczClassDSpawn') {
                        dynamicRot = 180;
                    }
                    if (r.zoneName === 'Entrance' && s === 'Endroom') {
                        dynamicRot = 90;
                    }
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
            }
            
            let img = loadedImages[key];
            if (img && img.complete && img.naturalWidth > 0) {
                // Rotate to local coordinates
                ctx.rotate(r.effectiveRot * Math.PI / 180);
                
                const tRot = TEXTURE_ROTATION[key] || 0;
                if (tRot !== 0) ctx.rotate(tRot * Math.PI / 180);
                
                if (dynamicRot !== 0) ctx.rotate(dynamicRot * Math.PI / 180);'''

js_code = re.sub(r'[ \t]*if \(mode === \'game\'\) \{\s*const showSpecial = .*?if \(tRot !== 0\) ctx\.rotate\(tRot \* Math\.PI / 180\);', new_logic, js_code, flags=re.MULTILINE|re.DOTALL)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js_code)

print("Done")
