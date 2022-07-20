import React, { Component } from "react";
import ReactDOM from "react-dom/client";
import { Timeline, PropertyPanel, AnimationClipEditor } from "../src/index";
import "./index.less";

let id = 0;
class AnimationEditor extends Component {
  timeline: Timeline;
  propertyPanel: PropertyPanel;
  splitLineTimeInput: HTMLInputElement;
  keyframeDurationInput: HTMLInputElement;
  setCurrentTimeInput: HTMLInputElement;
  setDurationInput: HTMLInputElement;
  setScrollTopInput: HTMLInputElement;
  lineIndexInput: HTMLInputElement;
  componentDidMount() {
    console.log(111);
    // console.log(window.localStorage.timelineData);
    // const data = JSON.parse(window.localStorage.timelineData || "{}");
    // data.keyframesList &&
    //   data.keyframesList.forEach((item) => {
    //     if (item.id > id) {
    //       id = item.id;
    //     }
    //   });
    // this.timeline.setData(data);
    // //propertyPanel
    // this.propertyPanel.setProperties([
    //   {
    //     name: "item1",
    //     data: {
    //       test: 1
    //     },
    //     onAdd: (name, data) => {
    //       console.log(name, data);
    //       this.timeline.addKeyframeData(0, {
    //         id: ++id,
    //         duration: 0,
    //         data: data
    //       });
    //     }
    //   },
    //   {
    //     name: "item2",
    //     data: {
    //       test: 2
    //     },
    //     onAdd: (name, data) => {
    //       console.log(name, data);
    //       this.timeline.addKeyframeData(1, {
    //         id: ++id,
    //         duration: 200,
    //         flags: [0, 100],
    //         data: data,
    //         editable: false,
    //         draggable: false
    //       });
    //     }
    //   },
    //   {
    //     name: "item3",
    //     data: {
    //       test: 3
    //     },
    //     onAdd: (name, data) => {
    //       console.log(name, data);
    //       this.timeline.addKeyframeData(2, {
    //         id: ++id,
    //         duration: 300,
    //         flags: [],
    //         data: data,
    //         editable: false
    //       });
    //     }
    //   }
    // ]);
  }
  render() {
    return (
      <div>
        <h1>OasisUI-AnimationClipEditor Demo</h1>
        <AnimationClipEditor />
        {/* <h1>OasisUI-Timeline Demo</h1>
        <Timeline
          width={1300}
          height={300}
          editable={true}
          disableZoomByWheel={false}
          ref={(el) => {
            this.timeline = el!;
          }}
          widgetConfig={{
            keyframe: {
              editable: true,
              draggable: true
            },
            splitline: {
              editable: true,
              draggable: true,
              defaultColor: "#ccc",
              selectedColor: "blue",
              unEditableColor: "red",
              unDraggableColor: "yellow"
            }
          }}
          onKeyframeSelect={(keyframe) => {
            console.log(keyframe);
          }}
          onChange={() => {
            console.log(this.timeline.getData());
          }}
        /> */}
        {/* <div>
          设置当前时间
          <input
            type="number"
            ref={(el) => {
              this.setCurrentTimeInput = el!;
            }}
            onChange={() => {
              this.timeline.setCurrentTime(+this.setCurrentTimeInput.value);
            }}
          />
          设置动画时长
          <input
            type="number"
            ref={(el) => {
              this.setDurationInput = el!;
            }}
            onChange={() => {
              this.timeline.setDuration(+this.setDurationInput.value);
            }}
          />
          <button
            onClick={() => {
              this.timeline.play();
            }}
          >
            play
          </button>
          <button
            onClick={() => {
              this.timeline.pause();
            }}
          >
            pause
          </button>
          <button
            onClick={() => {
              this.timeline.stop();
            }}
          >
            stop
          </button>
          <button
            onClick={() => {
              this.timeline.replay();
            }}
          >
            replay
          </button>
        </div>
        <div>
          在第
          <input
            type="number"
            ref={(el) => {
              this.lineIndexInput = el!;
            }}
          />
          行
          <button
            onClick={() => {
              this.timeline.addKeyframeData(+this.lineIndexInput.value, {
                id: id++,
               
              });
            }}
          >
            添加关键帧
          </button>
          帧时长
          <input
            type="number"
            ref={(el) => {
              this.keyframeDurationInput = el!;
            }}
          />
        </div>
        <div>
          设置scrollTop
          <input
            type="number"
            ref={(el) => {
              this.setScrollTopInput = el!;
            }}
            onChange={() => {
              this.timeline.setScrollTop(+this.setScrollTopInput.value);
            }}
          />
          <button
            onClick={() => {
              const data = this.timeline.getData();
              console.log(data);
              window.localStorage.timelineData = JSON.stringify(data);
            }}
          >
            获取当前数据
          </button>
        </div>
        <div>
          在
          <input
            type="number"
            ref={(el) => {
              this.splitLineTimeInput = el!;
            }}
          />
          毫秒
          <button
            onClick={() => {
              const time = this.splitLineTimeInput.value;
              this.timeline.addSplitLine(+time, {
                alpha: 0.4, // 默认0.4,
                color: "#fff"
              });
            }}
          >
            添加分割线
          </button>
        </div>
        <h1>OasisUI-AnimationPropertyPanel Demo</h1>
        <div className="propertyPanel">
          <PropertyPanel
            ref={(el) => {
              this.propertyPanel = el!;
            }}
            onPlay={() => {
              this.timeline.play();
            }}
            onPause={() => {
              this.timeline.pause();
            }}
            onStop={() => {
              this.timeline.stop();
            }}
            onReplay={() => {
              this.timeline.replay();
            }}
            onSetDuration={() => {
              this.timeline.setDuration(this.timeline.getCurrentTime());
            }}
            onSetCurrentTime={(val) => {
              this.timeline.setCurrentTime(val);
            }}
          />
        </div> */}
      </div>
    );
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AnimationEditor />
  </React.StrictMode>
);
