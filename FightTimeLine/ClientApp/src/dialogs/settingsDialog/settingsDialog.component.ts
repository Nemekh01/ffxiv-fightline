import { Component, OnInit, OnDestroy, ViewChild, ViewChildren, QueryList, HostListener, Inject, EventEmitter } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl } from "@angular/forms"
import { SettingsFilterComponent } from "./filter/settingsFilter.component"
import { SettingsViewComponent } from "./view/settingsView.component"
import { SettingsService, ISettings } from "../../services/SettingsService";
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { NzModalRef } from "ng-zorro-antd";


@Component({
  selector: "settingsDialog",
  templateUrl: "./settingsDialog.component.html",
  styleUrls: ["./settingsDialog.component.css"]
})

export class SettingsDialog {

  mainForm: FormGroup;
  fflogsForm: FormGroup;
  teamworkForm: FormGroup;
  tableViewForm: FormGroup;

  container: any = {
    classes: [
      { name: "Tank", icon: "/assets/images/JobIcons/clear_tank.png" },
      { name: "Heal", icon: "/assets/images/JobIcons/clear_healer.png" },
      { name: "DD", icon: "/assets/images/JobIcons/clear_dps.png" },
    ]
  }

  @ViewChild("filter")
  filter: SettingsFilterComponent;
  @ViewChild("view")
  view: SettingsViewComponent;

  constructor(
    private dialogRef: NzModalRef,
    private formBuilder: FormBuilder,
    private settingsService: SettingsService) {

    (this.dialogRef.getInstance().nzOnOk as EventEmitter<any>).subscribe(() => {
      this.onYesClick();
    });

    (this.dialogRef.getInstance().nzOnOk as EventEmitter<any>).subscribe(() => {
      this.onNoClick();
    });

  }

  ngOnInit() {
    const settings = this.settingsService.load();
    const sortOrder = settings.fflogsImport.sortOrderAfterImport;

    this.container.classes = this.container.classes.sort((a, b) => sortOrder.indexOf(a.name) - sortOrder.indexOf(b.name));
    this.filter.set(settings.main.defaultFilter);
    this.view.set(settings.main.defaultView);


    this.mainForm = this.formBuilder.group({}, {});
    this.fflogsForm = this.formBuilder.group({
      bossAttacksSource: new FormControl(settings.fflogsImport.bossAttacksSource)
    }, {});
    this.teamworkForm = this.formBuilder.group({
      displayName: new FormControl(settings.teamwork.displayName || "")
    }, {});
    this.tableViewForm = this.formBuilder.group({}, {});
  }

  get mf() { return this.mainForm.controls; }
  get ff() { return this.fflogsForm.controls; }
  get tf() { return this.teamworkForm.controls; }
  get tvf() { return this.tableViewForm.controls; }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.container.classes, event.previousIndex, event.currentIndex);
  }

  onYesClick() {

    const settings = this.settingsService.load();
    this.updateResult(settings);
    this.settingsService.save(settings);
    this.dialogRef.destroy();

  }

  updateResult(settings: ISettings): void {
    settings.fflogsImport.bossAttacksSource = this.ff.bossAttacksSource.value;
    settings.fflogsImport.sortOrderAfterImport = this.container.classes.map(it => it.name);

    settings.main.defaultView = this.view.get();
    settings.main.defaultFilter = this.filter.get();

    settings.teamwork.displayName = this.tf.displayName.value;
  }

  onNoClick(): void {
    this.dialogRef.destroy();
  }
}
