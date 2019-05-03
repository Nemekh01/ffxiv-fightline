import { Component, OnInit, OnDestroy } from "@angular/core";
import { ISidePanelComponent } from "../ISidePanelComponent"
import * as H from "../../../core/DataHolders"

@Component({
  selector: "singleAbility",
  templateUrl: "./singleAbility.component.html",
  styleUrls: ["./singleAbility.component.css"],
})
export class SingleAbilityComponent implements OnInit, OnDestroy, ISidePanelComponent {
  

  constructor() {

  }

  items: any[];

  get it(): H.AbilityUsageMap {
    return this.items[0] as H.AbilityUsageMap; 
  }

  setItems(items: any[]): void {
    this.items = items;
  }

  ngOnInit(): void {
     
  }

  ngOnDestroy(): void {
    
  }

}
