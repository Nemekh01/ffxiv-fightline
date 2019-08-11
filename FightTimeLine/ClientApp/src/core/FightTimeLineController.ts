import { EventEmitter } from "@angular/core"
import { VisTimelineItem } from "ngx-vis";
import { JobRegistry } from "./JobRegistry"
import * as M from "./Models"
import { UndoRedoController, IUpdateOptions, ICommandData, Command } from "./UndoRedo"
import * as C from "./Commands"
import * as H from "./DataHolders"
import { IdGenerator } from "./Generators"
import { CommandBag } from "./CommandBag"
import { Utils } from "./Utils"
import { CommandFactory } from "./CommandFactory"
import { ExportData } from "./BaseExportTemplate"
import *  as FF from "./FFLogs"
import { AbilityUsagesCollector, BossAttacksCollector, JobPetCollector, StancesCollector } from "./FflogsCollectors/FFLogsCollectors"
import { SettingsService } from "../services/SettingsService"
import { settings } from "./Jobs/index"
import * as _ from "lodash";


export class FightTimeLineController {
  private jobRegistry = new JobRegistry();
  data: IFightData = {};
  private holders: H.Holders;
  private bossGroup: string = "boss";
  private commandStorage: UndoRedoController;
  private commandBag: CommandBag;
  private loading: boolean = false;
  private commandFactory = new CommandFactory(this.startDate);
  hasChanges = false;

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
    },
    attacks: {
      isAoe: true,
      isShareDamage: true,
      isTankBuster: true,
      isOther: true,
      isMagical: true,
      isPhysical: true,
      isUnaspected: true,
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
      jobRegistry: this.jobRegistry,
      update: this.update.bind(this),
      ogcdAttacksAsPoints: (ability: M.IAbility) => (ability.duration === 0 && ability.cooldown === 1) || ((ability.abilityType & M.AbilityType.Damage) === M.AbilityType.Damage && (ability.duration === 0 ? this.view.ogcdAsPoints : false)),
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
    this.data.boss = boss;

    const loadData: IBossSerializeData = JSON.parse(boss.data);

    this.holders.bossAttacks.clear();
    this.holders.bossDownTime.clear();
    this.holders.selectionRegistry.clear();
    this.commandStorage.clear();
    this.commandBag.clear();
    this.commandStorage.turnOffFireExecuted();

    for (let d of loadData.attacks) {
      this.addBossAttack(d.id, Utils.getDateFromOffset(d.ability.offset, this.startDate), d.ability);
    }

    let index = 1;
    for (let d of loadData.downTimes) {
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
    this.commandStorage.turnOnFireExecuted();
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
    this.commandStorage.execute(new C.RemoveJobCommand(id));
  }

  addClassAbility(id: string, map: H.AbilityMap, time: Date, loaded: boolean, settings: string = null): void {
    if (map) {
      if (map.isStance) {
        this.dialogCallBacks.openStanceSelector(map.job.job.stances.map((it) => <M.IContextMenuData>{
          text: it.ability.name,
          icon: it.ability.icon,
          handler: () => {
            this.commandStorage.execute(new C.AddStanceCommand(id || this.idgen.getNextId(M.EntryType.StanceUsage),
              map.job.id,
              it.ability.name,
              time,
              this.holders.stances.getNext(new Date(time.valueOf() as number - 1000)),
              loaded));
          },
          item: null
        }));
      } else {
        if (map.ability.requiresBossTarget && time < this.startDate) return;

        if (!map.ability.overlapStrategy.check({
          ability: map.ability,
          holders: this.holders,
          group: map.id,
          id: id,
          start: time,
          end: new Date(time.valueOf() as number + map.ability.cooldown * 1000),
          selectionRegistry: this.holders.selectionRegistry
        }))
          this.commandStorage.execute(new C.AddAbilityCommand(id || this.idgen.getNextId(M.EntryType.AbilityUsage),
            map.job.id,
            map.ability.name,
            time,
            loaded,
            JSON.parse(settings)));
      }
    }
  }

  addBossAttack(id: string, time: Date, bossAbility: M.IBossAbility): void {
    bossAbility.offset = Utils.formatTime(time);
    this.commandStorage.execute(new C.AddBossAttackCommand(id || this.idgen.getNextId(M.EntryType.BossAttack), bossAbility));
  }

  getLatestBossAttackTime(): Date | null {
    const filtered = this.holders.bossAttacks.getAll();
    if (filtered.length === 0) return null;
    return (filtered.reduce((a, b) => a.start < b.start ? b : a)).start as Date;
  }

  getLatestAbilityUsageTime(): Date | null {
    const filtered = this.holders.itemUsages.getAll();
    if (filtered.length === 0) return this.startDate;
    return (filtered.reduce((a, b) => a.start < b.start ? b : a)).start as Date;
  }

  updateBossAttack(itemid: string): void {
    const map = this.holders.bossAttacks.get(itemid);
    this.dialogCallBacks.openBossAttackAddDialog(Utils.clone<M.IBossAbility>(map.attack),
      (result: { updateAllWithSameName: boolean, data: M.IBossAbility }) => {
        if (result != null) {
          const commands: any[] = [];
          const delta = ((Utils.getDateFromOffset(result.data.offset, this.startDate).valueOf() as number) - (map.start.valueOf() as number));
          commands.push(
            new C.ChangeBossAttackCommand(itemid, result.data, result.updateAllWithSameName)
          );

          if (this.tools.stickyAttacks) {
            const afterMe = this.holders.bossAttacks.filter(it => it.start >= map.start && it.id !== itemid);
            commands.push(...afterMe.map(it => {
              return new C.ChangeBossAttackCommand(it.id, { offset: Utils.formatTime(new Date(it.startAsNumber + delta * 1000)) }, false);
            }));
          }
          this.commandStorage.execute(new C.CombinedCommand(commands));

          this.holders.bossAttacks.applyFilter(this.filter.attacks);
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

    if (!time) return;
    time.setMilliseconds(0);

    if (group === this.bossGroup || group === undefined) {
      if (time >= this.startDate) {
        this.dialogCallBacks.openBossAttackAddDialog({ offset: Utils.formatTime(time) },
          (result: { updateAllWithSameName: boolean, data: M.IBossAbility }) => {
            if (result != null) {
              this.addBossAttack(null, Utils.getDateFromOffset(result.data.offset, this.startDate), result.data);
            }
          });
      }
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

  private notifyRemove(id: string, updateAttacks?: boolean): void {
    console.log("NotifyRemove " + id);
    if (this.idgen.isAbilityUsage(id)) {
      this.commandBag.push(new C.RemoveAbilityCommand(id, updateAttacks));
    } else
      if (this.idgen.isStanceUsage(id)) {
        this.commandBag.push(new C.RemoveStanceCommand(id, updateAttacks));
      } else
        if (this.idgen.isBossAttack(id)) {
          this.commandBag.push(new C.RemoveBossAttackCommand(id, updateAttacks));
        }

    this.commandBag.evaluate(this.holders.selectionRegistry.length, () => this.holders.selectionRegistry.clear());
  }

  notifyMove(item: VisTimelineItem): void {
    const found = this.holders.selectionRegistry.get(item.id.toString());
    if (found) {
      if (this.idgen.isAbilityUsage(item.id)) {
        this.commandBag.push(new C.MoveCommand(item.id.toString(), item.start as Date));
      } else
        if (this.idgen.isStanceUsage(item.id)) {
          this.commandBag.push(new C.MoveStanceCommand(item.id.toString(), item.start as Date, item.end as Date));
        } else
          if (this.idgen.isBossAttack(item.id)) {
            this.commandBag.push(new C.ChangeBossAttackCommand(item.id.toString(), { offset: Utils.formatTime(new Date(item.start)) }, false));
            if (this.tools.stickyAttacks) {
              const afterMe = this.holders.bossAttacks.filter(it => it.start >= found.time && it.id !== item.id);
              this.commandBag.push(new C.CombinedCommand(afterMe.map(it => {
                return new C.ChangeBossAttackCommand(it.id,
                  {
                    offset: Utils.formatTime(new Date((it.start.valueOf() as number) + ((item.start.valueOf() as number) - (found.time.valueOf() as number))))
                  },
                  false);
              })));
            }
          }
    }

    this.commandBag.evaluate(this.holders.selectionRegistry.length);
  }

  updateTools(tools: M.ITools): void {
    this.tools = tools;
  }

  notifySelect(target: string, ids: string[]): void {
    this.holders.selectionRegistry.clear();
    if (!ids) return;
    if (target === "friend") {
      this.holders.itemUsages.getByIds(ids).forEach((it) => {
        this.holders.selectionRegistry.add(new H.AbilitySelectionMap(it.id, it.start));
      });
      this.holders.stances.getByIds(ids).forEach((it) => {
        this.holders.selectionRegistry.add(new H.AbilitySelectionMap(it.id, it.start));
      });
    } else {
      this.holders.bossAttacks.getByIds(ids).forEach((it: H.BossAttackMap) => {
        this.holders.selectionRegistry.add(new H.AbilitySelectionMap(it.id, it.start));
      });
    }
  }

  updateAffectedAbilities(ability: M.IAbility): void {
    if (ability.relatedAbilities !== undefined && ability.relatedAbilities.affects !== undefined) {
      const foundItems = this.holders.itemUsages.filter((x) =>
        ability.relatedAbilities.affects.some(((value: string) => x.ability.ability.name === value) as any));
      this.holders.itemUsages.update(foundItems);
    }
  }

  recalculateBossTargets(): void {
    this.holders.bossTargets.clear();

    if (this.holders.bossTargets.initialBossTarget === this.bossGroup) return;

    const date = new Date(this.startDate);
    date.setMinutes(30);
    const latestBossTime = date;


    const bossTargetChangeAbilities = this.holders.itemUsages
      .filter(a => this.holders.abilities.isBossTargetForGroup(a.ability.id))
      .sort((a, b) => a.startAsNumber - b.startAsNumber);

    let start = Utils.getDateFromOffset(0, this.startDate);
    let target = this.holders.bossTargets.initialBossTarget;

    for (let i = 0; i < bossTargetChangeAbilities.length + 1; i++) {
      if (i < bossTargetChangeAbilities.length) {
        const setting = bossTargetChangeAbilities[i].getSettingData(settings.changesTarget.name);
        if (setting !== null && setting !== undefined && !setting.value) continue;
      }

      let end = i === bossTargetChangeAbilities.length ? latestBossTime : bossTargetChangeAbilities[i].start as Date;
      end = end > latestBossTime ? latestBossTime : end;

      if (start >= end || start > latestBossTime) return;

      const id = this.idgen.getNextId(M.EntryType.BossTarget);
      this.holders.bossTargets.add(new H.BossTargetMap(id, target, { start: start, end: end }));

      if (i < bossTargetChangeAbilities.length) {
        target = bossTargetChangeAbilities[i].ability.job.id;
        start = end;
      }
    }
  }

  canMove(item: VisTimelineItem): boolean {
    const type = this.idgen.getEntryType(item.id);

    switch (type) {
      case M.EntryType.AbilityUsage:
        const ability = this.holders.abilities.get(item.group).ability;
        return (item.end as number) - (item.start as number) === ability.cooldown * 1000 &&
          new Date(item.start) >=
          new Date(this.startDate.valueOf() as number - ((ability.requiresBossTarget ? 0 : 1) * 30 * 1000)) &&
          !ability.overlapStrategy.check({
            ability: ability,
            holders: this.holders,
            id: item.id.toString(),
            group: item.group,
            start: new Date(item.start),
            end: new Date(item.end),
            selectionRegistry: this.holders.selectionRegistry
          });
      case M.EntryType.StanceUsage:
        const sability = this.holders.abilities.get(item.group).ability;
        return (item.end as number) - (item.start as number) > 0 && new Date(item.start) >= new Date(this.startDate.valueOf() as number - 30 * 1000) &&
          !sability.overlapStrategy.check({
            ability: sability,
            holders: this.holders,
            id: item.id.toString(),
            group: item.group,
            start: new Date(item.start),
            end: new Date(item.end),
            selectionRegistry: this.holders.selectionRegistry
          });
      case M.EntryType.BossAttack:
        return new Date(item.start) >= this.startDate;
    }
    return false;
  }

  private update(options: IUpdateOptions): void {
    if (this.loading) return;

    if (options.updateDowntimeMarkers) {
      this.downtimeChanged.emit();
    }

    if (options.updateIntersectedWithBossAttackAtDate) {
      const intersected = this.holders.itemUsages.filter((x) => options.updateIntersectedWithBossAttackAtDate >= x.start && options.updateIntersectedWithBossAttackAtDate <= x.end);
      this.holders.itemUsages.update(intersected);
    }

    if (options.abilityChanged) {
      this.updateAffectedAbilities(options.abilityChanged);
      this.updateBuffHeatmap(this.view.buffmap, options.abilityChanged);
      this.updateAvailability(options.abilityChanged);
    }

    if (options.updateBossTargets || (options.abilityChanged && options.abilityChanged.settings && options.abilityChanged.settings.some((s => s.name === "changesTarget") as any)))
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
        const amap = it.ability;
        if (amap && !amap.hidden && amap.isDamage) {
          const start = it.start;
          const end = new Date((start.valueOf() as number) + this.calculateDuration(it.start, amap) * 1000);
          const id = this.idgen.getNextId(M.EntryType.BuffMap) + "_" + it.id;
          const group = amap.isSelfDamage ? amap.job.id : null;
          this.holders.heatMaps.add(new H.HeatmapMap(id, group, { start: start, end: end }));
        }
      });
    }
  }

  switchInitialBossTarget(map: H.JobMap, addToUndoRedo: boolean): void {
    if (map.job.role === M.Role.Tank) {
      if (addToUndoRedo && this.holders.bossTargets.initialBossTarget !== map.id)
        this.commandStorage.execute(new C.SwitchTargetCommand(this.holders.bossTargets.initialBossTarget, map.id));
      else
        this.holders.bossTargets.initialBossTarget = map.id;
    }
  }

  calculateDuration(start: Date, map: H.AbilityMap): number {
    const ability = map.ability;
    let duration = ability.duration;

    if (ability.relatedAbilities && ability.relatedAbilities.affectedBy) {
      const foundItems = this.holders.itemUsages.filter((x) => {
        const abilityMap = x.ability;
        return (!ability.relatedAbilities.parentOnly || abilityMap.job.id === map.job.id) &&
          ability.relatedAbilities.affectedBy.some(((value: string) => value === abilityMap.ability.name) as any);
      }
      ).sort((a, b) => (a.startAsNumber) - (b.startAsNumber));

      if (foundItems.length > 0) {
        const difference = foundItems.map((found) => {
          const diff = Math.round((found.startAsNumber - start.valueOf()) / 1000);
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
        .filter((x: H.BossAttackMap) => x.attack.isTankBuster && x.start >= start)
        .sort((a, b) => (a.startAsNumber) - (b.startAsNumber));
      if (items.length > 0) {
        const found = items[0];
        const difference = Math.round((found.startAsNumber - start.valueOf()) / 1000);
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

        var hidden = this.holders.abilities.filter(it => it.hidden && it.job.id === event.group);
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
        items.push({ text: "Fill", item: event.group, handler: () => { this.combineAndExecute(this.fillJob(event.group)); } });
        items.push({ text: "Compact view", isCheckBox: true, checked: jobMap.isCompact, item: event.group, handler: () => this.toggleCompactView(event.group) });
      } else {
        const map = this.holders.abilities.get(event.group);
        if (map) {
          items.push({ text: "Fill", item: event.group, handler: () => { this.combineAndExecute(this.fillAbility(event.group)); } });
          items.push({ text: "Hide", item: event.group, handler: () => this.hideAbility(event.group) });
          if (!map.isStance) {
            items.push({
              text: "Compact view",
              isCheckBox: true,
              checked: map.isCompact,
              item: event.group,
              handler: () => this.toggleCompactViewAbility(event.group)
            });
          }
        }
      }
    }
    else if (event.what === "background") {
      const downTimes = this.holders.bossDownTime.filter((it) => it.start <= event.time && it.end >= event.time);
      if (downTimes && downTimes.length > 0) {
        items.push(...downTimes.map((it) => <M.IContextMenuData>{
          text: `Downtime (${Utils.formatTime(it.start as Date)} - ${Utils.formatTime(it.end as Date)})`,
          item: it,
          handler: () => {
            return {
              remove: (() => this.removeDownTime(it.id)).bind(this),
              color: ((color) => this.setDownTimeColor(it.id, color)).bind(this)
            };
          },
          isDowntime: true
        }));
      }
      if (this.view.buffmap) {
        const heatMaps = this.holders.heatMaps.filter((it) => it.start <= event.time && it.end >= event.time);
        if (heatMaps && heatMaps.length > 0) {
          items.push(...heatMaps.map((it) => {
            const id = it.id.toString().match("_(.+)")[1];
            const item = this.holders.itemUsages.get(id).ability;
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
      } else {
        const stance = this.holders.stances.get(event.item);
        if (stance) {
          items.push({
            text: "Split here",
            item: event.item,
            handler: () => this.splitStance(event.item, event.time)
          });
          items.push({
            text: "Fill",
            item: event.item,
            handler: () => this.fillStance(event.item)
          });
        }
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

  combineAndExecute(commands: Command[]): void {
    const combined = new C.CombinedCommand(commands);
    this.commandStorage.execute(combined);
  }

  fillJob(id: string): Command[] {
    const abilities = this.holders.abilities.getByParentId(id).filter(it => !it.hidden && it.ability.cooldown > 10 && !it.filtered);
    return _.flatten(abilities.map(it => this.fillAbility(it.id)));
  }

  fillAbility(id: string): Command[] {
    const map = this.holders.abilities.get(id);
    const usages = this.holders.itemUsages.getByAbility(id);
    const max = _.maxBy(usages, (it: H.AbilityUsageMap) => it.end) as H.AbilityUsageMap;
    const maxValue = max && max.end || this.startDate;
    const count = 6 * 60 / map.ability.cooldown;
    return _.range(count).map(it => new C.AddAbilityCommand(this.idgen.getNextId(M.EntryType.AbilityUsage), map.job.id, map.ability.name, new Date(maxValue.valueOf() + (it * map.ability.cooldown * 1000)), false, null));
  }

  splitStance(id: string, time: any) {
    const stance = this.holders.stances.get(id);
    if (stance) {
      this.commandStorage.execute(new C.CombinedCommand([
        new C.MoveStanceCommand(id, stance.start, new Date(time.valueOf() as number - 1000)),
        new C.AddStanceCommand(this.idgen.getNextId(M.EntryType.StanceUsage),
          stance.ability.job.id,
          stance.stanceAbility.name,
          time,
          this.holders.stances.getNext(time),
          false)
      ]));
    }
  }
  fillStance(id: string) {
    const stance = this.holders.stances.get(id);
    if (stance) {
      const next = this.holders.stances.getNext(stance.end);
      const prev = this.holders.stances.getPrev(stance.start);
      if (next !== stance.end || prev !== stance.start) {
        this.commandStorage.execute(new C.CombinedCommand([
          new C.MoveStanceCommand(id, prev, next)
        ]));
      }
    }
  }


  copy(id: string) {
    const ba = this.holders.bossAttacks.get(id);
    this.copyContainer = Utils.clone(ba.attack);
  }

  paste(time: any) {
    const copy = Utils.clone(this.copyContainer as M.IBossAbility);
    copy.offset = Utils.formatTime(time);

    this.addBossAttack(null, time, copy);
  }

  toggleCompactView(group: string, value?: boolean): void {
    const job = this.holders.jobs.get(group);
    if (value == null || value == undefined)
      job.isCompact = !job.isCompact;
    else
      job.isCompact = value;

    const abilities = this.holders.abilities.getByParentId(group);
    abilities.forEach(it => {
      if (it.isStance) return;
      it.applyData({
        isCompact: job.isCompact
      });

      const items = this.holders.itemUsages.getByAbility(it.id);
      items.forEach(a => {
        a.applyData();
      });
      this.holders.itemUsages.update(items);
    });
    this.holders.abilities.update(abilities);
  }

  hideAbility(group: string) {
    const map = this.holders.abilities.get(group);
    map.applyData({
      hidden: true
    });
    this.holders.abilities.update([map]);
    this.updateBuffHeatmap(this.view.buffmap, map.ability);

  }
  showAbility(group: string) {
    const map = this.holders.abilities.get(group);
    map.applyData({ hidden: false });
    this.holders.abilities.update([map]);
    this.updateBuffHeatmap(this.view.buffmap, map.ability);
  }

  getHolders(): H.Holders {
    return this.holders;
  }

  restoreHidden(group: string) {
    const abilities = this.holders.abilities.getByParentId(group);
    abilities.forEach((it: H.AbilityMap) => {
      it.applyData({ hidden: false });
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
    const duration = this.calculateDuration(new Date(item.start), map);

    const percentage = (duration / ability.cooldown) * 100;
    return this.createItemUsageFrame(percentage);
  }
  createItemUsageFrame(percentage: number): string {
    return `<div class="progress-wrapper-fl"><div class="progress-fl" style = "width:${percentage}%"> </div></div >`;
  }


  tooltipOnItemUpdateTime(item: VisTimelineItem): any {
    if (this.idgen.isStanceUsage(item.id))
      return Utils.formatTime(item.start as Date) + " - " + Utils.formatTime(item.end as Date);
    if (!this.idgen.isAbilityUsage(item.id) && !this.idgen.isBossAttack(item.id)) return undefined;
    return Utils.formatTime(item.start as Date);
  }

  handleDelete(selected: (string | number)[]): any {
    const toRemove = [
      ...this.holders.itemUsages.getByIds(selected).map(x => x.id),
      ...this.holders.stances.getByIds(selected).map(x => x.id),
      ...this.holders.bossAttacks.getByIds(selected).map(x => x.id)
    ];
    for (let r of toRemove.filter(it => !!it)) {
      this.notifyRemove(r, false);
    }
    this.updateBossAttacks();
  }

  updateBossAttacks(data?: string[] | boolean): void {

  }

  serializeFight(): M.IFight {
    const abilitymaps = this.holders.abilities
      .getNonStancesAbilities()
      .map((it) => {
        return {
          name: it.ability.name,
          job: it.job.id,
          compact: it.isCompact,
          hidden: it.hidden
        };
      });
    const abilities = this.holders.itemUsages
      .getAll()
      .map((value) => {
        const a = value.ability;
        if (a) {
          return <IAbilityUsageData>{
            id: value.id,
            job: a.job.id,
            ability: a.ability.name,
            start: Utils.formatTime(value.start),
            settings: JSON.stringify(value.settings),
          };
        }
        return null;
      });
    const stances = this.holders.stances
      .getAll()
      .map((value) => {
        const a = value.ability;
        if (a) {
          return {
            id: value.id,
            job: a.job.id,
            ability: value.ability.ability.name,
            start: Utils.formatTime(value.start),
            end: Utils.formatTime(value.end),
          };
        }
        return null;
      });
    return <M.IFight>{
      id: this.data.fight && this.data.fight.id || "",
      name: this.data.fight && this.data.fight.name || "",
      userName: this.data.fight && this.data.fight.userName || "",
      isPrivate: false,
      data: JSON.stringify(<IFightSerializeData>{
        boss: this.serializeBoss(),
        initialTarget: this.holders.bossTargets.initialBossTarget,
        filter: this.filter,
        importedFrom: this.data.importedFrom,
        view: this.view,
        jobs: this.holders.jobs.serialize(),
        abilityMaps: abilitymaps,
        abilities: abilities,
        stances: stances
      })
    };
  }

  updateBoss(boss: M.IBoss): void {
    this.data.boss = boss;
  }

  updateFight(fight: M.IFight): void {
    this.data.fight = fight;
    this.hasChanges = false;
  }



  loadFight(fight: M.IFight): void {
    if (fight === null || fight === undefined || !fight.data) return;
    const data = JSON.parse(fight.data) as IFightSerializeData;
    try {

      this.loading = true;
      this.commandStorage.turnOffFireExecuted();

      this.data.fight = fight;
      this.data.importedFrom = data.importedFrom;

      this.holders.jobs.clear();
      this.holders.abilities.clear();
      this.holders.itemUsages.clear();
      this.holders.heatMaps.clear();
      this.holders.bossTargets.clear();
      this.holders.selectionRegistry.clear();
      this.commandStorage.clear();
      this.commandBag.clear();


      if (data.boss) {
        this.holders.bossAttacks.clear();
        this.loadBoss(data.boss);
        this.holders.bossAttacks.applyFilter(data.filter.attacks);
      }

      if (data.jobs) {
        for (let j of data.jobs.sort((a, b) => a.order - b.order)) {
          const rid = this.addJob(j.id, j.name, null, j.pet, j.collapsed, false);
          const jh = this.holders.jobs.get(rid);
          if (j.filter)
            jh.filter = j.filter;
          if (j.compact !== undefined && j.compact !== null)
            this.toggleCompactView(j.id, j.compact);
        }
      }

      if (data.abilityMaps) {
        for (let it of data.abilityMaps) {
          let ab = this.holders.abilities.getByParentAndAbility(it.job, it.name);
          if (ab) {
            if (it.hidden !== undefined && it.hidden !== null) {
              if (it.hidden) //todo: optimize this
                this.hideAbility(ab.id);
              else
                this.showAbility(ab.id);
            }
          }
        }
      }

      if (data.abilities)
        for (let a of data.abilities) {
          if (a) {
            const abilityMap = this.holders.abilities.getByParentAndAbility(a.job, a.ability);
            if (abilityMap) {
              this.addClassAbility(a.id,
                abilityMap,
                Utils.getDateFromOffset(a.start, this.startDate),
                true,
                a.settings);
            }

          }
        }
      if (data.stances)
        for (let a of data.stances) {
          if (a) {
            const abilityMap = this.holders.abilities.getStancesAbility(a.job);
            if (abilityMap) {
              this.commandStorage.execute(new C.AddStanceCommand(this.idgen.getNextId(M.EntryType.StanceUsage),
                abilityMap.job.id,
                a.ability,
                Utils.getDateFromOffset(a.start, this.startDate),
                Utils.getDateFromOffset(a.end, this.startDate),
                true));
            }
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
    this.applyView(data.view, true);

    if (data.jobs) {
      for (let j of data.jobs.sort((a, b) => a.order - b.order)) {
        if (j.compact !== undefined && j.compact !== null)
          this.toggleCompactView(j.id, j.compact);
      }
    }

    if (data.abilityMaps) {
      for (let it of data.abilityMaps) {
        let ab = this.holders.abilities.getByParentAndAbility(it.job, it.name);
        if (ab) {
          this.toggleCompactViewAbility(ab.id, it.compact);
        }
      }
    }

    this.setAbilityAvailabilityView(this.view.showAbilityAvailablity);
    this.commandStorage.turnOnFireExecuted();
    this.hasChanges = false;
  }

  serializeBoss(): M.IBoss {

    return <M.IBoss>{
      id: this.data.boss && this.data.boss.id || "",
      name: this.data.boss && this.data.boss.name || "",
      userName: this.data.boss && this.data.boss.userName || "",
      isPrivate: this.data.boss && this.data.boss.isPrivate || false,
      ref: this.data.boss && this.data.boss.ref || "",
      data: JSON.stringify(<IBossSerializeData>{
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
                offset: Utils.formatTime(ab.start),
                syncSettings: ab.attack.syncSettings,
                description: ab.attack.description
              }
            };
          }),
        downTimes: this.holders.bossDownTime.getAll().map((it) => <IDowntimeSerializeData>{
          id: it.id,
          start: Utils.formatTime(it.start),
          end: Utils.formatTime(it.end),
          color: it.color
        })
      })
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
    if (ab.settings !== undefined && ab.settings && ab.settings.length > 0) {
      const item = this.holders.itemUsages.get(itemid);
      this.dialogCallBacks.openAbilityEditDialog({ ability: ab, settings: ab.settings, values: item.settings, jobs: this.holders.jobs.getAll() },
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
      let start = map.start;
      let end = map.end;
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
      return { map: it, start: it.start, end: it.end };
    });
  }


  applyFilter(input?: M.IFilter): void {
    if (this.loading) return;

    console.log("filter requested");
    console.log(input);

    if (input)
      this.filter = input;

    this.holders.abilities.applyFilter(this.filter.abilities, (val) => this.holders.itemUsages.filter((item) => item.ability.id === val).length > 0);
    this.holders.bossAttacks.applyFilter(this.filter.attacks);
  }

  new() {
    this.holders.itemUsages.clear();
    this.holders.jobs.clear();
    this.holders.abilities.clear();
    this.holders.selectionRegistry.clear();
    this.holders.bossAttacks.clear();
    this.holders.bossTargets.clear();
    this.holders.bossDownTime.clear();
    this.holders.stances.clear();
    this.holders.heatMaps.clear();

    this.data = {};

    this.loading = false;

    this.commandStorage.clear();
    this.commandBag.clear();
    this.hasChanges = false;
  }

  importFromFFLogs(key: string, events: FF.Events): any {

    try {

      this.new();
      this.data.importedFrom = key;
      this.loading = true;
      const settings = this.settingsService.load();
      const defaultOrder = ["Tank", "Heal", "DD"];
      const sortOrder = settings.fflogsImport.sortOrderAfterImport;

      events.jobs.sort((a, b) => sortOrder.indexOf(defaultOrder[a.role]) - sortOrder.indexOf(defaultOrder[b.role])).forEach(it => {
        const rid = this.addJob(null, it.job, it.actorName, null, false, false);
        it.rid = rid;
      });

      const collectors = [
        new AbilityUsagesCollector(this.holders.jobs, this.holders.abilities, this.commandStorage, this.idgen, this.startDate),
        new BossAttacksCollector(this.holders.jobs, this.holders.abilities, this.commandStorage, this.idgen, this.startDate, settings),
        new JobPetCollector(this.holders.jobs, this.holders.abilities, this.commandStorage, this.idgen, this.startDate),
        new StancesCollector(this.holders.jobs, this.holders.abilities, this.commandStorage, this.idgen, this.startDate)
      ];


      events.events.forEach((it: FF.AbilityEvent) => {
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
        const map = x.ability;
        if (map.ability.duration === 0 && ((map.ability.abilityType & M.AbilityType.Damage) === M.AbilityType.Damage) || !!map.ability.charges)
          x.applyData({ ogcdAsPoints: view.ogcdAsPoints });
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
    this.holders.bossAttacks.sync(item.id.toString(), new Date(item.start));
  }

  moveSelection(delta: number): void {
    const items = this.holders.selectionRegistry.getAll();
    if (items && items.length) {
      const ids = items.map(it => it.id);
      const toMove: (H.IMoveable & { id: string, ability?: H.AbilityMap, end?: Date })[] = (_.flatten([
        this.holders.itemUsages.getByIds(ids),
        this.holders.stances.getByIds(ids),
        this.holders.bossAttacks.getByIds(ids)
      ]).filter(it => !!it)) as any;

      for (let r of toMove) {
        const newDate = new Date(r.start.valueOf() as number + delta * 1000);
        const newDateEnd = r.end && new Date(r.end.valueOf() as number + delta * 1000);
        const item = { id: r.id, start: newDate, end: newDateEnd, group: r.ability && r.ability.id, content: null };
        if (this.canMove(item)) {
          r.move(delta); //todo: set to exact date
          this.notifyMove(item);
        }
      }
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
      name: this.data.fight && this.data.fight.name || "",
      userName: this.data.fight && this.data.fight.userName || "",
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
                offset: Utils.formatTime(ab.start)
              };
            }),
          downTimes: this.holders.bossDownTime.getAll().map((it) => <any>{
            start: Utils.formatTime(it.start),
            end: Utils.formatTime(it.end)
          })
        },
        bossTargets: this.holders.bossTargets.getAll()
          .map((t) => {
            return {
              target: t.target,
              start: Utils.formatTime(t.start as Date),
              end: Utils.formatTime(t.end as Date)
            };
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
            const a = value.ability;
            return {
              job: a.job.id,
              ability: a.ability.name,
              type: a.ability.abilityType,
              duration: this.calculateDuration(value.start, a),
              start: Utils.formatTime(value.start),
              settings: value.settings,
              icon: value.ability.ability.icon
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
    if (it) {
      it.applyData({ isCompact: compact != undefined ? compact : !it.isCompact });

      const items = this.holders.itemUsages.getByAbility(it.id);
      items.forEach(a => {
        a.applyData();
      });
      this.holders.itemUsages.update(items);

      this.holders.abilities.update([it]);
    }
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
          const deps = it.ability.overlapStrategy.getDependencies();
          let depUsages = null;
          if (deps) {
            depUsages =
              _.flatten(deps.map(ab => this.holders.itemUsages.getByAbility(this.holders.abilities.getByParentAndAbility(it.job.id, ab).id)));
          }
          const usages = [...(depUsages || []), ...this.holders.itemUsages.getByAbility(it.id)].sort((a, b) => (a.startAsNumber) - (b.startAsNumber));
          let prev: H.AbilityUsageMap = null;
          for (let index = 0; index < usages.length; index++) {
            const c = usages[index];
            const start = prev ? (prev.end) : (it.ability.requiresBossTarget ? this.startDate : new Date(this.startDate.valueOf() as number - 30 * 1000));
            const diff = ((c.startAsNumber) - (start.valueOf() as number)) / 1000;
            const av = diff > it.ability.cooldown;
            if (av) {
              const id = this.idgen.getNextId(M.EntryType.AbilityAvailability);
              this.holders.abilityAvailability.add(new H.AbilityAvailabilityMap(id, it,
                {
                  start: start,
                  end: new Date((c.startAsNumber) - it.ability.cooldown * 1000),
                  available: true
                }));
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
          const deps = it.ability.overlapStrategy.getDependencies();
          if (it.ability && it.ability.name === abilityChanged.name || deps && deps.some((d => d === abilityChanged.name) as any)) {
            let depUsages = null;
            if (deps) {
              depUsages =
                _.flatten(deps.map(ab => this.holders.itemUsages.getByAbility(this.holders.abilities.getByParentAndAbility(it.job.id, ab).id)));
            }
            const usages = [...(depUsages || []), ...this.holders.itemUsages.getByAbility(it.id)].sort((a, b) => (a.startAsNumber) - (b.startAsNumber));
            this.holders.abilityAvailability.removeForAbility(it.id);
            let prev: H.AbilityUsageMap = null;
            for (let index = 0; index < usages.length; index++) {
              const c = usages[index];
              const start = prev ? (prev.end) : (it.ability.requiresBossTarget ? this.startDate : new Date(this.startDate.valueOf() as number - 30 * 1000));
              const diff = ((c.startAsNumber) - (start.valueOf() as number)) / 1000;
              const av = diff > it.ability.cooldown;
              if (av) {
                const id = this.idgen.getNextId(M.EntryType.AbilityAvailability);
                this.holders.abilityAvailability.add(new H.AbilityAvailabilityMap(id, it,
                  {
                    start: start,
                    end: new Date((c.startAsNumber) - it.ability.cooldown * 1000),
                    available: true
                  }));
              }
              prev = c;
            }
          }
        });
    }
  }

  toggleJobCollapsed(group) {
    const j = this.holders.jobs.get(group);
    j.applyData({ collapsed: !j.collapsed });
  }

  getItems(items: any[]): any[] {
    return [
      ...this.holders.bossAttacks.getByIds(items),
      ...this.holders.itemUsages.getByIds(items),
      ...this.holders.stances.getByIds(items)
    ];
  }
}

export interface IFightSerializeData {
  initialTarget: string;
  encounter: string;
  importedFrom: string;
  jobs: IJobSerializeData[];
  abilities: IAbilityUsageData[];
  stances: IStanceUsageData[];
  abilityMaps: IAbilityMapData[];
  boss: M.IBoss;
  filter: M.IFilter;
  view: M.IView;
}

export interface IBossSerializeData {
  attacks: IBossAbilityUsageData[],
  downTimes: IDowntimeSerializeData[];
}

export interface IDowntimeSerializeData {
  id: string;
  start: string;
  end: string;
  color: string;
}

export interface IJobSerializeData {
  id: string;
  name: string;
  order: number;
  pet: string;
  filter: M.IAbilityFilter;
  compact: boolean;
  collapsed: boolean;
}

export interface IAbilityUsageData {
  id: string;
  job: string;
  ability: string;
  start: string;
  settings: string;
}

export interface IStanceUsageData {
  id: string;
  job: string;
  ability: string;
  start: string;
  end: string;
}

export interface IAbilityMapData {
  name: string;
  job: string;
  compact: boolean;
  hidden: boolean;
}

export interface IBossAbilityUsageData {
  id: string,
  ability: M.IBossAbility;
}

export interface IDialogs {
  openBossAttackAddDialog: (bossAbility: M.IBossAbility | {}, callBack: (b: any) => void) => void;
  openAbilityEditDialog: (data: { ability: M.IAbility, settings: M.IAbilitySetting[], values: M.IAbilitySettingData[], jobs: H.JobMap[] }, callBack: (b: any) => void) => void;
  openStanceSelector: (data: M.IContextMenuData[]) => void;
}

interface IFightData {
  fight?: M.IFight;
  boss?: M.IBoss;
  importedFrom?: string;
}












