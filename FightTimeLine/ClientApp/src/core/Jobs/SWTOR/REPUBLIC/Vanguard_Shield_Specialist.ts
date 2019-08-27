import { IJob, DamageType, IAbility, IAbilitySetting, Role, AbilityType, IStance, byName, byBuffApply, byBuffRemove } from "../../../Models"
import { settings, IAbilities, abilitySortFn, getAbilitiesFrom, tankSharedAbilities, medicine } from "../../FFXIV/shared"
import * as Fractions from "../fractions";

export const Vanguard_Shield_Specialist: IJob = {
  name: "Shield Specialist",
  role: Role.Melee,
  fraction: Fractions.SWTORFractions.Republic,
  baseClass: "Vanguard",
  icon: ("REPUBLIC/Vanguard/Shield Specialist/!!!SpecIcon.jpg"),
  abilities: []
};
