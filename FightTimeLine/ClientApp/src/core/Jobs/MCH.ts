import { IJob, DamageType, IAbility, IAbilitySetting, Role, AbilityType, IStance, byName, byBuffApply, byBuffRemove } from "../Models"
import { settings, IAbilities, abilitySortFn, getAbilitiesFrom, rangeSharedAbilities, medicine } from "./shared"

export const MCH: IJob = {
  name: "MCH",
  role: Role.Range,
  icon: ("JobIcons/Machinist_Icon_10"),
  abilities: [
    {
      name: "Reassemble",
      duration: 5,
      cooldown: 60,
      xivDbId: "2876",
      icon: ("42_Machinist/2876_Reassemble"),
      abilityType: AbilityType.SelfDamageBuff,
    },
    {
      name: "Gauss Round",
      duration: 0,
      cooldown: 30,
      xivDbId: "2874",
      requiresBossTarget: true,
      icon: ("42_Machinist/2874_Gauss Round"),
      abilityType: AbilityType.Damage,
      charges: {
        count: 3,
        cooldown: 30
      }
    },
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
      name: "Hot Shot",
      duration: 0,
      cooldown: 40,
      xivDbId: "2872",
      requiresBossTarget: true,
      icon: ("42_Machinist/2872_Hot Shot"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Ricochet",
      duration: 0,
      cooldown: 30,
      xivDbId: "2890",
      requiresBossTarget: true,
      icon: ("42_Machinist/2890_Ricochet"),
      abilityType: AbilityType.Damage,
      charges: {
        count: 3,
        cooldown: 30
      }
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
      name: "Hypercharge",
      duration: 8,
      cooldown: 10,
      xivDbId: "2885",
      icon: ("42_Machinist/icon_08"),
      abilityType: AbilityType.SelfDamageBuff,
    },
    {
      name: "Tactician",
      duration: 15,
      cooldown: 120,
      xivDbId: "2887",
      icon: ("42_Machinist/icon_16"),
      abilityType: AbilityType.PartyDefense,
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


