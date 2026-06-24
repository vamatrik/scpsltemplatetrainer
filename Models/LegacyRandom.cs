using System;

namespace ScpMapGenerator.Models
{
    // A faithful port of the .NET Framework / Mono System.Random algorithm
    // This is required because .NET 6+ changed the Random algorithm, 
    // and we need to perfectly match SCP:SL's (Unity/Mono) RNG for seed parity.
    public class LegacyRandom
    {
        private const int MBIG = int.MaxValue;
        private const int MSEED = 161803398;
        private const int MZ = 0;

        private int inext;
        private int inextp;
        private int[] SeedArray = new int[56];

        public LegacyRandom(int Seed)
        {
            int ii;
            int mj, mk;

            int subtraction = (Seed == int.MinValue) ? int.MaxValue : Math.Abs(Seed);
            mj = MSEED - subtraction;
            SeedArray[55] = mj;
            mk = 1;
            for (int i = 1; i < 55; i++)
            {
                ii = (21 * i) % 55;
                SeedArray[ii] = mk;
                mk = mj - mk;
                if (mk < 0) mk += MBIG;
                mj = SeedArray[ii];
            }
            for (int k = 1; k < 5; k++)
            {
                for (int i = 1; i < 56; i++)
                {
                    SeedArray[i] -= SeedArray[1 + (i + 30) % 55];
                    if (SeedArray[i] < 0) SeedArray[i] += MBIG;
                }
            }
            inext = 0;
            inextp = 21;
        }

        protected virtual double Sample()
        {
            return (InternalSample() * (1.0 / MBIG));
        }

        private int InternalSample()
        {
            int retVal;
            int locINext = inext;
            int locINextp = inextp;

            if (++locINext >= 56) locINext = 1;
            if (++locINextp >= 56) locINextp = 1;

            retVal = SeedArray[locINext] - SeedArray[locINextp];

            if (retVal == MBIG) retVal--;
            if (retVal < 0) retVal += MBIG;

            SeedArray[locINext] = retVal;

            inext = locINext;
            inextp = locINextp;

            return retVal;
        }

        public virtual int Next()
        {
            return InternalSample();
        }

        public virtual int Next(int minValue, int maxValue)
        {
            if (minValue > maxValue)
                throw new ArgumentOutOfRangeException("minValue");

            long range = (long)maxValue - minValue;
            if (range <= (long)int.MaxValue)
            {
                return ((int)(Sample() * range) + minValue);
            }
            else
            {
                return (int)((long)(GetSampleForLargeRange() * range) + minValue);
            }
        }

        public virtual int Next(int maxValue)
        {
            if (maxValue < 0)
                throw new ArgumentOutOfRangeException("maxValue");
            return (int)(Sample() * maxValue);
        }

        public virtual double NextDouble()
        {
            return Sample();
        }

        private double GetSampleForLargeRange()
        {
            int result = InternalSample();
            bool negative = (InternalSample() % 2 == 0) ? true : false;
            if (negative) result = -result;
            double d = result;
            d += (int.MaxValue - 1);
            d /= 2.0 * (uint.MaxValue - 1);
            return d;
        }
    }
}
