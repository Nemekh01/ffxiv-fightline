import { Component, Inject, Input } from "@angular/core";
import { ScreenNotificationsService } from "../../services/ScreenNotificationsService"
import { NzModalRef } from "ng-zorro-antd"

@Component({
  selector: "sessionCreateResultDialog",
  templateUrl: "./sessionCreateResultDialog.component.html",
  styleUrls: ["./sessionCreateResultDialog.component.css"]
})

export class SessionCreateResultDialog {

  @Input("data") data: string;

  constructor(
    private snackBar: ScreenNotificationsService,
    public dialogRef: NzModalRef,
  ) {
  }

  onNoClick(): void {
    this.dialogRef.destroy();
  }

  onCopied() {
    this.snackBar.info("Url has been copied to clipboard");
  }
}
