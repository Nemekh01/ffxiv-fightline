import { IJob, DamageType, IAbility, IAbilitySetting, Role, AbilityType, IStance, byName, byBuffApply, byBuffRemove } from "../Models"
import { settings, IAbilities, abilitySortFn, getAbilitiesFrom, casterSharedAbilities, medicine } from "./shared"

export const SMN: IJob = {
  name: "SMN",
  role: Role.Caster,
  icon: ("JobIcons/Summoner_Icon_10"),
  abilities: [
    {
      name: "Egi Assault I",
      duration: 0,
      cooldown: 30,
      xivDbId: "",
      icon: ("52_Summoner/icon_07"),
      abilityType: AbilityType.Damage,
      charges: {
        count: 2,
        cooldown: 30
      }
    },
    {
      name: "Energy Drain",
      duration: 0,
      cooldown: 30,
      xivDbId: "167",
      icon: ("52_Summoner/0167_Energy Drain"),
      abilityType: AbilityType.Damage
    },
    {
      name: "Egi Assault II",
      duration: 0,
      cooldown: 30,
      xivDbId: "176",
      icon: ("52_Summoner/icon_13"),
      abilityType: AbilityType.Damage,
      charges: {
        count: 2,
        cooldown: 30
      }
    },
    {
      name: "Enkindle",
      duration: 0,
      cooldown: 120,
      xivDbId: "184",
      icon: ("61_PetsEgi/0184_Enkindle"),
      requiresBossTarget: true,
      abilityType: AbilityType.Damage,
    },
    {
      name: "Tri-disaster",
      duration: 0,
      cooldown: 50,
      xivDbId: "3580",
      icon: ("61_PetsEgi/3580_Tri-disaster"),
      requiresBossTarget: true,
      abilityType: AbilityType.Damage,
    },
    {
      name: "Aetherpact",
      duration: 15,
      cooldown: 180,
      xivDbId: "7423",
      icon: ("61_PetsEgi/7423_Aetherpact"),
      abilityType: AbilityType.PartyDamageBuff,
    },
    ...getAbilitiesFrom(casterSharedAbilities),
    medicine["Intelligence"]
  ]
};


