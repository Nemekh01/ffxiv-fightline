import { Component, Inject, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl } from "@angular/forms"
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSelectionListChange, MatSelectionList } from "@angular/material";
import { Observable } from "rxjs/Observable";
import { catchError, map, tap, startWith, switchMap, debounceTime, distinctUntilChanged, takeWhile, first } from "rxjs/operators";
import { FightsService } from "../../services/FightService"
import "rxjs/add/observable/merge";
import "rxjs/add/observable/empty";
import { mapTo, delay } from 'rxjs/operators';
import { ConfirmDialog } from "../confirmDialog/confirmDialog.component";

@Component({
  selector: "fightLoadDialog",
  templateUrl: "./fightLoadDialog.component.html",
  styleUrls: ["./fightLoadDialog.component.css"]
})

export class FightLoadDialog {

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.service.getFightsForUser()
      .subscribe((it: any) => {
        this.container.fights = it;
        this.loading = false;
        this.confirmMode = false;
      });
  }

  @ViewChild("fights") public fights: MatSelectionList;
  container: any = { fights: [] };
  removing = false;
  loading = true;
  confirmMode = false;
  selectedRowsChecked = [];

  constructor(
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<FightLoadDialog>,
    public service: FightsService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }
  getItemsCountString(): string {
    let count = this.selectedRowsChecked.length;
    switch (count) {
      case 0:
        return "";
      case 1:
        return count + " item";
      default:
        return count + " items";
    }
  }

  onRemoveClick(): void {
    if (this.confirmMode) {
      this.removing = true;
      let itemsToRemove = this.selectedRowsChecked;
      this.service.removeFights(itemsToRemove)
        .subscribe(() => {
          this.removeSelectedRows(itemsToRemove);
          this.loading = false;
          this.confirmMode = false;
        },
          error => {
            console.error(error);
          },
          () => {
            this.removing = false;
            this.confirmMode = false;
            this.selectedRowsChecked.splice(0);
          });
    } else {
      this.confirmMode = true;
    }

  }

  removeSelectedRows(itemsToRemove) {

    itemsToRemove.forEach(item => {
      let index: number = this.container.fights.findIndex(d => d.id === item);
      if (index > -1) {
        this.container.fights.splice(index, 1);
      }
    });
  }

  onCancelClick() {
    this.confirmMode = false;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onYesClick(): void {

    this.dialogRef.afterClosed().subscribe(() => {
      this.router.navigateByUrl("/" + this.selectedRowsChecked[0]);
    });

    this.dialogRef.close();
  }
}
