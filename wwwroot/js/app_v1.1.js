let currentMapData = null;
let currentZone = 'LightContainment';

const roomAliases = {
    // LCZ
    'Lcz330': '330',
    'LczCheckpointB': 'Лифт B',
    'LczCheckpointA': 'Лифт A',
    'LczClassDSpawn': 'D блок',
    'Lcz914': '914',
    'LczToilets': 'Туалеты',
    'LczComputerRoom': 'PC-15',
    'LczArmory': 'Оружейка',
    'LczAirlock': 'AL-01/02',
    'Lcz173': '173',
    'LczGreenhouse': 'Оранжерея',
    'LczGlassroom': 'GR-18',
    
    // HCZ
    'HczCheckpointA': 'Лифт A',
    'HczCheckpointB': 'Лифт B',
    'HczWarhead': 'Боеголовка',
    'HczServers': 'Сервера',
    'Hcz939': '939',
    'HczTestroom': 'Теструм',
    'HczTesla': 'Тесла',
    'HczArmory': 'Оружейка',
    'Hcz049': '049',
    'Hcz096': '096',
    'Hcz106': '106',
    'HCZ_PipesMain': 'Трубы',
    'HczPipesMain': 'Трубы',
    'HczWaysideIncelerator': 'Мусоросжигатель',
    'HczWaysideIncinerator': 'Мусоросжигатель',
    'Hcz079': '079',
    'HczAcroamaticAbatement': 'Водопад',
    'Hcz127': '127',
    'HczRampTunnel': '',
    'HCZ_FunnyCorridor': 'Смех',
    'HCZ_JunkMain': 'Junk',
    'HczJunkMain': 'Junk',
    'HczMicroHID': 'Micro HID',
    
    // EZ
    'EzGateA': 'Гейт А',
    'EzGateB': 'Гейт В',
    'EzEvacShelter': 'Эвак. Убежище',
    'EzOfficeLarge': 'Офис',
    'EzOfficeSmall': '-1 эт. офис',
    'EzOfficeStoried': '2-эт. офис',
    'EzCollapsedTunnel': 'Обвал',
    'EzIntercom': 'Интерком',
    'EzCheckpoint': 'Проход на чек',
    'EzRedroom': 'Красная Комната'
};

const TEXTURE_MAPPING = {
    // LCZ
    'LczCurve': 'LCZ/LCZ_Curve.png',
    'LczStraight': 'LCZ/LCZ_Straight.png',
    'LczCross': 'LCZ/LCZ_Crossing.png',
    'LczThreeWay': 'LCZ/LCZ_ThreeWay.png',
    'LczEndroom': 'LCZ/LCZ_LargeEnd.png',
    'Lcz330': 'LCZ/LCZ_330.png',
    'Lcz914': 'LCZ/LCZ_914.png',
    'LczAirlock': 'LCZ/LCZ_Airlock.png',
    'LczArmory': 'LCZ/LCZ_Armory.png',
    'LczCheckpointB': 'LCZ/LCZ_Checkpoint.png',
    'LczCheckpointA': 'LCZ/LCZ_Checkpoint.png',
    'LczClassDSpawn': 'LCZ/LCZ_Long.png',
    'LczToilets': 'LCZ/LCZ_Toilets.png',
    'LczComputerRoom': 'LCZ/LCZ_PC15.png',
    'LczGlassroom': 'LCZ/LCZ_PC15.png',
    'Lcz173': 'LCZ/LCZ_LargeEnd.png',
    'LczGreenhouse': 'LCZ/LCZ_Wide.png',
    
    // HCZ
    'HczCurve': 'HCZ/HCZ_Curve.png',
    'HczStraight': 'HCZ/HCZ_Straight.png',
    'HczCross': 'HCZ/HCZ_Crossing.png',
    'HczThreeWay': 'HCZ/HCZ_ThreeWay.png',
    'HczEndroom': 'HCZ/HCZ_EndSmall.png',
    'HczCheckpointA': 'HCZ/HCZ_Elevators.png',
    'HczCheckpointB': 'HCZ/HCZ_Elevators.png',
    'HczWarhead': 'HCZ/HCZ_Nuke.png',
    'HczServers': 'HCZ/HCZ_ServerRoom.png',
    'Hcz939': 'HCZ/HCZ_939.png',
    'HczTestroom': 'HCZ/HCZ_Testroom.png',
    'HczTesla': 'HCZ/HCZ_Tesla.png',
    'HczAcroamaticAbatement': 'HCZ/HCZ_CrossingWater.png',
    'Hcz106': 'HCZ/HCZ_EndLarge.png',
    'HczRampTunnel': 'HCZ/HCZ_ThreeWay.png',
    'Hcz096': 'HCZ/HCZ_EndSmall.png',
    'HczArmory': 'HCZ/HCZ_Armory.png',
    'Hcz049': 'HCZ/HCZ_049.png',
    'HczWaysideIncinerator': 'HCZ/HCZ_Wayside.png',
    'Hcz079': 'HCZ/HCZ_EndLarge.png',
    'Hcz127': 'HCZ/HCZ_127.png',
    'HczMicroHID': 'HCZ/HCZ_Hid.png',
    'HczCheckpointToEntranceZone': 'HCZ/HCZ_Tesla.png',
    'HCZ_JunkMain': 'HCZ/HCZ_ThreeWayJunk.png',
    'HCZ_PipesMain': 'HCZ/HCZ_Straight_Pipe.png',
    'HCZ_FunnyCorridor': 'HCZ/HCZ_Straight.png',
    
    // EZ
    'EzCurve': 'EZ/EZ_Curve.png',
    'EzStraight': 'EZ/EZ_Straight.png',
    'EzCross': 'EZ/EZ_Crossing.png',
    'EzThreeWay': 'EZ/EZ_ThreeWay.png',
    'EzEndroom': 'EZ/EZ_NonGateEnd.png',
    'EzEvacShelter': 'EZ/EZ_NonGateEnd.png',
    'EzGateA': 'EZ/EZ_GateA.png',
    'EzGateB': 'EZ/EZ_GateB.png',
    'EzRedRoom': 'EZ/EZ_NonGateEnd.png',
    'EzRedroom': 'EZ/EZ_NonGateEnd.png',
    'EzOfficeSmall': 'EZ/EZ_Asymmetric.png',
    'EzOfficeLarge': 'EZ/EZ_Thicc.png',
    'EzOfficeStoried': 'EZ/EZ_Thicc.png',
    'EzCollapsedTunnel': 'EZ/EZ_Collapsed.png',
    'EzIntercom': 'EZ/EZ_Intercom.png',
    'EzCheckpoint': 'EZ/EZ_Checkpoint.png'
};

const TEXTURE_ROTATION = {
    'EzGateA': -90,
    'EzGateB': -90,
    'EzCollapsedTunnel': -90,
    'EzOfficeStoried': -90,
    'EzIntercom': -90,
    'EzEvacShelter': -90,
    'EzOfficeSmall': -90,
    'EzOfficeLarge': -90,
    'EzRedRoom': -90,
    'EzRedroom': -90,
    'EzThreeWay': -90,
    'EzStraight': -90,
    'EzCurve': -90,
    'EzCheckpoint': -90
};

const loadedImages = {};

function preloadImages() {
    for (const key in TEXTURE_MAPPING) {
        const img = new Image();
        img.onload = () => {
            if (typeof currentMapData !== 'undefined' && currentMapData) drawCanvas();
        };
        img.src = '/img/rooms/' + TEXTURE_MAPPING[key];
        loadedImages[key] = img;
    }
}

// Map the texture to a specific color (tinting)
function getTintedImage(img, hexColor) {
    if (!img.complete || img.naturalWidth === 0) return img;
    
    // We cache tinted images to avoid lag
    const cacheKey = img.src + '_' + hexColor;
    if (loadedImages[cacheKey]) return loadedImages[cacheKey];
    
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    ctx.drawImage(img, 0, 0);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = hexColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    loadedImages[cacheKey] = canvas;
    return canvas;
}

const CELL_SIZE = 120;
const LINE_WIDTH = 24;

const DIR_N = 0;
const DIR_E = 1;
const DIR_S = 2;
const DIR_W = 3;

const BaseShapes = {
    'Straight': [DIR_E, DIR_W],
    'Curve': [DIR_S, DIR_E],
    'TShape': [DIR_N, DIR_S, DIR_W],
    'XShape': [DIR_N, DIR_E, DIR_S, DIR_W],
    'Endroom': [DIR_W]
};

const BaseShapeOverrides = {
    'LczClassDSpawn': [DIR_E]
};

let cameraX = 0;
let cameraY = 0;
let zoomScale = 1;
let isDragging = false;
let startDragX = 0;
let startDragY = 0;
let mouseMoved = false;
let processedRooms = [];

// Navigator State
let navState = 'none'; // 'start_X', 'end_X', 'wp_X_Y', 'fav', 'none'
let navStartRooms = [];
let navEndRooms = [];
let navPath = [];
let navWaypoints = [];
let waypointCount = 0;
let altsCounts = { start: 1, end: 1, wp: {} };

// Favorites State
let favoriteRooms = JSON.parse(localStorage.getItem('favRooms') || '[]');
let favoriteColor = localStorage.getItem('favColor') || '#d946ef';

// Initial Setup
const lastSeed = localStorage.getItem('lastSeed');
if (lastSeed) {
    document.getElementById('seedInput').value = lastSeed;
}

        
// generateBtn logic removed
document.querySelectorAll('.zone-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const zone = e.currentTarget.getAttribute('data-zone');
        if (!zone) return; // Ignore buttons like "Р вЂ”Р В°Р С”РЎР‚РЎвЂ№РЎвЂљРЎРЉ" that have .zone-btn but no data-zone
        document.querySelectorAll('.zone-btn').forEach(b => {
            if (b.hasAttribute('data-zone')) b.classList.remove('active');
        });
        e.currentTarget.classList.add('active');
        currentZone = zone;
        resetCamera();
        processMapData();
    });
});

function resetCamera() {
    cameraX = 0;
    cameraY = 0;
    zoomScale = 1;
}

function getBaseDoors(name, shape) {
    return BaseShapeOverrides[name] || BaseShapes[shape] || [];
}

function getGlobalDoors(name, shape, rot, zone) {
    let base = getBaseDoors(name, shape);
    
    // Calculate effective rotation just like drawing
    let effectiveRot = rot;
    if (zone === 'HeavyContainment' || zone === 'Entrance') {
        effectiveRot = (effectiveRot + 180) % 360;
    }
    
    let shift = Math.round(effectiveRot / 90) % 4;
    if (shift < 0) shift += 4;
    return base.map(d => (d + shift) % 4);
}

function processMapData() {
    const wrapper = document.getElementById('mapContainer');
    if (!currentMapData) return;
    
    let roomsRaw = [];
    if (currentZone === 'All') {
        let hcz = JSON.parse(JSON.stringify(currentMapData['HeavyContainment'] || []));
        let ez = JSON.parse(JSON.stringify(currentMapData['Entrance'] || []));
        let lcz = JSON.parse(JSON.stringify(currentMapData['LightContainment'] || []));
        
        hcz.forEach((r, i) => {
            r.roomIndex = i;
            r.zoneName = 'HeavyContainment';
            r.interpretation.coords.x = -r.interpretation.coords.x;
            r.interpretation.coords.y = -r.interpretation.coords.y;
        });
        ez.forEach((r, i) => {
            r.roomIndex = i;
            r.zoneName = 'Entrance';
            r.interpretation.coords.x = -r.interpretation.coords.x;
            r.interpretation.coords.y = -r.interpretation.coords.y;
        });

        // Align EZ to HCZ
        let hczChecks = hcz.filter(r => r.chosenCandidate.name === 'HczCheckpointToEntranceZone');
        let ezChecks = ez.filter(r => r.chosenCandidate.name === 'HczCheckpointToEntranceZone');

        if (hczChecks.length === 2 && ezChecks.length === 2) {
            let H1 = hczChecks[0].interpretation.coords;
            let H2 = hczChecks[1].interpretation.coords;
            let E1 = ezChecks[0].interpretation.coords;
            let E2 = ezChecks[1].interpretation.coords;

            function rotatePoint(p, angle) {
                if (angle === 0) return {x: p.x, y: p.y};
                if (angle === 90) return {x: -p.y, y: p.x};
                if (angle === 180) return {x: -p.x, y: -p.y};
                if (angle === 270) return {x: p.y, y: -p.x};
                return {x: p.x, y: p.y};
            }

            let pairings = [
                {h1: H1, h2: H2},
                {h1: H2, h2: H1}
            ];

            let bestTransform = null;
            let minOverlap = 9999;

            pairings.forEach(p => {
                let aH = Math.atan2(p.h2.y - p.h1.y, p.h2.x - p.h1.x);
                let aE = Math.atan2(E2.y - E1.y, E2.x - E1.x);
                let angRad = aH - aE;
                let angDeg = Math.round((angRad * 180 / Math.PI + 360) % 360);

                let rotE1 = rotatePoint(E1, angDeg);
                let baseTx = p.h1.x - rotE1.x;
                let baseTy = p.h1.y - rotE1.y;

                let isVertical = ((hczChecks[0].interpretation.rotationY + 180) % 180 === 90);
                let validShifts = isVertical ? [{dx:0, dy:1}, {dx:0, dy:-1}] : [{dx:1, dy:0}, {dx:-1, dy:0}];

                let bestShift = null;
                let localMinOverlap = 9999;

                validShifts.forEach(shift => {
                    let testTx = baseTx + shift.dx;
                    let testTy = baseTy + shift.dy;
                    let overlapCount = 0;
                    ez.forEach(er => {
                        let rp = rotatePoint(er.interpretation.coords, angDeg);
                        let finalX = Math.round(rp.x + testTx);
                        let finalY = Math.round(rp.y + testTy);
                        let hasOverlap = hcz.some(hr => hr.interpretation.coords.x === finalX && hr.interpretation.coords.y === finalY);
                        if (hasOverlap) overlapCount++;
                    });
                    if (overlapCount < localMinOverlap) {
                        localMinOverlap = overlapCount;
                        bestShift = { tx: testTx, ty: testTy };
                    }
                });

                if (localMinOverlap < minOverlap) {
                    minOverlap = localMinOverlap;
                    bestTransform = { angle: angDeg, tx: Math.round(bestShift.tx), ty: Math.round(bestShift.ty) };
                }
            });

            if (bestTransform) {
                ez.forEach(er => {
                    let rp = rotatePoint(er.interpretation.coords, bestTransform.angle);
                    er.interpretation.coords.x = rp.x + bestTransform.tx;
                    er.interpretation.coords.y = rp.y + bestTransform.ty;
                    er.interpretation.rotationY = (er.interpretation.rotationY + bestTransform.angle) % 360;
                    
                    if (er.chosenCandidate.name === 'HczCheckpointToEntranceZone') {
                        er.chosenCandidate.originalName = 'EzCheckpoint';
                    }
                });
            }
        }
 
        let combinedHE = [...hcz, ...ez];
        if (combinedHE.length > 0 && lcz.length > 0) {
            let minX_HE = Math.min(...combinedHE.map(r => r.interpretation.coords.x));
            let maxX_HE = Math.max(...combinedHE.map(r => r.interpretation.coords.x));
            let maxY_HE = Math.max(...combinedHE.map(r => r.interpretation.coords.y));
            let center_HE = (minX_HE + maxX_HE) / 2;

            let minX_L = Math.min(...lcz.map(r => r.interpretation.coords.x));
            let maxX_L = Math.max(...lcz.map(r => r.interpretation.coords.x));
            let minY_L = Math.min(...lcz.map(r => r.interpretation.coords.y));
            let center_L = (minX_L + maxX_L) / 2;

            let offsetX = Math.round(center_HE - center_L);
            let offsetY = Math.round(maxY_HE - minY_L + 3);

            lcz.forEach(r => {
                r.interpretation.coords.x += offsetX;
                r.interpretation.coords.y += offsetY;
            });
        }
        
        lcz.forEach((r, i) => { r.roomIndex = i; r.zoneName = 'LightContainment'; });
        roomsRaw = [...hcz, ...ez, ...lcz];
    } else {
        if (!currentMapData[currentZone]) return;
        roomsRaw = JSON.parse(JSON.stringify(currentMapData[currentZone]));
        roomsRaw.forEach((r, i) => {
            r.roomIndex = i;
            r.zoneName = currentZone;
        });
        
        if (currentZone === 'HeavyContainment' || currentZone === 'Entrance') {
            roomsRaw.forEach(r => {
                r.interpretation.coords.x = -r.interpretation.coords.x;
                r.interpretation.coords.y = -r.interpretation.coords.y;
                if (currentZone === 'Entrance' && r.chosenCandidate.name === 'HczCheckpointToEntranceZone') {
                    r.chosenCandidate.originalName = 'EzCheckpoint';
                }
            });
        }
    }
    
    if (roomsRaw.length === 0) return;

    const minX = Math.min(...roomsRaw.map(r => r.interpretation.coords.x));
    const maxX = Math.max(...roomsRaw.map(r => r.interpretation.coords.x));
    const minY = Math.min(...roomsRaw.map(r => r.interpretation.coords.y));
    const maxY = Math.max(...roomsRaw.map(r => r.interpretation.coords.y));

    const mapWidth = (maxX - minX + 1) * CELL_SIZE;
    const mapHeight = (maxY - minY + 1) * CELL_SIZE;
    
    // Auto-fit zoom so the map doesn't get drawn off-screen
    const padding = 100;
    const scaleX = (wrapper.clientWidth - padding) / mapWidth;
    const scaleY = (wrapper.clientHeight - padding) / mapHeight;
    zoomScale = Math.min(1, Math.min(scaleX, scaleY)); // Fit inside the window, but don't over-zoom

    cameraX = (wrapper.clientWidth - mapWidth * zoomScale) / 2;
    cameraY = (wrapper.clientHeight - mapHeight * zoomScale) / 2;

    let checkY = [];
    roomsRaw.forEach(r => {
        if (r.chosenCandidate.name === 'HczCheckpointToEntranceZone') {
            checkY.push(r.interpretation.coords.y);
        }
    });
    checkY.sort((a,b) => a - b);
    let upperY = checkY[checkY.length - 1];

    const roomMap = {};
    roomsRaw.forEach(r => {
        roomMap[r.interpretation.coords.x + ',' + r.interpretation.coords.y] = r;
    });

    processedRooms = roomsRaw.map(room => {
        const x = room.interpretation.coords.x;
        const y = room.interpretation.coords.y;
        
        const cx = (x - minX) * CELL_SIZE + CELL_SIZE / 2;
        const cy = (maxY - y) * CELL_SIZE + CELL_SIZE / 2;
        
        let originalName = room.chosenCandidate.originalName || room.chosenCandidate.name;
        let shape = room.chosenCandidate.shape;
        let rot = room.interpretation.rotationY;
        let zone = room.zoneName;
        
        let effectiveRot = rot;
        if (zone === 'HeavyContainment' || zone === 'Entrance') {
            effectiveRot = (effectiveRot + 180) % 360;
        }

        let globalDoors = getGlobalDoors(originalName, shape, rot, zone);
        let baseDoors = getBaseDoors(originalName, shape);
        
        let shortName = roomAliases[originalName] !== undefined ? roomAliases[originalName] : originalName;
        if (originalName === 'Unnamed') shortName = '';
        if (originalName === 'HczCheckpointToEntranceZone') {
            if (y === upperY) shortName = 'Верхний чек';
            else shortName = 'Нижний чек';
        }

        return {
            x, y, cx, cy, originalName, shortName, shape, rot, effectiveRot, baseDoors, globalDoors, neighborMap: roomMap, zoneName: zone, roomIndex: room.roomIndex
        };
    });

    const refreshRoom = (oldRoom) => {
        if (!oldRoom) return null;
        return processedRooms.find(r => r.roomIndex === oldRoom.roomIndex && r.zoneName === oldRoom.zoneName) || oldRoom;
    };
    if (navStartRooms && navStartRooms.length > 0) navStartRooms = navStartRooms.map(p => refreshRoom(p));
    if (navEndRooms && navEndRooms.length > 0) navEndRooms = navEndRooms.map(p => refreshRoom(p));
    if (navWaypoints && navWaypoints.length > 0) {
        navWaypoints = navWaypoints.map(arr => arr ? arr.map(p => refreshRoom(p)) : undefined);
    }
    if (navPath && navPath.length > 0) {
        navPath = navPath.map(p => refreshRoom(p));
    }

    drawCanvas();
}

function drawLocalShape(ctx, r, color) {
    const name = r.originalName;
    const shape = r.shape;
    const base = r.baseDoors;
    const H = CELL_SIZE / 2;
    const W = LINE_WIDTH / 2;
    
    // Set standard drawing styles
    ctx.strokeStyle = color;
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';
    
    // Draw default connections first, unless they have very custom line overrides
    if (name !== 'HczAcroamaticAbatement' && name !== 'HczWaysideIncinerator' && name !== 'HczTestroom') {
        ctx.beginPath();
        if (base.includes(DIR_N)) { ctx.moveTo(0, 0); ctx.lineTo(0, -H); }
        if (base.includes(DIR_S)) { ctx.moveTo(0, 0); ctx.lineTo(0, H); }
        if (base.includes(DIR_E)) { ctx.moveTo(0, 0); ctx.lineTo(H, 0); }
        if (base.includes(DIR_W)) { ctx.moveTo(0, 0); ctx.lineTo(-H, 0); }
        ctx.stroke();
    }

    // Default center fill
    if (name !== 'HczAcroamaticAbatement' && name !== 'HczWaysideIncinerator' && name !== 'HczTestroom') {
        ctx.fillStyle = color;
        ctx.fillRect(-W, -W, LINE_WIDTH, LINE_WIDTH);
    }

    // Use solid zone color for all custom room expansions
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    switch(name) {
        // 1. Checkpoints
        case 'LczCheckpointA':
        case 'LczCheckpointB':
        case 'HczCheckpointA':
        case 'HczCheckpointB':
            // Elevators are Endrooms (Base W).
            ctx.fillRect(0, -14, 20, 28); // Connection to wings
            ctx.fillRect(20, -35, 25, 70); // Larger elevator wings
            break;
            
        case 'HczCheckpointToEntranceZone':
            // Straight Base: E, W. Room on top.
            ctx.fillRect(-30, 12, 60, 25); // Room flipped to the visual top, reduced depth
            break;
            
        // 2. Airlock
        case 'LczAirlock':
            ctx.fillRect(-25, -20, 50, 40);
            break;
            
        // 3. 914
        case 'Lcz914':
            ctx.beginPath();
            ctx.moveTo(30, -35);
            ctx.lineTo(-5, -35);
            ctx.lineTo(-25, -15);
            ctx.lineTo(-25, 15);
            ctx.lineTo(-5, 35);
            ctx.lineTo(30, 35);
            ctx.closePath();
            ctx.fill();
            break;
            
        // 4. D-Block
        case 'LczClassDSpawn':
            // Base E. Expand West.
            ctx.fillRect(-30, -20, 50, 40);
            break;
            
        // 5. PC-15
        case 'LczComputerRoom':
            ctx.fillRect(-15, -35, 45, 70);
            break;
            
        // 6. Toilets
        case 'LczToilets':
            ctx.fillRect(-15, -35, 40, 50);
            break;
            
        // 7. GreenHouse
        case 'LczGreenhouse':
            // Straight Base: E, W
            // Thicker than normal corridor (width 40 instead of 25)
            ctx.fillRect(-H, -20, CELL_SIZE, 40);
            break;
            
        case 'HCZ_PipesMain':
            // Straight Base: E, W
            // Solid room filling most of the space, 5px margin
            ctx.fillRect(-45, -45, 90, 90);
            // Connections to doors
            ctx.fillRect(-50, -12.5, 5, 25);
            ctx.fillRect(45, -12.5, 5, 25);
            
            // Hole in the center: long side perpendicular to corridor (Y axis)
            ctx.clearRect(-10, -20, 20, 40);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.fillRect(-10, -20, 20, 40);
            ctx.fillStyle = color; // Restore color
            break;
            
        case 'HCZ_JunkMain':
            // Big room
            ctx.fillRect(-35, -35, 70, 70);
            break;
            
        // 8. HczArmory (Base N, S, W)
        case 'HczArmory':
            ctx.fillRect(0, -15, 30, 30);
            break;
            
        // 9. Tesla
        case 'HczTesla':
            ctx.fillRect(-45, -20, 90, 40); // Extended corridor like offices
            break;
            
        // 10. RampTunnel (TShape: N, S, W) -> Expand East
        case 'HczRampTunnel':
            ctx.fillRect(5, -15, 30, 30);
            break;
            
        // 11. Incinerator (Curve: S, E)
        case 'HczWaysideIncinerator':
            ctx.lineWidth = LINE_WIDTH;
            ctx.beginPath();
            // True 3/4 arc connecting E to S via NW (counter-clockwise)
            ctx.arc(0, 0, H, 0, Math.PI / 2, true);
            ctx.stroke();
            break;
            
        // 12. 049
        case 'Hcz049':
            // Straight Base: E, W. Flush elevator.
            ctx.fillRect(-15, -37, 30, 25);
            break;
            
        // 13. Testroom
        case 'HczTestroom':
            // Perimeter path with a 5px margin (spans from -45 to 45 with line width 16)
            ctx.lineWidth = 16;
            ctx.lineJoin = 'miter';
            ctx.strokeRect(-37, -37, 74, 74); 
            
            // Connections to the East and West doors
            ctx.fillRect(-50, -8, 13, 16);
            ctx.fillRect(37, -8, 13, 16);
            
            // Central pit
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.fillRect(-21, -21, 42, 42);

            break;
            
        // 14. 939 (Curve: S, E)
        case 'Hcz939':
            ctx.fillRect(-45, -45, 55, 55); // Spans slightly past the center (local Top-Left to slightly Bottom-Right)
            break;
            
        // 15. Warhead (TShape: N, S, W) -> Elevators East
        case 'HczWarhead':
            ctx.fillRect(-35, -35, 70, 70); // Base square
            // Elevators centered on the East corners (35, -35) and (35, 35)
            ctx.fillRect(20, -47.5, 30, 25); 
            ctx.fillRect(20, 22.5, 30, 25);
            break;
            
        // 16. Acroamatic Abatement (XShape)
        case 'HczAcroamaticAbatement':
            ctx.save();
            ctx.rotate(Math.PI);
            ctx.lineWidth = LINE_WIDTH;
            ctx.beginPath();
            ctx.moveTo(-H, 0); ctx.lineTo(0, H);  // W to S
            ctx.moveTo(-H, 0); ctx.lineTo(0, -H); // W to N
            ctx.moveTo(H, 0); ctx.lineTo(0, H);   // E to S
            ctx.stroke();
            ctx.restore();
            break;
            
        // 17. 127 (TShape: N, S, W) -> Branch East
        case 'Hcz127':
            ctx.beginPath();
            ctx.moveTo(-30, -45);
            ctx.lineTo(30, -45);
            ctx.lineTo(45, -30);
            ctx.lineTo(45, 30);
            ctx.lineTo(30, 45);
            ctx.lineTo(-30, 45);
            ctx.lineTo(-45, 30);
            ctx.lineTo(-45, -30);
            ctx.closePath();
            ctx.fill();
            break;
            
        case 'HczMicroHID':
            // Base straight (E-W), but thicker.
            ctx.fillRect(-H, -22, CELL_SIZE, 44);
            break;
            
        // 18. Servers (Straight: E, W)
        case 'HczServers':
            ctx.fillRect(-35, -20, 70, 40); // Enlarged rectangle
            break;
            
        // 19. GateA / GateB (Endroom: W)
        case 'EzGateA':
            ctx.fillRect(-25, -25, 50, 50);
            ctx.fillRect(5, -35, 25, 15);
            ctx.fillRect(5, 20, 25, 15);
            break;
            
        case 'EzGateB':
            ctx.fillRect(-25, -25, 50, 50);
            ctx.fillRect(-15, -40, 30, 15); // Thickening reflected to the other side
            break;
            
        // 20. CollapsedTunnel
        case 'EzCollapsedTunnel':
            ctx.fillRect(-15, -10, 30, 20);
            break;
            
        // 21. Offices
        case 'EzOfficeSmall':
        case 'EzOfficeStoried':
            ctx.fillRect(-45, -20, 90, 40); // Extended corridor starting near ends
            break;
            
        case 'EzOfficeLarge':
            ctx.fillRect(-35, -45, 70, 90);
            break;
            
        // 22. Intercom (Assume Curve: S, E)
        case 'EzIntercom':
            ctx.fillRect(-45, -45, 50, 50);
            break;

        default:
            // Standard fallback for generic Endroom and special ones without explicit rules
            if (shape === 'Endroom' && !name.includes('Checkpoint')) {
                ctx.fillStyle = color;
                ctx.fillRect(-25, -25, 50, 50);
            }
            break;
    }
}

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
        div.innerHTML = `<span class="text-slate-200 text-sm">${fav.name}</span>
                         <button class="secondary-btn" style="border-color: #ef4444; color: #ef4444; padding: 0.25rem 0.5rem;" onclick="removeFavorite(${i})">X</button>`;
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

function adjustColor(colorHex, percent) {
    var num = parseInt(colorHex.replace("#",""), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        G = (num >> 8 & 0x00FF) + amt,
        B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
}

function getHighlightColor(zoneName, shape) {
    let zoneKey;
    if (zoneName === 'LightContainment') zoneKey = 'LCZ';
    else if (zoneName === 'HeavyContainment') zoneKey = 'HCZ';
    else if (zoneName === 'Entrance') zoneKey = 'EZ';
    else return null;

    let shapeKey = shape;
    if (shape === 'Endroom') shapeKey = 'DeadEnd';
    if (shape === 'XShape') shapeKey = 'Cross';
    
    let hlConfig = localStorage.getItem('hl_' + zoneKey + '_' + shapeKey);
    if (hlConfig === 'true') {
        let baseColor = localStorage.getItem('highlightColor') || '#8b5cf6';
        let shadeOffsets = { 'Straight': 0, 'Curve': -15, 'TShape': 15, 'Cross': 30, 'DeadEnd': -30 };
        return adjustColor(baseColor, shadeOffsets[shapeKey] || 0);
    }
    return null;
}

function drawCanvas() {
    if (processedRooms.length === 0) return;

    const style = getComputedStyle(document.documentElement);
    const colorLcz = style.getPropertyValue('--lcz-color').trim() || '#f59e0b';
    const colorHcz = style.getPropertyValue('--hcz-color').trim() || '#ef4444';
    const colorEz = style.getPropertyValue('--ez-color').trim() || '#10b981';
    const colorText = style.getPropertyValue('--text-primary').trim() || '#f8fafc';

    const canvas = document.getElementById('mapCanvas');
    const wrapper = document.getElementById('mapContainer');
    
    // Fix for High-DPI screens (Retina)
    const dpr = window.devicePixelRatio || 1;
    canvas.width = wrapper.clientWidth * dpr;
    canvas.height = wrapper.clientHeight * dpr;
    canvas.style.width = `${wrapper.clientWidth}px`;
    canvas.style.height = `${wrapper.clientHeight}px`;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    ctx.clearRect(0, 0, wrapper.clientWidth, wrapper.clientHeight);
    ctx.save();
    ctx.translate(cameraX, cameraY);
    ctx.scale(zoomScale, zoomScale);

    const isNavHighlight = navPath && navPath.length > 0 && document.getElementById('navHighlightCheck')?.checked;
    const inRoute = (r) => navPath && navPath.some(p => p.roomIndex === r.roomIndex && p.zoneName === r.zoneName);

    processedRooms.forEach(r => {
        ctx.globalAlpha = (isNavHighlight && !inRoute(r)) ? 0.2 : 1.0;
        // First draw green connection dots to appear UNDER the rooms
        const checkNeighbor = (nx, ny, myDir, neighborDir, dx, dy) => {
            if (!r.globalDoors.includes(myDir)) return;
            let neighbor = r.neighborMap[nx + ',' + ny];
            if (neighbor) {
                let nDoors = getGlobalDoors(neighbor.chosenCandidate.name, neighbor.chosenCandidate.shape, neighbor.interpretation.rotationY, neighbor.zoneName);
                if (nDoors.includes(neighborDir)) {
                    ctx.fillStyle = '#10b981';
                    ctx.beginPath();
                    ctx.arc(r.cx + dx, r.cy + dy, 6, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#0f172a';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }
        };
        checkNeighbor(r.x + 1, r.y, DIR_E, DIR_W, CELL_SIZE/2, 0);  // East
        checkNeighbor(r.x, r.y - 1, DIR_S, DIR_N, 0, CELL_SIZE/2);  // South
    });

    processedRooms.forEach(r => {
        ctx.globalAlpha = (isNavHighlight && !inRoute(r)) ? 0.2 : 1.0;
        let color = '#3b82f6';
        if (r.zoneName === 'HeavyContainment') color = colorHcz;
        if (r.zoneName === 'Entrance') color = colorEz;
        if (r.zoneName === 'LightContainment') color = colorLcz;
        
        let hlColor = getHighlightColor(r.zoneName, r.shape);
        if (hlColor) color = hlColor;
        
        let isFav = favoriteRooms.find(f => f.name === (r.shortName || r.originalName));
        if (isFav) {
            color = favoriteColor;
        }
        
        const cx = r.cx;
        const cy = r.cy;
        
        ctx.save();
        ctx.translate(cx, cy);
        
        const mode = document.getElementById('designModeSelect')?.value || 'basic';
        
        if (mode === 'game') {
            const showSpecial = document.getElementById('showSpecialRoomsCheck')?.checked;
            let key = showSpecial ? r.originalName : '';
            let dynamicRot = 0;
            
            if (!showSpecial) {
                let prefix = '';
                if (r.zoneName === 'LightContainment') prefix = 'Lcz';
                if (r.zoneName === 'HeavyContainment') prefix = 'Hcz';
                if (r.zoneName === 'Entrance') prefix = 'Ez';
                
                // Keep checkpoints even in generic mode ONLY FOR ENTRANCE ZONE
                if (r.originalName === 'EzCheckpoint' || r.originalName === 'HczCheckpointToEntranceZone' || r.originalName === 'LczClassDSpawn') {
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
                        dynamicRot = -90;
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
                
                ctx.save();
                const tRot = TEXTURE_ROTATION[key] || 0;
                if (tRot !== 0) ctx.rotate(tRot * Math.PI / 180);
                
                if (dynamicRot !== 0) ctx.rotate(dynamicRot * Math.PI / 180);
                
                const tinted = getTintedImage(img, color);
                
                // Draw scaled to CELL_SIZE
                const sSize = CELL_SIZE;
                ctx.drawImage(tinted, -sSize/2, -sSize/2, sSize, sSize);
                ctx.restore();
            } else {
                // Fallback Box
                ctx.fillStyle = 'rgba(30, 41, 59, 0.5)';
                ctx.fillRect(-CELL_SIZE/2 + 2, -CELL_SIZE/2 + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                ctx.lineWidth = LINE_WIDTH;
                ctx.rotate(r.effectiveRot * Math.PI / 180);
                drawLocalShape(ctx, r, color);
            }
        } else {
            // Background Box for room bounds
            ctx.fillStyle = 'rgba(30, 41, 59, 0.5)';
            ctx.fillRect(-CELL_SIZE/2 + 2, -CELL_SIZE/2 + 2, CELL_SIZE - 4, CELL_SIZE - 4);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 1;
            ctx.strokeRect(-CELL_SIZE/2 + 2, -CELL_SIZE/2 + 2, CELL_SIZE - 4, CELL_SIZE - 4);
            
            ctx.lineWidth = LINE_WIDTH;
            
            // Rotate to local coordinates
            ctx.rotate(r.effectiveRot * Math.PI / 180);
            
            drawLocalShape(ctx, r, color);
        }
        
        if (r.originalName === 'HczCheckpointToEntranceZone') {
            ctx.fillStyle = '#22c55e'; // Green
            ctx.beginPath();
            ctx.moveTo(120, -10);
            ctx.lineTo(90, -10);
            ctx.lineTo(90, -20);
            ctx.lineTo(60, 0); // Tip at local right (visual left)
            ctx.lineTo(90, 20);
            ctx.lineTo(90, 10);
            ctx.lineTo(120, 10);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else if (r.originalName === 'EzCheckpoint') {
            ctx.fillStyle = '#ef4444'; // Red
            ctx.beginPath();
            ctx.moveTo(-120, -10);
            ctx.lineTo(-90, -10);
            ctx.lineTo(-90, -20);
            ctx.lineTo(-60, 0); // Tip at local -60 (visual right edge)
            ctx.lineTo(-90, 20);
            ctx.lineTo(-90, 10);
            ctx.lineTo(-120, 10);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        ctx.restore();
    });

    // Draw Route Dotted Line
    const isNavDotted = navPath && navPath.length > 0 && document.getElementById('navDottedCheck')?.checked;
    
    const OFFSET_DIST = 8;
    function getNormal(p1, p2) {
        let dx = p2.cx - p1.cx;
        let dy = p2.cy - p1.cy;
        let len = Math.hypot(dx, dy);
        return len === 0 ? {x: 0, y: 0} : {x: -(dy/len), y: dx/len};
    }

    if (isNavDotted) {
        ctx.save();
        ctx.globalAlpha = 1.0;
        ctx.lineWidth = 6;
        ctx.strokeStyle = document.getElementById('routeColorPicker')?.value || '#0ea5e9';
        ctx.setLineDash([15, 10]);
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        
        let segments = [];
        for (let i = 0; i < navPath.length - 1; i++) {
            let r1 = navPath[i];
            let r2 = navPath[i + 1];
            let p1 = processedRooms.find(r => r.roomIndex === r1.roomIndex && r.zoneName === r1.zoneName);
            let p2 = processedRooms.find(r => r.roomIndex === r2.roomIndex && r.zoneName === r2.zoneName);
            
            if (p1 && p2) {
                let isCross = Math.abs(p1.cx - p2.cx) > CELL_SIZE*1.5 || Math.abs(p1.cy - p2.cy) > CELL_SIZE*1.5;
                if (!isCross) {
                    let n = getNormal(p1, p2);
                    segments.push({
                        type: 'normal',
                        A: {x: p1.cx + n.x * OFFSET_DIST, y: p1.cy + n.y * OFFSET_DIST},
                        B: {x: p2.cx + n.x * OFFSET_DIST, y: p2.cy + n.y * OFFSET_DIST},
                        v: {x: p2.cx - p1.cx, y: p2.cy - p1.cy},
                        n: n, p1: p1, p2: p2
                    });
                } else {
                    segments.push({ type: 'cross', p1: p1, p2: p2 });
                }
            } else {
                segments.push({ type: 'break' });
            }
        }

        ctx.beginPath();
        let moving = true;
        for (let i = 0; i < segments.length; i++) {
            let s = segments[i];
            if (s.type === 'break') {
                moving = true;
                ctx.stroke();
                ctx.beginPath();
                continue;
            }
            if (s.type === 'cross') {
                ctx.stroke();
                ctx.beginPath();
                ctx.globalAlpha = 0.3;
                ctx.moveTo(s.p1.cx, s.p1.cy);
                ctx.lineTo(s.p2.cx, s.p2.cy);
                ctx.stroke();
                ctx.beginPath();
                ctx.globalAlpha = 1.0;
                moving = true;
                continue;
            }
            
            if (moving) {
                ctx.moveTo(s.A.x, s.A.y);
                moving = false;
            } else {
                let prev = segments[i-1];
                if (prev && prev.type === 'normal') {
                    let dot = prev.v.x * s.v.x + prev.v.y * s.v.y;
                    let cross = prev.v.x * s.v.y - prev.v.y * s.v.x;
                    
                    if (Math.abs(cross) > 1e-6) {
                        let ix = (Math.abs(prev.v.x) < 1e-6) ? prev.A.x : s.A.x;
                        let iy = (Math.abs(prev.v.y) < 1e-6) ? prev.A.y : s.A.y;
                        ctx.lineTo(ix, iy);
                    } else if (dot < 0) {
                        ctx.lineTo(prev.B.x, prev.B.y);
                        let a1 = Math.atan2(prev.n.y, prev.n.x);
                        let a2 = Math.atan2(s.n.y, s.n.x);
                        ctx.arc(s.p1.cx, s.p1.cy, OFFSET_DIST, a1, a2, false);
                    } else {
                        ctx.lineTo(s.A.x, s.A.y);
                    }
                }
            }
            ctx.lineTo(s.B.x, s.B.y);
        }
        ctx.stroke();
        ctx.restore();
    }

    // Draw special glowing markers for waypoints
    let routeStops = [];
    if (typeof navStartRooms !== 'undefined') navStartRooms.forEach(r => { if (r) routeStops.push({room: r, type: 'start'}); });
    if (typeof navWaypoints !== 'undefined') {
        navWaypoints.forEach(arr => {
            if (arr) arr.forEach(r => { if (r) routeStops.push({room: r, type: 'wp'}); });
        });
    }
    if (typeof navEndRooms !== 'undefined') navEndRooms.forEach(r => { if (r) routeStops.push({room: r, type: 'end'}); });
    
    routeStops.forEach((stopObj) => {
        let r = stopObj.room;
        if (!r) return;
        let p = processedRooms.find(pr => pr.roomIndex === r.roomIndex && pr.zoneName === r.zoneName);
        if (p) {
            ctx.save();
            ctx.translate(p.cx, p.cy);
            ctx.shadowBlur = 10;
            if (stopObj.type === 'start') {
                ctx.strokeStyle = '#10b981'; // Green start
                ctx.shadowColor = '#10b981';
            } else if (stopObj.type === 'end') {
                ctx.strokeStyle = '#ef4444'; // Red end
                ctx.shadowColor = '#ef4444';
            } else {
                ctx.strokeStyle = '#eab308'; // Yellow waypoints
                ctx.shadowColor = '#eab308';
            }
            ctx.lineWidth = 4;
            ctx.strokeRect(-CELL_SIZE/2 + 2, -CELL_SIZE/2 + 2, CELL_SIZE - 4, CELL_SIZE - 4);
            ctx.restore();
        }
    });

    // Restore back to screen coordinates so text isn't sub-pixel squished
    ctx.restore();
    
    // Draw Text Labels Over Everything in screen space
    const showSpecialText = document.getElementById('showSpecialRoomsCheck')?.checked;
    const hideText = document.getElementById('hideTextCheck')?.checked || !showSpecialText;
    
    processedRooms.forEach(r => {
        let isImportant = r.originalName === 'LczClassDSpawn' || r.originalName === 'EzCheckpoint' || r.originalName === 'HczCheckpointToEntranceZone';
        if (hideText && !isImportant) return;

        ctx.globalAlpha = (isNavHighlight && !inRoute(r)) ? 0.2 : 1.0;
        if (r.shortName !== '') {
            const screenX = r.cx * zoomScale + cameraX;
            const screenY = r.cy * zoomScale + cameraY;
            
            // Determine optimal font size based on zoom scale
            let baseFontSize = 16 * zoomScale;
            // Cap at 16px so it doesn't get huge when zoomed all the way in
            if (baseFontSize > 16) baseFontSize = 16;
            // Hide text if it gets absurdly small (lowered threshold to keep text visible longer)
            if (baseFontSize < 3) return;
            // Ensure minimum readable size and sharp integer pixels
            const finalSize = Math.max(8, Math.round(baseFontSize));
            ctx.fillStyle = colorText;
            ctx.font = `bold ${finalSize}px Inter, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 4;
            
            ctx.fillText(r.shortName, screenX, screenY);
            
            ctx.shadowBlur = 0;
        }
        });
}

// Map Interaction
const wrapper = document.getElementById('mapContainer');

wrapper.addEventListener('mousedown', (e) => {
    isDragging = true;
    mouseMoved = false;
    startDragX = e.clientX - cameraX;
    startDragY = e.clientY - cameraY;
});

window.addEventListener('mouseup', () => {
    isDragging = false;
});

wrapper.addEventListener('mousemove', (e) => {
    if (isDragging) {
        cameraX = e.clientX - startDragX;
        cameraY = e.clientY - startDragY;
        mouseMoved = true;
        drawCanvas();
    }
    
    const rect = wrapper.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const worldX = (mouseX - cameraX) / zoomScale;
    const worldY = (mouseY - cameraY) / zoomScale;
    
    let foundRoom = null;
    for (let r of processedRooms) {
        if (Math.abs(r.cx - worldX) < CELL_SIZE/2 && Math.abs(r.cy - worldY) < CELL_SIZE/2) {
            foundRoom = r;
            break;
        }
    }

    const disableTooltips = document.getElementById('disableTooltipsCheck')?.checked;
    const showSpecialText = document.getElementById('showSpecialRoomsCheck')?.checked;

    if (foundRoom && !(disableTooltips && !showSpecialText)) {
        const tooltip = document.getElementById('customTooltip');
        tooltip.style.display = 'block';
        tooltip.style.left = (e.clientX + 15) + 'px';
        tooltip.style.top = (e.clientY + 15) + 'px';
        
        let text = foundRoom.shortName ? `${foundRoom.originalName} (${foundRoom.shortName})\n${foundRoom.zoneName}` : `${foundRoom.originalName}\n${foundRoom.zoneName}`;
        if (navState !== 'none') {
            text += `\n[РљР»РёРєРЅРёС‚Рµ РґР»СЏ РІС‹Р±РѕСЂР°]`;
            wrapper.style.cursor = 'crosshair';
        } else {
            wrapper.style.cursor = 'grab';
        }
        tooltip.textContent = text;
    } else {
        document.getElementById('customTooltip').style.display = 'none';
        wrapper.style.cursor = (navState !== 'none') ? 'crosshair' : (isDragging ? 'grabbing' : 'grab');
    }
});

wrapper.addEventListener('click', (e) => {
    if (mouseMoved || navState === 'none') return;

    const rect = wrapper.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const worldX = (mouseX - cameraX) / zoomScale;
    const worldY = (mouseY - cameraY) / zoomScale;
    
    let foundRoom = null;
    for (let r of processedRooms) {
        if (Math.abs(r.cx - worldX) < CELL_SIZE/2 && Math.abs(r.cy - worldY) < CELL_SIZE/2) {
            foundRoom = r;
            break;
        }
    }

    if (foundRoom) {
        if (navState === 'fav') {
            let name = foundRoom.shortName || foundRoom.originalName;
            if (!favoriteRooms.find(f => f.name === name)) {
                favoriteRooms.push({name: name});
                localStorage.setItem('favRooms', JSON.stringify(favoriteRooms));
                renderFavoritesList();
            }
            document.getElementById('favInput').value = name;
        } else if (navState.startsWith('start_')) {
            let idx = parseInt(navState.split('_')[1]);
            navStartRooms[idx] = foundRoom;
            document.getElementById('navStartInput_' + idx).value = foundRoom.shortName || foundRoom.originalName;
        } else if (navState.startsWith('end_')) {
            let idx = parseInt(navState.split('_')[1]);
            navEndRooms[idx] = foundRoom;
            document.getElementById('navEndInput_' + idx).value = foundRoom.shortName || foundRoom.originalName;
        } else if (navState.startsWith('wp_')) {
            let parts = navState.split('_');
            let wpIdx = parseInt(parts[1]);
            let altIdx = parseInt(parts[2]);
            if (!navWaypoints[wpIdx]) navWaypoints[wpIdx] = [];
            navWaypoints[wpIdx][altIdx] = foundRoom;
            document.getElementById(`navWpInput_${wpIdx}_${altIdx}`).value = foundRoom.shortName || foundRoom.originalName;
        } else if (navState.startsWith('navInput_')) {
            // For dynamically added alts if they don't hit the specific prefix
            let id = navState.replace('navInput_', '');
            if (id.startsWith('start_')) {
                let idx = parseInt(id.split('_')[1]);
                navStartRooms[idx] = foundRoom;
            } else if (id.startsWith('end_')) {
                let idx = parseInt(id.split('_')[1]);
                navEndRooms[idx] = foundRoom;
            } else if (id.startsWith('wp_')) {
                let parts = id.split('_');
                let wpIdx = parseInt(parts[1]);
                let altIdx = parseInt(parts[2]);
                if (!navWaypoints[wpIdx]) navWaypoints[wpIdx] = [];
                navWaypoints[wpIdx][altIdx] = foundRoom;
            }
            document.getElementById(navState).value = foundRoom.shortName || foundRoom.originalName;
        }
        
        let wasFav = (navState === 'fav');
        navState = 'none';
        document.getElementById('mapContainer').style.cursor = 'grab';
        
        // Re-open modal view
        document.getElementById('settingsModal').classList.remove('hidden');
        document.getElementById('menuView').classList.add('hidden');
        document.getElementById('settingsView').classList.add('hidden');
        if (wasFav) {
            document.getElementById('favoritesView').classList.remove('hidden');
            document.getElementById('navView').classList.add('hidden');
        } else {
            document.getElementById('favoritesView').classList.add('hidden');
            document.getElementById('navView').classList.remove('hidden');
        }
        drawCanvas();
    }
});

wrapper.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomAmount = -e.deltaY * 0.001;
    let newScale = zoomScale * (1 + zoomAmount);
    newScale = Math.max(0.2, Math.min(newScale, 5));
    
    const rect = wrapper.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const worldX = (mouseX - cameraX) / zoomScale;
    const worldY = (mouseY - cameraY) / zoomScale;
    
    zoomScale = newScale;
    
    cameraX = mouseX - worldX * zoomScale;
    cameraY = mouseY - worldY * zoomScale;
    
    drawCanvas();
}, { passive: false });

document.getElementById('ezColorPicker')?.addEventListener('input', (e) => {
    localStorage.setItem('ezColor', e.target.value);
    document.documentElement.style.setProperty('--ez-color', e.target.value);
    if (typeof drawCanvas === 'function') drawCanvas();
});

document.getElementById('highlightColorPicker')?.addEventListener('input', (e) => {
    localStorage.setItem('highlightColor', e.target.value);
    if (typeof drawCanvas === 'function') drawCanvas();
});

document.querySelectorAll('.hl-check').forEach(cb => {
    cb.addEventListener('change', (e) => {
        localStorage.setItem(e.target.id, e.target.checked);
        if (typeof drawCanvas === 'function') drawCanvas();
    });
});

window.addEventListener('resize', drawCanvas);

// Settings and LocalStorage Logic
const CSS_DEFAULTS = {
    '--lcz-color': '#f59e0b',
    '--hcz-color': '#ef4444',
    '--ez-color': '#10b981',
    '--text-primary': '#f8fafc',
    '--bg-color': '#020617'
};

function updateCSSVariable(prop, val) {
    document.documentElement.style.setProperty(prop, val);
    localStorage.setItem(prop, val);
    if (typeof drawCanvas === 'function') drawCanvas();
}

function loadSettings() {
    let lcz = localStorage.getItem('--lcz-color') || CSS_DEFAULTS['--lcz-color'];
    let hcz = localStorage.getItem('--hcz-color') || CSS_DEFAULTS['--hcz-color'];
    let ez = localStorage.getItem('--ez-color') || CSS_DEFAULTS['--ez-color'];
    let txt = localStorage.getItem('--text-primary') || CSS_DEFAULTS['--text-primary'];
    let bg = localStorage.getItem('--bg-color') || CSS_DEFAULTS['--bg-color'];

    document.documentElement.style.setProperty('--lcz-color', lcz);
    document.documentElement.style.setProperty('--hcz-color', hcz);
    document.documentElement.style.setProperty('--ez-color', ez);
    document.documentElement.style.setProperty('--text-primary', txt);
    document.documentElement.style.setProperty('--bg-color', bg);

    const mode = localStorage.getItem('designMode') || 'game';
    const modeSelect = document.getElementById('designModeSelect');
    if (modeSelect) modeSelect.value = mode;

    const hideText = localStorage.getItem('hideText') === 'true';
    const hideTextCheck = document.getElementById('hideTextCheck');
    if (hideTextCheck) hideTextCheck.checked = hideText;

    const disableTooltips = localStorage.getItem('disableTooltips') === 'true';
    const disableTooltipsCheck = document.getElementById('disableTooltipsCheck');
    if (disableTooltipsCheck) disableTooltipsCheck.checked = disableTooltips;

    const showSpecial = localStorage.getItem('showSpecialRooms') === 'true';
    const specialCheck = document.getElementById('showSpecialRoomsCheck');
    if (specialCheck) specialCheck.checked = showSpecial;

    const lczNaming = localStorage.getItem('lczNaming') || 'game';
    const lczNamingSelect = document.getElementById('lczNamingSelect');
    if (lczNamingSelect) lczNamingSelect.value = lczNaming;

    const hczNaming = localStorage.getItem('hczNaming') || 'game';
    const hczNamingSelect = document.getElementById('hczNamingSelect');
    if (hczNamingSelect) hczNamingSelect.value = hczNaming;

    const ezNaming = localStorage.getItem('ezNaming') || 'game';
    const ezColorInput = document.getElementById('ezColorPicker');
    if (ezColorInput) ezColorInput.value = localStorage.getItem('ezColor') || '#10b981';

    const highlightColorPicker = document.getElementById('highlightColorPicker');
    if (highlightColorPicker) highlightColorPicker.value = localStorage.getItem('highlightColor') || '#8b5cf6';

    const shapes = ['Straight', 'Curve', 'TShape', 'Cross', 'DeadEnd'];
    ['LCZ', 'HCZ', 'EZ'].forEach(z => {
        shapes.forEach(s => {
            const cb = document.getElementById('hl_' + z + '_' + s);
            if (cb) cb.checked = localStorage.getItem('hl_' + z + '_' + s) === 'true';
        });
    });

    const ezNamingSelect = document.getElementById('ezNamingSelect');
    if (ezNamingSelect) ezNamingSelect.value = ezNaming;

    const lczPicker = document.getElementById('lczColorPicker');
    if (lczPicker) {
        lczPicker.value = lcz;
        document.getElementById('hczColorPicker').value = hcz;
        document.getElementById('ezColorPicker').value = ez;
        document.getElementById('textColorPicker').value = txt;
        document.getElementById('bgColorPicker').value = bg;
    }
}

window.openSettings = function() {
    document.getElementById('settingsView').classList.remove('hidden');
    loadSettings();
};

window.closeSettings = function() {
    document.getElementById('settingsView').classList.add('hidden');
};

window.resetSettings = function() {
    Object.keys(CSS_DEFAULTS).forEach(key => {
        localStorage.removeItem(key);
    });
    localStorage.removeItem('designMode');
    localStorage.removeItem('hideText');
    localStorage.removeItem('disableTooltips');
    localStorage.removeItem('showSpecialRooms');
    localStorage.removeItem('lczNaming');
    localStorage.removeItem('hczNaming');
    localStorage.removeItem('highlightColor');
    const shapes = ['Straight', 'Curve', 'TShape', 'Cross', 'DeadEnd'];
    ['LCZ', 'HCZ', 'EZ'].forEach(z => {
        shapes.forEach(s => localStorage.removeItem('hl_' + z + '_' + s));
    });
    
    loadSettings();
    if (typeof renderTemplateButtons === 'function') renderTemplateButtons();
    if (typeof drawCanvas === 'function') drawCanvas();
};

// Bind pickers if they exist
const lczPicker = document.getElementById('lczColorPicker');
if (lczPicker) {
    lczPicker.addEventListener('input', (e) => updateCSSVariable('--lcz-color', e.target.value));
    document.getElementById('hczColorPicker').addEventListener('input', (e) => updateCSSVariable('--hcz-color', e.target.value));
    document.getElementById('ezColorPicker').addEventListener('input', (e) => updateCSSVariable('--ez-color', e.target.value));
    document.getElementById('textColorPicker').addEventListener('input', (e) => updateCSSVariable('--text-primary', e.target.value));
    document.getElementById('bgColorPicker').addEventListener('input', (e) => updateCSSVariable('--bg-color', e.target.value));
}

const lczNamingSelect = document.getElementById('lczNamingSelect');
if (lczNamingSelect) {
    lczNamingSelect.addEventListener('change', (e) => {
        localStorage.setItem('lczNaming', e.target.value);
        if (typeof renderTemplateButtons === 'function') renderTemplateButtons();
    });
}
const hczNamingSelect = document.getElementById('hczNamingSelect');
if (hczNamingSelect) {
    hczNamingSelect.addEventListener('change', (e) => {
        localStorage.setItem('hczNaming', e.target.value);
        if (typeof renderTemplateButtons === 'function') renderTemplateButtons();
    });
}
const ezNamingSelect = document.getElementById('ezNamingSelect');
if (ezNamingSelect) {
    ezNamingSelect.addEventListener('change', (e) => {
        localStorage.setItem('ezNaming', e.target.value);
        if (typeof renderTemplateButtons === 'function') renderTemplateButtons();
    });
}

const hideTextCheck = document.getElementById('hideTextCheck');
if (hideTextCheck) {
    hideTextCheck.addEventListener('change', (e) => {
        localStorage.setItem('hideText', e.target.checked);
        if (typeof drawCanvas === 'function') drawCanvas();
    });
}

const disableTooltipsCheck = document.getElementById('disableTooltipsCheck');
if (disableTooltipsCheck) {
    disableTooltipsCheck.addEventListener('change', (e) => {
        localStorage.setItem('disableTooltips', e.target.checked);
    });
}

const specialCheck = document.getElementById('showSpecialRoomsCheck');
if (specialCheck) {
    specialCheck.addEventListener('change', (e) => {
        localStorage.setItem('showSpecialRooms', e.target.checked);
        if (typeof drawCanvas === 'function') drawCanvas();
    });
}

const modeSelect = document.getElementById('designModeSelect');
if (modeSelect) {
    modeSelect.addEventListener('change', (e) => {
        localStorage.setItem('designMode', e.target.value);
        if (typeof drawCanvas === 'function') drawCanvas();
    });
}

window.openMainMenu = function() {
    document.getElementById('layoutsApp').classList.add('hidden');
    const menu = document.getElementById('mainMenu');
    menu.style.display = 'flex';
    setTimeout(() => { menu.style.opacity = '1'; }, 10);
};

window.openLayouts = function() {
    if (!layoutDatabase) fetchLayouts().then(() => selectZone('light'));
    else selectZone('light');
    
    const menu = document.getElementById('mainMenu');
    menu.style.opacity = '0';
    setTimeout(() => {
        menu.style.display = 'none';
        document.getElementById('layoutsApp').classList.remove('hidden');
        if (typeof resetCamera === 'function') resetCamera();
        window.dispatchEvent(new Event('resize'));
    }, 300);
};

// Initialize settings on script load
preloadImages();
loadSettings();

function setupAutocomplete(inputId, dropdownId, type) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);
    if (!input || !dropdown) return;
    
    input.addEventListener('input', () => {
        const val = input.value.trim().toLowerCase();
        dropdown.innerHTML = '';
        
        if (!val || processedRooms.length === 0) {
            dropdown.classList.add('hidden');
            return;
        }
        
        let matches = [];
        let seen = new Set();
        
        for (let r of processedRooms) {
            let sName = r.shortName || '';
            let oName = r.originalName || '';
            
            let zoneLabel = '';
            if (r.zoneName === 'LightContainment') zoneLabel = 'LCZ';
            if (r.zoneName === 'HeavyContainment') zoneLabel = 'HCZ';
            if (r.zoneName === 'Entrance') zoneLabel = 'EZ';
            
            let matchScore = 0;
            let displayStr = '';
            
            if (sName.toLowerCase().includes(val)) {
                matchScore = val.length / sName.length;
                displayStr = `${sName} (${oName}) - ${zoneLabel}`;
            } else if (oName.toLowerCase().includes(val)) {
                matchScore = val.length / oName.length;
                displayStr = `${sName ? sName + ' ' : ''}(${oName}) - ${zoneLabel}`;
            }
            
            if (matchScore > 0) {
                let uniqueKey = sName + '_' + oName + '_' + r.zoneName;
                if (!seen.has(uniqueKey)) {
                    seen.add(uniqueKey);
                    matches.push({ room: r, score: matchScore, text: displayStr, sName, oName });
                }
            }
        }
        
        matches.sort((a, b) => b.score - a.score);
        
        if (matches.length > 0) {
            dropdown.classList.remove('hidden');
            matches.slice(0, 4).forEach(m => {
                const li = document.createElement('button');
                li.type = 'button';
                li.className = 'secondary-btn w-full text-left px-4 py-3 flex justify-start items-center gap-2';
                li.style.border = 'none';
                li.style.borderBottom = '1px solid var(--border-color)';
                li.style.borderRadius = '0';
                
                const nameSpan = document.createElement('span');
                nameSpan.className = 'font-medium';
                
                let zoneLabel = '';
                if (m.room.zoneName === 'LightContainment') zoneLabel = 'LCZ';
                if (m.room.zoneName === 'HeavyContainment') zoneLabel = 'HCZ';
                if (m.room.zoneName === 'Entrance') zoneLabel = 'EZ';
                
                nameSpan.textContent = (m.sName || m.oName) + ' - ' + zoneLabel;

                li.appendChild(nameSpan);
                
                li.addEventListener('click', () => {
                    input.value = m.sName || m.oName;
                    if (type === 'fav') {
                        // handled by Add button
                    } else if (type.startsWith('start_')) {
                        let idx = parseInt(type.split('_')[1]);
                        navStartRooms[idx] = m.room;
                    } else if (type.startsWith('end_')) {
                        let idx = parseInt(type.split('_')[1]);
                        navEndRooms[idx] = m.room;
                    } else if (type.startsWith('wp_')) {
                        let parts = type.split('_');
                        let wpIdx = parseInt(parts[1]);
                        let altIdx = parseInt(parts[2]);
                        if (!navWaypoints[wpIdx]) navWaypoints[wpIdx] = [];
                        navWaypoints[wpIdx][altIdx] = m.room;
                    }
                    dropdown.classList.add('hidden');
                });
                dropdown.appendChild(li);
            });
        } else {
            dropdown.classList.add('hidden');
        }
    });
    
    document.addEventListener('click', (e) => {
        if (e.target !== input && e.target !== dropdown) {
            dropdown.classList.add('hidden');
        }
    });
}

setupAutocomplete('navStartInput_0', 'navStartDropdown_0', 'start_0');
setupAutocomplete('navEndInput_0', 'navEndDropdown_0', 'end_0');

// Navigation logic
function selectNavRoom(type) {
    navState = type; // 'start' or 'end'
    closeMenu();
    document.getElementById('mapContainer').style.cursor = 'crosshair';
}

window.addAlternativeInput = function(type, parentElement) {
    let count = 0;
    let container = null;
    let baseId = '';
    
    if (type === 'start') {
        if (altsCounts.start >= 3) return;
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
    div.dataset.altId = baseId + '_' + count;
    
    let idSuffix = baseId + '_' + count;
    div.innerHTML = `
        <div style="position: relative; flex: 1;">
            <input type="text" id="navInput_${idSuffix}" class="styled-input w-full" placeholder="РђР»СЊС‚РµСЂРЅР°С‚РёРІР°" autocomplete="off" />
            <div id="navDropdown_${idSuffix}" class="absolute z-10 w-full bg-slate-800 border border-slate-600 rounded-lg shadow-xl shadow-black/50 mt-1 hidden overflow-hidden text-slate-200 text-sm"></div>
        </div>
        <button class="secondary-btn" onclick="selectNavRoom('${idSuffix}')">РќР° РєР°СЂС‚Рµ</button>
        <button class="secondary-btn" onclick="removeAlternativeInput(this, '${type}', ${count})" style="border-color: #ef4444; color: #ef4444; padding: 0.5rem 0.75rem;">X</button>
    `;
    container.appendChild(div);
    setupAutocomplete(`navInput_${idSuffix}`, `navDropdown_${idSuffix}`, idSuffix);
};

window.removeAlternativeInput = function(btn, type, count) {
    btn.parentElement.remove();
    // Clear the room from arrays
    if (type === 'start' && navStartRooms[count]) navStartRooms[count] = null;
    if (type === 'end' && navEndRooms[count]) navEndRooms[count] = null;
    if (type.startsWith('wp_')) {
        let wpIdx = parseInt(type.split('_')[1]);
        if (navWaypoints[wpIdx] && navWaypoints[wpIdx][count]) navWaypoints[wpIdx][count] = null;
    }
};

window.addWaypointInput = function() {
    const container = document.getElementById('waypointsContainer');
    const wpIndex = waypointCount++;
    navWaypoints.push([]);
    altsCounts.wp[wpIndex] = 1;
    
    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.flexDirection = 'column';
    div.style.gap = '0.5rem';
    div.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem; width: 100%;">
            <div style="position: relative; flex: 1;">
                <input type="text" id="navWpInput_${wpIndex}_0" class="styled-input w-full" placeholder="РџСЂРѕРјРµР¶СѓС‚РѕС‡РЅР°СЏ РєРѕРјРЅР°С‚Р° ${wpIndex + 1}" autocomplete="off" />
                <div id="navWpDropdown_${wpIndex}_0" class="absolute z-10 w-full bg-slate-800 border border-slate-600 rounded-lg shadow-xl shadow-black/50 mt-1 hidden overflow-hidden text-slate-200 text-sm"></div>
            </div>
            <button class="secondary-btn" onclick="selectNavRoom('wp_${wpIndex}_0')">РќР° РєР°СЂС‚Рµ</button>
            <button class="secondary-btn" style="padding: 0.5rem 0.75rem;" onclick="addAlternativeInput('wp_${wpIndex}', this.parentElement.parentElement)">+</button>
            <button class="secondary-btn" onclick="removeWaypoint(${wpIndex}, this.parentElement.parentElement)" style="border-color: #ef4444; color: #ef4444; padding: 0.5rem 0.75rem;">X</button>
        </div>
        <div id="wpAltsContainer_${wpIndex}" style="display: flex; flex-direction: column; gap: 0.5rem;"></div>
    `;
    container.appendChild(div);
    
    setupAutocomplete(`navWpInput_${wpIndex}_0`, `navWpDropdown_${wpIndex}_0`, `wp_${wpIndex}_0`);
};

window.removeWaypoint = function(wpIndex, element) {
    element.remove();
    navWaypoints[wpIndex] = undefined;
};

function clearNavRoute() {
    navStartRooms = [];
    navEndRooms = [];
    altsCounts = { start: 1, end: 1, wp: {} };
    let startCont = document.getElementById('startAltsContainer');
    if (startCont) startCont.innerHTML = '';
    let endCont = document.getElementById('endAltsContainer');
    if (endCont) endCont.innerHTML = '';
    navPath = [];
    navWaypoints = [];
    waypointCount = 0;
    document.getElementById('navStartInput_0').value = '';
    document.getElementById('navEndInput_0').value = '';
    document.getElementById('waypointsContainer').innerHTML = '';
    drawCanvas();
}

function findRoomByName(val) {
    if (!val) return null;
    let exact = processedRooms.find(r => 
        (r.shortName && r.shortName.toLowerCase() === val) || 
        (r.originalName && r.originalName.toLowerCase() === val)
    );
    if (exact) return exact;
    
    // Fallback to partial match
    return processedRooms.find(r => 
        (r.shortName && r.shortName.toLowerCase().includes(val)) || 
        (r.originalName && r.originalName.toLowerCase().includes(val))
    );
}

function findPathBfs(startR, endR) {
    let queue = [[startR]];
    let visited = new Set();
    visited.add(startR.roomIndex + ',' + startR.zoneName);
    
    while (queue.length > 0) {
        let currentPath = queue.shift();
        let currentRoom = currentPath[currentPath.length - 1];
        
        if (currentRoom.roomIndex === endR.roomIndex && currentRoom.zoneName === endR.zoneName) {
            return currentPath;
        }
        
        let neighbors = [];
        const doorOffsets = [
            { dir: 0, dx: 0, dy: 1, opp: 2 },
            { dir: 1, dx: 1, dy: 0, opp: 3 },
            { dir: 2, dx: 0, dy: -1, opp: 0 },
            { dir: 3, dx: -1, dy: 0, opp: 1 }
        ];
        
        for (let d of currentRoom.globalDoors) {
            let offset = doorOffsets.find(o => o.dir === d);
            if (!offset) continue;
            let nx = currentRoom.x + offset.dx;
            let ny = currentRoom.y + offset.dy;
            let neighbor = processedRooms.find(r => r.x === nx && r.y === ny);
            if (neighbor && neighbor.globalDoors.includes(offset.opp)) {
                neighbors.push(neighbor);
            }
        }
        
        if (currentRoom.originalName === 'LczCheckpointA' || currentRoom.originalName === 'HczCheckpointA') {
            let oppName = currentRoom.originalName === 'LczCheckpointA' ? 'HczCheckpointA' : 'LczCheckpointA';
            let neighbor = processedRooms.find(r => r.originalName === oppName);
            if (neighbor) neighbors.push(neighbor);
        }
        if (currentRoom.originalName === 'LczCheckpointB' || currentRoom.originalName === 'HczCheckpointB') {
            let oppName = currentRoom.originalName === 'LczCheckpointB' ? 'HczCheckpointB' : 'LczCheckpointB';
            let neighbor = processedRooms.find(r => r.originalName === oppName);
            if (neighbor) neighbors.push(neighbor);
        }
        
        for (let n of neighbors) {
            let key = n.roomIndex + ',' + n.zoneName;
            if (!visited.has(key)) {
                visited.add(key);
                queue.push([...currentPath, n]);
            }
        }
    }
    return null;
}

function buildNavRoute() {
    let stops = [];
    
    // 1. Parse Start
    let starts = [];
    for(let i=0; i<3; i++) {
        let id = i === 0 ? 'navStartInput_0' : 'navInput_start_' + i;
        let el = document.getElementById(id);
        if (el) {
            let val = el.value.trim().toLowerCase();
            if (val) { let r = findRoomByName(val); if (r) navStartRooms[i] = r; }
        }
        if (navStartRooms[i]) starts.push(navStartRooms[i]);
    }
    if (starts.length === 0) { alert('РЈРєР°Р¶РёС‚Рµ С…РѕС‚СЏ Р±С‹ РѕРґРЅРѕ РЅР°С‡Р°Р»Рѕ РјР°СЂС€СЂСѓС‚Р°!'); return; }
    stops.push(starts);
    
    // 2. Parse Waypoints
    for (let i = 0; i < navWaypoints.length; i++) {
        if (navWaypoints[i] === undefined) continue;
        let wps = [];
        for (let j = 0; j < 3; j++) {
            let id = j === 0 ? `navWpInput_${i}_0` : `navInput_wp_${i}_${j}`;
            let el = document.getElementById(id);
            if (el) {
                let val = el.value.trim().toLowerCase();
                if (val) { let r = findRoomByName(val); if (r) navWaypoints[i][j] = r; }
            }
            if (navWaypoints[i] && navWaypoints[i][j]) wps.push(navWaypoints[i][j]);
        }
        if (wps.length > 0) stops.push(wps);
    }
    
    // 3. Parse End
    let ends = [];
    for(let i=0; i<3; i++) {
        let id = i === 0 ? 'navEndInput_0' : 'navInput_end_' + i;
        let el = document.getElementById(id);
        if (el) {
            let val = el.value.trim().toLowerCase();
            if (val) { let r = findRoomByName(val); if (r) navEndRooms[i] = r; }
        }
        if (navEndRooms[i]) ends.push(navEndRooms[i]);
    }
    if (ends.length === 0) { alert('РЈРєР°Р¶РёС‚Рµ С…РѕС‚СЏ Р±С‹ РѕРґРёРЅ РєРѕРЅРµС† РјР°СЂС€СЂСѓС‚Р°!'); return; }
    stops.push(ends);
    
    // 4. Memoized BFS
    let bfsCache = {};
    function getBfs(r1, r2) {
        let key = `${r1.roomIndex}_${r1.zoneName}_${r2.roomIndex}_${r2.zoneName}`;
        if (bfsCache[key]) return bfsCache[key];
        let p = findPathBfs(r1, r2);
        bfsCache[key] = p;
        return p;
    }
    
    // 5. Permutations
    let combinations = [];
    function generateCombos(stopIdx, currentCombo) {
        if (stopIdx === stops.length) {
            combinations.push([...currentCombo]);
            return;
        }
        for (let room of stops[stopIdx]) {
            currentCombo.push(room);
            generateCombos(stopIdx + 1, currentCombo);
            currentCombo.pop();
        }
    }
    generateCombos(0, []);
    
    let bestPath = null;
    let minLen = Infinity;
    
    for (let combo of combinations) {
        let fullPath = [];
        let valid = true;
        for (let i = 0; i < combo.length - 1; i++) {
            let seg = getBfs(combo[i], combo[i+1]);
            if (!seg) { valid = false; break; }
            if (i > 0) fullPath = fullPath.concat(seg.slice(1));
            else fullPath = fullPath.concat(seg);
        }
        if (valid && fullPath.length < minLen) {
            minLen = fullPath.length;
            bestPath = fullPath;
        }
    }
    
    if (!bestPath) {
        alert('РќРµ СѓРґР°Р»РѕСЃСЊ РїСЂРѕР»РѕР¶РёС‚СЊ РјР°СЂС€СЂСѓС‚ РјРµР¶РґСѓ СѓРєР°Р·Р°РЅРЅС‹РјРё РєРѕРјРЅР°С‚Р°РјРё!');
        return;
    }
    
    navPath = bestPath;
    closeMenu();
    drawCanvas();
}

window.saveRoute = function() {
    let name = document.getElementById('routeNameInput').value.trim();
    if (!name) name = "Р‘РµР· РЅР°Р·РІР°РЅРёСЏ";
    
    let starts = [];
    for (let i = 0; i < altsCounts.start; i++) {
        let id = i === 0 ? 'navStartInput_0' : 'navInput_start_' + i;
        let el = document.getElementById(id);
        if (el && el.value.trim()) starts.push(el.value.trim());
    }
    
    let ends = [];
    for (let i = 0; i < altsCounts.end; i++) {
        let id = i === 0 ? 'navEndInput_0' : 'navInput_end_' + i;
        let el = document.getElementById(id);
        if (el && el.value.trim()) ends.push(el.value.trim());
    }
    
    let wps = [];
    for (let i = 0; i < waypointCount; i++) {
        if (!document.getElementById('navWpInput_' + i + '_0')) continue;
        let wpGroup = [];
        let wpAltCount = altsCounts.wp[i] || 1;
        for (let j = 0; j < wpAltCount; j++) {
            let id = j === 0 ? 'navWpInput_' + i + '_0' : 'navInput_wp_' + i + '_' + j;
            let el = document.getElementById(id);
            if (el && el.value.trim()) wpGroup.push(el.value.trim());
        }
        if (wpGroup.length > 0) wps.push(wpGroup);
    }
    
    if (starts.length === 0 && ends.length === 0 && wps.length === 0) {
        alert("РќРµР»СЊР·СЏ СЃРѕС…СЂР°РЅРёС‚СЊ РїСѓСЃС‚РѕР№ РјР°СЂС€СЂСѓС‚!");
        return;
    }
    
    let savedRoutes = JSON.parse(localStorage.getItem('savedRoutes') || '[]');
    let routeId = Date.now().toString();
    savedRoutes.push({
        id: routeId,
        name: name,
        starts: starts,
        ends: ends,
        wps: wps
    });
    localStorage.setItem('savedRoutes', JSON.stringify(savedRoutes));
    alert("РњР°СЂС€СЂСѓС‚ СЃРѕС…СЂР°РЅРµРЅ!");
};

window.renderSavedRoutes = function() {
    let list = document.getElementById('savedRoutesList');
    if (!list) return;
    list.innerHTML = '';
    let savedRoutes = JSON.parse(localStorage.getItem('savedRoutes') || '[]');
    if (savedRoutes.length === 0) {
        list.innerHTML = '<p style="color: #94a3b8; font-size: 0.9rem;">РќРµС‚ СЃРѕС…СЂР°РЅРµРЅРЅС‹С… РјР°СЂС€СЂСѓС‚РѕРІ.</p>';
        return;
    }
    savedRoutes.forEach(r => {
        let div = document.createElement('div');
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.justifyContent = 'space-between';
        div.style.padding = '0.75rem';
        div.style.background = 'rgba(30, 41, 59, 0.5)';
        div.style.borderRadius = '0.5rem';
        div.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        
        let title = document.createElement('span');
        title.textContent = r.name;
        title.style.color = '#f8fafc';
        title.style.fontSize = '0.9rem';
        
        let btns = document.createElement('div');
        btns.style.display = 'flex';
        btns.style.gap = '0.5rem';
        
        let loadBtn = document.createElement('button');
        loadBtn.className = 'secondary-btn';
        loadBtn.textContent = 'Р—Р°РіСЂСѓР·РёС‚СЊ';
        loadBtn.onclick = () => window.loadRoute(r.id);
        
        let delBtn = document.createElement('button');
        delBtn.className = 'secondary-btn';
        delBtn.textContent = 'РЈРґР°Р»РёС‚СЊ';
        delBtn.style.color = '#ef4444';
        delBtn.style.borderColor = '#ef4444';
        delBtn.onclick = () => window.deleteRoute(r.id);
        
        btns.appendChild(loadBtn);
        btns.appendChild(delBtn);
        
        div.appendChild(title);
        div.appendChild(btns);
        list.appendChild(div);
    });
};

window.deleteRoute = function(id) {
    let savedRoutes = JSON.parse(localStorage.getItem('savedRoutes') || '[]');
    savedRoutes = savedRoutes.filter(r => r.id !== id);
    localStorage.setItem('savedRoutes', JSON.stringify(savedRoutes));
    window.renderSavedRoutes();
};

window.loadRoute = function(id) {
    let savedRoutes = JSON.parse(localStorage.getItem('savedRoutes') || '[]');
    let r = savedRoutes.find(x => x.id === id);
    if (!r) return;
    
    clearNavRoute();
    document.getElementById('routeNameInput').value = r.name;
    
    r.starts.forEach((val, idx) => {
        if (idx > 0) addAlternativeInput('start');
        let id = idx === 0 ? 'navStartInput_0' : 'navInput_start_' + idx;
        let el = document.getElementById(id);
        if (el) el.value = val;
    });
    
    r.ends.forEach((val, idx) => {
        if (idx > 0) addAlternativeInput('end');
        let id = idx === 0 ? 'navEndInput_0' : 'navInput_end_' + idx;
        let el = document.getElementById(id);
        if (el) el.value = val;
    });
    
    r.wps.forEach((group, wpIdx) => {
        addWaypointInput();
        group.forEach((val, altIdx) => {
            if (altIdx > 0) addAlternativeInput('wp_' + wpIdx, document.getElementById('navWpInput_' + wpIdx + '_0').parentElement.parentElement);
            let id = altIdx === 0 ? 'navWpInput_' + wpIdx + '_0' : 'navInput_wp_' + wpIdx + '_' + altIdx;
            let el = document.getElementById(id);
            if (el) el.value = val;
        });
    });
    
    document.getElementById('savedRoutesView').classList.add('hidden');
    document.getElementById('navView').classList.remove('hidden');
};

// ==========================================
// TRAINER LAYOUTS LOGIC
// ==========================================

let layoutDatabase = null;

async function fetchLayouts() {
    try {
        const res = await fetch('/api/templates_list');
        layoutDatabase = await res.json();
    } catch(e) {
        console.error("Failed to fetch templates list", e);
    }
}

window.openMainMenu = function() {
    document.getElementById('layoutsApp').classList.add('hidden');
    const menu = document.getElementById('mainMenu');
    menu.style.display = 'flex';
    setTimeout(() => { menu.style.opacity = '1'; }, 10);
};

window.selectZone = function(zone) {
    currentZone = zone === 'light' ? 'LightContainment' : (zone === 'heavy' ? 'HeavyContainment' : 'Entrance');
    document.querySelectorAll('.zone-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('btn_zone_' + zone).classList.add('active');
    
    renderTemplateButtons();
};

window.renderTemplateButtons = function() {
    const container = document.getElementById('templateButtons');
    container.innerHTML = '';
    
    if(!layoutDatabase || !layoutDatabase[currentZone]) return;
    
    let prefix = 'LC';
    if(currentZone === 'HeavyContainment') prefix = 'HC';
    if(currentZone === 'Entrance') prefix = 'EZ';
    
    const keys = layoutDatabase[currentZone];
    
    keys.forEach(key => {
        const btn = document.createElement('button');
        btn.className = 'template-btn';
        
        // Friendly name
        const tAliases = {
            'LC_1': '1', 'LC_2': '2', 'LC_3': '3',
            'LC_4': '4', 'LC_5': '5',
            'EZ_1': '1', 'EZ_2': '2', 'EZ_3': '3',
            'EZ_4': '4', 'EZ_5': '5',
            'HC_1_clark': '1 Clark', 'HC_2_thumbsup': '2 Thumbs Up', 'HC_3_heart': '3 Heart',
            'HC_4_stretch': '4 Stretch', 'HC_5_brain': '5 Brain', 'HC_6_leftwing': '6 Left Wing',
            'HC_7_boxes': '7 Boxes', 'HC_8_hyperhube': '8 Hypercube', 'HC_9_squares': '9 Squares',
            'HC_10_golem': '10 Golem'
        };

        const cAliases = {
            'LC_1': '1 Clothes', 'LC_2': '2 Stool', 'LC_3': '3 Controller',
            'LC_4': '4 Brain', 'LC_5': '5 Skull',
            'EZ_1': '1 Rectangle', 'EZ_2': '2 HandBag', 'EZ_3': '3 Fractured',
            'EZ_4': '4 L', 'EZ_5': '5 Mogus',
            'HC_1_clark': '1 Cross / X', 'HC_2_thumbsup': '2 Storm-PurpleMan', 'HC_3_heart': '3 TopSquares - Cubes',
            'HC_4_stretch': '4 Z', 'HC_5_brain': '5 RottenHeart / Triplet', 'HC_6_leftwing': '6 Tall',
            'HC_7_boxes': '7 Split / Full', 'HC_8_hyperhube': '8 Crawler', 'HC_9_squares': '9 Grasp-Tetris',
            'HC_10_golem': '10 Lungs'
        };

        let namingMode = 'game';
        if (prefix === 'LC') namingMode = localStorage.getItem('lczNaming') || 'game';
        if (prefix === 'HC') namingMode = localStorage.getItem('hczNaming') || 'game';
        if (prefix === 'EZ') namingMode = localStorage.getItem('ezNaming') || 'game';

        let btnName = namingMode === 'community' ? cAliases[key] : tAliases[key];
        
        if (!btnName) {
            btnName = key;
            let parts = key.split('_');
            if (parts.length >= 2) {
                btnName = parts.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            }
        }
        
        btn.textContent = btnName;
        btn.onclick = () => window.selectTemplate(key, btn);
        container.appendChild(btn);
    });
    
    if(keys.length > 0) {
        window.selectTemplate(keys[0], container.firstChild);
    }
};

window.selectTemplate = async function(key, btnElem) {
    document.querySelectorAll('.template-btn').forEach(b => b.classList.remove('active'));
    if(btnElem) btnElem.classList.add('active');
    
    try {
        let seed = Math.floor(Math.random() * 9999999);
        const res = await fetch(`/api/template?zone=${currentZone}&template=${key}&seed=${seed}`);
        currentMapData = await res.json();
        processMapData();
    } catch(e) {
        console.error(e);
    }
};

window.openGuide = function() {
    document.getElementById('guideView').classList.remove('hidden');
};

window.closeGuide = function() {
    document.getElementById('guideView').classList.add('hidden');
};

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const settingsView = document.getElementById('settingsView');
        if (settingsView && !settingsView.classList.contains('hidden')) {
            if (typeof closeSettings === 'function') closeSettings();
        }
        const guideView = document.getElementById('guideView');
        if (guideView && !guideView.classList.contains('hidden')) {
            if (typeof closeGuide === 'function') closeGuide();
        }
    }
});

