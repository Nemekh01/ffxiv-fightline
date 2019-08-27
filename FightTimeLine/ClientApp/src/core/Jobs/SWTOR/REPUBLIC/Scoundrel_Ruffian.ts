import { IJob, DamageType, IAbility, IAbilitySetting, Role, AbilityType, IStance, byName, byBuffApply, byBuffRemove } from "../../../Models"
import { settings, IAbilities, abilitySortFn, getAbilitiesFrom, tankSharedAbilities, medicine } from "../../FFXIV/shared"
import * as Fractions from "../fractions";

export const Scoundrel_Ruffian: IJob = {
  name: "Ruffian",
  role: Role.Tank,
  fraction: Fractions.SWTORFractions.Republic,
  baseClass: "Scoundrel",
  icon: ("REPUBLIC/Scoundrel/Ruffian/!!!SpecIcon.jpg"),
  abilities: []
};
