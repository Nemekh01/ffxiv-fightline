import { Component, OnInit, OnDestroy } from "@angular/core";
import { ISidePanelComponent } from "../ISidePanelComponent"
import * as H from "../../../core/DataHolders"
import * as X from "@xivapi/angular-client"
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: "singleAbility",
  templateUrl: "./singleAbility.component.html",
  styleUrls: ["./singleAbility.component.css"],
})
export class SingleAbilityComponent implements OnInit, OnDestroy, ISidePanelComponent {

  description: any;

  constructor(private xivapi: X.XivapiService, private sanitizer: DomSanitizer) {

  }

  items: any[];

  get it(): H.AbilityUsageMap {
    return this.items[0] as H.AbilityUsageMap; 
  }

  setItems(items: any[]): void {
    this.items = items;
    this.xivapi.get(X.XivapiEndpoint.Action, Number(this.it.ability.xivDbId)).subscribe(a => {
      this.description = this.sanitizer.bypassSecurityTrustHtml(a.Description.replace(new RegExp("\\n+", "g"),"<br/>"));
    });
  }

  ngOnInit(): void {
     
  }

  ngOnDestroy(): void {
    
  }

}
