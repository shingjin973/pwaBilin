import {DataService} from './../../services/data.service';
import {Component, OnInit} from '@angular/core';
import {User} from "../../interfaces/user";
import {AuthService} from "../../services/auth.service";
import {NavigationEnd, Router} from "@angular/router";

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

    social: any;

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
            if (res && res.data) {
                this.social = res.data.social;
            }
        });
    }

    onActivate() {
        window.scroll(0, 0);
    }
}
