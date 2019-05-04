export enum Role {
  Tank,
  Healer,
  Melee,
  Range,
  Caster
}
export interface IJob {
  name: string;
  icon?: string;
  abilities: Array<IAbility>;
  canBeTargetForBoss: boolean;
  canHavePet?: boolean;
  role: Role;
  pets?: IPet[];
  defaultPet?: string;
  stances?: Array<IStance>;
}

export interface IPet {
  name: string;
  icon?: string;
}

export interface IStance {
  ability: IAbility;
}

export enum AbilityType {
  SelfDefense = 1,
  SelfDamageBuff = 2,
  Healing = 4,
  Utility = 8,
  Damage = 16,
  HealingBuff = 32,
  PartyDamageBuff = 64,
  Pet = 128,
  PartyDefense = 256
}

export interface IBoss {
  id: string;
  name: string;
  author: string;
  userName: string;
  secret: string;
  data: string;
  isPrivate: boolean;
}

export interface IFight {
  id: string;
  name: string;
  author: string;
  userName: string;
  secret: string;
  data: string;
  isPrivate: boolean;
  bossRef: string;

}

export interface IContextMenuData {
  text: string;
  item: any;
  icon?: string;
  handler: (item: any) => void;
  isDivider?: boolean;
  isDowntime?: boolean;
  filter?: IFilter;
  pets?: any[];
  isCheckBox?: boolean;
  checked?: boolean;
  hidden?: any[];
}

export interface IAbility {
  name: string;
  duration: number;
  cooldown: number;
  icon?: string;
  xivDbId?: string;
  xivDbType?: string;
  relatedAbilities?: IRelatedAbilitiesOptions;
  extendDurationOnNextAbility?: number;
  settings?: IAbilitySetting[] | null;
  abilityType: AbilityType;
  nameToMatch?: string;
  pet?: string;
  detectByBuff?:string;
}

export interface IAbilitySetting {
  name: string;
  displayName: string;
  description: string;
  type: string;
  default: any;
}

export interface IAbilitySettingData {
  name: string;
  value: any;
}

export interface IRelatedAbilitiesOptions {
  affectedBy?: string[];
  affects?: string[];
  abilities?: string[];
  parentOnly?: boolean;
}

export interface IChangeBossTargetAbility extends IAbility {
  changesBossTarget?: boolean;
}

export interface IDefenceAbility extends IAbility {
  damageAffected: DamageType;
  goodForTankBusters?: boolean;
  isUltimateSave?: boolean;
}

export enum EntryType {
  Unknown,
  BossAttack,
  AbilityUsage,
  BossTarget,
  BossDownTime,
  BuffMap,
  CompactViewAbilityUsage,
  Job,
  Ability,
  StanceUsage,
  AbilityAvailability
}


export interface IBossAbility {
  name: string;
  type: DamageType;
  offset: number | string;
  isTankBuster?: boolean;
  isAoe?: boolean;
  isShareDamage?: boolean;
}

export enum DamageType {
  None = 0,
  Physical = 1,
  Magical = 2,
  All = DamageType.Physical | DamageType.Magical
}

export interface IFilter {
  abilities: {
    selfDefence?: boolean;
    partyDefence?: boolean;
    selfDamageBuff?: boolean;
    partyDamageBuff?: boolean;
    damage?: boolean;
    healing?: boolean;
    healingBuff?: boolean;
    utility?: boolean;
    pet?: boolean;
    unused?: boolean;
  };
  attacks?: {
    isTankBuster: boolean;
    isAoe: boolean;
    isShareDamage: boolean;
    isOther: boolean;
    isMagical: boolean;
    isPhysical: boolean;
    isUnaspected: boolean;
    keywords: string[];
  };
}

export interface IView {
  buffmap: boolean;
  ogcdAsPoints: boolean;
  showDowntimesInPartyArea: boolean;
  verticalBossAttacks: boolean;
  compactView: boolean;
  highlightLoaded: boolean;
  showAbilityAvailablity: boolean;
}

export interface ITools {
  downtime: boolean;
  stickyAttacks: boolean;
}


