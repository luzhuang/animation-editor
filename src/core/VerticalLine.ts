import { Session } from "./Timeline";
import { Widget } from "./Widget";

interface VerticalLineParam {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  calPosFunc: (param: number) => number;
  color?: string;
  currentFrame?: number;
}
export class VerticalLine extends Widget {
  currentFrame: number;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  calPosFunc: (param: number) => number;
  x: number;
  y: number;
  width: number;
  height: number;
  alpha: number;
  color: string;
  pos: number;
  constructor(params: VerticalLineParam) {
    super();
    const { currentFrame = 0, canvas, ctx, calPosFunc, color = "#AFD" } = params;
    this.currentFrame = currentFrame;
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

  update(session: Session) {}

  draw() {
    const { ctx, canvas, currentFrame: currentTime, alpha, color, pos } = this;
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
