import { Component, Inject } from "@angular/core";
import { FormControl } from "@angular/forms"
import { MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { IFight } from "../../core/Models"
import { FightsService } from "../../services/FightService"
import "rxjs/add/observable/merge";

@Component({
    selector: "fightSaveDialog",
    templateUrl: "./fightSaveDialog.component.html",
    styleUrls: ["./fightSaveDialog.component.css"]
})

export class FightSaveDialog {
    fightNameControl = new FormControl();

    constructor(
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<FightSaveDialog>,
        public service: FightsService,
        @Inject(MAT_DIALOG_DATA) public data: IFight) {
    }

    onSaveClick(): void {
        if (!this.fightNameControl.valid) {
            this.fightNameControl.markAsTouched({ onlySelf: true });
            return;
        }

        this.service
            .saveFight(this.data)
            .subscribe((data) => {
                this.dialogRef.close(data);
            }, this.handleSaveError.bind(this));

    }

    onSaveAsNewClick(): void {
        if (!this.fightNameControl.valid) {
            this.fightNameControl.markAsTouched({ onlySelf: true });
            return;
        }
        this.data.id = "";
        this.service
            .saveFight(this.data)
            .subscribe((data) => {
                this.dialogRef.close(data);
            },this.handleSaveError.bind(this));

    }

    handleSaveError(error: any) {
        console.log(error);
        let text: string = error.statusText;
        if (error.status === 403) {
            text = "Invalid Username or Secret used to update this Fight";
        }
        this.snackBar.open(text, null, {
            duration: 5000
        });
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
