import { IJob, DamageType, IAbility, IAbilitySetting, Role, AbilityType, IStance, byName, byBuffApply, byBuffRemove } from "../../../Models"
import { settings, IAbilities, abilitySortFn, getAbilitiesFrom, tankSharedAbilities, medicine } from "../../FFXIV/shared"
import * as Fractions from "../fractions";

export const Jedi_Shadow_Kinetic_Combat: IJob = {
  name: "Kinetic Combat",
  role: Role.Tank,
  fraction: Fractions.SWTORFractions.Republic,
  baseClass: "Jedi Shadow",
  icon: ("REPUBLIC/Jedi Shadow/Kinetic Combat/!!!SpecIcon.jpg"),
  abilities: []
};
