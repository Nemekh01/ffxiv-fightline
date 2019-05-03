import { Component, Inject } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { IExportResultSet } from "../../core/BaseExportTemplate"
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl } from "@angular/forms"
import { FirstTemplate } from "../../core/ExportTemplates/FirstTemplate"
import { EachRowOneSecondTemplate } from "../../core/ExportTemplates/EachRowOneSecondTemplate"
import { BossAttackDefensiveTemplate } from "../../core/ExportTemplates/BossAttackDefensiveTemplate"
import { ExportTemplate, ExportData,IExportResultItem } from "../../core/BaseExportTemplate"


@Component({
    selector: "tableViewDialog",
    templateUrl: "./tableViewDialog.component.html",
    styleUrls: ["./tableViewDialog.component.css"]
})

export class TableViewDialog {

    public exportTemplatesControl = new FormControl();
    public set: IExportResultSet;
    public columnNames: string[];
    templates: ExportTemplate[] = [new FirstTemplate(), new EachRowOneSecondTemplate(), new BossAttackDefensiveTemplate()];

    constructor(
        public dialogRef: MatDialogRef<TableViewDialog>,
        @Inject(MAT_DIALOG_DATA) public data: ExportData) { }

    show() {
        if (!this.exportTemplatesControl.value) return;
        let d = this.templates.find(it => it.name === this.exportTemplatesControl.value).build(this.data);
        this.columnNames = d.columns.map(it => it.text);
        this.set = d;
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
