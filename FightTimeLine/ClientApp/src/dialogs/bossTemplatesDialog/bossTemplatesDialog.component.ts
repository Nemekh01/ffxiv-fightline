import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl } from "@angular/forms"
import {finalize} from "rxjs/operators"
import { NzModalRef } from "ng-zorro-antd"
import {FFLogsService} from "../../services/FFLogsService"

@Component({
  selector: "bossTemplatesDialog",
  templateUrl: "./bossTemplatesDialog.component.html",
  styleUrls: ["./bossTemplatesDialog.component.css"]
})

export class BossTemplatesDialog implements OnInit {
  ngOnInit(): void {
    this.zones = this.ffLogsService.getZones().pipe(finalize(()=> this.isSpinning = false));
  }

  isSpinning: boolean = true;

  public zones: any;
  public templates: any[] = Array.apply(null, { length: 50 }).map(Number.call, Number).map((value: any, index: number) => {
    return {
      name: `template${index}`
    }
  });

  public searchControl: FormControl = new FormControl();

  constructor(
    public dialogRef: NzModalRef,
    public ffLogsService: FFLogsService
  ) {
//    this.searchControl.valueChanges.subscribe(value => {
//      this.zones = this.ZONES.filter((it: any) => !value || it.name.indexOf(value) >= 0);
//    });
  }

  onSearchChange(event: any) {

  }

  onEncounterSelected(enc: any) {
    console.log(enc.name);
  }

  onNoClick(): void {
    this.dialogRef.destroy();
  }
}
