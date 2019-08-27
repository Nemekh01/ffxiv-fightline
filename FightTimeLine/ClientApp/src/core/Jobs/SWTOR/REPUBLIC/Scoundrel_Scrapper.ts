import { IJob, DamageType, IAbility, IAbilitySetting, Role, AbilityType, IStance, byName, byBuffApply, byBuffRemove } from "../../../Models"
import { settings, IAbilities, abilitySortFn, getAbilitiesFrom, tankSharedAbilities, medicine } from "../../FFXIV/shared"
import * as Fractions from "../fractions";

export const Scoundrel_Scrapper: IJob = {
  name: "Scrapper",
  role: Role.Melee,
  fraction: Fractions.SWTORFractions.Republic,
  baseClass: "Scoundrel",
  icon: ("REPUBLIC/Scoundrel/Scrapper/!!!SpecIcon.jpg"),
  abilities: []
};
