import { Command, ICommandExecutionContext, ICommandData } from "./UndoRedo"
import { IAbility, IBossAbility, IJob, IFilter, IAbilitySettingData, IAbilityFilter, Role, EntryType } from "./Models"
import * as H from "./DataHolders"
import { Utils } from "./Utils"
import { Guid } from "guid-typescript"


interface IAbilityWithUsages { map: H.AbilityMap, usages: H.AbilityUsageMap[] }

export class CombinedCommand implements Command {
  serialize(): ICommandData {
    return {
      name: "combined",
      params: {
        "commands": this.actions.map((it) => it.serialize())
      }
    };
  }

  constructor(private actions: Command[]) {

  }

  reverse(context: ICommandExecutionContext): void {
    [...this.actions].reverse().forEach((it: Command) => it.reverse(context));
  }

  execute(context: ICommandExecutionContext): void {
    this.actions.forEach((it: Command) => it.execute(context));
  }

}

export class AddJobCommand implements Command {


  private filter: IAbilityFilter;

  constructor(private id: string, private jobName: string, private actorName: string, private prevBossTarget: string, private doUpdates: boolean, private pet: string, private collapsed: boolean) {

  }

  serialize(): ICommandData {
    return {
      name: "addJob",
      params: {
        id: this.id,
        jobName: this.jobName,
        prevBossTarget: this.prevBossTarget,
        doUpdates: this.doUpdates,
        actorName: this.actorName,
        pet: this.pet
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    const abilities = context.holders.abilities.getByParentId(this.id);
    for (let sg of abilities) {
      context.holders.abilities.remove([sg.id]);
    }
    const job = context.holders.jobs.get(this.id);
    context.holders.jobs.remove([this.id]);

    this.filter = job.filter;

    context.holders.bossTargets.initialBossTarget = this.prevBossTarget;

    context.update({ updateBossTargets: true, updateBossAttacks: true });
  }

  execute(context: ICommandExecutionContext): void {
    if (!this.id) {
      this.id = context.idGen.getNextId(EntryType.Job);
    }
    const job = context.jobRegistry.getJobs().find(it => it.name === this.jobName);
    const abilityIds = new Array<string>();
    let index = 0;

    const map = {
      id: this.id,
      job: job,
      actorName: this.actorName,
      isCompactView: context.isCompactView(),
      collapsed: this.collapsed
    };
    const jobMap = new H.JobMap(map.id, map.job, { actorName: map.actorName, collapsed: map.collapsed }, this.filter, this.pet);

    if (job.stances && job.stances.length) {
      const nextId = this.id + "_" + index;
      abilityIds.push(nextId);
      context.holders.abilities.add(new H.AbilityMap(
        nextId,
        jobMap,
        null,
        true,
        { hidden: false }
      ));
      index++;
    }

    for (let a of job.abilities) {
      const nextId = this.id + "_" + index;
      abilityIds.push(nextId);
      context.holders.abilities.add(new H.AbilityMap(nextId, jobMap, a, false, { hidden: false }));
      index++;
    }

    jobMap.useAbilities(abilityIds);
    context.holders.jobs.add(jobMap);

    if ((context.holders.bossTargets.initialBossTarget == undefined || context.holders.bossTargets.initialBossTarget === "boss") && map.job.role === Role.Tank)
      context.holders.bossTargets.initialBossTarget = this.id;

    if (this.doUpdates)
      context.update({ updateBossTargets: true });
  }
}

export class RemoveJobCommand implements Command {
  private storedData: { abilityMaps: any, jobMap: any, wasBossTarget: boolean } = <any>{};

  constructor(private id: string) {
  }

  serialize(): ICommandData {
    return {
      name: "removeJob",
      params: {
        id: this.id
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {

    const abilityMaps = this.storedData.abilityMaps as IAbilityWithUsages[];
    const jobMap = this.storedData.jobMap as H.JobMap;
    jobMap.isCompact = context.isCompactView();
    context.holders.jobs.add(jobMap);

    abilityMaps.forEach((it: IAbilityWithUsages) => {
      it.map.applyData({
        isCompact: context.isCompactView()
      });
      context.holders.abilities.add(it.map);
      it.usages.forEach((x) => {
        context.holders.itemUsages.add(new H.AbilityUsageMap(x.id, it.map, x.settings,
          {
            start: x.start,
            loaded: x.loaded,
            showLoaded: context.highlightLoaded(),
            ogcdAsPoints: context.ogcdAttacksAsPoints(it.map.ability)
          }));
      });
    });

    if (this.storedData.wasBossTarget)
      context.holders.bossTargets.initialBossTarget = jobMap.id;

    context.update({ updateBossAttacks: true, updateBossTargets: true });
  }

  execute(context: ICommandExecutionContext): void {
    const abilitiesToStore: Array<IAbilityWithUsages> = [];
    const abilities = context.holders.abilities.getByParentId(this.id);
    const job = context.holders.jobs.get(this.id);

    for (let ab of abilities) {

      const abs = context.holders.itemUsages.getByAbility(ab.id);
      abilitiesToStore.push(<IAbilityWithUsages>{
        map: ab,
        usages: abs
      });

      context.holders.itemUsages.remove(abs.map(value => value.id));
      context.holders.abilities.remove([ab.id]);
    }

    this.storedData.abilityMaps = abilitiesToStore;
    this.storedData.jobMap = job;

    context.holders.jobs.remove([this.id]);

    if (context.holders.bossTargets.initialBossTarget === this.id) {
      this.storedData.wasBossTarget = true;
      context.holders.bossTargets.initialBossTarget = "boss";
    }

    context.update({ updateBossAttacks: true, updateBossTargets: true });

  }
}

export class AddBossAttackCommand implements Command {

  constructor(private id: string, private bossAbility: IBossAbility) {
  }

  serialize(): ICommandData {
    return {
      name: "addBossAttack",
      params: {
        id: this.id,
        attack: this.bossAbility
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    context.holders.bossAttacks.remove([this.id]);
    context.update({ updateBossTargets: true, updateIntersectedWithBossAttackAtDate: Utils.getDateFromOffset(this.bossAbility.offset) });
  }

  execute(context: ICommandExecutionContext): void {
    context.holders.bossAttacks.add(new H.BossAttackMap(this.id,
      {
        attack: this.bossAbility,
        vertical: context.verticalBossAttacks()
      }
    ));

    context.update({ updateBossAttacks: [this.id], updateBossTargets: true, updateIntersectedWithBossAttackAtDate: Utils.getDateFromOffset(this.bossAbility.offset) });
  }
}

export class RemoveBossAttackCommand implements Command {
  private bossAbility: IBossAbility;
  constructor(private id: string, private updateAttacks: boolean) {
  }

  serialize(): ICommandData {
    return {
      name: "removeBossAttack",
      params: {
        id: this.id,
        updateAttacks: this.updateAttacks
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    context.holders.bossAttacks.add(new H.BossAttackMap(this.id,
      {
        attack: this.bossAbility,
        vertical: context.verticalBossAttacks()
      }));

    context.update({ updateBossAttacks: [this.id], updateIntersectedWithBossAttackAtDate: Utils.getDateFromOffset(this.bossAbility.offset) });
  }

  execute(context: ICommandExecutionContext): void {
    const map = context.holders.bossAttacks.get(this.id);
    this.bossAbility = map.attack;
    context.holders.bossAttacks.remove([this.id]);
    context.update({ updateIntersectedWithBossAttackAtDate: Utils.getDateFromOffset(this.bossAbility.offset), updateBossTargets: true });
  }
}

export class ChangeBossAttackCommand implements Command {
  private prevDatas: string;

  constructor(private id: string, private bossAbility: IBossAbility, private updateAllWithSameName: boolean) {
  }

  serialize(): ICommandData {
    return {
      name: "changeBossAttack",
      params: {
        id: this.id,
        attack: this.bossAbility,
        updateAllWithSameName: this.updateAllWithSameName
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    const pbossAttackMaps = JSON.parse(this.prevDatas) as any[];

    const prevData = context.holders.bossAttacks.get(this.id);
    const bossAttackMaps = this.updateAllWithSameName ? context.holders.bossAttacks.getByName(prevData.attack.name) : [prevData];

    bossAttackMaps.forEach((it) => {
      const data = { attack: pbossAttackMaps.find(v => v.id === it.id).attack as IBossAbility };
      it.applyData(data);
    });

    context.holders.bossAttacks.update(bossAttackMaps);
    context.holders.selectionRegistry.updateDate(this.id, Utils.getDateFromOffset(this.bossAbility.offset));

    context.update({ updateBossAttacks: [this.id], updateBossTargets: true });
  }

  execute(context: ICommandExecutionContext): void {
    const prevData = context.holders.bossAttacks.get(this.id);
    const bossAttackMaps = this.updateAllWithSameName ? context.holders.bossAttacks.getByName(prevData.attack.name) : [prevData];
    this.prevDatas = JSON.stringify(bossAttackMaps.map(v => {
      return { id: v.id, attack: v.attack }
    }));

    bossAttackMaps.forEach((it) => {
      if (it.id === this.id)
        it.applyData({ attack: this.bossAbility });
      else
        it.applyData({ attack: { ...this.bossAbility, ...{ offset: it.attack.offset } } });
    });

    context.holders.bossAttacks.update(bossAttackMaps);
    context.holders.selectionRegistry.updateDate(this.id, Utils.getDateFromOffset(this.bossAbility.offset));

    context.update({ updateBossAttacks: [this.id], updateBossTargets: true });
  }
}

export class MoveCommand implements Command {
  private moveFrom: Date;
  private ability: IAbility;

  constructor(private id: string, private moveTo: Date) {
  }

  serialize(): ICommandData {
    return {
      name: "moveAbility",
      params: {
        id: this.id,
        moveTo: Utils.formatTime(this.moveTo)
      }
    };
  }


  reverse(context: ICommandExecutionContext): void {
    const item = context.holders.itemUsages.get(this.id);
    if (item === undefined || item === null) return;

    const affectedAttacks = [
      ...context.holders.bossAttacks.getAffectedAttacks(item.start as Date, this.ability.duration),
      ...context.holders.bossAttacks.getAffectedAttacks(this.moveTo as Date, this.ability.duration)
    ];

    if (item.start !== this.moveFrom) {
      item.applyData({
        start: this.moveFrom,
      });

      context.holders.itemUsages.update([item]);
    }

    context.update({
      abilityChanged: context.holders.itemUsages.get(this.id).ability,
      updateBossAttacks: affectedAttacks
    });
  }

  execute(context: ICommandExecutionContext): void {
    const item = context.holders.itemUsages.get(this.id);
    if (item === undefined || item === null) return;

    this.moveFrom = item.start;
    this.ability = context.holders.itemUsages.get(this.id).ability.ability;
    console.log(`Moving to ${this.moveTo.toString()} from ${this.moveFrom.toString()}`);

    const affectedAttacks = [
      ...context.holders.bossAttacks.getAffectedAttacks(item.start as Date, this.ability.duration),
      ...context.holders.bossAttacks.getAffectedAttacks(this.moveTo as Date, this.ability.duration)
    ];
    if (item.start !== this.moveTo) {
      item.applyData({
        start: this.moveTo
      });
      context.holders.itemUsages.update([item]);
    }
    context.holders.selectionRegistry.updateDate(this.id, this.moveTo);

    context.update({
      abilityChanged: item.ability,
      updateBossAttacks: affectedAttacks
    });
  }
}

interface IAddAbilityParams {
  id: string,
  jobGroup: string,
  abilityName: string,
  time: string,
  loaded: boolean,
  jobActor: string,
  settings: IAbilitySettingData[],
}
interface IAddBossAttackParams {
  id: string,
  attack: IBossAbility
}

export class AddBatchAttacksCommand implements Command {

  constructor(private commands: AddBossAttackCommand[]) {

  }

  reverse(context: ICommandExecutionContext): void {
    const items = this.commands.map(it => {
      const params = it.serialize().params as IAddBossAttackParams;
      return params.id;
    });

    context.holders.bossAttacks.remove(items);
  }

  execute(context: ICommandExecutionContext): void {
    const items = this.commands.map(it => {
      const params = it.serialize().params as IAddBossAttackParams;
      return new H.BossAttackMap(params.id,
        {
          attack: params.attack,
          vertical: context.verticalBossAttacks()
        }
      );
    });

    context.holders.bossAttacks.addRange(items);
  }

  serialize(): ICommandData {
    return {
      name: "addBossAttackBatch",
      params: {
        commands: this.commands.map(it => it.serialize().params)
      }
    }
  }
}

export class AddBatchUsagesCommand implements Command {

  constructor(private commands: AddAbilityCommand[]) {

  }

  reverse(context: ICommandExecutionContext): void {
    const items = this.commands.map(it => {
      const params = it.serialize().params as IAddAbilityParams;
      return params.id;
    });

    context.holders.itemUsages.remove(items);
  }

  execute(context: ICommandExecutionContext): void {
    const items = this.commands.map(it => {
      const params = it.serialize().params as IAddAbilityParams;
      let jobMap: H.JobMap;
      if (params.jobActor)
        jobMap = context.holders.jobs.getByActor(params.jobActor);
      else
        jobMap = context.holders.jobs.get(params.jobGroup);

      const abilityMap = context.holders.abilities.getByParentAndAbility(jobMap.id, params.abilityName);

      const item = new H.AbilityUsageMap(params.id,
        abilityMap,
        params.settings,
        {
          start: Utils.getDateFromOffset(params.time),
          loaded: params.loaded,
          showLoaded: context.highlightLoaded(),
          ogcdAsPoints: context.ogcdAttacksAsPoints(abilityMap.ability)
        });
      return item;
    });

    context.holders.itemUsages.addRange(items);
  }

  serialize(): ICommandData {
    return {
      name: "useAbilityBatch",
      params: {
        commands: this.commands.map(it => it.serialize().params)
      }
    }
  }
}

export class AddAbilityCommand implements Command {

  constructor(private id: string, private jobActor: string, private jobGroup: string, private abilityName: string, private time: Date, private loaded: boolean, private settings: IAbilitySettingData[]) {
  }

  serialize(): ICommandData {
    return {
      name: "useAbility",
      params: {
        id: this.id,
        jobGroup: this.jobGroup,
        abilityName: this.abilityName,
        time: Utils.formatTime(this.time),
        loaded: this.loaded,
        jobActor: this.jobActor,
        settings: this.settings
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    const item = context.holders.itemUsages.get(this.id);
    context.holders.itemUsages.remove([this.id]);

    context.update({
      abilityChanged: item.ability,
      updateBossAttacks: context.holders.bossAttacks.getAffectedAttacks(this.time, item.ability.ability.duration)
    });
  }

  execute(context: ICommandExecutionContext): void {
    if (!this.id) {
      this.id = context.idGen.getNextId(EntryType.AbilityUsage);
    }
    let jobMap: H.JobMap;
    if (this.jobActor)
      jobMap = context.holders.jobs.getByActor(this.jobActor);
    else
      jobMap = context.holders.jobs.get(this.jobGroup);

    const abilityMap = context.holders.abilities.getByParentAndAbility(jobMap.id, this.abilityName);

    const item = new H.AbilityUsageMap(this.id,
      abilityMap,
      this.settings,
      {
        start: this.time,
        loaded: this.loaded,
        showLoaded: context.highlightLoaded(),
        ogcdAsPoints: context.ogcdAttacksAsPoints(abilityMap.ability)
      });

    if (abilityMap.ability.overlapStrategy.check({
      ability: abilityMap.ability,
      holders: context.holders,
      id: this.id,
      group: abilityMap.id,
      start: item.start,
      end: item.end,
      selectionRegistry: context.holders.selectionRegistry
    }))
      return;

    context.holders.itemUsages.add(item);

    context.update({
      abilityChanged: item.ability,
      updateBossAttacks: context.holders.bossAttacks.getAffectedAttacks(this.time, abilityMap.ability.duration)
    });
  }
}

export class RemoveAbilityCommand implements Command {

  private ability: IAbility;
  private time: Date;
  private abilityMapId: string;
  private loaded: boolean;
  private settings: any[];

  constructor(private id: string, private updateBossAttack: boolean) {
  }

  serialize(): ICommandData {
    return {
      name: "removeAbility",
      params: {
        "id": this.id,
        "updateBossAttack": this.updateBossAttack
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    const amap = context.holders.abilities.get(this.abilityMapId);

    context.holders.itemUsages.add(new H.AbilityUsageMap(this.id, amap, this.settings,
      {
        start: this.time,
        loaded: this.loaded,
        showLoaded: context.highlightLoaded(),
        ogcdAsPoints: context.ogcdAttacksAsPoints(this.ability)
      }));
    context.update({
      abilityChanged: amap,
      updateBossAttacks: context.holders.bossAttacks.getAffectedAttacks(this.time as Date, this.ability.duration)
    });
  }

  execute(context: ICommandExecutionContext): void {

    const item = context.holders.itemUsages.get(this.id);
    this.ability = item.ability.ability;
    this.abilityMapId = item.ability.id;
    this.time = item.start;
    this.loaded = item.loaded;
    this.settings = item.settings;
    context.holders.itemUsages.remove([this.id]);
    context.update({
      abilityChanged: item.ability,
      updateBossAttacks: context.holders.bossAttacks.getAffectedAttacks(item.start as Date, item.calculatedDuration)
    });
  }
}

export class SwitchTargetCommand implements Command {
  constructor(private prevTarget: string, private newTarget: string) {
  }

  serialize(): ICommandData {
    return {
      name: "switchTarget",
      params: {
        prevTarget: this.prevTarget,
        newTarget: this.newTarget
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    context.holders.bossTargets.initialBossTarget = this.prevTarget;
    context.update({ updateBossTargets: true });
  }

  execute(context: ICommandExecutionContext): void {
    context.holders.bossTargets.initialBossTarget = this.newTarget;
    context.update({ updateBossTargets: true });
  }
}

export class ChangeAbilitySettingsCommand implements Command {
  private prevSettings: string;

  serialize(): ICommandData {
    return {
      name: "changeAbilitySettings",
      params: {
        id: this.id,
        newSettings: this.newSettings
      }
    };
  }

  constructor(private id: string, private newSettings: any) {
    this.id = id;
    this.newSettings = JSON.stringify(newSettings);
  }

  reverse(context: ICommandExecutionContext): void {
    const item = context.holders.itemUsages.get(this.id);
    item.settings = JSON.parse(this.prevSettings);

    context.update({ updateBossTargets: true });
  }

  execute(context: ICommandExecutionContext): void {
    const item = context.holders.itemUsages.get(this.id);
    this.prevSettings = JSON.stringify(item.settings);
    item.settings = JSON.parse(this.newSettings);

    context.update({ updateBossTargets: true });
  }
}

export class AddDowntimeCommand implements Command {

  serialize(): ICommandData {
    return {
      name: "addDowntime",
      params: {
        id: this.id,
        start: Utils.formatTime(this.data.start),
        end: Utils.formatTime(this.data.end),
        color: this.color
      }
    };
  }

  constructor(private id: string, private data: { start: Date; startId: string; end: Date; endId: string }, private color: string) {
  }

  reverse(context: ICommandExecutionContext): void {
    context.holders.bossDownTime.remove([this.id]);
    context.update({ updateDowntimeMarkers: true });
  }

  execute(context: ICommandExecutionContext): void {

    context.holders.bossDownTime.add(new H.BossDownTimeMap(this.id,
      this.data.startId || Guid.create().toString(),
      this.data.endId || Guid.create().toString(),
      {
        start: this.data.start,
        end: this.data.end,
        color: this.color || ""
      }));

    context.update({ updateDowntimeMarkers: true });
  }
}

export class ChangeDowntimeCommand implements Command {

  private prevStartDate: Date;
  private prevEndDate: Date;

  constructor(private id: string, private start: Date, private end: Date) {
  }

  serialize(): ICommandData {

    return {
      name: "changeDowntime",
      params: {
        id: this.id,
        start: Utils.formatTime(this.start),
        end: Utils.formatTime(this.end)
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    const value = context.holders.bossDownTime.get(this.id);

    value.applyData({ start: this.prevStartDate, end: this.prevEndDate });

    context.holders.bossDownTime.update([value]);

    context.update({ updateDowntimeMarkers: true });
  }

  execute(context: ICommandExecutionContext): void {
    const value = context.holders.bossDownTime.get(this.id);

    this.prevStartDate = value.start;
    this.prevEndDate = value.end;

    value.applyData({ start: this.start, end: this.end });

    context.holders.bossDownTime.update([value]);

    context.update({ updateDowntimeMarkers: true });
  }
}

export class ChangeDowntimeColorCommand implements Command {

  private prevColor: string;


  constructor(private id: string, private newColor: string) {
  }

  serialize(): ICommandData {

    return {
      name: "changeDowntimeColor",
      params: {
        id: this.id,
        newColor: this.newColor
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    const value = context.holders.bossDownTime.get(this.id);

    value.applyData({
      color: this.prevColor
    });

    context.holders.bossDownTime.update([value]);


    context.update({ updateDowntimeMarkers: true });
  }

  execute(context: ICommandExecutionContext): void {
    const value = context.holders.bossDownTime.get(this.id);

    this.prevColor = value.color;
    value.applyData({
      color: this.newColor
    });

    context.holders.bossDownTime.update([value]);

    context.update({ updateDowntimeMarkers: true });
  }
}

export class RemoveDownTimeCommand implements Command {
  private data: { start: Date; startId: string, end: Date, endId: string };
  private prevColor: string;
  constructor(private id: string) { }

  serialize(): ICommandData {
    return {
      name: "removeDowntime",
      params: {
        id: this.id
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    context.holders.bossDownTime.add(new H.BossDownTimeMap(this.id, this.data.startId, this.data.endId,
      {
        start: this.data.start,
        end: this.data.end,
        color: this.prevColor
      }));

    context.update({ updateDowntimeMarkers: true });
  }

  execute(context: ICommandExecutionContext): void {
    const item = context.holders.bossDownTime.get(this.id);;
    this.data = { start: item.start, startId: item.startId, end: item.end, endId: item.endId };
    this.prevColor = item.color;
    context.holders.bossDownTime.remove([this.id]);

    context.update({ updateDowntimeMarkers: true });
  }
}

export class SetJobPetCommand implements Command {
  private prevPet: string;

  constructor(private id: string, private pet: string) {

  }

  reverse(context: ICommandExecutionContext): void {
    const map = context.holders.jobs.get(this.id);
    map.pet = this.prevPet;

    context.update({ updateFilters: true });
  }

  execute(context: ICommandExecutionContext): void {
    const map = context.holders.jobs.get(this.id);
    this.prevPet = map.pet;
    map.pet = this.pet;

    context.update({ updateFilters: true });
  }

  serialize(): ICommandData {
    return {
      name: "setJobPet",
      params: {
        id: this.id,
        pet: this.pet
      }
    }
  }
}

export class AddStanceCommand implements Command {

  constructor(private id: string, private jobGroup: string, private abilityName: string, private start: Date, private end: Date, private loaded: boolean) {

  }

  reverse(context: ICommandExecutionContext): void {
    context.holders.stances.remove([this.id]);
    //const abilityMap = context.holders.abilitiesMapHolder.getStancesAbility(this.jobGroup);
    // context.update({ abilityChanged: abilityMap.ability, updateBossAttacks: true });
  }

  execute(context: ICommandExecutionContext): void {
    const jobmap = context.holders.jobs.get(this.jobGroup);
    const stancesAbility = context.holders.abilities.getStancesAbility(this.jobGroup);
    const ability = jobmap.job.stances.find((it) => it.ability.name === this.abilityName).ability;

    context.holders.stances.add(new H.JobStanceMap(this.id, stancesAbility, ability,
      {
        start: this.start,
        end: this.end,
        loaded: this.loaded,
        showLoaded: context.highlightLoaded()
      }));
  }

  serialize(): ICommandData {
    return {
      name: "addStance",
      params: {
        id: this.id,
        jobGroup: this.jobGroup,
        abilityName: this.abilityName,
        start: Utils.formatTime(this.start),
        end: Utils.formatTime(this.end),
      }
    }
  }
}

export class RemoveStanceCommand implements Command {

  private ability: IAbility;
  private start: Date;
  private end: Date;
  private abilityMapId: string;
  private loaded: boolean;

  constructor(private id: string, private updateBossAttack: boolean) {
  }

  serialize(): ICommandData {
    return {
      name: "removeStance",
      params: {
        id: this.id,
        updateBossAttack: this.updateBossAttack,
        loaded: this.loaded
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    const abMap = context.holders.abilities.get(this.abilityMapId);
    context.holders.stances.add(new H.JobStanceMap(this.id, abMap, this.ability,
      {
        start: this.start,
        end: this.end,
        loaded: this.loaded,
        showLoaded: context.highlightLoaded()
      }));
    //   context.update({ abilityChanged: this.ability, updateBossAttacks: true });
  }

  execute(context: ICommandExecutionContext): void {
    const itemMap = context.holders.stances.get(this.id);

    this.ability = itemMap.stanceAbility;
    this.start = itemMap.start;
    this.end = itemMap.end;
    this.abilityMapId = itemMap.ability.id;
    this.loaded = itemMap.loaded;

    context.holders.stances.remove([this.id]);
    //   context.update({ abilityChanged: this.ability, updateBossAttacks: this.updateBossAttack });
  }
}

export class MoveStanceCommand implements Command {
  private moveStartFrom: Date;
  private moveEndFrom: Date;

  constructor(private id: string, private moveStartTo: Date, private moveEndTo: Date) {
  }

  serialize(): ICommandData {
    return {
      name: "moveStance",
      params: {
        id: this.id,
        moveStartTo: Utils.formatTime(this.moveStartTo),
        moveEndTo: Utils.formatTime(this.moveEndTo),
      }
    };
  }


  reverse(context: ICommandExecutionContext): void {
    const item = context.holders.stances.get(this.id);
    if (item === undefined || item === null) return;

    if (item.start !== this.moveStartFrom || item.end !== this.moveEndFrom) {
      item.applyData({
        start: this.moveStartFrom,
        end: this.moveEndFrom
      });

      context.holders.stances.update([item]);
    }

    //context.update({ updateBossAttacks: true });
  }

  execute(context: ICommandExecutionContext): void {
    const item = context.holders.stances.get(this.id);
    if (item === undefined || item === null) return;

    this.moveStartFrom = item.start;
    this.moveEndFrom = item.end;

    if (item.start !== this.moveStartTo || item.end !== this.moveEndTo) {
      item.applyData({
        start: this.moveStartTo,
        end: this.moveEndTo
      });

      context.holders.stances.update([item]);
    }
    context.holders.selectionRegistry.updateDate(this.id, this.moveStartTo);

    //  context.update({  updateBossAttacks: true });
  }
}


