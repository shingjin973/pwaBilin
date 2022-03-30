import { DataService } from 'src/app/services/data.service';
import { Component, OnInit } from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";

@Component({
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss']
})
export class AuthenticationComponent implements OnInit {

  loginText: string;

  constructor(
    private data: DataService,
    private router: Router
  ) {
      // this.router.events.subscribe((e) => {
      //     if (e instanceof NavigationEnd) {
      //         if (e.url == "courses") {
      //             localStorage.removeItem('presale_search_key');
      //         } else if (e.url == "packages") {
      //             localStorage.removeItem('course_search_key');
      //         } else {
      //             localStorage.removeItem('course_search_key');
      //             localStorage.removeItem('presale_search_key');
      //         }
      //     }
      // });
  }

  async ngOnInit() {
    this.data.getSettings('configs').subscribe((res) => {
      if(res && res.data){
        this.loginText = res.data.loginText;
      }
    });

    let node = document.createElement('script');
      node.src = 'https://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js';
      node.type = 'text/javascript';
      node.async = true;
      node.charset = 'utf-8';
      document.getElementsByTagName('head')[0].appendChild(node);
  }

}
