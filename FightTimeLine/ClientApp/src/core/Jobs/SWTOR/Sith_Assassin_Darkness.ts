import { IJob, DamageType, IAbility, IAbilitySetting, Role, AbilityType, IStance, byName, byBuffApply, byBuffRemove } from "../../Models"
import { settings, IAbilities, abilitySortFn, getAbilitiesFrom, tankSharedAbilities, medicine } from "../FFXIV/shared"
import * as Fractions from "./fractions";

export const Sith_Assassin_Darkness: IJob = {
  name: "Darkness",
  role: Role.Tank,
  baseClass: "Sith Assassin",
  fraction:Fractions.SWTORFractions.Empire,
  icon: ("EMPIRE/SITH ASSASSIN/Darkness/!!!SpecIcon.jpg"),
  abilities: [
    {
      name: "Force Shroud",
      duration: 5,
      cooldown: 53,
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
      requiresBossTarget: true,
      icon: ("11_SinTank/force_cloak"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Deflection",
      duration: 15,
      cooldown: 110,
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
      duration: 30,
      cooldown: 90,
      icon: ("10_TankRole/05medpac.jpg"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Shield Adrenal",
      duration: 15,
      cooldown: 180,
      icon: ("10_TankRole/06shield_adrenal.jpg"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Recklesness",
      duration: 12,
      cooldown: 120,
      icon: ("11_SinTank/recklessness"),
      abilityType: AbilityType.SelfDamageBuff,
      settings: [settings.target],
    },
    {
      name: "Stun Breaker",
      duration: 1,
      cooldown: 90,
      icon: ("11_SinTank/09_stun_breaker"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Jolt",
      duration: 1,
      cooldown: 16,
      requiresBossTarget: true,
      icon: ("11_SinTank/jolt"),
      abilityType: AbilityType.PartyDefense,
      settings: [settings.target],
    },
    {
      name: "Mas Taunt",
      duration: 1,
      cooldown: 40,
      icon: "11_SinTank/11mass_taunt",
      abilityType: AbilityType.Utility | AbilityType.Enmity,
    }
  ].sort(abilitySortFn),
  stances: []
};
