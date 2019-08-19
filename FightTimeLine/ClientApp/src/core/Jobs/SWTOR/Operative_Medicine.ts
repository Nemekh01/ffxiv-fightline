import { IJob, Role, AbilityType } from "../../Models"
import { settings } from "../FFXIV/shared"
import * as Fractions from "./fractions";

export const Operative_Medicine: IJob = {
  name: "Medicine",
  role: Role.Healer,
  baseClass: "Operative",
  fraction: Fractions.SWTORFractions.Empire,
  icon: ("EMPIRE/Operative/Medicine/!!!SpecIcon"),
  abilities: [
    {
      name: "Tactical Superiority",
      duration: 10,
      cooldown: 300,
      icon: ("EMPIRE/Operative/tactical_superiority"),
      abilityType: AbilityType.PartyDamageBuff,
    },
    {
      name: "Evasion",
      duration: 3,
      cooldown: 60,
      icon: ("EMPIRE/Operative/evasion"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Shield Probe",
      duration: 10,
      cooldown: 25,
      icon: ("EMPIRE/Operative/shield probe"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Cloaking Screen",
      duration: 4,
      cooldown: 120,
      icon: ("EMPIRE/Operative/cloaking_screen"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Stim Boost",
      duration: 15,
      cooldown: 105,
      icon: ("EMPIRE/Operative/stim_boost"),
      abilityType: AbilityType.SelfDamageBuff
    },
    {
      name: "Medpac",
      duration: 30,
      cooldown: 90,
      icon: ("CrossRole/05medpac"),
      abilityType: AbilityType.Healing,
    },
    {
      name: "Adrenal",
      duration: 15,
      cooldown: 180,
      icon: ("CrossRole/07_dps_adrenal.png"),
      abilityType: AbilityType.SelfDamageBuff
    },
    {
      name: "Escape",
      duration: 4,
      cooldown: 120,
      icon: ("EMPIRE/Operative/escape"),
      abilityType: AbilityType.Utility,
    },
    {
      name: "Distraction",
      duration: 4,
      cooldown: 18,
      requiresBossTarget: true,
      icon: ("EMPIRE/Operative/distraction"),
      abilityType: AbilityType.Utility,
    }
  ]
};
