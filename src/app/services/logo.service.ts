import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LogoService {

  logo: any;

  constructor()
  { }

  setLogo(logo: any)
  {
    this.logo = logo
  }

  getLogo()
  {
    return this.logo;
  }
}
