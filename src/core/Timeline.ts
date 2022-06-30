import { WrapMode } from "./../enum/wrapMode";
import { Widget } from "./Widget";
import { CurrentTimeLine } from "./CurrentTimeLine";
import { PlayState } from "../enum/playState";
import { clamp } from "../utils";
import { Keyframe } from "./Keyframe";

export interface Session {
  start: number;
  end: number;
  duration: number;
  currentFrame: number;
  tickNum: number;
  frameToPixels: number;
  tagPerFrame: number;
  samples: number;
}

export interface CanvasInfo {
  timelineHeight: number;
  rowHeight: number;
}

export interface WidgetConfig {
  keyframe: {
    editable: boolean;
    draggable: boolean;
    defaultColor: string;
    selectedColor: string;
    unEditableColor: string;
    unDraggableColor: string;
  };
}
export interface TimelineParam {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  dpr: number;
  widgetConfig: WidgetConfig;
  disableZoomByWheel: boolean;
  onKeyframeSelect: (keyframe: Keyframe) => void;
  onChange: () => void;
}

export class Timeline {
  keyframes: { [key: string]: Keyframe };
  keyframesList: Keyframe[];
  session: Session;
  state: PlayState;
  canvas: HTMLCanvasElement;
  dpr: number;
  widgetConfig: WidgetConfig;
  disableZoomByWheel: boolean;
  onKeyframeSelect: (keyframe: Keyframe) => void;
  onChange: () => void;
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  canvasInfo: CanvasInfo;
  enable: boolean;
  widgets: Widget[];
  currentTimeLine?: CurrentTimeLine;
  prevMouse: number[];
  dragging: boolean;
  selectedCurrentTime: boolean = false;
  scrolling: boolean = false;
  wrapMode: WrapMode = WrapMode.Loop;

  onReplay?: () => void;
  onDeleteKeyframes?: (ids: number[]) => void;
  onReset?: () => void;
  onStop?: () => void;
  onPause?: () => void;
  onPlay?: () => void;
  onUpdateCurrentFrame?: (time: number) => void;
  selectedKeyframe: Keyframe | null = null;

  private _scrollTop: number;
  private _currentFrame: number;
  private _frames: never[];

  get data() {
    const { currentFrame: currentTime, scrollTop, keyframesList } = this;
    return {
      currentTime,
      scrollTop,
      keyframesList: keyframesList.map((keyframe) => keyframe.data)
    };
  }

  set data(data) {
    const { currentTime = 0, scrollTop = 0, keyframesList = [] } = data || {};
    this.currentFrame = currentTime;
    this.scrollTop = scrollTop;
    this.keyframes = {};
    this.keyframesList = [];
    keyframesList.forEach((keyframe) => {
      this.addKeyframeData(keyframe.lineIndex, keyframe);
    });
    this.setDefaultZoom();
    this.draw();
  }

  get scrollTop() {
    return this._scrollTop;
  }

  set scrollTop(scrollTop) {
    if (scrollTop === this._scrollTop || scrollTop < 0) return;
    this._scrollTop = scrollTop;
    this.keyframesList.forEach((keyframe: { scrollTop: any }) => {
      keyframe.scrollTop = scrollTop;
    });
    this.draw();
  }

  get currentFrame() {
    return this._currentFrame;
  }

  set currentFrame(frame) {
    frame = clamp(frame, 0, this.session.duration);
    if (frame == this._currentFrame) return;
    this._currentFrame = frame;
    this.session.currentFrame = frame;
    this.draw();
    this.onUpdateCurrentFrame && this.onUpdateCurrentFrame(frame);
  }

  constructor({ canvas, ctx, dpr, widgetConfig, disableZoomByWheel, onKeyframeSelect, onChange }: TimelineParam) {
    const rect = canvas.getBoundingClientRect();
    this.canvas = canvas;
    this.dpr = dpr;
    this.widgetConfig = widgetConfig;
    this.disableZoomByWheel = disableZoomByWheel;
    this.onKeyframeSelect = onKeyframeSelect;
    this.onChange = onChange;
    this.ctx = ctx;
    this.ctx.fillStyle = "#222";
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.x = rect.x;
    this.y = rect.y;
    this.canvasInfo = {
      timelineHeight: 35 * dpr,
      rowHeight: 24 * dpr
    };

    this.session = {
      start: 0,
      end: 60,
      duration: 60,
      samples: 1,
      currentFrame: 0,
      frameToPixels: 40, // how many pixels represent one frame
      tickNum: 1,
      tagPerFrame: 5
    };
    this.enable = false;
    this.state = PlayState.INIT;
    this.widgets = [];
    this.keyframes = {};
    this.keyframesList = [];
    this.prevMouse = [];
    this.dragging = false;
    this._currentFrame = 0;
    this._scrollTop = 0;
    this._frames = [];

    this.init();
  }

  init() {
    this.currentTimeLine = new CurrentTimeLine({
      canvas: this.canvas,
      ctx: this.ctx,
      calPosFunc: this.canvasFrameToX.bind(this)
    });
    this.bindEvent();
    this.widgets.push(this.currentTimeLine);
    // this.zoom(this.session.samples / 60);
  }

  bindEvent() {
    // @ts-ignore
    this.canvas.addEventListener("mouseup", this.onMouse.bind(this));
    // @ts-ignore
    this.canvas.addEventListener("mousedown", this.onMouse.bind(this));
    // @ts-ignore
    this.canvas.addEventListener("mousemove", this.onMouse.bind(this));

    if (!this.disableZoomByWheel) {
      // @ts-ignore
      this.canvas.addEventListener("mousewheel", this.onMouseWheel.bind(this), false);
    }

    document.addEventListener(
      "keydown",
      (e) => {
        const { key } = e;
        // 删除关键帧
        if (key === "Backspace" || key === "Delete") {
          if (this.enable) {
            this.deleteKeyframe();
          }
        }
      },
      false
    );
  }

  drawTimeInfo() {
    const { ctx, canvas } = this;
    const data = this.session;
    const { timelineHeight } = this.canvasInfo;
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, timelineHeight);
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = "#AFD";
    ctx.beginPath();
    const frames: number[][] = this._frames;
    this._frames.length = 0;
    console.log(data.end);
    for (let frame = 0; frame <= data.end; frame += data.tickNum) {
      const x = this.canvasFrameToX(frame);
      if (x < 0) continue;

      const needTag = frame % data.tagPerFrame == 0;
      if (needTag) {
        frames.push([x, frame]);
      }

      ctx.moveTo(Math.round(x) + 0.5, timelineHeight * 0.5 + (needTag ? 0 : timelineHeight * 0.25));
      ctx.lineTo(Math.round(x) + 0.5, timelineHeight);
    }

    let x = this.canvasFrameToX(0);
    const endX = this.canvasFrameToX(data.end);
    if (x < 0) x = 0;
    ctx.moveTo(x, timelineHeight - 0.5);
    ctx.lineTo(endX, timelineHeight - 0.5);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.font = 10 * this.dpr + "px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#888";
    for (let i = 0; i < frames.length; ++i) {
      const [x, frame] = frames[i];
      let text = `${Math.floor(frame / data.samples)}:${((frame % data.samples) / 100).toFixed(2).split(".")[1]}`;

      // 先计算宽度，确认文字不会重叠才绘制
      const [, , prevX] = frames[i - 1] || [];
      if (!prevX || prevX + 10 < x) {
        // gap 为 10
        const { width } = ctx.measureText(text);
        frames[i].push(x + width); // 记录当前文字右边距的 x
        ctx.fillText(text, x, 10 * this.dpr);
      } else {
        frames[i].push(prevX); // 省略绘制时，将上一个 tick 的 prevX 也记录下
      }
    }
  }

  canvasFrameToX(frame: number) {
    return (frame - this.session.start) * this.session.frameToPixels + 30;
  }

  canvasXToFrame(x: number) {
    return (x - 30) / this.session.frameToPixels + this.session.start;
  }

  drawBg() {
    const { canvas, ctx, scrollTop } = this;
    const data = this.session;
    const { timelineHeight } = this.canvasInfo;

    // content
    const lineHeight = this.canvasInfo.rowHeight;

    const w = canvas.width;
    const linesNum = Math.ceil(canvas.height / lineHeight);
    for (let i = 0; i < linesNum; ++i) {
      ctx.fillStyle = i % 2 == 0 ? "#222" : "#2A2A2A";
      ctx.fillRect(0, timelineHeight + i * lineHeight - (scrollTop % (lineHeight * 2)), w, lineHeight);
    }

    // black bg
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = "black";
    ctx.fillRect(0, timelineHeight, canvas.width, canvas.height - timelineHeight);
    ctx.globalAlpha = 1;

    // bg lines
    ctx.strokeStyle = "#444";
    ctx.beginPath();
    let pos = this.canvasFrameToX(0);
    if (pos < 0) pos = 0;
    ctx.moveTo(pos + 0.5, timelineHeight);
    ctx.lineTo(pos + 0.5, canvas.height);
    ctx.moveTo(Math.round(this.canvasFrameToX(data.duration)) + 0.5, timelineHeight);
    ctx.lineTo(Math.round(this.canvasFrameToX(data.duration)) + 0.5, canvas.height);
    ctx.stroke();
  }

  draw() {
    const { canvas, ctx, canvasInfo, session, widgets, keyframesList } = this;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.drawBg();
    keyframesList.forEach((keyframe: Keyframe) => {
      keyframe.update(canvasInfo);
      keyframe.draw();
    });
    this.drawTimeInfo();
    widgets.forEach((widget: any) => {
      widget.update(session);
      widget.draw();
    });
  }

  zoom(v: number) {
    if (!this.session) return;
    this.session.frameToPixels *= v;
    this.session.end = Math.ceil(this.session.end / v);
    if (this.session.frameToPixels > 80) {
      this.session.tagPerFrame = 1;
    } else {
      this.session.tagPerFrame = 5;
      console.log("zoom", this.session.tickNum);
    }
  }

  prevKeyframe() {
    const { keyframesList } = this;
    let closestTime = null;
    for (let i = keyframesList.length - 1; i >= 0; --i) {
      const { keyframeTime } = keyframesList[i];
      if (keyframeTime < this.currentFrame && keyframeTime >= 0) {
        closestTime = keyframesList[i].keyframeTime;
        break;
      }
    }
    if (closestTime !== null) {
      this.currentFrame = closestTime;
    }
  }

  nextKeyframe() {
    const { keyframesList } = this;
    let closestTime = null;
    for (let i = 0; i < keyframesList.length; ++i) {
      const { keyframeTime } = keyframesList[i];
      if (keyframeTime > this.currentFrame && keyframeTime <= this.session.duration) {
        closestTime = keyframesList[i].keyframeTime;
        break;
      }
    }
    if (closestTime) {
      this.currentFrame = closestTime;
    }
  }

  getMouseSelection(e: { canvasX: number; canvasY: number }) {
    const {
      widgets,
      keyframesList,
      canvasInfo: { rowHeight }
    } = this;
    const items: any[] = [];
    widgets.forEach((widget) => {
      widget.selected = false;
      if (
        Math.abs(widget.x - e.canvasX) <= widget.width / 2 + 8 &&
        Math.abs(widget.y - e.canvasY) <= widget.height / 2
      ) {
        items.push(widget);
      }
    });
    keyframesList.forEach((keyframe: { selected: boolean; x: number; width: any; y: number }) => {
      keyframe.selected = false;
      if (
        keyframe.x - 5 <= e.canvasX &&
        keyframe.x + keyframe.width + 5 >= e.canvasX &&
        Math.abs(keyframe.y - e.canvasY) <= rowHeight / 2
      ) {
        items.push(keyframe);
      }
    });
    return items;
  }

  onMouse(e: {
    mouseX: number;
    pageX: number;
    mouseY: number;
    pageY: number;
    canvasX: number;
    canvasY: number;
    type: string;
    preventDefault: () => void;
    stopPropagation: () => void;
  }) {
    if (!this.enable) return;
    const dom = this.canvas; // e.target;
    const canvasRect = dom.getBoundingClientRect();
    e.mouseX = e.pageX - canvasRect.left - window.scrollX;
    e.mouseY = e.pageY - canvasRect.top - window.scrollY;
    e.canvasX = e.mouseX * this.dpr;
    e.canvasY = e.mouseY * this.dpr;
    if (e.canvasY < 0) {
      e.canvasY = 0;
    }

    if (e.type === "mousedown") {
      const items = this.getMouseSelection(e);
      items.forEach((item) => {
        if (item instanceof CurrentTimeLine) {
          this.canvas.style.cursor = "col-resize";
          this.selectedCurrentTime = true;
        }
        if (item instanceof Keyframe) {
          if (item.editable || item.draggable) {
            item.selected = true;
            this.selectedKeyframe = item;
            this.selectedCurrentTime = false;
          }
        }
      });
      this.prevMouse = [e.mouseX, e.mouseY];
      this.dragging = true;
      if (this.state === PlayState.PLAYING) {
        this.stop();
      }
      this.draw();
      e.preventDefault();
      e.stopPropagation();
    }
    if (e.type === "mousemove") {
      const time = this.canvasXToFrame(e.canvasX);
      if (this.dragging) {
        if (this.selectedCurrentTime) {
          this.currentFrame = time * 1000;
        } else if (this.selectedKeyframe) {
          if (this.selectedKeyframe.draggable) {
            this.selectedKeyframe.keyframeTime = this.canvasXToFrame(e.canvasX) * 1000;
            this.draw();
          }
        } else {
          const old = this.canvasXToFrame(this.prevMouse[0]);
          const now = this.canvasXToFrame(e.mouseX);
          if (Math.abs(e.mouseX - this.prevMouse[0]) > 5) {
            this.scrolling = true;
          }
          const newStart = this.session.start + old - now;
          const newEnd = this.session.end + old - now;

          if (newStart >= 0) {
            this.session.start = newStart;
            this.session.end = newEnd;
          }
          this.prevMouse[0] = e.mouseX;
          this.draw();
        }
      }
      e.preventDefault();
      e.stopPropagation();
    }
    if (e.type === "mouseup") {
      const frame = this.canvasXToFrame(e.canvasX);
      const noSelected = !this.selectedKeyframe;
      if (this.selectedKeyframe) {
        this.onKeyframeSelect && this.onKeyframeSelect.call(this, this.selectedKeyframe);
        this.selectedKeyframe = null;
        this.draw();
      }
      if (noSelected && !this.scrolling) {
        this.currentFrame = frame;
      }
      this.selectedCurrentTime = false;
      this.dragging = false;
      this.scrolling = false;
      this.canvas.style.cursor = "default";
    }

    return true;
  }

  onMouseWheel(e: {
    mouseX: number;
    pageX: number;
    mousey: number;
    pageY: number;
    deltaY: number;
    preventDefault: () => void;
    stopPropagation: () => void;
  }) {
    if (!this.enable) return;
    const root_element = this.canvas; // e.target;
    const b = root_element.getBoundingClientRect();
    e.mouseX = e.pageX - b.left;
    e.mousey = e.pageY - b.top;

    if (e.deltaY > 0) this.zoom(0.95);
    else this.zoom(1.05);
    this.draw();
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  // 获取keyframe画的位置
  getSentinelYById(id: string) {
    const sentinelDom = document.getElementById(id);
    if (sentinelDom) {
      return sentinelDom.getBoundingClientRect().y + sentinelDom.getBoundingClientRect().height / 2;
    }
  }

  addKeyframeData(lineIndex: number, keyframeData: Keyframe["data"]) {
    const { scrollTop } = this;
    const { currentFrame: currentTime, widgetConfig } = this;
    const { editable, draggable, defaultColor, selectedColor, unEditableColor, unDraggableColor } =
      widgetConfig.keyframe;
    const { id } = keyframeData;
    if (this.keyframes[id]) return null;
    if (isNaN(keyframeData.keyframeTime)) {
      keyframeData.keyframeTime = currentTime;
    }
    if (keyframeData.editable === undefined) {
      keyframeData.editable = editable;
    }
    if (keyframeData.draggable === undefined) {
      keyframeData.draggable = draggable;
    }
    const keyframe = new Keyframe({
      ctx: this.ctx,
      lineIndex,
      scrollTop,
      keyframeData,
      dpr: this.dpr,
      config: {
        defaultColor,
        selectedColor,
        unEditableColor,
        unDraggableColor
      }
    });
    this.keyframes[id] = keyframe;
    this.keyframesList.push(keyframe);
    this.keyframesList.sort((a, b) => a.keyframeTime - b.keyframeTime);
    this.draw();
    this.onChange && this.onChange();
    return keyframe;
  }

  update(deltaTime: number) {
    if (this.state !== PlayState.PLAYING) return;
    this.currentFrame += (deltaTime * this.session.samples) / 1000;
    if (this.currentFrame >= this.session.duration) {
      if (this.wrapMode === WrapMode.Loop) {
        this.replay();
      } else {
        this.stop();
      }
    }
  }

  play() {
    if (this.state === PlayState.STOP) {
      this.replay();
      return;
    }
    this.state = PlayState.PLAYING;
    this.onPlay && this.onPlay();
  }

  replay() {
    this.reset();
    this.play();
    this.onReplay && this.onReplay();
  }

  pause() {
    this.state = PlayState.PAUSE;
    this.onPause && this.onPause();
  }

  stop() {
    this.state = PlayState.STOP;
    this.currentFrame = 0;
    this.onStop && this.onStop();
  }

  reset() {
    this.state = PlayState.INIT;
    this.currentFrame = 0;
    this.onReset && this.onReset();
  }

  deleteKeyframe() {
    const { keyframesList } = this;
    const deleted = [];
    for (let i = keyframesList.length - 1; i >= 0; --i) {
      if (keyframesList[i].selected && keyframesList[i].editable) {
        const keyframe = keyframesList[i];
        deleted.push(keyframe.id);
        delete this.keyframes[keyframe.id];
        this.keyframesList.splice(i, 1);
      }
    }
    if (deleted.length) {
      this.draw();
      this.onDeleteKeyframes && this.onDeleteKeyframes(deleted);
      this.onChange && this.onChange();
    }
  }

  setDefaultZoom() {
    const marginFactor = this.session.duration / 10;
    this.session.start = -0.2 * marginFactor;
    const endTimePos = this.canvasFrameToX(this.session.duration);
    const factor = this.canvas.width / endTimePos;
    this.zoom(factor * 0.98);
  }
}
