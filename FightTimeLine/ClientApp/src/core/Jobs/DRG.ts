import { IJob, DamageType, IAbility, IAbilitySetting, Role, AbilityType, IStance, byName, byBuffApply, byBuffRemove } from "../Models"
import { settings, IAbilities, abilitySortFn, getAbilitiesFrom, medicine, meleeSharedAbilities } from "./shared"

export const DRG: IJob = {
  name: "DRG",
  role: Role.Healer,
  icon: ("JobIcons/Dragoon_Icon_10"),
  abilities: [
    {
      name: "Blood for Blood",
      duration: 20,
      cooldown: 80,
      xivDbId: "85",
      icon: ("32_Dragoon/0085_Blood For Blood"),
      abilityType: AbilityType.SelfDamageBuff,
    },
    {
      name: "Life Surge",
      duration: 10,
      cooldown: 50,
      xivDbId: "83",
      icon: ("32_Dragoon/0083_Life Surge"),
      abilityType: AbilityType.SelfDamageBuff,
    },
    {
      name: "Dragon Sight",
      detectByBuff: "1001454",
      duration: 20,
      cooldown: 120,
      xivDbId: "10032",
      icon: ("32_Dragoon/10032_Dragon Sight"),
      abilityType: AbilityType.PartyDamageBuff | AbilityType.SelfDamageBuff,
      settings: [settings.target],
      detectStrategy: byBuffApply(1001454, "Dragon Sight")
    },
    {
      name: "Battle Litany",
      duration: 20,
      cooldown: 180,
      xivDbId: "3557",
      icon: ("32_Dragoon/3557_Battle Litany"),
      abilityType: AbilityType.PartyDamageBuff,
    },
    {
      name: "Dragonfire Dive",
      duration: 0,
      cooldown: 120,
      xivDbId: "96",
      requiresBossTarget: true,
      icon: ("32_Dragoon/0096_Dragonfire Dive"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Geirskogul",
      duration: 0,
      cooldown: 30,
      xivDbId: "3555",
      requiresBossTarget: true,
      icon: ("32_Dragoon/3555_Geirskogul"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Jump",
      duration: 0,
      cooldown: 30,
      xivDbId: "0092",
      requiresBossTarget: true,
      icon: ("32_Dragoon/0092_Jump"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Spineshatter Dive",
      duration: 0,
      cooldown: 30,
      xivDbId: "8802",
      requiresBossTarget: true,
      icon: ("32_Dragoon/8802_Spineshatter Dive"),
      abilityType: AbilityType.Damage,
    },
    ...getAbilitiesFrom(meleeSharedAbilities),
    medicine["Strength"]
  ].sort(abilitySortFn)
};


