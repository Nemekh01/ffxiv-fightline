import { IJob,  Role, AbilityType,  byName } from "../Models"
import { abilitySortFn, getAbilitiesFrom, tankSharedAbilities, medicine } from "./shared"

export const WAR: IJob = {
  name: "WAR",
  role: Role.Tank,
  icon: ("JobIcons/Warrior_Icon_10"),
  abilities: [
    {
      name: "Unchained",
      duration: 20,
      cooldown: 90,
      xivDbId: "50",
      icon: ("12_Warrior/0050_Unchained"),
      abilityType: AbilityType.SelfDamageBuff,
    },
    {
      name: "Infuriate",
      duration: 0,
      cooldown: 60,
      xivDbId: "52",
      requiresBossTarget: true,
      icon: ("12_Warrior/0052_Infuriate"),
      abilityType: AbilityType.Utility,
    },
    {
      name: "Inner Release",
      duration: 10,
      cooldown: 90,
      requiresBossTarget: true,
      xivDbId: "7389",
      icon: ("12_Warrior/7389_Inner Release"),
      abilityType: AbilityType.SelfDamageBuff,
    },
    {
      name: "Onslaught",
      duration: 0,
      cooldown: 15,
      xivDbId: "7386",
      requiresBossTarget: true,
      icon: ("12_Warrior/7386_Onslaught"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Upheaval",
      duration: 0,
      cooldown: 30,
      xivDbId: "7387",
      requiresBossTarget: true,
      icon: ("12_Warrior/7387_Upheaval"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Vengeance",
      duration: 15,
      cooldown: 120,
      xivDbId: "44",
      icon: ("12_Warrior/0044_Vengeance"),
      relatedAbilities: { affectedBy: ["Shake It Off"], parentOnly: true },
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Holmgang",
      duration: 6,
      cooldown: 180,
      xivDbId: "43",
      requiresBossTarget: true,
      icon: ("12_Warrior/0043_Holmgang"),
      isUltimateSave: true,
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Shake It Off",
      duration: 15,
      cooldown: 90,
      xivDbId: "7388",
      icon: ("12_Warrior/7388_Shake It Off"),
      abilityType: AbilityType.PartyDefense,
      relatedAbilities:
      {
        affects: ["Thrill of Battle", "Vengence", "Raw Intuition"],
        parentOnly: true
      }
    },
    {
      name: "Thrill of Battle",
      duration: 20,
      cooldown: 120,
      xivDbId: "40",
      icon: ("12_Warrior/0040_Thrill Of Battle"),
      abilityType: AbilityType.SelfDefense,
      detectStrategy: byName("Thrill of Battle"),
      relatedAbilities: { affectedBy: ["Shake It Off"], parentOnly: true }
    },
    {
      name: "Raw Intuition",
      duration: 20,
      cooldown: 90,
      xivDbId: "3551",
      icon: ("12_Warrior/3551_Raw Intuition"),
      abilityType: AbilityType.SelfDefense,
      relatedAbilities: { affectedBy: ["Shake It Off"], parentOnly: true }
    },
    {
      name: "Equilibrium",
      duration: 0,
      cooldown: 60,
      xivDbId: "3552",
      icon: ("12_Warrior/3552_Equilibrium"),
      abilityType: AbilityType.Utility,
    },
    ...getAbilitiesFrom(tankSharedAbilities),
    medicine["Strength"]
  ].sort(abilitySortFn),
  stances: [
    {
      ability: {
        name: "Defiance",
        duration: 0,
        cooldown: 10,
        icon: ("12_Warrior/0048_Defiance"),
        abilityType: AbilityType.Utility,
        xivDbId: "48",
      },
    },
    {
      ability: {
        name: "Deliverance",
        duration: 0,
        cooldown: 10,
        icon: ("12_Warrior/3548_Deliverance"),
        abilityType: AbilityType.Utility,
        xivDbId: "3548",
      },
    }
  ]
};
