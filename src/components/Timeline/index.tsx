import React, { Component } from "react";
import { Ticker } from "../../utils/ticker";
import { Timeline as TimelineCanvas } from "../../core/Timeline";
export class Timeline extends Component<any> {
  speed = 1;
  dpr = window.devicePixelRatio;
  timeline?: TimelineCanvas;
  canvas?: HTMLCanvasElement;

  componentDidMount() {
    const { canvas } = this;
    const { widgetConfig = {}, disableZoomByWheel = false, onKeyframeSelect, onChange, noNeedTicker } = this.props;
    const ctx = canvas!.getContext("2d");
    const timeline = (this.timeline = new TimelineCanvas({
      canvas,
      ctx,
      dpr: this.dpr,
      widgetConfig, // 内部组件配置
      disableZoomByWheel, // 是否禁用滚轮缩放
      onKeyframeSelect, // 选中 Keyframe 时的回调
      onChange // timeline 数据变更回调
    }));
    timeline.draw();
    timeline.enable = true;
    if (!noNeedTicker) {
      const ticker = new Ticker();
      ticker.update = (spf: number) => {
        timeline.update(spf * this.speed);
      };
      ticker.start();
    }
  }

  getCurrentTime() {
    return this.timeline!.currentTime;
  }

  setCurrentTime(time: number) {
    this.timeline!.currentTime = time;
  }
  setDuration(duration: number) {
    this.timeline!.duration = duration;
  }
  setSpeed(speed: number) {
    this.speed = speed;
  }

  play() {
    this.timeline!.play();
  }

  pause() {
    this.timeline!.pause();
  }

  stop() {
    this.timeline!.stop();
  }

  replay() {
    this.timeline!.replay();
  }

  addKeyframeData(lineIndex: number, keyframeData: any) {
    this.timeline!.addKeyframeData(lineIndex, keyframeData);
  }

  addSplitLine(time: number, options: any) {
    this.timeline!.addSplitLine(time, options);
  }

  setScrollTop(scrollTop: number) {
    this.timeline!.scrollTop = scrollTop;
  }

  getData() {
    return this.timeline!.data;
  }

  setData(data: any) {
    this.timeline!.data = data;
  }
  render() {
    const { width = 0, height = 0 } = this.props;
    return (
      <canvas
        width={width * this.dpr}
        height={height * this.dpr}
        style={{ width: width + "px", height: height + "px" }}
        ref={(el) => {
          this.canvas = el!;
        }}
      />
    );
  }
}
