import { Component, Inject, EventEmitter, ViewChild, ViewChildren, Output, QueryList, HostListener } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl } from "@angular/forms"
import { ContextMenuService, ContextMenuComponent } from "ngx-contextmenu"
import { IFilter, IContextMenuData } from "../../core/Models"


@Component({
  selector: "fightLineContextMenu",
  templateUrl: "./contextmenu.component.html",
  styleUrls: ["./contextmenu.component.css"]
})
export class FightLineContextMenuComponent {

  @ViewChild("contextMenu")
  contextMenu: ContextMenuComponent;
  @ViewChildren(ContextMenuComponent)
  downtimeMenus: QueryList<ContextMenuComponent>;

  @Output("filterUpdated") filterUpdated: EventEmitter<IFilter> = new EventEmitter<IFilter>();


  jobFilter: IFilter;
  contextMenuActions: IContextMenuData[] = [];
  pets: any[];
  hidden: any[];
  private lastDoubleClickEvent: any;

  constructor(private contextMenuService: ContextMenuService) {

  }

  @HostListener("window:dblclick", ["$event"])
  onDoubleClick(event: any) {
    this.lastDoubleClickEvent = event;
  }

  public openStanceSelector(data: IContextMenuData[]): void {
    this.contextMenuActions = data;
    setTimeout(() => {
      this.contextMenuService.show.next({
        contextMenu: this.contextMenu,
        event: this.lastDoubleClickEvent,
        item: "",
      });
    });
  }

  public openMenu(eventData: any[], data: IContextMenuData[]) {
    const event: any = eventData[1];
    const items = data;

    if (items == null || items.length === 0) return;

    const filterItem = items.find((it: IContextMenuData) => !!it.filter);
    if (filterItem)
      this.jobFilter = filterItem.filter;

    const petItem = items.find((it: IContextMenuData) => !!it.pets);
    if (petItem)
      this.pets = petItem.pets;

    const hiddenItem = items.find((it: IContextMenuData) => !!it.hidden);
    if (hiddenItem)
      this.hidden = hiddenItem.hidden;

    this.contextMenuActions = items;
    setTimeout(() => {
      this.contextMenuService.show.next({
        contextMenu: this.contextMenu,
        event: event.event,
        item: event.item,

      });
    });
  }

  selectSubmenu(action: any, filterMenu: any, petsMenu: any, hiddenMenu: any) {
    if (!action) return null;
    if (action.filter) {
      return filterMenu;
    }
    if (action.isDowntime)
      return this.downtimeMenus.find(it => it.menuClass.indexOf(action.item.id) >= 0) || { mock: true };
    if (action.pets)
      return petsMenu;
    if (action.hidden)
      return hiddenMenu;
    return null;
  }

  resetJobFilter() {
    console.log("reset job filter requested");
    this.jobFilter.abilities = {
      unused: undefined,
      utility: undefined,
      damage: undefined,
      selfDefence: undefined,
      partyDefence: undefined,
      healing: undefined,
      healingBuff: undefined,
      partyDamageBuff: undefined,
      selfDamageBuff: undefined
    };
    this.filterUpdated.emit(undefined);
  }

  updateFilter(data: IFilter): void {
    this.filterUpdated.emit(data);
  }

}

