import { VerticalLine } from "./VerticalLine";
export class CurrentTimeLine extends VerticalLine {
  update(session: any) {
    const { currentTime } = session;
    this.currentTime = currentTime;
    this.pos = this.x = Math.round(this.calPosFunc(currentTime));
  }
}
