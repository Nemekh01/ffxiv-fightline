import { Injectable, EventEmitter, Output } from '@angular/core';
import * as Gameserviceinterface from "./game.service-interface";
import { IJobRegistryService } from "./jobregistry.service-interface";
import * as Jobregistryffxivservice from "./jobregistry-ffxiv.service";

@Injectable()
export class FFXIVGameService implements Gameserviceinterface.IGameService {
  get name(): string {
      return "ffxiv";
  }

  get jobRegistry(): IJobRegistryService {
    return new Jobregistryffxivservice.FFXIVJobRegistryService();
  }
}


