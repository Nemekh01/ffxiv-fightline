import { IJob, DamageType, IAbility, IAbilitySetting, Role, AbilityType, IStance, byName, byBuffApply, byBuffRemove } from "../Models"
import { settings, IAbilities, getAbilitiesFrom, meleeSharedAbilities, medicine } from "./shared"

export const SAM: IJob = {
  name: "SAM",
  role: Role.Melee,
  icon: ("JobIcons/Samurai_Icon_10"),
  abilities: [
    {
      name: "Meditate",
      duration: 15,
      cooldown: 60,
      xivDbId: "7497",
      icon: ("34_Samurai/7497_Meditate"),
      abilityType: AbilityType.Utility,
    },
    ...getAbilitiesFrom(meleeSharedAbilities),
    medicine["Strength"]
  ]
};


