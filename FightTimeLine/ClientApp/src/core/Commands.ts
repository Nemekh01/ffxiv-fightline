import { Command, ICommandExecutionContext, ICommandData } from "./UndoRedo"
import { IAbility, IBossAbility, IJob, IFilter, IAbilitySettingData } from "./Models"
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

  constructor(private actions: ReadonlyArray<Command>) {

  }

  reverse(context: ICommandExecutionContext): void {
    [...this.actions].reverse().forEach((it: Command) => it.reverse(context));
  }

  execute(context: ICommandExecutionContext): void {
    this.actions.forEach((it: Command) => it.execute(context));
  }

}

export class AddJobCommand implements Command {


  private filter: IFilter;

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
        pet: this.pet
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    const subgroups = context.holders.abilities.getByParentId(this.id);
    for (let sg of subgroups) {
      context.holders.abilities.remove([sg.id]);
    }
    const job = context.holders.jobs.get(this.id);
    context.holders.jobs.remove([this.id]);

    this.filter = job.filter;

    context.holders.bossTargets.initialBossTarget = this.prevBossTarget;

    context.update({ updateBossTargets: true, updateBossAttacks: true });
  }

  execute(context: ICommandExecutionContext): void {
    const job = context.jobRegistry.getJobs().find((job: IJob) => job.name === this.jobName) as IJob;
    const abilityIds = new Array<string>();
    let index = 0;

    if (job.stances && job.stances.length > 0) {
      const nextId = this.id + "_" + index;
      abilityIds.push(nextId);
      context.holders.abilities.add(new H.AbilityMap({
        id: nextId,
        parentId: this.id,
        ability: null,
        hidden: false,
        isStance: true,
        item: context.itemBuilder.createStances(nextId)
      }));
      index++;
    }

    for (let a of job.abilities) {
      const nextId = this.id + "_" + index;
      abilityIds.push(nextId);

      context.holders.abilities.add(new H.AbilityMap({
        id: nextId,
        parentId: this.id,
        ability: a,
        hidden: false,
        item: context.itemBuilder.createJobAbility(a, nextId, context.isCompactView()),
        isCompact: context.isCompactView()
      }));
      index++;
    }

    const map = <H.JobMap>{
      id: this.id,
      item: context.itemBuilder.createJob(job, this.actorName, this.id, abilityIds, this.collapsed),
      job: job,
      pet: this.pet || job.defaultPet,
      actorName: this.actorName,
      filter: this.filter || {
        abilities: {
          damage: undefined,
          selfDefence: undefined,
          partyDefence: undefined,
          healing: undefined,
          healingBuff: undefined,
          partyDamageBuff: undefined,
          selfDamageBuff: undefined,
          unused: undefined,
          pet: undefined,
          utility: undefined
        }
      },
      isCompactView: context.isCompactView(),
      collapsed: this.collapsed
    };
    context.holders.jobs.add(map);


    if ((context.holders.bossTargets.initialBossTarget == undefined || context.holders.bossTargets.initialBossTarget === "boss") && map.job.canBeTargetForBoss)
      context.holders.bossTargets.initialBossTarget = this.id;

    if (this.doUpdates)
      context.update({ updateBossTargets: true });
  }
}

export class RemoveJobCommand implements Command {
  private storedData: { abilityMaps: string, jobMap: string, wasBossTarget: boolean, actor: string, filter: IFilter, order: number } = <any>{};

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

    const abilityMaps = JSON.parse(this.storedData.abilityMaps) as IAbilityWithUsages[];
    const jobMap = JSON.parse(this.storedData.jobMap) as H.JobMap;
    jobMap.isCompactView = context.isCompactView();
    context.holders.jobs.add(jobMap);

    abilityMaps.forEach((it: IAbilityWithUsages) => {
      it.map.isCompact = context.isCompactView();
      context.holders.abilities.add(it.map);
      it.usages.forEach((x) => {
        x.item.start = new Date(x.item.start.valueOf() as number);
        x.item.end = new Date(x.item.end.valueOf() as number);
        context.holders.itemUsages.add({
          id: x.id,
          calculatedDuration: it.map.ability.duration,
          ability: it.map.ability,
          settings: x.settings,
          item: context.itemBuilder.createAbilityUsage(it.map.ability, x.id, x.item.group, new Date(x.item.start.valueOf() as number), context.ogcdAttacksAsPoints(it.map.ability), it.map.isCompact, context.highlightLoaded() && x.loaded),
          loaded: x.loaded
        });
      });
    });

    if (this.storedData.wasBossTarget)
      context.holders.bossTargets.initialBossTarget = jobMap.id;

    context.update({ updateBossAttacks: true, updateBossTargets: true });
  }

  execute(context: ICommandExecutionContext): void {
    const abilitiesToStore: Array<IAbilityWithUsages> = new Array<IAbilityWithUsages>();
    const abilities = context.holders.abilities.getByParentId(this.id);
    const job = context.holders.jobs.get(this.id);

    for (let ab of abilities) {

      const abs = context.holders.itemUsages.filter((it) => it.item.group === ab.id);
      abilitiesToStore.push(<IAbilityWithUsages>{
        map: ab,
        usages: abs
      });

      context.holders.itemUsages.remove(abs.map(value => value.id));
      context.holders.abilities.remove([ab.id]);
    }

    this.storedData.abilityMaps = JSON.stringify(abilitiesToStore);
    this.storedData.jobMap = JSON.stringify(job);

    context.holders.jobs.remove([this.id]);

    if (context.holders.bossTargets.initialBossTarget === this.id) {
      this.storedData.wasBossTarget = true;
      context.holders.bossTargets.initialBossTarget = "boss";
    }

    context.update({ updateBossAttacks: true, updateBossTargets: true });

  }
}

export class AddBossAttackCommand implements Command {

  constructor(private id: string, private time: Date, private bossAbility: IBossAbility) {
  }

  serialize(): ICommandData {
    return {
      name: "addBossAttack",
      params: {
        id: this.id,
        time: Utils.formatTime(this.time),
        attack: this.bossAbility
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {

    context.holders.bossAttacks.remove([this.id]);
    context.update({ updateBossTargets: true, updateIntersectedWithBossAttackAtDate: this.time });
  }

  execute(context: ICommandExecutionContext): void {
    context.holders.bossAttacks.add({
      id: this.id,
      attack: this.bossAbility,
      item: context.itemBuilder.createBossAttack(this.id, this.bossAbility, this.time, context.verticalBossAttacks())
    });

    context.update({ updateBossAttacks: [this.id], updateBossTargets: true, updateIntersectedWithBossAttackAtDate: this.time });
  }
}

export class RemoveBossAttackCommand implements Command {
  private bossAbility: IBossAbility;
  constructor(private id: string, private time: Date, private updateAttacks: boolean) {
  }

  serialize(): ICommandData {
    return {
      name: "removeBossAttack",
      params: {
        id: this.id,
        time: Utils.formatTime(this.time),
        updateAttacks: this.updateAttacks
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    context.holders.bossAttacks.add({
      id: this.id,
      attack: this.bossAbility,
      item: context.itemBuilder.createBossAttack(this.id, this.bossAbility, this.time, context.verticalBossAttacks())
    });

    context.update({ updateBossAttacks: [this.id], updateIntersectedWithBossAttackAtDate: this.time });
  }

  execute(context: ICommandExecutionContext): void {
    this.bossAbility = context.holders.bossAttacks.get(this.id).attack;
    context.holders.bossAttacks.remove([this.id]);
    context.update({ updateIntersectedWithBossAttackAtDate: this.time, updateBossTargets: true });
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
    const bossAttackMaps = JSON.parse(this.prevDatas) as H.BossAttackMap[];

    bossAttackMaps.forEach((it) => it.item = context.itemBuilder.createBossAttack(it.id, it.attack, new Date(it.item.start.valueOf() as number), context.verticalBossAttacks()));
    context.holders.bossAttacks.update(bossAttackMaps);

    context.update({ updateBossAttacks: [this.id], updateBossTargets: true });
  }

  execute(context: ICommandExecutionContext): void {
    const prevData = context.holders.bossAttacks.get(this.id);
    const bossAttackMaps = this.updateAllWithSameName ? context.holders.bossAttacks.getByName(prevData.attack.name) : [prevData];
    this.prevDatas = JSON.stringify(bossAttackMaps);

    bossAttackMaps.forEach((it) => {
      it.attack = this.bossAbility;
      it.item = context.itemBuilder.createBossAttack(it.id, this.bossAbility, it.item.start as Date, context.verticalBossAttacks());
    });

    context.holders.bossAttacks.update(bossAttackMaps);

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
      ...context.holders.bossAttacks.getAffectedAttacks(item.item.start as Date, this.ability.duration),
      ...context.holders.bossAttacks.getAffectedAttacks(this.moveTo as Date, this.ability.duration)
    ];

    if (item.item.start !== this.moveFrom) {

      item.item.start = this.moveFrom;
      const end = new Date(new Date(this.moveFrom).setSeconds(this.moveFrom.getSeconds() + this.ability.cooldown));
      item.item.end = end;
      item.item.title = "<img class='abilityIcon' src='" + this.ability.icon + "'/>" + Utils.formatTime(new Date(item.item.start)) + " - " + Utils.formatTime(new Date(item.item.end));
      context.holders.itemUsages.update([item]);
    }

    context.update({
      abilityChanged: this.ability,
      updateBossAttacks: affectedAttacks
    });
  }

  execute(context: ICommandExecutionContext): void {
    const item = context.holders.itemUsages.get(this.id);
    if (item === undefined || item === null) return;

    this.moveFrom = new Date(item.item.start as number);
    this.ability = context.holders.abilities.get(context.holders.itemUsages.get(this.id).item.group).ability;
    console.log(`Moving to ${this.moveTo.toString()} from ${this.moveFrom.toString()}`);

    const affectedAttacks = [
      ...context.holders.bossAttacks.getAffectedAttacks(item.item.start as Date, this.ability.duration),
      ...context.holders.bossAttacks.getAffectedAttacks(this.moveTo as Date, this.ability.duration)
    ];
    if (item.item.start !== this.moveTo) {
      item.item.start = this.moveTo;
      const end = new Date(new Date(this.moveTo).setSeconds(this.moveTo.getSeconds() + this.ability.cooldown));
      item.item.end = end;
      item.item.title = "<img class='abilityIcon' src='" + this.ability.icon + "'/>" + Utils.formatTime(new Date(item.item.start)) + " - " + Utils.formatTime(new Date(item.item.end));
      context.holders.itemUsages.update([item]);
    }
    context.holders.selectionRegistry.updateDate(this.id, this.moveTo);

    context.update({
      abilityChanged: this.ability,
      updateBossAttacks: affectedAttacks
    });
  }
}

export class MoveBossAttackCommand implements Command {

  constructor(private moveTo: Date, private moveFrom: Date, private id: string) {
  }

  serialize(): ICommandData {
    return {
      name: "moveBossAttack",
      params: {
        id: this.id,
        moveTo: Utils.formatTime(this.moveTo),
        moveFrom: Utils.formatTime(this.moveFrom)
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    const item = context.holders.bossAttacks.get(this.id);
    if (item.item.start !== this.moveFrom) {
      item.item.start = this.moveFrom;
      item.item.title = Utils.formatTime(new Date(item.item.start));
      item.attack.offset = Utils.formatTime(new Date(this.moveFrom));
      context.holders.bossAttacks.update([item]);
    }
    context.update({ updateBossTargets: true, updateBossAttacks: [this.id], updateIntersectedWithBossAttackAtDate: item.item.start as Date });
  }

  execute(context: ICommandExecutionContext): void {
    const item = context.holders.bossAttacks.get(this.id);
    if (item.item.start !== this.moveTo) {
      item.item.start = this.moveTo;
      item.item.title = Utils.formatTime(new Date(item.item.start));
      item.attack.offset = Utils.formatTime(new Date(item.item.start));
      context.holders.bossAttacks.update([item]);
    }
    context.holders.selectionRegistry.updateDate(this.id, this.moveTo);
    context.update({ updateBossTargets: true, updateBossAttacks: [this.id], updateIntersectedWithBossAttackAtDate: item.item.start as Date });
  }
}

export class AddAbilityCommand implements Command {

  constructor(private id: string, private jobGroup: string, private abilityName: string, private time: Date, private loaded: boolean, private settings: IAbilitySettingData[]) {
  }

  serialize(): ICommandData {
    return {
      name: "useAbility",
      params: {
        id: this.id,
        jobGroup: this.jobGroup,
        abilityName: this.abilityName,
        time: Utils.formatTime(this.time),
        loaded: this.loaded
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    context.holders.itemUsages.remove([this.id]);
    const abilityMap = context.holders.abilities.getByParentAndAbility(this.jobGroup, this.abilityName);
    context.update({
      abilityChanged: abilityMap.ability,
      updateBossAttacks: context.holders.bossAttacks.getAffectedAttacks(this.time, abilityMap.ability.duration)
    });
  }

  execute(context: ICommandExecutionContext): void {

    const abilityMap = context.holders.abilities.getByParentAndAbility(this.jobGroup, this.abilityName);

    const item = context.itemBuilder.createAbilityUsage(
      abilityMap.ability, this.id, abilityMap.id, this.time, context.ogcdAttacksAsPoints(abilityMap.ability), abilityMap.isCompact, context.highlightLoaded() && this.loaded);

    if (context.checkDatesOverlap(abilityMap.id, item.start as Date, item.end as Date))
      return;

    context.holders.itemUsages.add({
      id: this.id,
      calculatedDuration: abilityMap.ability.duration,
      ability: abilityMap.ability,
      settings: this.settings,
      item: item,
      loaded: this.loaded
    });

    context.update({
      abilityChanged: abilityMap.ability,
      updateBossAttacks: context.holders.bossAttacks.getAffectedAttacks(this.time, abilityMap.ability.duration)
    });
  }
}

export class RemoveAbilityCommand implements Command {

  private ability: IAbility;
  private time: Date;
  private abilityMapId: string;
  private loaded: boolean;

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
    const item = context.itemBuilder.createAbilityUsage(this.ability, this.id, this.abilityMapId, this.time, context.ogcdAttacksAsPoints(this.ability), amap.isCompact, context.highlightLoaded() && this.loaded);

    context.holders.itemUsages.add({
      id: this.id,
      calculatedDuration: this.ability.duration,
      ability: this.ability,
      item: item,
      settings: null,
      loaded: this.loaded
    });

    context.update({
      abilityChanged: this.ability,
      updateBossAttacks: context.holders.bossAttacks.getAffectedAttacks(item.start as Date, this.ability.duration)
    });
  }

  execute(context: ICommandExecutionContext): void {


    const item = context.holders.itemUsages.get(this.id);

    this.ability = item.ability;
    this.time = new Date(item.item.start as number);
    this.abilityMapId = item.item.group;
    this.loaded = item.loaded;
    context.holders.itemUsages.remove([this.id]);
    context.update({
      abilityChanged: this.ability,
      updateBossAttacks: context.holders.bossAttacks.getAffectedAttacks(item.item.start as Date, item.calculatedDuration)
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
        end: Utils.formatTime(this.data.end)
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

    context.holders.bossDownTime.add(new H.BossDownTimeMap({
      id: this.id,
      startId: this.data.startId || Guid.create().toString(),
      endId: this.data.endId || Guid.create().toString(),
      color: this.color || "",
      item: context.itemBuilder.createDownTime(this.id, this.data.start, this.data.end, this.color)
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

    const item = value.item;

    item.start = this.prevStartDate;

    item.end = this.prevEndDate;

    context.holders.bossDownTime.update([value]);


    context.update({ updateDowntimeMarkers: true });
  }

  execute(context: ICommandExecutionContext): void {
    const value = context.holders.bossDownTime.get(this.id);
    const item = value.item;

    this.prevStartDate = item.start as Date;
    item.start = this.start;

    this.prevEndDate = item.end as Date;
    item.end = this.end;


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

    value.setColor(this.prevColor);
    context.holders.bossDownTime.update([value]);


    context.update({ updateDowntimeMarkers: true });
  }

  execute(context: ICommandExecutionContext): void {
    const value = context.holders.bossDownTime.get(this.id);

    this.prevColor = value.color;
    value.setColor(this.newColor);

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
    context.holders.bossDownTime.add(new H.BossDownTimeMap({
      id: this.id,
      startId: this.data.startId,
      endId: this.data.endId,
      color: this.prevColor,
      item: context.itemBuilder.createDownTime(this.id, this.data.start, this.data.end, this.prevColor)
    }));

    context.update({ updateDowntimeMarkers: true });
  }

  execute(context: ICommandExecutionContext): void {
    const map = context.holders.bossDownTime.get(this.id);
    const item = map.item;
    this.data = { start: item.start as Date, startId: map.startId, end: item.end as Date, endId: map.endId };
    this.prevColor = map.color;
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

    context.holders.stances.add({
      id: this.id,
      abilityName: ability.name,
      item: context.itemBuilder.createStanceUsage(ability, this.id, stancesAbility.id, this.start, this.end, context.highlightLoaded() && this.loaded),
      loaded: this.loaded
    });
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
    const item = context.itemBuilder.createStanceUsage(this.ability, this.id, this.abilityMapId, this.start, this.end, context.highlightLoaded() || this.loaded);

    context.holders.stances.add({
      id: this.id,
      abilityName: this.ability.name,
      item: item,
      loaded: this.loaded
    });

    //   context.update({ abilityChanged: this.ability, updateBossAttacks: true });
  }

  execute(context: ICommandExecutionContext): void {
    const itemMap = context.holders.stances.get(this.id);
    const abilityMap = context.holders.abilities.get(itemMap.item.group);

    this.ability = context.holders.jobs.get(abilityMap.parentId).job.stances.find((it) => it.ability.name === itemMap.abilityName).ability;
    this.start = new Date(itemMap.item.start as number);
    this.end = new Date(itemMap.item.end as number);
    this.abilityMapId = abilityMap.id;
    this.loaded = itemMap.loaded;

    context.holders.stances.remove([this.id]);
    //   context.update({ abilityChanged: this.ability, updateBossAttacks: this.updateBossAttack });
  }
}

export class MoveStanceCommand implements Command {
  private moveStartFrom: Date;
  private moveEndFrom: Date;
  private abilityName: string;

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

    if (item.item.start !== this.moveStartFrom || item.item.end !== this.moveEndFrom) {
      item.item.start = this.moveStartFrom;
      item.item.end = this.moveEndFrom;
      const stance = context.holders.stances.get(this.id);
      const ab = context.holders.abilities.get(stance.item.group);
      const job = context.holders.jobs.get(ab.parentId);
      const ability = context.jobRegistry.getStanecAbilityForJob(job.job.name, stance.abilityName);
      //item.item.title = this.abilityName + " " + Utils.formatTime(new Date(item.item.start)) + " - " + Utils.formatTime(new Date(item.item.end));
      item.item.title = `<img class='abilityIcon' src='${ability.icon}'/>${ability.name}  ${Utils.formatTime(new Date(item.item.start))} - ${Utils.formatTime(new Date(item.item.end))}`;
      context.holders.stances.update([item]);
    }

    //context.update({ updateBossAttacks: true });
  }

  execute(context: ICommandExecutionContext): void {
    const item = context.holders.stances.get(this.id);
    if (item === undefined || item === null) return;
     
    this.moveStartFrom = new Date(item.item.start as number);
    this.moveEndFrom = new Date(item.item.end as number);

    if (item.item.start !== this.moveStartTo || item.item.end !== this.moveEndTo) {

      this.abilityName = item.abilityName;
      const ab = context.holders.abilities.get(item.item.group);
      const job = context.holders.jobs.get(ab.parentId);
      const ability = context.jobRegistry.getStanecAbilityForJob(job.job.name, item.abilityName);

      item.item.start = this.moveStartTo;
      item.item.end = this.moveEndTo;
      //item.item.title = this.abilityName + " " + Utils.formatTime(new Date(item.item.start)) + " - " + Utils.formatTime(new Date(item.item.end));
      item.item.title = `<img class='abilityIcon' src='${ability.icon}'/>${ability.name}  ${Utils.formatTime(new Date(item.item.start))} - ${Utils.formatTime(new Date(item.item.end))}`;
      
      context.holders.stances.update([item]);
    }
    context.holders.selectionRegistry.updateDate(this.id, this.moveStartTo);

    //  context.update({  updateBossAttacks: true });
  }
}


