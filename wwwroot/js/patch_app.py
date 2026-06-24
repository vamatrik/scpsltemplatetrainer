import re

with open('app.js', 'r', encoding='utf-8') as f:
    js_code = f.read()

# Replace fetchLayouts
new_fetch = '''async function fetchLayouts() {
    try {
        const res = await fetch('/api/templates_list');
        layoutDatabase = await res.json();
    } catch(e) {
        console.error("Failed to fetch templates list", e);
    }
}'''
js_code = re.sub(r'async function fetchLayouts\(\) \{.*?\n\}', new_fetch, js_code, flags=re.DOTALL)

# Replace selectZone
new_sz = '''window.selectZone = function(zone) {
    currentZone = zone === 'light' ? 'LightContainment' : (zone === 'heavy' ? 'HeavyContainment' : 'Entrance');
    document.querySelectorAll('.zone-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('btn_zone_' + zone).classList.add('active');
    
    const container = document.getElementById('templateButtons');
    container.innerHTML = '';
    
    if (!layoutDatabase || !layoutDatabase[currentZone]) return;
    
    const keys = layoutDatabase[currentZone];
    keys.forEach(key => {
        const btn = document.createElement('button');
        btn.className = 'template-btn';
        btn.textContent = key;
        btn.onclick = () => window.selectTemplate(key, btn);
        container.appendChild(btn);
    });
    
    if(keys.length > 0) {
        window.selectTemplate(keys[0], container.firstChild);
    }
};'''
js_code = re.sub(r'window\.selectZone = function\(zone\).*?if\(keys\.length > 0\) \{[^\}]*\}\s*\};', new_sz, js_code, flags=re.DOTALL)

# Replace selectTemplate and remove parseLayoutLines
new_st = '''window.selectTemplate = async function(key, btnElem) {
    document.querySelectorAll('.template-btn').forEach(b => b.classList.remove('active'));
    if(btnElem) btnElem.classList.add('active');
    
    try {
        let seed = Math.floor(Math.random() * 9999999);
        const res = await fetch(/api/template?zone=&template=&seed=);
        currentMapData = await res.json();
        processMapData();
    } catch(e) {
        console.error(e);
    }
};'''
# Remove selectTemplate and parseLayoutLines
js_code = re.sub(r'window\.selectTemplate = function\(key, btnElem\).*?window\.parseLayoutLines = function\(lines\) \{.*?drawCanvas\(\);\s*\};', new_st, js_code, flags=re.MULTILINE|re.DOTALL)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js_code)

print("Done app.js rewrite")
