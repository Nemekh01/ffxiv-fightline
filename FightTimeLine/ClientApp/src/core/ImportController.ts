import * as UndoRedo from "./UndoRedo";
import * as SettingsService from "../services/SettingsService";
import * as FFLogsCollectors from "./FflogsCollectors/FFLogsCollectors";
import * as FFLogs from "./FFLogs";
import * as Generators from "./Generators";
import * as Commands from "./Commands";
import * as Models from "./Models";
import * as DataHolders from "./DataHolders";
import * as Jobregistryserviceinterface from "../services/jobregistry.service-interface";

export class ImportController {

  constructor(
    private idgen: Generators.IdGenerator,
    private holders: DataHolders.Holders,
    private jobRegistry: Jobregistryserviceinterface.IJobRegistryService) {

  }

  private addJob(id: string, name: string, actorName?: string, pet?: string, collapsed: boolean = false, doUpdates: boolean = true): UndoRedo.Command {
    const rid = id || this.idgen.getNextId(Models.EntryType.Job);
    return new Commands.AddJobCommand(rid, name, actorName, this.holders.bossTargets.initialBossTarget, doUpdates, pet, collapsed);
  }

  buildImportCommand(settings: SettingsService.ISettings, events: FFLogs.Events, startDate: Date, ): UndoRedo.Command {
    try {
      const commands: UndoRedo.Command[] = [];

      const defaultOrder = ["Tank", "Heal", "DD"];
      const sortOrder = settings.fflogsImport.sortOrderAfterImport;

      events.jobs.sort((a, b) => sortOrder.indexOf(defaultOrder[a.role]) - sortOrder.indexOf(defaultOrder[b.role])).forEach(it => {
        commands.push(this.addJob(null, it.job, it.actorName, null, false, false));
      });

      const collectors = [
        new FFLogsCollectors.AbilityUsagesCollector(this.jobRegistry, commands, this.idgen, startDate),
        new FFLogsCollectors.BossAttacksCollector(commands, this.idgen, startDate, settings),
//        new FFLogsCollectors.JobPetCollector(this.holders.jobs, this.holders.abilities, this.commandStorage, this.idgen, this.startDate),
//        new FFLogsCollectors.StancesCollector(this.holders.jobs, this.holders.abilities, this.commandStorage, this.idgen, this.startDate)
      ];


      events.events.forEach((it: FFLogs.AbilityEvent) => {
        if (it.ability) {
          collectors.forEach((c) => c.collect(it, events.jobs, events.start_time));
        }
      });


      collectors.forEach((c) => c.process(events.start_time));

      return new Commands.CombinedCommand(commands);

    } catch (e) {
      console.error(e);
    }
  }
  
}
