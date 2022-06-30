import { Session } from "./Timeline";
export class Widget {
  x: number = 0;
  y: number = 0;
  width: number = 0;
  height: number = 0;
  selected: boolean = false;
  update(session: Session) {}
  draw() {}
}
