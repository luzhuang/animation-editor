export class VerticalLine {
  currentTime: any;
  canvas: any;
  ctx: any;
  calPosFunc: any;
  x: number;
  y: number;
  width: number;
  height: any;
  alpha: number;
  color: any;
  pos: number;
  constructor(params: any) {
    const { currentTime = 0, canvas, ctx, calPosFunc, color = "#AFD" } = params;
    this.currentTime = currentTime;
    this.canvas = canvas;
    this.ctx = ctx;
    this.calPosFunc = calPosFunc;
    this.x = 0;
    this.y = canvas.height / 2;
    this.width = 10; // 为了好选择
    this.height = canvas.height;
    this.alpha = 1;
    this.color = color;
    this.pos = 0;
  }

  update(session: any) {}

  draw() {
    const { ctx, canvas, currentTime, alpha, color, pos } = this;
    ctx.save();
    ctx.strokeStyle = ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, canvas.height); // line
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos - 4, 0);
    ctx.lineTo(pos + 4, 0);
    ctx.lineTo(pos, 6); // triangle
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(pos - 4, canvas.height);
    ctx.lineTo(pos + 4, canvas.height);
    ctx.lineTo(pos, canvas.height - 6); // triangle
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
