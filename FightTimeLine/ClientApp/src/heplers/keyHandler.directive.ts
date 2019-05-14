import {
  Directive,
  EventEmitter,
  ElementRef,
  HostListener,
  Input,
  Output
} from "@angular/core";

import {
  NgControl
}
  from "@angular/forms"

@Directive({
  selector: "[keyHandler]"
})
export class KeyHandlerDirective {

  @Output("onCommand") onCommand = new EventEmitter<{ name: string, data?: {} }>();

  code = null;

  @HostListener("window:keydown", ["$event"])
  onKeyDown(event) {
    this.code = event.code;
    this.handleKey(event);
    return false;
  }

  private handleKey(event: any) {
    if (this.code !== event.code) {
      return;
    }

    if (event.key === "Delete") {
      this.onCommand.next({ name: "delete" });
    } else
      if (event.code === "KeyZ" && event.ctrlKey) {
        this.onCommand.next({ name: "undo" });
      } else
        if (event.code === "KeyY" && event.ctrlKey) {
          this.onCommand.next({ name: "redo" });
        } else

          if (event.code === "ArrowLeft") {
            this.onCommand.next({ name: "move", data: { delta: -1 * (event.ctrlKey ? 10 : 1) } });
          } else
            if (event.code === "ArrowRight") {
              this.onCommand.next({ name: "move", data: { delta: 1 * (event.ctrlKey ? 10 : 1) } });
            }
    setTimeout(() => this.handleKey(event), 500);
  }


  @HostListener("window:keyup", ["$event"])
  onKeyUp(event) {
    this.code = null;
    return false;
  }

  constructor() {
  }
}
