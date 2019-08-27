import { IJob, DamageType, IAbility, IAbilitySetting, Role, AbilityType, IStance, byName, byBuffApply, byBuffRemove } from "../../../Models"
import { settings, IAbilities, abilitySortFn, getAbilitiesFrom, tankSharedAbilities, medicine } from "../../FFXIV/shared"
import * as Fractions from "../fractions";

export const Scoundrel_Sawbones: IJob = {
  name: "Sawbones",
  role: Role.Healer,
  fraction: Fractions.SWTORFractions.Republic,
  baseClass: "Scoundrel",
  icon: ("REPUBLIC/Scoundrel/Sawbones/!!!SpecIcon.jpg"),
  abilities: []
};
