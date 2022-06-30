import { CanvasInfo } from "./Timeline";
export interface KeyframeData {
  id: number;
  keyframeTime: number;
  lineIndex: number;
  editable: boolean;
  draggable: boolean;
}

export interface KeyframeParam {
  ctx: CanvasRenderingContext2D;
  lineIndex: number;
  scrollTop: number;
  keyframeData: KeyframeData;
  dpr: number;
  config: {
    defaultColor: string;
    selectedColor: string;
    unEditableColor: string;
    unDraggableColor: string;
  };
}

export class Keyframe {
  id: number;
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  keyframeTime: number;
  lineIndex: number;
  dpr: number;
  x: number;
  y: number;
  scrollTop: number;
  selected: boolean;
  editable: boolean;
  draggable: boolean;
  defaultColor: string;
  selectedColor: string;
  unEditableColor: string;
  unDraggableColor: string;
  canvasInfo?: CanvasInfo;
  width: number = 0;

  get data(): KeyframeData {
    const { id, keyframeTime, lineIndex, editable, draggable } = this;
    return {
      id,
      keyframeTime,
      lineIndex,
      editable,
      draggable
    };
  }
  constructor(params: KeyframeParam) {
    const {
      ctx,
      lineIndex = 0,
      scrollTop = 0,
      keyframeData,
      dpr = 1,
      config: { defaultColor, selectedColor, unEditableColor, unDraggableColor }
    } = params;
    const { id, keyframeTime, editable = true, draggable = true } = keyframeData;
    this.id = id;
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.keyframeTime = keyframeTime;
    this.lineIndex = +lineIndex;
    this.dpr = dpr;
    this.x = 0;
    this.y = 0;
    this.scrollTop = scrollTop;
    this.selected = false;
    this.editable = editable;
    this.draggable = draggable;
    this.defaultColor = defaultColor;
    this.selectedColor = selectedColor;
    this.unEditableColor = unEditableColor || defaultColor;
    this.unDraggableColor = unDraggableColor || defaultColor;
  }

  update(canvasInfo: any) {
    this.canvasInfo = canvasInfo;
  }

  draw() {
    const {
      ctx,
      selected,
      scrollTop,
      editable,
      draggable,
      defaultColor,
      selectedColor,
      unEditableColor,
      unDraggableColor
    } = this;
    const { timelineHeight, rowHeight: lineHeight } = this.canvasInfo!;
    ctx.save();
    const y = timelineHeight + this.lineIndex * lineHeight - scrollTop;
    ctx.fillStyle = defaultColor;
    if (!editable) {
      ctx.fillStyle = unEditableColor;
    }
    if (!draggable) {
      ctx.fillStyle = unDraggableColor;
    }
    if (selected) {
      ctx.fillStyle = selectedColor;
    }
    ctx.globalAlpha = 1;
    const offsetY = (this.y = y + lineHeight * 0.5);
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
