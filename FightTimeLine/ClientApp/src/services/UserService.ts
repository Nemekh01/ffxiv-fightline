import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class UserService {
    constructor(private http: HttpClient) { }

    isUserNameRegistered(userName: string) {
        return this.http.get('api/users/exists?username=' + userName);
    }

    createUser(userName: string, password: string, captchaData: string) {
        return this.http.post("api/users/createUser", { userName: userName, password: password },
            {
                headers: {
                    "captcha": captchaData
                }
            });
    }


}
