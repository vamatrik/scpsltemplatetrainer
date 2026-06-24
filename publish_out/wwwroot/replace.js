const fs = require("fs");
let content = fs.readFileSync("js/app.js", "utf8");

// 1. State changes
content = content.replace(/let navStartRoom = null;\r?\nlet navEndRoom = null;/g, "let navStartRooms = [];\nlet navEndRooms = [];\nlet favoriteRooms = JSON.parse(localStorage.getItem('favRooms') || '[]');\nlet favoriteColor = localStorage.getItem('favColor') || '#d946ef';");

// 2. Favorites functions
const favCode = `
window.openFavorites = function() {
    closeMenu();
    document.getElementById('settingsModal').classList.remove('hidden');
    document.getElementById('favoritesView').classList.remove('hidden');
    document.getElementById('menuView').classList.add('hidden');
    document.getElementById('favColorPicker').value = favoriteColor;
    renderFavoritesList();
    setupAutocomplete('favInput', 'favDropdown', 'fav');
};
window.updateFavColor = function() {
    favoriteColor = document.getElementById('favColorPicker').value;
    localStorage.setItem('favColor', favoriteColor);
    drawCanvas();
};
window.renderFavoritesList = function() {
    const list = document.getElementById('favoritesList');
    list.innerHTML = '';
    favoriteRooms.forEach((fav, i) => {
        let div = document.createElement('div');
        div.className = 'flex justify-between items-center bg-slate-800 p-2 rounded';
        div.innerHTML = \`<span class="text-slate-200 text-sm">\${fav.name}</span>
                         <button class="secondary-btn" style="border-color: #ef4444; color: #ef4444; padding: 0.25rem 0.5rem;" onclick="removeFavorite(\${i})">X</button>\`;
        list.appendChild(div);
    });
};
window.addFavoriteRoom = function() {
    const val = document.getElementById('favInput').value.trim().toLowerCase();
    if (val) {
        let r = findRoomByName(val);
        if (r) {
            let name = r.shortName || r.originalName;
            if (!favoriteRooms.find(f => f.name === name)) {
                favoriteRooms.push({name: name});
                localStorage.setItem('favRooms', JSON.stringify(favoriteRooms));
                renderFavoritesList();
                document.getElementById('favInput').value = '';
                drawCanvas();
            }
        }
    }
};
window.removeFavorite = function(i) {
    favoriteRooms.splice(i, 1);
    localStorage.setItem('favRooms', JSON.stringify(favoriteRooms));
    renderFavoritesList();
    drawCanvas();
};
`;
content = content.replace("function openNav() {", favCode + "\nfunction openNav() {");

// 3. Alternative UI
const altsCode = `
let altsCounts = { start: 1, end: 1, wp: {} };

window.addAlternativeInput = function(type, parentElement) {
    let count = 0;
    let container = null;
    let baseId = '';
    
    if (type === 'start') {
        if (altsCounts.start >= 3) return; // Max 2 alts
        count = altsCounts.start++;
        container = document.getElementById('startAltsContainer');
        baseId = 'start';
    } else if (type === 'end') {
        if (altsCounts.end >= 3) return;
        count = altsCounts.end++;
        container = document.getElementById('endAltsContainer');
        baseId = 'end';
    } else if (type.startsWith('wp_')) {
        let wpIdx = parseInt(type.split('_')[1]);
        if (!altsCounts.wp[wpIdx]) altsCounts.wp[wpIdx] = 1;
        if (altsCounts.wp[wpIdx] >= 3) return;
        count = altsCounts.wp[wpIdx]++;
        container = document.getElementById('wpAltsContainer_' + wpIdx);
        baseId = type;
    }
    
    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.gap = '0.5rem';
    div.style.marginTop = '0.5rem';
    div.style.marginLeft = '1rem';
    div.style.borderLeft = '2px solid #475569';
    div.style.paddingLeft = '0.5rem';
    
    let idSuffix = baseId + '_' + count;
    div.innerHTML = \`
        <div style="position: relative; flex: 1;">
            <input type="text" id="navInput_\${idSuffix}" class="styled-input w-full" placeholder="Альтернатива" autocomplete="off" />
            <div id="navDropdown_\${idSuffix}" class="absolute z-10 w-full bg-slate-800 border border-slate-600 rounded-lg shadow-xl shadow-black/50 mt-1 hidden overflow-hidden text-slate-200 text-sm"></div>
        </div>
        <button class="secondary-btn" onclick="selectNavRoom('\${idSuffix}')">На карте</button>
        <button class="secondary-btn" onclick="removeAlternativeInput(this, '\${type}')" style="border-color: #ef4444; color: #ef4444; padding: 0.5rem 0.75rem;">X</button>
    \`;
    container.appendChild(div);
    setupAutocomplete(\`navInput_\${idSuffix}\`, \`navDropdown_\${idSuffix}\`, idSuffix);
};

window.removeAlternativeInput = function(btn, type) {
    btn.parentElement.remove();
};
`;

content = content.replace("window.addWaypointInput = function() {", altsCode + "\nwindow.addWaypointInput = function() {");

content = content.replace(/id="navWpInput_\$\{wpIndex\}"/g, `id="navWpInput_${wpIndex}_0"`);
content = content.replace(/id="navWpDropdown_\$\{wpIndex\}"/g, `id="navWpDropdown_${wpIndex}_0"`);
content = content.replace(/selectNavRoom\('wp_\$\{wpIndex\}'\)/g, `selectNavRoom('wp_${wpIndex}_0')`);
content = content.replace(/setupAutocomplete\(`navWpInput_\$\{wpIndex\}`, `navWpDropdown_\$\{wpIndex\}`, `wp_\$\{wpIndex\}`\);/g, `setupAutocomplete(\`navWpInput_\${wpIndex}_0\`, \`navWpDropdown_\${wpIndex}_0\`, \`wp_\${wpIndex}_0\`);`);

// Replace waypoint HTML block to support alternatives
const newWpHtml = `
    div.innerHTML = \`
        <div style="display: flex; align-items: center; gap: 0.5rem; width: 100%;">
            <div style="position: relative; flex: 1;">
                <input type="text" id="navWpInput_\${wpIndex}_0" class="styled-input w-full" placeholder="Промежуточная \${wpIndex + 1}" autocomplete="off" />
                <div id="navWpDropdown_\${wpIndex}_0" class="absolute z-10 w-full bg-slate-800 border border-slate-600 rounded-lg shadow-xl shadow-black/50 mt-1 hidden overflow-hidden text-slate-200 text-sm"></div>
            </div>
            <button class="secondary-btn" onclick="selectNavRoom('wp_\${wpIndex}_0')">На карте</button>
            <button class="secondary-btn" style="padding: 0.5rem 0.75rem;" onclick="addAlternativeInput('wp_\${wpIndex}', this.parentElement.parentElement)">+</button>
            <button class="secondary-btn" onclick="removeWaypoint(\${wpIndex}, this.parentElement.parentElement)" style="border-color: #ef4444; color: #ef4444; padding: 0.5rem 0.75rem;">X</button>
        </div>
        <div id="wpAltsContainer_\${wpIndex}" style="display: flex; flex-direction: column; gap: 0.5rem; width: 100%;"></div>
    \`;
`;
content = content.replace(/div\.innerHTML = `[\s\S]*?`;/, newWpHtml);

// 4. Update clearNavRoute
content = content.replace("navStartRoom = null;\n    navEndRoom = null;", "navStartRooms = [];\n    navEndRooms = [];\n    altsCounts = { start: 1, end: 1, wp: {} };\n    document.getElementById('startAltsContainer').innerHTML = '';\n    document.getElementById('endAltsContainer').innerHTML = '';");
content = content.replace("document.getElementById('navStartInput').value = '';", "document.getElementById('navStartInput_0').value = '';");
content = content.replace("document.getElementById('navEndInput').value = '';", "document.getElementById('navEndInput_0').value = '';");

fs.writeFileSync("js/app.js", content, "utf8");
