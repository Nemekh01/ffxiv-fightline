import { IJob, DamageType, IAbility, IAbilitySetting, Role, AbilityType, IStance, byName, byBuffApply, byBuffRemove } from "../Models"
import { settings, IAbilities, abilitySortFn, getAbilitiesFrom, casterSharedAbilities, medicine } from "./shared"

export const SMN: IJob = {
  name: "SMN",
  role: Role.Caster,
  pets: [
    {
      name: "Garuda-Egi",
      icon: ("61_PetsEgi/0792_Wind Blade")
    },
    {
      name: "Ifrit-Egi",
      icon: ("61_PetsEgi/0798_Burning Strike")
    },
    {
      name: "Titan-Egi",
      icon: ("61_PetsEgi/0787_Rock Buster")
    }
  ],
  defaultPet: "Ifrit-Egi",
  icon: ("JobIcons/Summoner_Icon_10"),
  abilities: [
    {
      name: "Aetherflow",
      duration: 0,
      cooldown: 60,
      icon: ("62_PetsFairy/8908_Aetherflow"),
      xivDbId: "166",
      abilityType: AbilityType.Utility,
    },
    {
      name: "Rouse",
      duration: 20,
      cooldown: 60,
      xivDbId: "176",
      icon: ("52_Summoner/0176_Rouse"),
      abilityType: AbilityType.SelfDamageBuff,
    },
    {
      name: "Shadow Flare",
      duration: 15,
      cooldown: 60,
      xivDbId: "179",
      icon: ("52_Summoner/0179_Shadow Flare"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Enkindle",
      duration: 0,
      cooldown: 180,
      xivDbId: "184",
      icon: ("61_PetsEgi/0184_Enkindle"),
      requiresBossTarget: true,
      abilityType: AbilityType.Damage,
    },
    {
      name: "Aetherpact",
      duration: 15,
      cooldown: 120,
      xivDbId: "7423",
      icon: ("61_PetsEgi/7423_Aetherpact"),
      abilityType: AbilityType.PartyDamageBuff,
    },
    {
      name: "Shockwave",
      duration: 0,
      cooldown: 90,
      xivDbId: "793",
      icon: ("61_PetsEgi/0793_Shockwave"),
      pet: "Garuda-Egi",
      abilityType: AbilityType.Pet,
    },
    {
      name: "Aerial Slash",
      duration: 0,
      cooldown: 30,
      xivDbId: "794",
      icon: ("61_PetsEgi/0794_Aerial Slash"),
      pet: "Garuda-Egi",
      abilityType: AbilityType.Pet,
    },
    {
      name: "Contagion",
      duration: 15,
      cooldown: 60,
      xivDbId: "795",
      icon: ("61_PetsEgi/0795_Contagion"),
      pet: "Garuda-Egi",
      abilityType: AbilityType.Pet,
    },
    {
      name: "Crimson Cyclone",
      duration: 0,
      cooldown: 40,
      xivDbId: "797",
      icon: ("61_PetsEgi/0797_Crimson Cyclone"),
      pet: "Ifrit-Egi",
      abilityType: AbilityType.Pet,
    },
    {
      name: "Radiant Shield",
      duration: 20,
      cooldown: 60,
      xivDbId: "799",
      icon: ("61_PetsEgi/0799_Radiant Shield"),
      pet: "Ifrit-Egi",
      abilityType: AbilityType.Pet,
    },
    {
      name: "Flaming Crush",
      duration: 0,
      cooldown: 30,
      xivDbId: "800",
      icon: ("61_PetsEgi/0800_Flaming Crush"),
      pet: "Ifrit-Egi",
      abilityType: AbilityType.Pet,
    },
    {
      name: "Mountain Buster",
      duration: 0,
      cooldown: 15,
      xivDbId: "788",
      icon: ("61_PetsEgi/0788_Mountain Buster"),
      pet: "Titan-Egi",
      abilityType: AbilityType.Pet,
    },
    {
      name: "Earthen Ward",
      duration: 20,
      cooldown: 120,
      xivDbId: "789",
      icon: ("61_PetsEgi/0789_Earthen Ward"),
      pet: "Titan-Egi",
      abilityType: AbilityType.Pet,
    },
    {
      name: "Landslide",
      duration: 0,
      cooldown: 40,
      xivDbId: "790",
      icon: ("61_PetsEgi/0790_Landslide"),
      pet: "Titan-Egi",
      abilityType: AbilityType.Pet,
    },
    ...getAbilitiesFrom(casterSharedAbilities),
    medicine["Intelligence"]
  ]
};


