import { Component, OnInit, OnDestroy, ViewChild, ViewChildren, QueryList, HostListener, Inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { DialogService } from "../services/index"
import { ChangeNotes } from "../changeNotes"

import * as S from "../services/index"

@Component({
  selector: "home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit, OnDestroy {

  public container = { data: [] };

  public constructor(
    private notification: S.ScreenNotificationsService,
    private dialogService: DialogService,
    @Inject(S.authenticationServiceToken) public authenticationService: S.IAuthenticationService,
    private router: Router,
    private recentService: S.RecentActivityService,
    private storage: S.LocalStorageService
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

  bossTemplates() {
    this.dialogService.openBossTemplates(null);
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
      this.notification.showSignInRequired(null);
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
