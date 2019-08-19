import { JobsMapHolder, AbilitiesMapHolder } from "../DataHolders"
import { UndoRedoController, Command } from "../UndoRedo"
import { IdGenerator } from "../Generators"
import * as M from "../Models"
import * as S from "../../services/SettingsService"
import { Utils } from "../Utils"
import { AddAbilityCommand, AddStanceCommand, AddBossAttackCommand, AddBatchUsagesCommand, AddBatchAttacksCommand } from "../Commands"
import * as FF from "../FFLogs"
import * as Jobregistryserviceinterface from "../../services/jobregistry.service-interface";


export interface IFFLogsCollector {
  collect(data: FF.AbilityEvent, jobs: FF.IJobInfo[], startTime: number): void;
  process(startTime: number): void;
}

export class AbilityUsagesCollector implements IFFLogsCollector {
  constructor(private jobRegistry: Jobregistryserviceinterface.IJobRegistryService, private commandStorage: Command[], private idgen: IdGenerator, private startDate: Date) {

  }

  private commands: AddAbilityCommand[] = [];

  detectAbility(job: M.IJob, event: any): { offset: number, name: string } {
    const data = job.abilities.map(a => a.detectStrategy.process(event)).filter(a => !!a);
    if (data.length > 1)
      throw Error("More then 1 ability");
    return data[0];
  }

  public getSettingOfType(ability: M.IAbility, type: string): M.IAbilitySetting {
    return ability.settings && ability.settings.find(it => it.type === type);
  }

  collect(data: FF.AbilityEvent, jobs: FF.IJobInfo[], startTime: number): void {
    
    const foundJob = jobs.find(it1 => it1.id.some(((it2: any) => it2 === data.sourceID) as any));
    if (!foundJob) return;

    const job = this.jobRegistry.getJob(foundJob.job);

    const detectedAbility = this.detectAbility(job, data);
    if (!detectedAbility) return;

    const ability = this.jobRegistry.getAbilityForJob(job.name, detectedAbility.name);
    if (!ability) return;

    const settingsData: M.IAbilitySettingData[] = [];
    const pty = this.getSettingOfType(ability, 'partyMember');
    if (pty) {
      const target = jobs.find(it1 => it1.id.some(((it2: any) => it2 === data.targetID) as any));
      if (target) {
        settingsData.push({
          name: pty.name,
          value: target.rid
        });
      }
    }
    this.commands.push(new AddAbilityCommand(this.idgen.getNextId(M.EntryType.AbilityUsage),
      foundJob.actorName,
      null,
      ability.name,
      Utils.getDateFromOffset((detectedAbility.offset - startTime) / 1000, this.startDate),
      true,
      settingsData
    ));
  }

  process(startTime: number): void {
    this.commandStorage.push(new AddBatchUsagesCommand(this.commands));
  }
}

export class JobPetCollector implements IFFLogsCollector {
  constructor(private jobsMapHolder: JobsMapHolder) {

  }

  collect(data: FF.AbilityEvent, jobs: FF.IJobInfo[], startTime: number): void {
    if (data.sourceIsFriendly) {
      const foundJob = jobs.find(it1 => it1.id.some(((it2: any) => it2 === data.sourceID) as any));
      if (foundJob) {
        const jobMap = this.jobsMapHolder.getByName(foundJob.job, foundJob.actorName);
        if (!jobMap.pet && jobMap.job.pets && jobMap.job.pets.length > 0) {
          const peta = jobMap.job.abilities.find(
            am => (am.abilityType & M.AbilityType.Pet) === M.AbilityType.Pet && am.name === data.ability.name);
          if (peta) {
            jobMap.pet = peta.pet;
          }
        }
      }
    }
  }

  process(startTime: number): void { }
}

export class StancesCollector implements IFFLogsCollector {

  private stances: { [id: string]: Array<any> } = {};
  constructor(private jobsMapHolder: JobsMapHolder, private commandStorage: Command[], private idgen: IdGenerator, private startDate: Date) {

  }

  collect(data: FF.AbilityEvent, jobs: FF.IJobInfo[], startTime: number): void {
    if (data.sourceIsFriendly) {
      const foundJob = jobs.find(it1 => it1.id.some(((it2: any) => it2 === data.sourceID) as any));
      if (foundJob) {
        const jobMap = this.jobsMapHolder.getByName(foundJob.job, foundJob.actorName);
        if ((data.type === "applybuff" || data.type === "removebuff") && jobMap.job.stances && jobMap.job.stances.length > 0) {
          const stance = jobMap.job.stances.find((x) => x.ability.name === data.ability.name);
          if (stance) {
            let g = this.stances[jobMap.id];
            if (!g) {
              this.stances[jobMap.id] = new Array<any>();
              g = this.stances[jobMap.id];
            }
            g.push(data);
          }
        }
      }
    }
  }

  process(startTime: number): void {
    Object.keys(this.stances).forEach((k: string) => {
      const cmp = (a: any, b: any) =>  a - b; ;
      const eventToNmber = (a: string) => {
        if (a === "removebuff") return -1;
        return 1;
      };

      const arr = this.stances[k].sort((a, b) => cmp(a.timestamp, b.timestamp) || cmp(eventToNmber(a.type), eventToNmber(b.type)));
      let start: Date = this.startDate;
      let ability: string = null;
      for (var v of arr) {
        if (v.type === "applybuff") {
          start = Utils.getDateFromOffset((v.timestamp - startTime) / 1000, this.startDate);
          ability = v.ability.name;
        } else {
          this.commandStorage.push(new AddStanceCommand(this.idgen.getNextId(M.EntryType.StanceUsage), k, ability || v.ability.name, start, Utils.getDateFromOffset((v.timestamp - startTime) / 1000, this.startDate), true));
          start = this.startDate;
        }
      }
      if (start !== this.startDate) {
        this.commandStorage.push(new AddStanceCommand(this.idgen.getNextId(M.EntryType.StanceUsage), k, ability, start, new Date(this.startDate.valueOf() + 30 * 60 * 1000), true));
      }
    });
  }
}

export class BossAttacksCollector implements IFFLogsCollector {

  private bossAttacks: { [id: string]: Array<FF.AbilityEvent> } = {};
  constructor(private commandStorage: Command[], private idgen: IdGenerator, private startDate: Date, private settings: S.ISettings) {

  }

  collect(data: FF.AbilityEvent, jobs: FF.IJobInfo[], startTime: number): void {
    if (data.type !== this.settings.fflogsImport.bossAttacksSource) return;
    
    if (data.sourceIsFriendly) return;

    const key = data.ability.name + "_" + Math.trunc(data.timestamp / 1000);
    let g = this.bossAttacks[key];
    if (!g) {
      this.bossAttacks[key] = new Array<any>();
      g = this.bossAttacks[key];
    }
    g.push(data);
  }

  process(startTime: number): void {
    const tbs = Object.keys(this.bossAttacks).map(it => this.bossAttacks[it]).filter((arr) => {
      return arr.find(it => {
        if (FF.isDamageEvent(it)) {
          return (it.amount + it.blocked > 0.6 * it.targetResources.maxHitPoints) &&
            arr.length <= 2;
        }
        return false;
      });
    }).filter(a => !!a).map(it => it[0].ability.name);

    const commands: AddBossAttackCommand[] = [];

    Object.keys(this.bossAttacks).forEach((k: string) => {
      const arr = this.bossAttacks[k];
      const ability = arr.find((it) => it.ability &&
        it.ability.name.toLowerCase() !== "attack" &&
        it.ability.name.trim() !== "" &&
        it.ability.name.indexOf("Unknown_") < 0);
      if (ability) {
        const date = Utils.getDateFromOffset((ability.timestamp - startTime) / 1000, this.startDate);
        commands.push(new AddBossAttackCommand(
          this.idgen.getNextId(M.EntryType.BossAttack), {
            name: ability.ability.name,
            type: this.getAbilityType(ability),
            offset: Utils.formatTime(date),
            isAoe: arr.length > 4,
            isTankBuster: tbs.indexOf(ability.ability.name) >= 0
          }));
      }
    });

    this.commandStorage.push(new AddBatchAttacksCommand(commands));
  }

  private getAbilityType(ability: FF.AbilityEvent) : M.DamageType {
    return ability.ability.type === FF.AbilityType.PHYSICAL_DIRECT
      ? M.DamageType.Physical
      : (ability.ability.type === FF.AbilityType.MAGICAL_DIRECT ? M.DamageType.Magical : M.DamageType.None);
  }
}
