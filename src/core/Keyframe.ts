import { CanvasInfo } from "./Timeline";
export interface KeyframeData {
  id: number;
  frame: number;
  lineIndex: number;
  draggable: boolean;
}

export interface KeyframeParam {
  id: number;
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  keyframeData: KeyframeData;
  dpr: number;
  config: {
    defaultColor: string;
    selectedColor: string;
    unDraggableColor: string;
  };
}

export class Keyframe {
  id: number;
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  dpr: number;
  x: number;
  y: number;
  selected: boolean;
  draggable: boolean;
  defaultColor: string;
  selectedColor: string;
  unDraggableColor: string;
  canvasInfo?: CanvasInfo;
  width: number = 0;
  frame: number;

  // get data(): KeyframeData {
  //   const { id, keyframeTime, lineIndex, editable, draggable } = this;
  //   return {
  //     id,
  //     keyframeTime,
  //     lineIndex,
  //     editable,
  //     draggable
  //   };
  // }

  constructor(params: KeyframeParam) {
    const {
      ctx,
      id,
      x,
      y,
      keyframeData,
      dpr = 1,
      config: { defaultColor, selectedColor, unDraggableColor }
    } = params;
    const { frame, draggable = true } = keyframeData;
    this.id = id;
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.frame = frame;
    this.dpr = dpr;
    this.x = x;
    this.y = y;
    this.selected = false;
    this.draggable = draggable;
    this.defaultColor = defaultColor;
    this.selectedColor = selectedColor;
    this.unDraggableColor = unDraggableColor || defaultColor;
  }

  draw() {
    const { ctx, selected, draggable, defaultColor, selectedColor, unDraggableColor } = this;
    ctx.save();
    ctx.fillStyle = defaultColor;
    if (selected) {
      ctx.fillStyle = selectedColor;
    }
    if (!draggable) {
      ctx.fillStyle = unDraggableColor;
    }
    ctx.globalAlpha = 1;
    const offsetY = this.y;
    ctx.strokeStyle = defaultColor;
    const pos = this.x;
    const dpr = this.dpr;
    // keyframe
    ctx.beginPath();
    ctx.moveTo(pos, offsetY + 5 * dpr);
    ctx.lineTo(pos + 5 * dpr, offsetY);
    ctx.lineTo(pos, offsetY - 5 * dpr);
    ctx.lineTo(pos - 5 * dpr, offsetY);
    ctx.fill();
    ctx.globalAlpha = 0.5;
    ctx.restore();
  }
}
