import { IJob, DamageType, IAbility, IAbilitySetting, Role, AbilityType, IStance, byName, byBuffApply, byBuffRemove } from "../../../Models"
import { settings, IAbilities, abilitySortFn, getAbilitiesFrom, tankSharedAbilities, medicine } from "../../FFXIV/shared"
import * as Fractions from "../fractions";

export const Vanguard_Tactics: IJob = {
  name: "Tactics",
  role: Role.Melee,
  fraction: Fractions.SWTORFractions.Republic,
  baseClass: "Vanguard",
  icon: ("REPUBLIC/Vanguard/Tactics/!!!SpecIcon.jpg"),
  abilities: []
};
