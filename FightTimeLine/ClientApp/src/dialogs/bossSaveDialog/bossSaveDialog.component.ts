import { Component, Inject } from "@angular/core";
import { FormControl } from "@angular/forms"
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { IBoss } from "../../core/Models"
import { FightsService } from "../../services/FightService"
import { MatSnackBar} from "@angular/material";
import "rxjs/add/observable/merge";

@Component({
    selector: "bossSaveDialog",
    templateUrl: "./bossSaveDialog.component.html",
    styleUrls: ["./bossSaveDialog.component.css"]
})

export class BossSaveDialog {

    userNameControl = new FormControl();
    secretControl = new FormControl();
    bossNameControl = new FormControl();
    authorControl = new FormControl();
    public expanded = false;

    constructor(
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<BossSaveDialog>,
        public service: FightsService,
        @Inject(MAT_DIALOG_DATA) public data: IBoss) {
        if (data.userName || data.secret)
            this.expanded = true;
    }

    onSaveClick(): void {
        if (!this.userNameControl.valid ||
            !this.secretControl.valid ||
            !this.bossNameControl.valid ||
            !this.authorControl.valid) {

            this.userNameControl.markAsTouched({ onlySelf: true });
            this.secretControl.markAsTouched({ onlySelf: true });
            this.bossNameControl.markAsTouched({ onlySelf: true });
            this.authorControl.markAsTouched({ onlySelf: true });
            return;

        }

        this.service
            .saveBoss(this.data)
            .subscribe((data) => {
                this.dialogRef.close(data);
            }, this.handleSaveError.bind(this));

    }

    handleSaveError(error:any) {
        console.log(error);
        let text: string = error.statusText;
        if (error.status === 403) {
            text = "Invalid Username or Secret used to update this Boss";
        }
        this.snackBar.open(text, null, {
            duration: 5000
        });
    }

    onSaveAsNewClick(): void {
        if (!this.userNameControl.valid ||
            !this.secretControl.valid ||
            !this.bossNameControl.valid ||
            !this.authorControl.valid) {

            this.userNameControl.markAsTouched({ onlySelf: true });
            this.secretControl.markAsTouched({ onlySelf: true });
            this.bossNameControl.markAsTouched({ onlySelf: true });
            this.authorControl.markAsTouched({ onlySelf: true });
            return;

        }
        this.data.id = "";
        this.service
            .saveBoss(this.data)
            .subscribe((data) => {
                this.dialogRef.close(data);
            }, this.handleSaveError.bind(this));

    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
