import { Component, Inject, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSelectionList } from "@angular/material";
import { FightsService } from "../../services/FightService"
import { ScreenNotificationsService } from "../../services/ScreenNotificationsService"
import "rxjs/add/observable/merge";
import "rxjs/add/observable/empty";


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
      }, (error) => {
        this.notification.showUnableToLoadFights();
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
    private notification: ScreenNotificationsService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }
  getItemsCountString(): string {
    const count = this.selectedRowsChecked.length;
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
      const itemsToRemove = this.selectedRowsChecked;
      this.service.removeFights(itemsToRemove)
        .subscribe(() => {
          this.removeSelectedRows(itemsToRemove);
          this.loading = false;
          this.confirmMode = false;
        },
          error => {
            this.notification.showUnableToRemoveFights();
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
      const index: number = this.container.fights.findIndex(d => d.id === item);
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
