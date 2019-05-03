import { Component, OnInit, OnDestroy, ViewChild, ViewChildren, QueryList, HostListener } from "@angular/core";
import { Location } from "@angular/common";
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl } from "@angular/forms"
import { ActivatedRoute, Router } from "@angular/router";
import { MatSnackBar, MatDialog, MatDialogConfig, MatDialogRef } from "@angular/material";
import { IBossAbility, IFight, IAbilitySetting, IAbilitySettingData } from "../core/Models";
import { ContextMenuService, ContextMenuComponent } from "ngx-contextmenu";

import { FightsService } from "../services/FightService"
import { SettingsService } from "../services/SettingsService"
import { LocalStorageService } from "../services/LocalStorageService"
import { JobRegistry } from "../core/JobRegistry"
import { ChangeNotes } from "../changeNotes"
import { WhatsNewDialog } from "../dialogs/whatsNewDialog/whatsNewDialog.component"
import { HelpDialog } from "../dialogs/helpDialog/helpDialog.component"

import { FirstTemplate } from "../core/ExportTemplates/FirstTemplate"
import { EachRowOneSecondTemplate } from "../core/ExportTemplates/EachRowOneSecondTemplate"
import { BossAttackDefensiveTemplate } from "../core/ExportTemplates/BossAttackDefensiveTemplate"
import { ExportTemplate, ExportData, IExportResultItem } from "../core/BaseExportTemplate"
import { IExportResultSet } from "../core/BaseExportTemplate"
import { ISerializeData, IBossAbilityUsageData } from "../core/FightTimeLineController";
import { SettingsDialog } from "../dialogs/settingsDialog/settingsDialog.component"


@Component({
  selector: "tableview",
  templateUrl: "./tableview.component.html",
  styleUrls: ["./tableview.component.css"],
})
export class TableViewComponent implements OnInit, OnDestroy {
  startDate = new Date(946677600000);

  public set: IExportResultSet;
  public columnNames: string[];
  templates: ExportTemplate[] = [new FirstTemplate(), new EachRowOneSecondTemplate(), new BossAttackDefensiveTemplate()];
  jobRegistry = new JobRegistry();

  public constructor(
    private dialog: MatDialog,
    private fightService: FightsService,
    private route: ActivatedRoute,
    private router: Router,
    private storage: LocalStorageService,
    private settingsService: SettingsService) {
  }

  home() {
    this.router.navigateByUrl("/");
  }

  ngOnInit(): void {
    this.route.params.subscribe(r => {
      const id = r["fightId"] as string;
      const template = r["template"] as string;
      if (id && template) {
        const settings = this.settingsService.load();
        this.fightService
          .getFight(id)
          .subscribe(fight => {
            const exportData = this.getExportData(fight);
            const d = this.templates.find(it => it.name.toLowerCase() === template.toLowerCase()).build(exportData);
            this.columnNames = d.columns.map(it => it.text);
            this.set = d;
          });
      }
    });
  }

  getExportData(fight: IFight): ExportData {
    const data = JSON.parse(fight.data) as ISerializeData;
    const bossData = JSON.parse(data.boss.data);
    const bossAttacks = bossData.attacks as IBossAbilityUsageData[];
    return {
      userName: fight.author,
      name: fight.name,
      data: {
        boss: {
          attacks: bossAttacks.map((it) => <any>{
              name: it.ability.name,
              type: it.ability.type,
              isAoe: it.ability.isAoe,
              isShareDamage: it.ability.isShareDamage,
              isTankBuster: it.ability.isTankBuster,
              offset: it.ability.offset
          }),
          downTimes: bossData.downTimes.map(it => <any>{
            start: it.start,
            end: it.end
          })
        },
        initialTarget:data.initialTarget,
        bossTargets: [], //todo: parse boss targets
        jobs: data.jobs.map(it => {
          const jb = this.jobRegistry.getJob(it.name);
          return <any>{
            id: it.id,
            name: it.name,
            role: jb.role, 
            order: it.order,
            pet: it.pet,
            icon: jb.icon
          }
        }),
        abilities: data.abilities.map(it => {
          const jb = data.jobs.find(j => j.id === it.job);
          const ab = this.jobRegistry.getAbilityForJob(jb.name, it.ability);
          return <any>{
            job: it.job,
            ability: it.ability,
            type: ab.abilityType,
            duration: ab.duration,
            start: it.start,
            icon: ab.icon
          }
        })
      }
    };
  }

  gotoDiscord() {
    window.open("https://discord.gg/xRppKj4", "_blank");
  }

  showHelp(): Promise<void> {
    const promise = new Promise<void>((resolve) => {
      console.log("help requested");
      const dialogRef = this.dialog.open(HelpDialog,
        {
          width: "90%",
          height: "90%",
        });
      dialogRef.afterClosed().subscribe(() => {
        this.storage.setString("help_shown", "yes");
        resolve();
      });
    });

    return promise;
  }


  showWhatsNewInt(change?: any) {
    const changes = change || ChangeNotes.changes;
    const ref = this.dialog.open(WhatsNewDialog,
      {
        width: "90%",
        height: "90%",
        data: changes
      }
    );
    return ref;
  }

  openSettings(): void {
    this.dialog.open(SettingsDialog,
      {
        width: "90%",
        height: "90%"
      });
  }


  ngOnDestroy(): void {

  }
}



