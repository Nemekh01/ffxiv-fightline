import { Injectable, EventEmitter, Output } from '@angular/core';
import { Observable } from "rxjs";
import * as FFLogs from "../core/FFLogs";

export interface IDataService {
  getFight(code: string): Promise<FFLogs.ReportFightsResponse> ;
  getEvents(code: string, instance: number, callBack: (percentage: number) => void): Promise <FFLogs.Events>;
  getZones(): Observable <FFLogs.Zone[]>;
}
