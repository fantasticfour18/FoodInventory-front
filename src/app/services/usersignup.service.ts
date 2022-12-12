import { ThrowStmt } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersignupService {

  constructor(private httpClient: HttpClient) { }

  userRegister(formData: any): Observable<any>{
      formData.address = formData.address ? formData.address.trim().replace(/\s\s+/g,  ' ') : '';
      return this.httpClient.post(environment.apiBaseUrl + "userService/registerUser", formData);
  }

  bookReservation(postData: any, restEmail: string): Observable<any> {
    postData["restEmail"] = restEmail;
    return this.httpClient.post(environment.apiBaseUrl + "userService/bookReservation", postData);
  }
}
