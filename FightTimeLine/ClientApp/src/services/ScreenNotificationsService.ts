import { Component, OnInit, OnDestroy, ViewChild, ViewChildren, QueryList, HostListener, Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material";

@Injectable({
  providedIn: "root"
})
export class ScreenNotificationsService {
  constructor(private snackBar: MatSnackBar, ) {

  }

  public showSignInRequired(action: () => any) {
    this.snackBar.open("You must Sign in to proceed",
      "Sign in",
      {
        duration: 2000,
      }).onAction().subscribe(() => {
        action();
      });
  }

  public showBossSaved() {
    this.snackBar.open("Boss Saved",
      null,
      {
        duration: 2000
      });
  }

  public showBossNotSaved() {
    this.snackBar.open("Unable to save Boss",
      null,
      {
        duration: 2000
      });
  }

  public showFightSaved() {
    this.snackBar.open("Fight Saved",
      null,
      {
        duration: 2000
      });
  }

  public showFightNotSaved() {
    this.snackBar.open("Unable to save Fight",
      null,
      {
        duration: 2000
      });
  }

  public showUnableToLoadFight(action:()=>void) {
    this.snackBar.open("Unable to load fight",
      "Home",
      {
        duration: 2000
      }).onAction().subscribe(() => {
        action();
    });
  }

  public showConnectedToSession() {
    this.snackBar.open("Connected",
      null,
      {
        duration: 2000
      });
  }

  public showConnectedToSessionError() {
    this.snackBar.open("Unable to connected",
      null,
      {
        duration: 2000
      });
  }

  public showUnableToStartSession() {
    this.snackBar.open("Unable to start session",
      null,
      {
        duration: 2000
      });
  }


  public showSessionStarted() {
    this.snackBar.open("Session successfuly started",
      null,
      {
        duration: 2000
      });
  }

  public showUnableToImport() {
    this.snackBar.open("Unable to import from FFLogs",
      null,
      {
        duration: 2000
      });
  }

  public showUserConnected(username: string) {
    this.snackBar.open(`${username} connected`,
      null,
      {
        duration: 2000
      });
  }

  public showUserDisonnected(username: string) {
    this.snackBar.open(`${username} disconnected`,
      null,
      {
        duration: 2000
      });
  }

}
