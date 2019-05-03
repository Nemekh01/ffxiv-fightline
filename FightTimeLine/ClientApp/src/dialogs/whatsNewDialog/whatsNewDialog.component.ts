import { Component, Inject } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";


@Component({
    selector: "whatsNewDialog",
    templateUrl: "./whatsNewDialog.component.html",
    styleUrls: ["./whatsNewDialog.component.css"]
})

export class WhatsNewDialog {

   

    constructor(
        public dialogRef: MatDialogRef<WhatsNewDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
