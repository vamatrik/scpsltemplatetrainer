using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace ScpMapGenerator
{
    public class ColorRGB
    {
        public byte r { get; set; }
        public byte g { get; set; }
        public byte b { get; set; }

        public override bool Equals(object obj)
        {
            if (obj is ColorRGB other)
                return r == other.r && g == other.g && b == other.b;
            return false;
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(r, g, b);
        }
    }

    public class GlyphShapePair
    {
        public ColorRGB GlyphColor { get; set; }
        public string RoomShape { get; set; }
        public List<string> SpecificRooms { get; set; }
        public List<float> RoomRotations { get; set; }
    }

    public class CompatibleRoom
    {
        public string Name { get; set; }
        public string Shape { get; set; }
        public bool SpecialRoom { get; set; }
        public int MaxAmount { get; set; }
        public int MinAmount { get; set; }
        public float ChanceMultiplier { get; set; }
        public float AdjacentChanceMultiplier { get; set; }
        public string OriginalName { get; set; }
    }

    public class PixelData
    {
        public int x { get; set; }
        public int y { get; set; }
        public byte r { get; set; }
        public byte g { get; set; }
        public byte b { get; set; }
    }

    public class AtlasData
    {
        public string Name { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public bool IsReadable { get; set; }
        public List<PixelData> Pixels { get; set; }
    }

    public class GeneratorData
    {
        public List<CompatibleRoom> CompatibleRooms { get; set; }
        public List<AtlasData> Atlases { get; set; }
    }

    public class DumpedMapData
    {
        public List<GlyphShapePair> GlyphShapePairs { get; set; }
        public Dictionary<string, GeneratorData> Generators { get; set; }
    }

    public class MapCoord
    {
        public int x { get; set; }
        public int y { get; set; }
        
        public MapCoord(int x, int y) { this.x = x; this.y = y; }
        
        public override bool Equals(object obj) => obj is MapCoord c && x == c.x && y == c.y;
        public override int GetHashCode() => HashCode.Combine(x, y);
        public static bool operator ==(MapCoord a, MapCoord b) => a.Equals(b);
        public static bool operator !=(MapCoord a, MapCoord b) => !(a == b);
    }

    public class AtlasInterpretation
    {
        public MapCoord Coords { get; set; }
        public float RotationY { get; set; }
        public string RoomShape { get; set; }
        public string[] SpecificRooms { get; set; }
    }

    public class SpawnedRoom
    {
        public AtlasInterpretation Interpretation { get; set; }
        public CompatibleRoom ChosenCandidate { get; set; }
    }

    public class MapGeneratorService
    {
        private readonly HttpClient _http;
        private DumpedMapData _data;

        public MapGeneratorService(HttpClient http)
        {
            _http = http;
        }

        public async Task LoadDataAsync()
        {
            if (_data == null)
            {
                var json = await _http.GetStringAsync("data/DumpedMapData.json");
                _data = JsonConvert.DeserializeObject<DumpedMapData>(json);
                
                // Map hidden names based on known multiplier distributions
                if (_data != null && _data.Generators != null)
                {
                    if (_data.Generators.TryGetValue("HeavyContainment", out var hcz))
                    {
                        foreach (var r in hcz.CompatibleRooms)
                        {
                            if (r.Name == "Unnamed")
                            {
                                if (r.Shape == "TShape" && Math.Abs(r.ChanceMultiplier - 1.0f) < 0.01f)
                                {
                                    r.OriginalName = "HCZ_JunkMain";
                                }
                                else if (r.Shape == "Straight" && Math.Abs(r.ChanceMultiplier - 5.0f) < 0.01f)
                                {
                                    r.OriginalName = "HCZ_PipesMain";
                                    Console.WriteLine($"Found PipesMain!");
                                }
                                else {
                                    Console.WriteLine($"Unnamed: {r.Shape}, Mult: {r.ChanceMultiplier}");
                                }
                            }
                        }
                    }
                }
            }
        }

        public Dictionary<string, List<SpawnedRoom>> GenerateFacility(int seed)
        {
            var result = new Dictionary<string, List<SpawnedRoom>>();
            var rng = new Random(seed);

            // Generate order is usually LCZ, HCZ, EZ (though HCZ/EZ might swap depending on game logic, usually it's array order in ZoneGenerators)
            string[] zones = { "LightContainment", "HeavyContainment", "Entrance" };

            foreach (var zone in zones)
            {
                if (_data.Generators.TryGetValue(zone, out var genData))
                {
                    result[zone] = GenerateZone(zone, genData, rng);
                }
            }

            return result;
        }

        private List<SpawnedRoom> GenerateZone(string zoneName, GeneratorData gen, Random rng)
        {
            var spawned = new List<SpawnedRoom>();
            
            // 1. Pick an atlas
            var atlas = gen.Atlases[rng.Next(gen.Atlases.Count)];
            
            // 2. Interpret atlas
            var interpreted = new List<AtlasInterpretation>();
            foreach (var pixel in atlas.Pixels)
            {
                if (pixel.r == 0 && pixel.g == 0 && pixel.b == 0) continue; // background
                if (pixel.r == 100 && pixel.g == 100 && pixel.b == 100) continue; // background/void
                
                var color = new ColorRGB { r = pixel.r, g = pixel.g, b = pixel.b };
                var pair = _data.GlyphShapePairs.FirstOrDefault(p => p.GlyphColor.Equals(color));
                
                if (pair != null)
                {
                    interpreted.Add(new AtlasInterpretation
                    {
                        Coords = new MapCoord(pixel.x, pixel.y),
                        RotationY = pair.RoomRotations[rng.Next(pair.RoomRotations.Count)],
                        RoomShape = pair.RoomShape,
                        SpecificRooms = pair.SpecificRooms.ToArray()
                    });
                }
            }

            // 3. Randomize interpreted array (Shuffle)
            for (int i = interpreted.Count - 1; i > 0; i--)
            {
                int swapIndex = rng.Next(i + 1);
                var temp = interpreted[i];
                interpreted[i] = interpreted[swapIndex];
                interpreted[swapIndex] = temp;
            }

            // 4. Process Interpreted
            foreach (var interp in interpreted)
            {
                ProcessInterpreted(interp, gen.CompatibleRooms, spawned, rng);
            }

            return spawned;
        }

        private void ProcessInterpreted(AtlasInterpretation interpretation, List<CompatibleRoom> compatibleRooms, List<SpawnedRoom> spawned, Random rng)
        {
            var candidates = new List<CompatibleRoom>();
            float totalWeight = 0f;
            bool hasSpecificRooms = interpretation.SpecificRooms.Length > 0;

            foreach (var room in compatibleRooms)
            {
                int spawnedCount = spawned.Count(s => s.ChosenCandidate.Name == room.Name);

                bool isSpecificMatch = !hasSpecificRooms || interpretation.SpecificRooms.Contains(room.Name);
                
                if (hasSpecificRooms == room.SpecialRoom && 
                    isSpecificMatch && 
                    room.Shape == interpretation.RoomShape && 
                    spawnedCount < room.MaxAmount)
                {
                    if (spawnedCount < room.MinAmount)
                    {
                        SpawnRoom(interpretation, room, spawned);
                        return;
                    }
                    
                    totalWeight += GetChanceWeight(interpretation.Coords, room, spawned);
                    candidates.Add(room);
                }
            }

            if (candidates.Count == 0 || totalWeight == 0f)
            {
                // Fallback or error
                return;
            }

            double randomValue = rng.NextDouble() * totalWeight;
            float currentWeight = 0f;

            foreach (var candidate in candidates)
            {
                currentWeight += GetChanceWeight(interpretation.Coords, candidate, spawned);
                if (randomValue <= currentWeight)
                {
                    SpawnRoom(interpretation, candidate, spawned);
                    return;
                }
            }
        }

        private void SpawnRoom(AtlasInterpretation interpretation, CompatibleRoom chosen, List<SpawnedRoom> spawned)
        {
            spawned.Add(new SpawnedRoom
            {
                Interpretation = interpretation,
                ChosenCandidate = chosen
            });
        }

        private float GetChanceWeight(MapCoord coords, CompatibleRoom candidate, List<SpawnedRoom> spawned)
        {
            var up = new MapCoord(coords.x, coords.y + 1);
            var down = new MapCoord(coords.x, coords.y - 1);
            var left = new MapCoord(coords.x - 1, coords.y);
            var right = new MapCoord(coords.x + 1, coords.y);

            float weight = candidate.ChanceMultiplier;

            foreach (var item in spawned)
            {
                if (item.ChosenCandidate.Name == candidate.Name)
                {
                    var c = item.Interpretation.Coords;
                    if (c == up || c == down || c == left || c == right)
                    {
                        weight *= candidate.AdjacentChanceMultiplier;
                    }
                }
            }

            return weight;
        }
    }
}
