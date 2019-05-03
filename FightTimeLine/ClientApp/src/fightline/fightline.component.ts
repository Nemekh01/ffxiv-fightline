import { Component, OnInit, OnDestroy, ViewChild, HostListener } from "@angular/core";
import { Location } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";


import { VisTimelineService, VisTimelineItems, VisTimelineGroups, VisTimelineOptions } from "ngx-vis";
import { FightTimeLineController, ISerializeData } from "../core/FightTimeLineController"
import * as M from "../core/Models";
import { NgProgress } from "ngx-progressbar"
import { ChangeNotes } from "../changeNotes"

import * as S from "../services/index"

import { FightLineContextMenuComponent } from "./contextmenu/contextmenu.component"
import { ToolbarComponent } from "../toolbar/toolbar.component"
import { SidepanelComponent } from "../sidepanel/sidepanel.component"

import { ClassNameBuilder } from "../core/ClassNameBuilder"
import { IdGenerator } from "../core/Generators"
import { DownTimesController } from "../core/DownTimesController"
import { ICommandData } from "../core/UndoRedo"


@Component({
  selector: "fightline",
  templateUrl: "./fightline.component.html",
  styleUrls: ["./fightline.component.css"],
})
export class FightLineComponent implements OnInit, OnDestroy {
  startDate = new Date(946677600000);
  visTimeline: string = "timeLineMain";
  visTimelineBoss: string = "timeLineBoss";
  private fflogsCode: string = null;

  @ViewChild("contextMenu")
  contextMenu: FightLineContextMenuComponent;
  @ViewChild("sidepanel")
  sidepanel: SidepanelComponent;
  @ViewChild("toolbar")
  toolbar: ToolbarComponent;

  visTimelineItems = new VisTimelineItems();
  visTimelineGroups = new VisTimelineGroups();
  visTimelineItemsBoss = new VisTimelineItems();
  visTimelineGroupsBoss = new VisTimelineGroups();

  private idgen = new IdGenerator();
  private downTimesController: DownTimesController;

  fightLineController = new FightTimeLineController(
    this.startDate,
    this.idgen,
    { items: this.visTimelineItems, groups: this.visTimelineGroups },
    { items: this.visTimelineItemsBoss, groups: this.visTimelineGroupsBoss },
    {
      openBossAttackAddDialog: this.openBossAttackAddDialog.bind(this),
      openAbilityEditDialog: this.openAbilityEditDialog.bind(this),
      openStanceSelector: this.openStanceSelector.bind(this)
    },
    this.settingsService);
  jobs = this.fightLineController.getJobs();

  isInBossDownTimeMode = false;
  sideNavOpened: boolean;

  options = <VisTimelineOptions>{
    width: "100%",
    height: "100%",
    minHeight: "300px",
    autoResize: true,
    start: this.startDate,
    end: new Date(new Date(this.startDate).setMinutes(30)),
    max: new Date(new Date(this.startDate).setMinutes(30)),
    min: this.startDate,
    zoomable: true,
    zoomMin: 3 * 60 * 1000,
    zoomMax: 30 * 60 * 1000,
    zoomKey: "ctrlKey",
    moveable: true,
    type: "range",
    multiselect: true,
    multiselectPerGroup: true,
    format: {
      minorLabels: {
        millisecond: "",
        second: "s",
        minute: "m",
        hour: "",
        weekday: "",
        day: "",
        month: "",
        year: ""
      },
      majorLabels: {
        millisecond: "",
        second: "m",
        minute: "m",
        hour: "m",
        weekday: "",
        day: "",
        month: "",
        year: ""
      }
    },
    stack: true,
    showCurrentTime: false,
    stackSubgroups: true,
    groupOrder: (a: any, b: any) => {
      return (a.value || a.sValue) - (b.value || b.sValue);
    },
    editable: { remove: true, updateTime: true, add: true },
    horizontalScroll: true,
    margin: { item: { horizontal: 0, vertical: 5 } },
    onRemove: (item: any, callback: any) => {
      callback(null);
      this.fightLineController.handleDelete(this.visTimelineService.getSelection(this.visTimeline));
    },
    onMoving: (item: any, callback: any) => {
      if (this.fightLineController.canMove(item)) {
        callback(item);
      } else {
        callback(null);
      }
    },
    onMove: (item: any, callback: any) => {
      callback(item);
      this.fightLineController.notifyMove(item);
    },
    onAdd: (item: any, callback: any) => {
      callback(null);
      if (this.isInBossDownTimeMode) {
        this.downTimesController.registerPoint(item.start);
      } else {
        console.log(item);
        this.fightLineController.notifyDoubleClick(null, item.group, item.start);
      }
    },
    onUpdate: (item: any, callback: any) => {
      callback(null);
      this.fightLineController.notifyDoubleClick(item.id, item.group, item.start);
    },
    visibleFrameTemplate: (item: any) => this.fightLineController.visibleFrameTemplate(item),
    tooltipOnItemUpdateTime: {
      template: (item: any) => this.fightLineController.tooltipOnItemUpdateTime(item)
    },
    snap: (date: Date) => date,
    groupEditable: { order: false }
  };

  optionsBoss = <VisTimelineOptions>{
    width: "100%",
    height: "100%",
    minHeight: "50px",
    autoResize: true,
    start: this.startDate,
    end: new Date(new Date(this.startDate).setMinutes(30)),
    max: new Date(new Date(this.startDate).setMinutes(30)),
    min: this.startDate,
    zoomable: true,
    zoomMin: 3 * 60 * 1000,
    zoomMax: 30 * 60 * 1000,
    zoomKey: "ctrlKey",
    moveable: true,
    tooltip: {
      followMouse: false,
      overflowMethod: "flip"
    },
    type: "box",
    multiselect: true,
    showCurrentTime: false,
    format: {
      minorLabels: {
        millisecond: "",
        second: "s",
        minute: "m",
        hour: "",
        weekday: "",
        day: "",
        month: "",
        year: ""
      },
      majorLabels: {
        millisecond: "",
        second: "m",
        minute: "m",
        hour: "m",
        weekday: "",
        day: "",
        month: "",
        year: ""
      }
    },
    stack: true,
    orientation: "none",
    stackSubgroups: true,
    groupOrder: "id",
    editable: { remove: true, updateTime: true, add: true },
    horizontalScroll: true,
    margin: { item: { horizontal: 0, vertical: 5 } },
    onRemove: (item: any, callback: any) => {
      callback(null);
      this.fightLineController.handleDelete(this.visTimelineService.getSelection(this.visTimelineBoss));
    },
    onMoving: (item: any, callback: any) => {
      if (this.fightLineController.canMove(item)) {
        callback(item);
        this.fightLineController.moveBossAttack(item);
      } else {
        callback(null);
      }
    },
    onMove: (item: any, callback: any) => {
      callback(item);
      this.fightLineController.notifyMove(item);
    },
    onAdd: (item: any, callback: any) => {
      callback(null);
      if (this.isInBossDownTimeMode) {
        this.downTimesController.registerPoint(item.start);
      } else {
        console.log(item);
        this.fightLineController.notifyDoubleClick(null, item.group, item.start);
      }
    },
    tooltipOnItemUpdateTime: {
      template: (item: any) => this.fightLineController.tooltipOnItemUpdateTime(item)
    },
    onUpdate: (item: any, callback: any) => {
      callback(null);
      this.fightLineController.notifyDoubleClick(item.id, item.group, item.start);
    },
    snap: (date: Date) => date
  };

  public constructor(
    private recent: S.RecentActivityService,
    private visTimelineService: VisTimelineService,
    private fightService: S.FightsService,
    private ffLogsService: S.FFLogsService,
    private notification: S.ScreenNotificationsService,
    private progressService: NgProgress,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private dialogService: S.DialogService,
    public authenticationService: S.AuthenticationService,
    private settingsService: S.SettingsService,
    private storage: S.LocalStorageService,
    public teamWorkService: S.TeamWorkService,
    private dispatcher: S.DispatcherService) {
    this.downTimesController = new DownTimesController(
      this.idgen,
      this.visTimelineService,
      this.visTimelineBoss,
      this.fightLineController);
    this.fightLineController.downtimeChanged.subscribe(() => {
      this.downTimesController.modeChanged(this.isInBossDownTimeMode);
    });
    this.fightLineController.commandExecuted.subscribe((data: ICommandData) => {
      this.teamWorkService.sendCommand(data);
    });
    this.subscribeToDispatcher(this.dispatcher);
  }

  timelineBossInitialized(): void {
    this.visTimelineService.setOptions(this.visTimelineBoss, this.optionsBoss);
  }

  private openStanceSelector(data: M.IContextMenuData[]): void {
    this.contextMenu.openStanceSelector(data);
  }

  timelineInitialized(): void {
    console.log("timeline initialized");
    this.visTimelineService.setOptions(this.visTimeline, this.options);

    this.visTimelineService.on(this.visTimeline, "click");
    this.visTimelineService.on(this.visTimelineBoss, "click");
    this.visTimelineService.on(this.visTimeline, "contextmenu");
    this.visTimelineService.on(this.visTimelineBoss, "contextmenu");
    this.visTimelineService.on(this.visTimeline, "select");
    this.visTimelineService.on(this.visTimelineBoss, "select");
    this.visTimelineService.on(this.visTimeline, "timechanged");
    this.visTimelineService.on(this.visTimelineBoss, "timechanged");
    this.visTimelineService.on(this.visTimeline, "timechange");
    this.visTimelineService.on(this.visTimeline, "rangechange");
    this.visTimelineService.on(this.visTimelineBoss, "rangechange");

    this.visTimelineService.rangechange
      .subscribe((eventData: any[]) => {
        const event: any = eventData[1];
        if (event.byUser) {
          this.visTimelineService.setWindow(eventData[0] === this.visTimeline ? this.visTimelineBoss : this.visTimeline,
            event.start,
            event.end,
            {
              animation: false
            });
        }
      });

    this.visTimelineService.contextmenu.subscribe((eventData: any[]) => {
      const event: any = eventData[1];
      this.contextMenu.openMenu(eventData, this.fightLineController.getContextMenuItems(eventData[1]));

      event.event.preventDefault();
      event.event.stopPropagation();

    });

    this.visTimelineService.select.subscribe((eventData: any[]) => {
      this.updateSelection(eventData);
    });

    this.visTimelineService.timechanged.subscribe((eventData: any[]) => {

      console.log(eventData);
      this.fightLineController.notifyTimeChanged(eventData[1].id, eventData[1].time as Date);

    });

    this.visTimelineService.timechange.subscribe((eventData: any[]) => {
      if (eventData[0] === this.visTimeline) {

      }
    });


    this.visTimelineService.click.subscribe((eventData: any[]) => {
      if (eventData[0] === this.visTimeline) {
        console.log(eventData[1]);
        if (eventData[1].what === "group-label" && this.fightLineController.isJobGroup(eventData[1].group)) {
          this.fightLineController.toggleJobCollapsed(eventData[1].group);
          this.fightLineController.applyFilter();
          setTimeout(() => this.refresh());
        }
      }
      if (eventData[1].what === "background" || eventData[1].what === null) {
        this.updateSelection(eventData);
      }
    });
  }

  public tool: string;

  useTool(tool: string) {
    this.tool = tool;
    const tools: M.ITools = {
      downtime: tool === 'Downtime',
      stickyAttacks: tool === 'Sticky Attacks'
    };

    this.onBossDownTimeChanged(tools.downtime);
    this.fightLineController.updateTools(tools);
  }

  exportToTable() {
    this.dialogService.openExportToTable(() => this.fightLineController.serializeForExport());
  }

  private updateSelection(eventData: any[]): void {
    if (eventData[0] === this.visTimeline) {
      this.visTimelineService.setSelectionToId(this.visTimelineBoss, "");
      this.setSelectionOfBossAttacks([]);
      console.log(eventData[1]);
      this.fightLineController.notifySelect("friend", eventData[1].items);

    }
    if (eventData[0] === this.visTimelineBoss) {
      this.visTimelineService.setSelectionToId(this.visTimeline, "");
      console.log(eventData[1]);
      this.setSelectionOfBossAttacks(eventData[1].items);
      this.fightLineController.notifySelect("boss", eventData[1].items);
    }



    if (eventData[1].items && eventData[1].items.length > 0) {
      const items = this.fightLineController.getItems(eventData[1].items);
      this.sidepanel.setItems(items, this.fightLineController.getHolders());
      if (!this.sideNavOpened)
        this.sideNavOpened = true;
//      this.visTimelineService.setOptions(this.visTimeline,
//        {
//          showTooltips: false
//        });
    } else {
      this.sidepanel.setItems([], null);
      if (this.sideNavOpened)
        this.sideNavOpened = false;
//      this.visTimelineService.setOptions(this.visTimeline,
//        {
//          showTooltips: true
//        });
    }

  }

  private setSelectionOfBossAttacks(ids: string[]): void {
    if (!ids) return;
    this.visTimelineItems.forEach((it) => {
      const b = new ClassNameBuilder(it.className);
      const have = !!ids && ids.some((e: string) => "bossAttack_" + e === it.id);
      b.set([{ value: "selected", flag: have }]);
      if (b.isChanged()) {
        it.className = b.build();
        this.visTimelineItems.update([it]);
      }
    });
  }

  keyPressed(event: any) {
    console.log(event);
    if (this.dialogService.isAnyDialogOpened) return;

    if (event.key === "Delete") {
      const selected = [
        ...this.visTimelineService.getSelection(this.visTimeline),
        ...this.visTimelineService.getSelection(this.visTimelineBoss)
      ];
      this.fightLineController.handleDelete(selected);
    }
    if (event.code === "KeyZ" && event.ctrlKey) {
      this.fightLineController.undo();
    }
    if (event.code === "KeyY" && event.ctrlKey) {
      this.fightLineController.redo();
    }

    if (event.code === "ArrowLeft") {
      this.fightLineController.moveSelection(-1 * (event.ctrlKey ? 10 : 1));
    }
    if (event.code === "ArrowRight") {
      this.fightLineController.moveSelection(1 * (event.ctrlKey ? 10 : 1));
    }
  }

  login() {
    this.dialogService.openLogin();
  }

  register() {
    return this.dialogService.openRegister()
      .then(result => {
        this.authenticationService.login(result.username, result.password).subscribe((): void => {
        });
      });
  }

  logout() {
    this.authenticationService.logout();
  }

  updateFilter($data: M.IFilter): void {
    this.fightLineController.applyFilter($data);
    setTimeout(() => this.refresh());
  }

  updateView($data: M.IView): void {
    this.fightLineController.applyView($data);
    setTimeout(() => this.refresh());
  }

  openBossAttackAddDialog(bossAbility: M.IBossAbility, callBack: (b: any) => void): void {
    this.dialogService.openBossAttackAddDialog(bossAbility, callBack);
  }

  onBossDownTimeChanged(value: boolean) {
    if (value !== this.isInBossDownTimeMode) {
      this.isInBossDownTimeMode = value;
      this.downTimesController.toggle(this.isInBossDownTimeMode);
    }
  }

  openAbilityEditDialog(data: { settings: M.IAbilitySetting[], values: M.IAbilitySettingData[] }, callBack: (b: any) => void): void {
    this.dialogService.openAbilityEditDialog(data, callBack);
  }

  load(): void {
    if (!this.authenticationService.authenticated) {
      this.notification.showSignInRequired(() => this.login());
      return;
    }

    this.dialogService.openLoad();
  }

  refresh(): void {
    this.visTimelineService.redraw(this.visTimeline);
    this.visTimelineService.redraw(this.visTimelineBoss);
  }

  importFromFFLogs(code: string = null): void {
    this.dialogService
      .openImportFromFFLogs(code || this.fflogsCode)
      .then(result => {
        if (!result) return;
        this.loadFFLogsData(result.code, result.fight);
      });
  }

  loadFFLogsData(code: string, enc: number) {
    this.dialogService.executeWithLoading(ref => {
      this.progressService.start();
      this.ffLogsService.getEvents(code, enc, percentage => this.progressService.set(percentage))
        .then((ev) => {
          this.recent.register("FFLogs " + ev.name, "/fflogs/" + code + "/" + enc);
          const settings = this.settingsService.load();

          this.toolbar.view.set(settings.main.defaultView);
          this.fightLineController.applyView(settings.main.defaultView);
          this.toolbar.filter.set(settings.main.defaultFilter);
          this.fightLineController.applyFilter(settings.main.defaultFilter);

          this.fightLineController.importFromFFLogs(ev);
        })
        .catch(() => {
          this.notification.showUnableToImport();
        })
        .finally(() => {
          this.progressService.done();
          this.setInitialWindow((this.fightLineController.getLatestAbilityUsageTime() || this.startDate).getMinutes() + 2);
          this.refresh();
          ref.close();
        });
    });
  }

  onNew() {
    this.location.replaceState("/new");
    this.fightLineController.new();
  }

  private setInitialWindow(mins: number): void {
    setTimeout(() => {
      this.visTimelineService.setWindow(this.visTimeline,
        this.startDate,
        new Date(new Date(this.startDate).setMinutes(Math.max(mins, 3))),
        { animation: false });
      this.visTimelineService.setWindow(this.visTimelineBoss,
        this.startDate,
        new Date(new Date(this.startDate).setMinutes(Math.max(mins, 3))),
        { animation: false });
    },
      100);
  }

  saveBoss(): void {
    this.dialogService.openSaveBoss(() => this.fightLineController.serializeBoss())
      .then(result => {
        if (result !== null && result !== undefined) {
          this.fightLineController.updateBoss(result);
          this.notification.showBossSaved();
        }
      })
      .catch(reason => {
        this.notification.showBossNotSaved();
      });
  }

  saveFight(): void {
    if (!this.authenticationService.authenticated) {
      this.notification.showSignInRequired(() => this.login());
      return;
    }

    this.dialogService.openSaveFight(() => this.fightLineController.serializeFight())
      .then(result => {
        if (result !== null && result !== undefined) {
          this.recent.register(result.name, '/' + result.id);
          this.fightLineController.updateFight(result);
          this.location.replaceState(`/${result.id}`);
          this.notification.showFightSaved();
        }
      })
      .catch(reason => {
        this.notification.showFightNotSaved();
      });
  }

  addJob(jobName: string, actorName?: string): void {
    this.fightLineController.addJob(null, jobName, actorName, null, false);
  }

  showHelp(): Promise<void> {
    const promise = new Promise<void>((resolve) => {
      this.dialogService.openHelp()
        .then(() => {
          this.storage.setString("help_shown", "yes");
          resolve();
        });
    });

    return promise;
  }

  openSettings(): void {
    this.dialogService.openSettings();
  }

  undo(): void {
    this.fightLineController.undo();
    this.teamWorkService.sendCommand({ name: "undo" });
    this.refresh();
  }

  redo(): void {
    this.fightLineController.redo();
    this.teamWorkService.sendCommand({ name: "redo" });
    this.refresh();
  }

  private onStart(r: any): void {
    this.fflogsCode = null;
    this.showHelpForFirstTimers().then(() => {
      this.showWhatsNew().then(() => {
        const id = r["fightId"];
        if (id === "new") {
          const settings = this.settingsService.load();
          this.onBossDownTimeChanged(false);
          if (settings && settings.main && settings.main.defaultView) {
            this.toolbar.view.set(settings.main.defaultView);
            this.fightLineController.applyView(settings.main.defaultView);
          }
          if (settings && settings.main && settings.main.defaultFilter) {
            this.toolbar.filter.set(settings.main.defaultFilter);
            this.fightLineController.applyFilter(settings.main.defaultFilter);
          }
          return;
        }
        if (id) {
          this.dialogService.executeWithLoading(ref => {
            this.fightService
              .getFight(id)
              .subscribe((fight: M.IFight) => {
                if (fight) {
                  this.recent.register(fight.name, "/" + id.toLowerCase());
                  const data = JSON.parse(fight.data) as ISerializeData;
                  if (data.view)
                    this.toolbar.view.set(data.view);
                  if (data.filter)
                    this.toolbar.filter.set(data.filter);
                  this.fightLineController.loadFight(fight);
                  this.setInitialWindow((this.fightLineController.getLatestBossAttackTime() || this.startDate)
                    .getMinutes() +
                    2);
                  this.refresh();
                }
                ref.close();
              },
                () => {
                  this.notification.showUnableToLoadFight(() => this.router.navigateByUrl("/"));
                  ref.close();
                });
          });

        } else {
          const code = r["code"];
          if (code) {
            this.fflogsCode = code;
            const enc = r["fight"];
            if (enc) {
              this.loadFFLogsData(code, Number.parseInt(enc));
            } else {
              this.importFromFFLogs(code);
            }
          } else {
            const sessionId = r["sessionCode"];
            if (sessionId) {
              this.connectToSession(sessionId);
            }
          }

        }
      });
    });

  }

  ngOnInit(): void {
    this.route.params.subscribe(r => {
      setTimeout(() => { this.onStart(r); });
    });
  }

  startSession() {
    const handlers: S.IStartSessionHandlers = {
      onSync: (() => JSON.stringify(this.fightLineController.serializeFight())).bind(this),
      onCommand: this.handleRemoteCommand.bind(this),
      onConnected: ((data: any) => this.notification.showUserConnected(data)).bind(this),
      onDisconnected: ((data: any) => this.notification.showUserDisonnected(data)).bind(this)
    };

    const settings = this.settingsService.load();
    const name = settings.teamwork.displayName ||
      this.authenticationService.username ||
      "Anonymous";

    this.teamWorkService.startSession(name, handlers)
      .then((result: string) => {
        this.notification.showSessionStarted();
        this.dialogService.openSessionUrl(result);
      })
      .catch(() => {
        this.notification.showUnableToStartSession();
      });
  }

  stopSession() {
    this.teamWorkService.disconnect();
  }

  handleRemoteCommand(data: ICommandData, user: any) {
    this.toolbar.ping(user.id, user.owner);

    if (data.name === "undo") {
      this.fightLineController.undo();
      this.refresh();
    } else if (data.name === "redo") {
      this.fightLineController.redo();
      this.refresh();
    } else {
      this.fightLineController.execute(data);
    }
  }

  connectToSession(sessionId?: string) {
    const handlers: S.IConnectToSessionHandlers = {
      onDataSync: ((data: any) => {
        this.onBossDownTimeChanged(false);
        this.fightLineController.new();
        this.fightLineController.loadFight(JSON.parse(data));
      }).bind(this),
      onCommand: this.handleRemoteCommand.bind(this),
      onConnected: ((data: any) => this.notification.showUserConnected(data)).bind(this),
      onDisconnected: ((data: any) => this.notification.showUserDisonnected(data)).bind(this)
    };

    const settings = this.settingsService.load();
    const name = settings.teamwork.displayName || this.authenticationService.username || "Anonymous";
    this.teamWorkService.connectToSession(sessionId, name, handlers)
      .then(() => {
        this.notification.showConnectedToSession();
      })
      .catch(() => {
        this.notification.showConnectedToSessionError();
      });
  }

  showHelpForFirstTimers(): Promise<void> {
    if (!this.storage.getString("help_shown")) {
      return this.showHelp();
    }
    return Promise.resolve();
  }

  @HostListener("window:beforeunload", ["$event"])
  beforeUnloadHandler(event: any) {
    if (this.hasChanges) {
      event.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      return event.returnValue;
    }
    return null;
  }

  @HostListener("window:unload", ["$event"])
  unloadHandler(event: any) {
    this.teamWorkService.disconnect();
  }

  public get hasChanges(): boolean {
    return this.fightLineController.hasChanges;
  }

  ngOnDestroy(): void {
    this.visTimelineService.off(this.visTimeline, "click");
    this.visTimelineService.off(this.visTimelineBoss, "click");
    this.visTimelineService.off(this.visTimeline, "contextmenu");
    this.visTimelineService.off(this.visTimeline, "select");
    this.visTimelineService.off(this.visTimelineBoss, "select");
    this.visTimelineService.off(this.visTimeline, "timechanged");
    this.visTimelineService.off(this.visTimeline, "timechange");
    this.visTimelineService.off(this.visTimeline, "rangechange");
    this.visTimelineService.off(this.visTimelineBoss, "rangechange");

    this.teamWorkService.disconnect();
  }

  privacy() {
    window.open("/privacy", "_blank");
  }

  gotoDiscord() {
    window.open("https://discord.gg/xRppKj4", "_blank");
  }

  showAsTable() {
    this.dialogService.openTable(() => this.fightLineController.serializeForExport());
  }

  openBossTemplates() {
    this.dialogService.openBossTemplates(() => this.fightLineController.serializeBoss());
  }

  showWhatsNew() {

    const promise = new Promise<void>((resolve) => {
      const changes = ChangeNotes.changes;
      const latestRev = changes[0];
      const value = this.storage.getString("whatsnew_shown");
      if (value) {

        if (Number.parseInt(value) >= latestRev.revision) {
          resolve();
          return;
        }
      }

      const ref = this.showWhatsNewInt(changes);
      ref.then(() => {
        this.storage.setString("whatsnew_shown", latestRev.revision.toString());
        resolve();
      });
    });
    return promise;
  }

  showWhatsNewInt(change?: any) {
    return this.dialogService.openWhatsNew(change, ChangeNotes.changes);
  }

  private subscribeToDispatcher(dispatcher: S.DispatcherService) {
    dispatcher.on("SidePanel Similar Click").subscribe(value => {
      this.visTimelineService.setSelectionToId(this.visTimelineBoss, value);
      this.setSelectionOfBossAttacks([value]);
      this.fightLineController.notifySelect("enemy", value);
      this.visTimelineService.focusOnId(this.visTimelineBoss, value, { animation: false });
      const w = this.visTimelineService.getWindow(this.visTimelineBoss);
      this.visTimelineService.setWindow(this.visTimeline, w.start, w.end, { animation: false });
      this.sidepanel.setItems(this.fightLineController.getItems([value]), this.fightLineController.getHolders());
    });
    dispatcher.on("SidePanel Similar All Click").subscribe(value => {
      this.visTimelineService.setSelectionToIds(this.visTimelineBoss, value);
      this.setSelectionOfBossAttacks(value);
      this.fightLineController.notifySelect("enemy",value);
      this.visTimelineService.focusOnIds(this.visTimelineBoss, value, { animation: false });
      const w = this.visTimelineService.getWindow(this.visTimelineBoss);
      this.visTimelineService.setWindow(this.visTimeline, w.start, w.end, { animation: false });
      this.sidepanel.setItems(this.fightLineController.getItems(value), this.fightLineController.getHolders());
    });

    dispatcher.on("SidePanel Defense Click").subscribe(value => {
      this.visTimelineService.setSelectionToId(this.visTimeline, value);
      this.visTimelineService.setSelectionToId(this.visTimelineBoss, value);
      this.setSelectionOfBossAttacks([]);
      this.fightLineController.notifySelect("friend", value);
      this.visTimelineService.focusOnId(this.visTimeline, value, { animation: false });
      const w = this.visTimelineService.getWindow(this.visTimeline);
      this.visTimelineService.setWindow(this.visTimelineBoss, w.start, w.end, { animation: false });
      this.sidepanel.setItems(this.fightLineController.getItems([value]), this.fightLineController.getHolders());
    });
  }
}
