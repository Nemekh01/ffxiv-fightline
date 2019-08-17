import { IJob, IAbility, byName, byBuffApply, byBuffRemove } from "../core/Models"

export interface IJobRegistryService {

  getJobs(): IJob[];

  getJob(jobName: string): IJob;

  getAbilityForJob(jobName: string, abilityName: string): IAbility;

  getStanceAbilityForJob(jobName: string, abilityName: string): IAbility;
}


