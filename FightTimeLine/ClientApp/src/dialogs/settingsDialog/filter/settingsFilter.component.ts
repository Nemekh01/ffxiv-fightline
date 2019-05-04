import { Component, Inject, EventEmitter, ViewChild, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl } from "@angular/forms"
import { IFilter } from "../../../core/Models"

@Component({
  selector: "settingsFilter",
  templateUrl: "./settingsFilter.component.html",
  styleUrls: ["./settingsFilter.component.css"]
})
export class SettingsFilterComponent {

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
  isMagical = true;
  isPhysical = true;
  isUnaspected = true;

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
    this.isMagical = filter.attacks.isMagical;
    this.isPhysical = filter.attacks.isPhysical;
    this.isUnaspected = filter.attacks.isUnaspected;
  }



  public get(): IFilter {
    return <IFilter>{
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
        isPhysical: this.isPhysical,
        isMagical: this.isMagical,
        isUnaspected: this.isUnaspected,
        keywords: []
      }
    };
  }
}

