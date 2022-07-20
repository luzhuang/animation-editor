import React, { Component } from "react";
import { Timeline } from "./components/Timeline";
import { PropertyPanel, KeyframeData } from "./components/PropertyPanel";
import "./index.less";
import "antd/dist/antd.dark.css";
import { Keyframe } from "./core/Keyframe";

export { Timeline } from "./components/Timeline";
export { PropertyPanel } from "./components/PropertyPanel";

const propertiesAdded = [
  {
    name: "Transform.position",
    properties: [
      {
        name: "x"
      },
      {
        name: "y"
      },
      {
        name: "z"
      }
    ]
  },
  {
    name: "Transform.scale",
    properties: [
      {
        name: "x"
      },
      {
        name: "y"
      },
      {
        name: "z"
      }
    ]
  },
  {
    name: "MeshRenderer.enabled",
    properties: []
  },
  {
    name: "MeshRenderer.Material.color",
    properties: [
      {
        name: "r"
      },
      {
        name: "g"
      },
      {
        name: "b"
      },
      {
        name: "a"
      }
    ]
  }
];
export class AnimationClipEditor extends Component<null> {
  state = {
    currentFrame: 0,
    samples: 60,
    scrollTop: 0
  };
  propertiesMap: Record<string, any> = {};
  keyFramesMap: Record<string, Keyframe> = {};
  timeLineRef = React.createRef<Timeline>();
  // const timeLineRef = useRef<Timeline>();
  // const [currentFrame, setCurrentFrame] = useState(0);
  // const [samples, setSamples] = useState(60);

  componentDidMount() {
    console.log(222);
    this.formatProperties();
  }

  formatProperties() {
    let lineIndex = -1;
    return propertiesAdded.map((property: any, index: number) => {
      const { expanded = true, properties } = property;
      lineIndex++;
      const newProperty = Object.assign(property, {
        key: `${index}`,
        lineIndex,
        properties: properties.map((subProperty: any, subIndex: number) => {
          expanded && lineIndex++;
          const newSubProperty = Object.assign(subProperty, {
            parentKey: `${index}`,
            key: `${index}-${subIndex}`,
            lineIndex
          });
          this.propertiesMap[`${index}-${subIndex}`] = subProperty;
          const keyframe = this.keyFramesMap[`${index}-${subIndex}`];
          if (keyframe) {
            keyframe.draggable = expanded;
          }
          return newSubProperty;
        })
      });
      this.propertiesMap[`${index}`] = property;
      return newProperty;
    });
  }

  render() {
    const { currentFrame, samples, scrollTop } = this.state;
    const timeLineRef = this.timeLineRef;
    return (
      <div className="animationClipEditorWrap">
        <div className="propertyPanel">
          <PropertyPanel
            currentFrame={currentFrame}
            propertiesAdded={propertiesAdded}
            onPlay={() => {
              timeLineRef.current?.play();
            }}
            onPause={() => {
              timeLineRef.current?.pause();
            }}
            onReplay={() => {
              timeLineRef.current?.replay();
            }}
            onScroll={(scrollTop: number) => {
              this.setState({
                scrollTop
              });
            }}
            onSetSamples={(samples: number) => {
              this.setState({
                samples
              });
            }}
            onSetCurrentFrame={(currentFrame: number) => {
              this.setState({
                currentFrame
              });
            }}
            onAddKeyframe={(keyframeData: KeyframeData) => {
              const timeLine = timeLineRef.current!;
              const keyframe = timeLine.addKeyframe(keyframeData);
              this.keyFramesMap[keyframeData.key] = keyframe;
            }}
            onExpand={(key: string, expanded: boolean) => {
              const timeLine = timeLineRef.current!;
              this.propertiesMap[key].expanded = expanded;
              this.formatProperties();
              const keyframeInfoList = [];
              for (let key in this.keyFramesMap) {
                const propertyInfo = this.propertiesMap[key];
                const keyframe = this.keyFramesMap[key];
                keyframeInfoList.push({
                  lineIndex: propertyInfo.lineIndex,
                  keyframe
                });
              }
              timeLine.updateKeyframesPos(keyframeInfoList);
              this.forceUpdate();
            }}
          />
        </div>
        <Timeline
          width={window.innerWidth - 300}
          height={300}
          editable={true}
          disableZoomByWheel={false}
          ref={timeLineRef}
          currentFrame={currentFrame}
          samples={samples}
          scrollTop={scrollTop}
          onUpdateCurrentFrame={(currentFrame: number) => {
            this.setState({
              currentFrame
            });
          }}
          // onKeyframeSelect={(keyframe) => {
          //   console.log(keyframe);
          // }}
          // onChange={() => {
          //   console.log(this.timeline.getData());
          // }}
        />
      </div>
    );
  }
}

// const timeLineRef = useRef<Timeline>();
// const [currentFrame, setCurrentFrame] = useState(0);
// const [samples, setSamples] = useState(60);

// useEffect(() => {
//   const timeline = timeLineRef.current;
//   if (timeline) {
//     timeline.setSamples(samples);
//   }
// }, [samples]);

// const propertiesAdded = [
//   {
//     name: "Transform.position",
//     properties: [
//       {
//         name: "x"
//       },
//       {
//         name: "y"
//       },
//       {
//         name: "z"
//       }
//     ]
//   },
//   {
//     name: "Transform.scale",
//     properties: [
//       {
//         name: "x"
//       },
//       {
//         name: "y"
//       },
//       {
//         name: "z"
//       }
//     ]
//   },
//   {
//     name: "MeshRenderer.enabled",
//     properties: []
//   },
//   {
//     name: "MeshRenderer.Material.color",
//     properties: [
//       {
//         name: "r"
//       },
//       {
//         name: "g"
//       },
//       {
//         name: "b"
//       },
//       {
//         name: "a"
//       }
//     ]
//   }
// ];

// const formattedProperties = propertiesAdded.map((property) => {
//   return {}
// });
