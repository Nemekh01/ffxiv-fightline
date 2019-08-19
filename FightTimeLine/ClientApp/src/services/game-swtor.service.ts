import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http"
import * as Gameserviceinterface from "./game.service-interface";
import { IJobRegistryService } from "./jobregistry.service-interface";
import * as Jobregistryswtorservice from "./jobregistry-swtor.service";
import { IDataService } from "./data.service-interface";
import * as SwtoRdataservice from "./SWTOR-data.service";

@Injectable()
export class SWTORGameService implements Gameserviceinterface.IGameService {

  constructor(httpClient: HttpClient) {
    this.dataServiceValue = new SwtoRdataservice.SWTORDataService(httpClient);
  }

  get showImport(): boolean {
    return false;
  }
  private jobRegistryValue = new Jobregistryswtorservice.SWTORJobRegistryService();
  private dataServiceValue:IDataService;

  get dataService(): IDataService {
    return this.dataServiceValue;
  }

  get name(): string {
    return "swtor";
  }

  get jobRegistry(): IJobRegistryService {
    return this.jobRegistryValue;
  }
}
