import { Component, Inject, Input } from "@angular/core";


@Component({
    selector: "whatsNewDialog",
    templateUrl: "./whatsNewDialog.component.html",
    styleUrls: ["./whatsNewDialog.component.css"]
})

export class WhatsNewDialog {

  @Input("data") data: any;
    
}
