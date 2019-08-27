import { IJob, DamageType, IAbility, IAbilitySetting, Role, AbilityType, IStance, byName, byBuffApply, byBuffRemove } from "../../../Models"
import { settings, IAbilities, abilitySortFn, getAbilitiesFrom, tankSharedAbilities, medicine } from "../../FFXIV/shared"
import * as Fractions from "../fractions";

export const Jedi_Guardian_Focus: IJob = {
  name: "Focus",
  role: Role.Melee,
  fraction: Fractions.SWTORFractions.Republic,
  baseClass: "Jedi Guardian",
  icon: ("REPUBLIC/Jedi Guardian/Focus/!!!SpecIcon.jpg"),
  abilities: []
};
