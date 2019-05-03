import { Component, Inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl } from "@angular/forms"
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { IAbilitySetting, IAbilitySettingData } from "../../core/Models";

@Component({
    selector: "abilityEditDialog",
    templateUrl: "./abilityEditDialog.component.html",
    styleUrls: ["./abilityEditDialog.component.css"]
})
export class AbilityEditDialog {
    form: FormGroup;   

    constructor(
        public dialogRef: MatDialogRef<AbilityEditDialog>,
        @Inject(MAT_DIALOG_DATA) public data: {settings: IAbilitySetting[], values:IAbilitySettingData[]}) {

        const group: any = {};

        for (let d of data.settings) {
            const value = data.values && data.values.find((it) => it.name === d.name);
            group[d.name] = new FormControl(value ? value.value : d.default);
        }

        this.form = new FormGroup(group);

    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onYesClick(): void {
        const settings = new Array<IAbilitySettingData>();

        const controls = this.form.controls;
        for (let d in controls) {
            if (controls.hasOwnProperty(d)) {
                const control = controls[d];
                settings.push({ name: d, value: control.value });
            }
        }

        this.dialogRef.close(settings);
    };
}

