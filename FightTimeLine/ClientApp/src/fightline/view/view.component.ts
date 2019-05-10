import { Component, Inject, EventEmitter, ViewChild, Output, Input } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl } from "@angular/forms"
import { IView } from "../../core/Models"


@Component({
  selector: "viewMenu",
  templateUrl: "./view.component.html",
  styleUrls: ["./view.component.css"]
})
export class ViewComponent {

  buffmap = false;
  ogcdAsPoints = false;
  showDowntimesInPartyArea = false;
  verticalBossAttacks = false;
  compactView = false;
  highlightLoaded = false;
  abilityAvailablity = false;


  @Output() public changed: EventEmitter<IView> = new EventEmitter();

  public set(view: IView): void {
    this.buffmap = view.buffmap;
    this.ogcdAsPoints = view.ogcdAsPoints;
    this.showDowntimesInPartyArea = view.showDowntimesInPartyArea;
    this.verticalBossAttacks = view.verticalBossAttacks;
    this.compactView = view.compactView;
    this.highlightLoaded = view.highlightLoaded;
    this.abilityAvailablity = view.showAbilityAvailablity;
  }


  constructor() {

  }

  updateView(): void {
    setTimeout(() => {
      this.changed.emit(<IView>{
        buffmap: this.buffmap,
        ogcdAsPoints: this.ogcdAsPoints,
        showDowntimesInPartyArea: this.showDowntimesInPartyArea,
        verticalBossAttacks: this.verticalBossAttacks,
        compactView: this.compactView,
        highlightLoaded: this.highlightLoaded,
        showAbilityAvailablity: this.abilityAvailablity,
      });
    });

  }
}

