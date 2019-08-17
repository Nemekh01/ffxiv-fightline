import { InjectionToken } from '@angular/core/';
import * as Gameserviceinterface from "./game.service-interface";
import * as Gameffxivservice from "./game-ffxiv.service";
import * as Gameswtorservice from "./game-swtor.service";

let gameServiceFactory = () => {
  var serviceToReturn: Gameserviceinterface.IGameService;
  
  if (location.hostname.toLowerCase().indexOf("swtor") >= 0) {
    serviceToReturn = new Gameswtorservice.SWTORGameService();
  } else {
    serviceToReturn = new Gameffxivservice.FFXIVGameService();
  }
  return serviceToReturn;
};

export let gameServiceToken = new InjectionToken("IGameService");

export let gameServiceProvider =
{
  provide: gameServiceToken,
  useFactory: gameServiceFactory,
  deps: []
};
