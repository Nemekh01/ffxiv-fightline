import { Injectable, Inject } from "@angular/core"
import { Observable } from "rxjs"
import { expand, take, concatMap, concat, toArray, map } from "rxjs/operators"
import { IBoss, IFight } from "../core/Models"
import { IFightService } from "./fight.service-interface"

@Injectable()
export class FightsMockService implements IFightService {
  getBosses(reference: number, searchString: string, privateOnly: boolean): Observable<IBoss[]> {

    const source = Observable.of(1);
    const example = source.pipe(
      //recursively call supplied function
      expand(val => {
        return Observable.of(val + 1);
      }),
      //call 5 times
      take(50),
      map(x =>
        <IBoss>{
          id: (reference*1000 + Number(x)).toString(),
          name: reference + " name " + x,
          reference: reference,
          isPrivate: false,
          data: '{"attacks":[{"id":"b56b029a6-d8ba-52eb-c034-d89d022d4c6d|1","ability":{"name":"test1","type":1,"isAoe":null,"isShareDamage":null,"isTankBuster":null,"offset":"09: 24","syncSettings":null}},{"id":"b56b029a6 - d8ba - 52eb - c034 - d89d022d4c6d | 2","ability":{"name":"test2","type":2,"isAoe":null,"isShareDamage":null,"isTankBuster":null,"offset":"13: 50","syncSettings":null}},{"id":"b56b029a6 - d8ba - 52eb - c034 - d89d022d4c6d | 3","ability":{"name":"test3","type":0,"isAoe":null,"isShareDamage":null,"isTankBuster":null,"offset":"18: 50","syncSettings":null}}],"downTimes":[]}',
          userName: ""
        }),
      concat(),
      toArray()
    );
    return example;
  }

  getBoss(id: string): Observable<IBoss> {
    return Observable.of(<IBoss>{
      id: id,
      name: "test boss",
      reference: 1,
      isPrivate: false,
      data: '{"attacks":[{"id":"b56b029a6-d8ba-52eb-c034-d89d022d4c6d|1","ability":{"name":"test1","type":1,"isAoe":null,"isShareDamage":null,"isTankBuster":null,"offset":"09: 24","syncSettings":null}},{"id":"b56b029a6 - d8ba - 52eb - c034 - d89d022d4c6d | 2","ability":{"name":"test2","type":2,"isAoe":null,"isShareDamage":null,"isTankBuster":null,"offset":"13: 50","syncSettings":null}},{"id":"b56b029a6 - d8ba - 52eb - c034 - d89d022d4c6d | 3","ability":{"name":"test3","type":0,"isAoe":null,"isShareDamage":null,"isTankBuster":null,"offset":"18: 50","syncSettings":null}}],"downTimes":[]}',
      userName: ""
    });
  }

  saveBoss(boss: IBoss): Observable<IBoss> {
    return Observable.of(boss);
  }

  getFight(id: string): Observable<IFight> {
    return Observable.throw("Error");

  }

  removeBosses(map: any[]): Observable<any> {
    return Observable.of(null);
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
