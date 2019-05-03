import { Component, Inject, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl } from "@angular/forms"
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSelectionList, MatSelectionListChange } from "@angular/material";


import { FFLogsService } from "../../services/FFLogsService"
import { Utils } from "../../core/Utils"
import { ReportFightsResponse } from "../../core/FFLogs"

import "rxjs/add/observable/merge";
import "rxjs/add/observable/empty";

@Component({
  selector: "ffLogsImportDialog",
  templateUrl: "./ffLogsImportDialog.component.html",
  styleUrls: ["./ffLogsImportDialog.component.css"],
})

export class FFLogsImportDialog{
 

  @ViewChild("fights") public fights: MatSelectionList;
  reportSearchControl = new FormControl();
  container: any = { zones: [] };
  code: string;
  searchAreaDisplay = "none";
  dialogContentHeight = "60px";

  constructor(
    public dialogRef: MatDialogRef<FFLogsImportDialog>,
    public service: FFLogsService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    if (data) {
      this.reportSearchControl.setValue(data);
      this.onSearch();
    }

  }

  onSearch(): void {
    this.code = this.reportSearchControl.value;
    const r = /reports\/([a-zA-Z0-9]{16})\/?(?:(?:#.*fight=([^&]*))|$)/igm;
    const res = r.exec(this.reportSearchControl.value) as any;
    if (res && res.length > 1) {
      if (res[1]) {
        this.code = res[1];
        if (res[2]) {
          if (res[2] !== "last") {
            this.dialogRef.afterClosed().subscribe(() => {
              this.router.navigateByUrl("fflogs/" + this.code + "/" + res[2]);
            });
            this.dialogRef.close();
            return;
          } else {
            this.service.getFight(this.code)
              .then((it: ReportFightsResponse) => {
                const id = it.fights[it.fights.length - 1].id;
                this.onClick(""+id);
                return;
              });
          }
        }
      }
    }

    this.service.getFight(this.code)
      .then((it: ReportFightsResponse) => {
        this.dialogContentHeight = "360px";
        this.searchAreaDisplay = "block";
        this.dialogRef.updateSize("700px", "500px");

        const groupBy = key => array =>
          array.reduce((objectsByKeyValue, obj) => {
            const value = obj[key];
            objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
            return objectsByKeyValue;
          }, {});

        var gr = groupBy('zoneName');

        this.container.zones = gr(it.fights);
      });
  }

  onClick(id: string) {
    this.dialogRef.afterClosed().subscribe(() => {
      this.router.navigateByUrl("fflogs/" + this.code + "/" + id);
    });
    this.dialogRef.close();
  }

  onMatch(data: string) {
    this.onSearch();
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
    const fight = this.fights.selectedOptions.selected[0].value;
    this.dialogRef.afterClosed().subscribe(() => {
      this.router.navigateByUrl("fflogs/" + this.code + "/" + fight);
    });
    this.dialogRef.close();
  }
}
