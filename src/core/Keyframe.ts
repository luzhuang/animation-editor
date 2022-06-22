export class Keyframe {
  id: any;
  ctx: any;
  _data: any;
  canvas: any;
  keyframeTime: any;
  duration: number;
  lineIndex: number;
  calPosFunc: any;
  dpr: any;
  x: number;
  y: number;
  scrollTop: any;
  selected: boolean;
  flags: any;
  editable: any;
  draggable: any;
  defaultColor: any;
  selectedColor: any;
  unEditableColor: any;
  unDraggableColor: any;
  flagColor: any;
  canvasInfo: any;
  width: number = 0;
  get data() {
    const { id, keyframeTime, duration, lineIndex, flags, _data, editable, draggable } = this;
    return {
      id,
      keyframeTime,
      duration,
      lineIndex,
      data: _data,
      flags,
      editable,
      draggable
    };
  }
  constructor(params: any) {
    const { ctx, calPosFunc, lineIndex = 0, scrollTop = 0, keyframeData, dpr = 1 } = params;
    const {
      id,
      keyframeTime,
      duration,
      flags,
      data,
      editable = true,
      draggable = true,
      defaultColor = "#9AF",
      selectedColor = "#FC6",
      unEditableColor,
      unDraggableColor,
      flagColor = "#fff"
    } = keyframeData;
    this.id = id;
    this.ctx = ctx;
    this._data = data;
    this.canvas = ctx.canvas;
    this.keyframeTime = keyframeTime;
    this.duration = +duration || 0;
    this.lineIndex = +lineIndex;
    this.calPosFunc = calPosFunc;
    this.dpr = dpr;
    this.x = 0;
    this.y = 0;
    this.scrollTop = scrollTop;
    this.selected = false;
    this.flags = flags || [];
    this.editable = editable;
    this.draggable = draggable;
    this.defaultColor = defaultColor;
    this.selectedColor = selectedColor;
    this.unEditableColor = unEditableColor || defaultColor;
    this.unDraggableColor = unDraggableColor || defaultColor;
    this.flagColor = flagColor;
  }

  update(session: any, canvasInfo: any) {
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
    const { timelineHeight, rowHeight: lineHeight } = this.canvasInfo;
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
    const posStart = (this.x = this.calPosFunc(this.keyframeTime / 1000));
    const posEnd = this.calPosFunc((this.keyframeTime + this.duration) / 1000);
    this.width = posEnd - posStart;
    const dpr = this.dpr;
    // keyframe
    ctx.beginPath();
    ctx.moveTo(posStart, offsetY + 5 * dpr);
    ctx.lineTo(posEnd, offsetY + 5 * dpr);
    ctx.lineTo(posEnd + 5 * dpr, offsetY);
    ctx.lineTo(posEnd, offsetY - 5 * dpr);
    ctx.lineTo(posStart, offsetY - 5 * dpr);
    ctx.lineTo(posStart - 5 * dpr, offsetY);
    ctx.fill();
    // timeline keyframe vertical lines
    ctx.globalAlpha = 0.5;
    ctx.beginPath();

    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();
    this.drawFlags(offsetY);
  }

  drawFlags(offsetY: number) {
    const { ctx, flagColor } = this;
    ctx.save();
    ctx.fillStyle = flagColor;
    const dpr = this.dpr;
    this.flags.forEach((flagTime: number) => {
      const pos = this.calPosFunc((this.keyframeTime + flagTime) / 1000);
      // ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.moveTo(pos, offsetY + 4 * dpr);
      ctx.lineTo(pos + 4 * dpr, offsetY);
      ctx.lineTo(pos, offsetY - 4 * dpr);
      ctx.lineTo(pos - 4 * dpr, offsetY);
      ctx.fill();
    });
    ctx.restore();
  }
}
