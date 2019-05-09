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

import { Utils } from "../core/Utils"


enum WheelOperator {
  INCREASE,
  DECREASE
}

@Directive({
  selector: "[wheelOn]"
})
export class OffsetWheelDirective {
  private operators: any = {
    [WheelOperator.INCREASE]: (a: string, b: number): string =>
      Utils.formatTime(new Date(Math.max(Math.min(this.handleParse(a).valueOf() + b * 1000, 946677600000 + 30 * 60 * 1000), 946677600000))),
    [WheelOperator.DECREASE]: (a: string, b: number): string =>
      Utils.formatTime(new Date(Math.max(Math.min(this.handleParse(a).valueOf() - b * 1000, 946677600000 + 30 * 60 * 1000), 946677600000)))
  };

  @HostListener("mousewheel", ["$event"])
  onMouseWheel(event) {
    const nativeValue: string = this.el.nativeElement.value;

    if (event.wheelDelta > 0) {
      (this.el.nativeElement as HTMLInputElement).value = this.handleOperation(
        nativeValue,
        WheelOperator.INCREASE,
        event.ctrlKey ? 60 : 1
      );
    } else {
      (this.el.nativeElement as HTMLInputElement).value = this.handleOperation(
        nativeValue,
        WheelOperator.DECREASE,
        event.ctrlKey ? 60 : 1
      );
    }
    
    //propagate ngModel changes
    this.el.nativeElement.dispatchEvent(new Event("input"));
    //this.control.control.setValue(this.el.nativeElement.value);
    return false;
  }

  handleOperation(value: string, operator: WheelOperator, multi: number): string {
    return this.operators[operator](value, this.getRangeNumber(operator) * multi);

  }

  getRangeNumber(operator: WheelOperator): number {
    if (operator === WheelOperator.INCREASE) {
      return 1;
    } else if (operator === WheelOperator.DECREASE) {
      return 1;
    }
  }

  handleParse(value: string): Date {
    if (value)
      return Utils.getDateFromOffset(value, new Date(946677600000));
    else
      return new Date(946677600000);
  }

  constructor(private el: ElementRef, private control: NgControl) {
    //el.nativeElement.value = this.handleParse(el.nativeElement.value);
    el.nativeElement.step = 1;
  }
}
