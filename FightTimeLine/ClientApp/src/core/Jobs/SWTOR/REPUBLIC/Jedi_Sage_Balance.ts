import { IJob, DamageType, IAbility, IAbilitySetting, Role, AbilityType, IStance, byName, byBuffApply, byBuffRemove } from "../../../Models"
import { settings, IAbilities, abilitySortFn, getAbilitiesFrom, tankSharedAbilities, medicine } from "../../FFXIV/shared"
import * as Fractions from "../fractions";

export const Jedi_Sage_Balance: IJob = {
  name: "Balance",
  role: Role.Melee,
  fraction: Fractions.SWTORFractions.Republic,
  baseClass: "Jedi Sage",
  icon: ("REPUBLIC/Jedi Sage/Balance/!!!SpecIcon.jpg"),
  abilities: []
};
