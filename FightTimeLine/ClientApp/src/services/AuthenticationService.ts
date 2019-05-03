import { Injectable, EventEmitter, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { LocalStorageService } from "./LocalStorageService";

@Injectable()
export class AuthenticationService {

  @Output("usernameChanged") usernameChanged: EventEmitter<void> = new EventEmitter<void>();
  @Output("authenticatedChanged") authenticatedChanged: EventEmitter<void> = new EventEmitter<void>();
  user:any;
  constructor(private http: HttpClient, private storage: LocalStorageService) { }

  login(username: string, password: string) {
    return this.http.post<any>('/api/token/createtoken', { username: username, password: password })
      .pipe(map((res: any) => {
        // login successful if there's a jwt token in the response
        if (res && res.token) {
          // store username and jwt token in local storage to keep user logged in between page refreshes
          this.user = { username, token: res.token };
          this.storage.setObject('currentUser', this.user);
          this.authenticatedChanged.emit();
          this.usernameChanged.emit();
        } else {
          this.logout();
        }
      }));
  }

  logout() {
    // remove user from local storage to log user out
    this.user = null;
    this.storage.removeItem('currentUser');
    this.authenticatedChanged.emit();
    this.usernameChanged.emit();
    
  }

  get authenticated(): boolean {
    return !!this.user && !!(this.user = this.storage.getObject<any>("currentUser"));
  }
  get username(): string {
    if (this.user || (this.user = this.storage.getObject<any>("currentUser"))) return this.user.username;
    return undefined;
  }
}
