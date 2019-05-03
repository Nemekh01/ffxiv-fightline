import { Component, OnInit, OnDestroy, ViewChild, ViewChildren, QueryList, HostListener } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MatSnackBar, MatDialog, MatDialogConfig, MatDialogRef } from "@angular/material";

import { DialogService } from "../services/index"
import { ChangeNotes } from "../changeNotes"


import { RecentActivityService, IRecentActivity } from "../services/RecentActivitiesService"

import { AuthenticationService } from "../services/AuthenticationService"
import { LocalStorageService } from "../services/LocalStorageService"

@Component({
  selector: "home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit, OnDestroy {

  public container = { data: [] };

  public constructor(
    private dialogService: DialogService,
    public authenticationService: AuthenticationService,
    private snackBar: MatSnackBar,
    private router: Router,
    private recentService: RecentActivityService,
    private storage: LocalStorageService
  ) {

  }

  ngOnInit(): void {
    this.container.data = this.recentService.load();
    setTimeout(() => {
      this.showHelpForFirstTimers().then(value => {
        this.showWhatsNew().then(value => { });
      });
    });

  }

  showWhatsNew() {
    const promise = new Promise<void>((resolve, reject) => {
      const changes = ChangeNotes.changes;
      const latestRev = changes[0];
      const value = this.storage.getString("whatsnew_shown");
      if (value) {

        if (Number.parseInt(value) >= latestRev.revision) {
          resolve();
          return;
        }
      }

      this.dialogService.openWhatsNew(changes, ChangeNotes.changes)
        .then(() => {
          this.storage.setString("whatsnew_shown", latestRev.revision.toString());
          resolve();
        });
    });
    return promise;
  }

  ngOnDestroy(): void {

  }

  openSettings(): void {
    this.dialogService.openSettings();
  }
  onClick(url: string) {
    this.router.navigateByUrl(url);
  }

  showHelpForFirstTimers(): Promise<void> {
    if (!this.storage.getString("help_shown")) {
      return this.showHelp();
    }
    return new Promise<void>((resolve, reject) => resolve());
  }

  gotoDiscord() {
    window.open("https://discord.gg/xRppKj4", "_blank");
  }


  privacy() {
    window.open("/privacy", "_blank");
  }

  showHelp(): Promise<void> {
    return this.dialogService.openHelp();
  }

  login() {
    this.dialogService.openLogin();
  }

  register() {
    this.dialogService.openRegister()
      .then(result => {
        this.authenticationService.login(result.username, result.password).subscribe((): void => {
        });
      });
  }

  logout() {
    this.authenticationService.logout();
  }

  load(): void {
    if (!this.authenticationService.authenticated) {
      this.snackBar.open("You must Sign in to proceed",
        "Sign in",
        {
          duration: 2000,
        }).onAction().subscribe(() => {
          this.login();
        });

      return;
    }

    this.dialogService.openLoad();
  }

  importFromFFLogs(code: string = null): void {
    this.dialogService.openImportFromFFLogs(code)
      .then((result) => {
        if (!result) return;
        const code = result.code;
        const enc = result.fight;
        this.router.navigateByUrl("/fight/" + code + "/" + enc);
      });
  }

  new() {
    this.router.navigateByUrl("/new");
  }

}
