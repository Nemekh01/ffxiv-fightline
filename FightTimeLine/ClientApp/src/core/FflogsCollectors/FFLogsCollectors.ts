import { JobsMapHolder, AbilitiesMapHolder } from "../DataHolders"
import { UndoRedoController } from "../UndoRedo"
import { IdGenerator } from "../Generators"
import { EntryType, AbilityType, DamageType } from "../Models"
import { Utils } from "../Utils"
import { AddAbilityCommand, AddStanceCommand, AddBossAttackCommand } from "../Commands"

export interface IFFLogsCollector {
  collect(data: any, jobs: any[], startTime: number): void;
  process(startTime: number): void;
}

export class AbilityUsagesCollector implements IFFLogsCollector {
  constructor(private jobsMapHolder: JobsMapHolder, private abilitiesMapHolder: AbilitiesMapHolder, private commandStorage: UndoRedoController, private idgen: IdGenerator, private startDate: Date) {

  }

  collect(data: any, jobs: any[], startTime: number): void {
    if (data.sourceIsFriendly) {
      const foundJob = jobs.find(it1 => it1.id.some((it2: any) => it2 === data.sourceID));
      if (foundJob) {
        const jobMap = this.jobsMapHolder.getByName(foundJob.job, foundJob.actorName);

        if (data.type === "cast") {
          const abilityMap =
            this.abilitiesMapHolder.getByParentAndAbility(jobMap.id, data.ability.name);
          if (abilityMap) {
            this.commandStorage.execute(new AddAbilityCommand(this.idgen.getNextId(EntryType.AbilityUsage),
              abilityMap.parentId,
              abilityMap.ability.name,
              Utils.getDateFromOffset((data.timestamp - startTime) / 1000, this.startDate),
              true,
              null
            ));
          }
        }
        if (data.type === "applybuff") {
          const abilityMap =
            this.abilitiesMapHolder.getByParentAndBuff(jobMap.id, data.ability.guid);
          if (abilityMap) {
            this.commandStorage.execute(new AddAbilityCommand(this.idgen.getNextId(EntryType.AbilityUsage),
              abilityMap.parentId,
              abilityMap.ability.name,
              Utils.getDateFromOffset((data.timestamp - startTime) / 1000, this.startDate),
              true,
              null
            ));
          }
        }
      }
    }
  }

  process(startTime: number): void { }
}

export class JobPetCollector implements IFFLogsCollector {
  constructor(private jobsMapHolder: JobsMapHolder, private abilitiesMapHolder: AbilitiesMapHolder, private commandStorage: UndoRedoController, private idgen: IdGenerator, private startDate: Date) {

  }

  collect(data: any, jobs: any[], startTime: number): void {
    if (data.sourceIsFriendly) {
      const foundJob = jobs.find(it1 => it1.id.some((it2: any) => it2 === data.sourceID));
      if (foundJob) {
        const jobMap = this.jobsMapHolder.getByName(foundJob.job, foundJob.actorName);
        if (!jobMap.pet && jobMap.job.pets && jobMap.job.pets.length > 0) {
          const peta = jobMap.job.abilities.find(
            am => (am.abilityType & AbilityType.Pet) === AbilityType.Pet &&
              am.name === data.ability.name);
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
  constructor(private jobsMapHolder: JobsMapHolder, private abilitiesMapHolder: AbilitiesMapHolder, private commandStorage: UndoRedoController, private idgen: IdGenerator, private startDate: Date) {

  }

  collect(data: any, jobs: any[], startTime: number): void {
    if (data.sourceIsFriendly) {
      const foundJob = jobs.find(it1 => it1.id.some((it2: any) => it2 === data.sourceID));
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
      const cmp = (a: any, b: any) => {
        if (a > b) return +1;
        if (a < b) return -1;
        return 0;
      }
      const eventToNmber = (a: string) => {
        if (a === "removebuff") return -1;
        return 1;
      }

      const arr = this.stances[k].sort((a, b) => cmp(a.timestamp, b.timestamp) || cmp(eventToNmber(a.type), eventToNmber(b.type)));
      let start: Date = this.startDate;
      let ability: string = null;
      for (var v of arr) {
        if (v.type === "applybuff") {
          start = Utils.getDateFromOffset((v.timestamp - startTime) / 1000, this.startDate);
          ability = v.ability.name;
        } else {
          this.commandStorage.execute(new AddStanceCommand(this.idgen.getNextId(EntryType.StanceUsage), k, ability || v.ability.name, start, Utils.getDateFromOffset((v.timestamp - startTime) / 1000, this.startDate), true));
          start = this.startDate;
        }
      }
      if (start !== this.startDate) {
        this.commandStorage.execute(new AddStanceCommand(this.idgen.getNextId(EntryType.StanceUsage), k, ability, start, new Date(this.startDate.valueOf() + 30 * 60 * 1000), true));
      }
    });
  }
}


export class BossAttacksCollector implements IFFLogsCollector {

  private bossAttacks: { [id: string]: Array<any> } = {};
  constructor(private jobsMapHolder: JobsMapHolder, private abilitiesMapHolder: AbilitiesMapHolder, private commandStorage: UndoRedoController, private idgen: IdGenerator, private startDate: Date) {

  }

  collect(data: any, jobs: any[], startTime: number): void {
    if (!data.sourceIsFriendly) {
      const key = data.ability.name + "_" + Math.trunc(data.timestamp / 1000);
      let g = this.bossAttacks[key];
      if (!g) {
        this.bossAttacks[key] = new Array<any>();
        g = this.bossAttacks[key];
      }
      g.push(data);
    }
  }

  process(startTime: number): void {
    Object.keys(this.bossAttacks).forEach((k: string) => {
      const arr = this.bossAttacks[k];
      const ability = arr.find((it) => it.ability &&
        (it.type === "damage" || it.type === "cast") &&
        it.ability.name !== "Attack" &&
        it.ability.name !== "attack" &&
        it.ability.name.trim() !== "" &&
        it.ability.name.indexOf("Unknown_") < 0);
      if (ability) {
        const date = Utils.getDateFromOffset((ability.timestamp - startTime) / 1000, this.startDate);
        this.commandStorage.execute(new AddBossAttackCommand(
          this.idgen.getNextId(EntryType.BossAttack), date, {
            name: ability.ability.name,
            type: ability.ability.type === 128 ? DamageType.Physical : (ability.ability.type === 1024 ? DamageType.Magical : DamageType.None),
            offset: Utils.formatTime(date),
            isAoe: arr.length > 4,
            isTankBuster: arr.some(it => it.type === "damage" && it.overkill > 0) && arr.length < 2
          }));

      }
    });
  }
}
