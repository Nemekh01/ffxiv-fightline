import { Component, OnInit, OnDestroy, ViewChild, ViewChildren, QueryList, HostListener, Injectable } from "@angular/core";
import { NzNotificationService, NzMessageService, NzMessageType } from "ng-zorro-antd"
@Injectable({
  providedIn: "root"
})
export class ScreenNotificationsService {
  constructor(
    private message: NzMessageService,
    private notification: NzNotificationService
  ) {

  }

  public showSignInRequired(action: () => any) {
    this.warn("You must Sign in to proceed");

  }

  public showBossSaved() {
    this.success("Boss Saved");
  }

  public showBossNotSaved() {
    this.error("Unable to save Boss");
  }

  public showFightSaved() {
    this.success("Fight Saved");
  }

  public showFightNotSaved() {
    this.error("Unable to save Fight");
  }

  public showUnableToLoadFight(action: () => void) {
    this.error("Unable to load fight");
  }

  public showUnableToLoadFights() {
    this.error("Unable to load fights");
  }

  public showUnableToRemoveFights() {
    this.error("Unable to remove fights");
  }

  public showConnectedToSession() {
    this.success("Connected");
  }

  public showConnectedToSessionError() {
    this.error("Unable to connected");
  }

  public showUnableToStartSession() {
    this.error("Unable to start session");
  }


  public showSessionStarted() {
    this.success("Session successfuly started");
  }

  public showUnableToImport() {
    this.error("Unable to import from FFLogs");
  }

  public showUserConnected(username: string) {
    this.info(`${username} connected`);
  }

  public showUserDisonnected(username: string) {
    this.info(`${username} disconnected`);
  }

  error(text: string) {
    this.message.error(text,
      {
        nzDuration: 2000
      }
    );
  }
  success(text: string) {
    this.message.success(text,
      {
        nzDuration: 2000
      }
    );
  }

  warn(text: string) {
    this.message.warning(text,
      {
        nzDuration: 2000
      }
    );
  }

  info(text: string) {
    this.message.info(text,
      {
        nzDuration: 2000
      }
    );
  }
}
