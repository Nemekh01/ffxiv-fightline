import { Component, Inject, EventEmitter, ViewChild, ViewChildren, Output, QueryList, HostListener, TemplateRef } from "@angular/core";
import { NzDropdownContextComponent, NzDropdownService, NzMenuItemDirective } from 'ng-zorro-antd';
import { IAbilityFilter, IContextMenuData } from "../../core/Models"



@Component({
  selector: "fightLineContextMenu",
  templateUrl: "./contextmenu.component.html",
  styleUrls: ["./contextmenu.component.css"]
})
export class FightLineContextMenuComponent {

  private dropdown: NzDropdownContextComponent;

  @ViewChild("contextMenu")
  contextMenu: TemplateRef<any>;
  
  @Output("filterUpdated") filterUpdated: EventEmitter<IAbilityFilter> = new EventEmitter<IAbilityFilter>();


  //jobFilter: IAbilityFilter;
  contextMenuActions: IContextMenuData[] = [];
//  pets: any[];
//  hidden: any[];
  private lastDoubleClickEvent: any;

  setLastDoubleClick(e: any): void {
    if (event && e.clientX)
      this.lastDoubleClickEvent = e;
  }

  constructor(private nzDropdownService: NzDropdownService) {
  }


  @HostListener("window:click", ["$event"])
  onClick(event: any) {
    if (event && event.clientX)
      this.lastDoubleClickEvent = event;
  }

  @HostListener("window:dblclick", ["$event"])
  ondblClick(event: any) {
    if (event && event.clientX)
      this.lastDoubleClickEvent = event;
  }
  

  public openStanceSelector(data: IContextMenuData[]): void {
    this.contextMenuActions = data;
    setTimeout(() => {
      //todo: stance selector
//      this.contextMenuService.show.next({
//        contextMenu: this.contextMenu,
//        event: this.lastDoubleClickEvent,
//        item: "",
//      });
    });
  }

  public openMenu(eventData: any[], data: IContextMenuData[]) {
    const event: any = eventData[1];
    const items = data;

    if (items == null || items.length === 0) return;

//    const filterItem = items.find((it: IContextMenuData) => !!it.filter);
//    if (filterItem)
//      this.jobFilter = filterItem.filter;
//
//    const petItem = items.find((it: IContextMenuData) => !!it.pets);
//    if (petItem)
//      this.pets = petItem.pets;
//
//    const hiddenItem = items.find((it: IContextMenuData) => !!it.hidden);
//    if (hiddenItem)
//      this.hidden = hiddenItem.hidden;

    this.contextMenuActions = items;
    setTimeout(() => {
      this.dropdown = this.nzDropdownService.create(event.event, this.contextMenu);
    });
  }

  selectSubmenu(action: any) {
    if (!action) return null;
    if (action.filter)
      return "filter";
    if (action.isDowntime)
      return "downtime";
    if (action.pets)
      return "pets";
    if (action.hidden)
      return "hidden";
    return 'simple';
  }

  resetJobFilter(filter: IAbilityFilter) {
    console.log("reset job filter requested");
    Object.assign(filter,
      {
        unused: undefined,
        utility: undefined,
        damage: undefined,
        selfDefence: undefined,
        partyDefence: undefined,
        healing: undefined,
        healingBuff: undefined,
        partyDamageBuff: undefined,
        selfDamageBuff: undefined
      });
    this.filterUpdated.emit();
  }

  close(action: any) {
    action();
    this.dropdown.close();
  }

  updateFilter(data: IAbilityFilter): void {
    setTimeout(() => {
      this.filterUpdated.emit();
    });
  }

}

