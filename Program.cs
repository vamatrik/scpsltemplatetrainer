using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.IO;
using System.Text.Json;
using System;
using System.Linq;
using System.Collections.Generic;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(o => o.AddPolicy("AllowAll", b => b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));
var app = builder.Build();
app.UseCors("AllowAll");
app.UseStaticFiles();

app.MapGet("/api/generate", (int seed) => {
    try {
        var dataPath = Path.Combine(app.Environment.WebRootPath, "data", "DumpedMapData.json");
        var json = File.ReadAllText(dataPath);
        var _data = JsonSerializer.Deserialize<DumpedMapData>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        
        if (_data != null && _data.Generators != null && _data.Generators.TryGetValue("HeavyContainment", out var hcz)) {
            foreach (var r in hcz.CompatibleRooms) {
                if (r.Name == "Unnamed" && r.MaxAmount == 1) {
                    if (r.Shape == "TShape") r.OriginalName = "HCZ_JunkMain";
                    else if (r.Shape == "Straight") {
                        if (Math.Abs(r.ChanceMultiplier - 5.0f) < 0.01f) r.OriginalName = "HCZ_FunnyCorridor";
                        else r.OriginalName = "HCZ_PipesMain";
                    }
                }
            }
        }
        
        var result = new Dictionary<string, List<SpawnedRoom>>();
        var rng = new Random(seed);
        string[] zones = { "LightContainment", "HeavyContainment", "Entrance" };
        
        foreach (var zone in zones) {
            if (_data.Generators.TryGetValue(zone, out var genData)) {
                result[zone] = GenerateZone(zone, genData, _data.GlyphShapePairs, rng, null);
            }
        }
        return Microsoft.AspNetCore.Http.Results.Json(result);
    } catch(Exception ex) {
        return Microsoft.AspNetCore.Http.Results.Problem(detail: ex.Message);
    }
});
app.MapGet("/api/templates_list", () => {
    var dataPath = Path.Combine(app.Environment.WebRootPath, "data", "DumpedMapData.json");
    var json = File.ReadAllText(dataPath);
    var _data = JsonSerializer.Deserialize<DumpedMapData>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    
    var result = new Dictionary<string, List<string>>();
    result["LightContainment"] = _data.Generators["LightContainment"].Atlases.Select(a => a.Name).ToList();
    result["HeavyContainment"] = _data.Generators["HeavyContainment"].Atlases.Select(a => a.Name).ToList();
    result["Entrance"] = _data.Generators["Entrance"].Atlases.Select(a => a.Name).ToList();
    
    return Results.Json(result);
});

app.MapGet("/api/template", (string zone, string template, int seed) => {
    try {
        var dataPath = Path.Combine(app.Environment.WebRootPath, "data", "DumpedMapData.json");
        var json = File.ReadAllText(dataPath);
        var _data = JsonSerializer.Deserialize<DumpedMapData>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        
        if (_data != null && _data.Generators != null && _data.Generators.TryGetValue("HeavyContainment", out var hcz)) {
            foreach (var r in hcz.CompatibleRooms) {
                if (r.Name == "Unnamed" && r.MaxAmount == 1) {
                    if (r.Shape == "TShape") r.OriginalName = "HCZ_JunkMain";
                    else if (r.Shape == "Straight") {
                        if (Math.Abs(r.ChanceMultiplier - 5.0f) < 0.01f) r.OriginalName = "HCZ_FunnyCorridor";
                        else r.OriginalName = "HCZ_PipesMain";
                    }
                }
            }
        }
        
        var result = new Dictionary<string, List<SpawnedRoom>>();
        var rng = new Random(seed);
        
        if (_data.Generators.TryGetValue(zone, out var genData)) {
            result[zone] = GenerateZone(zone, genData, _data.GlyphShapePairs, rng, template);
        }
        
        return Microsoft.AspNetCore.Http.Results.Json(result);
    } catch(Exception ex) {
        return Microsoft.AspNetCore.Http.Results.Problem(detail: ex.Message);
    }
});


app.MapFallbackToFile("index.html");

app.MapPost("/api/log_error", async (Microsoft.AspNetCore.Http.HttpContext ctx) => {
    using var reader = new StreamReader(ctx.Request.Body);
    var body = await reader.ReadToEndAsync();
    File.AppendAllText("browser_errors.log", body + Environment.NewLine);
    return Results.Ok();
});


var serverTask = app.RunAsync();

try {
    System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo {
        FileName = "msedge",
        Arguments = "--app=http://localhost:4188",
        UseShellExecute = true
    });
} catch {
    try {
        System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo {
            FileName = "http://localhost:4188",
            UseShellExecute = true
        });
    } catch {}
}

await serverTask;


// Core Logic
List<SpawnedRoom> GenerateZone(string zoneName, GeneratorData gen, List<GlyphShapePair> glyphs, Random rng, string forcedAtlasName = null) {
    var spawned = new List<SpawnedRoom>();
    var atlas = gen.Atlases[rng.Next(gen.Atlases.Count)];
    if (!string.IsNullOrEmpty(forcedAtlasName)) {
        atlas = gen.Atlases.FirstOrDefault(a => a.Name.Equals(forcedAtlasName, StringComparison.OrdinalIgnoreCase)) ?? atlas;
    }
    
    var interpreted = new List<AtlasInterpretation>();
    
    int num = 1;
    int num2 = 0;
    bool flag = false;
    
    for (int y = 0; y < atlas.Height; y += num) {
        for (int x = num2; x < atlas.Width; x += num) {
            var pixel = atlas.Pixels.FirstOrDefault(p => p.x == x && p.y == y);
            if (pixel == null) continue;
            
            var pair = ScanPixel(glyphs, pixel);
            if (pair != null) {
                if (!flag) {
                    x += (int)Math.Round(pair.GlyphCenterOffset.x);
                    y += (int)Math.Round(pair.GlyphCenterOffset.y);
                    num = 3;
                    num2 = x % 3;
                    flag = true;
                }
                
                interpreted.Add(new AtlasInterpretation {
                    Coords = new MapCoord(x / 3, y / 3),
                    RotationY = pair.RoomRotations[rng.Next(pair.RoomRotations.Count)],
                    RoomShape = pair.RoomShape,
                    SpecificRooms = pair.SpecificRooms.ToArray()
                });
            }
        }
    }
    
    // Shuffle
    for (int i = interpreted.Count - 1; i > 0; i--) {
        int swapIndex = rng.Next(i + 1);
        var temp = interpreted[i];
        interpreted[i] = interpreted[swapIndex];
        interpreted[swapIndex] = temp;
    }
    
    foreach(var interp in interpreted) {
        ProcessInterpreted(interp, gen.CompatibleRooms, spawned, rng);
    }
    
    return spawned;
}

GlyphShapePair ScanPixel(List<GlyphShapePair> glyphs, PixelData p) {
    foreach (var value in glyphs) {
        if (Math.Abs(value.GlyphColor.r - p.r) <= 5 && Math.Abs(value.GlyphColor.g - p.g) <= 5 && Math.Abs(value.GlyphColor.b - p.b) <= 5) {
            return value;
        }
    }
    return null;
}

void ProcessInterpreted(AtlasInterpretation interpretation, List<CompatibleRoom> compatibleRooms, List<SpawnedRoom> spawned, Random rng) {
    var candidates = new List<CompatibleRoom>();
    float totalWeight = 0f;
    bool hasSpecificRooms = interpretation.SpecificRooms.Length > 0;
    
    foreach (var room in compatibleRooms) {
        int spawnedCount = spawned.Count(s => s.ChosenCandidate == room);
        bool isSpecificMatch = !hasSpecificRooms || interpretation.SpecificRooms.Contains(room.Name);
        
        if (hasSpecificRooms == room.SpecialRoom && isSpecificMatch && room.Shape == interpretation.RoomShape && spawnedCount < room.MaxAmount) {
            if (spawnedCount < room.MinAmount) {
                spawned.Add(new SpawnedRoom { Interpretation = interpretation, ChosenCandidate = room });
                return;
            }
            totalWeight += GetChanceWeight(interpretation.Coords, room, spawned);
            candidates.Add(room);
        }
    }
    
    if (candidates.Count == 0 || totalWeight == 0f) return;
    
    double randomValue = rng.NextDouble() * totalWeight;
    float currentWeight = 0f;
    foreach (var candidate in candidates) {
        currentWeight += GetChanceWeight(interpretation.Coords, candidate, spawned);
        if (randomValue <= currentWeight) {
            spawned.Add(new SpawnedRoom { Interpretation = interpretation, ChosenCandidate = candidate });
            return;
        }
    }
}

float GetChanceWeight(MapCoord coords, CompatibleRoom candidate, List<SpawnedRoom> spawned) {
    var up = new MapCoord(coords.x, coords.y + 1);
    var down = new MapCoord(coords.x, coords.y - 1);
    var left = new MapCoord(coords.x - 1, coords.y);
    var right = new MapCoord(coords.x + 1, coords.y);
    float weight = candidate.ChanceMultiplier;
    
    foreach (var item in spawned) {
        if (item.ChosenCandidate == candidate) {
            var c = item.Interpretation.Coords;
            if (c.Equals(up) || c.Equals(down) || c.Equals(left) || c.Equals(right)) {
                weight *= candidate.AdjacentChanceMultiplier;
            }
        }
    }
    return weight;
}

// Models
public class ColorRGB { public byte r { get; set; } public byte g { get; set; } public byte b { get; set; } }
public class Offset { public float x { get; set; } public float y { get; set; } }
public class GlyphShapePair { public ColorRGB GlyphColor { get; set; } public Offset GlyphCenterOffset { get; set; } public string RoomShape { get; set; } public List<string> SpecificRooms { get; set; } public List<float> RoomRotations { get; set; } }
public class CompatibleRoom { public string Name { get; set; } public string Shape { get; set; } public bool SpecialRoom { get; set; } public int MaxAmount { get; set; } public int MinAmount { get; set; } public float ChanceMultiplier { get; set; } public float AdjacentChanceMultiplier { get; set; } public string OriginalName { get; set; } }
public class PixelData { public int x { get; set; } public int y { get; set; } public byte r { get; set; } public byte g { get; set; } public byte b { get; set; } }
public class AtlasData { public string Name { get; set; } public int Width { get; set; } public int Height { get; set; } public bool IsReadable { get; set; } public List<PixelData> Pixels { get; set; } }
public class GeneratorData { public List<CompatibleRoom> CompatibleRooms { get; set; } public List<AtlasData> Atlases { get; set; } }
public class DumpedMapData { public List<GlyphShapePair> GlyphShapePairs { get; set; } public Dictionary<string, GeneratorData> Generators { get; set; } }
public class MapCoord { public int x { get; set; } public int y { get; set; } public MapCoord(int x, int y) { this.x = x; this.y = y; } public override bool Equals(object obj) => obj is MapCoord c && x == c.x && y == c.y; public override int GetHashCode() => HashCode.Combine(x, y); }
public class AtlasInterpretation { public MapCoord Coords { get; set; } public float RotationY { get; set; } public string RoomShape { get; set; } public string[] SpecificRooms { get; set; } }
public class SpawnedRoom { public AtlasInterpretation Interpretation { get; set; } public CompatibleRoom ChosenCandidate { get; set; } }

