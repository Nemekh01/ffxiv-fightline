import { Component, Inject, EventEmitter, ViewChild, Output, Input } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl } from "@angular/forms"
import {
  trigger,
  state,
  style,
  animate,
  transition,
  keyframes
} from '@angular/animations';


@Component({
  selector: "avatarWithPing",
  templateUrl: "./ping.component.html",
  styleUrls: ["./ping.component.css"],
  animations: [
    trigger('ping', [
      state('start', style({})),
      state('end', style({})),
      transition('start => end', [
        animate('0.5s', keyframes([
          style({ transform: 'rotate(0deg)' }),
          style({ transform: 'rotate(360deg)' }),
        ]))
      ]),
      transition('end => start', [])  
    ])
  ]
})
export class PingComponent {

  @Input('owner') public owner: boolean;
  @Input('name') public name: string;
  @Input('id') public id: string;
  pinged: boolean = false;

  public ping() {
    this.pinged = true;
  }

  onAnimationEvent(event: AnimationEvent) {
    this.pinged = false;
  }

  clicked() {
    this.ping();
  }
}

