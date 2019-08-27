import { IJob, DamageType, IAbility, IAbilitySetting, Role, AbilityType, IStance, byName, byBuffApply, byBuffRemove } from "../../../Models"
import { settings, IAbilities, abilitySortFn, getAbilitiesFrom, tankSharedAbilities, medicine } from "../../FFXIV/shared"
import * as Fractions from "../fractions";

export const Commando_Combat_Gunnery: IJob = {
  name: "Gunnery",
  role: Role.Melee,
  fraction: Fractions.SWTORFractions.Republic,
  baseClass: "Commando",
  icon: ("REPUBLIC/Commando/Gunnery/!!!SpecIcon.jpg"),
  abilities: []
};
