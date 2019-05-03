import { Component, Inject, EventEmitter, ViewChild, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl } from "@angular/forms"
import { ContextMenuService, ContextMenuComponent } from "ngx-contextmenu"
import { IFilter } from "../../core/Models"


@Component({
  selector: "abilityFilter",
  templateUrl: "./filter.component.html",
  styleUrls: ["./filter.component.css"]
})
export class FilterComponent {

  @ViewChild("filter") filter: ContextMenuComponent;
  selfDefensive = true;
  partyDefensive = true;
  selfDamageBuff = true;
  partyDamageBuff = true;
  damage = true;
  healing = true;
  healingBuff = true;
  utility = true;
  pet = true;
  unused = true;
  isTankBuster = true;
  isAoe = true;
  isShare = true;
  isOther = true;


  @Output() public changed: EventEmitter<IFilter> = new EventEmitter();

  public set(filter: IFilter): void {
    this.selfDefensive = filter.abilities.selfDefence;
    this.partyDefensive = filter.abilities.partyDefence;
    this.selfDamageBuff = filter.abilities.selfDamageBuff;
    this.partyDamageBuff = filter.abilities.partyDamageBuff;
    this.damage = filter.abilities.damage;
    this.healing = filter.abilities.healing;
    this.healingBuff = filter.abilities.healing;
    this.utility = filter.abilities.utility;
    this.pet = filter.abilities.pet;
    this.unused = filter.abilities.unused;
    this.isTankBuster = filter.attacks.isTankBuster;
    this.isAoe = filter.attacks.isAoe;
    this.isShare = filter.attacks.isShareDamage;
    this.isOther = filter.attacks.isOther;
  }


  constructor(private contextMenuService: ContextMenuService) {

  }

  show($event: any) {
    setTimeout(() => {
      this.contextMenuService.show.next({
        anchorElement: $event.target,
        contextMenu: this.filter,
        event: $event,
        item: null,
      });
    });
  }

  updateFilter(): void {
    this.changed.emit(<IFilter>{
      abilities: {
        selfDefence: this.selfDefensive,
        partyDefence: this.partyDefensive,
        defensive: this.selfDefensive,
        selfDamageBuff: this.selfDamageBuff,
        partyDamageBuff: this.partyDamageBuff,
        damage: this.damage,
        healing: this.healing,
        healingBuff: this.healingBuff,
        utility: this.utility,
        pet: this.pet,
        unused: this.unused
      },
      attacks: {
        isTankBuster: this.isTankBuster,
        isAoe: this.isAoe,
        isShareDamage: this.isShare,
        isOther: this.isOther,
        keywords: []
      }
    });
  }
}

