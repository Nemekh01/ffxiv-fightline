import { IJob, Role, AbilityType } from "../Models"
import { settings, getAbilitiesFrom, rangeSharedAbilities, abilitySortFn, medicine } from "./shared"

export const DNC: IJob = {
  name: "DNC",
  role: Role.Range,
  icon: ("JobIcons/Dancer"),
  abilities: [
    {
      name: "Shield Samba",
      duration: 15,
      cooldown: 180,
      xivDbId: "16012",
      icon: ("Dancer/icon_14"),
      abilityType: AbilityType.PartyDefense,
    },
    {
      name: "Improvisation",
      duration: 15,
      cooldown: 120,
      xivDbId: "16014",
      icon: ("Dancer/icon_21"),
      abilityType: AbilityType.Utility,
    },
    {
      name: "Flourish",
      duration: 0,
      cooldown: 60,
      xivDbId: "16013",
      icon: ("Dancer/icon_19"),
      abilityType: AbilityType.Utility,
    },
    {
      name: "Devilment",
      duration: 20,
      cooldown: 120,
      xivDbId: "16011",
      icon: ("Dancer/icon_16"),
      abilityType: AbilityType.SelfDamageBuff,
    },
    {
      name: "Closed Position",
      duration: 0,
      cooldown: 30,
      xivDbId: "16006",
      icon: ("Dancer/icon_15"),
      abilityType: AbilityType.Utility,
      settings: [settings.target]
    },
    {
      name: "Curing Waltz",
      duration: 0,
      cooldown: 60,
      xivDbId: "16015",
      icon: ("Dancer/icon_13"),
      abilityType: AbilityType.Healing,
    },
    ...getAbilitiesFrom(rangeSharedAbilities),
    medicine["Dexterity"]
  ].sort(abilitySortFn),
};


