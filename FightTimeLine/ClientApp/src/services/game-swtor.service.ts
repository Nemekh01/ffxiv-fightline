import { Injectable, EventEmitter, Output } from '@angular/core';
import * as Gameserviceinterface from "./game.service-interface";
import { IJobRegistryService } from "./jobregistry.service-interface";
import * as Jobregistryswtorservice from "./jobregistry-swtor.service";

@Injectable()
export class SWTORGameService implements Gameserviceinterface.IGameService {
  get name(): string {
    return "swtor";
  }

  get jobRegistry(): IJobRegistryService {
    return new Jobregistryswtorservice.SWTORJobRegistryService();
  }
}


