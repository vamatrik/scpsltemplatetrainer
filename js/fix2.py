import os
import re

with open('app.js', 'r', encoding='utf-8') as f:
    js_code = f.read()

new_parse_logic = '''window.parseLayoutLines = function(lines) {
    processedRooms = [];
    const charMap = {
        '─': { shape: 'Straight', rot: 90 },
        '│': { shape: 'Straight', rot: 0 },
        '┌': { shape: 'Curve', rot: -90 }, 
        '┐': { shape: 'Curve', rot: 180 },
        '└': { shape: 'Curve', rot: 0 },
        '┘': { shape: 'Curve', rot: 90 },
        '├': { shape: 'TShape', rot: 0 },
        '┤': { shape: 'TShape', rot: 180 },
        '┬': { shape: 'TShape', rot: -90 },
        '┴': { shape: 'TShape', rot: 90 },
        '┼': { shape: 'Cross', rot: 0 },
        '╶': { shape: 'Endroom', rot: 90 },
        '╴': { shape: 'Endroom', rot: -90 },
        '╷': { shape: 'Endroom', rot: 180 },
        '╵': { shape: 'Endroom', rot: 0 },
        '╹': { shape: 'Endroom', rot: 0 }
    };
    
    const SPACING = 28;
    let minX = 9999, maxX = -9999, minY = 9999, maxY = -9999;
    let roomMap = {};
    
    for (let r = 0; r < lines.length; r++) {
        const line = lines[r];
        for (let c = 0; c < line.length; c++) {
            const ch = line[c];
            if (ch === ' ' || !charMap[ch]) continue;
            
            const mapping = charMap[ch];
            const wx = c;
            const wy = -r; 
            
            if (wx < minX) minX = wx;
            if (wx > maxX) maxX = wx;
            if (wy < minY) minY = wy;
            if (wy > maxY) maxY = wy;
            
            let obj = {
                x: wx,
                y: wy,
                shape: mapping.shape,
                rot: mapping.rot,
                zoneName: currentZone,
                originalName: mapping.shape,
                shortName: '',
                baseDoors: getBaseDoors(mapping.shape, mapping.shape),
                globalDoors: getGlobalDoors(mapping.shape, mapping.shape, mapping.rot, currentZone),
                chosenCandidate: { name: mapping.shape, shape: mapping.shape },
                interpretation: { rotationY: mapping.rot },
                neighborMap: roomMap,
                roomIndex: processedRooms.length
            };
            
            // Calculate effective rotation
            let effectiveRot = mapping.rot;
            if (currentZone === 'HeavyContainment' || currentZone === 'Entrance') {
                effectiveRot = (mapping.rot + 270) % 360;
                if (effectiveRot < 0) effectiveRot += 360;
            }
            obj.effectiveRot = effectiveRot;
            
            processedRooms.push(obj);
            roomMap[wx + ',' + wy] = obj;
        }
    }
    
    if (processedRooms.length === 0) {
        drawCanvas();
        return;
    }
    
    let midX = (minX + maxX) / 2;
    let midY = (minY + maxY) / 2;
    
    processedRooms.forEach(r => {
        r.cx = (r.x - midX) * CELL_SIZE;
        r.cy = -(r.y - midY) * CELL_SIZE;
    });
    
    cameraX = window.innerWidth / 2;
    cameraY = window.innerHeight / 2;
    drawCanvas();
};'''

js_code = re.sub(r'window\.parseLayoutLines = function\(lines\).*?drawCanvas\(\);\s*\};', new_parse_logic, js_code, flags=re.MULTILINE|re.DOTALL)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js_code)

print("Done")
