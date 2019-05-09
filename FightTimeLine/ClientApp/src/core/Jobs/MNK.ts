import { IJob, DamageType, IAbility, IAbilitySetting, Role, AbilityType, IStance, byName, byBuffApply, byBuffRemove } from "../Models"
import { settings, IAbilities, abilitySortFn, getAbilitiesFrom, medicine, meleeSharedAbilities } from "./shared"

export const MNK: IJob = {
  name: "MNK",
  role: Role.Melee,
  icon: ("JobIcons/Monk_Icon_10"),
  abilities: [
    {
      name: "Elixir Field",
      duration: 0,
      cooldown: 30,
      xivDbId: "3545",
      icon: ("31_Monk/3545_Elixir Field"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Howling Fist",
      duration: 0,
      cooldown: 60,
      xivDbId: "67",
      requiresBossTarget: true,
      icon: ("31_Monk/0067_Howling Fist"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Steel Peak",
      duration: 0,
      cooldown: 40,
      xivDbId: "64",
      requiresBossTarget: true,
      icon: ("31_Monk/0064_Steel Peak"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Internal Release",
      duration: 15,
      cooldown: 60,
      xivDbId: "59",
      icon: ("31_Monk/0059_Internal Release"),
      abilityType: AbilityType.SelfDamageBuff,
    },
    {
      name: "Perfect Balance",
      duration: 10,
      cooldown: 60,
      xivDbId: "69",
      icon: ("31_Monk/0069_Perfect Balance"),
      abilityType: AbilityType.SelfDamageBuff,
    },
    {
      name: "Brotherhood",
      duration: 15,
      cooldown: 90,
      xivDbId: "7396",
      icon: ("31_Monk/7396_Brotherhood"),
      abilityType: AbilityType.PartyDamageBuff,
    },
    {
      name: "Mantra",
      duration: 15,
      cooldown: 90,
      xivDbId: "65",
      icon: ("31_Monk/0065_Mantra"),
      abilityType: AbilityType.HealingBuff,
    },
    ...getAbilitiesFrom(meleeSharedAbilities),
    medicine["Strength"]
  ]
};


