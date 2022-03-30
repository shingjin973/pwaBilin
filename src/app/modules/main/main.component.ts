import {Router, NavigationEnd} from '@angular/router';
import {Component, OnInit} from '@angular/core';
import {DataService} from 'src/app/services/data.service';

@Component({
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

    social: any;
    darkHeader = true;

    constructor(
        private data: DataService,
        private router: Router
    ) {
        this.router.events.subscribe((e) => {
            if (e instanceof NavigationEnd) {
                if (e.url === '/') {
                    this.darkHeader = true;
                } else {
                    this.darkHeader = false;
                }
                // if (e.url == "courses") {
                //     localStorage.removeItem('presale_search_key');
                // } else if (e.url == "packages") {
                //     localStorage.removeItem('course_search_key');
                // } else {
                //     localStorage.removeItem('course_search_key');
                //     localStorage.removeItem('presale_search_key');
                // }
            }
        });
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
