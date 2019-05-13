import { Component, Inject, OnInit, ViewChild, ElementRef, OnDestroy, TemplateRef } from "@angular/core";
import { finalize, filter, map } from "rxjs/operators"
import { Observable, BehaviorSubject } from "rxjs"
import { NzModalRef } from "ng-zorro-antd"
import { Zone } from "../../core/FFLogs"
import * as M from "../../core/Models"
import { Utils } from "../../core/Utils"
import { FFLogsService } from "../../services/FFLogsService"
import { DispatcherService } from "../../services/dispatcher.service"
import { fightServiceToken } from "../../services/fight.service-provider"
import { IFightService } from "../../services/fight.service-interface"
import { VisTimelineService, VisTimelineItems, VisTimelineGroups, VisTimelineItem, VisTimelineOptions } from "ngx-vis";

@Component({
  selector: "bossTemplatesDialog",
  templateUrl: "./bossTemplatesDialog.component.html",
  styleUrls: ["./bossTemplatesDialog.component.css"]
})

export class BossTemplatesDialog implements OnInit, OnDestroy {

  visItems: VisTimelineItems = new VisTimelineItems();
  visGroups: VisTimelineGroups = new VisTimelineGroups();
  visTimelineBoss: string = "visTimelinebooooosss";
  startDate = new Date(946677600000);
  @ViewChild("timeline") timeline: ElementRef;
  @ViewChild("listContainer") listContainer: ElementRef;
  @ViewChild("buttonsTemplate") buttonsTemplate: TemplateRef<any>;

  optionsBoss = <VisTimelineOptions>{
    width: "100%",
    height: "100%",
    minHeight: "50px",
    autoResize: true,
    start: this.startDate,
    end: new Date(new Date(this.startDate).setMinutes(30)),
    max: new Date(new Date(this.startDate).setMinutes(30)),
    min: new Date(this.startDate),
    zoomable: true,
    zoomMin: 3 * 60 * 1000,
    zoomMax: 30 * 60 * 1000,
    zoomKey: "ctrlKey",
    moveable: true,
    type: "box",
    multiselect: false,
    showCurrentTime: false,
    stack: true,
    orientation: "bottom",
    stackSubgroups: true,
    editable: { remove: false, updateTime: false, add: false },
    horizontalScroll: true,
    margin: { item: { horizontal: 0, vertical: 5 } }
  };
  isSpinning: boolean = true;
  searchString: string;
  searchFightString: string;
  zones: any;
  filteredZones: any;
  selectedZone: string;
  selectedEncounter: any;
  selectedTemplate: any;
  templates: any = [];

  constructor(
    private dialogRef: NzModalRef,
    private ffLogsService: FFLogsService,
    @Inject(fightServiceToken) private fightService: IFightService,
    private visTimelineService: VisTimelineService,
    private dispatcher: DispatcherService
  ) {

  }

  ngOnInit(): void {
    this.dialogRef.getInstance().nzFooter = this.buttonsTemplate;
    this.ffLogsService.getZones()
      .pipe(
        map((v, i) => {
          return v.filter(x => x.brackets && x.brackets.min >= 4);
        }),
        finalize(() => this.isSpinning = false))
      .subscribe(val => {
        this.zones = val;
        this.filteredZones = val;
      });
    this.visTimelineService.createWithItems(this.visTimelineBoss, this.timeline.nativeElement, this.visItems, this.optionsBoss);

  }

  onSearchChange(event: any) {
    this.filteredZones =
      this.zones.
        filter(
          (zone: Zone) => {
            return !this.searchString || zone.encounters.some(x => x.name.toLowerCase().indexOf(this.searchString) >= 0);
          }
        );
  }

  clear() {
    this.searchString = "";
    this.onSearchChange("");
  }

  filterEncounters(items: any[]) {

    return items.filter(x => !this.searchString || x.name.toLowerCase().indexOf(this.searchString.toLowerCase()) >= 0);

  }

  onEncounterSelected(zone, enc: any) {
    console.log(enc.name);
    this.selectedZone = zone;
    this.selectedEncounter = enc;
    this.fightService.getBosses(enc.id, "", false).subscribe((data) => {
      this.templates = data;
    });
    this.listContainer.nativeElement.scrollTop = 0;
  }

  onNoClick(): void {
    this.dialogRef.destroy();
  }

  select(item: any) {
    this.selectedTemplate = item;
    const data = JSON.parse(item.data);
    this.visItems.clear();
    this.visItems.add(data.attacks.map(a => this.createBossAttack(a.id, a.ability as M.IBossAbility, false)));
  }


  createBossAttack(id: string, attack: M.IBossAbility, vertical: boolean): VisTimelineItem {
    const cls = { bossAttack: true, vertical: vertical };
    cls[M.DamageType[attack.type]] = true;
    const data = {
      id: id,
      content: this.createBossAttackElement(attack),
      start: Utils.getDateFromOffset(attack.offset),
      type: "box",
      className: "bossAttack " + M.DamageType[attack.type]
    }
    return data;
  }

  private createBossAttackElement(ability: M.IBossAbility): string {
    return `<div><div class='marker'></div><div class='name'>${Utils.escapeHtml(ability.name)}</div></div>`;
  }

  clearTemplates() {
    this.searchFightString = "";
  }

  ngOnDestroy(): void {
    this.visTimelineService.destroy(this.visTimelineBoss);
  }

  save() {
    this.dispatcher.dispatch({
      name: "BossTemplates Save",
      payload: {
        name: "Test name",
        reference: this.selectedEncounter && this.selectedEncounter.id || 0,
        isPrivate: false
      }
    });
  }

  load() {
    this.dispatcher.dispatch({
      name: "BossTemplates Load",
      payload: {
        boss: this.selectedTemplate,
        encounter: this.selectedEncounter.id
      }
    });
    this.dialogRef.destroy();
  }
}
