import { EventEmitter } from "@angular/core"
import { VisTimelineItem } from "ngx-vis";
import { JobRegistry } from "./JobRegistry"
import * as M from "./Models"
import { ClassNameBuilder } from "./ClassNameBuilder";
import { UndoRedoController, IUpdateOptions, ICommandData } from "./UndoRedo"
import * as C from "./Commands"
import * as H from "./DataHolders"
import { IdGenerator } from "./Generators"
import { CommandBag } from "./CommandBag"
import { Utils } from "./Utils"
import { ItemBuilder } from "./Builders"
import { CommandFactory } from "./CommandFactory"
import { ExportData } from "./BaseExportTemplate"
import { Events } from "./FFLogs"
import { AbilityUsagesCollector, BossAttacksCollector, JobPetCollector, StancesCollector } from "./FflogsCollectors/FFLogsCollectors"
import { SettingsService } from "../services/SettingsService"


export class FightTimeLineController {
  private jobRegistry = new JobRegistry();

  private holders: H.Holders;

  private bossGroup: string = "boss";
  private itemBuilder = new ItemBuilder();

  private commandStorage: UndoRedoController;
  private commandBag: CommandBag;
  private loadedBoss: M.IBoss;
  private loadedFight: M.IFight;
  private loading: boolean = false;
  private commandFactory: CommandFactory = new CommandFactory(this.startDate);
  public hasChanges = false;

  private filter: M.IFilter = {
    abilities: {
      damage: true,
      selfDefence: true,
      partyDefence: true,
      healing: true,
      healingBuff: true,
      partyDamageBuff: true,
      selfDamageBuff: true,
      pet: true,
      unused: true,
      utility: true,

    }, attacks: {
      isAoe: true,
      isShareDamage: true,
      isTankBuster: true,
      isOther: true,
      keywords: []
    }
  };
  private view: M.IView = { buffmap: false, ogcdAsPoints: false, showDowntimesInPartyArea: false, verticalBossAttacks: false, compactView: false, highlightLoaded: false, showAbilityAvailablity: false };
  private tools: M.ITools = { downtime: false, stickyAttacks: false };

  public downtimeChanged = new EventEmitter<void>();
  public commandExecuted = new EventEmitter<ICommandData>();

  constructor(private startDate: Date, private idgen: IdGenerator, mainTimeLine: H.ITimelineContainer, bossTimeLine: H.ITimelineContainer, private dialogCallBacks: IDialogs, private settingsService: SettingsService) {
    this.holders = new H.Holders(mainTimeLine, bossTimeLine);

    this.commandStorage = new UndoRedoController({
      idGen: this.idgen,
      holders: this.holders,
      checkDatesOverlap: this.holders.itemUsages.checkDatesOverlap.bind(this.holders.itemUsages),
      jobRegistry: this.jobRegistry,
      itemBuilder: this.itemBuilder,
      update: this.update.bind(this),
      ogcdAttacksAsPoints: (ability: M.IAbility) => ability.abilityType === M.AbilityType.Damage && ability.duration === 0 ? this.view.ogcdAsPoints : false,
      verticalBossAttacks: () => this.view.verticalBossAttacks,
      isCompactView: () => this.view.compactView,
      highlightLoaded: () => this.view.highlightLoaded
    });
    this.commandStorage.changed.subscribe(() => {
      this.canRedoChanged.emit();
      this.canUndoChanged.emit();
      this.hasChanges = true;
    });
    this.commandStorage.commandExecuted.subscribe((data: ICommandData) => {
      this.commandExecuted.emit(data);
    });
    this.commandBag = new CommandBag(this.commandStorage);

    bossTimeLine.groups.add({ id: "boss", content: "BOSS", className: "boss" });
    mainTimeLine.groups.add({ id: 0, content: "", className: "" });
  }

  public loadBoss(boss: M.IBoss): void {
    this.loadedBoss = boss;
    let attacks: IBossAbilityUsageData[];
    let downTimes: any[] = [];

    const loadData: any = JSON.parse(boss.data);
    if (loadData.length === undefined) {
      attacks = loadData.attacks;
      downTimes = loadData.downTimes;
    } else {
      attacks = loadData;
    }

    this.holders.itemUsages.clear();
    this.holders.heatMaps.clear();
    this.holders.bossAttacks.clear();
    this.holders.bossDownTime.clear();
    this.holders.bossTargets.clear();
    this.holders.selectionRegistry.clear();
    this.commandStorage.clear();
    this.commandBag.clear();

    for (let d of attacks) {
      if (d.id)
        this.addBossAttack(d.id, Utils.getDateFromOffset(d.ability.offset, this.startDate), d.ability);
      else {
        const oldd = <M.IBossAbility><any>d;
        this.addBossAttack(null, Utils.getDateFromOffset(oldd.offset, this.startDate), oldd);
      }
    }

    let index = 1;
    for (let d of downTimes) {
      this.addDownTime({
        start: Utils.getDateFromOffset(d.start, this.startDate),
        end: Utils.getDateFromOffset(d.end, this.startDate),
        startId: (index++).toString(),
        endId: (index++).toString(),
      }, d.color);
    }
    this.recalculateBossTargets();
    this.updateBossAttacks();
    this.commandStorage.clear();
    this.applyFilter();
  }



  public getJobs(): M.IJob[] {
    return this.jobRegistry.getJobs();
  }

  public undo() {
    this.commandStorage.undo();
    this.applyFilter();
  }

  public redo() {
    this.commandStorage.redo();
    this.applyFilter();
  }

  addJob(id: string, name: string, actorName?: string, pet?: string, collapsed: boolean = false, doUpdates: boolean = true): string {
    const rid = id || this.idgen.getNextId(M.EntryType.Job);
    this.commandStorage.execute(new C.AddJobCommand(rid, name, actorName, this.holders.bossTargets.initialBossTarget, doUpdates, pet, collapsed));
    if (doUpdates)
      this.applyFilter();
    return rid;
  }

  removeJob(id: string): void {
    console.log("remove job " + id);
    this.commandStorage.execute(new C.RemoveJobCommand(id));
  }

  addClassAbility(id: string, map: H.AbilityMap, time: Date, loaded: boolean, settings: string = null): void {
    if (map) {
      if (map.isStance) {
        const jobMap = this.holders.jobs.get(map.parentId);
        this.dialogCallBacks.openStanceSelector(jobMap.job.stances.map((it) => <M.IContextMenuData>{
          text: it.ability.name,
          icon: it.ability.icon,
          handler: () => {
            this.commandStorage.execute(new C.AddStanceCommand(id || this.idgen.getNextId(M.EntryType.StanceUsage),
              map.parentId,
              it.ability.name,
              time,
              new Date(time.valueOf() + 30000),
              loaded));
          },
          item: null
        }));
      } else {
        this.commandStorage.execute(new C.AddAbilityCommand(id || this.idgen.getNextId(M.EntryType.AbilityUsage),
          map.parentId,
          map.ability.name,
          time,
          loaded,
          JSON.parse(settings)));
      }
    }
  }

  addBossAttack(id: string, time: Date, bossAbility: M.IBossAbility): void {
    this.commandStorage.execute(new C.AddBossAttackCommand(id || this.idgen.getNextId(M.EntryType.BossAttack), time, bossAbility));
  }

  getLatestBossAttackTime(): Date | null {
    const filtered = this.holders.bossAttacks.getAll();
    if (filtered.length === 0) return null;
    return (filtered.reduce((a, b) => a.item.start < b.item.start ? b : a)).item.start as Date;
  }

  getLatestAbilityUsageTime(): Date | null {
    const filtered = this.holders.itemUsages.getAll();
    if (filtered.length === 0) return this.startDate;
    return (filtered.reduce((a, b) => a.item.start < b.item.start ? b : a)).item.start as Date;
  }

  updateBossAttack(itemid: string): void {
    const map = this.holders.bossAttacks.get(itemid);
    console.log("Before dialog " + JSON.stringify(map.attack));
    this.dialogCallBacks.openBossAttackAddDialog(Utils.clone<M.IBossAbility>(map.attack),
      (result: { updateAllWithSameName: boolean, data: M.IBossAbility }) => {
        if (result != null) {
          const delta = ((Utils.getDateFromOffset(result.data.offset, this.startDate).valueOf() as number) -
            (map.item.start.valueOf() as number));
          const command = new C.CombinedCommand([
            new C.MoveBossAttackCommand(Utils.getDateFromOffset(result.data.offset, this.startDate), map.item.start as Date, itemid),
            new C.ChangeBossAttackCommand(itemid, result.data, result.updateAllWithSameName)
          ]);

          this.commandStorage.execute(command);
          if (this.tools.stickyAttacks) {
            const afterMe = this.holders.bossAttacks.filter(it => it.item.start >= map.item.start && it.id !== itemid);
            this.commandStorage.execute(new C.CombinedCommand(afterMe.map(it => {
              return new C.MoveBossAttackCommand(
                new Date((it.item.start.valueOf() as number) + delta),
                new Date(it.item.start),
                it.id);
            }) as any));
          }
          this.holders.bossAttacks.applyFilter(this.filter);
        }
      });
  }

  notifyDoubleClick(itemid: string, group: string, time: Date): void {
    if (itemid !== undefined && itemid !== null) {
      if (this.idgen.isBossAttack(itemid)) {
        this.updateBossAttack(itemid);
      }
      if (this.idgen.isAbilityUsage(itemid)) {
        this.editAbility(itemid, group);
      }
      return;
    }

    if (time === undefined) return;
    time.setMilliseconds(0);
    if (time < Utils.getDateFromOffset(0, this.startDate)) {
      const map = this.holders.abilities.get(group);
      if (map) {
        this.toggleCompactViewAbility(map.id);
      }
      return;
    };

    if (group === this.bossGroup || group === undefined) {
      this.dialogCallBacks.openBossAttackAddDialog({ offset: Utils.formatTime(time) },
        (result: { updateAllWithSameName: boolean, data: M.IBossAbility }) => {
          if (result != null) {
            this.addBossAttack(null, Utils.getDateFromOffset(result.data.offset, this.startDate), result.data);
          }
        });
    }
    else {
      const map = this.holders.abilities.get(group);
      if (map) {
        this.addClassAbility(null, map, time, false);
      } else {
        const job = this.holders.jobs.get(group);
        if (job !== undefined)
          this.switchInitialBossTarget(job, true);
      }
    }
  }

  private notifyRemove(item: VisTimelineItem, updateAttacks?: boolean): void {
    console.log("NotifyRemove " + item.id);
    if (this.idgen.isAbilityUsage(item.id)) {
      this.commandBag.push(new C.RemoveAbilityCommand(item.id.toString(), updateAttacks));
    } else
      if (this.idgen.isStanceUsage(item.id)) {
        this.commandBag.push(new C.RemoveStanceCommand(item.id.toString(), updateAttacks));
      } else
        if (this.idgen.isBossAttack(item.id)) {
          this.commandBag.push(new C.RemoveBossAttackCommand(item.id.toString(), item.start as Date, updateAttacks));
        }

    this.commandBag.evaluate(this.holders.selectionRegistry.getLength(), () => this.holders.selectionRegistry.clear());
  }

  notifyMove(item: VisTimelineItem): void {
    console.log(`NotifyMove for ${item.id}`);
    const found = this.holders.selectionRegistry.get(item.id.toString());
    if (found) {
      if (this.idgen.isAbilityUsage(item.id)) {
        this.commandBag.push(new C.MoveCommand(item.id.toString(), item.start as Date));
      } else
        if (this.idgen.isStanceUsage(item.id)) {
          this.commandBag.push(new C.MoveStanceCommand(item.id.toString(), item.start as Date, item.end as Date));
        } else
          if (this.idgen.isBossAttack(item.id)) {
            this.commandBag.push(new C.MoveBossAttackCommand(item.start as Date,
              found.time,
              item.id.toString()));
            if (this.tools.stickyAttacks) {
              const afterMe = this.holders.bossAttacks.filter(it => it.item.start >= found.time && it.id !== item.id);
              this.commandBag.push(new C.CombinedCommand(afterMe.map(it => {
                return new C.MoveBossAttackCommand(
                  new Date((it.item.start.valueOf() as number) + ((item.start.valueOf() as number) - (found.time.valueOf() as number))),
                  new Date(it.item.start),
                  it.id);
              }) as any));
            }
          }
    }

    this.commandBag.evaluate(this.holders.selectionRegistry.getLength(), null);
  }

  updateTools(tools: M.ITools): void {
    this.tools = tools;
  }

  notifySelect(target: string, ids: string[]): void {
    this.holders.selectionRegistry.clear();
    if (!ids) return;
    if (target === "friend") {
      this.holders.itemUsages.getByIds(ids).forEach((it) => {
        this.holders.selectionRegistry.add({ id: it.id.toString(), item: it.item, time: it.item.start as Date });
      });
      this.holders.stances.getByIds(ids).forEach((it) => {
        this.holders.selectionRegistry.add({ id: it.id.toString(), item: it.item, time: it.item.start as Date });
      });
    } else {
      this.holders.bossAttacks.getByIds(ids).forEach((it: H.BossAttackMap) => {
        this.holders.selectionRegistry.add({ id: it.id.toString(), item: it.item, time: it.item.start as Date });
      });
    }
  }

  updateAffectedAbilities(ability: M.IAbility): void {
    if (ability.relatedAbilities !== undefined && ability.relatedAbilities.affects !== undefined) {
      const foundItems = this.holders.itemUsages.filter((x) =>
        ability.relatedAbilities.affects.some((value: string) => this.holders.abilities.get(x.item.group).ability.name === value));
      this.holders.itemUsages.update(foundItems);
    }
  }

  recalculateBossTargets(): void {
    this.holders.bossTargets.clear();

    if (this.holders.bossTargets.initialBossTarget === this.bossGroup) return;

    let latestBossTime = null; // this.getLatestBossAttackTime();

    const date = new Date(this.startDate);
    date.setMinutes(30);
    latestBossTime = date;


    const bossTargetChangeAbilities = this.holders.itemUsages
      .filter(a => this.holders.abilities.isBossTargetForGroup(a.item.group))
      .sort((a, b) => (a.item.start as number) - (b.item.start as number));

    let start = Utils.getDateFromOffset(0, this.startDate);
    let target = this.holders.bossTargets.initialBossTarget;

    for (let i = 0; i < bossTargetChangeAbilities.length + 1; i++) {
      if (i < bossTargetChangeAbilities.length) {
        const setting = this.holders.itemUsages.getSetting(bossTargetChangeAbilities[i].id.toString(), "changesTarget");
        if (setting !== null && setting !== undefined && !setting.value) continue;
      }

      let end = i === bossTargetChangeAbilities.length ? latestBossTime : bossTargetChangeAbilities[i].item.start as Date;
      end = end > latestBossTime ? latestBossTime : end;

      if (start >= end || start > latestBossTime) return;

      const id = this.idgen.getNextId(M.EntryType.BossTarget);
      this.holders.bossTargets.add({
        id: id,
        ability: null,
        item: this.itemBuilder.createBossTarget(id, start, end, target)
      });

      if (i < bossTargetChangeAbilities.length) {
        target = this.holders.abilities.getParent(bossTargetChangeAbilities[i].item.group);
        start = end;
      }
    }
  }

  canMove(item: any): boolean {
    const type = this.idgen.getEntryType(item.id);

    switch (type) {
      case M.EntryType.AbilityUsage:
        const map = this.holders.abilities.get(item.group);
        const ability = map.ability;
        return item.end - item.start === ability.cooldown * 1000 &&
          new Date(item.start) >= this.startDate &&
          !this.holders.itemUsages.checkDatesOverlap(item.group, item.start, item.end, item.id, this.holders.selectionRegistry);
      case M.EntryType.StanceUsage:
        return item.end - item.start > 0 && new Date(item.start) >= this.startDate &&
          !this.holders.stances.checkDatesOverlap(item.group, item.start, item.end, item.id, this.holders.selectionRegistry);
      case M.EntryType.BossAttack:
        return true;
    }
    return false;
  }

  private update(options: IUpdateOptions): void {
    if (this.loading) return;

    if (options.updateDowntimeMarkers) {
      this.downtimeChanged.emit();
    }

    if (options.updateIntersectedWithBossAttackAtDate) {
      const intersected = this.holders.itemUsages.filter((x) => options.updateIntersectedWithBossAttackAtDate >= x.item.start && options.updateIntersectedWithBossAttackAtDate <= x.item.end);
      this.holders.itemUsages.update(intersected);
    }

    if (options.abilityChanged) {
      this.updateAffectedAbilities(options.abilityChanged);
      this.updateBuffHeatmap(this.view.buffmap, options.abilityChanged);
      this.updateAvailability(options.abilityChanged);
    }

    if (options.updateBossTargets || (options.abilityChanged && (options.abilityChanged as M.IChangeBossTargetAbility).changesBossTarget))
      this.recalculateBossTargets();

    if (options.updateBossAttacks)
      this.updateBossAttacks(options.updateBossAttacks);
    if (options.updateFilters)
      this.applyFilter();

  }

  updateBuffHeatmap(active: boolean, ability: M.IAbility): void {
    this.holders.heatMaps.clear();

    if (active) {
      this.holders.itemUsages.getAll().forEach((it) => {
        const amap = this.holders.abilities.get(it.item.group);
        if (amap && !amap.hidden && amap.isDamage) {
          const start = it.item.start as Date;
          const end = new Date((start.valueOf() as number) + this.calculateDuration(it.item, amap) * 1000);
          const id = this.idgen.getNextId(M.EntryType.BuffMap) + "_" + it.id;
          const group = amap.isSelfDamage ? amap.parentId : null;
          this.holders.heatMaps.add({
            id: id,
            item: this.itemBuilder.createHeatMap(start, end, id, group),
            ability: amap.ability
          });
        }
      });
    }
  }

  switchInitialBossTarget(map: H.JobMap, addToUndoRedo: boolean): void {
    if (map.job.canBeTargetForBoss) {
      if (addToUndoRedo && this.holders.bossTargets.initialBossTarget !== map.id)
        this.commandStorage.execute(new C.SwitchTargetCommand(this.holders.bossTargets.initialBossTarget, map.id));
      else
        this.holders.bossTargets.initialBossTarget = map.id;
    }
  }

  calculateDuration(item: VisTimelineItem, map: H.AbilityMap): number {
    const ability = map.ability;
    let duration = ability.duration;

    if (ability.relatedAbilities && ability.relatedAbilities.affectedBy) {
      const foundItems = this.holders.itemUsages.filter((x) => {
        const abilityMap = this.holders.abilities.get(x.item.group);
        return (!ability.relatedAbilities.parentOnly || abilityMap.parentId === map.parentId) &&
          ability.relatedAbilities.affectedBy.some((value: string) => value === abilityMap.ability.name);
      }
      ).sort((a, b) => (a.item.start as number) - (b.item.start as number));

      if (foundItems.length > 0) {
        const difference = foundItems.map((found) => {
          const diff = Math.round((<number>found.item.start.valueOf() - (<number>item.start.valueOf())) / 1000);
          if (diff >= 0 && diff < ability.duration) {
            return diff;
          }
          return duration;
        }).reduce((a: any, b: any) => a < b ? a : b);


        if (difference >= 0 && difference < ability.duration) {
          duration = difference;
        }
      }
    }

    if (ability.extendDurationOnNextAbility !== undefined) {
      const items = this.holders.bossAttacks
        .filter((x: H.BossAttackMap) => this.holders.bossAttacks.get(x.id.toString()).attack.isTankBuster && x.item.start >= item.start) //todo: check this
        .sort((a, b) => (a.item.start as number) - (b.item.start as number));
      if (items.length > 0) {
        const found = items[0];
        const difference = Math.round((<number>found.item.start.valueOf() - (<number>item.start.valueOf())) / 1000);
        if (difference <= ability.duration) {
          duration = difference + ability.extendDurationOnNextAbility;
        }
      }
    }

    return duration;
  }

  removeDownTime(id: string): void {
    this.commandStorage.execute(new C.RemoveDownTimeCommand(id));
  }

  setDownTimeColor(id: string, color: string): void {
    this.commandStorage.execute(new C.ChangeDowntimeColorCommand(id, color));
  }
  setPet(jobMap: H.JobMap, pet: string) {
    this.commandStorage.execute(new C.SetJobPetCommand(jobMap.id, pet));
  }

  moveUp(group: any) {

  }

  getContextMenuItems(event: any): M.IContextMenuData[] {
    const items: Array<M.IContextMenuData> = [];
    if (event.what === "group-label") {
      const jobMap = this.holders.jobs.get(event.group);
      if (!!jobMap) {
        //        items.push({ text: "Move up", item: event.group, handler: () => this.moveUp(event.group) });
        items.push({ text: "Remove", item: event.group, handler: () => this.removeJob(event.group) });
        if (jobMap.job.pets && jobMap.job.pets.length > 0) {
          items.push({
            text: "Select pet",
            item: event.group,
            pets: jobMap.job.pets.map((it: M.IPet) => <any>{ name: it.name, icon: it.icon, selected: it.name === jobMap.pet, action: () => this.setPet(jobMap, it.name) }),
            handler: () => { }
          });
        }

        var hidden = this.holders.abilities.filter(it => it.hidden && it.parentId === event.group);
        if (hidden && hidden.length > 0) {
          const hid = hidden.map(it => <any>{
            name: it.isStance ? "Stance" : it.ability.name,
            icon: it.isStance ? null : it.ability.icon,
            action: () => this.showAbility(it.id)
          });
          items.push({
            text: "Restore hidden",
            item: event.group,
            hidden: hid.length >= 5 ? [<any>{
              name: "Restore All",
              action: () => this.restoreHidden(event.group)
            }, ...hid] : hid,
            handler: () => { }
          });
        }


        items.push({ text: "Filter", item: event.group, handler: () => { }, filter: jobMap.filter });
        items.push({ text: "Compact view", isCheckBox: true, checked: jobMap.isCompactView, item: event.group, handler: () => this.toggleCompactView(event.group) });
        return items;
      } else {
        const map = this.holders.abilities.get(event.group);
        if (map) {
          items.push({ text: "Hide", item: event.group, handler: () => this.hideAbility(event.group) });
          if (!map.isStance)
            items.push({
              text: "Compact view",
              isCheckBox: true,
              checked: map.isCompact,
              item: event.group,
              handler: () => this.toggleCompactViewAbility(event.group)
            });
          return items;
        }
      }
    }
    else if (event.what === "background") {
      const downTimes = this.holders.bossDownTime.filter((it) => it.item.start <= event.time && it.item.end >= event.time);
      if (downTimes && downTimes.length > 0) {
        items.push(...downTimes.map((it) => <M.IContextMenuData>{
          text: `Downtime (${Utils.formatTime(it.item.start as Date)} - ${Utils.formatTime(it.item.end as Date)})`,
          item: it,
          handler: () => {
            return {
              remove: (() => this.removeDownTime(it.id)).bind(this),
              color: ((color) => this.setDownTimeColor(it.id, color)).bind(this)
            }
          },
          isDowntime: true
        }));
      }
      if (this.view.buffmap) {
        const heatMaps = this.holders.heatMaps.filter((it) => it.item.start <= event.time && it.item.end >= event.time);
        if (heatMaps && heatMaps.length > 0) {
          items.push(...heatMaps.map((it) => {
            const id = it.id.toString().match("_(.+)")[1];
            const item = this.holders.abilities.get(this.holders.itemUsages.get(id).item.group);
            if ((item.ability.abilityType & M.AbilityType.PartyDamageBuff) === M.AbilityType.PartyDamageBuff)
              return <M.IContextMenuData>{
                text: item.ability.name,
                item: it,
                icon: item.ability.icon,
                handler: () => { }
              };
            return null;
          }).filter((it) => !!it));
        }
      }
      const map = this.holders.abilities.get(event.group);
      if (map) {
        items.push({ text: "Hide", item: event.group, handler: () => this.hideAbility(event.group) });
        if (!map.isStance)
          items.push({
            text: "Compact view",
            isCheckBox: true,
            checked: map.isCompact,
            item: event.group,
            handler: () => this.toggleCompactViewAbility(event.group)
          });
      }
      if ((event.group === "boss" || event.group === null) && this.copyContainer) {
        items.push({
          text: "Paste",
          item: event.item,
          handler: () => this.paste(event.time)
        });
      }
    }
    else if (event.what === "item") {
      if (event.group === "boss") {
        items.push({
          text: "Copy",
          item: event.item,
          handler: () => this.copy(event.item)
        });
      }
    }
    else if (!event.what) {
      if (!event.group && this.copyContainer) {
        items.push({
          text: "Paste",
          item: event.item,
          handler: () => this.paste(event.time)
        });
      }
    }
    return items;
  }
  private copyContainer: any;

  copy(id: string) {
    const ba = this.holders.bossAttacks.get(id);
    this.copyContainer = ba.attack;
  }

  paste(time: any) {
    this.addBossAttack(null, time,
      <M.IBossAbility>{
        name: this.copyContainer.name,
        isAoe: this.copyContainer.isAoe,
        isShareDamage: this.copyContainer.isShareDamage,
        isTankBuster: this.copyContainer.isTankBuster,
        type: this.copyContainer.type,
        offset: Utils.formatTime(time)
      });
  }

  toggleCompactView(group: string, value?: boolean): void {
    const job = this.holders.jobs.get(group);
    if (value == null || value == undefined)
      job.isCompactView = !job.isCompactView;
    else
      job.isCompactView = value;

    const abilities = this.holders.abilities.getByParentId(group);
    abilities.forEach(it => {
      if (it.isStance) return;
      it.isCompact = job.isCompactView;
      const ccb = new ClassNameBuilder(it.item.className);
      ccb.set([{ value: "compact", flag: it.isCompact }]);
      it.item.className = ccb.build() || "dummy";
      const items = this.holders.itemUsages.getByAbility(it.id);
      items.forEach(a => {
        const cb = new ClassNameBuilder(a.item.className);
        cb.set([{ value: "compact", flag: job.isCompactView }]);
        a.item.className = cb.build() || "dummy";
      });
      this.holders.itemUsages.update(items);
    });
    this.holders.abilities.update(abilities);
  }

  hideAbility(group: string) {
    const map = this.holders.abilities.get(group);
    map.hidden = true;
    map.item.visible = false;
    this.holders.abilities.update([map]);
    this.updateBuffHeatmap(this.view.buffmap, map.ability);

  }
  showAbility(group: string) {
    const map = this.holders.abilities.get(group);
    map.hidden = false;
    map.item.visible = true;
    this.holders.abilities.update([map]);
    this.updateBuffHeatmap(this.view.buffmap, map.ability);
  }

  getHolders(): H.Holders {
    return this.holders;
  }

  restoreHidden(group: string) {
    const abilities = this.holders.abilities.getByParentId(group);
    abilities.forEach((it: H.AbilityMap) => {
      it.hidden = false;
      it.item.visible = true;
    });

    this.holders.abilities.update(abilities);
    this.updateBuffHeatmap(this.view.buffmap, null);
    this.applyFilter();
  }

  visibleFrameTemplate(item: VisTimelineItem): string {
    if (item == null) return "";
    if (!this.idgen.isAbilityUsage(item.id)) return "";
    const map = this.holders.abilities.get(item.group);
    if (!map) return "";
    const ability = map.ability;
    const duration = this.calculateDuration(item, map);

    const percentage = (duration / ability.cooldown) * 100;
    return this.itemBuilder.createItemUsageFrame(percentage);
  }

  tooltipOnItemUpdateTime(item: VisTimelineItem): any {
    if (this.idgen.isStanceUsage(item.id))
      return Utils.formatTime(item.start as Date) + " - " + Utils.formatTime(item.end as Date);
    if (!this.idgen.isAbilityUsage(item.id) && !this.idgen.isBossAttack(item.id)) return undefined;
    return Utils.formatTime(item.start as Date);
  }

  handleDelete(selected: (string | number)[]): any {
    const toRemove = [
      ...this.holders.itemUsages.getByIds(selected).map(x => x.item),
      ...this.holders.stances.getByIds(selected).map(x => x.item),
      ...this.holders.bossAttacks.getByIds(selected).map(x => x.item)
    ];
    for (let r of toRemove.filter(it => !!it)) {
      this.notifyRemove(r, false);
    }
    this.updateBossAttacks();
  }

  updateBossAttacks(data?: string[] | boolean): void {

  }

  serializeFight(): M.IFight {
    return <M.IFight>{
      id: this.loadedFight && this.loadedFight.id || "",
      name: this.loadedFight && this.loadedFight.name || "",
      author: this.loadedFight && this.loadedFight.author || "",
      userName: this.loadedFight && this.loadedFight.userName || "",
      secret: this.loadedFight && this.loadedFight.secret || "",
      isPrivate: false,
      bossRef: this.loadedFight && this.loadedFight.bossRef || "",
      data: JSON.stringify(<ISerializeData>{
        boss: this.serializeBoss(),
        initialTarget: this.holders.bossTargets.initialBossTarget,
        filter: this.filter,
        view: this.view,
        jobs: this.holders.jobs.serialize(),
        abilityMaps: this.holders.abilities
          .getNonStancesAbilities()
          .map((it) => {
            return {
              name: it.ability.name,
              job: it.parentId,
              compact: it.isCompact,
              hidden: it.hidden
            }
          }),
        abilities: this.holders.itemUsages
          .getAll()
          .map((value) => {
            const a = this.holders.abilities.get(value.item.group);
            if (a) {
              return <IAbilityUsageData>{
                id: value.id,
                job: a.parentId,
                ability: a.ability.name,
                start: Utils.formatTime(new Date(value.item.start.valueOf() as number)),
                settings: JSON.stringify(value.settings),
              };
            }
            return null;
          }),
        stances: this.holders.stances
          .getAll()
          .map((value) => {
            const a = this.holders.abilities.get(value.item.group);
            if (a) {
              return {
                id: value.id,
                job: a.parentId,
                ability: value.abilityName,
                start: Utils.formatTime(new Date(value.item.start.valueOf() as number)),
                end: Utils.formatTime(new Date(value.item.end.valueOf() as number)),
              };
            }
            return null;
          })
      })
    };
  }

  updateBoss(boss: M.IBoss): void {
    this.loadedBoss = boss;
  }

  updateFight(fight: M.IFight): void {
    this.loadedFight = fight;
    this.hasChanges = false;
  }



  loadFight(input: M.IFight): void {
    if (input === null || input === undefined) return;
    const data = JSON.parse(input.data) as ISerializeData;
    try {

      this.loading = true;
      this.commandStorage.turnOffFireExecuted();

      this.loadedFight = input;

      this.holders.jobs.clear();
      this.holders.abilities.clear();
      this.holders.itemUsages.clear();
      this.holders.heatMaps.clear();
      this.holders.bossTargets.clear();
      this.holders.selectionRegistry.clear();
      this.commandStorage.clear();
      this.commandBag.clear();
      if (data.view)
        this.applyView(data.view);


      if (data.boss) {
        this.holders.bossAttacks.clear();
        this.loadBoss(data.boss);
        this.holders.bossAttacks.applyFilter(data.filter);
      }

      if (data.jobs)
        for (let j of data.jobs.sort((a, b) => a.order - b.order)) {
          const rid = this.addJob(j.id, j.name, null, j.pet, j.collapsed, false);
          const jh = this.holders.jobs.get(rid);
          if (j.filter)
            jh.filter = j.filter;
          if (j.compact !== undefined && j.compact !== null)
            this.toggleCompactView(j.id, j.compact);
        }

      if (data.abilityMaps) {
        for (let it of data.abilityMaps) {
          var ab = this.holders.abilities.getByParentAndAbility(it.job, it.name);
          if (it.hidden !== undefined && it.hidden !== null) {
            if (it.hidden)
              this.hideAbility(ab.id);
            else
              this.showAbility(ab.id);
          }
          this.toggleCompactViewAbility(ab.id, it.compact);
        }

      }

      if (data.abilities)
        for (let a of data.abilities) {
          if (a) {
            const abilityMap = this.holders.abilities.getByParentAndAbility(a.job, a.ability);
            this.addClassAbility(a.id, abilityMap, Utils.getDateFromOffset(a.start, this.startDate), true, a.settings);

          }
        }
      if (data.stances)
        for (let a of data.stances) {
          if (a) {
            const abilityMap = this.holders.abilities.getStancesAbility(a.job);
            this.commandStorage.execute(new C.AddStanceCommand(this.idgen.getNextId(M.EntryType.StanceUsage),
              abilityMap.parentId,
              a.ability,
              Utils.getDateFromOffset(a.start, this.startDate), Utils.getDateFromOffset(a.end, this.startDate), true));
          }
        }
      this.filter = data.filter;

    } finally {
      this.loading = false;
      this.commandStorage.clear();
    }
    const jobMap = this.holders.jobs.get(data.initialTarget);
    if (jobMap)
      this.switchInitialBossTarget(jobMap, false);
    this.recalculateBossTargets();
    this.updateBossAttacks();

    this.applyFilter();
    this.applyView(this.view);
    this.setAbilityAvailabilityView(this.view.showAbilityAvailablity);
    this.commandStorage.turnOnFireExecuted();
    this.hasChanges = false;
  }

  serializeBoss(): M.IBoss {

    return <M.IBoss>{
      id: this.loadedBoss && this.loadedBoss.id || "",
      name: this.loadedBoss && this.loadedBoss.name || "",
      author: this.loadedBoss && this.loadedBoss.author || "",
      userName: this.loadedBoss && this.loadedBoss.userName || "",
      secret: this.loadedBoss && this.loadedBoss.secret || "",
      isPrivate: this.loadedBoss && this.loadedBoss.isPrivate || false,
      data: JSON.stringify({
        attacks: this.holders.bossAttacks.getAll()
          .map(ab => {
            return <IBossAbilityUsageData>{
              id: ab.id,
              ability: <M.IBossAbility>{
                name: ab.attack.name,
                type: ab.attack.type,
                isAoe: ab.attack.isAoe,
                isShareDamage: ab.attack.isShareDamage,
                isTankBuster: ab.attack.isTankBuster,
                offset: Utils.formatTime(ab.item.start as Date)
              }
            }
          }),
        downTimes: this.holders.bossDownTime.getAll().map((it) => <any>{
          start: Utils.formatTime(it.item.start as Date),
          end: Utils.formatTime(it.item.end as Date),
          color: it.color
        })
      }),

    };
  }

  get canUndo(): boolean {
    return this.commandStorage.canUndo();
  }

  public canUndoChanged = new EventEmitter<void>();

  get canRedo(): boolean {
    return this.commandStorage.canRedo();
  }

  public canRedoChanged = new EventEmitter<void>();

  addDownTime(window: { start: Date; startId: string, end: Date, endId: string }, color: string): void {
    this.commandStorage.execute(new C.AddDowntimeCommand(this.idgen.getNextId(M.EntryType.BossDownTime), window, color));
  }

  editAbility(itemid: string, group: string): void {
    const ab = this.holders.abilities.get(group).ability;
    if (ab.settings !== undefined && ab.settings != null && ab.settings.length > 0) {
      const item = this.holders.itemUsages.get(itemid);
      this.dialogCallBacks.openAbilityEditDialog({ settings: ab.settings, values: item.settings, jobs: this.holders.jobs.getAll() },
        (b: any) => {
          if (b) {
            this.commandStorage.execute(new C.ChangeAbilitySettingsCommand(itemid, b));
          }
        });
    }
  }

  notifyTimeChanged(id: string, date: Date): void {
    const map = this.holders.bossDownTime.getById(id);
    if (map) {
      let start = map.item.start;
      let end = map.item.end;
      if (map.startId === id) {
        start = date;
      } else {
        end = date;
      }
      this.commandStorage.execute(new C.ChangeDowntimeCommand(map.id, start as Date, end as Date));
    }

  }

  getBossDownTimeMarkers(): { map: H.BossDownTimeMap, start: Date, end: Date }[] {
    return this.holders.bossDownTime.getAll().map((it) => {
      return { map: it, start: it.item.start as Date, end: it.item.end as Date };
    });
  }


  applyFilter(input?: M.IFilter): void {
    if (this.loading) return;

    console.log("filter requested");
    console.log(input);

    if (input)
      this.filter = input;

    this.holders.abilities.applyFilter(this.filter, (val) => this.holders.jobs.get(val), (val) => this.holders.itemUsages.filter((item) => item.item.group === val).length > 0);
    this.holders.bossAttacks.applyFilter(this.filter);
  }

  new() {
    this.holders.itemUsages.clear();
    this.holders.jobs.clear();
    this.holders.abilities.clear();
    this.holders.selectionRegistry.clear();
    this.holders.bossAttacks.clear();
    this.holders.bossTargets.clear();
    this.holders.bossDownTime.clear();
    this.holders.heatMaps.clear();

    this.loadedBoss = null;
    this.loadedFight = null;
    this.loading = false;

    this.commandStorage.clear();
    this.commandBag.clear();
    this.hasChanges = false;
  }

  importFromFFLogs(events: Events): any {

    try {

      this.new();

      this.loading = true;
      const settings = this.settingsService.load();
      const defaultOrder = ["Tank", "Heal", "DD"];
      const sortOrder = settings.fflogsImport.sortOrderAfterImport;

      events.jobs.sort((a, b) => sortOrder.indexOf(defaultOrder[a.role]) - sortOrder.indexOf(defaultOrder[b.role])).forEach(it => this.addJob(null, it.job, it.actorName, null, false, false));

      const collectors = [
        new AbilityUsagesCollector(this.holders.jobs, this.holders.abilities, this.commandStorage, this.idgen, this.startDate),
        new BossAttacksCollector(this.holders.jobs, this.holders.abilities, this.commandStorage, this.idgen, this.startDate),
        new JobPetCollector(this.holders.jobs, this.holders.abilities, this.commandStorage, this.idgen, this.startDate),
        new StancesCollector(this.holders.jobs, this.holders.abilities, this.commandStorage, this.idgen, this.startDate)
      ];


      events.events.forEach((it: any) => {
        if (it.ability) {
          collectors.forEach((c) => c.collect(it, events.jobs, events.start_time));
        }
      });


      collectors.forEach((c) => c.process(events.start_time));

    } catch (e) {
      console.error(e);
    }
    finally {
      this.loading = false;
      this.commandStorage.clear();
      this.hasChanges = false;
    }
    this.holders.bossTargets.initialBossTarget = "boss";
    this.recalculateBossTargets();
    this.updateBossAttacks();

    this.applyView(this.view, true);
    this.applyFilter();
  }

  applyView(view: M.IView, force?: boolean): void {
    if (this.view.ogcdAsPoints !== view.ogcdAsPoints || force) {
      const items = this.holders.itemUsages.getAll();
      items.forEach(x => {
        const map = this.holders.abilities.get(x.item.group);
        if (map.ability.duration === 0)
          x.item.type = view.ogcdAsPoints ? "point" : "range";
      });
      this.holders.itemUsages.update(items);
    }

    if (this.view.buffmap !== view.buffmap || force) {
      this.updateBuffHeatmap(view.buffmap, null);
    }

    if (this.view.showDowntimesInPartyArea !== view.showDowntimesInPartyArea || force) {
      this.holders.bossDownTime.setShowInPartyArea(view.showDowntimesInPartyArea);
    }

    if (this.view.verticalBossAttacks !== view.verticalBossAttacks || force) {
      this.holders.bossAttacks.setVertical(view.verticalBossAttacks);
    }

    if (this.view.compactView !== view.compactView || force) {
      this.setCompactView(view.compactView);
    }

    if (this.view.highlightLoaded !== view.highlightLoaded || force) {
      this.setHighLightLoadedView(view.highlightLoaded);
    }

    if (this.view.showAbilityAvailablity !== view.showAbilityAvailablity || force) {
      this.setAbilityAvailabilityView(view.showAbilityAvailablity);
    }

    this.view = view;
  }

  isJobGroup(group: string): boolean {
    return !!this.holders.jobs.get(group);
  }

  moveBossAttack(item: VisTimelineItem): void {
    const map = this.holders.bossAttacks.get(item.id.toString());
    map.item.start = item.start;
    this.holders.bossAttacks.update([map]);
  }

  moveSelection(delta: number): void {
    const items = this.holders.selectionRegistry.getAll();
    if (items) {
      items.forEach(x => {
        const copy = Utils.clone(x.item);
        copy.start = new Date((x.item.start.valueOf() as number) + delta * 1000);
        if (x.item.end)
          copy.end = new Date((x.item.end.valueOf() as number) + delta * 1000);
        if (this.idgen.isAbilityUsage(x.id) &&
          this.holders.itemUsages.checkDatesOverlap(
            x.item.group,
            new Date(copy.start.valueOf() as number),
            new Date(copy.end.valueOf() as number),
            x.id,
            this.holders.selectionRegistry)) {
          return; //todo: find next free spot
        }

        if (this.idgen.isStanceUsage(x.id) &&
          this.holders.stances.checkDatesOverlap(
            x.item.group,
            new Date(copy.start.valueOf() as number),
            new Date(copy.end.valueOf() as number),
            x.id,
            this.holders.selectionRegistry)) {
          return; //todo: find next free spot
        }

        this.notifyMove(copy);
      });
    }
  }

  execute(data: any): void {
    const command = this.commandFactory.createFromData(data, this.view);
    if (command) {
      this.hasChanges = true;
      this.commandStorage.execute(command, false);
    }
  }

  serializeForExport(): ExportData {
    return <ExportData>{
      name: this.loadedFight && this.loadedFight.name || "",
      userName: this.loadedFight && this.loadedFight.userName || "",
      data: {
        boss: {
          attacks: this.holders.bossAttacks.getAll()
            .map((ab: H.BossAttackMap) => {
              return {
                name: ab.attack.name,
                type: ab.attack.type,
                isAoe: ab.attack.isAoe,
                isShareDamage: ab.attack.isShareDamage,
                isTankBuster: ab.attack.isTankBuster,
                offset: Utils.formatTime(ab.item.start as Date)
              }
            }),
          downTimes: this.holders.bossDownTime.getAll().map((it) => <any>{
            start: Utils.formatTime(it.item.start as Date),
            end: Utils.formatTime(it.item.end as Date)
          })
        },
        bossTargets: this.holders.bossTargets.getAll()
          .map((t) => {
            return {
              target: t.item.group,
              start: Utils.formatTime(t.item.start as Date),
              end: Utils.formatTime(t.item.end as Date)
            }
          }),
        initialTarget: this.holders.bossTargets.initialBossTarget,
        jobs: this.holders.jobs.getAll().map((value: H.JobMap, index: number) => <any>{
          id: value.id,
          name: value.job.name,
          role: value.job.role,
          order: index,
          pet: value.pet,
          icon: value.job.icon
        }),
        abilities: this.holders.itemUsages
          .getAll()
          .map((value) => {
            const a = this.holders.abilities.get(value.item.group);
            return {
              job: a.parentId,
              ability: a.ability.name,
              type: a.ability.abilityType,
              duration: this.calculateDuration(value.item, a),
              start: Utils.formatTime(new Date(value.item.start.valueOf() as number)),
              settings: value.settings,
              icon: value.ability.icon
            };
          })
      }
    };
  }

  setCompactView(compactView: boolean): void {
    this.holders.jobs.getAll().forEach(it => {
      this.toggleCompactView(it.id, compactView);
    });
  }

  toggleCompactViewAbility(id: string, compact?: boolean): void {
    const it = this.holders.abilities.get(id);

    it.isCompact = compact != undefined ? compact : !it.isCompact;
    const ccb = new ClassNameBuilder(it.item.className);
    ccb.set([{ value: "compact", flag: it.isCompact }]);
    it.item.className = ccb.build() || "dummy";
    const items = this.holders.itemUsages.getByAbility(it.id);
    items.forEach(a => {
      const cb = new ClassNameBuilder(a.item.className);
      cb.set([{ value: "compact", flag: it.isCompact }]);
      a.item.className = cb.build() || "dummy";
    });
    this.holders.itemUsages.update(items);

    this.holders.abilities.update([it]);
  }

  setHighLightLoadedView(highlightLoaded: boolean): void {
    this.holders.setHighLightLoadedView(highlightLoaded);
  }

  setAbilityAvailabilityView(showAbilityAvailablity: boolean): void {
    if (showAbilityAvailablity) {
      this.holders.abilities
        .getAll()
        .forEach(it => {
          if (it.isStance) return;
          const usages = this.holders.itemUsages.getByAbility(it.id).sort((a, b) => (a.item.start.valueOf() as number) - (b.item.start.valueOf() as number));
          let prev: H.AbilityUsageMap = null;
          for (let index = 0; index < usages.length; index++) {
            const c = usages[index];
            const start = prev ? (prev.item.end as Date) : (this.startDate);
            const diff = ((c.item.start.valueOf() as number) - (start.valueOf() as number)) / 1000;
            const av = diff > it.ability.cooldown;
            if (av) {
              const id = this.idgen.getNextId(M.EntryType.AbilityAvailability);
              this.holders.abilityAvailability.add({
                ability: it.ability,
                id: id,
                item: this.itemBuilder.createAbilityAvailability(id,
                  it.id,
                  start,
                  new Date((c.item.start.valueOf() as number) - it.ability.cooldown * 1000),
                  true)
              });
            }
            prev = c;
          }
        });
    } else {
      this.holders.abilityAvailability.clear();
    }
  }

  updateAvailability(abilityChanged: M.IAbility): void {
    if (this.view.showAbilityAvailablity) {
      this.holders.abilities
        .getAll()
        .forEach(it => {
          if (it.ability && it.ability.name !== abilityChanged.name) return;
          this.holders.abilityAvailability.removeForAbility(it.id);
          const usages = this.holders.itemUsages.getByAbility(it.id).sort((a: H.AbilityUsageMap, b: H.AbilityUsageMap) => (a.item.start.valueOf() as number) - (b.item.start.valueOf() as number));
          let prev: H.AbilityUsageMap = null;
          for (let index = 0; index < usages.length; index++) {
            const c = usages[index];
            const start = prev ? (prev.item.end as Date) : (this.startDate);
            const diff = ((c.item.start.valueOf() as number) - (start.valueOf() as number)) / 1000;
            const av = diff > it.ability.cooldown;
            if (av) {
              const id = this.idgen.getNextId(M.EntryType.AbilityAvailability);
              this.holders.abilityAvailability.add({
                ability: it.ability,
                id: id,
                item: this.itemBuilder.createAbilityAvailability(id,
                  it.id,
                  start,
                  new Date((c.item.start.valueOf() as number) - it.ability.cooldown * 1000),
                  true)
              });
            }
            prev = c;
          }
        });
    }
  }

  toggleJobCollapsed(group) {
    const j = this.holders.jobs.get(group);
    j.collapsed = !j.collapsed;
  }

  getItems(items: any[]): any[] {
    return [
      ...this.holders.bossAttacks.getByIds(items),
      ...this.holders.itemUsages.getByIds(items)
    ];
  }
}


export interface ISerializeData {

  name: string;
  initialTarget: string;
  jobs: { id: string, name: string, order: number, pet: string, filter: M.IFilter, compact: boolean, collapsed: boolean }[];
  abilities: IAbilityUsageData[];
  stances: any[];
  downTimes: { start: Date, end: Date }[];
  abilityMaps: any;
  boss: M.IBoss;
  filter: M.IFilter;
  view: M.IView;
}

export interface IAbilityUsageData {
  id: string;
  job: string;
  ability: string;
  start: string;
  settings: string;
}

export interface IBossAbilityUsageData {
  id: string,
  ability: M.IBossAbility;
}

export interface IDialogs {
  openBossAttackAddDialog: (bossAbility: M.IBossAbility | {}, callBack: (b: any) => void) => void;
  openAbilityEditDialog: (data: { settings: M.IAbilitySetting[], values: M.IAbilitySettingData[], jobs: H.JobMap[] }, callBack: (b: any) => void) => void;
  openStanceSelector: (data: M.IContextMenuData[]) => void;
}












