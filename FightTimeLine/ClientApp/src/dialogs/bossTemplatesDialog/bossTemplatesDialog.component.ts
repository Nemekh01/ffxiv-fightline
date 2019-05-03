import { Component, Inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl } from "@angular/forms"
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";


@Component({
    selector: "bossTemplatesDialog",
    templateUrl: "./bossTemplatesDialog.component.html",
    styleUrls: ["./bossTemplatesDialog.component.css"]
})

export class BossTemplatesDialog {

    private ZONES: any[] = Array.apply(null, { length: 50 }).map(Number.call, Number).map((value:any, index:number) => {
        return {
            name: `zone${index}`
        }
    });

    public zones: any[] = this.ZONES;
    public templates: any[] = Array.apply(null, { length: 50 }).map(Number.call, Number).map((value: any, index: number) => {
        return {
            name: `template${index}`
        }
    });

    public searchControl: FormControl = new FormControl();

    constructor(
        public dialogRef: MatDialogRef<BossTemplatesDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.searchControl.valueChanges.subscribe(value => {
            this.zones = this.ZONES.filter((it:any) => !value || it.name.indexOf(value) >= 0);
        });
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
