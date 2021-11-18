class Random {
  constructor() {
    this.setSeed("init");
  }

  xmur3() {
    this.h = Math.imul(this.h ^ (this.h >>> 16), 2246822507);
    this.h = Math.imul(this.h ^ (this.h >>> 13), 3266489909);
    return (this.h ^= this.h >>> 16) >>> 0;
  }

  mulberry32() {
    this.a += 0x6d2b79f5;
    let t = this.a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  setSeed(str) {
    this.h = 1779033703 ^ str.length;

    for (let i = 0; i < str.length; i++) {
      this.h = Math.imul(this.h ^ str.charCodeAt(i), 3432918353);
      this.h = (this.h << 13) | (this.h >>> 19);
    }

    this.a = this.xmur3();
  }

  rand() {
    return this.mulberry32();
  }

  randRange(min, max) {
    const range = max - min;
    return min + Math.floor(this.mulberry32() * range);
  }
}
