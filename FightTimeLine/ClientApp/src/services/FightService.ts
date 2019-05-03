import { Injectable, Inject } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable } from "rxjs"
import "rxjs/add/observable/from";
import { IBoss, IFight } from "../core/Models"

@Injectable()
export class FightsService {
    constructor(private httpClient: HttpClient, @Inject("BASE_URL") private basePath: string) { }

    getBosses(searchString: string, privateOnly: boolean): Observable<IBoss[]> {
        return this.httpClient.get<IBoss[]>(this.basePath + `api/data/search/${searchString}?privateOnly=${privateOnly}`,
            {
                headers: {
                    "fightService":"true"
                }
            });
    }

    getBoss(id: string): Observable<IBoss> {
        return this.httpClient.get<IBoss>(this.basePath + `api/data/boss/${id}`,
            {
                headers: {
                    "fightService": "true"
                }
            });
    }

    getFight(id: string): Observable<IFight> {
        return this.httpClient.get<IFight>(this.basePath + `api/data/fight/${id}`,
            {
                headers: {
                    "fightService": "true"
                }
            });
    }

    saveBoss(boss: IBoss): Observable<IBoss> {
        return this.httpClient.post<IBoss>(this.basePath + "api/data/saveBoss", boss,
            {
                headers: {
                    "fightService": "true"
                }
            });
    }

    saveFight(fight: IFight): Observable<IFight> {
        return this.httpClient.post<IFight>(this.basePath + "api/data/saveFight", fight,
            {
                headers: {
                    "fightService": "true"
                }
            });
    }

    getFightsForUser(): Observable<IFight[]> {
        return this.httpClient.get<IFight[]>(this.basePath + `api/data/fights`,
            {
                headers: {
                    "fightService": "true"
                }
            });
    }

    removeFights(map: any[]): Observable<any> {
        return this.httpClient.post<any[]>(this.basePath + "api/data/removeFights",
            map,
            {
                headers: {
                    "fightService": "true"
                }
            });
    }
}
