import { IJob, DamageType, IAbility, IAbilitySetting, Role, AbilityType, IStance, byName, byBuffApply, byBuffRemove } from "../Models"
import { settings, IAbilities, getAbilitiesFrom, meleeSharedAbilities, medicine } from "./shared"

export const NIN: IJob = {
  name: "NIN",
  role: Role.Melee,
  icon: ("JobIcons/Ninja_Icon_10"),
  abilities: [
    {
      name: "Trick Attack",
      duration: 10,
      cooldown: 60,
      xivDbId: "2258",
      requiresBossTarget: true,
      icon: ("33_Ninja/2258_Trick Attack"),
      abilityType: AbilityType.PartyDamageBuff,
    },
    {
      name: "Ten Chi Jin",
      duration: 10,
      cooldown: 100,
      xivDbId: "7403",
      requiresBossTarget: true,
      icon: ("33_Ninja/7403_Ten Chi Jin"),
      abilityType: AbilityType.SelfDamageBuff,
    },
    {
      name: "Duality",
      duration: 10,
      cooldown: 90,
      xivDbId: "3567",
      icon: ("33_Ninja/3567_Duality"),
      abilityType: AbilityType.SelfDamageBuff,
    },
    {
      name: "Mug",
      duration: 0,
      cooldown: 90,
      xivDbId: "2248",
      requiresBossTarget: true,
      icon: ("33_Ninja/8813_Mug"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Jugulate",
      duration: 0,
      cooldown: 30,
      xivDbId: "2256",
      requiresBossTarget: true,
      icon: ("33_Ninja/2256_Jugulate"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Dream Within a Dream",
      duration: 0,
      cooldown: 60,
      xivDbId: "3566",
      requiresBossTarget: true,
      icon: ("33_Ninja/3566_Dream Within A Dream"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Bhavacakra",
      duration: 0,
      cooldown: 50,
      xivDbId: "7402",
      requiresBossTarget: true,
      icon: ("33_Ninja/8815_Bhavacakra"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Shadewalker",
      duration: 15,
      cooldown: 120,
      xivDbId: "3564",
      icon: ("33_Ninja/3564_Shadewalker"),
      abilityType: AbilityType.Utility,
      settings: [settings.target],
      detectStrategy: byBuffRemove(1000788, "Shadewalker", 15 * 1000)
    },
    {
      name: "Smoke Screen",
      duration: 20,
      cooldown: 180,
      xivDbId: "3565",
      icon: ("33_Ninja/3565_Smoke Screen"),
      abilityType: AbilityType.Utility,
      settings: [settings.target],
    },
    ...getAbilitiesFrom(meleeSharedAbilities),
    medicine["Dexterity"]
  ]
};


