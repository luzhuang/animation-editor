import React, { Component } from "react";
import Ticker from "../../utils/ticker";
import { KeyframeInfo, Timeline as TimelineCanvas } from "../../core/Timeline";
import { Keyframe } from "../../core/Keyframe";
export class Timeline extends Component<any> {
  speed = 1;
  dpr = window.devicePixelRatio;
  timeline?: TimelineCanvas;
  canvas?: HTMLCanvasElement;

  static getDerivedStateFromProps(nextProps: any) {
    const { currentFrame, samples, scrollTop } = nextProps;
    return {
      currentFrame,
      samples,
      scrollTop
    };
  }

  state = {
    currentFrame: 0,
    samples: 60,
    scrollTop: 0
  };

  componentDidMount() {
    const { canvas } = this;
    const { currentFrame, samples, scrollTop } = this.state;
    const {
      widgetConfig,
      disableZoomByWheel = false,
      onKeyframeSelect,
      onChange,
      noNeedTicker,
      onUpdateCurrentFrame
    } = this.props;
    const ctx = canvas!.getContext("2d");
    const timeline = (this.timeline = new TimelineCanvas({
      canvas: canvas!,
      ctx: ctx!,
      dpr: this.dpr,
      widgetConfig, // 内部组件配置
      disableZoomByWheel, // 是否禁用滚轮缩放
      onKeyframeSelect, // 选中 Keyframe 时的回调
      onChange, // timeline 数据变更回调
      onUpdateCurrentFrame
    }));

    timeline.currentFrame = currentFrame;
    timeline.samples = samples;
    timeline.scrollTop = scrollTop;
    timeline.draw();
    timeline.enable = true;
    if (!noNeedTicker) {
      Ticker.update = (spf: number) => {
        timeline.update(spf * this.speed);
      };
      Ticker.start();
    }
  }

  componentDidUpdate() {
    const { timeline } = this;
    const { currentFrame, samples, scrollTop } = this.state;
    if (!timeline) return;
    timeline.currentFrame = currentFrame;
    timeline.samples = samples;
    timeline.scrollTop = scrollTop;
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

  addKeyframe(keyframeData: any): Keyframe {
    return this.timeline!.addKeyframeData(keyframeData.lineIndex, keyframeData);
  }

  updateKeyframesPos(keyframeInfoList: KeyframeInfo[]) {
    console.log(keyframeInfoList);
    this.timeline!.updateKeyframesPos(keyframeInfoList);
  }

  getData() {
    // return this.timeline!.data;
  }

  setData(data: any) {
    // this.timeline!.data = data;
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
