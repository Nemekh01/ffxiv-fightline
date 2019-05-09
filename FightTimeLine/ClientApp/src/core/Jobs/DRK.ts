import { IJob, DamageType, Role, AbilityType } from "../Models"
import { settings, abilitySortFn, getAbilitiesFrom, tankSharedAbilities, medicine } from "./shared"

export const DRK: IJob = {
  name: "DRK",
  role: Role.Tank,
  icon: ("JobIcons/Dark_Knight_Icon_10"),
  abilities: [
    {
      name: "Blood Weapon",
      duration: 15,
      cooldown: 40,
      xivDbId: "3625",
      icon: ("13_DarkKnight/3625_Blood Weapon"),
      abilityType: AbilityType.SelfDamageBuff,
    },
    {
      name: "Dark Passenger",
      duration: 0,
      cooldown: 60,
      xivDbId: "3633",
      requiresBossTarget: true,
      icon: ("13_DarkKnight/3633_Dark Passenger"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Salted Earth",
      duration: 21,
      cooldown: 45,
      xivDbId: "3639",
      requiresBossTarget: true,
      icon: ("13_DarkKnight/3639_Salted Earth"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Plunge",
      duration: 0,
      cooldown: 30,
      xivDbId: "3640",
      requiresBossTarget: true,
      icon: ("13_DarkKnight/3640_Plunge"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Carve and Spit",
      duration: 0,
      cooldown: 60,
      xivDbId: "3643",
      requiresBossTarget: true,
      icon: ("13_DarkKnight/3643_Carve And Spit"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Shadow Wall",
      duration: 10,
      cooldown: 120,
      xivDbId: "3636",
      icon: ("13_DarkKnight/3636_Shadow Wall"),
      damageAffected: DamageType.All,
      goodForTankBusters: true,
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Dark Mind",
      duration: 10,
      cooldown: 60,
      xivDbId: "3634",
      icon: ("13_DarkKnight/3634_Dark Mind"),
      damageAffected: DamageType.Magical,
      goodForTankBusters: true,
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Living Dead",
      duration: 10,
      cooldown: 300,
      xivDbId: "3638",
      icon: ("13_DarkKnight/3638_Living Dead"),
      damageAffected: DamageType.All,
      extendDurationOnNextAbility: 10,
      isUltimateSave: true,
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "The Blackest Night",
      duration: 7,
      cooldown: 15,
      xivDbId: "7393",
      icon: ("13_DarkKnight/7393_The Blackest Night"),
      damageAffected: DamageType.All,
      goodForTankBusters: false,
      abilityType: AbilityType.SelfDefense,
      settings: [settings.target],
    },
    {
      name: "Delirium",
      duration: 0,
      cooldown: 80,
      xivDbId: "7390",
      requiresBossTarget: true,
      icon: ("13_DarkKnight/7390_Delirium"),
      abilityType: AbilityType.Utility,
    },
    {
      name: "Sole Survivor",
      duration: 15,
      cooldown: 120,
      xivDbId: "8778",
      requiresBossTarget: true,
      icon: ("13_DarkKnight/8778_Sole Survivor"),
      abilityType: AbilityType.Utility
    },
    ...getAbilitiesFrom(tankSharedAbilities),
    medicine["Strength"]
  ].sort(abilitySortFn),
  stances: [
    {
      ability: {
        name: "Grit",
        duration: 0,
        cooldown: 10,
        icon: ("13_DarkKnight/3629_Grit"),
        abilityType: AbilityType.Utility,
        xivDbId: "3629",
      },
    }
  ]
};


