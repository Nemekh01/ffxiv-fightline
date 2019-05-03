import { Component, Inject, EventEmitter, ViewChild, Output, Input } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl } from "@angular/forms"
import { IView } from "../../../core/Models"


@Component({
  selector: "settingsView",
  templateUrl: "./settingsView.component.html",
  styleUrls: ["./settingsView.component.css"]
})
export class SettingsViewComponent {

  buffmap = false;
  ogcdAsPoints = false;
  showDowntimesInPartyArea = false;
  verticalBossAttacks = false;
  compactView = false;
  highlightLoaded = false;
  abilityAvailablity = false;


  public set(view: IView): void {
    this.buffmap = view.buffmap;
    this.ogcdAsPoints = view.ogcdAsPoints;
    this.showDowntimesInPartyArea = view.showDowntimesInPartyArea;
    this.verticalBossAttacks = view.verticalBossAttacks;
    this.compactView = view.compactView;
    this.highlightLoaded = view.highlightLoaded;
    this.abilityAvailablity = view.showAbilityAvailablity;
  }


  public get(): IView {
    return <IView>{
      buffmap: this.buffmap,
      ogcdAsPoints: this.ogcdAsPoints,
      showDowntimesInPartyArea: this.showDowntimesInPartyArea,
      verticalBossAttacks: this.verticalBossAttacks,
      compactView: this.compactView,
      highlightLoaded: this.highlightLoaded,
      showAbilityAvailablity: this.abilityAvailablity,
    };
  }
}

