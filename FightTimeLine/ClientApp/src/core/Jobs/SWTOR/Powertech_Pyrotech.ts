

import { IJob, DamageType, IAbility, IAbilitySetting, Role, AbilityType, IStance, byName, byBuffApply, byBuffRemove } from "../../Models"
import { settings, IAbilities, getAbilitiesFrom, meleeSharedAbilities, medicine, abilitySortFn } from "../FFXIV/shared"
import * as Fractions from "./fractions";

export const Powertech_Pyrotech: IJob = {
  name: "Pyrotech",
  role: Role.Melee,
  fraction: Fractions.SWTORFractions.Empire,
  baseClass: "Powertech",
  icon: ("EMPIRE/Powertech/Pyrotech/!!!SpecIcon.jpg"),
  abilities: [
    {
      name: "Force Shroud",
      duration: 3,
      cooldown: 60,
      icon: ("11_SinTank/force_shroud"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Force Speed",
      duration: 2,
      cooldown: 15,
      icon: ("11_SinTank/force_speed"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Force Cloak",
      duration: 3,
      cooldown: 75,
      icon: ("11_SinTank/force_cloak"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Deflection",
      duration: 12,
      cooldown: 120,
      icon: ("11_SinTank/deflection"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Overcharge Saber",
      duration: 15,
      cooldown: 120,
      icon: ("11_SinTank/overcharge"),
      abilityType: AbilityType.SelfDefense,

    },
    {
      name: "Medpac",
      duration: 15,
      cooldown: 90,
      icon: ("CrossRole/05medpac.jpg"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "DPS Adrenal",
      duration: 15,
      cooldown: 180,
      icon: ("CrossRole/07_dps_adrenal"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Recklesness",
      duration: 20,
      cooldown: 90,
      icon: ("11_SinTank/recklessness"),
      abilityType: AbilityType.SelfDamageBuff,
      settings: [settings.target],
    },
    {
      name: "Stun Breaker",
      duration: 3,
      cooldown: 90,
      icon: ("11_SinTank/09_stun_breaker"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Jolt",
      duration: 4,
      cooldown: 16,
      requiresBossTarget: true,
      icon: ("11_SinTank/jolt"),
      abilityType: AbilityType.PartyDefense,
      settings: [settings.target],
    },
    {
      name: "Mas Taunt",
      duration: 6,
      cooldown: 45,
      icon: "11_SinTank/11mass_taunt",
      abilityType: AbilityType.Utility,
    }
  ].sort(abilitySortFn)
};




