import { AuthService } from './../../services/auth.service';
import { Component } from '@angular/core';
import { User } from '../../interfaces/user';
import {NavigationEnd, Router} from "@angular/router";

@Component({
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
  user: User;

  constructor(private auth: AuthService, private router: Router){
    this.auth.getUser2().subscribe((user) => {
      this.user = user;
    });
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
}
