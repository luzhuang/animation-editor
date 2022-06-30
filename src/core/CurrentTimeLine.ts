import { Session } from "./Timeline";
import { VerticalLine } from "./VerticalLine";
export class CurrentTimeLine extends VerticalLine {
  update(session: Session) {
    const { currentFrame } = session;
    this.currentFrame = currentFrame;
    this.pos = this.x = Math.round(this.calPosFunc(currentFrame));
  }
}
