import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http"
import * as Gameserviceinterface from "./game.service-interface";
import { IJobRegistryService } from "./jobregistry.service-interface";
import * as Jobregistryswtorservice from "./jobregistry-swtor.service";
import { IDataService } from "./data.service-interface";
import * as SwtoRdataservice from "./SWTOR-data.service";
import { IFraction } from "../core/Models";

@Injectable()
export class SWTORGameService implements Gameserviceinterface.IGameService {
  extractFraction(game: string): IFraction {
    const splitted = game.split(":");
    if (splitted.length > 1) {
      return this.fractions.find(it => it.name === splitted[1]);
    }
    return null;
  }

  get fractions(): IFraction[] {
    return [
      {
        name: "Republic",
        icon:"/assets/swtor/images/fractions/republic.jpg"
      }, {
        name: "Empire",
        icon: "/assets/swtor/images/fractions/empire.jpg"
      }
    ];
  }

  constructor(httpClient: HttpClient) {
    this.dataServiceValue = new SwtoRdataservice.SWTORDataService(httpClient);
  }

  get showImport(): boolean {
    return false;
  }
  private jobRegistryValue = new Jobregistryswtorservice.SWTORJobRegistryService();
  private dataServiceValue: IDataService;

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
