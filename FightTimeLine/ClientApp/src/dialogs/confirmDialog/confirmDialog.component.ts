import { Component, Inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl } from "@angular/forms"
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

@Component({
  selector: "confirmDialog",
  templateUrl: "./confirmDialog.component.html",
  styleUrls: ["./confirmDialog.component.css"]
})
export class ConfirmDialog {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

  }

  onNoClick() {
    this.dialogRef.close(false);
  }

  onYesClick() {
    this.dialogRef.close(true);
  }

}

