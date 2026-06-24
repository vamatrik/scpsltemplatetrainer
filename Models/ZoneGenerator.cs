using System;
using System.Collections.Generic;
using System.Linq;

namespace ScpMapGenerator.Models
{
    public class ZoneGenerator
    {
        public string TargetZone { get; set; }
        public SpawnableRoom[] CompatibleRooms { get; set; }
        public string[] AvailableLayoutKeys { get; set; }

        public List<SpawnedRoomData> Spawned { get; private set; } = new List<SpawnedRoomData>();
        public List<AtlasInterpretation> Interpreted { get; private set; } = new List<AtlasInterpretation>();
        public string ChosenLayoutKey { get; private set; }

        private List<SpawnableRoom> _spawnCandidates = new List<SpawnableRoom>();

        public void Generate(LegacyRandom rng)
        {
            Spawned.Clear();
            
            // Pick layout
            ChosenLayoutKey = AvailableLayoutKeys[rng.Next(AvailableLayoutKeys.Length)];
            string[] layoutLines = LayoutData.Layouts[ChosenLayoutKey];
            
            Interpreted = MapAtlasInterpreter.Interpret(layoutLines);
            RandomizeInterpreted(rng);

            foreach (var interpretation in Interpreted)
            {
                ProcessInterpreted(interpretation, rng);
            }
        }

        private void RandomizeInterpreted(LegacyRandom rng)
        {
            int num = Interpreted.Count;
            while (num > 1)
            {
                num--;
                int num2 = rng.Next(num + 1);
                var temp = Interpreted[num];
                Interpreted[num] = Interpreted[num2];
                Interpreted[num2] = temp;
            }
        }

        private float GetChanceWeight(int x, int y, SpawnableRoom candidate)
        {
            float num = candidate.ChanceMultiplier;
            foreach (var item in Spawned)
            {
                if (item.ChosenCandidate == candidate)
                {
                    int dx = Math.Abs(item.Interpretation.X - x);
                    int dy = Math.Abs(item.Interpretation.Y - y);
                    if (dx + dy == 1) // Adjacent
                    {
                        num *= candidate.AdjacentChanceMultiplier;
                    }
                }
            }
            return num;
        }

        private int PreviouslySpawnedCnt(SpawnableRoom candidate)
        {
            int num = 0;
            foreach (var item in Spawned)
            {
                if (item.ChosenCandidate == candidate)
                {
                    num++;
                }
            }
            return num;
        }

        private void SpawnRoom(AtlasInterpretation interpretation, SpawnableRoom chosenCandidate)
        {
            Spawned.Add(new SpawnedRoomData
            {
                Interpretation = interpretation,
                ChosenCandidate = chosenCandidate,
                DuplicateId = PreviouslySpawnedCnt(chosenCandidate)
            });
        }

        private void ProcessInterpreted(AtlasInterpretation interpretation, LegacyRandom rng)
        {
            _spawnCandidates.Clear();
            float num = 0f;
            
            // In SCP:SL, AtlasInterpretation can have SpecificRooms, but here we assume general
            bool specificFlag = false; 

            for (int i = 0; i < CompatibleRooms.Length; i++)
            {
                SpawnableRoom spawnableRoom = CompatibleRooms[i];
                int num2 = PreviouslySpawnedCnt(spawnableRoom);
                
                if (spawnableRoom.Shape == interpretation.Shape && num2 < spawnableRoom.MaxAmount)
                {
                    if (num2 < spawnableRoom.MinAmount)
                    {
                        SpawnRoom(interpretation, spawnableRoom);
                        return;
                    }
                    float weight = GetChanceWeight(interpretation.X, interpretation.Y, spawnableRoom);
                    num += weight;
                    _spawnCandidates.Add(spawnableRoom);
                }
            }

            if (_spawnCandidates.Count == 0 || num == 0f)
            {
                // Fallback: spawn empty generic room of that shape
                SpawnRoom(interpretation, new SpawnableRoom(RoomName.Unnamed, interpretation.Shape, false, 0, 99, 1f));
                return;
            }

            double num3 = rng.NextDouble() * (double)num;
            float num4 = 0f;
            for (int j = 0; j < _spawnCandidates.Count; j++)
            {
                SpawnableRoom spawnableRoom2 = _spawnCandidates[j];
                num4 += GetChanceWeight(interpretation.X, interpretation.Y, spawnableRoom2);
                if (num3 <= (double)num4)
                {
                    SpawnRoom(interpretation, spawnableRoom2);
                    return;
                }
            }
        }
    }
}
