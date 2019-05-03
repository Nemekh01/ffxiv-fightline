import { EventEmitter } from "@angular/core"
import { Holders } from "./DataHolders"
import { IdGenerator } from "./Generators"
import { IAbility } from "./Models"
import { ItemBuilder } from "./Builders"
import { JobRegistry } from "./JobRegistry"

export interface ICommandExecutionContext {
    idGen: IdGenerator;
    holders: Holders,
    itemBuilder: ItemBuilder;
    jobRegistry: JobRegistry;
    checkDatesOverlap: (group: string, start: Date, end: Date, id?: string) => boolean;
    update: (options: IUpdateOptions) => void;
    ogcdAttacksAsPoints: (ability: IAbility) => boolean;
    verticalBossAttacks:()=> boolean;
    isCompactView: () => boolean;
    highlightLoaded: () => boolean;
}

export interface IUpdateOptions {
    abilityChanged?: IAbility;
    updateIntersectedWithBossAttackAtDate?: Date | null;
    updateBossAttacks?: string[] | boolean;
    updateBossTargets?: boolean;
    updateDowntimeMarkers?: boolean;
    updateFilters?:boolean;
}

export class UndoRedoController {
    private undoCommands = new Array<Command>();
    private redoCommands = new Array<Command>();
    private context: ICommandExecutionContext;

    public changed = new EventEmitter<void>();
    public commandExecuted = new EventEmitter<ICommandData>();
    private fireExecuted = true;

    public turnOnFireExecuted() {
        this.fireExecuted = true;
    }

    public turnOffFireExecuted() {
        this.fireExecuted = false;
    }

    constructor(context: ICommandExecutionContext) {
        this.context = context;
    }

    public execute(command: Command, fireExecuted:boolean = true) {
        //console.log("executing command");
        //console.log(command);
        command.execute(this.getContext());
        this.undoCommands.push(command);
        delete this.redoCommands;
        this.redoCommands = new Array<Command>();
        this.changed.emit();
        if (fireExecuted && this.fireExecuted)
            this.commandExecuted.emit(command.serialize());
    }


    public clear() {
        delete this.undoCommands;
        this.undoCommands = new Array<Command>();

        delete this.redoCommands;
        this.redoCommands = new Array<Command>();
        this.changed.emit();
    }

    public undo(): void {
        if (this.undoCommands.length === 0) return;
        const last = this.undoCommands.pop();
        last.reverse(this.getContext());
        this.redoCommands.push(last);
        this.changed.emit();
    }

    public redo(): void {
        if (this.redoCommands.length === 0) return;
        const last = this.redoCommands.pop();
        last.execute(this.getContext());
        this.undoCommands.push(last);
        this.changed.emit();
    }

    private getContext(): ICommandExecutionContext {
        return this.context;
    }

    public canUndo(): boolean {
        return this.undoCommands.length > 0;
    }

    public canRedo(): boolean {
        return this.redoCommands.length > 0;
    }
}

export interface ICommandData {
    name: string;
    params: {
        [name:string]:any;
    }
}

export abstract class Command {
    abstract reverse(context: ICommandExecutionContext): void;
    abstract execute(context: ICommandExecutionContext): void;
    abstract serialize(): ICommandData;
}








