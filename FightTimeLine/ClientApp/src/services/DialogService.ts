import { Injectable, Inject } from "@angular/core"
import { IBossAbility, IAbilitySetting, IAbilitySettingData, IFight } from "../core/Models";
import { LocalStorageService } from "./LocalStorageService";
import { NzModalRef, NzModalService } from 'ng-zorro-antd';
import { Observable } from "rxjs";
import * as D from "../dialogs/index"

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(
    private dialogs: NzModalService,
    private storage: LocalStorageService) {

  }

  public get isAnyDialogOpened(): boolean {
    return this.dialogs.openModals.length > 0;
  }

  dialog: any;


  openExportToTable(dataFn: () => any) {
    this.dialogs.create({
      nzTitle: "Export to table",
      nzWidth: 700,
      nzClosable: false,
      nzKeyboard: false,
      nzOkDisabled: true,
      nzMaskClosable: false,
      nzContent: D.ExportToTableDialog,
      nzComponentParams: {
        data: dataFn()
      }
    });
  }

  openLogin() {
    const dialogRef = this.dialogs.create({
      nzContent: D.LoginDialog,
      nzTitle: "Login",
      nzWidth: 265,
      nzClosable: false,
      nzKeyboard: false,
      nzOkDisabled: true,
      nzCancelDisabled: true,
      nzFooter: null,
      nzMaskClosable: false
    });
    dialogRef.afterClose.subscribe(result => {
      if (result && result.signup) {
        setTimeout(() => {
          this.openRegister();
        });
        return;
      }
    });
  }

  openRegister(): Promise<any> {

    const dialogRef = this.dialogs.create({
      nzTitle: "Register",
      nzContent: D.RegisterDialog,
      nzWidth: 355,
      nzClosable: false,
      nzKeyboard: false,
      nzOkDisabled: true,
      nzCancelDisabled: true,
      nzFooter: null,
      nzMaskClosable: false
    });
    return this.toPromise(dialogRef.afterClose);
  }

  openBossAttackAddDialog(bossAbility: IBossAbility, callBack: (b: any) => void): void {
    const dialogRef = this.dialogs.create({
      nzTitle: null,
      nzWidth: 700,
      nzClosable: false,
      nzMaskClosable: false,
      nzContent: D.BossAttackDialog,
      nzComponentParams: {
        data: bossAbility
      }
    });

    dialogRef.afterClose.subscribe(result => {
      callBack(result);
    });
  }

  openAbilityEditDialog(data: { settings: IAbilitySetting[], values: IAbilitySettingData[] },
    callBack: (b: any) => void): void {
    const dialogRef = this.dialogs.create({
      nzTitle: "Properties",
      nzContent: D.AbilityEditDialog,
      nzWidth: 700,
      nzClosable: false,
      nzKeyboard: false,
      nzOkDisabled: true,
      nzCancelDisabled: true,
      nzFooter: null,
      nzMaskClosable: false,
      nzComponentParams: {
        data: data
      }
    });

    dialogRef.afterClose.subscribe(result => {
      callBack(result);
    });
  }

  openLoad(): void {
    this.dialogs.create({
      nzTitle: "Load",
      nzContent: D.FightLoadDialog,
      nzWidth: 700,
      nzClosable: false,
      nzKeyboard: false,
      nzOkDisabled: true,
      nzCancelDisabled: true,
      nzFooter: null,
      nzMaskClosable: false
    });
  }

  openImportFromFFLogs(code: string = null): Promise<any> {

    const dialogRef = this.dialogs.create({
      nzTitle: "Import from FFLogs",
      nzWidth: 700,
      nzClosable: false,
      nzContent: D.FFLogsImportDialog,
      nzComponentParams: {
        code: code
      }
    });

    return this.toPromise(dialogRef.afterClose);
  }

//  openSaveBoss(dataFn: () => any): Promise<any> {
//    const dialogref = this.dialog.open(D.BossSaveDialog,
//      {
//        width: "700px",
//        height: "500px",
//        data: dataFn()
//      });
//    return dialogref.afterClosed().toPromise();
//  }

  openSaveFight(dataFn: () => any): Promise<IFight> {
    const dialogref = this.dialogs.create({
      nzTitle: "Save",
      nzContent: D.FightSaveDialog,
      nzWidth: 700,
      nzClosable: false,
      nzKeyboard: false,
      nzOkDisabled: true,
      nzCancelDisabled: true,
      nzFooter: null,
      nzMaskClosable: false,
      nzComponentParams: {
        data: dataFn()
      }
    });
    return this.toPromise(dialogref.afterClose);
  }

  private toPromise<T>(obs:Observable<T>):Promise<T> {
    return new Promise((resolve, reject) => {
      obs.subscribe((data) => {
        resolve(data);
      }, (error) => {
        reject(error);
      });
    });
  }

  openHelp(): Promise<void> {
    const promise = new Promise<void>((resolve) => {
      const dialogRef = this.dialogs.create({
        nzTitle: "Help",
        nzContent: D.HelpDialog,
        nzWidth: "80%",
        nzClosable: false,
        nzKeyboard: false,
        nzMaskClosable: false,
      });
      dialogRef.afterClose.subscribe(() => {
        this.storage.setString("help_shown", "yes");
        resolve();
      });
    });

    return promise;
  }

  openSettings(): void {
    this.dialogs.create({
      nzTitle: null,
      nzContent: D.SettingsDialog,
      nzWidth: "900px",
      nzClosable: false
    });
  }

  executeWithLoading(action: (ref: { close(): void }) => void) {
    let loadingDialogRef: any;
    setTimeout(() => {
      loadingDialogRef = this.dialogs.create({
        nzContent: D.LoadingDialog,
        nzTitle: null,
        nzWidth: 150,
        nzClosable: false,
        nzKeyboard: false,
        nzOkDisabled: true,
        nzCancelDisabled: true,
        nzFooter: null,
        nzMaskClosable: false
      });

      loadingDialogRef.afterOpen.subscribe(() => {
        action({ close: () => loadingDialogRef.destroy() });
      });
    });
  }

  openSessionUrl(key: string) {
    this.dialogs.create({
      nzContent: D.SessionCreateResultDialog,
      nzTitle: null,
      nzWidth: 700,
      nzClosable: false,
      nzKeyboard: false,
      nzOkDisabled: true,
      nzMaskClosable: false,
      nzComponentParams: {
        data: document.getElementsByTagName("base")[0].href + "session/" + key
      }
    });
  }

  openTable(dataFn: () => any) {
    this.dialogs.create({
      nzContent: D.TableViewDialog,
      nzTitle: null,
      nzWidth: "90%",
      nzClosable: false,
      nzKeyboard: false,
      nzOkDisabled: true,
      nzMaskClosable: false,
      nzComponentParams: {
        data: dataFn()
      }
    });
  }

  openBossTemplates(dataFn: () => any) {
    this.dialogs.create({
      nzContent: D.BossTemplatesDialog,
      nzTitle: null,
      nzWidth: "90%",
      nzClosable: false,
      nzKeyboard: false,
      nzOkDisabled: true,
      nzMaskClosable: false
    });
  }

  openWhatsNew(change?: any, notes?: any): Promise<any> {
    const changes = change || notes;
    const ref = this.dialogs.create({
      nzContent: D.WhatsNewDialog,
      nzTitle: "What is new",
      nzWidth: "90%",
      nzClosable: false,
      nzKeyboard: false,
      nzOkDisabled: true,
      nzMaskClosable: false,
      nzComponentParams: {
        data: changes
      }
    });
    return this.toPromise(ref.afterClose);
  }
}
