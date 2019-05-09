import { Injectable, Inject } from "@angular/core"
import { Observable } from "rxjs"
import "rxjs/add/observable/from";
import { IBoss, IFight } from "../core/Models"
import { IFightService } from "./fight.service-interface"

@Injectable()
export class FightsMockService implements IFightService {
  getBosses(searchString: string, privateOnly: boolean): Observable<IBoss[]> {
    return Observable.of(null);
  }

  getBoss(id: string): Observable<IBoss> {
    return Observable.of(null);
  }

  getFight(id: string): Observable<IFight> {
    return Observable.throw("Error");

  }

  saveBoss(boss: IBoss): Observable<IBoss> {
    return Observable.of(boss);
  }

  saveFight(fight: IFight): Observable<IFight> {
    return Observable.of(fight);
  }

  getFightsForUser(): Observable<IFight[]> {
    return Observable.of([
      <IFight>{
        id: "1",
        name: "dummy fight 1",
        data: ""
      },
      <IFight>{
        id: "2",
        name: "dummy fight 2",
        data: ""
      },
      <IFight>{
        id: "3",
        name: "dummy fight 3",
        data: ""
      },
      <IFight>{
        id: "4",
        name: "dummy fight 4",
        data: ""
      },
      <IFight>{
        id: "5",
        name: "dummy fight 5",
        data: ""
      },
      <IFight>{
        id: "6",
        name: "dummy fight 6",
        data: ""
      },
      <IFight>{
        id: "7",
        name: "dummy fight 7",
        data: ""
      },
      <IFight>{
        id: "8",
        name: "dummy fight 8",
        data: ""
      }
      , <IFight>{
        id: "9",
        name: "dummy fight 9",
        data: ""
      }
      , <IFight>{
        id: "10",
        name: "dummy fight 10",
        data: ""
      }
      , <IFight>{
        id: "11",
        name: "dummy fight 11",
        data: ""
      }

    ]);
  }

  removeFights(map: any[]): Observable<any> {
    return Observable.of(null);
  }
}
