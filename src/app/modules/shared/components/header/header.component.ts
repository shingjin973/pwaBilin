import {AuthService} from './../../../../services/auth.service';
import {Component, OnInit, Input, HostListener} from '@angular/core';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import {trigger, transition, style, animate} from '@angular/animations';
import {UserType} from "../../../../interfaces/user";

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    animations: [
        trigger('sidebar', [
            transition(':enter', [
                style({
                    left: '-300px'
                }),
                animate('300ms', style({
                    left: 0
                }))
            ]),
            transition(':leave', [
                style({
                    left: '0'
                }),
                animate('300ms', style({
                    left: '-300px'
                }))
            ]),
        ])
    ]

})

export class HeaderComponent {

    @Input('social') social: any;

    showSidebar = false;
    isMenuCollapsed = true;

    isLoggedIn: Observable<boolean>;
    isAdmin: Observable<boolean>;
    isStudent: Observable<boolean>;
    isPromoter:Observable<boolean>;

    constructor(private auth: AuthService, private router: Router) {
        this.isLoggedIn = auth.isAuthenticated();
        this.isAdmin = auth.isSchoolAdmin();
        this.isStudent = auth.isStudent();
        this.isPromoter = auth.isPromoter();  
    }

    logout() {
        this.auth.logout();
        localStorage.removeItem('checkout_bundles');
        this.router.navigate(['/']);
    }

    navigate(url) {
        this.router.navigate([url]);
    }

    changeLang(lang) { 
        location.href = `${location.origin}/${lang}${this.router.url}`;
    }

    @HostListener('window:scroll', ['$event'])
    onWindowScroll(e) {
        let elementDesktop = document.getElementsByClassName('desktop')[0];
        let elementMobile = document.getElementsByClassName('mobile')[0];
        if (getComputedStyle(elementDesktop).display == "block") {
            if (window.pageYOffset > 450) {
                elementDesktop.classList.add('sticky');
            } else {
                elementDesktop.classList.remove('sticky');
            }
        } else {
            if (window.pageYOffset > 600) {
                elementMobile.classList.add('sticky');
            } else {
                elementMobile.classList.remove('sticky');
            }
        }
    }
}
