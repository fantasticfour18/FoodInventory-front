import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private jwtHelper: JwtHelperService) { }

  public isAuthenticated(): boolean
  {
    const userData: any = localStorage.getItem('userDetails');

    const token = userData ? JSON.parse(userData).token : '';

    return !this.jwtHelper.isTokenExpired(token);
  }
}
