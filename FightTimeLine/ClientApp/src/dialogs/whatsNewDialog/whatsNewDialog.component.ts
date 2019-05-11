import { Component, ViewChild, Inject, Input, OnInit, TemplateRef } from "@angular/core";
import { NzModalRef } from "ng-zorro-antd";


@Component({
    selector: "whatsNewDialog",
    templateUrl: "./whatsNewDialog.component.html",
    styleUrls: ["./whatsNewDialog.component.css"]
})

export class WhatsNewDialog implements OnInit {
  
  @Input("data") data: any;
  @ViewChild("buttonsTemplate") buttonsTemplate: TemplateRef<any>;
  constructor(
    private dialogRef: NzModalRef) { }

  ngOnInit(): void {
    this.dialogRef.getInstance().nzFooter = this.buttonsTemplate;
  }


}
