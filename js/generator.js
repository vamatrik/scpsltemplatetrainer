
// Seeded RNG (Mulberry32)
function mulberry32(a) {
    return function() {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

let globalDumpedData = null;

function scanPixel(glyphs, p) {
    for (let i = 0; i < glyphs.length; i++) {
        let gc = glyphs[i].GlyphColor;
        if (Math.abs(gc.r - p.r) <= 5 && Math.abs(gc.g - p.g) <= 5 && Math.abs(gc.b - p.b) <= 5) {
            return glyphs[i];
        }
    }
    return null;
}

function getChanceWeight(coords, candidate, spawned) {
    let up    = { x: coords.x,     y: coords.y + 1 };
    let down  = { x: coords.x,     y: coords.y - 1 };
    let left  = { x: coords.x - 1, y: coords.y };
    let right = { x: coords.x + 1, y: coords.y };

    let weight = candidate.ChanceMultiplier;

    for (let i = 0; i < spawned.length; i++) {
        if (spawned[i].chosenCandidate._ref === candidate) {
            let c = spawned[i].interpretation.coords;
            if ((c.x === up.x && c.y === up.y) ||
                (c.x === down.x && c.y === down.y) ||
                (c.x === left.x && c.y === left.y) ||
                (c.x === right.x && c.y === right.y)) {
                weight *= candidate.AdjacentChanceMultiplier;
            }
        }
    }
    return weight;
}

function processInterpreted(interpretation, compatibleRooms, spawned, rng) {
    let candidates = [];
    let totalWeight = 0;
    let hasSpecificRooms = interpretation.specificRooms && interpretation.specificRooms.length > 0;

    for (let i = 0; i < compatibleRooms.length; i++) {
        let room = compatibleRooms[i];
        let spawnedCount = spawned.filter(s => s.chosenCandidate._ref === room).length;
        let isSpecificMatch = !hasSpecificRooms || interpretation.specificRooms.includes(room.Name);

        if (hasSpecificRooms === room.SpecialRoom &&
            isSpecificMatch &&
            room.Shape === interpretation.roomShape &&
            spawnedCount < room.MaxAmount) {

            if (spawnedCount < room.MinAmount) {
                spawned.push({
                    interpretation: interpretation,
                    chosenCandidate: roomToCandidate(room)
                });
                return;
            }
            totalWeight += getChanceWeight(interpretation.coords, room, spawned);
            candidates.push(room);
        }
    }

    if (candidates.length === 0 || totalWeight === 0) return;

    let randomValue = rng() * totalWeight;
    let currentWeight = 0;
    for (let i = 0; i < candidates.length; i++) {
        currentWeight += getChanceWeight(interpretation.coords, candidates[i], spawned);
        if (randomValue <= currentWeight) {
            spawned.push({
                interpretation: interpretation,
                chosenCandidate: roomToCandidate(candidates[i])
            });
            return;
        }
    }
    // Fallback: floating point edge case — place last valid candidate
    spawned.push({
        interpretation: interpretation,
        chosenCandidate: roomToCandidate(candidates[candidates.length - 1])
    });
}

// Convert PascalCase room object → camelCase for processMapData compatibility
function roomToCandidate(room) {
    return {
        _ref: room,
        name: room.Name,
        shape: room.Shape,
        specialRoom: room.SpecialRoom,
        maxAmount: room.MaxAmount,
        minAmount: room.MinAmount,
        chanceMultiplier: room.ChanceMultiplier,
        adjacentChanceMultiplier: room.AdjacentChanceMultiplier,
        originalName: room.OriginalName || null
    };
}

function generateZone(zoneName, genData, glyphs, seed, forcedAtlasName) {
    let rng = mulberry32(seed);
    let spawned = [];

    // Pick atlas
    let atlasIndex = Math.floor(rng() * genData.Atlases.length);
    let atlas = genData.Atlases[atlasIndex];
    if (forcedAtlasName) {
        let found = genData.Atlases.find(a => a.Name.toLowerCase() === forcedAtlasName.toLowerCase());
        if (found) atlas = found;
    }

    // Build pixel lookup map for fast access
    let pixelMap = {};
    for (let p of atlas.Pixels) {
        pixelMap[p.x + '_' + p.y] = p;
    }

    let interpreted = [];
    let num = 1;
    let num2 = 0;
    let flag = false;

    for (let y = 0; y < atlas.Height; y += num) {
        for (let x = num2; x < atlas.Width; x += num) {
            let pixel = pixelMap[x + '_' + y];
            if (!pixel) continue;

            let pair = scanPixel(glyphs, pixel);
            if (pair) {
                if (!flag) {
                    x += Math.round(pair.GlyphCenterOffset.x);
                    y += Math.round(pair.GlyphCenterOffset.y);
                    num = 3;
                    num2 = x % 3;
                    flag = true;
                }

                let rotIndex = Math.floor(rng() * pair.RoomRotations.length);
                // Output camelCase to match C# API serialization
                interpreted.push({
                    coords: { x: Math.floor(x / 3), y: Math.floor(y / 3) },
                    rotationY: pair.RoomRotations[rotIndex],
                    roomShape: pair.RoomShape,
                    specificRooms: pair.SpecificRooms
                });
            }
        }
    }

    // Shuffle
    for (let i = interpreted.length - 1; i > 0; i--) {
        let swapIndex = Math.floor(rng() * (i + 1));
        let temp = interpreted[i];
        interpreted[i] = interpreted[swapIndex];
        interpreted[swapIndex] = temp;
    }

    for (let i = 0; i < interpreted.length; i++) {
        processInterpreted(interpreted[i], genData.CompatibleRooms, spawned, rng);
    }

    return spawned;

}

window.generateFacilityMap = async function(zone, template, seed) {
    if (!globalDumpedData) {
        let res = await fetch('data/DumpedMapData.json');
        globalDumpedData = await res.json();

        // Fix unnamed HCZ rooms (same logic as C# Program.cs)
        let hcz = globalDumpedData.Generators["HeavyContainment"];
        if (hcz) {
            for (let r of hcz.CompatibleRooms) {
                if (r.Name === "Unnamed" && r.MaxAmount === 1) {
                    if (r.Shape === "TShape") r.OriginalName = "HCZ_JunkMain";
                    else if (r.Shape === "Straight") {
                        if (Math.abs(r.ChanceMultiplier - 5.0) < 0.01) r.OriginalName = "HCZ_FunnyCorridor";
                        else r.OriginalName = "HCZ_PipesMain";
                    }
                }
            }
        }
    }

    let result = {};
    let genData = globalDumpedData.Generators[zone];
    if (genData) {
        result[zone] = generateZone(zone, genData, globalDumpedData.GlyphShapePairs, seed, template);
    }
    return result;
};
