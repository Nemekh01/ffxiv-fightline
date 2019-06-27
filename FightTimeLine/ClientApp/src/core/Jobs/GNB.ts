import { IJob, Role, AbilityType } from "../Models"
import { settings, getAbilitiesFrom, tankSharedAbilities, abilitySortFn, medicine } from "./shared"

export const GNB: IJob = {
  name: "GNB",
  role: Role.Tank,
  icon: ("JobIcons/Gunbreaker"),
  abilities: [
    {
      name: "No Mercy",
      duration: 20,
      cooldown: 60,
      xivDbId: "",
      icon: ("Gunbreaker/icon_02"),
      abilityType: AbilityType.SelfDamageBuff,
    },
    {
      name: "Camouflage",
      duration: 20,
      cooldown: 90,
      xivDbId: "",
      icon: ("Gunbreaker/icon_04"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Danger Zone",
      duration: 0,
      cooldown: 30,
      xivDbId: "",
      icon: ("Gunbreaker/icon_08"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Nebula",
      duration: 0,
      cooldown: 120,
      xivDbId: "",
      icon: ("Gunbreaker/icon_11"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Aurora",
      duration: 18,
      cooldown: 60,
      xivDbId: "",
      icon: ("Gunbreaker/icon_13"),
      abilityType: AbilityType.Healing,
      setting: [settings.target]
    },
    {
      name: "Superbolide",
      duration: 8,
      cooldown: 420,
      xivDbId: "",
      icon: ("Gunbreaker/icon_14"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Rough Divide",
      duration: 0,
      cooldown: 30,
      xivDbId: "",
      icon: ("Gunbreaker/icon_16"),
      abilityType: AbilityType.Damage,
      charges: {
        count: 2,
        cooldown: 30
      }
    },
    {
      name: "Bow Shock",
      duration: 15,
      cooldown: 60,
      xivDbId: "",
      icon: ("Gunbreaker/icon_20"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Heart of Light",
      duration: 15,
      cooldown: 90,
      xivDbId: "",
      icon: ("Gunbreaker/icon_21"),
      abilityType: AbilityType.PartyDefense,
    },
    {
      name: "Heart of Stone",
      duration: 7,
      cooldown: 25,
      xivDbId: "",
      icon: ("Gunbreaker/icon_22"),
      abilityType: AbilityType.PartyDefense,
      setting: [settings.target]
    },
    {
      name: "Bloodfest",
      duration: 0,
      cooldown: 90,
      xivDbId: "",
      icon: ("Gunbreaker/icon_25"),
      abilityType: AbilityType.Utility,
    },
    {
      name: "Blasting Zone",
      duration: 0,
      cooldown: 30,
      xivDbId: "",
      icon: ("Gunbreaker/icon_26"),
      abilityType: AbilityType.Damage,
    },
    ...getAbilitiesFrom(tankSharedAbilities),
    medicine["Strength"]
  ].sort(abilitySortFn),
};


