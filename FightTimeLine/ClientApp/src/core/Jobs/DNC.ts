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
      cooldown: 120,
      xivDbId: "",
      icon: ("Dancer/icon_14"),
      abilityType: AbilityType.PartyDefense,
    },
    {
      name: "Saber Dance",
      duration: 15,
      cooldown: 120,
      xivDbId: "",
      icon: ("Dancer/icon_16"),
      abilityType: AbilityType.SelfDamageBuff,
    },
    {
      name: "Improvisation",
      duration: 15,
      cooldown: 180,
      xivDbId: "",
      icon: ("Dancer/icon_21"),
      abilityType: AbilityType.Utility,
    },
    {
      name: "Flourish",
      duration: 0,
      cooldown: 60,
      xivDbId: "",
      icon: ("Dancer/icon_19"),
      abilityType: AbilityType.Utility,
    },
    {
      name: "Closed Position",
      duration: 0,
      cooldown: 30,
      xivDbId: "",
      icon: ("Dancer/icon_15"),
      abilityType: AbilityType.Utility,
      settings: [settings.target]
    },
    {
      name: "Curing Waltz",
      duration: 0,
      cooldown: 60,
      xivDbId: "",
      icon: ("Dancer/icon_13"),
      abilityType: AbilityType.Healing,
    },
    ...getAbilitiesFrom(rangeSharedAbilities),
    medicine["Dexterity"]
  ].sort(abilitySortFn),
};


