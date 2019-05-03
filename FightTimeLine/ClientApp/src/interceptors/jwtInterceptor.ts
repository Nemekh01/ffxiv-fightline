import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocalStorageService } from "../services/LocalStorageService"

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private storage: LocalStorageService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // add authorization header with jwt token if available
    if (request.headers.has("fightService")) {
      const currentUser = this.storage.getObject<any>("currentUser");
      if (currentUser && currentUser.token) {
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${currentUser.token}`
          }
        });
      }
    }

    return next.handle(request);
  }
}
