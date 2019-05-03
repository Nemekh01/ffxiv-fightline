import { Injectable } from "@angular/core"

@Injectable()
export class FFLogsStorageService {

    private prefix = "ffLogsData_";

    public load(code: string, fight: number): any[] {
        const list: Array<any> = new Array<any>();
        for (let i = 0; ; i++) {
            const key = this.prefix + code + "_" + fight + "_" + i;
            const dataString = localStorage.getItem(key);
            if (dataString)
                list.push(JSON.parse(dataString));
            else {
                return list;
            }
        }
    }

    public save(code: string, fight: number, data: any[]): void {
        const key = this.prefix + code + "_" + fight + "_";
        for (let i = 0; i < data.length; i++) {
            localStorage.setItem(key + i, JSON.stringify(data[i]));
        }

    }
}