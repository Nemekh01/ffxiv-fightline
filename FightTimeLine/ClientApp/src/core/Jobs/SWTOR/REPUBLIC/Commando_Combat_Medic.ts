import { IJob, DamageType, IAbility, IAbilitySetting, Role, AbilityType, IStance, byName, byBuffApply, byBuffRemove } from "../../../Models"
import { settings, IAbilities, abilitySortFn, getAbilitiesFrom, tankSharedAbilities, medicine } from "../../FFXIV/shared"
import * as Fractions from "../fractions";

export const Commando_Combat_Medic: IJob = {
  name: "Combat Medic",
  role: Role.Healer,
  fraction: Fractions.SWTORFractions.Republic,
  baseClass: "Commando",
  icon: ("REPUBLIC/Commando/Combat Medic/!!!SpecIcon.jpg"),
  abilities: []
};
