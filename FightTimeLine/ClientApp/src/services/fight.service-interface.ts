import { IBoss, IFight } from "../core/Models"
import { Observable } from "rxjs";

export interface IFightService {

  getBosses(searchString: string, privateOnly: boolean): Observable<IBoss[]>;
  getBoss(id: string): Observable<IBoss>;
  getFight(id: string): Observable<IFight>;
  saveBoss(boss: IBoss): Observable<IBoss>;
  saveFight(fight: IFight): Observable<IFight>;
  getFightsForUser(): Observable<IFight[]>;
  removeFights(map: any[]): Observable<any>;
}
