//import { IJob, IAbility, IStance, byName, byBuffApply, byBuffRemove, BaseOverlapStrategy } from "./Models"
//import { abilitySortFn } from "./Jobs/FFXIV/shared"
//import { PLD, WAR, DRK, WHM, SCH, AST, BRD, MCH, DRG, MNK, NIN, SAM, BLM, RDM, SMN, DNC, GNB } from "./Jobs/FFXIV/index"
//
//export class JobRegistry {
//  private jobs: IJob[];
//
//
//  public getJobs(): IJob[] {
//    return this.jobs = (this.jobs = [PLD, WAR, DRK, GNB, WHM, SCH, AST, BRD, MCH, DNC, DRG, MNK, NIN, SAM, BLM, RDM, SMN].map(j => this.build(j)));
//  }
//
//  private build(job: IJob): IJob {
//    return {
//      name: job.name,
//      icon: this.getIcon(job.icon),
//      defaultPet: job.defaultPet,
//      pets: job.pets && job.pets.map((p) => {
//        return { name: p.name, icon: this.getIcon(p.icon) }
//      }),
//      role: job.role,
//      stances: job.stances && job.stances.map(s => {
//        return {
//          ability: this.buildAbility(s.ability)
//        }
//      }),
//      abilities: job.abilities.map(a => this.buildAbility(a)).sort(abilitySortFn)
//    };
//  }
//
//  private getIcon(id: string) {
//    return `/assets/images/${id}${id.endsWith(".jpg") ? "" : ".png"}`;
//  }
//
//  private buildAbility(a: IAbility): IAbility {
//    return {
//      name: a.name,
//      abilityType: a.abilityType,
//      cooldown: a.cooldown,
//      duration: a.duration,
//      icon: this.getIcon(a.icon),
//      pet: a.pet,
//      requiresBossTarget: a.requiresBossTarget,
//      extendDurationOnNextAbility: a.extendDurationOnNextAbility,
//      relatedAbilities: a.relatedAbilities,
//      settings: a.settings,
//      xivDbId: a.xivDbId,
//      xivDbType: a.xivDbType,
//      charges: a.charges,
//      detectStrategy: a.detectStrategy || byName([a.xivDbId], [a.name]),
//      overlapStrategy: a.overlapStrategy || new BaseOverlapStrategy()
//    }
//  }
//
//  getJob(jobName: string): IJob {
//    const job = this.jobs.find((j: IJob) => j.name === jobName) as IJob;
//    return job;
//  }
//
//  getAbilityForJob(jobName: string, abilityName: string): IAbility {
//    const job = this.getJob(jobName);
//    return job.abilities.find((a: IAbility) => a.name === abilityName) as IAbility;
//  }
//
//  getStanceAbilityForJob(jobName: string, abilityName: string): IAbility {
//    const job = this.getJob(jobName);
//    return job.stances.find((a: IStance) => a.ability.name === abilityName).ability as IAbility;
//  }
//}
