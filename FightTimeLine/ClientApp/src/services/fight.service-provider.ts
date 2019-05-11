import { HttpClient } from "@angular/common/http";
import { InjectionToken, Inject,Injector } from '@angular/core/';

import { FightsService } from "./fight.service";
import { IFightService } from "./fight.service-interface";
import { FightsMockService } from "./fight.service-mock";

import { environment } from "../environments/environment";

let fightServiceFactory = (http: HttpClient, path: string) => {
  var serviceToReturn: IFightService;
  if (environment.production) {
    serviceToReturn = new FightsService(http, path);
  } else {
    serviceToReturn = new FightsMockService();
  }
  return serviceToReturn;
};

export let fightServiceToken = new InjectionToken("IAuthenticationService");

export let fightServiceProvider =
{
  provide: fightServiceToken,
  useFactory: fightServiceFactory,
  deps: [
    HttpClient,"BASE_URL"
  ]
};
