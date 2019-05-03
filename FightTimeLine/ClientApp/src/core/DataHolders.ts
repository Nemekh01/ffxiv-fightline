import * as M from "./Models";
import { ClassNameBuilder } from "./ClassNameBuilder";
import { VisTimelineItems, VisTimelineItem, VisTimelineGroup, VisTimelineGroups } from "ngx-vis"

class BaseMap<T, TI> {
  id: T;
  item: TI;

  constructor(val: any) {
    this.id = val && val.id || null;
    this.item = val && val.item || null;
  }
}

export interface ITimelineContainer {
  items: VisTimelineItems;
  groups: VisTimelineGroups;
}

export class Holders {
  itemUsages: AbilityUsageHolder;
  abilities: AbilitiesMapHolder;
  selectionRegistry: AbilitySelectionHolder;
  jobs: JobsMapHolder;
  bossAttacks: BossAttacksHolder;
  bossDownTime: BossDownTimeHolder;
  heatMaps: BuffHeatmapHolder;
  bossTargets: BossTargetHolder;
  stances: StancesHolder;
  abilityAvailability: AbilityAvailablityHolder;

  constructor(mainTimeLine: ITimelineContainer, bossTimeLine: ITimelineContainer) {
    this.itemUsages = new AbilityUsageHolder(mainTimeLine.items);
    this.abilities = new AbilitiesMapHolder(mainTimeLine.groups);
    this.selectionRegistry = new AbilitySelectionHolder();
    this.jobs = new JobsMapHolder(mainTimeLine.groups);
    this.bossAttacks = new BossAttacksHolder(bossTimeLine.items, mainTimeLine.items);
    this.bossDownTime = new BossDownTimeHolder(bossTimeLine.items, mainTimeLine.items);
    this.heatMaps = new BuffHeatmapHolder(mainTimeLine.items);
    this.bossTargets = new BossTargetHolder(mainTimeLine.items, "boss");
    this.stances = new StancesHolder(mainTimeLine.items);
    this.abilityAvailability = new AbilityAvailablityHolder(mainTimeLine.items);
  }

  setHighLightLoadedView(highlightLoaded: boolean): void {

    const items = this.itemUsages.getAll();
    items.forEach(it => {
      if (it.loaded) {
        const b = new ClassNameBuilder(it.item.className);
        b.set([{ value: "loaded", flag: highlightLoaded }]);
        it.item.className = b.build();
      }
    });
    this.itemUsages.update(items);

    const ss = this.stances.getAll();
    ss.forEach(it => {
      if (it.loaded) {
        const b = new ClassNameBuilder(it.item.className);
        b.set([{ value: "loaded", flag: highlightLoaded }]);
        it.item.className = b.build();
      }
    });
    this.stances.update(ss);
  }
}

export class AbilitySelectionMap extends BaseMap<string, VisTimelineItem> {
  time: Date;
}


export class AbilityMap extends BaseMap<string, VisTimelineGroup> {

  constructor(val: any) {
    super(val);
    this.parentId = val && val.parentId || null;
    this.ability = val && val.ability || null;
    this.isStance = val && val.isStance || null;
    this.hidden = val && val.hidden || null;
    this.isCompact = val && val.isCompact || null;
  }


  parentId: string;
  ability: M.IAbility;
  isStance?: boolean;
  hidden?: boolean;
  isCompact?: boolean;

  public get isDef(): boolean {
    return (this.ability.abilityType & M.AbilityType.SelfDefense) === M.AbilityType.SelfDefense ||
      (this.ability.abilityType & M.AbilityType.PartyDefense) === M.AbilityType.PartyDefense;
  }

  public get isSelfDef(): boolean {
    return (this.ability.abilityType & M.AbilityType.SelfDefense) === M.AbilityType.SelfDefense;
  }

  public get isDamage(): boolean {
    return (this.ability.abilityType & M.AbilityType.SelfDamageBuff) === M.AbilityType.SelfDamageBuff ||
      (this.ability.abilityType & M.AbilityType.PartyDamageBuff) === M.AbilityType.PartyDamageBuff;
  }

  public get isSelfDamage(): boolean {
    return (this.ability.abilityType & M.AbilityType.SelfDamageBuff) === M.AbilityType.SelfDamageBuff;
  }
}

export class JobMap extends BaseMap<string, VisTimelineGroup> {
  job: M.IJob;
  actorName: string;
  filter?: M.IFilter;
  pet?: string;
  isCompactView?: boolean;
  collapsed?: boolean;
}

export class BossAttackMap extends BaseMap<string, VisTimelineItem> {
  attack: M.IBossAbility;
}

export class AbilityUsageMap extends BaseMap<string, VisTimelineItem> {
  ability: M.IAbility;
  calculatedDuration: number;
  settings: M.IAbilitySettingData[];
  loaded: boolean;
}

export class BossDownTimeMap extends BaseMap<string, VisTimelineItem> {
  startId: string;
  endId: string;
  color: string;

  constructor(val: any) {
    super(val);
    this.startId = val && val.startId || null;
    this.endId = val && val.endId || null;
    this.color = val && val.color || null;
  }

  setColor(color: string): void {
    this.color = color;
    this.item.className = "downtime " + color;
  }
}

export class HeatmapMap extends BaseMap<string, VisTimelineItem> {
  ability: M.IAbility;
}

export class BossTargetMap extends BaseMap<string, VisTimelineItem> {

}

export class JobStanceMap extends BaseMap<string, VisTimelineItem> {
  abilityName: string;
  loaded: boolean;
}

export class AbilityAvailabilityMap extends BaseMap<string, VisTimelineItem> {
  ability: M.IAbility;
}


class BaseHolder<TK, TI, T extends BaseMap<TK, TI>> {
  protected items: { [id: string]: T } = {};

  add(i: T): void {
    this.items[i.id as any] = i;
  }

  get(id: TK): T {
    return this.items[id as any];
  }

  protected get values(): T[] {
    return Object.keys(this.items).map(it => this.items[it]);
  }

  filter(predicate: (it: T) => boolean): T[] {
    return this.values.filter(predicate);
  }
  remove(ids: TK[]): void {
    ids.forEach(x => {
      const index = this.items[x as any];
      if (index) {
        delete this.items[x as any];
      }
    });

  }

  getAll(): T[] {
    return this.values;
  }

  getIds(): TK[] {
    return Object.keys(this.items) as any[];
  }

  getByIds(ids: (string | number)[]): T[] {
    if (!ids) return [];
    return ids.map(it => this.items[it]).filter(it => !!it);
  }

  clear(): void {
    delete this.items;
    this.items = {};
  }

  update(items: T[]) {

  }
}

export class StancesHolder extends BaseHolder<string, VisTimelineItem, JobStanceMap> {
  constructor(private visItems: VisTimelineItems) {
    super();
  }
  add(i: JobStanceMap): void {
    super.add(i);
    this.visItems.add(i.item);
  }

  clear(): void {
    this.visItems.removeItems(this.getIds());
    super.clear();
  }

  checkDatesOverlap(group: number, start: Date, end: Date, id?: string, selectionRegistry?: AbilitySelectionHolder): boolean {
    if (this.values.length > 0) {
      return this.values.some((x: JobStanceMap) => (id === undefined || x.id !== id) && x.item.group === group && x.item.start < end && x.item.end > start && (!selectionRegistry || !selectionRegistry.get(x.id)));
    }
    return false;
  }

  remove(ids: string[]): void {
    super.remove(ids);
    this.visItems.remove(ids);
  }

  update(items: JobStanceMap[]) {
    this.visItems.update(items.map(x => x.item));
  }
}

export class AbilitiesMapHolder extends BaseHolder<string, VisTimelineGroup, AbilityMap> {

  constructor(private visItems: VisTimelineGroups) {
    super();
  }

  add(i: AbilityMap): void {
    super.add(i);
    this.visItems.add(i.item);
  }

  remove(ids: string[]): void {
    super.remove(ids);
    this.visItems.removeItems(ids);
  }

  clear(): void {
    this.visItems.removeItems(this.getIds());
    super.clear();

  }

  getByParentId(parentId: string): AbilityMap[] {
    return this.filter((b: AbilityMap) => b.parentId === parentId);
  }

  isBossTargetForGroup(group: string): boolean {
    return this.values.find((b: AbilityMap) => group === b.id && (b.ability as M.IChangeBossTargetAbility).changesBossTarget && b.parentId !== "boss") !== undefined;
  }

  getParent(group: string): string {
    return (this.values.find((b: AbilityMap) => group === b.id) as AbilityMap).parentId;
  }

  getByParentAndAbility(id: string, ability: string): AbilityMap {
    return this.values.find((b: AbilityMap) => b.parentId === id && !!b.ability &&
      (b.ability.name.toUpperCase() === ability.toUpperCase() || (b.ability.nameToMatch || "").toUpperCase() === ability.toUpperCase()));
  }

  getByParentAndBuff(id: string, buff: string): AbilityMap {
    return this.values.find((b: AbilityMap) => b.parentId === id && !!b.ability && (b.ability.detectByBuff == buff));
  }

  getStancesAbility(jobGroup: string): AbilityMap {
    return this.values.find((b: AbilityMap) => b.parentId === jobGroup && b.isStance);
  }

  getNonStancesAbilities(): AbilityMap[] {
    return this.filter(it => !it.isStance);
  }


  update(items: AbilityMap[]): void {
    this.visItems.update(items.map(x => x.item));
  }

  applyFilter(filter: M.IFilter, job: (a) => JobMap, used: (a) => boolean) {
    this.values.forEach(value => {
      const jobMap = job(value.parentId);
      const visible = this.abilityFilter(value, filter, jobMap, used);
      value.item.visible = visible;
    });
    this.update(this.values);
  }

  private abilityFilter(value: AbilityMap, filter: M.IFilter, jobMap: JobMap, used: (a) => boolean): boolean {
    const jobFilter = jobMap.filter;
    const filterUnit = (type: M.AbilityType, aType: M.AbilityType, globalFilter: boolean, jobFilter: boolean) => {
      let visible = false;
      if ((type & aType) === aType) {
        visible = globalFilter;
        if (jobFilter !== undefined)
          visible = jobFilter;
      }
      return visible;
    }
    let visible: boolean;
    if (this.filter == null || !value.ability) {
      visible = true;
    } else {
      if ((jobMap.pet || jobMap.job.defaultPet) && value.ability.pet && value.ability.pet !== (jobMap.pet || jobMap.job.defaultPet)) {
        visible = false;
      } else {
        visible = filterUnit(value.ability.abilityType,
          M.AbilityType.SelfDefense,
          filter.abilities.selfDefence,
          jobFilter.abilities.selfDefence);
        visible = visible ||
          filterUnit(value.ability.abilityType,
            M.AbilityType.PartyDefense,
            filter.abilities.partyDefence,
            jobFilter.abilities.partyDefence);
        visible = visible ||
          filterUnit(value.ability.abilityType,
            M.AbilityType.SelfDamageBuff,
            filter.abilities.selfDamageBuff,
            jobFilter.abilities.selfDamageBuff);
        visible = visible ||
          filterUnit(value.ability.abilityType,
            M.AbilityType.PartyDamageBuff,
            filter.abilities.partyDamageBuff,
            jobFilter.abilities.partyDamageBuff);
        visible = visible ||
          filterUnit(value.ability.abilityType,
            M.AbilityType.Damage,
            filter.abilities.damage,
            jobFilter.abilities.damage);
        visible = visible ||
          filterUnit(value.ability.abilityType,
            M.AbilityType.HealingBuff,
            filter.abilities.healingBuff,
            jobFilter.abilities.healingBuff);
        visible = visible ||
          filterUnit(value.ability.abilityType,
            M.AbilityType.Healing,
            filter.abilities.healing,
            jobFilter.abilities.healing);
        visible = visible ||
          filterUnit(value.ability.abilityType,
            M.AbilityType.Pet,
            filter.abilities.pet,
            jobFilter.abilities.pet);
        visible = visible ||
          filterUnit(value.ability.abilityType,
            M.AbilityType.Utility,
            filter.abilities.utility,
            jobFilter.abilities.utility);

        if (!filter.abilities.unused ||
          (jobFilter.abilities.unused !== undefined && !jobFilter.abilities.unused)) {
          if (!jobFilter.abilities.unused)
            visible = visible && used(value.id);
        }
      }
    }

    visible = visible && !value.hidden;

    return visible;
  }


}

export class JobsMapHolder extends BaseHolder<string, VisTimelineGroup, JobMap> {

  constructor(private visItems: VisTimelineGroups) {
    super();
  }

  add(i: JobMap): void {
    super.add(i);
    this.visItems.add(i.item);
    this.removeEmpty();
  }

  remove(ids: string[]): void {
    super.remove(ids);
    this.visItems.removeItems(ids);
    this.addEmpty();
  }

  clear(): void {
    this.visItems.removeItems(this.getIds());
    super.clear();
    this.addEmpty();
  }

  update(items: JobMap[]): void {
    this.visItems.update(items.map(x => x.item));
  }

  getOrder(initialBossTarget: string): number {
    return this.values.findIndex((value: JobMap) => value.id === initialBossTarget);
  }

  getByName(name: string, actorName?: string): JobMap {
    return this.values.find((b: JobMap) => b.job.name === name && (!actorName || actorName === b.actorName));
  }

  serialize(): { id: string, name: string, order: number, pet: string, filter: any, compact: boolean, collapsed: boolean }[] {
    const map = this.values.map((value: JobMap, index: number) => <any>{
      id: value.id,
      name: value.job.name,
      order: (this.visItems.get(value.id) as any).value,
      pet: value.pet,
      filter: value.filter,
      compact: value.isCompactView,
      collapsed: value.collapsed
    });
    return map;
  }

  private addEmpty(): void {
    if (this.values.length === 0 && !this.visItems.get(0)) {
      this.visItems.add({ id: 0, content: "" });
    }
  }

  private removeEmpty(): void {
    if (this.values.length > 0)
      this.visItems.remove(0);
  }
}

export class BossAttacksHolder extends BaseHolder<string, VisTimelineItem, BossAttackMap> {
  private prefix = "bossAttack_";

  constructor(private visBossItems: VisTimelineItems, private visMainItems: VisTimelineItems) {
    super();
  }

  add(i: BossAttackMap): void {
    super.add(i);
    this.addToBoard(i);
  }

  private addToBoard(i: BossAttackMap) {
    this.visBossItems.add(i.item);
    this.visMainItems.add({
      id: this.prefix + i.id,
      start: i.item.start,
      end: new Date(i.item.start.valueOf() as number + 10),
      type: 'background',
      content: "",
      className: "bossAttack",
      title: i.attack.name
    });
  }

  private removeFromBoard(i: BossAttackMap) {
    this.visBossItems.remove(i.id);
    this.visMainItems.remove(this.prefix + i.id);
  }

  remove(ids: string[]): void {
    super.remove(ids);
    this.visBossItems.removeItems(ids);
    this.visMainItems.removeItems(ids.map(it => this.prefix + it));
  }

  clear(): void {
    const ids = this.getIds();
    this.visBossItems.removeItems(ids);
    this.visMainItems.removeItems(ids.map(it => this.prefix + it));
    super.clear();

  }

  getByName(name: string): BossAttackMap[] {
    return this.filter((b: BossAttackMap) => b.attack.name === name);
  }

  update(itemsToUpdate: BossAttackMap[]): void {
    itemsToUpdate.forEach(it => {
      const v = this.get(it.id);
      v.attack = it.attack;
      v.item = it.item;
    });
    this.visBossItems.update(itemsToUpdate.filter(x => !!this.visBossItems.get(x.id)).map(x => x.item));
    this.visMainItems.update(itemsToUpdate.map(it => {
      const item = this.visMainItems.getById(this.prefix + it.id);
      if (!item) return null;
      item.start = new Date(it.item.start.valueOf() as number);
      item.end = new Date(item.start.valueOf() + 10);
      return item;
    }).filter(x => !!x));
  }

  applyFilter(filter: M.IFilter): void {
    if (!filter) return;
    this.values.forEach(it => {
      let visible = (filter.attacks.isTankBuster && it.attack.isTankBuster);
      visible = visible || (filter.attacks.isAoe && it.attack.isAoe);
      visible = visible || (filter.attacks.isShareDamage && it.attack.isShareDamage);
      if (!visible) {
        visible = filter.attacks.isOther && !(it.attack.isTankBuster || it.attack.isAoe || it.attack.isShareDamage);
      }

      const item = this.visBossItems.getById(it.id);

      if (visible) {
        if (!item) {
          this.addToBoard(it);
        }
      } else {
        if (!!item) {
          this.removeFromBoard(it);
        }
      }

    });
  }

  setVertical(verticalBossAttacks: boolean): void {
    const all = this.getAll();
    all.forEach(it => {
      const b = new ClassNameBuilder(it.item.className);
      b.set([{ value: "vertical", flag: verticalBossAttacks }]);
      it.item.className = b.build();
    });
    this.update(all);
  }

  getAffectedAttacks(start: Date, calculatedDuration: number): string[] {
    return this.filter(it => it.item.start >= start &&
      new Date(start.valueOf() + calculatedDuration * 1000) >= it.item.start).map(it => it.id);
  }
}

export class AbilitySelectionHolder extends BaseHolder<string, VisTimelineItem, AbilitySelectionMap> {
  updateDate(id: string, time: Date): void {
    const found = this.values.find((it: AbilitySelectionMap) => it.id === id);
    if (found === null || found === undefined) {
      console.warn("Unable to update abilityUsage with id:" + id);
      return;
    }
    found.time = time;
  }

  getLength(): number {
    return this.values.length;
  }
}

export class BossDownTimeHolder extends BaseHolder<string, VisTimelineItem, BossDownTimeMap> {
  showInPartyArea = false;

  setShowInPartyArea(showDowntimesInPartyArea: boolean): void {
    this.showInPartyArea = showDowntimesInPartyArea;
    if (this.showInPartyArea) {
      this.values.forEach(it => this.visPartyItems.add(it.item));
    } else {
      this.values.forEach(it => this.visPartyItems.remove(it.id));
    }
  }

  constructor(private visBossItems: VisTimelineItems, private visPartyItems: VisTimelineItems) {
    super();
  }

  add(i: BossDownTimeMap): void {
    super.add(i);
    this.visBossItems.add(i.item);
    if (this.showInPartyArea)
      this.visPartyItems.add(i.item);
  }

  remove(ids: string[]): void {
    super.remove(ids);
    this.visBossItems.removeItems(ids);
    if (this.showInPartyArea)
      this.visPartyItems.removeItems(ids);
  }

  clear(): void {
    this.visBossItems.removeItems(this.getIds());
    if (this.showInPartyArea)
      this.visPartyItems.removeItems(this.getIds());
    super.clear();
  }

  update(items: BossDownTimeMap[]): void {
    this.visBossItems.update(items.map(x => x.item));
    if (this.showInPartyArea)
      this.visPartyItems.update(items.map(x => x.item));
  }

  getById(id: string): BossDownTimeMap {
    return this.values.find((it) => it.endId === id || it.startId === id);
  }
}

export class AbilityUsageHolder extends BaseHolder<string, VisTimelineItem, AbilityUsageMap> {


  constructor(private visItems: VisTimelineItems) {
    super();
  }

  add(i: AbilityUsageMap): void {
    super.add(i);
    this.visItems.add(i.item);
  }

  clear(): void {
    this.visItems.removeItems(this.getIds());
    super.clear();
  }

  checkDatesOverlap(group: number, start: Date, end: Date, id?: string, selectionRegistry?: AbilitySelectionHolder): boolean {
    if (this.values.length > 0) {
      return this.values.some((x: AbilityUsageMap) => (id === undefined || x.id !== id) && x.item.group === group && x.item.start < end && x.item.end > start && (!selectionRegistry || !selectionRegistry.get(x.id)));
    }
    return false;
  }

  remove(ids: string[]): void {
    super.remove(ids);
    this.visItems.remove(ids);
  }

  update(items: AbilityUsageMap[]) {
    this.visItems.update(items.map(x => x.item));
  }

  getByAbility(id: string): AbilityUsageMap[] {
    return this.filter(it => it.item.group === id);
  }

  getSetting(id: string, name: string): any {
    const settings = this.get(id).settings;
    if (settings) {
      const v = settings.find((it) => it.name === name);
      return v;

    }
    return null;
  }


}

export class BuffHeatmapHolder extends BaseHolder<string, VisTimelineItem, HeatmapMap> {

  constructor(private visItems: VisTimelineItems) {
    super();
  }

  add(i: HeatmapMap): void {
    super.add(i);
    this.visItems.add(i.item);
  }

  clear(): void {
    this.visItems.removeItems(this.getIds());
    super.clear();
  }

  remove(ids: string[]): void {
    super.remove(ids);
    this.visItems.remove(ids);
  }

  update(items: HeatmapMap[]) {
    this.visItems.update(items.map(x => x.item));
  }
}

export class BossTargetHolder extends BaseHolder<string, VisTimelineItem, BossTargetMap> {

  constructor(private visItems: VisTimelineItems, private initial: string) {
    super();
  }

  add(i: HeatmapMap): void {
    super.add(i);
    this.visItems.add(i.item);
  }

  clear(): void {
    this.visItems.removeItems(this.getIds());
    super.clear();
  }

  remove(ids: string[]): void {
    super.remove(ids);
    this.visItems.remove(ids);
  }

  update(items: BossTargetMap[]) {
    this.visItems.update(items.map(x => x.item));
  }

  get initialBossTarget(): string { return this.initial; }

  set initialBossTarget(v: string) { this.initial = v; }
}

export class AbilityAvailablityHolder extends BaseHolder<string, VisTimelineItem, AbilityAvailabilityMap> {
  constructor(private visItems: VisTimelineItems) {
    super();
  }

  add(i: AbilityAvailabilityMap): void {
    super.add(i);
    this.visItems.add(i.item);
  }

  clear(): void {
    this.visItems.removeItems(this.getIds());
    super.clear();
  }

  remove(ids: string[]): void {
    super.remove(ids);
    this.visItems.remove(ids);
  }

  update(items: AbilityAvailabilityMap[]) {
    this.visItems.update(items.map(x => x.item));
  }

  removeForAbility(id: string): void {
    const ids = this.filter(it => it.item.group === id);
    this.remove(ids.map(it => it.id));
  }
}


