import re
with open('Program.cs', 'r', encoding='utf-8') as f:
    code = f.read()

# Add the templates_list endpoint
templates_endpoint = '''app.MapGet("/api/templates_list", () => {
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
'''

code = re.sub(r'app\.MapGet\("/api/layouts", \(\) => \{.*?\}\);', templates_endpoint, code, flags=re.MULTILINE|re.DOTALL)

# Modify GenerateZone signature and atlas selection
old_gen = 'List<SpawnedRoom> GenerateZone(string zoneName, GeneratorData gen, List<GlyphShapePair> glyphs, Random rng) {'
new_gen = 'List<SpawnedRoom> GenerateZone(string zoneName, GeneratorData gen, List<GlyphShapePair> glyphs, Random rng, string forcedAtlasName = null) {'
code = code.replace(old_gen, new_gen)

old_atlas = 'var atlas = gen.Atlases[rng.Next(gen.Atlases.Count)];'
new_atlas = 'var atlas = gen.Atlases[rng.Next(gen.Atlases.Count)];\n    if (!string.IsNullOrEmpty(forcedAtlasName)) {\n        atlas = gen.Atlases.FirstOrDefault(a => a.Name.Equals(forcedAtlasName, StringComparison.OrdinalIgnoreCase)) ?? atlas;\n    }'
code = code.replace(old_atlas, new_atlas)

# Also fix the call inside /api/generate
code = code.replace('result[zone] = GenerateZone(zone, genData, _data.GlyphShapePairs, rng);', 'result[zone] = GenerateZone(zone, genData, _data.GlyphShapePairs, rng, null);')

with open('Program.cs', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done")
