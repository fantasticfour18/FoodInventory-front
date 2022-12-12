import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(private auth: AuthService, private router: Router) { }

  canActivate()
  {
    const authState = this.auth.isAuthenticated();
    
    if(!authState) {
      this.router.navigate(['/']);
    }

    return authState;
  }
}
