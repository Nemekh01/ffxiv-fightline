import { Injectable } from "@angular/core"
import { LocalStorageService } from "./LocalStorageService"

@Injectable()
export class RecentActivityService {
  private storageKey = "recent";

  constructor(private storage: LocalStorageService) {

  }

  public load(): IRecentActivity[] {
    const cacheString = this.storage.getObject<IRecentActivity[]>(this.storageKey);
    if (cacheString) {
      return cacheString.reverse();
    }
    return new Array<IRecentActivity>();
  }

  public register(name: string, url: string): void {
    const cacheString = this.storage.getObject<IRecentActivity[]>(this.storageKey);
    const data = cacheString || [];
    data.push({ name: name, url: url, timestamp: new Date() });

    let result = new Array<IRecentActivity>();
    const map = new Map();
    for (const item of data.reverse()) {
      if (!map.has(item.url)) {
        map.set(item.url, {}); // set any value to Map
        result.push({
          name: item.name,
          url: item.url,
          timestamp: item.timestamp
        });
      }
    }
    result = result.reverse();
    if (result.length > 20) {
      result.splice(0, result.length - 20);
    }
    this.storage.setObject(this.storageKey, result);
  }
}

export interface IRecentActivity {
  name: string;
  url: string;
  timestamp: Date;
}
