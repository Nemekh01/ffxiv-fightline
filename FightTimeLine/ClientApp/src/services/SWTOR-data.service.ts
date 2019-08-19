import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable, BehaviorSubject } from "rxjs"
import "rxjs/add/observable/from";
import "rxjs/add/observable/of";
import {
  Events,
  Zone,
  ReportFightsResponse,
} from "../core/FFLogs"


@Injectable()
export class SWTORDataService {
  constructor(private httpClient: HttpClient) {

  }

  async getFight(code: string): Promise<ReportFightsResponse> {
    return Promise.resolve(null);
  }

  async getEvents(code: string, instance: number, callBack: (percentage: number) => void): Promise<Events> {
    return Promise.resolve(null);
  }

  getZones(): Observable<Zone[]> {
    return this.httpClient.get<Zone[]>(
      "https://raw.githubusercontent.com/Airex/fightline-resources/master/swtor-bosses.json");
  }

}
