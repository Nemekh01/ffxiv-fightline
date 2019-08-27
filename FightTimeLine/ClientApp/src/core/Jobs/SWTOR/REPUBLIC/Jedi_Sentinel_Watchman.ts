import { IJob, DamageType, IAbility, IAbilitySetting, Role, AbilityType, IStance, byName, byBuffApply, byBuffRemove } from "../../../Models"
import { settings, IAbilities, abilitySortFn, getAbilitiesFrom, tankSharedAbilities, medicine } from "../../FFXIV/shared"
import * as Fractions from "../fractions";

export const Jedi_Sentinel_Watchman: IJob = {
  name: "Watchman",
  role: Role.Melee,
  fraction: Fractions.SWTORFractions.Republic,
  baseClass: "Jedi Sentinel",
  icon: ("REPUBLIC/Jedi Sentinel/Watchman/!!!SpecIcon.jpg"),
  abilities: []
};
