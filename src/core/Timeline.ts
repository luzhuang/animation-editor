import { CurrentTimeLine } from "./CurrentTimeLine";
import { PlayState } from "../enum/playState";
import { clamp } from "../utils";
import { Keyframe } from "./Keyframe";

export class Timeline {
  keyframes: any;
  keyframesList: any;
  private _duration: any;
  session: {
    currentTime: number;
    tickTime: number;
    seconds_to_pixels: number;
    startTime: number;
    duration: number;
    endTime: any;
    selection: any;
  };
  private _scrollTop: any;
  private _currentTime: any;
  state: any;
  canvas: any;
  dpr: any;
  widgetConfig: any;
  disableZoomByWheel: any;
  onKeyframeSelect: any;
  onChange: any;
  ctx: any;
  x: any;
  y: any;
  canvasInfo: { timelineHeight: number; rowHeight: number };
  enable: any;
  widgets: any;
  currentTimeLine: any;
  private _times: never[];
  prevMouse: any[];
  dragging: boolean;
  onReplay: any;
  onDeleteKeyframes: any;
  onReset: any;
  onStop: any;
  onPause: any;
  onPlay: any;
  wrapMode: number = 1;
  onUpdateCurrentTime: any;
  selectedCurrentTime: boolean = false;
  selectedKeyframe: Keyframe | null = null;
  scrolling: boolean = false;

  get duration() {
    return this._duration;
  }

  set duration(time) {
    const { endTime } = this.session;
    if (time === this._duration) return;
    time = parseInt(time);
    if (time / 1000 > endTime) {
      this.session.endTime = time / 1000;
    }
    this._duration = time;
    this.session.duration = time / 1000;
    this.draw();
  }

  get data() {
    const { currentTime, duration, scrollTop, keyframesList } = this;
    return {
      currentTime,
      duration,
      scrollTop,
      keyframesList: keyframesList.map((keyframe: { data: any }) => keyframe.data)
    };
  }

  set data(data) {
    const { currentTime = 0, duration = 10000, scrollTop = 0, keyframesList = [] } = data || {};
    this.duration = duration;
    this.currentTime = currentTime;
    this.scrollTop = scrollTop;
    this.keyframes = {};
    this.keyframesList = [];
    keyframesList.forEach((keyframe: { lineIndex: any }) => {
      this.addKeyframeData(keyframe.lineIndex, keyframe as any);
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

  get currentTime() {
    return this._currentTime;
  }

  set currentTime(time) {
    const { duration } = this;
    if (time < 0) time = 0;
    if (time > this.session.endTime * 1000) {
      time = this.session.endTime * 1000;
    }
    if (this.state === PlayState.PLAYING) {
      time = clamp(time, 0, duration);
    }
    time = parseInt(time);
    if (time == this._currentTime) return;
    this._currentTime = time;
    this.session.currentTime = time / 1000;
    this.draw();
    this.onUpdateCurrentTime && this.onUpdateCurrentTime(time);
  }

  constructor({ canvas, ctx, dpr, widgetConfig, disableZoomByWheel, onKeyframeSelect, onChange }: any) {
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
      startTime: -0.2, // time at left side of window (use a negative number to leave some margin)
      endTime: 10,
      currentTime: 0,
      seconds_to_pixels: 200, // how many pixels represent one second
      selection: null,
      tickTime: 0.1,
      duration: 10
    };
    this.enable = false;
    this.state = PlayState.INIT;
    this._currentTime = 0;
    this._duration = this.session.endTime * 1000;
    this._scrollTop = 0;
    this._times = [];
    this.widgets = [];
    this.keyframes = {};
    this.keyframesList = [];
    this.prevMouse = [];
    this.dragging = false;
    this.init();
  }

  init() {
    const currentTimeLine = (this.currentTimeLine = new CurrentTimeLine({
      canvas: this.canvas,
      ctx: this.ctx,
      calPosFunc: this.canvasTimeToX.bind(this)
    }));
    this.bindEvent();
    this.widgets.push(currentTimeLine);
  }

  bindEvent() {
    this.canvas.addEventListener("mouseup", this.onMouse.bind(this));
    this.canvas.addEventListener("mousedown", this.onMouse.bind(this));
    this.canvas.addEventListener("mousemove", this.onMouse.bind(this));

    if (!this.disableZoomByWheel) {
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
    const times: any[] = this._times;
    this._times.length = 0;
    for (let time = 0; time <= data.endTime; time += data.tickTime) {
      time = parseFloat(time.toFixed(1));
      const x = this.canvasTimeToX(time);
      if (x < 0) continue;

      const is_tick = time % 1 == 0;
      if (is_tick) {
        times.push([x, time]);
      }

      ctx.moveTo(Math.round(x) + 0.5, timelineHeight * 0.5 + (is_tick ? 0 : timelineHeight * 0.25));
      ctx.lineTo(Math.round(x) + 0.5, timelineHeight);
    }

    let x = this.canvasTimeToX(0);
    const endx = this.canvasTimeToX(data.endTime);
    if (x < 0) x = 0;
    ctx.moveTo(x, timelineHeight - 0.5);
    ctx.lineTo(endx, timelineHeight - 0.5);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // time seconds in text
    ctx.font = 10 * this.dpr + "px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#888";
    for (let i = 0; i < times.length; ++i) {
      const [x, time] = times[i];
      const text = time == (time | 0) ? time : time.toFixed(1);

      // 先计算宽度，确认文字不会重叠才绘制
      const [, , prevX] = times[i - 1] || [];
      if (!prevX || prevX + 10 < x) {
        // gap 为 10
        const { width } = ctx.measureText(text);
        times[i].push(x + width); // 记录当前文字右边距的 x
        ctx.fillText(text, x, 10 * this.dpr);
      } else {
        times[i].push(prevX); // 省略绘制时，将上一个 tick 的 prevX 也记录下
      }
    }
  }

  canvasTimeToX(time: number) {
    return (time - this.session.startTime) * this.session.seconds_to_pixels;
  }

  canvasXToTime(x: number) {
    return x / this.session.seconds_to_pixels + this.session.startTime;
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
    let pos = this.canvasTimeToX(0);
    if (pos < 0) pos = 0;
    ctx.moveTo(pos + 0.5, timelineHeight);
    ctx.lineTo(pos + 0.5, canvas.height);
    ctx.moveTo(Math.round(this.canvasTimeToX(data.duration)) + 0.5, timelineHeight);
    ctx.lineTo(Math.round(this.canvasTimeToX(data.duration)) + 0.5, canvas.height);
    ctx.stroke();
  }

  draw() {
    const { canvas, ctx, canvasInfo, session, widgets, keyframesList } = this;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.drawBg();
    keyframesList.forEach(
      (keyframe: { update: (arg0: { duration: number; endTime: any }, arg1: any) => void; draw: () => void }) => {
        keyframe.update(session, canvasInfo);
        keyframe.draw();
      }
    );
    this.drawTimeInfo();
    widgets.forEach(
      (widget: { update: (arg0: { duration: number; endTime: any }, arg1: any) => void; draw: () => void }) => {
        widget.update(session, canvasInfo);
        widget.draw();
      }
    );
  }

  zoom(v: number, centerx: number, noChangeStartTime?: boolean | undefined) {
    if (!this.session) return;
    centerx = centerx || this.canvas.width * 0.5;
    const x = clamp(this.canvasXToTime(centerx), 0, this.session.endTime);
    this.session.seconds_to_pixels *= v;
    // 根据缩放动态调整 tickTime, 控制子刻度的绘制数量
    if (this.session.seconds_to_pixels > 50) {
      this.session.tickTime = 0.1;
    } else if (this.session.seconds_to_pixels > 30) {
      this.session.tickTime = 0.2;
    } else if (this.session.seconds_to_pixels > 10) {
      this.session.tickTime = 0.5;
    } else {
      const numLength = parseInt(this.session.endTime).toString().length;
      const delta = Math.pow(10, numLength - 1);
      const factor = (Math.ceil(this.session.endTime / delta) * delta) / 10;
      this.session.tickTime = 0.1 * factor;
    }

    if (noChangeStartTime) return;
    this.session.startTime += x - this.canvasXToTime(centerx);
  }

  prevKeyframe() {
    const { keyframesList } = this;
    let closestTime = null;
    for (let i = keyframesList.length - 1; i >= 0; --i) {
      const { time } = keyframesList[i];
      if (time < this.currentTime && time >= 0) {
        closestTime = keyframesList[i].time;
        break;
      }
    }
    if (closestTime !== null) {
      this.currentTime = closestTime;
    }
  }

  nextKeyframe() {
    const { keyframesList } = this;
    let closestTime = null;
    for (let i = 0; i < keyframesList.length; ++i) {
      const { time } = keyframesList[i];
      if (time > this.currentTime && time <= this.duration) {
        closestTime = keyframesList[i].time;
        break;
      }
    }
    if (closestTime) {
      this.currentTime = closestTime;
    }
  }

  getMouseSelection(e: { canvasx: number; canvasy: number }) {
    const {
      widgets,
      keyframesList,
      canvasInfo: { rowHeight }
    } = this;
    const items: any[] = [];
    widgets.forEach((widget: { selected: boolean; x: number; width: number; y: number; height: number }) => {
      widget.selected = false;
      if (
        Math.abs(widget.x - e.canvasx) <= widget.width / 2 + 8 &&
        Math.abs(widget.y - e.canvasy) <= widget.height / 2
      ) {
        items.push(widget);
      }
    });
    keyframesList.forEach((keyframe: { selected: boolean; x: number; width: any; y: number }) => {
      keyframe.selected = false;
      if (
        keyframe.x - 5 <= e.canvasx &&
        keyframe.x + keyframe.width + 5 >= e.canvasx &&
        Math.abs(keyframe.y - e.canvasy) <= rowHeight / 2
      ) {
        items.push(keyframe);
      }
    });
    return items;
  }

  onMouse(e: {
    mousex: number;
    pageX: number;
    mousey: number;
    pageY: number;
    canvasx: number;
    canvasy: number;
    type: string;
    preventDefault: () => void;
    stopPropagation: () => void;
  }) {
    if (!this.enable) return;
    const dom = this.canvas; // e.target;
    const canvasRect = dom.getBoundingClientRect();
    e.mousex = e.pageX - canvasRect.left - window.scrollX;
    e.mousey = e.pageY - canvasRect.top - window.scrollY;
    e.canvasx = e.mousex * this.dpr;
    e.canvasy = e.mousey * this.dpr;
    if (e.canvasy < 0) {
      e.canvasy = 0;
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
      this.prevMouse = [e.mousex, e.mousey];
      this.dragging = true;
      if (this.state === PlayState.PLAYING) {
        this.stop();
      }
      this.draw();
      e.preventDefault();
      e.stopPropagation();
    }
    if (e.type === "mousemove") {
      const time = this.canvasXToTime(e.canvasx);
      if (this.dragging) {
        if (this.selectedCurrentTime) {
          this.currentTime = time * 1000;
        } else if (this.selectedKeyframe) {
          if (this.selectedKeyframe.draggable) {
            this.selectedKeyframe.keyframeTime = this.canvasXToTime(e.canvasx) * 1000;
            this.draw();
          }
        } else {
          const old = this.canvasXToTime(this.prevMouse[0]);
          const now = this.canvasXToTime(e.mousex);
          if (Math.abs(e.mousex - this.prevMouse[0]) > 5) {
            this.scrolling = true;
          }
          this.session.startTime += old - now;
          this.session.endTime += old - now;
          if (this.currentTime > this.session.endTime * 1000) {
            this.currentTime = this.session.endTime * 1000;
          }
          if (this.session.endTime < this.session.duration) {
            this.session.endTime = this.session.duration;
          }
          this.prevMouse[0] = e.mousex;
          this.draw();
        }
      }
      e.preventDefault();
      e.stopPropagation();
    }
    if (e.type === "mouseup") {
      const time = this.canvasXToTime(e.canvasx);
      const noSelected = !this.selectedKeyframe;
      if (this.selectedKeyframe) {
        this.onKeyframeSelect && this.onKeyframeSelect.call(this, this.selectedKeyframe);
        this.selectedKeyframe = null;
        this.draw();
      }
      if (noSelected && !this.scrolling) {
        this.currentTime = time * 1000;
      }
      this.selectedCurrentTime = false;
      this.dragging = false;
      this.scrolling = false;
      this.canvas.style.cursor = "default";
    }

    return true;
  }

  onMouseWheel(e: {
    mousex: number;
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
    e.mousex = e.pageX - b.left;
    e.mousey = e.pageY - b.top;

    if (e.deltaY > 0) this.zoom(0.95, e.mousex);
    else this.zoom(1.05, e.mousex);
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

  addKeyframeData(lineIndex: any, keyframeData: { keyframeTime?: any; editable?: any; draggable?: any; id?: any }) {
    const {
      canvasInfo: { timelineHeight, rowHeight },
      scrollTop
    } = this;
    const {
      currentTime,
      widgetConfig: {
        keyframe: { editable, draggable, defaultColor, selectedColor, unEditableColor, unDraggableColor, flagColor }
      }
    } = this;
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
    keyframeData = Object.assign(keyframeData, {
      defaultColor,
      selectedColor,
      unEditableColor,
      unDraggableColor,
      flagColor
    });
    const keyframe = new Keyframe({
      ctx: this.ctx,
      lineIndex,
      scrollTop,
      keyframeData,
      calPosFunc: this.canvasTimeToX.bind(this),
      dpr: this.dpr
    });
    this.keyframes[id] = keyframe;
    this.keyframesList.push(keyframe);
    this.keyframesList.sort((a: { time: number }, b: { time: number }) => a.time - b.time);
    this.draw();
    this.onChange && this.onChange();
    return keyframe;
  }

  update(deltaTime: any) {
    if (this.state !== PlayState.PLAYING) return;
    this.currentTime += deltaTime;
    if (this.currentTime >= this.duration) {
      if (this.wrapMode === 1) {
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
    this.currentTime = 0;
    this.onStop && this.onStop();
  }

  reset() {
    this.state = PlayState.INIT;
    this.currentTime = 0;
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
    const marginFactor = this.session.endTime / 10;
    this.session.startTime = -0.2 * marginFactor;
    const endTimePos = this.canvasTimeToX(this.session.endTime);
    const factor = this.canvas.width / endTimePos;
    this.zoom(factor * 0.98, this.session.endTime / 2, true);
  }
}
