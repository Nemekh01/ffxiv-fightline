import { IAbility, IAbilitySetting, AbilityType, byBuffApply, byBuffRemove } from "../../Models"

export interface IAbilities {
  [name: string]: IAbility
}

export const abilitySortFn = (a1: IAbility, a2: IAbility): number => {
  const st: AbilityType[] = [
    AbilityType.PartyDefense,
    AbilityType.SelfDefense,
    AbilityType.PartyDamageBuff,
    AbilityType.SelfDamageBuff,
    AbilityType.Utility,
    AbilityType.Enmity,
    AbilityType.Damage,
    AbilityType.Healing,
    AbilityType.HealingBuff,
    AbilityType.Pet
  ];

  const ar1 = st.map((it, i) => it & a1.abilityType ? i + 1 : 0).find((it) => it > 0);
  const ar2 = st.map((it, i) => it & a2.abilityType ? i + 1 : 0).find((it) => it > 0);

  return ar1 - ar2;
}

export const getAbilitiesFrom = (arr: IAbilities): IAbility[] => {
  return Object.keys(arr).map((it: string) => arr[it]);
}

export const settings: {
  target: IAbilitySetting,
  changesTarget: IAbilitySetting
} = {
  target: <IAbilitySetting>{
    name: "target",
    displayName: "Target",
    description: "Determines target of ability",
    type: "partyMember",
    default: ""
  },
  changesTarget: <IAbilitySetting>{
    name: "changesTarget",
    displayName: "Changes target",
    description: "Determines if ability changes boss target",
    type: "boolean",
    default: true
  }
}

export const tankSharedAbilities: IAbilities = {
  Rampart: { name: "Rampart", duration: 20, cooldown: 90, xivDbId: "7531", icon: "10_TankRole/7531_Rampart", abilityType: AbilityType.SelfDefense },
  Reprisal: { name: "Reprisal", duration: 5, cooldown: 60, xivDbId: "7535", icon: "10_TankRole/7535_Reprisal", abilityType: AbilityType.PartyDefense, requiresBossTarget: true, },
  Provoke: { name: "Provoke", duration: 0, cooldown: 30, xivDbId: "7533", icon: "10_TankRole/7533_Provoke", abilityType: AbilityType.Utility | AbilityType.Enmity, settings: [settings.changesTarget], requiresBossTarget: true, },
  Shirk: { name: "Shirk", duration: 0, cooldown: 120, xivDbId: "7537", icon: "10_TankRole/7537_Shirk", abilityType: AbilityType.Utility | AbilityType.Enmity }
};

const magicSharedAbilities: IAbilities = {
  Swiftcast: { name: "Swiftcast", duration: 0, cooldown: 60, icon: ("90_Others/7561_Swiftcast"), xivDbId: "7561", abilityType: AbilityType.Utility },
  Surecast: { name: "Surecast", duration: 6, cooldown: 120, xivDbId: "7559", icon: ("90_Others/7559_Surecast"), abilityType: AbilityType.Utility },
  LucidDreaming: { name: "Lucid Dreaming", duration: 21, cooldown: 60, xivDbId: "7562", icon: ("90_Others/7562_Lucid Dreaming"), abilityType: AbilityType.Utility },
};

export const meleeSharedAbilities: IAbilities = {
  Feint: { name: "Feint", duration: 10, cooldown: 90, xivDbId: "7549", icon: ("30_MeleeDPSRole/7549_Feint"), abilityType: AbilityType.PartyDefense, requiresBossTarget: true, },
};
export const rangeSharedAbilities: IAbilities = {
};
export const casterSharedAbilities: IAbilities = {
  Addle: { name: "Addle", duration: 10, cooldown: 90, xivDbId: "7560", icon: ("50_MagicDPSRole/7560_Addle"), abilityType: AbilityType.PartyDefense, requiresBossTarget: true, },
  ...magicSharedAbilities
};
export const healerSharedAbilities: IAbilities = {
  ...magicSharedAbilities
};

export const medicine: IAbilities  = {
  Mind: { name: "Medicine", duration: 30, cooldown: 270, xivDbId: "27999", icon: ("Medicine/22451_Mind"), abilityType: AbilityType.SelfDamageBuff, xivDbType: "item", detectStrategy: byBuffRemove(1000049, "Medicine", 30) },
  Intelligence: { name: "Medicine", duration: 30, cooldown: 270, xivDbId: "27998", icon: ("Medicine/22450_Intelligence"), abilityType: AbilityType.SelfDamageBuff, xivDbType: "item", detectStrategy: byBuffRemove(1000049, "Medicine", 30) },
  Dexterity: { name: "Medicine", duration: 30, cooldown: 270, xivDbId: "27996", icon: ("Medicine/22448_Dexterity"), abilityType: AbilityType.SelfDamageBuff, xivDbType: "item", detectStrategy: byBuffRemove(1000049, "Medicine", 30) },
  Strength: { name: "Medicine", duration: 30, cooldown: 270, xivDbId: "27995", icon: ("Medicine/22447_Strength"), abilityType: AbilityType.SelfDamageBuff, xivDbType: "item", detectStrategy: byBuffRemove(1000049, "Medicine", 30) },

};


