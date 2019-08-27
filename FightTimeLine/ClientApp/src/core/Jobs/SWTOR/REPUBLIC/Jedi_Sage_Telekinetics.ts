import { IJob, DamageType, IAbility, IAbilitySetting, Role, AbilityType, IStance, byName, byBuffApply, byBuffRemove } from "../../../Models"
import { settings, IAbilities, abilitySortFn, getAbilitiesFrom, tankSharedAbilities, medicine } from "../../FFXIV/shared"
import * as Fractions from "../fractions";

export const Jedi_Sage_Telekinetics: IJob = {
  name: "Telekinetics",
  role: Role.Melee,
  fraction: Fractions.SWTORFractions.Republic,
  baseClass: "Jedi Sage",
  icon: ("REPUBLIC/Jedi Sage/Telekinetics/!!!SpecIcon.jpg"),
  abilities: []
};
