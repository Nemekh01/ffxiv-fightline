import { IJob, DamageType, IAbility, IAbilitySetting, Role, AbilityType, IStance, byName, byBuffApply, byBuffRemove } from "../../../Models"
import { settings, IAbilities, abilitySortFn, getAbilitiesFrom, tankSharedAbilities, medicine } from "../../FFXIV/shared"
import * as Fractions from "../fractions";

export const Commando_Assault_Specialist: IJob = {
  name: "Assault Specialist",
  role: Role.Melee,
  fraction: Fractions.SWTORFractions.Republic,
  baseClass: "Commando",
  icon: ("REPUBLIC/Commando/Assault Specialist/!!!SpecIcon.jpg"),
  abilities: []
};
