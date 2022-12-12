import { Component } from '@angular/core';
import { ResolveEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css', '../assets/css/bootstrap.css'],
})
export class AppComponent {
  href: any;
  loginStatus: any;
  userName: any;
  footerVisible: boolean = false;
  headerVisible: boolean = false;
  footerHomePadding: any;

  constructor(private router: Router) {
    var allowedPages = ['/', '/register', '/login'];

    this.loginStatus = localStorage.getItem('userDetails') ? 1 : 0;
    this.router.events.subscribe((routerData) => {
      if (routerData instanceof ResolveEnd) {
        // alert(routerData.url);
        if (allowedPages.includes(routerData.url))
        {
          this.headerVisible = false;

          if(window.innerWidth < 767 && routerData.url == '/') {
            this.footerVisible = false;
          }
          else {
            this.footerVisible = true;
          }
        }
        else
        {
          this.headerVisible = true;
          this.footerVisible = true;
        }
      }
    });
  }

  ngOnInit(): void {

    var href = window.location.href.split('/');

    //this.footerHomePadding = href[href.length - 1] == "" ? { 'padding-bottom': '55px' } : '';
    // this.footerVisible =
    //   href[href.length - 1] === 'login' || href[href.length - 1] === 'register'
    //     ? false
    //     : true;
    // this.href = href[href.length - 1];
    console.log(href)
  }
}
