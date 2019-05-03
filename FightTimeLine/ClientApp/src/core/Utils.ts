export class Utils {
    static entityMap: { [name: string]: string } = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
        "/": "&#x2F;"
    };
    static escapeHtml(source: string) {
        return String(source).replace(/[&<>"'\/]/g, (s: string) => this.entityMap[s]);
    }

    static getDateFromOffset(offset: number | string = 0, startDate: Date): Date {
        const d = new Date(startDate);
        if (typeof offset === "number")
            d.setSeconds(offset);
        else {
            const parts = offset.split(":");
            d.setMinutes(parseInt(parts[0]));
            d.setSeconds(parseInt(parts[1]));
        }
        return d;
    }

    static formatTime(date: Date): string {
        const padLeft = (nr: number, n: number, str?: string): string => new Array(n - String(nr).length + 1).join(str || "0") + nr;
        return `${padLeft((date).getMinutes(), 2)}:${padLeft((date as Date).getSeconds(), 2)}`;
    }

    static clone<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj)) as T;
    }

    static groupBy(input: any[], keyFn: (x: any) => string): { [key: string]: any[] } {
        const group: any = {};
        input.forEach((value) => {
            const key = keyFn(value);
            if (group[key]) {
                group[key].push(value);
            } else {
                group[key] = [];
                group[key].push(value);
            }
        });
        return group;
    }
}

// From Tom Gruner @ http://stackoverflow.com/a/12034334/1660815


