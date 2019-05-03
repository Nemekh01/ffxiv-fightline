import { Component, Inject } from "@angular/core";
import { FormControl } from "@angular/forms"
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import "rxjs/add/observable/merge";
import "rxjs/add/observable/empty";
import { SpreadSheetsService } from "../../services/SpreadSheetsService"

import { ExportTemplate, ExportData } from "../../core/BaseExportTemplate"
import { FirstTemplate } from "../../core/ExportTemplates/FirstTemplate"
import { EachRowOneSecondTemplate } from "../../core/ExportTemplates/EachRowOneSecondTemplate"
import { BossAttackDefensiveTemplate } from "../../core/ExportTemplates/BossAttackDefensiveTemplate"
import { AuthService, GoogleLoginProvider, SocialUser } from "angularx-social-login";

@Component({
  selector: "exportToTableDialog",
  templateUrl: "./exportToTableDialog.component.html",
  styleUrls: ["./exportToTableDialog.component.css"]
})
export class ExportToTableDialog {

  constructor(
    private authService: AuthService,
    private service: SpreadSheetsService,
    public dialogRef: MatDialogRef<ExportToTableDialog>,
    @Inject("GOOGLE_API_CLIENT_KEY") public apiKey: string,
    @Inject(MAT_DIALOG_DATA) public data: ExportData) {
  }

  exportTemplatesControl = new FormControl();

  url: string;
  user: SocialUser;
  loggedIn: boolean;
  templates: ExportTemplate[] =
    [new FirstTemplate(), new EachRowOneSecondTemplate(), new BossAttackDefensiveTemplate()];
  scope = [
    //"https://www.googleapis.com/auth/drive",
    //"https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/spreadsheets",
    //"https://www.googleapis.com/auth/spreadsheets.readonly"
  ].join(" ");

  ngOnInit(): void {
    this.authService.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = (user != null);
    });
  }

  signinWithGoogle(): void {
    if (!this.loggedIn)
      this.authService.signIn(GoogleLoginProvider.PROVIDER_ID,
        {
          scope: this.scope
        });
  }

  export() {
    if (!this.exportTemplatesControl.value) return;
    this.service.create(this.user.authToken,
        this.templates.find(it => it.name === this.exportTemplatesControl.value).build(this.data))
      .subscribe(ev => {
          this.url = ev.spreadsheetUrl;
          console.log(ev);
        },
        ev => {
          this.authService.signOut();
        });
  }

  onCopied() {

  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onYesClick(): void {
    this.dialogRef.close();
  }
}
