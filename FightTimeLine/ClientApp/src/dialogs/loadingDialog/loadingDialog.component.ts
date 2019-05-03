import { Component, Inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl } from "@angular/forms"
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

@Component({
    selector: "loadingDialog",
    templateUrl: "./loadingDialog.component.html",
    styleUrls: ["./loadingDialog.component.css"]
})
export class LoadingDialog {
    constructor(
        public dialogRef: MatDialogRef<LoadingDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) {

    }
}

