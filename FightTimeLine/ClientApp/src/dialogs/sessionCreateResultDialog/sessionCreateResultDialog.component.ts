import { Component, Inject } from "@angular/core";
import { FormControl } from "@angular/forms"
import { MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

@Component({
    selector: "sessionCreateResultDialog",
    templateUrl: "./sessionCreateResultDialog.component.html",
    styleUrls: ["./sessionCreateResultDialog.component.css"]
})

export class SessionCreateResultDialog {
    constructor(
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<SessionCreateResultDialog>,
        @Inject(MAT_DIALOG_DATA) public data: string) {
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onCopied() {
        this.snackBar.open("Url has been copied to clipboard", null, { duration: 2000 });
    }
}
