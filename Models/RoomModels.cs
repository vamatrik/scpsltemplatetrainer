using System;

namespace ScpMapGenerator.Models
{
    public enum RoomName
    {
        Unnamed = -1,
        Lcz173 = 0,
        Lcz330 = 1,
        Lcz914 = 2,
        LczAirlock = 3,
        LczArmory = 4,
        LczCafe = 5,
        LczClassDSpawn = 6,
        LczComputerRoom = 7,
        LczGlassRoom = 8,
        LczGreenhouse = 9,
        LczTCross = 10,
        LczToilets = 11,
        LczUpElevator = 12,
        LczCheckpointA = 13,
        LczCheckpointB = 14,
        LczCrossing = 15,
        LczStraight = 16,
        LczCurve = 17,

        Hcz049 = 18,
        Hcz079 = 19,
        Hcz096 = 20,
        Hcz106 = 21,
        Hcz939 = 22,
        HczTestroom = 23,
        HczMicroHID = 24,
        HczArmory = 25,
        HczServers = 26,
        Hcz049_173 = 27,
        HczWarhead = 28,
        HczTesla = 29,
        HczCrossing = 30,
        HczCurve = 31,
        HczStraight = 32,
        Hcz3Way = 33,
        HczCheckpointA = 34,
        HczCheckpointB = 35,
        HczElevatorA = 36,
        HczElevatorB = 37,

        EzGateA = 38,
        EzGateB = 39,
        EzCheckpointA = 40,
        EzCheckpointB = 41,
        EzEvacShelter = 42,
        EzIntercom = 43,
        EzCafeteria = 44,
        EzUpstairs = 45,
        EzDownstairs = 46,
        EzStraight = 47,
        EzCurve = 48,
        Ez3Way = 49,
        EzCrossing = 50,
        EzDeadEnd = 51
    }

    public class SpawnableRoom
    {
        public RoomName Name { get; set; }
        public RoomShape Shape { get; set; }
        public bool SpecialRoom { get; set; } = true;
        public int MaxAmount { get; set; } = 1;
        public int MinAmount { get; set; } = 0;
        public float ChanceMultiplier { get; set; } = 1f;
        public float AdjacentChanceMultiplier { get; set; } = 1f;

        public SpawnableRoom(RoomName name, RoomShape shape, bool specialRoom = true, int min = 0, int max = 1, float chanceMultiplier = 1f, float adjacentChanceMultiplier = 1f)
        {
            Name = name;
            Shape = shape;
            SpecialRoom = specialRoom;
            MinAmount = min;
            MaxAmount = max;
            ChanceMultiplier = chanceMultiplier;
            AdjacentChanceMultiplier = adjacentChanceMultiplier;
        }
    }

    public class SpawnedRoomData
    {
        public AtlasInterpretation Interpretation { get; set; }
        public SpawnableRoom ChosenCandidate { get; set; }
        public int DuplicateId { get; set; }
    }
}
