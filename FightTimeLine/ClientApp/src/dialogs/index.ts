import { AbilityEditDialog } from "./abilityEditDialog/abilityEditDialog.component"
import { BossAttackDialog } from "./bossAttackDialog/bossAttackDialog.component"
import { BossSaveDialog } from "./bossSaveDialog/bossSaveDialog.component"
import { BossTemplatesDialog } from "./bossTemplatesDialog/bossTemplatesDialog.component"
import { ConfirmDialog } from "./confirmDialog/confirmDialog.component"
import { ExportToTableDialog } from "./exportToTableDialog/exportToTableDialog.component"
import { FFLogsImportDialog } from "./ffLogsImportDialog/ffLogsImportDialog.component"
import { FightLoadDialog } from "./fightLoadDialog/fightLoadDialog.component"
import { FightSaveDialog } from "./fightSaveDialog/fightSaveDialog.component"
import { HelpDialog } from "./helpDialog/helpDialog.component"
import { LoadingDialog } from "./loadingDialog/loadingDialog.component"
import { LoginDialog } from "./loginDialog/loginDialog.component"
import { RegisterDialog } from "./registerDialog/registerDialog.component"
import { SessionCreateResultDialog } from "./sessionCreateResultDialog/sessionCreateResultDialog.component"
import { SettingsDialog } from "./settingsDialog/settingsDialog.component"
import { TableViewDialog } from "./tableViewDialog/tableViewDialog.component"
import { WhatsNewDialog } from "./whatsNewDialog/whatsNewDialog.component"
import { NgModule } from "@angular/core"

export {
  AbilityEditDialog,
  BossAttackDialog,
  BossSaveDialog,
  BossTemplatesDialog,
  ConfirmDialog,
  ExportToTableDialog,
  FFLogsImportDialog,
  FightLoadDialog,
  FightSaveDialog,
  HelpDialog,
  LoadingDialog,
  LoginDialog,
  RegisterDialog,
  SessionCreateResultDialog,
  SettingsDialog,
  TableViewDialog,
  WhatsNewDialog
}

export const DialogsModuleComponents =
  [
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
      BossTemplatesDialog,
      WhatsNewDialog,
      ConfirmDialog
    ];  

