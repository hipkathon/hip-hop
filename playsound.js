const beats = [0.03, 0.53, 1.03, 1.53];

const codes = [
  ["C", "G", "Am", "F"],
  ["F", "C", "Dm", "G"],
];

const hz = {
  C: [130.813, 164.834, 195.998, 261.626, 329.628, 391.995, 523.251, 659.255],
  Dm: [146.832, 184.997, 220.0, 293.665, 369.994, 440.0, 587.33, 739.989],
  G: [146.832, 195.998, 246.942, 293.665, 391.995, 493.883, 587.33, 783.991],
  Em: [155.564, 184.997, 195.998, 246.942, 311.127, 369.994, 391.995, 493.883],
  Am: [130.813, 164.834, 220.0, 261.626, 329.628, 440.0, 523.251, 659.255],
  F: [130.813, 174.614, 220.0, 261.626, 349.228, 440.0, 523.251, 698.457],
};

class PlaySound {
  constructor() {
    this.codeType = 0;
    this.codeIndex = -1;
  }

  setAudioContext() {
    if (!this.audioContext) {
      this.audioContext =
        new window.AudioContext() || new window.webkitAudioContext();
    }
  }

  setCodeType() {
    this.codeType = random.randRange(0, 2);
    this.codeIndex = -1;
  }

  beat() {
    this.setAudioContext();
    this.codeIndex = (this.codeIndex + 1) % 4;

    const oscillator = this.audioContext.createOscillator();
    oscillator.connect(this.audioContext.destination);
    oscillator.type = "sawtooth";
    oscillator.frequency.value = 0;
    oscillator.start(0);
    const currentTime = this.audioContext.currentTime;
    beats.forEach((beat) => {
      oscillator.frequency.setTargetAtTime(
        65.406,
        currentTime + beat + 0,
        0.001
      );
      oscillator.frequency.setTargetAtTime(0, currentTime + beat + 0.03, 0.001);
    });
    setTimeout(() => {
      oscillator.stop(0);
    }, 2000);
  }

  melody() {
    this.setAudioContext();

    const oscillator = this.audioContext.createOscillator();
    oscillator.connect(this.audioContext.destination);
    oscillator.type = "sawtooth";
    oscillator.frequency.value =
      hz[codes[this.codeType][this.codeIndex]][random.randRange(0, 8)];
    oscillator.start();
    setTimeout(() => {
      oscillator.stop(0);
    }, 100);
  }
}
