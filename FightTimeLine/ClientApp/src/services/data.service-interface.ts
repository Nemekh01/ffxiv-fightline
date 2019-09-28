import { Observable } from "rxjs";
import * as FFLogs from "../core/FFLogs";
import * as Parser from "../core/Parser";

export interface IDataService {
  getFight(code: string): Promise<FFLogs.ReportFightsResponse> ;
  getEvents(code: string, instance: number, callBack: (percentage: number) => void): Promise <Parser.Parser>;
  getZones(): Observable<FFLogs.Zone[]>;
  getParses(characterName: string, serverName: string, region: string): Observable<any[]>;
}
