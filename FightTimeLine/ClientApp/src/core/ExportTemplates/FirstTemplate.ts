import { ExportTemplate, ExportData,IExportResultSet } from "../BaseExportTemplate"

export class FirstTemplate extends  ExportTemplate {
    get name(): string {
        return "First template";
    }

    build(data: ExportData): IExportResultSet {
        const rows = data.data.boss.attacks.sort((a, b) => this.offsetCompareFn(a.offset, b.offset)).map(it => [
            [{ text: it.offset }],
            [{ text: it.name }]
        ]);
        return {
            columns: [
                { text: "time" },
                { text: "name" }
            ],
            rows: rows,
            title: this.name
        };
    }
}