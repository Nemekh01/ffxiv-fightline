import { Injectable, Inject } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable } from "rxjs"
import { SettingsService, FFLogsImportBossAttacksSource } from "./SettingsService"
import { Event, ReportEventsResponse, ReportFightsResponse, IJobInfo, Events } from "../core/FFLogs"
import { MatDialog, MatDialogConfig, MatDialogRef } from "@angular/material";
import { IBossAbility, IAbilitySetting, IAbilitySettingData, IFight } from "../core/Models";
import {LocalStorageService} from "./LocalStorageService";

import {
  WhatsNewDialog,
  BossAttackDialog,
  HelpDialog,
  FightLoadDialog,
  BossSaveDialog,
  FightSaveDialog,
  SettingsDialog,
  AbilityEditDialog,
  FFLogsImportDialog,
  LoadingDialog,
  LoginDialog,
  RegisterDialog,
  SessionCreateResultDialog,
  ExportToTableDialog,
  TableViewDialog,
  BossTemplatesDialog
} from "../dialogs/index"

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private dialog: MatDialog, private storage: LocalStorageService) {

  }

  public get isAnyDialogOpened(): boolean {
    return this.dialog.openDialogs.length > 0;
  }


  openExportToTable(dataFn: () => any) {
    this.dialog.open(ExportToTableDialog,
      {
        width: "700px",
        height: "500px",
        data: dataFn()
      });
  }

  openLogin() {
    const dialogRef = this.dialog.open(LoginDialog,
      {
        width: "265px",
        height: "360px",
        disableClose: true
      });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.signup) {
        setTimeout(() => {
          this.openRegister();
        });
        return;
      }
    });
  }

  openRegister(): Promise<any> {

    const dialogRef = this.dialog.open(RegisterDialog,
      {
        width: "355px",
        height: "425px",
        disableClose: true
      });
    return dialogRef.afterClosed().toPromise();
  }

  openBossAttackAddDialog(bossAbility: IBossAbility, callBack: (b: any) => void): void {
    const dialogRef = this.dialog.open(BossAttackDialog,
      <MatDialogConfig<IBossAbility>>{
        width: "700px",
        height: "500px",
        data: bossAbility
      });
    dialogRef.afterClosed().subscribe(result => {
      callBack(result);
    });
  }

  openAbilityEditDialog(data: { settings: IAbilitySetting[], values: IAbilitySettingData[] },
    callBack: (b: any) => void): void {
    const dialogRef = this.dialog.open(AbilityEditDialog,
      <MatDialogConfig<{ settings: IAbilitySetting[]; values: IAbilitySettingData[] }>>{
        width: "700px",
        height: "500px",
        data: data
      });
    dialogRef.afterClosed().subscribe(result => {
      callBack(result);
    });
  }

  openLoad(): void {
    this.dialog.open(FightLoadDialog,
      {
        width: "700px",
        height: "500px",
      });
  }

  openImportFromFFLogs(code: string = null): Promise<any> {

    const dialogRef = this.dialog.open(FFLogsImportDialog,
      {
        width: "700px",
        height: "200px",
        data: code
      });

    return dialogRef.afterClosed().toPromise();
  }

  openSaveBoss(dataFn:()=>any): Promise<any> {
    const dialogref = this.dialog.open(BossSaveDialog,
      {
        width: "700px",
        height: "500px",
        data: dataFn()
      });
    return dialogref.afterClosed().toPromise();
  }

  openSaveFight(dataFn: ()=>any): Promise<IFight> {
    const dialogref = this.dialog.open(FightSaveDialog,
      {
        width: "700px",
        height: "500px",
        data: dataFn()
      });
    return dialogref.afterClosed().toPromise();
  }

  openHelp(): Promise<void> {
    const promise = new Promise<void>((resolve) => {
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

  openSettings(): void {
    this.dialog.open(SettingsDialog,
      {
        width: "90%",
        height: "90%"
      });
  }

  executeWithLoading(action: (ref: { close(): void }) => void) {
    let loadingDialogRef: MatDialogRef<LoadingDialog, any>;
    setTimeout(() => {
      loadingDialogRef = this.dialog.open(LoadingDialog,
        {
          width: "150px",
          height: "200px",
          disableClose: true
        });
      loadingDialogRef.afterOpen().subscribe(() => {
        action({ close: () => loadingDialogRef.close() });
      });
    });
  }

  openSessionUrl(key: string) {
    this.dialog.open(SessionCreateResultDialog,
      {
        width: "700px",
        height: "210px",
        data: document.getElementsByTagName("base")[0].href + "session/" + key
      });
  }

  openTable(dataFn: () => any) {
    this.dialog.open(TableViewDialog,
      {
        width: "90%",
        height: "90%",
        data: dataFn()
      }
    );
  }

  openBossTemplates(dataFn: () => any) {
    this.dialog.open(BossTemplatesDialog,
      {
        width: "90%",
        height: "90%",
        data: dataFn()
      }
    );
  }

  openWhatsNew(change?: any, notes?: any) : Promise<any> {
    const changes = change || notes;
    const ref = this.dialog.open(WhatsNewDialog,
      {
        width: "90%",
        height: "90%",
        data: changes
      }
    );
    return ref.afterClosed().toPromise();
  }
}
