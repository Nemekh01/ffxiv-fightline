import { Component, Inject, ViewChild, TemplateRef, Input } from "@angular/core";
import { Router } from "@angular/router";
import { IFightService } from "../../services/fight.service-interface"
import { fightServiceToken } from "../../services/fight.service-provider"
import { ScreenNotificationsService } from "../../services/ScreenNotificationsService"
import "rxjs/add/observable/merge";
import "rxjs/add/observable/empty";
import { NzModalRef, NzListComponent } from "ng-zorro-antd"


@Component({
  selector: "fightLoadDialog",
  templateUrl: "./fightLoadDialog.component.html",
  styleUrls: ["./fightLoadDialog.component.css"]
})

export class FightLoadDialog {

  ngOnInit(): void {
    this.dialogRef.getInstance().nzFooter = this.buttonsTemplate;
    this.load();
  }

  load() {
    this.loading = true;
    this.service.getFightsForUser()
      .subscribe((it: any) => {
        this.container.fights = it;
        this.loading = false;
      }, (error) => {
        this.notification.showUnableToLoadFights();
        this.loading = false;
      });
  }


  @Input("data") data: any;
  @ViewChild("buttonsTempalte") public buttonsTemplate: TemplateRef<any>;
  container: any = { fights: [] };
  loading = true;
  selectedRowsChecked = [];

  constructor(
    public dialogRef: NzModalRef,
    @Inject(fightServiceToken) public service: IFightService,
    private router: Router,
    private notification: ScreenNotificationsService) {
    
  }

  remove(item: any) {
    this.service.removeFights([item.id])
      .subscribe(() => {
        this.removeSelectedRows([item.id]);
        this.loading = false;
      },
        error => {
          this.notification.showUnableToRemoveFights();
          console.error(error);
        },
        () => {
          this.selectedRowsChecked.splice(0);
        });
  }

  removeSelectedRows(itemsToRemove) {

    itemsToRemove.forEach(item => {
      const index: number = this.container.fights.findIndex(d => d.id === item);
      if (index > -1) {
        this.container.fights.splice(index, 1);
      }
    });
  }  

  onNoClick(): void {
    this.dialogRef.destroy();
  }

  select(item: any): void {

    this.dialogRef.afterClose.subscribe(() => {
      this.router.navigateByUrl("/" + item.id);
    });

    this.dialogRef.destroy();
  }
}
