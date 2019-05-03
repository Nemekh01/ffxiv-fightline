import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl } from "@angular/forms"
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { IBossAbility } from "../../core/Models";
import { Time } from "../../heplers/TimeValidator";

@Component({
  selector: "bossAttackDialog",
  templateUrl: "./bossAttackDialog.component.html",
  styleUrls: ["./bossAttackDialog.component.css"]
})

export class BossAttackDialog {

  editForm: FormGroup;
  submitted = false;


  newAttack = true;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<BossAttackDialog>,
    @Inject(MAT_DIALOG_DATA) public data: IBossAbility) {
    this.newAttack = !data;
  }

  ngOnInit() {
    this.editForm = this.formBuilder.group({
      bossAttackName: new FormControl(this.data.name, Validators.required),
      damageType: new FormControl(this.data.type, Validators.required),
      bossAttackTime: new FormControl(this.data.offset, Validators.required),
      tankBuster: new FormControl(this.data.isTankBuster),
      aoe: new FormControl(this.data.isAoe),
      share: new FormControl(this.data.isShareDamage),
    }, {
        validator: Time('bossAttackTime')
      });
  }

  get f() { return this.editForm.controls; }

  onNoClick(): void {
    this.dialogRef.close();
  }

  updateResult(): void {
    this.data.name = this.f.bossAttackName.value;
    this.f.bossAttackTime.updateValueAndValidity({ onlySelf: true });
    this.data.offset = this.f.bossAttackTime.value;
    this.data.type = this.f.damageType.value;
    this.data.isTankBuster = this.f.tankBuster.value;
    this.data.isAoe = this.f.aoe.value;
    this.data.isShareDamage = this.f.share.value;
  }

  onSaveClick(): void {
    this.submitted = true;

    if (this.editForm.invalid) {
      Object.keys(this.editForm.controls).forEach(it => {
        this.editForm.controls[it].markAsTouched({ onlySelf: true });
      });
      return;
    }
    this.updateResult();

    this.dialogRef.close({ updateAllWithSameName: false, data: this.data });
  };

  onSaveAllClick(): void {
    this.submitted = true;

    if (this.editForm.invalid) {
      Object.keys(this.editForm.controls).forEach(it => {
        this.editForm.controls[it].markAsTouched({ onlySelf: true });
      });
      return;
    }
      
    this.updateResult();

    this.dialogRef.close({ updateAllWithSameName: true, data: this.data });
  };
}

