import { IJob, DamageType, IAbility, IAbilitySetting, Role, AbilityType, IStance, byName, byBuffApply, byBuffRemove } from "../../../Models"
import { settings, IAbilities, abilitySortFn, getAbilitiesFrom, tankSharedAbilities, medicine } from "../../FFXIV/shared"
import * as Fractions from "../fractions";

export const Powertech_ShieldTech: IJob = {
  name: "Shield Tech",
  role: Role.Tank,
  fraction: Fractions.SWTORFractions.Empire,
  baseClass: "Powertech",
  icon: ("EMPIRE/Powertech/Shield Tech/!!!SpecIcon.jpg"),
  abilities: [
    {
      name: "Energy Shield",
      duration: 15,
      cooldown: 110,
      icon: ("EMPIRE/Powertech/energy shield"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Oil Slick",
      duration: 10,
      cooldown: 60,
      icon: ("EMPIRE/Powertech/Shield Tech/oil slick"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Explosive Fuel",
      duration: 15,
      cooldown: 120,
      icon: ("EMPIRE/Powertech/Shield Tech/explosive_fuel"),
      abilityType: AbilityType.SelfDamageBuff
    },
    {
      name: "Shoulder Cannon",
      duration: 15,
      cooldown: 90,
      icon: ("EMPIRE/Powertech/Shield Tech/shoulder_cannon"),
      abilityType: AbilityType.SelfDamageBuff
    },
    {
      name: "Sonic Missile",
      duration: 6,
      cooldown: 45,
      icon: ("EMPIRE/Powertech/Shield Tech/sonicmissle"),
      abilityType: AbilityType.PartyDamageBuff
    },
    {
      name: "Kolto Overload",
      duration: 60,
      cooldown: 180,
      icon: ("EMPIRE/Powertech/kolto overload"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Hydraulic Overrides",
      duration: 2,
      cooldown: 35,
      icon: ("EMPIRE/Powertech/hydraulic overrides"),
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
      name: "Shield Adrenal",
      duration: 15,
      cooldown: 180,
      icon: ("CrossRole/06shield_adrenal"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Carbonize",
      duration: 3,
      cooldown: 45,
      icon: ("EMPIRE/Powertech/Shield Tech/carbonize"),
      abilityType: AbilityType.Utility,
    },
    {
      name: "Determination",
      duration: 4,
      cooldown: 120,
      icon: ("EMPIRE/Powertech/determination"),
      abilityType: AbilityType.Utility,
    },
    {
      name: "Quell",
      duration: 4,
      cooldown: 12,
      requiresBossTarget: true,
      icon: ("EMPIRE/Powertech/Shield Tech/quell"),
      abilityType: AbilityType.Utility
    }
  ]
};




