
let drawGlobalTimerId = null;
let drawRevealTimeout = null;

function openAboutModal() {
    let modal = document.getElementById('aboutModal');
    if (modal) modal.classList.remove('hidden');
}

function closeAboutModal() {
    let modal = document.getElementById('aboutModal');
    if (modal) modal.classList.add('hidden');
}

function formatDrawTime(ms) {
    let seconds = Math.floor(ms / 1000);
    let m = Math.floor(seconds / 60).toString().padStart(2, '0');
    let s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}
let currentMapData = null;
let currentZone = 'LightContainment';

// Fog of War State
let isFogMode = false;
let fogState = {
    zone: '',
    targetTemplate: '',
    startPos: '',
    steps: 0,
    mistakes: 0,
    discoveredRooms: new Set(),
    adjacentRooms: new Set(),
    settings: {
        showFullRoom: false,
        lczColor: '#f59e0b',
        hczColor: '#ef4444',
        ezColor: '#10b981',
        bgColor: '#020617',
        bgColor: '#020617'
    },
    stats: {
        records: { LightContainment: Infinity, HeavyContainment: Infinity, Entrance: Infinity },
        history: { LightContainment: [], HeavyContainment: [], Entrance: [] }
    }
};

try {
    const savedStats = localStorage.getItem('fogStats');
    if (savedStats) {
        const parsed = JSON.parse(savedStats);
        Object.assign(fogState.stats.records, parsed.records || {});
        Object.assign(fogState.stats.history, parsed.history || {});
    }
} catch(e) {}


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


const TEMPLATE_ALIASES_GAME = {
            'LC_1': '1', 'LC_2': '2', 'LC_3': '3',
            'LC_4': '4', 'LC_5': '5',
            'EZ_1': '1', 'EZ_2': '2', 'EZ_3': '3',
            'EZ_4': '4', 'EZ_5': '5',
            'HC_1_clark': '1 Clark', 'HC_2_thumbsup': '2 Thumbs Up', 'HC_3_heart': '3 Heart',
            'HC_4_stretch': '4 Stretch', 'HC_5_brain': '5 Brain', 'HC_6_leftwing': '6 Left Wing',
            'HC_7_boxes': '7 Boxes', 'HC_8_hyperhube': '8 Hypercube', 'HC_9_squares': '9 Squares',
            'HC_10_golem': '10 Golem'
        };

const TEMPLATE_ALIASES_COMMUNITY = {
            'LC_1': '1 Clothes', 'LC_2': '2 Stool', 'LC_3': '3 Controller',
            'LC_4': '4 Brain', 'LC_5': '5 Skull',
            'EZ_1': '1 Rectangle', 'EZ_2': '2 HandBag', 'EZ_3': '3 Fractured',
            'EZ_4': '4 L', 'EZ_5': '5 Mogus',
            'HC_1_clark': '1 Cross / X', 'HC_2_thumbsup': '2 Storm-PurpleMan', 'HC_3_heart': '3 TopSquares - Cubes',
            'HC_4_stretch': '4 Z', 'HC_5_brain': '5 RottenHeart / Triplet', 'HC_6_leftwing': '6 Tall',
            'HC_7_boxes': '7 Split / Full', 'HC_8_hyperhube': '8 Crawler', 'HC_9_squares': '9 Grasp-Tetris',
            'HC_10_golem': '10 Lungs'
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
        img.src = 'img/rooms/' + TEXTURE_MAPPING[key];
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
let hoveredRoom = null;

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
        if (!currentMapData || !currentMapData[currentZone]) return;
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

        let id = `${zone}_${room.roomIndex}`;
        return {
            id, x, y, cx, cy, originalName, shortName, shape, rot, effectiveRot, baseDoors, globalDoors, neighborMap: roomMap, zoneName: zone, roomIndex: room.roomIndex
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
    let colorLcz = style.getPropertyValue('--lcz-color').trim() || '#f59e0b';
    let colorHcz = style.getPropertyValue('--hcz-color').trim() || '#ef4444';
    let colorEz = style.getPropertyValue('--ez-color').trim() || '#10b981';
    let colorText = style.getPropertyValue('--text-primary').trim() || '#f8fafc';

    if (typeof isDrawMode !== 'undefined' && isDrawMode) {
        colorLcz = drawState.settings.lczColor || colorLcz;
        colorHcz = drawState.settings.hczColor || colorHcz;
        colorEz = drawState.settings.ezColor || colorEz;
        bgColor = drawState.settings.bgColor || bgColor;
    } else if (typeof isFogMode !== 'undefined' && isFogMode) {
        colorLcz = fogState.settings.lczColor || colorLcz;
        colorHcz = fogState.settings.hczColor || colorHcz;
        colorEz = fogState.settings.ezColor || colorEz;
    }

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

    // === DRAW MODE RENDERING ===
    if (typeof isDrawMode !== 'undefined' && isDrawMode) {
        ctx.clearRect(0, 0, wrapper.clientWidth, wrapper.clientHeight);
        ctx.save();
        ctx.translate(cameraX, cameraY);
        ctx.scale(zoomScale, zoomScale);

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 1;
        let pad = 2 * CELL_SIZE;
        let gx0 = Math.floor((drawState.minX - pad) / CELL_SIZE) * CELL_SIZE - CELL_SIZE/2;
        let gx1 = Math.ceil((drawState.maxX + pad) / CELL_SIZE) * CELL_SIZE + CELL_SIZE/2;
        let gy0 = Math.floor((drawState.minY - pad) / CELL_SIZE) * CELL_SIZE - CELL_SIZE/2;
        let gy1 = Math.ceil((drawState.maxY + pad) / CELL_SIZE) * CELL_SIZE + CELL_SIZE/2;
        ctx.beginPath();
        for (let x = gx0 - CELL_SIZE/2; x <= gx1 + CELL_SIZE/2; x += CELL_SIZE) { ctx.moveTo(x, gy0 - CELL_SIZE/2); ctx.lineTo(x, gy1 + CELL_SIZE/2); }
        for (let y = gy0 - CELL_SIZE/2; y <= gy1 + CELL_SIZE/2; y += CELL_SIZE) { ctx.moveTo(gx0 - CELL_SIZE/2, y); ctx.lineTo(gx1 + CELL_SIZE/2, y); }
        ctx.stroke();

        // Template slots (faint outline)
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 2;
        for (let px = gx0; px <= gx1; px += CELL_SIZE) {
            for (let py = gy0; py <= gy1; py += CELL_SIZE) {
                ctx.strokeRect(px - CELL_SIZE/2 + 4, py - CELL_SIZE/2 + 4, CELL_SIZE - 8, CELL_SIZE - 8);
            }
        }

        // Placed rooms
        drawState.placedRooms.forEach(r => {
            ctx.save();
            ctx.translate(r.cx, r.cy); // cx, cy are already in pixels!

            let renderColor = drawState.zone === 'LightContainment' ? colorLcz : (drawState.zone === 'HeavyContainment' ? colorHcz : colorEz);
            let templateR = drawState.templateMap.find(tr => tr.cx === r.cx && tr.cy === r.cy);
            
            // Draw room Background Box
            ctx.fillStyle = 'rgba(30, 41, 59, 0.5)';
            ctx.fillRect(-CELL_SIZE/2 + 2, -CELL_SIZE/2 + 2, CELL_SIZE - 4, CELL_SIZE - 4);

            ctx.save();
            let finalRot = r.rotation;
            let originalName = '';
            
            if (r.isAnchor && templateR) {
                finalRot = templateR.effectiveRot;
                originalName = templateR.originalName;
            }

            let key = '';
            let prefix = '';
            if (drawState.zone === 'LightContainment') prefix = 'Lcz';
            if (drawState.zone === 'HeavyContainment') prefix = 'Hcz';
            if (drawState.zone === 'Entrance') prefix = 'Ez';

            if (originalName === 'EzCheckpoint' || originalName === 'HczCheckpointToEntranceZone' || originalName === 'LczClassDSpawn') {
                key = originalName;
            } else {
                let s = r.shape;
                if (s === 'XShape') s = 'Cross';
                if (s === 'TShape') s = 'ThreeWay';
                key = prefix + s;
            }

            let img = loadedImages[key];
            if (img && img.complete && img.naturalWidth > 0) {
                ctx.rotate(finalRot * Math.PI / 180);
                
                let tRot = TEXTURE_ROTATION[key] || 0;
                if (key === 'EzEndroom' && typeof isDrawMode !== 'undefined' && isDrawMode) tRot = -90; // Draw Mode override
                if (tRot !== 0) ctx.rotate(tRot * Math.PI / 180);
                
                const tinted = getTintedImage(img, renderColor);
                ctx.drawImage(tinted, -CELL_SIZE/2, -CELL_SIZE/2, CELL_SIZE, CELL_SIZE);
            } else {
                let mockR = { originalName: originalName, shape: r.shape, baseDoors: BaseShapes[r.shape] || [] };
                ctx.rotate(finalRot * Math.PI / 180);
                ctx.lineWidth = LINE_WIDTH;
                drawLocalShape(ctx, mockR, renderColor);
            }
            ctx.restore();

            // Border based on status
            let borderColor = null;
            if (r.status === 'anchor') borderColor = '#eab308';
            else if (r.status === 'correct') borderColor = '#4ade80';
            else if (r.status === 'wrongRotation') borderColor = '#f59e0b';
            else if (r.status === 'wrong') borderColor = '#ef4444';
            else if (r.status === 'revealed') borderColor = '#8b5cf6';

            if (borderColor) {
                ctx.strokeStyle = borderColor;
                ctx.lineWidth = 2;
                ctx.strokeRect(-CELL_SIZE/2 + 2, -CELL_SIZE/2 + 2, CELL_SIZE - 4, CELL_SIZE - 4);
            }

            // Anchor label
            if (r.isAnchor && r.shortName) {
                ctx.fillStyle = 'white';
                ctx.font = 'bold 14px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowColor = 'black';
                ctx.shadowBlur = 4;
                ctx.fillText(r.shortName, 0, 0);
            }

            ctx.restore();
        });

        ctx.restore();
        return;
    }
    // === END DRAW MODE ===

    ctx.clearRect(0, 0, wrapper.clientWidth, wrapper.clientHeight);
    ctx.save();
    ctx.translate(cameraX, cameraY);
    ctx.scale(zoomScale, zoomScale);
    if (typeof isFogMode !== 'undefined' && isFogMode && fogState.rotationAngle) {
        ctx.rotate(fogState.rotationAngle * Math.PI / 180);
    }

    const isNavHighlight = navPath && navPath.length > 0 && document.getElementById('navHighlightCheck')?.checked;
    const inRoute = (r) => navPath && navPath.some(p => p.roomIndex === r.roomIndex && p.zoneName === r.zoneName);

    
    processedRooms.forEach(r => {
        if (isFogMode && !fogState.discoveredRooms.has(r.id)) return; // Skip dots for undiscovered
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
        if (isFogMode) {
            if (!fogState.discoveredRooms.has(r.id) && !fogState.adjacentRooms.has(r.id)) {
                return; // Hide entirely
            }
            if (fogState.adjacentRooms.has(r.id) && !fogState.discoveredRooms.has(r.id)) {
                // Draw glowing box instead of room
                ctx.save();
                ctx.translate(r.cx, r.cy);
                let isHovered = (typeof hoveredRoom !== 'undefined' && hoveredRoom === r);
                ctx.fillStyle = isHovered ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)';
                ctx.strokeStyle = isHovered ? '#fff' : '#38bdf8';
                ctx.lineWidth = isHovered ? 6 : 4;
                ctx.shadowColor = isHovered ? '#fff' : '#38bdf8';
                ctx.shadowBlur = isHovered ? 25 : 15;
                ctx.fillRect(-CELL_SIZE/2 + 2, -CELL_SIZE/2 + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                ctx.strokeRect(-CELL_SIZE/2 + 2, -CELL_SIZE/2 + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                ctx.restore();
                return; // Do not draw actual image/text
            }
        }
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
            let showSpecial = document.getElementById('showSpecialRoomsCheck')?.checked;
            if (isFogMode) {
                showSpecial = fogState.settings.showFullRoom;
            }
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
                let tRot = TEXTURE_ROTATION[key] || 0;
                if (key === 'EzEndroom' && typeof isDrawMode !== 'undefined' && isDrawMode) tRot = -90; // Draw Mode override
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
    let hideText = document.getElementById('hideTextCheck')?.checked || !showSpecialText;
    if (isFogMode) hideText = true;
    
    processedRooms.forEach(r => {
        if (typeof isFogMode !== 'undefined' && isFogMode && !fogState.discoveredRooms.has(r.id)) return;
        let isImportant = r.originalName === 'LczClassDSpawn' || r.originalName === 'EzCheckpoint' || r.originalName === 'HczCheckpointToEntranceZone';
        if (hideText && !isImportant) return;

        ctx.globalAlpha = (isNavHighlight && !inRoute(r)) ? 0.2 : 1.0;
        if (r.shortName !== '') {
            let cx = r.cx;
            let cy = r.cy;
            if (typeof isFogMode !== 'undefined' && isFogMode && fogState.rotationAngle) {
                let angle = fogState.rotationAngle * Math.PI / 180;
                let rx = cx * Math.cos(angle) - cy * Math.sin(angle);
                let ry = cx * Math.sin(angle) + cy * Math.cos(angle);
                cx = rx; cy = ry;
            }
            const screenX = cx * zoomScale + cameraX;
            const screenY = cy * zoomScale + cameraY;
            
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
    // Draw mode: reveal click
    if (typeof isDrawMode !== 'undefined' && isDrawMode && drawRevealMode && e.button === 0) {
        let rect = wrapper.getBoundingClientRect();
        let worldX = ((e.clientX - rect.left) - cameraX) / zoomScale;
        let worldY = ((e.clientY - rect.top) - cameraY) / zoomScale;
        let cx = Math.floor(worldX / CELL_SIZE) * CELL_SIZE + CELL_SIZE / 2;
        let cy = Math.floor(worldY / CELL_SIZE) * CELL_SIZE + CELL_SIZE / 2;

        let tr = drawState.templateMap.find(r => r.cx === cx && r.cy === cy);
        if (tr && !isDrawAnchor(tr.originalName)) {
            // Check if already revealed
            let idx = drawState.placedRooms.findIndex(r => r.cx === cx && r.cy === cy && !r.isAnchor);
            let alreadyRevealed = (idx !== -1 && drawState.placedRooms[idx].status === 'revealed');
            
            if (!alreadyRevealed) {
                if (idx !== -1) drawState.placedRooms.splice(idx, 1);
                drawState.placedRooms.push({
                    cx: tr.cx, cy: tr.cy, name: tr.name, shape: tr.shape, rotation: tr.effectiveRot,
                    originalName: tr.originalName, shortName: tr.shortName, isAnchor: false, status: 'revealed'
                });
                
                // Add penalty
                let diff = drawState.difficulty;
                let cost = diff === 'hard' ? 10 : 5;
                drawState.penalty += cost;
                updateDrawUIStats();
                
                updateDrawPlacedCount();
                drawCanvas();
            }
        }
        drawRevealMode = false;
        wrapper.style.cursor = 'grab';
        closeDrawToast();
        return;
    }

    // Draw mode: right-click to remove
    if (typeof isDrawMode !== 'undefined' && isDrawMode && e.button === 2) {
        e.preventDefault();
        let rect = wrapper.getBoundingClientRect();
        let worldX = ((e.clientX - rect.left) - cameraX) / zoomScale;
        let worldY = ((e.clientY - rect.top) - cameraY) / zoomScale;
        let cx = Math.floor(worldX / CELL_SIZE) * CELL_SIZE + CELL_SIZE / 2;
        let cy = Math.floor(worldY / CELL_SIZE) * CELL_SIZE + CELL_SIZE / 2;

        let idx = drawState.placedRooms.findIndex(r => r.cx === cx && r.cy === cy);
        if (idx !== -1 && !drawState.placedRooms[idx].isAnchor && drawState.placedRooms[idx].status !== 'revealed') {
            drawState.placedRooms.splice(idx, 1);
            if (drawState.difficulty === 'easy') validateDrawMap(false);
            updateDrawPlacedCount();
            drawCanvas();
        }
        return;
    }

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
    
    let worldX = (mouseX - cameraX) / zoomScale;
    let worldY = (mouseY - cameraY) / zoomScale;
    if (typeof isFogMode !== 'undefined' && isFogMode && fogState.rotationAngle) {
        let angle = -fogState.rotationAngle * Math.PI / 180;
        let rx = worldX * Math.cos(angle) - worldY * Math.sin(angle);
        let ry = worldX * Math.sin(angle) + worldY * Math.cos(angle);
        worldX = rx; worldY = ry;
    }
    
    let foundRoom = null;
    for (let r of processedRooms) {
        if (Math.abs(r.cx - worldX) < CELL_SIZE/2 && Math.abs(r.cy - worldY) < CELL_SIZE/2) {
            foundRoom = r;
            break;
        }
    }

    if (hoveredRoom !== foundRoom) {
        hoveredRoom = foundRoom;
        drawCanvas();
    }

    const disableTooltips = document.getElementById('disableTooltipsCheck')?.checked;
    const showSpecialText = document.getElementById('showSpecialRoomsCheck')?.checked;

    if (foundRoom && !disableTooltips) {
        if (typeof isFogMode !== 'undefined' && isFogMode) {
            document.getElementById('customTooltip').style.display = 'none';
            if (fogState.adjacentRooms.has(foundRoom.id)) {
                wrapper.style.cursor = 'pointer';
            } else {
                wrapper.style.cursor = isDragging ? 'grabbing' : 'grab';
            }
        } else {
            const tooltip = document.getElementById('customTooltip');
            tooltip.style.display = 'block';
            tooltip.style.left = (e.clientX + 15) + 'px';
            tooltip.style.top = (e.clientY + 15) + 'px';
            
            let text = foundRoom.shortName ? `${foundRoom.originalName} (${foundRoom.shortName})\n${foundRoom.zoneName}` : `${foundRoom.originalName}\n${foundRoom.zoneName}`;
            if (navState !== 'none') {
                text += `\n[Кликните для выбора]`;
                wrapper.style.cursor = 'crosshair';
            } else {
                wrapper.style.cursor = isDragging ? 'grabbing' : 'grab';
            }
            tooltip.textContent = text;
        }
    } else {
        document.getElementById('customTooltip').style.display = 'none';
        wrapper.style.cursor = (navState !== 'none') ? 'crosshair' : (isDragging ? 'grabbing' : 'grab');
    }
});

wrapper.addEventListener('click', (e) => {
    if (mouseMoved) return;

    if (typeof isFogMode !== 'undefined' && isFogMode) {
        const rect = wrapper.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        let worldX = (mouseX - cameraX) / zoomScale;
        let worldY = (mouseY - cameraY) / zoomScale;
        if (typeof isFogMode !== 'undefined' && isFogMode && fogState.rotationAngle) {
            let angle = -fogState.rotationAngle * Math.PI / 180;
            let rx = worldX * Math.cos(angle) - worldY * Math.sin(angle);
            let ry = worldX * Math.sin(angle) + worldY * Math.cos(angle);
            worldX = rx; worldY = ry;
        }
        let foundRoom = null;
        for (let r of processedRooms) {
            if (Math.abs(r.cx - worldX) < CELL_SIZE/2 && Math.abs(r.cy - worldY) < CELL_SIZE/2) {
                foundRoom = r;
                break;
            }
        }
        if (foundRoom && !fogState.discoveredRooms.has(foundRoom.id) && fogState.adjacentRooms.has(foundRoom.id)) {
            fogState.discoveredRooms.add(foundRoom.id);
            fogState.steps++;
            document.getElementById('fogStepCount').textContent = fogState.steps;
            updateFogAdjacency();
            drawCanvas();
        }
        return;
    }

    if (navState === 'none') return;

    const rect = wrapper.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    let worldX = (mouseX - cameraX) / zoomScale;
    let worldY = (mouseY - cameraY) / zoomScale;
    if (typeof isFogMode !== 'undefined' && isFogMode && fogState.rotationAngle) {
        let angle = -fogState.rotationAngle * Math.PI / 180;
        let rx = worldX * Math.cos(angle) - worldY * Math.sin(angle);
        let ry = worldX * Math.sin(angle) + worldY * Math.cos(angle);
        worldX = rx; worldY = ry;
    }
    
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
    
    let worldX = (mouseX - cameraX) / zoomScale;
    let worldY = (mouseY - cameraY) / zoomScale;
    
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


let isDrawMode = false;
let drawRevealMode = false;

let drawState = {
    zone: 'LightContainment',
    difficulty: 'easy',
    templateMap: [],
    placedRooms: [],
    templateName: '',
    minX: 0, minY: 0, maxX: 0, maxY: 0,
    mediumInterval: null,
    attempts: 3
,
    settings: {
        lczColor: '#f59e0b',
        hczColor: '#ef4444',
        ezColor: '#10b981',
        bgColor: '#020617',
        naming: {
            LightContainment: 'game',
            HeavyContainment: 'game',
            Entrance: 'game'
        }
    }};

let currentTrainerZone = null;
let currentTrainerStart = null;

function loadSettings() {
    // Load fog mode UI selections
    let savedFogZone = localStorage.getItem('fogTrainerZone') || 'LightContainment';
    selectTrainerZone(savedFogZone);
    let savedFogStart = localStorage.getItem('fogTrainerStart') || 'auto';
    selectTrainerStart(savedFogStart);

    // Load draw mode UI selections
    let savedDrawZone = localStorage.getItem('drawTrainerZone') || 'LightContainment';
    selectDrawZone(savedDrawZone);

    let savedDrawDiff = localStorage.getItem('drawTrainerDiff') || 'easy';
    selectDrawDiff(savedDrawDiff);

    // Load draw settings
    drawState.settings.lczColor = localStorage.getItem('drawLczColor') || '#f59e0b';
    drawState.settings.hczColor = localStorage.getItem('drawHczColor') || '#ef4444';
    drawState.settings.ezColor = localStorage.getItem('drawEzColor') || '#10b981';
    drawState.settings.bgColor = localStorage.getItem('drawBgColor') || '#020617';
    drawState.settings.naming.LightContainment = localStorage.getItem('drawLczNaming') || 'game';
    drawState.settings.naming.HeavyContainment = localStorage.getItem('drawHczNaming') || 'game';
    drawState.settings.naming.Entrance = localStorage.getItem('drawEzNaming') || 'game';
    
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
        
        const res = await fetch('data/DumpedMapData.json');
        let fullData = await res.json();
        globalDumpedData = fullData;
        let hcz = globalDumpedData.Generators["HeavyContainment"];
        if(hcz) {
            for(let r of hcz.CompatibleRooms) {
                if(r.Name === "Unnamed" && r.MaxAmount === 1) {
                    if(r.Shape === "TShape") r.OriginalName = "HCZ_JunkMain";
                    else if(r.Shape === "Straight") {
                        if(Math.abs(r.ChanceMultiplier - 5.0) < 0.01) r.OriginalName = "HCZ_FunnyCorridor";
                        else r.OriginalName = "HCZ_PipesMain";
                    }
                }
            }
        }
        layoutDatabase = {
            LightContainment: fullData.Generators.LightContainment.Atlases.map(a => a.Name),
            HeavyContainment: fullData.Generators.HeavyContainment.Atlases.map(a => a.Name),
            Entrance: fullData.Generators.Entrance.Atlases.map(a => a.Name)
        };

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
        

        

        let namingMode = 'game';
        if (prefix === 'LC') namingMode = localStorage.getItem('lczNaming') || 'game';
        if (prefix === 'HC') namingMode = localStorage.getItem('hczNaming') || 'game';
        if (prefix === 'EZ') namingMode = localStorage.getItem('ezNaming') || 'game';

        let btnName = namingMode === 'community' ? TEMPLATE_ALIASES_COMMUNITY[key] : TEMPLATE_ALIASES_GAME[key];
        
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
        currentMapData = await window.generateFacilityMap(currentZone, key, seed);
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



// --- FOG OF WAR LOGIC ---


function openTrainerApp() {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('layoutsApp').classList.add('hidden');
    document.getElementById('trainerApp').classList.remove('hidden');

    const saved = localStorage.getItem('trainerSettings');
    if (saved) {
        try {
            const tSettings = JSON.parse(saved);
            if (tSettings.zone) selectTrainerZone(tSettings.zone);
            let savedScp = localStorage.getItem('fogScpSpawn');
            if (savedScp && document.getElementById('fogScpSpawnSelect')) {
                document.getElementById('fogScpSpawnSelect').value = savedScp;
            }
            if (tSettings.startPos) selectTrainerStart(tSettings.startPos);
            
            document.getElementById('fogShowFullRoomCheck').checked = !!tSettings.showFullRoom;
            if (tSettings.lczColor) document.getElementById('fogLczColor').value = tSettings.lczColor;
            if (tSettings.hczColor) document.getElementById('fogHczColor').value = tSettings.hczColor;
            if (tSettings.ezColor) document.getElementById('fogEzColor').value = tSettings.ezColor;
            if (tSettings.bgColor) document.getElementById('fogBgColor').value = tSettings.bgColor;
            if (tSettings.randomRotation !== undefined) document.getElementById('fogRandomRotationCheck').checked = !!tSettings.randomRotation;
            
        } catch(e){}
    }
}

function closeTrainerApp() {
    document.getElementById('trainerApp').classList.add('hidden');
    document.getElementById('mainMenu').style.display = 'flex';
}

function selectTrainerZone(zone) {
    currentTrainerZone = zone;
    
    // Update active class
    document.getElementById('trainerZoneLight').classList.remove('active');
    document.getElementById('trainerZoneHeavy').classList.remove('active');
    document.getElementById('trainerZoneEntrance').classList.remove('active');
    
    let autoText = 'Авто (Чекпоинт)';
    if (zone === 'LightContainment') {
        document.getElementById('trainerZoneLight').classList.add('active');
        autoText = 'Авто (D-Блок)';
    } else if (zone === 'HeavyContainment') {
        document.getElementById('trainerZoneHeavy').classList.add('active');
    } else if (zone === 'Entrance') {
        document.getElementById('trainerZoneEntrance').classList.add('active');
    }
    saveTrainerSettings();
    let roleBtn = document.getElementById('trainerStartRole');
    let scpSet = document.getElementById('scpSpawnSettings');
    if (roleBtn) {
        if (zone === 'LightContainment') roleBtn.innerText = 'Спавн Ученых';
        else if (zone === 'HeavyContainment') roleBtn.innerText = 'Спавн SCP';
        else if (zone === 'Entrance') roleBtn.innerText = 'Спавн Охраны';
    }
    saveTrainerSettings();
    if (scpSet) {
        if (zone === 'HeavyContainment') scpSet.classList.remove('hidden');
        else scpSet.classList.add('hidden');
    }


    document.getElementById('trainerStartAuto').textContent = autoText;
    
    localStorage.setItem('fogTrainerZone', zone);

    // Enable start section
    let startSec = document.getElementById('trainerStartSection');
    startSec.style.opacity = '1';
    startSec.style.pointerEvents = 'auto';

    checkTrainerReady();
}

function selectTrainerStart(start) {
    currentTrainerStart = start;
    
    document.getElementById('trainerStartAuto').classList.remove('active');
    document.getElementById('trainerStartRandom').classList.remove('active');
    if(document.getElementById('trainerStartRole')) document.getElementById('trainerStartRole').classList.remove('active');
    
    if (start === 'auto') {
        document.getElementById('trainerStartAuto').classList.add('active');
    } else if (start === 'random') {
        document.getElementById('trainerStartRandom').classList.add('active');
    } else if (start === 'rolespawn') {
        if(document.getElementById('trainerStartRole')) document.getElementById('trainerStartRole').classList.add('active');
    }
    
    localStorage.setItem('fogTrainerStart', start);
    checkTrainerReady();
}

function checkTrainerReady() {
    let btn = document.getElementById('trainerStartBtn');
    if (currentTrainerZone && currentTrainerStart) {
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
        btn.style.cursor = 'pointer';
    } else {
        btn.style.opacity = '0.5';
        btn.style.pointerEvents = 'none';
        btn.style.cursor = 'not-allowed';
    }
}


// ==================== DRAW SETTINGS ====================

let drawSelectedTemplates = null;

async function renderDrawTemplateSettings() {
    let container = document.getElementById('drawTabGameplay');
    if (!container) return;
    
    if (!layoutDatabase) await fetchLayouts();
    
    container.innerHTML = '<h2 style="color: white; font-size: 1.1rem; margin-bottom: 1rem;">Выбор шаблонов</h2>';
    
    if (!drawSelectedTemplates) {
        drawSelectedTemplates = {};
        for (let zone in layoutDatabase) {
            drawSelectedTemplates[zone] = [...layoutDatabase[zone]];
        }
    }
    
    const zonesConfig = [
        { key: 'LightContainment', name: 'Лёгкая зона', color: '#fbbf24' },
        { key: 'HeavyContainment', name: 'Тяжёлая зона', color: '#ea580c' },
        { key: 'Entrance', name: 'Офисная зона', color: '#10b981' }
    ];
    
    zonesConfig.forEach(zc => {
        let templates = layoutDatabase[zc.key];
        if (!templates || templates.length === 0) return;
        
        let zoneDiv = document.createElement('div');
        zoneDiv.style.marginBottom = '1.5rem';
        
        let label = document.createElement('div');
        label.textContent = zc.name;
        label.style.color = '#94a3b8';
        label.style.marginBottom = '0.5rem';
        zoneDiv.appendChild(label);
        
        let btnContainer = document.createElement('div');
        btnContainer.style.display = 'flex';
        btnContainer.style.flexWrap = 'wrap';
        btnContainer.style.gap = '0.5rem';
        
        templates.forEach((t, idx) => {
            let btn = document.createElement('button');
            let isSelected = drawSelectedTemplates[zc.key].includes(t);
            btn.textContent = (idx + 1).toString();
            btn.className = 'template-btn';
            btn.style.width = '40px';
            btn.style.height = '40px';
            btn.style.borderRadius = '8px';
            btn.style.display = 'flex';
            btn.style.alignItems = 'center';
            btn.style.justifyContent = 'center';
            btn.style.padding = '0';
            btn.style.border = `2px solid ${zc.color}`;
            btn.style.fontWeight = 'bold';
            btn.style.cursor = 'pointer';
            btn.style.transition = 'all 0.2s';
            
            if (isSelected) {
                btn.style.backgroundColor = zc.color;
                btn.style.color = '#0f172a';
            } else {
                btn.style.backgroundColor = 'transparent';
                btn.style.color = zc.color;
            }
            
            btn.onclick = () => {
                if (isSelected) {
                    drawSelectedTemplates[zc.key] = drawSelectedTemplates[zc.key].filter(x => x !== t);
                } else {
                    drawSelectedTemplates[zc.key].push(t);
                }
                renderDrawTemplateSettings();
            };
            
            btnContainer.appendChild(btn);
        });
        
        zoneDiv.appendChild(btnContainer);
        container.appendChild(zoneDiv);
    });
}

function openDrawSettings() {
    let dsLcz = document.getElementById('drawLczNamingSelect');
    if (dsLcz) dsLcz.value = drawState.settings.naming.LightContainment;
    let dsHcz = document.getElementById('drawHczNamingSelect');
    if (dsHcz) dsHcz.value = drawState.settings.naming.HeavyContainment;
    let dsEz = document.getElementById('drawEzNamingSelect');
    if (dsEz) dsEz.value = drawState.settings.naming.Entrance;

    let dsLczCol = document.getElementById('drawLczColorPicker');
    if (dsLczCol) dsLczCol.value = drawState.settings.lczColor;
    let dsHczCol = document.getElementById('drawHczColorPicker');
    if (dsHczCol) dsHczCol.value = drawState.settings.hczColor;
    let dsEzCol = document.getElementById('drawEzColorPicker');
    if (dsEzCol) dsEzCol.value = drawState.settings.ezColor;
    let dsBgCol = document.getElementById('drawBgColorPicker');
    if (dsBgCol) dsBgCol.value = drawState.settings.bgColor;

    renderDrawTemplateSettings();
    document.getElementById('drawSettingsView').classList.remove('hidden');
}

function closeDrawSettings() {
    document.getElementById('drawSettingsView').classList.add('hidden');
}

function saveDrawSettings() {
    let dsLcz = document.getElementById('drawLczNamingSelect');
    if (dsLcz) drawState.settings.naming.LightContainment = dsLcz.value;
    let dsHcz = document.getElementById('drawHczNamingSelect');
    if (dsHcz) drawState.settings.naming.HeavyContainment = dsHcz.value;
    let dsEz = document.getElementById('drawEzNamingSelect');
    if (dsEz) drawState.settings.naming.Entrance = dsEz.value;

    let dsLczCol = document.getElementById('drawLczColorPicker');
    if (dsLczCol) drawState.settings.lczColor = dsLczCol.value;
    let dsHczCol = document.getElementById('drawHczColorPicker');
    if (dsHczCol) drawState.settings.hczColor = dsHczCol.value;
    let dsEzCol = document.getElementById('drawEzColorPicker');
    if (dsEzCol) drawState.settings.ezColor = dsEzCol.value;
    let dsBgCol = document.getElementById('drawBgColorPicker');
    if (dsBgCol) drawState.settings.bgColor = dsBgCol.value;

    localStorage.setItem('drawLczNaming', drawState.settings.naming.LightContainment);
    localStorage.setItem('drawHczNaming', drawState.settings.naming.HeavyContainment);
    localStorage.setItem('drawEzNaming', drawState.settings.naming.Entrance);
    localStorage.setItem('drawLczColor', drawState.settings.lczColor);
    localStorage.setItem('drawHczColor', drawState.settings.hczColor);
    localStorage.setItem('drawEzColor', drawState.settings.ezColor);
    localStorage.setItem('drawBgColor', drawState.settings.bgColor);

    if (typeof drawCanvas === 'function') drawCanvas();
}

function switchDrawSettingsTab(tab) {
    document.getElementById('drawTabGameplayBtn').classList.remove('active');
    document.getElementById('drawTabDesignBtn').classList.remove('active');
    document.getElementById('drawTabGameplay').classList.add('hidden');
    document.getElementById('drawTabDesign').classList.add('hidden');

    if (tab === 'gameplay') {
        document.getElementById('drawTabGameplayBtn').classList.add('active');
        document.getElementById('drawTabGameplay').classList.remove('hidden');
    } else {
        document.getElementById('drawTabDesignBtn').classList.add('active');
        document.getElementById('drawTabDesign').classList.remove('hidden');
    }
}

function importGlobalDesignToDraw() {
    const style = getComputedStyle(document.documentElement);
    let gLcz = localStorage.getItem('--lcz-color') || style.getPropertyValue('--lcz-color').trim() || '#f59e0b';
    let gHcz = localStorage.getItem('--hcz-color') || style.getPropertyValue('--hcz-color').trim() || '#ef4444';
    let gEz = localStorage.getItem('--ez-color') || style.getPropertyValue('--ez-color').trim() || '#10b981';
    let gBg = localStorage.getItem('--bg-color') || style.getPropertyValue('--bg-color').trim() || '#020617';

    drawState.settings.lczColor = gLcz;
    drawState.settings.hczColor = gHcz;
    drawState.settings.ezColor = gEz;
    drawState.settings.bgColor = gBg;

    let dsLczCol = document.getElementById('drawLczColorPicker');
    if (dsLczCol) dsLczCol.value = gLcz;
    let dsHczCol = document.getElementById('drawHczColorPicker');
    if (dsHczCol) dsHczCol.value = gHcz;
    let dsEzCol = document.getElementById('drawEzColorPicker');
    if (dsEzCol) dsEzCol.value = gEz;
    let dsBgCol = document.getElementById('drawBgColorPicker');
    if (dsBgCol) dsBgCol.value = gBg;

    let globLcz = document.getElementById('lczNamingSelect');
    if (globLcz) {
        document.getElementById('drawLczNamingSelect').value = globLcz.value;
        drawState.settings.naming.LightContainment = globLcz.value;
    }
    let globHcz = document.getElementById('hczNamingSelect');
    if (globHcz) {
        document.getElementById('drawHczNamingSelect').value = globHcz.value;
        drawState.settings.naming.HeavyContainment = globHcz.value;
    }
    let globEz = document.getElementById('ezNamingSelect');
    if (globEz) {
        document.getElementById('drawEzNamingSelect').value = globEz.value;
        drawState.settings.naming.Entrance = globEz.value;
    }

    saveDrawSettings();
}

function openTrainerSettings() {
    let tsLcz = document.getElementById('fogLczNamingSelect');
    if (tsLcz) tsLcz.value = localStorage.getItem('fogLczNaming') || 'game';
    let tsHcz = document.getElementById('fogHczNamingSelect');
    if (tsHcz) tsHcz.value = localStorage.getItem('fogHczNaming') || 'game';
    let tsEz = document.getElementById('fogEzNamingSelect');
    if (tsEz) tsEz.value = localStorage.getItem('fogEzNaming') || 'game';

    document.getElementById('trainerSettingsModal').classList.remove('hidden');
}

function closeTrainerSettings() {
    document.getElementById('trainerSettingsModal').classList.add('hidden');
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        let ts = document.getElementById('trainerSettingsModal');
        if (ts && !ts.classList.contains('hidden')) {
            closeTrainerSettings();
        }
    }
});

function importGlobalDesignToFog() {
    const style = getComputedStyle(document.documentElement);
    document.getElementById('fogLczColor').value = style.getPropertyValue('--lcz-color').trim() || '#f59e0b';
    document.getElementById('fogHczColor').value = style.getPropertyValue('--hcz-color').trim() || '#ef4444';
    document.getElementById('fogEzColor').value = style.getPropertyValue('--ez-color').trim() || '#10b981';
    document.getElementById('fogBgColor').value = style.getPropertyValue('--bg-color').trim() || '#020617';
    document.getElementById('fogShowFullRoomCheck').checked = document.getElementById('showSpecialRoomsCheck').checked;
    
    // Sync naming fields from global to fog local
    let globLcz = document.getElementById('lczNamingSelect');
    if (globLcz) {
        document.getElementById('fogLczNamingSelect').value = globLcz.value;
        localStorage.setItem('fogLczNaming', globLcz.value);
    }
    let globHcz = document.getElementById('hczNamingSelect');
    if (globHcz) {
        document.getElementById('fogHczNamingSelect').value = globHcz.value;
        localStorage.setItem('fogHczNaming', globHcz.value);
    }
    let globEz = document.getElementById('ezNamingSelect');
    if (globEz) {
        document.getElementById('fogEzNamingSelect').value = globEz.value;
        localStorage.setItem('fogEzNaming', globEz.value);
    }
}


function getTemplateName(key) {
    
    
    
    let prefix = key.split('_')[0];
    let namingMode = 'game';
    let isFog = (typeof isFogMode !== 'undefined' && isFogMode);
    
    if (prefix === 'LC') namingMode = localStorage.getItem(isFog ? 'fogLczNaming' : 'lczNaming') || 'game';
    if (prefix === 'HC') namingMode = localStorage.getItem(isFog ? 'fogHczNaming' : 'hczNaming') || 'game';
    if (prefix === 'EZ') namingMode = localStorage.getItem(isFog ? 'fogEzNaming' : 'ezNaming') || 'game';

    let n1 = TEMPLATE_ALIASES_GAME[key] || key;
    let n2 = TEMPLATE_ALIASES_COMMUNITY[key] || '';

    if (namingMode === 'community' && n2) return n2;
    if (namingMode === 'game') return n1;
    
    if (n2) return n1 + " - " + n2;
    return n1;
}

async function startFogGame() {
    if (!currentTrainerZone || !currentTrainerStart) return;
    
    document.getElementById('trainerApp').classList.add('hidden');
    closeGameOverAndMenu(true);
    
    // Switch to map view and hide sidebar immediately
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('layoutsApp').classList.remove('hidden');
    let sb = document.querySelector('.sidebar'); if(sb) sb.style.display = 'none';
    
    if (!layoutDatabase) {
        await fetchLayouts();
    }
    
    // Save settings
    const tSettings = {
        zone: currentTrainerZone,
        startPos: currentTrainerStart,
        showFullRoom: document.getElementById('fogShowFullRoomCheck').checked,
        randomRotation: document.getElementById('fogRandomRotationCheck').checked,
        lczColor: document.getElementById('fogLczColor').value,
        hczColor: document.getElementById('fogHczColor').value,
        ezColor: document.getElementById('fogEzColor').value,
        bgColor: document.getElementById('fogBgColor').value
    };
    localStorage.setItem('trainerSettings', JSON.stringify(tSettings));
    
    fogState.zone = currentTrainerZone;
    fogState.startPos = currentTrainerStart;
    fogState.settings.showFullRoom = document.getElementById('fogShowFullRoomCheck').checked;
    fogState.settings.lczColor = document.getElementById('fogLczColor').value;
    fogState.settings.hczColor = document.getElementById('fogHczColor').value;
    fogState.settings.ezColor = document.getElementById('fogEzColor').value;
    fogState.settings.bgColor = document.getElementById('fogBgColor').value;
    fogState.settings.randomRotation = document.getElementById('fogRandomRotationCheck').checked;
    if (fogState.settings.randomRotation) {
        const angles = [0, 90, 180, 270];
        fogState.rotationAngle = angles[Math.floor(Math.random() * angles.length)];
    } else {
        fogState.rotationAngle = 0;
    }
    
    fogState.steps = 0;
    fogState.mistakes = 0;
    fogState.discoveredRooms.clear();
    fogState.adjacentRooms.clear();
    
    document.getElementById('fogStepCount').textContent = '0';
    document.getElementById('fogMistakesCount').textContent = '1/2';
    
    let rec = fogState.stats.records[fogState.zone];
    document.getElementById('fogRecordCount').textContent = rec === Infinity ? '-' : rec;
    
    let hist = fogState.stats.history[fogState.zone];
    if (hist.length > 0) {
        let avg = hist.reduce((a,b)=>a+b, 0) / hist.length;
        document.getElementById('fogAvgCount').textContent = avg.toFixed(1);
    } else {
        document.getElementById('fogAvgCount').textContent = '-';
    }

    document.getElementById('fogGameUI').classList.remove('hidden');
    isFogMode = true;
    currentZone = fogState.zone;
    
    updateCSSVariable('--bg-color', fogState.settings.bgColor);
    
    let templates = layoutDatabase[currentZone];
    fogState.targetTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    try {
        let seed = Math.floor(Math.random() * 9999999);
        currentMapData = await window.generateFacilityMap(currentZone, fogState.targetTemplate, seed);
        
        
        
        
        processMapData();
        initFogLogic();
        
    } catch(e) {
        console.error("Failed to start fog game", e);
        alert("Ошибка при старте: " + e.message);
    }
}

function initFogLogic() {
    let startRoom = null;
    let zoneRooms = processedRooms.filter(r => r.zoneName === fogState.zone);
    
    if (fogState.startPos === 'rolespawn') {
        let scpChoice = document.getElementById('fogScpSpawnSelect') ? document.getElementById('fogScpSpawnSelect').value : 'random';
        
        if (fogState.zone === 'LightContainment') {
            let possible = zoneRooms.filter(r => {
                let name = r.originalName;
                if (name === 'LczCheckpointA' || name === 'LczCheckpointB' || name === 'LczToilets' || name === 'LczArmory' || name === 'LczGlassroom') return true;
                if (name === 'Unnamed' && r.shape === 'Straight') return true;
                return false;
            });
            if (possible.length > 0) startRoom = possible[Math.floor(Math.random() * possible.length)];
        } else if (fogState.zone === 'HeavyContainment') {
            let targetNames = [];
            if (scpChoice === '173' || scpChoice === '049') targetNames = ['Hcz049'];
            else if (scpChoice === '096') targetNames = ['Hcz096'];
            else if (scpChoice === '106') targetNames = ['Hcz106'];
            else if (scpChoice === '079') targetNames = ['Hcz079'];
            else if (scpChoice === '939') targetNames = ['Hcz939'];
            else targetNames = ['Hcz049', 'Hcz096', 'Hcz106', 'Hcz079', 'Hcz939'];
            
            let possibleRooms = zoneRooms.filter(r => targetNames.includes(r.originalName));
            if (possibleRooms.length > 0) startRoom = possibleRooms[Math.floor(Math.random() * possibleRooms.length)];
        } else if (fogState.zone === 'Entrance') {
            let unsafe = new Set();
            zoneRooms.forEach(r => {
                let n = r.originalName.toLowerCase();
                if (n.includes('gate') || n.includes('checkpoint') || n.includes('shelter')) {
                    unsafe.add(r.x + ',' + r.y);
                    [[0,1], [0,-1], [1,0], [-1,0]].forEach(dir => {
                        unsafe.add((r.x + dir[0]) + ',' + (r.y + dir[1]));
                    });
                }
            });
            
            let safeRooms = zoneRooms.filter(r => {
                if (unsafe.has(r.x + ',' + r.y)) return false;
                if (r.originalName === 'EzRedroom') return true;
                if (r.originalName === 'Unnamed' && ['Straight', 'Curve', 'XShape', 'TShape'].includes(r.shape)) return true;
                return false;
            });
            if (safeRooms.length > 0) startRoom = safeRooms[Math.floor(Math.random() * safeRooms.length)];
        }
    } else if (fogState.startPos === 'auto') {
        if (fogState.zone === 'LightContainment') {
            startRoom = zoneRooms.find(r => r.originalName.toLowerCase().includes('classd'));
        } else if (fogState.zone === 'HeavyContainment') {
            startRoom = zoneRooms.find(r => r.originalName.toLowerCase().includes('checkpoint'));
        } else if (fogState.zone === 'Entrance') {
            let checks = zoneRooms.filter(r => r.originalName === 'EzCheckpoint' || r.originalName === 'HczCheckpointToEntranceZone');
            if (checks.length > 0) {
                // Lower checkpoint visually means largest cy
                startRoom = checks.reduce((prev, curr) => (prev.cy > curr.cy) ? prev : curr);
            }
        }
    }
    
    if (!startRoom && zoneRooms.length > 0) {
        startRoom = zoneRooms[Math.floor(Math.random() * zoneRooms.length)];
    }
    
    if(startRoom) {
        fogState.discoveredRooms.add(startRoom.id);
        let targetX = startRoom.cx;
        let targetY = startRoom.cy;
        
        if (fogState.rotationAngle) {
            let angle = fogState.rotationAngle * Math.PI / 180;
            let rx = targetX * Math.cos(angle) - targetY * Math.sin(angle);
            let ry = targetX * Math.sin(angle) + targetY * Math.cos(angle);
            targetX = rx;
            targetY = ry;
        }
        
        cameraX = (document.getElementById('mapContainer').clientWidth / 2) - targetX * zoomScale;
        cameraY = (document.getElementById('mapContainer').clientHeight / 2) - targetY * zoomScale;
    }
    
    updateFogAdjacency();
    drawCanvas();
}

function updateFogAdjacency() {
    fogState.adjacentRooms.clear();
    processedRooms.forEach(r => {
        if (fogState.discoveredRooms.has(r.id)) {
            r.globalDoors.forEach(d => {
                let dx = 0, dy = 0;
                if (d === 0) dy = 1;      // North
                else if (d === 1) dx = 1; // East
                else if (d === 2) dy = -1; // South
                else if (d === 3) dx = -1; // West
                
                let nx = r.x + dx, ny = r.y + dy;
                
                // Find neighbor in processedRooms
                let neighbor = processedRooms.find(pr => pr.x === nx && pr.y === ny && pr.zoneName === r.zoneName);
                if (neighbor && !fogState.discoveredRooms.has(neighbor.id)) {
                    let oppositeDoor = (d + 2) % 4; // since d is 0..3
                    if (neighbor.globalDoors.includes(oppositeDoor)) {
                        fogState.adjacentRooms.add(neighbor.id);
                    }
                }
            });
        }
    });
}

function openGuessModal() {
    const list = document.getElementById('guessTemplateList');
    list.innerHTML = '';
    let templates = layoutDatabase[fogState.zone];
    
    templates.forEach((key) => {
        let btn = document.createElement('button');
        btn.className = 'template-btn';
        btn.style.width = '100%';
        btn.style.textAlign = 'left';
        btn.textContent = getTemplateName(key);
        btn.onclick = () => submitGuess(key);
        list.appendChild(btn);
    });
    
    document.getElementById('guessTemplateModal').classList.remove('hidden');
}

function closeGuessModal() {
    document.getElementById('guessTemplateModal').classList.add('hidden');
}

function submitGuess(key) {
    closeGuessModal();
    if (key === fogState.targetTemplate) {
        showGameOver(true, key);
    } else {
        fogState.mistakes++;
        document.getElementById('fogMistakesCount').textContent = (fogState.mistakes + 1) + '/2';
        if (fogState.mistakes === 1) {
            let btn = document.querySelector('#fogGameUI button[onclick="openGuessModal()"]');
            let oldBorder = btn.style.borderColor;
            let oldColor = btn.style.color;
            btn.style.borderColor = '#ef4444';
            btn.style.color = '#ef4444';
            btn.textContent = 'Ошибка! Ещё шанс';
            setTimeout(() => {
                btn.style.borderColor = oldBorder;
                btn.style.color = oldColor;
                btn.textContent = 'Я знаю!';
            }, 2000);
        }
        if (fogState.mistakes >= 2) {
            showGameOver(false, fogState.targetTemplate);
        }
    }
}

function showGameOver(isWin, correctKey) {
    isFogMode = false;
    document.getElementById('fogGameUI').classList.add('hidden');
    
    drawCanvas();
    
    let correctName = getTemplateName(correctKey);
    document.getElementById('gameOverCorrectTemplate').textContent = correctName;
    
    let title = document.getElementById('gameOverTitle');
    let subtitle = document.getElementById('gameOverSubtitle');
    let box = document.getElementById('gameOverBox');
    
    if (isWin) {
        title.textContent = 'Победа!';
        title.style.color = '#10b981';
        box.style.borderColor = '#10b981';
        subtitle.textContent = `Вы угадали шаблон за ${fogState.steps} ходов!`;
        
        if (fogState.mistakes === 0 && fogState.steps > 0) {
            let zoneStats = fogState.stats.history[fogState.zone];
            zoneStats.push(fogState.steps);
            if (zoneStats.length > 10) zoneStats.shift();
            
            if (fogState.steps < fogState.stats.records[fogState.zone]) {
                fogState.stats.records[fogState.zone] = fogState.steps;
            }
            
            localStorage.setItem('fogStats', JSON.stringify(fogState.stats));
        }
    } else {
        title.textContent = 'Поражение';
        title.style.color = '#ef4444';
        box.style.borderColor = '#ef4444';
        subtitle.textContent = 'Вы исчерпали права на ошибку.';
    }
    
    document.getElementById('gameOverModal').classList.remove('hidden');
}

function closeGameOverAndMenu(onlyCloseModal = false) {
    document.getElementById('gameOverModal').classList.add('hidden');
    if (!onlyCloseModal) {
        document.getElementById('layoutsApp').classList.add('hidden');
        document.getElementById('trainerApp').classList.remove('hidden');
        let sb = document.querySelector('.sidebar'); if(sb) sb.style.display = 'flex';
        const style = getComputedStyle(document.documentElement);
        updateCSSVariable('--bg-color', style.getPropertyValue('--bg-color').trim() || '#020617');
    }
}

function closeGameOverModalOnly() {
    document.getElementById('gameOverModal').classList.add('hidden');
    let pgui = document.getElementById('postGameUI');
    if(pgui) pgui.classList.remove('hidden');
    
    // Center camera on map
    let wrapperEl = document.getElementById('mapContainer');
    if (typeof processedRooms !== 'undefined' && processedRooms.length > 0) {
        let minX = Math.min(...processedRooms.map(r => r.cx)) - 100;
        let maxX = Math.max(...processedRooms.map(r => r.cx)) + 100;
        let minY = Math.min(...processedRooms.map(r => r.cy)) - 100;
        let maxY = Math.max(...processedRooms.map(r => r.cy)) + 100;
        
        let scaleX = wrapperEl.clientWidth / (maxX - minX);
        let scaleY = wrapperEl.clientHeight / (maxY - minY);
        zoomScale = Math.min(scaleX, scaleY) * 0.9;
        if (zoomScale > 1) zoomScale = 1;
        if (zoomScale < 0.2) zoomScale = 0.2;
        
        cameraX = wrapperEl.clientWidth / 2 - ((minX + maxX) / 2 * zoomScale);
        cameraY = wrapperEl.clientHeight / 2 - ((minY + maxY) / 2 * zoomScale);
        drawCanvas();
    }
}

function openGameOverModalOnly() {
    document.getElementById('gameOverModal').classList.remove('hidden');
    let pgui = document.getElementById('postGameUI');
    if(pgui) pgui.classList.add('hidden');
}

function exitFogGame() {
    isFogMode = false;
    document.getElementById('fogGameUI').classList.add('hidden');
    let pgui = document.getElementById('postGameUI');
    if(pgui) pgui.classList.add('hidden');
    closeGameOverAndMenu(false);
    drawCanvas();
}

function switchTrainerTab(tab) {
    document.getElementById('trainerTabDesignBtn').classList.remove('active');
    document.getElementById('trainerTabGameplayBtn').classList.remove('active');
    document.getElementById('trainerTabDesign').classList.add('hidden');
    document.getElementById('trainerTabGameplay').classList.add('hidden');
    
    if (tab === 'design') {
        document.getElementById('trainerTabDesignBtn').classList.add('active');
        document.getElementById('trainerTabDesign').classList.remove('hidden');
    } else {
        document.getElementById('trainerTabGameplayBtn').classList.add('active');
        document.getElementById('trainerTabGameplay').classList.remove('hidden');
    }
}

function saveTrainerSettings() {
    const tSettings = {
        zone: currentTrainerZone,
        startPos: currentTrainerStart,
        showFullRoom: document.getElementById('fogShowFullRoomCheck').checked,
        randomRotation: document.getElementById('fogRandomRotationCheck').checked,
        lczColor: document.getElementById('fogLczColor').value,
        hczColor: document.getElementById('fogHczColor').value,
        ezColor: document.getElementById('fogEzColor').value,
        bgColor: document.getElementById('fogBgColor').value
    };
    localStorage.setItem('trainerSettings', JSON.stringify(tSettings));
};


// ==================== DRAW MODE ("Нарисуй!") ====================

// --- Utility ---

function getGenericRoomName(zoneName, shape) {
    let prefix = zoneName === 'LightContainment' ? 'Lcz' : (zoneName === 'HeavyContainment' ? 'Hcz' : 'Ez');
    if (shape === 'Curve') return prefix + 'Curve';
    if (shape === 'Straight') return prefix + 'Straight';
    if (shape === 'XShape') return prefix + 'Cross';
    if (shape === 'TShape') return prefix + 'ThreeWay';
    if (shape === 'Endroom') return prefix + 'Endroom';
    return prefix + 'Straight';
}

function isDrawAnchor(name) {
    if (!name) return false;
    let n = name.toLowerCase();
    return n === 'lczclassdspawn' || n === 'hczcheckpointtoentrancezone' || n === 'ezcheckpoint';
}

// --- UI switching ---

function switchTrainerMode(mode) {
    let fogBtn = document.getElementById('trainerModeFogBtn');
    let drawBtn = document.getElementById('trainerModeDrawBtn');
    let fogConfig = document.getElementById('fogModeConfig');
    let fogActions = document.getElementById('fogActionBtns');
    let drawConfig = document.getElementById('drawModeConfig');
    let drawActions = document.getElementById('drawActionBtns');

    if (fogBtn) {
        fogBtn.classList.remove('active');
        fogBtn.style.background = '';
        fogBtn.style.borderColor = '';
        fogBtn.style.color = '';
    }
    if (drawBtn) {
        drawBtn.classList.remove('active');
        drawBtn.style.background = '';
        drawBtn.style.borderColor = '';
        drawBtn.style.color = '';
    }

    if (mode === 'draw') {
        if (drawBtn) {
            drawBtn.classList.add('active');
            drawBtn.style.background = 'rgba(234, 179, 8, 0.2)';
            drawBtn.style.borderColor = '#eab308';
            drawBtn.style.color = '#fde047';
        }
        if (fogConfig) fogConfig.classList.add('hidden');
        if (fogActions) fogActions.classList.add('hidden');
        if (drawConfig) drawConfig.classList.remove('hidden');
        if (drawActions) drawActions.classList.remove('hidden');
    } else {
        if (fogBtn) {
            fogBtn.classList.add('active');
            fogBtn.style.background = 'rgba(139, 92, 246, 0.2)';
            fogBtn.style.borderColor = '#8b5cf6';
            fogBtn.style.color = '#a78bfa';
        }
        if (fogConfig) fogConfig.classList.remove('hidden');
        if (fogActions) fogActions.classList.remove('hidden');
        if (drawConfig) drawConfig.classList.add('hidden');
        if (drawActions) drawActions.classList.add('hidden');
    }
}

function selectDrawZone(zone) {
    drawState.zone = zone;
    document.getElementById('drawZoneLight').classList.toggle('active', zone === 'LightContainment');
    document.getElementById('drawZoneHeavy').classList.toggle('active', zone === 'HeavyContainment');
    document.getElementById('drawZoneEntrance').classList.toggle('active', zone === 'Entrance');
    localStorage.setItem('drawTrainerZone', zone);
}

function selectDrawDiff(diff) {
    drawState.difficulty = diff;
    document.getElementById('drawDiffEasy').classList.toggle('active', diff === 'easy');
    document.getElementById('drawDiffMedium').classList.toggle('active', diff === 'medium');
    document.getElementById('drawDiffHard').classList.toggle('active', diff === 'hard');
    localStorage.setItem('drawTrainerDiff', diff);
}

// --- Game start ---

async function startDrawGame() {
    // Switch to the map view
    document.getElementById('trainerApp').classList.add('hidden');
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('layoutsApp').classList.remove('hidden');
    let sb = document.querySelector('.sidebar');
    if (sb) sb.style.display = 'none';

    if (!layoutDatabase) await fetchLayouts();

    // Pick a random template for the chosen zone
    let zoneKey = drawState.zone;
    let availableTemplates = (drawSelectedTemplates && drawSelectedTemplates[zoneKey] && drawSelectedTemplates[zoneKey].length > 0) 
                                ? drawSelectedTemplates[zoneKey] 
                                : layoutDatabase[zoneKey];
                                
    if (!availableTemplates || availableTemplates.length === 0) {
        alert('Для этой зоны нет доступных шаблонов!');
        return;
    }
    let targetTemplate = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
    let seed = Math.floor(Math.random() * 9999999);
    drawState.templateName = targetTemplate;

    try {
        currentMapData = await window.generateFacilityMap(zoneKey, targetTemplate, seed);

        // Use processMapData to get processedRooms
        currentZone = zoneKey;
        processMapData();

        // Build template map: replace special rooms with generic silhouettes, keep anchors as-is
        drawState.templateMap = processedRooms.filter(r => r.zoneName === zoneKey).map(r => {
            let pr = JSON.parse(JSON.stringify(r));
            if (!isDrawAnchor(r.originalName)) {
                pr.name = getGenericRoomName(pr.zoneName, pr.shape);
            }
            return pr;
        });

        // Reset game state
        drawState.placedRooms = [];
        drawState.penalty = 0;
        drawState.lives = 3;
        drawState.timer = 20;
        if (drawState.timerId) clearInterval(drawState.timerId);
        
        drawState.startTime = performance.now();
        if (drawGlobalTimerId) clearInterval(drawGlobalTimerId);
        document.getElementById('drawUIGameTime').textContent = '00:00';
        drawGlobalTimerId = setInterval(() => {
            let el = document.getElementById('drawUIGameTime');
            if (el) el.textContent = formatDrawTime(performance.now() - drawState.startTime);
        }, 1000);
        drawState.timerId = null;
        
        let diff = drawState.difficulty;
        updateDrawUIStats();
        document.getElementById('drawUIPlacedContainer').classList.toggle('hidden', diff === 'hard');
        document.getElementById('drawUILivesContainer').classList.toggle('hidden', diff !== 'hard');
        document.getElementById('drawUITimerContainer').classList.toggle('hidden', diff !== 'medium');
        document.getElementById('drawCheckBtn').classList.toggle('hidden', diff !== 'hard');
        
        if (diff === 'medium') {
            document.getElementById('drawUITimerText').textContent = '20с';
            document.getElementById('drawUITimerBar').style.width = '100%';
            drawState.timerId = setInterval(drawMediumTimerTick, 1000);
        }
        if (diff === 'hard') {
            document.getElementById('drawUILives').textContent = '❤❤❤';
        }

        // Compute grid bounds
        let cxs = drawState.templateMap.map(r => r.cx);
        let cys = drawState.templateMap.map(r => r.cy);
        drawState.minX = Math.min(...cxs);
        drawState.minY = Math.min(...cys);
        drawState.maxX = Math.max(...cxs);
        drawState.maxY = Math.max(...cys);

        // Auto-place anchors
        drawState.templateMap.forEach(r => {
            if (isDrawAnchor(r.originalName)) {
                drawState.placedRooms.push({
                    cx: r.cx, cy: r.cy,
                    name: r.name, shape: r.shape, rotation: r.rotation,
                    originalName: r.originalName, shortName: r.shortName,
                    isAnchor: true, status: 'anchor'
                });
            }
        });

        // Setup UI
        updateDrawPaletteUI();
        document.getElementById('drawGameUI').classList.remove('hidden');
        isDrawMode = true;
        drawRevealMode = false;

        let namingMode = 'game';
        if (drawState.zone === 'LightContainment') namingMode = drawState.settings.naming.LightContainment;
        if (drawState.zone === 'HeavyContainment') namingMode = drawState.settings.naming.HeavyContainment;
        if (drawState.zone === 'Entrance') namingMode = drawState.settings.naming.Entrance;
        
        let readableName = namingMode === 'community' ? TEMPLATE_ALIASES_COMMUNITY[targetTemplate] : TEMPLATE_ALIASES_GAME[targetTemplate];
        if (!readableName) readableName = targetTemplate;

        document.getElementById('drawUITemplate').textContent = readableName;
        let diffNames = { easy: 'Лёгкая', medium: 'Средняя', hard: 'Сложная' };
        document.getElementById('drawUIDiff').textContent = diffNames[drawState.difficulty] || drawState.difficulty;
        updateDrawPlacedCount();



        // Center camera
        zoomScale = 0.7;
        let wrapperEl = document.getElementById('mapContainer');
        cameraX = wrapperEl.clientWidth / 2 - ((drawState.minX + drawState.maxX) / 2 * zoomScale);
        cameraY = wrapperEl.clientHeight / 2 - ((drawState.minY + drawState.maxY) / 2 * zoomScale);

        drawCanvas();
    } catch (e) {
        console.error('Draw mode start failed:', e);
        alert('Ошибка загрузки шаблона');
    }
}

function updateDrawPlacedCount() {
    let totalNonAnchors = drawState.templateMap.filter(r => !isDrawAnchor(r.originalName)).length;
    let placedNonAnchors = drawState.placedRooms.filter(r => !r.isAnchor).length;
    let el = document.getElementById('drawUIPlaced');
    if (el) el.textContent = `${placedNonAnchors} / ${totalNonAnchors}`;
}

// --- Palette ---

function updateDrawPaletteUI() {
    let container = document.getElementById('drawPaletteContainer');
    if (!container) return;
    container.innerHTML = '';

    let prefix = drawState.zone === 'LightContainment' ? 'Lcz' : (drawState.zone === 'HeavyContainment' ? 'Hcz' : 'Ez');

    const paletteItems = [
        { shape: 'XShape', name: prefix + 'Cross', rot: 0 },

        { shape: 'Straight', name: prefix + 'Straight', rot: 0 },
        { shape: 'Straight', name: prefix + 'Straight', rot: 90 },

        { shape: 'Curve', name: prefix + 'Curve', rot: 0 },
        { shape: 'Curve', name: prefix + 'Curve', rot: 90 },

        { shape: 'Curve', name: prefix + 'Curve', rot: 180 },
        { shape: 'Curve', name: prefix + 'Curve', rot: 270 },

        { shape: 'TShape', name: prefix + 'ThreeWay', rot: 0 },
        { shape: 'TShape', name: prefix + 'ThreeWay', rot: 90 },

        { shape: 'TShape', name: prefix + 'ThreeWay', rot: 180 },
        { shape: 'TShape', name: prefix + 'ThreeWay', rot: 270 },

        { shape: 'Endroom', name: prefix + 'Endroom', rot: 0 },
        { shape: 'Endroom', name: prefix + 'Endroom', rot: 90 },

        { shape: 'Endroom', name: prefix + 'Endroom', rot: 180 },
        { shape: 'Endroom', name: prefix + 'Endroom', rot: 270 }
    ];

    // Row breaks: 0, 1, 3, 5, 7, 9, 11, 13
    const rowStarts = new Set([0, 1, 3, 5, 7, 9, 11, 13]);
    let rowDiv = null;

    paletteItems.forEach((item, index) => {
        if (rowStarts.has(index)) {
            rowDiv = document.createElement('div');
            rowDiv.style.cssText = 'display:flex; gap:0.4rem; justify-content:center;';
            container.appendChild(rowDiv);
        }

        let box = document.createElement('div');
        box.style.cssText = 'width:56px; height:56px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.15); border-radius:6px; display:flex; justify-content:center; align-items:center; cursor:grab; transition:border-color 0.2s;';
        box.onmouseenter = () => box.style.borderColor = '#eab308';
        box.onmouseleave = () => box.style.borderColor = 'rgba(255,255,255,0.15)';

        let imgEl = loadedImages[item.name];
        let tRot = TEXTURE_ROTATION[item.name] || 0;
        if (item.name === 'EzEndroom') tRot = -90; // Draw Mode override
        if (imgEl) {
            let img = document.createElement('img');
            img.src = imgEl.src;
            img.style.cssText = `width:80%; height:80%; transform:rotate(${item.rot + tRot}deg); pointer-events:none;`;
            img.draggable = false;
            box.appendChild(img);
        }

        // Drag & Drop
        box.onmousedown = (e) => {
            if (e.button !== 0) return;
            e.stopPropagation();
            e.preventDefault();

            let floater = document.createElement('img');
            floater.src = loadedImages[item.name] ? loadedImages[item.name].src : '';
            floater.style.cssText = `position:fixed; width:80px; height:80px; transform:translate(-50%,-50%) rotate(${item.rot + tRot}deg); pointer-events:none; z-index:9999; opacity:0.85;`;
            floater.style.left = e.clientX + 'px';
            floater.style.top = e.clientY + 'px';
            document.body.appendChild(floater);

            function onMove(me) {
                floater.style.left = me.clientX + 'px';
                floater.style.top = me.clientY + 'px';
            }

            function onUp(me) {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
                if (floater.parentNode) floater.remove();

                let wrapper = document.getElementById('mapContainer');
                let rect = wrapper.getBoundingClientRect();
                if (me.clientX >= rect.left && me.clientX <= rect.right && me.clientY >= rect.top && me.clientY <= rect.bottom) {
                    let worldX = ((me.clientX - rect.left) - cameraX) / zoomScale;
                    let worldY = ((me.clientY - rect.top) - cameraY) / zoomScale;
                    let cx = Math.floor(worldX / CELL_SIZE) * CELL_SIZE + CELL_SIZE / 2;
                    let cy = Math.floor(worldY / CELL_SIZE) * CELL_SIZE + CELL_SIZE / 2;

                    let pad = 2 * CELL_SIZE;
                    let gx0 = Math.floor((drawState.minX - pad) / CELL_SIZE) * CELL_SIZE - CELL_SIZE/2;
                    let gx1 = Math.ceil((drawState.maxX + pad) / CELL_SIZE) * CELL_SIZE + CELL_SIZE/2;
                    let gy0 = Math.floor((drawState.minY - pad) / CELL_SIZE) * CELL_SIZE - CELL_SIZE/2;
                    let gy1 = Math.ceil((drawState.maxY + pad) / CELL_SIZE) * CELL_SIZE + CELL_SIZE/2;

                    if (cx < gx0 || cx > gx1 || cy < gy0 || cy > gy1) {
                        return; // Outside the grid, don't place!
                    }

                    // Don't overwrite anchors
                    let existing = drawState.placedRooms.findIndex(r => r.cx === cx && r.cy === cy);
                    if (existing !== -1) {
                        if (drawState.placedRooms[existing].isAnchor) return;
                        drawState.placedRooms.splice(existing, 1);
                    }

                    drawState.placedRooms.push({
                        cx: cx, cy: cy,
                        name: item.name, shape: item.shape, rotation: item.rot,
                        isAnchor: false, status: 'unvalidated'
                    });

                    if (drawState.difficulty === 'easy') validateDrawMap(false);
                    updateDrawPlacedCount();
                    drawCanvas();
                }
            }

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        };

        rowDiv.appendChild(box);
    });
}

// --- Validation ---

function updateDrawUIStats() {
    document.getElementById('drawUIPenalty').textContent = drawState.penalty;
    
    let livesStr = '';
    for(let i=0; i<drawState.lives; i++) livesStr += '❤';
    document.getElementById('drawUILives').textContent = livesStr || '☠️';
}

function checkRoomCorrect(pr) {
    let match = drawState.templateMap.find(tr => tr.cx === pr.cx && tr.cy === pr.cy);
    if (!match || isDrawAnchor(match.originalName)) return { ok: false, type: 'wrong' };
    if (pr.shape !== match.shape) return { ok: false, type: 'wrong' };
    
    let rDiff = Math.abs(pr.rotation - match.effectiveRot) % 360;
    let rotMatch = false;
    if (pr.shape === 'XShape') rotMatch = true;
    else if (pr.shape === 'Straight' && (rDiff === 0 || rDiff === 180)) rotMatch = true;
    else if (rDiff === 0) rotMatch = true;
    
    if (rotMatch) return { ok: true, type: 'correct' };
    return { ok: false, type: 'wrongRotation' };
}

function validateDrawMap(isSubmit) {
    // In Easy/Medium, this is used to assign colors and penalties for unpenalized rooms
    let diff = drawState.difficulty;
    
    drawState.placedRooms.forEach(pr => {
        if (pr.isAnchor || pr.status === 'revealed' || pr.penalized) return;
        
        let res = checkRoomCorrect(pr);
        if (res.type === 'wrong') {
            if (diff !== 'hard') pr.status = 'wrong';
            if (diff !== 'hard' && !pr.penalized) {
                drawState.penalty += 2;
                pr.penalized = true;
            }
        } else if (res.type === 'wrongRotation') {
            if (diff !== 'hard') pr.status = 'wrongRotation';
            if (diff !== 'hard' && !pr.penalized) {
                drawState.penalty += 1;
                pr.penalized = true;
            }
        } else {
            if (diff !== 'hard') pr.status = 'correct';
            pr.penalized = true;
        }
    });
    
    updateDrawUIStats();
    drawCanvas();
}

function drawMediumTimerTick() {
    if (drawState.timer <= 0) {
        drawState.timer = 20;
        validateDrawMap(false);
    } else {
        drawState.timer--;
    }
    document.getElementById('drawUITimerText').textContent = drawState.timer + 'с';
    document.getElementById('drawUITimerBar').style.width = (drawState.timer / 20 * 100) + '%';
}

function submitDrawCheck() {
    if (drawState.difficulty !== 'hard') return;
    
    let deletedCount = 0;
    drawState.placedRooms = drawState.placedRooms.filter(pr => {
        if (pr.isAnchor || pr.status === 'revealed') return true;
        let res = checkRoomCorrect(pr);
        if (!res.ok) {
            deletedCount++;
            return false; // Remove wrong room
        }
        return true; // Keep correct room
    });
    
    if (deletedCount > 0) {
        drawState.lives--;
        drawState.penalty += deletedCount * 2;
        updateDrawUIStats();
        drawCanvas();
        
        if (drawState.lives <= 0) {
            showDrawFinish(false);
        } else {
            showDrawToast('Обнаружены ошибки! Неверные комнаты удалены!', true);
        }
    } else {
        showDrawToast('Все верно!', false);
    }
}

function showDrawFinish(isWin) {
    if (drawState.timerId) clearInterval(drawState.timerId);
    if (drawGlobalTimerId) { clearInterval(drawGlobalTimerId); drawGlobalTimerId = null; }
    
    let timeStr = formatDrawTime(performance.now() - drawState.startTime);
    let ftime = document.getElementById('drawFinishTime');
    if (ftime) ftime.textContent = timeStr;
    
    document.getElementById('drawFinishTitle').textContent = isWin ? 'ПОБЕДА!' : 'ПОРАЖЕНИЕ';
    document.getElementById('drawFinishTitle').style.color = isWin ? '#4ade80' : '#ef4444';
    
    let diffName = drawState.difficulty === 'easy' ? 'Легко' : (drawState.difficulty === 'medium' ? 'Средне' : 'Сложно');
    let templateName = getTemplateName(drawState.templateName);
    
    document.getElementById('drawFinishTemplate').textContent = templateName;
    document.getElementById('drawFinishDiff').textContent = diffName;
    document.getElementById('drawFinishPenalty').textContent = drawState.penalty;
    
    document.getElementById('drawFinishModal').classList.remove('hidden');
}

function finishDrawGame() {
    // Final check for victory
    let totalNonAnchors = drawState.templateMap.filter(r => !isDrawAnchor(r.originalName)).length;
    let placedNonAnchors = drawState.placedRooms.filter(r => !r.isAnchor).length;
    
    let allCorrect = true;
    drawState.placedRooms.forEach(pr => {
        if (pr.isAnchor || pr.status === 'revealed') return;
        let res = checkRoomCorrect(pr);
        if (!res.ok) allCorrect = false;
    });
    
    if (placedNonAnchors >= totalNonAnchors && allCorrect) {
        showDrawFinish(true);
    } else {
        showDrawFinish(false);
    }
}

function drawGiveUp() {
    showDrawFinish(false);
}

function drawViewMap() {
    document.getElementById('drawFinishModal').classList.add('hidden');
    document.getElementById('drawGameUI').classList.add('hidden');
    document.getElementById('drawViewMapReturnBtn').classList.remove('hidden');
    
    let toggleContainer = document.getElementById('drawMapToggleContainer');
    if (toggleContainer) toggleContainer.classList.remove('hidden');
    
    // Save user's map
    drawState.myPlacedRooms = JSON.parse(JSON.stringify(drawState.placedRooms));
    
    // Evaluate colors on user map
    drawState.myPlacedRooms.forEach(pr => {
        if (!pr.isAnchor && pr.status !== 'revealed') {
            let res = checkRoomCorrect(pr);
            pr.status = res.type; // 'correct', 'wrong', or 'wrongRotation'
        }
    });

    toggleDrawMapView('correct');
}

function toggleDrawMapView(view) {
    let btnCorrect = document.getElementById('btnDrawMapCorrect');
    let btnMine = document.getElementById('btnDrawMapMine');
    
    if (view === 'correct') {
        btnCorrect.style.background = 'rgba(56, 189, 248, 0.2)';
        btnCorrect.style.borderColor = '#38bdf8';
        btnCorrect.style.color = '#38bdf8';
        
        btnMine.style.background = 'transparent';
        btnMine.style.borderColor = '#94a3b8';
        btnMine.style.color = '#94a3b8';
        
        let correctRooms = [];
        drawState.myPlacedRooms.forEach(pr => {
            if (pr.isAnchor) correctRooms.push(pr);
        });
        
        drawState.templateMap.forEach(tr => {
            if (isDrawAnchor(tr.originalName)) return;
            
            let userRoom = drawState.myPlacedRooms.find(pr => !pr.isAnchor && pr.cx === tr.cx && pr.cy === tr.cy);
            let isCorrect = (userRoom && userRoom.status === 'correct');
            
            correctRooms.push({
                cx: tr.cx, cy: tr.cy,
                name: tr.name, shape: tr.shape, rotation: tr.effectiveRot,
                originalName: tr.originalName, shortName: tr.shortName,
                isAnchor: false, status: isCorrect ? 'correct' : 'revealed'
            });
        });
        
        drawState.placedRooms = correctRooms;
    } else {
        btnMine.style.background = 'rgba(56, 189, 248, 0.2)';
        btnMine.style.borderColor = '#38bdf8';
        btnMine.style.color = '#38bdf8';
        
        btnCorrect.style.background = 'transparent';
        btnCorrect.style.borderColor = '#94a3b8';
        btnCorrect.style.color = '#94a3b8';
        
        drawState.placedRooms = JSON.parse(JSON.stringify(drawState.myPlacedRooms));
    }
    
    drawRevealMode = false;
    updateDrawPlacedCount();
    drawCanvas();
}

function drawReturnToFinishModal() {
    document.getElementById('drawViewMapReturnBtn').classList.add('hidden');
    
    let toggleContainer = document.getElementById('drawMapToggleContainer');
    if (toggleContainer) toggleContainer.classList.add('hidden');
    
    document.getElementById('drawFinishModal').classList.remove('hidden');
}

function drawRestartGame() {
    document.getElementById('drawFinishModal').classList.add('hidden');
    startDrawGame(); // Reuse same settings
}

// --- Toast System ---
let drawToastTimer = null;
let drawToastAnim = null;

function closeDrawToast() {
    document.getElementById('drawToast').classList.add('hidden');
    if (drawToastTimer) clearTimeout(drawToastTimer);
    if (drawToastAnim) cancelAnimationFrame(drawToastAnim);
}

function showDrawToast(message, isError) {
    let toast = document.getElementById('drawToast');
    let text = document.getElementById('drawToastText');
    let bar = document.getElementById('drawToastBar');
    
    closeDrawToast(); // Reset
    
    toast.classList.remove('hidden');
    text.textContent = message;
    
    let color = isError ? '#ef4444' : '#4ade80';
    toast.style.borderColor = color;
    bar.style.backgroundColor = color;
    
    let startTime = performance.now();
    let duration = 5000;
    
    function animate(now) {
        let elapsed = now - startTime;
        let progress = 1 - (elapsed / duration);
        if (progress < 0) progress = 0;
        bar.style.width = (progress * 100) + '%';
        
        if (progress > 0) {
            drawToastAnim = requestAnimationFrame(animate);
        }
    }
    
    // Slight delay to ensure bar starts full
    bar.style.width = '100%';
    drawToastAnim = requestAnimationFrame(animate);
    
    drawToastTimer = setTimeout(() => {
        closeDrawToast();
    }, duration);
}

// --- Exit ---

function exitDrawGame() {
    isDrawMode = false;
    closeDrawToast();
    drawRevealMode = false;
    if (drawState.mediumInterval) { clearInterval(drawState.mediumInterval); drawState.mediumInterval = null; }
    if (drawState.timerId) { clearInterval(drawState.timerId); drawState.timerId = null; }
    if (drawGlobalTimerId) { clearInterval(drawGlobalTimerId); drawGlobalTimerId = null; }
    document.getElementById('drawGameUI').classList.add('hidden');
    document.getElementById('drawFinishModal').classList.add('hidden');
    let toggleContainer = document.getElementById('drawMapToggleContainer');
    if (toggleContainer) toggleContainer.classList.add('hidden');
    
    document.getElementById('layoutsApp').classList.add('hidden');
    document.getElementById('trainerApp').classList.remove('hidden');
    let sb = document.querySelector('.sidebar');
    if (sb) sb.style.display = '';
}

// ==================== END DRAW MODE ====================

wrapper.addEventListener('contextmenu', e => { if (typeof isDrawMode !== 'undefined' && isDrawMode) e.preventDefault(); });

function startDrawRevealRoom() {
    if (typeof isDrawMode === 'undefined' || !isDrawMode || drawRevealMode) return;
    drawRevealMode = true;
    showDrawToast("Выберите комнату, которую хотите открыть", false);
    document.getElementById('drawToast').style.borderColor = '#38bdf8';
    document.getElementById('drawToastBar').style.backgroundColor = '#38bdf8';
    
    let wrapper = document.getElementById('mapWrapper');
    if (wrapper) wrapper.style.cursor = 'crosshair';

    if (drawRevealTimeout) clearTimeout(drawRevealTimeout);
    drawRevealTimeout = setTimeout(() => {
        if (drawRevealMode) {
            drawRevealMode = false;
            if (wrapper) wrapper.style.cursor = 'grab';
            closeDrawToast();
        }
    }, 5000);
}
