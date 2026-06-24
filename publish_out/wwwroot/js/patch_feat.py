import re

with open('app.js', 'r', encoding='utf-8') as f:
    js_code = f.read()

# 1. Update TEXTURE_MAPPING for HczCheckpoints to Tesla
js_code = js_code.replace("'HczCheckpointA': 'HCZ/HCZ_Elevators.png',", "'HczCheckpointA': 'HCZ/HCZ_Tesla.png',")
js_code = js_code.replace("'HczCheckpointB': 'HCZ/HCZ_Elevators.png',", "'HczCheckpointB': 'HCZ/HCZ_Tesla.png',")

# 2. Whitelist Heavy checkpoints in !showSpecial
js_code = js_code.replace("if (r.zoneName === 'Entrance' && r.originalName.includes('Checkpoint')) {", "if ((r.zoneName === 'Entrance' || r.zoneName === 'HeavyContainment') && r.originalName.includes('Checkpoint')) {")

# 3. Save/Restore for texture rotations
old_game_draw = '''            let img = loadedImages[key];
            if (img && img.complete && img.naturalWidth > 0) {
                // Rotate to local coordinates
                ctx.rotate(r.effectiveRot * Math.PI / 180);
                
                const tRot = TEXTURE_ROTATION[key] || 0;
                if (tRot !== 0) ctx.rotate(tRot * Math.PI / 180);
                
                if (dynamicRot !== 0) ctx.rotate(dynamicRot * Math.PI / 180);
                
                const tinted = getTintedImage(img, color);
                
                // Draw scaled to CELL_SIZE
                const sSize = CELL_SIZE;
                ctx.drawImage(tinted, -sSize/2, -sSize/2, sSize, sSize);
            } else {'''

new_game_draw = '''            let img = loadedImages[key];
            if (img && img.complete && img.naturalWidth > 0) {
                // Rotate to local coordinates
                ctx.rotate(r.effectiveRot * Math.PI / 180);
                
                ctx.save();
                const tRot = TEXTURE_ROTATION[key] || 0;
                if (tRot !== 0) ctx.rotate(tRot * Math.PI / 180);
                
                if (dynamicRot !== 0) ctx.rotate(dynamicRot * Math.PI / 180);
                
                const tinted = getTintedImage(img, color);
                
                // Draw scaled to CELL_SIZE
                const sSize = CELL_SIZE;
                ctx.drawImage(tinted, -sSize/2, -sSize/2, sSize, sSize);
                ctx.restore();
            } else {'''

js_code = js_code.replace(old_game_draw, new_game_draw)

# 4. Add Arrows before ctx.restore() for room loop
arrow_logic = '''        if (r.originalName.includes('HczCheckpoint')) {
            ctx.fillStyle = '#22c55e'; // Green
            ctx.beginPath();
            ctx.moveTo(-50, -10);
            ctx.lineTo(-20, -10);
            ctx.lineTo(-20, -20);
            ctx.lineTo(10, 0);
            ctx.lineTo(-20, 20);
            ctx.lineTo(-20, 10);
            ctx.lineTo(-50, 10);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else if (r.originalName.includes('EzCheckpoint') || r.originalName === 'HczCheckpointToEntranceZone') {
            ctx.fillStyle = '#ef4444'; // Red
            ctx.beginPath();
            ctx.moveTo(-50, -10);
            ctx.lineTo(-20, -10);
            ctx.lineTo(-20, -20);
            ctx.lineTo(10, 0);
            ctx.lineTo(-20, 20);
            ctx.lineTo(-20, 10);
            ctx.lineTo(-50, 10);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        ctx.restore();'''

js_code = js_code.replace("        ctx.restore();\n        \n        // Draw Text Labels Over Everything in screen space", arrow_logic + "\n        \n        // Draw Text Labels Over Everything in screen space")

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js_code)

print("Done feature patch")
