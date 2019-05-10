import { Component, Inject, ViewChild, Input, OnInit, TemplateRef } from "@angular/core";
import { Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl } from "@angular/forms"

import { FFLogsService } from "../../services/FFLogsService"
import { RecentActivityService } from "../../services/RecentActivitiesService"
import { Utils } from "../../core/Utils"
import { ReportFightsResponse } from "../../core/FFLogs"

import "rxjs/add/observable/merge";
import "rxjs/add/observable/empty";
import { NzModalRef } from "ng-zorro-antd";

@Component({
  selector: "ffLogsImportDialog",
  templateUrl: "./ffLogsImportDialog.component.html",
  styleUrls: ["./ffLogsImportDialog.component.css"],
})

export class FFLogsImportDialog implements OnInit {

  ngOnInit(): void {
    if (this.code)
      this.reportValue = "https://www.fflogs.com/reports/" + this.code;
    this.dialogRef.getInstance().nzFooter = this.buttonsTemplate;
    this.onSearch(this.reportValue);
  }

  reportValue: string;

  container: any = { zones: [] };
  @ViewChild("buttonsTemplate") buttonsTemplate: TemplateRef<any>;
  @Input() code: string;
  searchAreaDisplay = "none";
  dialogContentHeight = "60px";
  recent: any;


  constructor(
    public dialogRef: NzModalRef,
    public service: FFLogsService,
    public recentService: RecentActivityService,
    private router: Router) {

  }

  onSearch(data: string): void {
    const r = /reports\/([a-zA-Z0-9]{16})\/?(?:(?:#.*fight=([^&]*))|$)/igm;
    const res = r.exec(data) as any;
    if (res && res.length > 1) {
      if (res[1]) {
        this.code = res[1];
        if (res[2]) {
          if (res[2] !== "last") {
            this.dialogRef.afterClose.subscribe(() => {
              this.router.navigateByUrl("fflogs/" + this.code + "/" + res[2]);
            });
            this.dialogRef.close();
            return;
          } else {
            this.service.getFight(res[1])
              .then((it: ReportFightsResponse) => {
                const id = it.fights[it.fights.length - 1].id;
                this.onClick("" + id);
                return;
              });
          }
        } else {
          this.service.getFight(res[1])
            .then((it: ReportFightsResponse) => {
              this.dialogContentHeight = "360px";
              this.searchAreaDisplay = "block";
              const groupBy = key => array =>
                array.reduce((objectsByKeyValue, obj) => {
                  const value = obj[key];
                  objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
                  return objectsByKeyValue;
                },
                  {});

              var gr = groupBy('zoneName');

              this.container.zones = gr(it.fights);
            });
        }
      }
    } else {
      this.dialogContentHeight = "60px";
      this.searchAreaDisplay = "none";
    }
  }

  onClick(id: string) {
    this.dialogRef.afterClose.subscribe(() => {
      this.router.navigateByUrl("fflogs/" + this.code + "/" + id);
    });
    this.dialogRef.close();
  }

  onMatch(data: string) {
    this.onSearch(data);
  }


  formatTime(start: number, end: number): string {
    const diff = (end - start);
    const date = new Date(946677600000 + diff);
    return Utils.formatTime(date);
  }


  onNoClick(): void {
    this.dialogRef.close();
  }

  onYesClick(): void {
    //    const fight = this.fights.selectedOptions.selected[0].value;
    //    this.dialogRef.afterClose.subscribe(() => {
    //      this.router.navigateByUrl("fflogs/" + this.code + "/" + fight);
    //    });
    //    this.dialogRef.close();
  }
}
