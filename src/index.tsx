import { Timeline } from "./components/Timeline";
import { PropertyPanel } from "./components/PropertyPanel";
import "./index.less";
import "antd/dist/antd.dark.css";

export { Timeline } from "./components/Timeline";
export { PropertyPanel } from "./components/PropertyPanel";

export const AnimationClipEditor = () => {
  return (
    <div className="animationClipEditorWrap">
      <div className="propertyPanel">
        <PropertyPanel
          ref={(el) => {
            // this.propertyPanel = el!;
          }}
          onPlay={() => {
            // this.timeline.play();
          }}
          onPause={() => {
            // this.timeline.pause();
          }}
          onStop={() => {
            // this.timeline.stop();
          }}
          onReplay={() => {
            // this.timeline.replay();
          }}
          onSetDuration={() => {
            // this.timeline.setDuration(this.timeline.getCurrentTime());
          }}
          onSetCurrentTime={(val: number) => {
            // this.timeline.setCurrentTime(val);
          }}
        />
      </div>
      <Timeline
        width={window.innerWidth - 300}
        height={300}
        editable={true}
        disableZoomByWheel={false}
        ref={(el) => {
          console.log(el);
          el?.play();
          // this.timeline = el!;
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
};
