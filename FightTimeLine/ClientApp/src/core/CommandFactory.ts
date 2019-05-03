import { Command, ICommandData } from "./UndoRedo"
import {
    AddAbilityCommand, RemoveAbilityCommand, MoveCommand, AddJobCommand, CombinedCommand, AddBossAttackCommand, RemoveBossAttackCommand, ChangeAbilitySettingsCommand, MoveBossAttackCommand,
    SwitchTargetCommand, ChangeBossAttackCommand, RemoveJobCommand, AddDowntimeCommand, RemoveDownTimeCommand, ChangeDowntimeCommand, ChangeDowntimeColorCommand, SetJobPetCommand,
    AddStanceCommand, RemoveStanceCommand, MoveStanceCommand
} from "./Commands"
import { IView } from "./Models"
import { Utils } from "./Utils"

export class CommandFactory {
    constructor(private startDate: Date) {

    }
    createFromData(data: ICommandData, view: IView): Command {
        if (!data) return null;
        switch (data.name) {
            case "useAbility":
                return new AddAbilityCommand(data.params.id,
                    data.params.jobGroup,
                    data.params.abilityName,
                    Utils.getDateFromOffset(data.params.time, this.startDate),
                    data.params.loaded,
                    null);
            case "removeAbility":
                return new RemoveAbilityCommand(data.params.id, data.params.updateBossAttacks);
            case "moveAbility":
                return new MoveCommand(data.params.id, Utils.getDateFromOffset(data.params.moveTo, this.startDate));
            case "changeAbilitySettings":
                return new ChangeAbilitySettingsCommand(data.params.id, data.params.newSettings);
            case "addBossAttack":
                return new AddBossAttackCommand(data.params.id,
                    Utils.getDateFromOffset(data.params.time, this.startDate),
                    data.params.attack);
            case "removeBossAttack":
                return new RemoveBossAttackCommand(data.params.id,
                    Utils.getDateFromOffset(data.params.time, this.startDate),
                    data.params.updateAttacks);
            case "moveBossAttack":
                return new MoveBossAttackCommand(Utils.getDateFromOffset(data.params.moveTo, this.startDate),
                    Utils.getDateFromOffset(data.params.moveFrom, this.startDate),
                    data.params.id);
            case "changeBossAttack":
                return new ChangeBossAttackCommand(data.params.id,
                    data.params.attack,
                    data.params.updateAllWithSameName);
            case "addJob":
                return new AddJobCommand(data.params.id,
                    data.params.jobName,
                    null,
                    data.params.prevBossTarget,
                    data.params.doUpdates,
                    data.params.pet,
                    false);
            case "removeJob":
                return new RemoveJobCommand(data.params.id);
            case "combined":
                return new CombinedCommand(data.params.commands.map((it: ICommandData) => this.createFromData(it, view)));
            case "switchTarget":
                return new SwitchTargetCommand(data.params.prevTarget, data.params.newTarget);
            case "addDowntime":
                return new AddDowntimeCommand(data.params.id,
                    {
                        start: Utils.getDateFromOffset(data.params.start, this.startDate),
                        startId: null,
                        end: Utils.getDateFromOffset(data.params.end, this.startDate),
                        endId: null
                    }, data.params.color);
            case "removeDowntime":
                return new RemoveDownTimeCommand(data.params.id);
            case "changeDowntime":
                return new ChangeDowntimeCommand(data.params.id,
                    Utils.getDateFromOffset(data.params.start, this.startDate),
                    Utils.getDateFromOffset(data.params.end, this.startDate));
            case "changeDowntimeColor":
                return new ChangeDowntimeColorCommand(data.params.id, data.params.newColor);
            case "setJobPet":
                return new SetJobPetCommand(data.params.id, data.params.pet);
            case "addStance":
                return new AddStanceCommand(data.params.id,
                    data.params.jobGroup,
                    data.params.abilityName,
                    Utils.getDateFromOffset(data.params.start, this.startDate),
                    Utils.getDateFromOffset(data.params.end, this.startDate),
                    data.params.loaded);
            case "removeStance":
                return new RemoveStanceCommand(data.params.id, data.params.updateBossAttacks);
            case "moveStance":
                return new MoveStanceCommand(data.params.id,
                    Utils.getDateFromOffset(data.params.moveStartTo, this.startDate),
                    Utils.getDateFromOffset(data.params.moveEndTo, this.startDate));
            default:
        }
        return null;
    }
}
