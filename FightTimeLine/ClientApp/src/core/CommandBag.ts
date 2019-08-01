import {Command, UndoRedoController } from "./UndoRedo"
import {CombinedCommand} from "./Commands"

export class CommandBag {
    private commandsBag: Command[] = [];
    private commandStorage: UndoRedoController;

    constructor(commandStorage: UndoRedoController) {
         this.commandStorage = commandStorage;
    }

    push(command: Command): void {
        this.commandsBag.push(command);
    }

    evaluate(length: number, callback?:()=>void): void {
        if (this.commandsBag.length >= length) {
            this.commandStorage.execute(new CombinedCommand(this.commandsBag));
            if (callback)
                callback();
            this.commandsBag = [];
        }
    }

    clear(): void {
        this.commandsBag = [];
    }
}
