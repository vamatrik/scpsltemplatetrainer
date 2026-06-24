using System;
using System.Collections.Generic;

namespace ScpMapGenerator.Models
{
    public enum RoomShape
    {
        Undefined,
        Straight,
        Curve,
        Room3Way,
        Intersection,
        Endroom
    }

    public class AtlasInterpretation
    {
        public RoomShape Shape { get; set; }
        public int X { get; set; }
        public int Y { get; set; }
        public float RotationY { get; set; }

        public AtlasInterpretation(RoomShape shape, int x, int y, float rotationY)
        {
            Shape = shape;
            X = x;
            Y = y;
            RotationY = rotationY;
        }

        public override string ToString() => $"{Shape} at ({X}, {Y}) rot {RotationY}";
    }

    public static class MapAtlasInterpreter
    {
        public static List<AtlasInterpretation> Interpret(string[] lines)
        {
            var results = new List<AtlasInterpretation>();

            for (int y = 0; y < lines.Length; y++)
            {
                string line = lines[y];
                for (int x = 0; x < line.Length; x++)
                {
                    char c = line[x];
                    if (c == ' ') continue;

                    RoomShape shape = RoomShape.Undefined;
                    float rot = 0f;

                    // Straight
                    if (c == '\u2502' || c == '\u2551') { shape = RoomShape.Straight; rot = 0f; } // vertical
                    else if (c == '\u2500' || c == '\u2550') { shape = RoomShape.Straight; rot = 90f; } // horizontal

                    // Curve (Corners)
                    else if (c == '\u2510' || c == '\u2557') { shape = RoomShape.Curve; rot = 90f; } // top-right
                    else if (c == '\u250C' || c == '\u2554') { shape = RoomShape.Curve; rot = 180f; } // top-left
                    else if (c == '\u2514' || c == '\u255A') { shape = RoomShape.Curve; rot = 270f; } // bottom-left
                    else if (c == '\u2518' || c == '\u255D') { shape = RoomShape.Curve; rot = 0f; } // bottom-right

                    // 3-Way (T-intersection)
                    else if (c == '\u251C' || c == '\u2560') { shape = RoomShape.Room3Way; rot = 90f; } // right-pointing
                    else if (c == '\u2524' || c == '\u2563') { shape = RoomShape.Room3Way; rot = 270f; } // left-pointing
                    else if (c == '\u252C' || c == '\u2566') { shape = RoomShape.Room3Way; rot = 180f; } // down-pointing
                    else if (c == '\u2534' || c == '\u2569') { shape = RoomShape.Room3Way; rot = 0f; } // up-pointing

                    // 4-Way (Intersection)
                    else if (c == '\u253C' || c == '\u256C') { shape = RoomShape.Intersection; rot = 0f; }

                    // Endroom
                    else if (c == '\u2577' || c == '\u257B') { shape = RoomShape.Endroom; rot = 180f; } // from top
                    else if (c == '\u2575' || c == '\u2579') { shape = RoomShape.Endroom; rot = 0f; } // from bottom
                    else if (c == '\u2576' || c == '\u257A') { shape = RoomShape.Endroom; rot = 270f; } // from right
                    else if (c == '\u2574' || c == '\u2578') { shape = RoomShape.Endroom; rot = 90f; } // from left

                    if (shape != RoomShape.Undefined)
                    {
                        results.Add(new AtlasInterpretation(shape, x, y, rot));
                    }
                }
            }

            return results;
        }
    }
}
