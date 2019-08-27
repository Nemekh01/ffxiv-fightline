import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FightLineComponent } from "../fightline/fightline.component";
import { TableViewComponent } from "../tableview/tableview.component";
//import { BossTemplateComponent } from "../bosstemplate/bosstemplate.component";
import { HomeComponent } from "../home/home.component";
import { CanDeactivateUnsaved } from "../heplers/CanDeactivateUnsaved";

const routes: Routes = [
  
  { path: "fflogs/:code/:fight", component: FightLineComponent, /*canDeactivate: [CanDeactivateUnsaved]*/ },
  { path: "fflogs/:code", component: FightLineComponent, /*canDeactivate: [CanDeactivateUnsaved]*/ },
  { path: "boss/:boss", component: FightLineComponent, /*canDeactivate: [CanDeactivateUnsaved]*/ },
//  { path: "bosstemplate/:boss", component: BossTemplateComponent, canDeactivate: [CanDeactivateUnsaved] },
  { path: "table/:fightId/:template", component: TableViewComponent },
  { path: ":fightId/:fraction", component: FightLineComponent, /*canDeactivate: [CanDeactivateUnsaved]*/ },
  { path: ":fightId", component: FightLineComponent, /*canDeactivate: [CanDeactivateUnsaved]*/ },
  { path: "", component: HomeComponent },
  { path: "**", redirectTo: "" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
