import os
import re

# Fix app.js
with open('js/app.js', 'r', encoding='utf-8') as f:
    js_code = f.read()

# Remove the broken catch block
js_code = re.sub(r'^[ \t]*document\.getElementById\(\'zoneSelector\'\).*?\}\);\s*', '// generateBtn logic removed\n', js_code, flags=re.MULTILINE|re.DOTALL)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js_code)

# Rewrite index.html completely
html_code = '''<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SCP:SL Тренажер</title>
    <link rel="stylesheet" href="css/app.css" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&display=swap" rel="stylesheet">
    <style>
        body { margin: 0; padding: 0; background: #020617; font-family: 'Inter', sans-serif; overflow: hidden; }
        
        .main-content {
            overflow: hidden; /* Canvas will handle pan/zoom */
            cursor: grab;
        }
        .main-content:active {
            cursor: grabbing;
        }
        #customTooltip {
            position: fixed;
            background: rgba(15, 23, 42, 0.95);
            color: #f8fafc;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.8rem;
            pointer-events: none;
            z-index: 1000;
            border: 1px solid rgba(255,255,255,0.1);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
            display: none;
            white-space: pre-line;
        }

        /* Menu Styles */
        #mainMenu {
            position: fixed;
            inset: 0;
            z-index: 50;
            background: radial-gradient(circle at center, #0f172a 0%, #020617 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            transition: opacity 0.3s ease;
        }
        .menu-title {
            font-size: 3.5rem;
            font-weight: 800;
            margin-bottom: 3rem;
            text-align: center;
            background: linear-gradient(to right, #60a5fa, #a78bfa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 0 40px rgba(96, 165, 250, 0.3);
        }
        .menu-buttons {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            width: 100%;
            max-width: 400px;
        }
        .menu-btn {
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(148, 163, 184, 0.2);
            color: #f8fafc;
            padding: 1.25rem 2rem;
            border-radius: 12px;
            font-size: 1.25rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            backdrop-filter: blur(10px);
        }
        .menu-btn:hover:not(.disabled) {
            background: rgba(51, 65, 85, 0.8);
            border-color: #3b82f6;
            transform: translateY(-2px);
            box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.3);
        }
        .menu-btn.disabled {
            opacity: 0.5;
            cursor: not-allowed;
            background: rgba(15, 23, 42, 0.5);
        }

        /* Zone selector styles */
        .zone-btn {
            flex: 1;
            padding: 0.75rem 0;
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(148, 163, 184, 0.2);
            color: #f8fafc;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .zone-btn:hover { background: rgba(51, 65, 85, 0.8); }
        .zone-btn.active#btn_zone_light { background: rgba(245, 158, 11, 0.2); border-color: #f59e0b; color: #f59e0b; }
        .zone-btn.active#btn_zone_heavy { background: rgba(239, 68, 68, 0.2); border-color: #ef4444; color: #ef4444; }
        .zone-btn.active#btn_zone_entrance { background: rgba(16, 185, 129, 0.2); border-color: #10b981; color: #10b981; }

        .template-btn {
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(148, 163, 184, 0.2);
            color: #f8fafc;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            text-align: left;
            transition: all 0.2s ease;
        }
        .template-btn:hover {
            background: rgba(51, 65, 85, 0.8);
            border-color: #3b82f6;
        }
        .template-btn.active {
            background: rgba(59, 130, 246, 0.2);
            border-color: #3b82f6;
            color: #60a5fa;
            font-weight: 600;
        }

        .hidden { display: none !important; }
    </style>
</head>
<body>
    <div id="debugLog" style="position: fixed; top: 0; left: 0; background: red; color: white; z-index: 9999; padding: 10px; font-family: monospace; display: none;"></div>
    <script>
        window.onerror = function(msg, url, lineNo, columnNo, error) {
            var log = document.getElementById('debugLog');
            log.style.display = 'block';
            log.innerHTML += msg + ' at ' + lineNo + '<br>';
            return false;
        };
        window.addEventListener('unhandledrejection', function(event) {
            var log = document.getElementById('debugLog');
            log.style.display = 'block';
            log.innerHTML += 'Promise: ' + event.reason + '<br>';
        });
    </script>
    <!-- Main Menu Overlay -->
    <div id="mainMenu">
        <h1 class="menu-title">Тренажер<br>Ориентирования SCP:SL</h1>
        <div class="menu-buttons">
            <button class="menu-btn" onclick="openLayouts()">Шаблоны зон</button>
            <button class="menu-btn disabled" disabled>Туман войны (Скоро)</button>
            <button class="menu-btn disabled" disabled>Угадай комнату (Скоро)</button>
        </div>
    </div>

    <!-- Layouts UI -->
    <div id="layoutsApp" class="map-generator-container hidden">
        <div class="sidebar glass-panel" style="display: flex; flex-direction: column;">
            <h1 class="title">Шаблоны зон</h1>
            <p style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 1.5rem; line-height: 1.4;">
                Изучайте макро-структуру (лейауты) каждой зоны, чтобы понимать принципы генерации и безошибочно находить нужные комнаты в реальной игре.
            </p>
            
            <div class="control-group" style="margin-bottom: 1.5rem;">
                <label style="margin-bottom: 0.5rem; display: block; color: var(--text-secondary); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em;">Зона</label>
                <div style="display:flex; gap: 0.5rem;">
                    <button class="zone-btn active" onclick="selectZone('light')" id="btn_zone_light">LCZ</button>
                    <button class="zone-btn" onclick="selectZone('heavy')" id="btn_zone_heavy">HCZ</button>
                    <button class="zone-btn" onclick="selectZone('entrance')" id="btn_zone_entrance">EZ</button>
                </div>
            </div>

            <div class="control-group" style="flex-grow: 1;">
                <label style="margin-bottom: 0.5rem; display: block; color: var(--text-secondary); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em;">Доступные шаблоны</label>
                <div id="templateButtons" style="display: flex; flex-direction: column; gap: 0.5rem; overflow-y: auto;">
                    <!-- Buttons generated dynamically via JS -->
                </div>
            </div>

            <button class="secondary-btn" onclick="openMainMenu()" style="margin-top: 1rem; width: 100%;">Вернуться в меню</button>
        </div>

        <div class="main-content" id="mapContainer">
            <canvas id="mapCanvas"></canvas>
            <div id="customTooltip"></div>
        </div>
        <input type="hidden" id="designModeSelect" value="game" />
    </div>

    <script src="js/app.js?v=4"></script>
</body>
</html>'''

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html_code)

print("Done")
