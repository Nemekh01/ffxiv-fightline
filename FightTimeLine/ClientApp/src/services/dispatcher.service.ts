import { Injectable } from '@angular/core';
import { Subject, Observable } from "rxjs";

@Injectable()
export class DispatcherService {
  constructor() {

  }

  private dispatcher: Subject<{ name: string, payload: any }> = new Subject<{ name: string, payload: any }>();

  on(name: string): Observable<any> {
    const result = new Subject<any>();
    this.dispatcher.subscribe(cmd => {
      if (cmd.name === name)
        result.next(cmd.payload);
    });
    return result;
  }

  dispatch(value: { name: string, payload: any }) {
    this.dispatcher.next(value);
  }
}
