import { IJob, DamageType, IAbility, IAbilitySetting, Role, AbilityType, IStance, byName, byBuffApply, byBuffRemove } from "../../../Models"
import { settings, IAbilities, abilitySortFn, getAbilitiesFrom, tankSharedAbilities, medicine } from "../../FFXIV/shared"
import * as Fractions from "../fractions";

export const Jedi_Shadow_Infiltration: IJob = {
  name: "Infiltration",
  role: Role.Melee,
  fraction: Fractions.SWTORFractions.Republic,
  baseClass: "Jedi Shadow",
  icon: ("REPUBLIC/Jedi Shadow/Infiltration/!!!SpecIcon.jpg"),
  abilities: []
};
