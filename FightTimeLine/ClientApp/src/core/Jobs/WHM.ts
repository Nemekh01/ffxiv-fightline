import { IJob, DamageType, IAbility, IAbilitySetting, Role, AbilityType, IStance, byName, byBuffApply, byBuffRemove } from "../Models"
import { settings, IAbilities, abilitySortFn, getAbilitiesFrom, healerSharedAbilities, medicine } from "./shared"

export const WHM: IJob = {
  name: "WHM",
  role: Role.Healer,
  icon: ("JobIcons/White_Mage_Icon_10"),
  abilities: [
    {
      name: "Assize",
      duration: 0,
      cooldown: 45,
      xivDbId: "3571",
      icon: ("21_WhiteMage/9620_Assize"),
      abilityType: AbilityType.Healing,
    },
    {
      name: "Tetragrammaton",
      duration: 0,
      cooldown: 60,
      xivDbId: "3570",
      icon: ("21_WhiteMage/3570_Tetragrammaton"),
      abilityType: AbilityType.Healing,
      settings: [settings.target],
    },
    {
      name: "Divine Benison",
      duration: 0,
      cooldown: 30,
      xivDbId: "9621",
      icon: ("21_WhiteMage/9621_Divine Benison"),
      abilityType: AbilityType.Healing,
      settings: [settings.target],
    },
    {
      name: "Benediction",
      duration: 0,
      cooldown: 180,
      xivDbId: "140",
      icon: ("21_WhiteMage/0140_Benediction"),
      abilityType: AbilityType.Healing,
      settings: [settings.target],
    },
    {
      name: "Asylum",
      duration: 24,
      cooldown: 90,
      xivDbId: "3569",
      icon: ("21_WhiteMage/3569_Asylum"),
      abilityType: AbilityType.Healing,
    },
    {
      name: "Thin Air",
      duration: 12,
      cooldown: 120,
      xivDbId: "7430",
      icon: ("21_WhiteMage/7430_Thin Air"),
      abilityType: AbilityType.Utility,
    },
    {
      name: "Presence of Mind",
      duration: 15,
      cooldown: 150,
      xivDbId: "136",
      icon: ("21_WhiteMage/0136_Presence Of Mind"),
      abilityType: AbilityType.Utility,
    },
    ...getAbilitiesFrom(healerSharedAbilities),
    medicine["Mind"]
  ].sort(abilitySortFn)
};


