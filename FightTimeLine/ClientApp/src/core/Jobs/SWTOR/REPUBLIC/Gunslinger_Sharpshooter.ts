import { IJob, DamageType, IAbility, IAbilitySetting, Role, AbilityType, IStance, byName, byBuffApply, byBuffRemove } from "../../../Models"
import { settings, IAbilities, abilitySortFn, getAbilitiesFrom, tankSharedAbilities, medicine } from "../../FFXIV/shared"
import * as Fractions from "../fractions";

export const Gunslinger_Sharpshooter: IJob = {
  name: "Sharpshooter",
  role: Role.Range,
  fraction: Fractions.SWTORFractions.Republic,
  baseClass: "Gunslinger",
  icon: ("REPUBLIC/Gunslinger/Sharpshooter/!!!SpecIcon.jpg"),
  abilities: []
};
