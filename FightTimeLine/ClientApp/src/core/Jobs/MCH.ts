import { IJob, DamageType, IAbility, IAbilitySetting, Role, AbilityType, IStance, byName, byBuffApply, byBuffRemove } from "../Models"
import { settings, IAbilities, abilitySortFn, getAbilitiesFrom, rangeSharedAbilities, medicine } from "./shared"

export const MCH: IJob = {
  name: "MCH",
  role: Role.Range,
  icon: ("JobIcons/Machinist_Icon_10"),
  abilities: [
    {
      name: "Wildfire",
      duration: 10,
      cooldown: 60,
      xivDbId: "2878",
      requiresBossTarget: true,
      icon: ("42_Machinist/2878_Wildfire"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Gauss Round",
      duration: 0,
      cooldown: 15,
      xivDbId: "2874",
      requiresBossTarget: true,
      icon: ("42_Machinist/2874_Gauss Round"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Ricochet",
      duration: 0,
      cooldown: 60,
      xivDbId: "2890",
      requiresBossTarget: true,
      icon: ("42_Machinist/2890_Ricochet"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Rook Overdrive",
      duration: 0,
      cooldown: 120,
      xivDbId: "7415",
      icon: ("42_Machinist/7415_Rook Overdrive"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Flamethrower",
      duration: 10,
      cooldown: 60,
      xivDbId: "7418",
      icon: ("42_Machinist/7418_Flamethrower"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Reassemble",
      duration: 20,
      cooldown: 60,
      xivDbId: "2876",
      icon: ("42_Machinist/2876_Reassemble"),
      abilityType: AbilityType.SelfDamageBuff,
    },
    {
      name: "Hypercharge",
      duration: 28,
      cooldown: 120,
      xivDbId: "2885",
      icon: ("42_Machinist/2885_Hypercharge"),
      abilityType: AbilityType.PartyDamageBuff,
    },
    {
      name: "Dismantle",
      duration: 5,
      cooldown: 60,
      xivDbId: "2887",
      requiresBossTarget: true,
      icon: ("42_Machinist/2887_Dismantle"),
      abilityType: AbilityType.PartyDefense,
    },
    {
      name: "Reload",
      duration: 0,
      cooldown: 30,
      xivDbId: "2867",
      icon: ("42_Machinist/2867_Reload"),
      abilityType: AbilityType.Utility,
    },
    {
      name: "Quick Reload",
      duration: 0,
      cooldown: 15,
      xivDbId: "2879",
      icon: ("42_Machinist/2879_Quick Reload"),
      abilityType: AbilityType.Utility,
    },
    {
      name: "Barrel Stabilizer",
      duration: 0,
      cooldown: 60,
      xivDbId: "7414",
      requiresBossTarget: true,
      icon: ("42_Machinist/7414_Barrel Stabilizer"),
      abilityType: AbilityType.Utility,
    },
    ...getAbilitiesFrom(rangeSharedAbilities),
    medicine["Dexterity"]
  ]
};


