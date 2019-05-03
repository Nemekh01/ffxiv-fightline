import { VisTimelineItem, VisTimelineGroup } from "ngx-vis"
import { IAbility, IJob, IBossAbility, DamageType } from "./Models"
import { Utils } from "./Utils"

export class ItemBuilder {
  static jobIndex: number = 0;
  createAbilityUsage(ability: IAbility, id: string, parentId: string, time: Date, ogcdAsPoints: boolean, compact: boolean, loaded: boolean): VisTimelineItem {
    const start = new Date(time);
    const end = new Date(new Date(start).setSeconds(start.getSeconds() + ability.cooldown));

    return <VisTimelineItem>{
      id: id,
      start: start,
      end: end,
      group: parentId,
      className: "ability" + (compact ? " compact" : "") + (loaded ? " loaded" : ""),
      content: "",
      subgroup: "sg" + parentId,
      type: ogcdAsPoints ? "point" : "range",
      title: `<img class='abilityIcon' src='${ability.icon}'/><span>${Utils.formatTime(start)} - ${Utils.formatTime(end)}</span>`,
    };
  }

  createJobAbility(ability: IAbility, id: string, compact: boolean): VisTimelineGroup {
    const key: any = { sgDummy: true };
    key[`sg${id}`] = false;

    return {
      id: id,
      subgroupStack: key,
      className: compact ? "compact" : "",
      content: ability.icon
        ?`<img class='abilityIcon' src='${ability.icon}'/><span class='abilityName'>${ability.name}</span>`
        : ability.name,
      sValue: ItemBuilder.jobIndex
    } as VisTimelineGroup;
  }

  createStances(id: string, ): VisTimelineGroup {
    const key: any = { sgDummy: true };
    key[`sg${id}`] = false;

    return <VisTimelineGroup>{
      id: id,
      subgroupStack: key,
      content: "Stance",
      sValue: ItemBuilder.jobIndex
    }
  }

  createStanceUsage(ability: IAbility, id: string, parentId: string, start: Date, end: Date, loaded: boolean): VisTimelineItem {

    return <VisTimelineItem>{
      id: id,
      start: start,
      end: end,
      group: parentId,
      className: "stance" + (loaded ? " loaded" : ""),
      content: "<img class='abilityIcon' src='" + ability.icon + "'/>",
      subgroup: "sg" + parentId,
      type: "range",
      title: `<img class='abilityIcon' src='${ability.icon}'/>${ability.name}  ${Utils.formatTime(start)} - ${Utils.formatTime(end)}`,
    };
  }



  createJob(job: IJob, actorName: string, id: string, abilityIds: string[], collapsed: boolean): VisTimelineGroup {

    return <VisTimelineGroup>{
      id: id,
      subgroupStack: false,
      nestedGroups: abilityIds,
      content: "<img class='abilityIcon' src='" + job.icon + "'/>"+job.name,
      showNested: !collapsed,
      value: ItemBuilder.jobIndex++,
      title: actorName,
      
    }
  }

  createHeatMap(start: Date, end: Date, id: string, group?: string) {
    const result = <VisTimelineItem>{
      start: start,
      end: end,
      id: id,
      content: "",
      type: "background",
      className: "buffMap",
    };
    if (group) {
      result.group = group;
    }
    return result;
  }


  createBossTarget(id: string, start: Date, end: Date, target: string): VisTimelineItem {
    return {
      id: id,
      start: start,
      end: end,
      group: target,
      className: "targets",
      type: "background",
      content: "",
    }
  }

  createBossAttack(id: string, bossAbility: IBossAbility, start: Date, vertical: boolean): VisTimelineItem {
    return {
      id: id,
      content: this.createBossAttackElement(bossAbility),
      start: start,
      group: "boss",
      type: "box",
      className: "bossAttack " + DamageType[bossAbility.type] + (vertical ? " vertical " : ""),
      title: Utils.formatTime(start)
    }
  }

  private createBossAttackElement(ability: IBossAbility): string {
    return "<div><div class='marker'></div><div class='name'>" +
      Utils.escapeHtml(ability.name) +
      "</div></div>";
  }

  createDownTime(id: string, start: Date, end: Date, color: string): VisTimelineItem {
    return {
      start: start,
      end: end,
      id: id,
      content: "",
      type: "background",
      className: "downtime " + color
    }
  }

  createAbilityAvailability(id: string, abilityId: string, start: Date, end: Date, available: boolean): VisTimelineItem {
    return {
      start: start,
      end: end,
      id: id,
      content: "",
      group: abilityId,
      editable: false,
      type: "background",
      className: "availability " + (available ? "available" : "notAvailable")
    }
  }

  createItemUsageFrame(percentage: number): string {
    return `<div class="progress-wrapper-fl"><div class="progress-fl" style = "width:${percentage}%"> </div></div >`;
  }
}
