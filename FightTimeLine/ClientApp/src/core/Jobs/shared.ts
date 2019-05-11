import { IAbility, IAbilitySetting, AbilityType, byBuffApply} from "../Models"

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
  Convalescence: { name: "Convalescence", duration: 20, cooldown: 120, xivDbId: "7532", icon: "10_TankRole/7532_Convalescence", abilityType: AbilityType.HealingBuff },
  Awareness: { name: "Awareness", duration: 25, cooldown: 120, xivDbId: "7534", icon: "10_TankRole/7534_Awareness", abilityType: AbilityType.SelfDefense },
  Anticipation: { name: "Anticipation", duration: 20, cooldown: 60, xivDbId: "7536", icon: "10_TankRole/7536_Anticipation", abilityType: AbilityType.SelfDefense },
  Provoke: { name: "Provoke", duration: 0, cooldown: 40, xivDbId: "7533", icon: "10_TankRole/7533_Provoke", abilityType: AbilityType.Utility, settings: [settings.changesTarget], requiresBossTarget: true, },
  Ultimatum: { name: "Ultimatum", duration: 0, cooldown: 90, xivDbId: "7539", icon: "10_TankRole/7539_Ultimatum", abilityType: AbilityType.Utility, settings: [settings.changesTarget] },
  Shirk: { name: "Shirk", duration: 0, cooldown: 120, xivDbId: "7537", icon: "10_TankRole/7537_Shirk", abilityType: AbilityType.Utility }
};

const magicSharedAbilities: IAbilities = {
  Swiftcast: { name: "Swiftcast", duration: 0, cooldown: 60, icon: ("90_Others/7561_Swiftcast"), xivDbId: "7561", abilityType: AbilityType.Utility },
  Surecast: { name: "Surecast", duration: 5, cooldown: 30, xivDbId: "7559", icon: ("90_Others/7559_Surecast"), abilityType: AbilityType.Utility },
  LucidDreaming: { name: "Lucid Dreaming", duration: 21, cooldown: 120, xivDbId: "7562", icon: ("90_Others/7562_Lucid Dreaming"), abilityType: AbilityType.Utility },
};

export const meleeSharedAbilities: IAbilities = {
  Feint: { name: "Feint", duration: 10, cooldown: 120, xivDbId: "7549", icon: ("30_MeleeDPSRole/7549_Feint"), abilityType: AbilityType.PartyDefense, requiresBossTarget: true, },
};
export const rangeSharedAbilities: IAbilities = {
  Palisade: { name: "Palisade", duration: 10, cooldown: 150, xivDbId: "7550", icon: ("40_RangeDPSRole/7550_Palisade"), abilityType: AbilityType.PartyDefense },
  Refresh: { name: "Refresh", duration: 30, cooldown: 150, xivDbId: "7556", icon: ("40_RangeDPSRole/7556_Refresh"), abilityType: AbilityType.Utility },
  Tactician: { name: "Tactician", duration: 30, cooldown: 150, xivDbId: "7555", icon: ("40_RangeDPSRole/7555_Tactician"), abilityType: AbilityType.Utility },
};
export const casterSharedAbilities: IAbilities = {
  Addle: { name: "Addle", duration: 10, cooldown: 90, xivDbId: "7560", icon: ("50_MagicDPSRole/7560_Addle"), abilityType: AbilityType.PartyDefense, requiresBossTarget: true, },
  Apocatastasis: { name: "Apocatastasis", duration: 10, cooldown: 90, xivDbId: "7563", icon: ("50_MagicDPSRole/7563_Apocatastasis"), abilityType: AbilityType.PartyDefense, settings: [settings.target] },
  ManaShift: { name: "Mana Shift", duration: 0, cooldown: 120, xivDbId: "7565", icon: ("50_MagicDPSRole/7565_Mana Shift"), abilityType: AbilityType.Utility, settings: [settings.target] },
  ...magicSharedAbilities
};
export const healerSharedAbilities: IAbilities = {
  ClericStance: { name: "Cleric Stance", duration: 15, cooldown: 90, xivDbId: "7567", icon: ("20_HealerRole/7567_Cleric Stance"), abilityType: AbilityType.SelfDamageBuff },
  Largesse: { name: "Largesse", duration: 20, cooldown: 90, xivDbId: "7570", icon: ("20_HealerRole/7570_Largesse"), abilityType: AbilityType.HealingBuff },
  EyeforanEye: { name: "Eye for an Eye", duration: 20, cooldown: 180, xivDbId: "7569", icon: ("20_HealerRole/7569_Eye For An Eye"), abilityType: AbilityType.PartyDefense, settings: [settings.target] },
  ...magicSharedAbilities
};

export const medicine: IAbilities = {
  Mind: { name: "Medicine", duration: 30, cooldown: 270, xivDbId: "22451", icon: ("Medicine/22451_Mind.jpg"), abilityType: AbilityType.SelfDamageBuff, xivDbType: "item", detectStrategy: byBuffApply(1000049, "Medicine") },
  Intelligence: { name: "Medicine", duration: 40, cooldown: 270, xivDbId: "22450", icon: ("Medicine/22450_Intelligence.jpg"), abilityType: AbilityType.SelfDamageBuff, xivDbType: "item", detectStrategy: byBuffApply(1000049, "Medicine") },
  Dexterity: { name: "Medicine", duration: 40, cooldown: 270, xivDbId: "22448", icon: ("Medicine/22448_Dexterity.jpg"), abilityType: AbilityType.SelfDamageBuff, xivDbType: "item", detectStrategy: byBuffApply(1000049, "Medicine") },
  Strength: { name: "Medicine", duration: 40, cooldown: 270, xivDbId: "22447", icon: ("Medicine/22447_Strength.jpg"), abilityType: AbilityType.SelfDamageBuff, xivDbType: "item", detectStrategy: byBuffApply(1000049, "Medicine") },

};


