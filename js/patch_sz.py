with open('app.js', 'r', encoding='utf-8') as f:
    js_code = f.read()

start_idx = js_code.find('window.selectZone = function(zone) {')
end_idx = js_code.find('window.selectTemplate = async function(key, btnElem) {')

if start_idx != -1 and end_idx != -1:
    new_logic = '''window.selectZone = function(zone) {
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
        
        // Friendly name
        let btnName = key;
        let parts = key.split('_');
        if (parts.length >= 2) {
            btnName = parts.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }
        
        btn.textContent = btnName;
        btn.onclick = () => window.selectTemplate(key, btn);
        container.appendChild(btn);
    });
    
    if(keys.length > 0) {
        window.selectTemplate(keys[0], container.firstChild);
    }
};

'''
    js_code = js_code[:start_idx] + new_logic + js_code[end_idx:]
    with open('app.js', 'w', encoding='utf-8') as f:
        f.write(js_code)
    print("Replaced selectZone")
else:
    print("Could not find boundaries")
