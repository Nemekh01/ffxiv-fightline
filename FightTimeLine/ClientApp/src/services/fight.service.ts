import { Injectable, Inject } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable } from "rxjs"
import "rxjs/add/observable/from";
import { IBoss, IFight, IBossSearchEntry } from "../core/Models"
import { IFightService } from "./fight.service-interface"
import * as Gameserviceprovider from "./game.service-provider";
import * as Gameserviceinterface from "./game.service-interface";

@Injectable()
export class FightsService implements IFightService {
  constructor(
    @Inject(Gameserviceprovider.gameServiceToken) private gameService : Gameserviceinterface.IGameService,
    private httpClient: HttpClient,
    @Inject("BASE_URL") private basePath: string) { }

  headers = {
    "fightService": "true"
  };

  getBosses(reference: number, searchString: string, privateOnly: boolean): Observable<IBossSearchEntry[]> {
    return this.httpClient.get<IBossSearchEntry[]>(this.basePath + `api/data/bosses/${reference}/${this.gameService.name}/${searchString}?privateOnly=${privateOnly}`,
      {
        headers: this.headers
      });
  }

  getBoss(id: string): Observable<IBoss> {
    return this.httpClient.get<IBoss>(this.basePath + `api/data/boss/${id}`,
      {
        headers: this.headers
      });
  }

  removeBosses(ids: string[]): Observable<any> {
    return this.httpClient.post<any[]>(this.basePath + "api/data/removeBosses",
      ids,
      {
        headers: this.headers
      });
  }

  saveBoss(boss: IBoss): Observable<IBoss> {
    return this.httpClient.post<IBoss>(this.basePath + "api/data/saveBoss", boss,
      {
        headers: this.headers
      });
  }

  getFight(id: string): Observable<IFight> {
    return this.httpClient.get<IFight>(this.basePath + `api/data/fight/${id}`,
      {
        headers: this.headers
      });
  }

  saveFight(fight: IFight): Observable<IFight> {
    return this.httpClient.post<IFight>(this.basePath + "api/data/saveFight", fight,
      {
        headers: this.headers
      });
  }

  getFightsForUser(): Observable<IFight[]> {
    return this.httpClient.get<IFight[]>(this.basePath + `api/data/fights/${this.gameService.name}`,
      {
        headers: this.headers
      });
  }

  removeFights(map: any[]): Observable<any> {
    return this.httpClient.post<any[]>(this.basePath + "api/data/removeFights",
      map,
      {
        headers: this.headers
      });
  }

  newFight(fraction: string = ""): Observable<IFight> {
    const fractionPart = fraction ? ":" + fraction : "";
    return this.httpClient.post<IFight>(this.basePath + `api/data/newFight/${this.gameService.name}${fractionPart}`,
      null,
      {
        headers: this.headers
      });
  }

  addCommand(fight: string, data: any): Observable<any> {
    return this.httpClient.post<any>(this.basePath + "api/data/addCommand",
      {
        fight: fight,
        data: data
      },
      {
        headers: this.headers
      });
  }

  getCommands(fight: string, timestamp: number): Observable<any[]> {
    return this.httpClient.get<any[]>(this.basePath + `api/data/loadCommands/${fight}/${timestamp}`,
      {
        headers: this.headers
      });
  }
}
