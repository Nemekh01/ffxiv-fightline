import { IBoss, IFight } from "../core/Models"
import { Observable } from "rxjs";

export interface IFightService {

  getBosses(reference: number, searchString: string, privateOnly: boolean): Observable<IBoss[]>;
  getBoss(id: string): Observable<IBoss>;
  removeBosses(map: any[]): Observable<any>;
  saveBoss(boss: IBoss): Observable<IBoss>;
  saveFight(fight: IFight): Observable<IFight>;
  getFight(id: string): Observable<IFight>;
  getFightsForUser(): Observable<IFight[]>;
  removeFights(map: any[]): Observable<any>;
}
