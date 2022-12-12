import { ThrowStmt } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UserLoginService {

  constructor(private httpClient: HttpClient) { }

// tslint:disable-next-line:typedef
  userLogin(loginMode: any, email: any, password: any, firstName: any, lastName: any): Observable<any> {
      return this.httpClient.post(environment.apiBaseUrl + 'userService/login',
        {loginMode, email, password, firstName, lastName});
  }

  sendUserOTP(postData: any): Observable<any> {
    return this.httpClient.post(environment.apiBaseUrl + 'userService/sendOTP', postData);
  }

  verifyOTP(postData: any) :Observable<any> {
    return this.httpClient.post(environment.apiBaseUrl + 'userService/verifyOTP', postData);
  }


}
