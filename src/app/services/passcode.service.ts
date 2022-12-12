import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PasscodeService {

  constructor(private httpClient: HttpClient) { }

  checkPasscodes(restPostCode: any, placeId: any): Observable<any> {

    const url = environment.apiBaseUrl + 'userService/validatePassCode?resPassCode=' + restPostCode + '&passcode=' + placeId +
                '&apiKey=' + environment.googleAPIkey;

    return this.httpClient.get(url);
  }
}
