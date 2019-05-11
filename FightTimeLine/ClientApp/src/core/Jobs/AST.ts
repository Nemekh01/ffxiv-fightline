import { IJob,  Role, AbilityType } from "../Models"
import { settings, getAbilitiesFrom, healerSharedAbilities, medicine } from "./shared"

export const AST: IJob = {
  name: "AST",
  role: Role.Healer,
  icon: ("JobIcons/Astrologian_Icon_10"),
  abilities: [
    {
      name: "Lightspeed",
      duration: 10,
      cooldown: 120,
      xivDbId: "3606",
      icon: ("23_Astrologian/3606_Lightspeed"),
      abilityType: AbilityType.Utility,
    },
    {
      name: "Synastry",
      duration: 20,
      cooldown: 90,
      xivDbId: "3612",
      icon: ("23_Astrologian/3612_Synastry"),
      abilityType: AbilityType.Healing,
      settings: [settings.target],
    },
    {
      name: "Time Dilation",
      duration: 0,
      cooldown: 90,
      xivDbId: "3611",
      icon: ("23_Astrologian/3611_Time Dilation"),
      abilityType: AbilityType.Healing,
      settings: [settings.target],
    },
    {
      name: "Earthly Star",
      duration: 20,
      cooldown: 60,
      xivDbId: "7439",
      icon: ("23_Astrologian/7439_Earthly Star"),
      abilityType: AbilityType.Healing,
    },
    {
      name: "Essential Dignity",
      duration: 0,
      cooldown: 40,
      xivDbId: "3614",
      icon: ("23_Astrologian/3614_Essential Dignity"),
      abilityType: AbilityType.Healing,
      settings: [settings.target],
    },
    {
      name: "Celestial Opposition",
      duration: 0,
      cooldown: 120,
      xivDbId: "3616",
      icon: ("23_Astrologian/3616_Celestial Opposition"),
      abilityType: AbilityType.Utility,
    },
    {
      name: "Sleeve Draw",
      duration: 0,
      cooldown: 120,
      xivDbId: "7448",
      icon: ("23_Astrologian/7448_Sleeve Draw"),
      abilityType: AbilityType.Utility,
    },
    {
      name: "Collective Unconscious",
      duration: 18,
      cooldown: 90,
      xivDbId: "3613",
      icon: ("23_Astrologian/3613_Collective Unconscious"),
      abilityType: AbilityType.Utility,
    },
    ...getAbilitiesFrom(healerSharedAbilities),
    medicine["Mind"]
  ]
};


