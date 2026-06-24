using System;
using System.Collections.Generic;
using System.Linq;

namespace ScpMapGenerator.Models
{
    public class FacilityGenerator
    {
        public ZoneGenerator LczGenerator { get; private set; }
        public ZoneGenerator HczGenerator { get; private set; }
        public ZoneGenerator EzGenerator { get; private set; }

        public FacilityGenerator()
        {
            InitializeLcz();
            InitializeHcz();
            InitializeEz();
        }

        private void InitializeLcz()
        {
            var lczRooms = new List<SpawnableRoom>
            {
                new SpawnableRoom(RoomName.Lcz173, RoomShape.Endroom, true, 1, 1),
                new SpawnableRoom(RoomName.Lcz330, RoomShape.Endroom, true, 1, 1),
                new SpawnableRoom(RoomName.Lcz914, RoomShape.Endroom, true, 1, 1),
                new SpawnableRoom(RoomName.LczArmory, RoomShape.Endroom, true, 1, 1),
                new SpawnableRoom(RoomName.LczClassDSpawn, RoomShape.Endroom, true, 1, 1),
                new SpawnableRoom(RoomName.LczComputerRoom, RoomShape.Endroom, true, 1, 1),
                new SpawnableRoom(RoomName.LczGlassRoom, RoomShape.Endroom, true, 1, 1),
                new SpawnableRoom(RoomName.LczGreenhouse, RoomShape.Endroom, true, 1, 1),
                new SpawnableRoom(RoomName.LczAirlock, RoomShape.Straight, true, 1, 1),
                new SpawnableRoom(RoomName.LczToilets, RoomShape.Straight, true, 1, 1),
                new SpawnableRoom(RoomName.LczUpElevator, RoomShape.Straight, true, 2, 2),
                new SpawnableRoom(RoomName.LczCheckpointA, RoomShape.Straight, true, 1, 1),
                new SpawnableRoom(RoomName.LczCheckpointB, RoomShape.Straight, true, 1, 1),
                new SpawnableRoom(RoomName.LczTCross, RoomShape.Room3Way, true, 1, 100),
                new SpawnableRoom(RoomName.LczCrossing, RoomShape.Intersection, true, 1, 100),
                new SpawnableRoom(RoomName.LczCurve, RoomShape.Curve, true, 1, 100),
                new SpawnableRoom(RoomName.LczStraight, RoomShape.Straight, true, 1, 100)
            };
            LczGenerator = new ZoneGenerator {
                TargetZone = "lcz",
                CompatibleRooms = lczRooms.ToArray(),
                AvailableLayoutKeys = LayoutData.Layouts.Keys.Where(k => k.StartsWith("light/")).ToArray()
            };
        }

        private void InitializeHcz()
        {
            var hczRooms = new List<SpawnableRoom>
            {
                new SpawnableRoom(RoomName.Hcz049, RoomShape.Endroom, true, 1, 1),
                new SpawnableRoom(RoomName.Hcz079, RoomShape.Endroom, true, 1, 1),
                new SpawnableRoom(RoomName.Hcz106, RoomShape.Endroom, true, 1, 1),
                new SpawnableRoom(RoomName.Hcz096, RoomShape.Endroom, true, 1, 1),
                new SpawnableRoom(RoomName.HczServers, RoomShape.Endroom, true, 1, 1),
                new SpawnableRoom(RoomName.HczMicroHID, RoomShape.Endroom, true, 1, 1),
                new SpawnableRoom(RoomName.HczTestroom, RoomShape.Straight, true, 1, 1),
                new SpawnableRoom(RoomName.Hcz049_173, RoomShape.Straight, true, 1, 1),
                new SpawnableRoom(RoomName.HczWarhead, RoomShape.Straight, true, 1, 1),
                new SpawnableRoom(RoomName.HczArmory, RoomShape.Straight, true, 1, 1),
                new SpawnableRoom(RoomName.HczTesla, RoomShape.Straight, true, 1, 4), 
                new SpawnableRoom(RoomName.Hcz939, RoomShape.Straight, true, 1, 1), 
                new SpawnableRoom(RoomName.HczCheckpointA, RoomShape.Straight, true, 1, 1),
                new SpawnableRoom(RoomName.HczCheckpointB, RoomShape.Straight, true, 1, 1),
                new SpawnableRoom(RoomName.HczElevatorA, RoomShape.Straight, true, 1, 1),
                new SpawnableRoom(RoomName.HczElevatorB, RoomShape.Straight, true, 1, 1),
                new SpawnableRoom(RoomName.HczCrossing, RoomShape.Intersection, true, 1, 100),
                new SpawnableRoom(RoomName.HczCurve, RoomShape.Curve, true, 1, 100),
                new SpawnableRoom(RoomName.HczStraight, RoomShape.Straight, true, 1, 100),
                new SpawnableRoom(RoomName.Hcz3Way, RoomShape.Room3Way, true, 1, 100)
            };
            HczGenerator = new ZoneGenerator {
                TargetZone = "hcz",
                CompatibleRooms = hczRooms.ToArray(),
                AvailableLayoutKeys = LayoutData.Layouts.Keys.Where(k => k.StartsWith("heavy/")).ToArray()
            };
        }

        private void InitializeEz()
        {
            var ezRooms = new List<SpawnableRoom>
            {
                new SpawnableRoom(RoomName.EzGateA, RoomShape.Endroom, true, 1, 1),
                new SpawnableRoom(RoomName.EzGateB, RoomShape.Endroom, true, 1, 1),
                new SpawnableRoom(RoomName.EzEvacShelter, RoomShape.Endroom, true, 1, 1),
                new SpawnableRoom(RoomName.EzIntercom, RoomShape.Straight, true, 1, 1),
                new SpawnableRoom(RoomName.EzCafeteria, RoomShape.Straight, true, 1, 1),
                new SpawnableRoom(RoomName.EzUpstairs, RoomShape.Straight, true, 1, 1),
                new SpawnableRoom(RoomName.EzDownstairs, RoomShape.Straight, true, 1, 1),
                new SpawnableRoom(RoomName.EzCheckpointA, RoomShape.Straight, true, 1, 1),
                new SpawnableRoom(RoomName.EzCheckpointB, RoomShape.Straight, true, 1, 1),
                new SpawnableRoom(RoomName.EzStraight, RoomShape.Straight, true, 1, 100),
                new SpawnableRoom(RoomName.EzCurve, RoomShape.Curve, true, 1, 100),
                new SpawnableRoom(RoomName.Ez3Way, RoomShape.Room3Way, true, 1, 100),
                new SpawnableRoom(RoomName.EzCrossing, RoomShape.Intersection, true, 1, 100),
                new SpawnableRoom(RoomName.EzDeadEnd, RoomShape.Endroom, true, 1, 100)
            };
            EzGenerator = new ZoneGenerator {
                TargetZone = "ez",
                CompatibleRooms = ezRooms.ToArray(),
                AvailableLayoutKeys = LayoutData.Layouts.Keys.Where(k => k.StartsWith("entrance/")).ToArray()
            };
        }

        public void Generate(int seed)
        {
            var rng = new LegacyRandom(seed);
            LczGenerator.Generate(rng);
            HczGenerator.Generate(rng);
            EzGenerator.Generate(rng);
        }
    }
}
