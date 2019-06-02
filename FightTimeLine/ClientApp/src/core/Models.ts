import * as FF from "./FFLogs"

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
  PartyDefense = 256,
  Enmity = 512
}

export interface IBoss {
  id: string;
  name: string;
  userName: string;
  data: string;
  isPrivate: boolean;
  ref: number;
}

export interface IBossSearchEntry {
  id: string;
  name: string;
  canRemove?: boolean;
  createDate?: Date;
  modifiedDate?:Date;
}

export interface IFight {
  id: string;
  name: string;
  userName: string;
  data: string;
}

export interface IContextMenuData {
  text: string;
  item: any;
  icon?: string;
  handler: (item: any) => void;
  isDivider?: boolean;
  isDowntime?: boolean;
  filter?: IAbilityFilter;
  pets?: any[];
  isCheckBox?: boolean;
  checked?: boolean;
  hidden?: any[];
}

export const byName = (id: string, ...names: string[]) => {
  return new ByNameDetecor(id, ...names);
}

export const byBuffApply = (id: number, abilityName?: string) => {
  return new ByBuffApplyDetector(id, abilityName);
}

export const byBuffRemove = (id: number, abilityName?: string, offsetCorrect?: number) => {
  return new ByBuffRemoveDetector(id, abilityName, offsetCorrect);
}

const isAbility = (ev: FF.Event): ev is FF.AbilityEvent => {
  return (ev.type === "cast" || ev.type === "damage");
}

const isBuffApply = (ev: FF.Event): ev is FF.BuffEvent => {
  return (ev.type === "applybuff");
}

const isBuffRemove = (ev: FF.Event): ev is FF.BuffEvent => {
  return (ev.type === "removebuff");
}

export interface IDetectionDependencies {
  abilities: number[];
  buffs: number[];
}

export interface IDetectionStrategy {
  process(ev: FF.Event): { offset: number, name: string };
  deps: IDetectionDependencies;
}

class ByNameDetecor implements IDetectionStrategy {
  private names: string[];
  constructor(private id: string, ...names: string[]) {
    this.names = names;
  }

  process(ev: FF.Event): { offset: number; name: string } {
    if (isAbility(ev)) {
      if (this.names.some(n => n === ev.ability.name)) {
        return { offset: ev.timestamp, name: this.names[0] }
      }
    }
    return null;
  }

  get deps(): IDetectionDependencies {
    return {
      abilities: [parseInt(this.id)],
      buffs: []
    }
  }
}

class ByBuffApplyDetector implements IDetectionStrategy {
  constructor(private id: number, private abilityName?: string) {
  }

  process(ev: FF.Event): { offset: number; name: string } {
    if (isBuffApply(ev)) {
      if (ev.ability.guid === this.id) {
        return { offset: ev.timestamp, name: this.abilityName || ev.ability.name }
      }
    }
    return null;
  }

  get deps(): IDetectionDependencies {
    return {
      abilities: [],
      buffs: [this.id]
    };
  }
}

class ByBuffRemoveDetector implements IDetectionStrategy {
  constructor(private id: number, private abilityName?: string, private offsetCorrection?: number) {
  }

  process(ev: FF.Event): { offset: number; name: string } {
    if (isBuffRemove(ev)) {
      if (ev.ability.guid === this.id) {
        return { offset: ev.timestamp - (this.offsetCorrection || 0), name: this.abilityName || ev.ability.name }
      }
    }
    return null;
  }

  get deps(): IDetectionDependencies {
    return {
      abilities: [],
      buffs: [this.id]
    };
  }
}

export interface IAbility {
  name: string;
  duration: number;
  cooldown: number;
  requiresBossTarget?: boolean;
  icon?: string;
  xivDbId?: string;
  xivDbType?: string;
  relatedAbilities?: IRelatedAbilitiesOptions;
  extendDurationOnNextAbility?: number;
  settings?: IAbilitySetting[] | null;
  abilityType: AbilityType;
  pet?: string;
  detectStrategy?: IDetectionStrategy;
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
  name?: string;
  type?: DamageType;
  offset?: string;
  isTankBuster?: boolean;
  isAoe?: boolean;
  isShareDamage?: boolean;
  syncSettings?: string;
  description?: string;
}

export interface ISyncData {
  offset: string;
  condition: Combined;
}

export interface ISyncSettingGroup {
  operation: SyncOperation,
  operands: Combined[];
}

export interface ISyncSetting {
  type: string;
  description: string;
  payload: any;
}

export type Combined = ISyncSetting | ISyncSettingGroup;

export const isSetting = (c: Combined): c is ISyncSetting => {
  return !!(<ISyncSetting>c).type;
}

export const isSettingGroup = (c: Combined): c is ISyncSettingGroup => {
  return !!(<ISyncSettingGroup>c).operation;
}



export enum SyncOperation {
  And = "and",
  Or = "or"
}

export enum DamageType {
  None = 0,
  Physical = 1,
  Magical = 2,
  All = DamageType.Physical | DamageType.Magical
}

export interface IAbilityFilter {
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
  enmity?: boolean;
};

export interface IBossAttackFilter {
  isTankBuster: boolean;
  isAoe: boolean;
  isShareDamage: boolean;
  isOther: boolean;
  isMagical: boolean;
  isPhysical: boolean;
  isUnaspected: boolean;
  keywords: string[];
}

export interface IFilter {
  abilities: IAbilityFilter;
  attacks?: IBossAttackFilter;
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


