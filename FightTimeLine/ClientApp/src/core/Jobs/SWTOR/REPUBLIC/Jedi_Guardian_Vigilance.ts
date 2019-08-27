import { IJob, DamageType, IAbility, IAbilitySetting, Role, AbilityType, IStance, byName, byBuffApply, byBuffRemove } from "../../../Models"
import { settings, IAbilities, abilitySortFn, getAbilitiesFrom, tankSharedAbilities, medicine } from "../../FFXIV/shared"
import * as Fractions from "../fractions";

export const Jedi_Guardian_Vigilance: IJob = {
  name: "Vigilance",
  role: Role.Melee,
  fraction: Fractions.SWTORFractions.Republic,
  baseClass: "Jedi Guardian",
  icon: ("REPUBLIC/Jedi Guardian/Vigilance/!!!SpecIcon.jpg"),
  abilities: []
};
