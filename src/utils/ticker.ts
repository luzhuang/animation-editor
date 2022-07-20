export class Ticker {
  frequency: number;
  lastTick: number;
  cumulateTime: number;
  played: boolean;

  constructor() {
    this.frequency = 1000 / 60;
    this.lastTick = 0;
    this.cumulateTime = 0;
    this.played = false;
  }

  start() {
    this.played = true;
    this.enqueue();
  }

  stop() {
    this.played = false;
  }

  enqueue() {
    window.requestAnimationFrame(this.loop.bind(this));
  }

  loop(time: number) {
    this.cumulateTime += time - this.lastTick || 0;

    if (this.cumulateTime > 1000) {
      this.cumulateTime = 1000;
    }

    while (this.cumulateTime > this.frequency) {
      this.update(this.frequency);
      this.cumulateTime -= this.frequency;
    }

    this.lastTick = time;

    this.played && this.enqueue();
  }

  update(frequency: number) {}
}

export default new Ticker();
