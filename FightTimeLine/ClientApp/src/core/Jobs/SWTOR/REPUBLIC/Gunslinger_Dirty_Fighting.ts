import { IJob, DamageType, IAbility, IAbilitySetting, Role, AbilityType, IStance, byName, byBuffApply, byBuffRemove } from "../../../Models"
import { settings, IAbilities, abilitySortFn, getAbilitiesFrom, tankSharedAbilities, medicine } from "../../FFXIV/shared"
import * as Fractions from "../fractions";

export const Gunslinger_Dirty_Fighting: IJob = {
  name: "Dirty Fighting",
  role: Role.Melee,
  fraction: Fractions.SWTORFractions.Republic,
  baseClass: "Gunslinger",
  icon: ("REPUBLIC/Gunslinger/Dirty Fighting/!!!SpecIcon.jpg"),
  abilities: []
};
