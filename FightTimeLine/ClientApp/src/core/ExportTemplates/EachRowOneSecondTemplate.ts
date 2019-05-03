import { ExportTemplate, ExportData, IExportResultSet, IExportResultItem } from "../BaseExportTemplate"
import { Utils } from "../Utils"

export class EachRowOneSecondTemplate extends ExportTemplate {
    get name(): string {
        return "Each row as one second";
    }

    build(data: ExportData): IExportResultSet {
        const list: IExportResultItem[][][] = [];

        for (let i = 946677600000; i < 946677600000 + 200 * 1000; i += 1000) {
            const offset = Utils.formatTime(new Date(i));
            const bossAttacks = data.data.boss.attacks.filter(it => it.offset === offset).map(it => it.name).join(", ");
            const playerAttacks = data.data.jobs.map(it => {
                return data.data.abilities.filter(a => a.start === offset && a.job === it.id).map(it => <IExportResultItem>{ text: it.ability, icon: it.icon });
            });
            list.push([
                [<IExportResultItem>{ text: offset }],
                [<IExportResultItem>{ text: bossAttacks }],
                ...playerAttacks
            ]);
        }

        return {
            columns: [
                { text: "time" },
                { text: "boss" },
                ...data.data.jobs.map(it => <IExportResultItem>{ text: it.name, icon: it.icon })],
            rows: list,
            title: this.name
        };
    }
}