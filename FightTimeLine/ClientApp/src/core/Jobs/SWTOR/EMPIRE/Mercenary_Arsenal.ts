import { IJob, DamageType, IAbility, IAbilitySetting, Role, AbilityType, IStance, byName, byBuffApply, byBuffRemove } from "../../../Models"
import { settings, IAbilities, abilitySortFn, getAbilitiesFrom, tankSharedAbilities, medicine } from "../../FFXIV/shared"
import * as Fractions from "../fractions";

export const Mercenary_Arsenal: IJob = {
  name: "Arsenal",
  role: Role.Range,
  baseClass: "Mercenary",
  fraction: Fractions.SWTORFractions.Empire,
  icon: ("EMPIRE/Mercenary/Arsenal/!!!SpecIcon"),
  abilities: [
    {
      name: "Supercharged Celerity",
      duration: 10,
      cooldown: 300,
      icon: ("EMPIRE/Mercenary/Supercharged Celerity"),
      abilityType: AbilityType.PartyDamageBuff,
    },
    {
      name: "Energy Shield",
      duration: 12,
      cooldown: 120,
      icon: ("EMPIRE/Mercenary/energy shield"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Responsive Safeguards",
      duration: 12,
      cooldown: 120,
      icon: ("EMPIRE/Mercenary/Bodyguard/combat support cylinder"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Electro Net",
      duration: 9,
      cooldown: 80,
      icon: ("EMPIRE/Mercenary/electro net"),
      requiresBossTarget: true,
      abilityType: AbilityType.SelfDamageBuff
    },
    {
      name: "Kolto Overload",
      duration: 60,
      cooldown: 144,
      icon: ("EMPIRE/Mercenary/kolto overload"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Hydraulic Overrides",
      duration: 2,
      cooldown: 35,
      icon: ("EMPIRE/Mercenary/hydraulic overrides"),
      abilityType: AbilityType.Utility,
    },
    {
      name: "Medpac",
      duration: 30,
      cooldown: 90,
      icon: ("CrossRole/05medpac"),
      abilityType: AbilityType.Healing,
    },
    {
      name: "Adrenal",
      duration: 15,
      cooldown: 180,
      icon: ("CrossRole/07_dps_adrenal.png"),
      abilityType: AbilityType.SelfDamageBuff
    },
    {
      name: "Concussion Missile",
      duration: 60,
      cooldown: 52,
      icon: ("EMPIRE/Mercenary/Concussion Missile"),
      abilityType: AbilityType.Utility,
    },
    {
      name: "Determination",
      duration: 4,
      cooldown: 120,
      icon: ("EMPIRE/Mercenary/determination"),
      abilityType: AbilityType.Utility,
    },
    {
      name: "Disabling Shot",
      duration: 4,
      cooldown: 24,
      requiresBossTarget: true,
      icon: ("EMPIRE/Mercenary/quell"),
      abilityType: AbilityType.Utility,
    },
    {
      name: "Chaff Flare",
      duration: 10,
      cooldown: 45,
      icon: ("EMPIRE/Mercenary/chaff flare"),
      abilityType: AbilityType.Utility,
    }
  ]
};
