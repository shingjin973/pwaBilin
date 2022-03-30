import {User} from './../../../../../interfaces/user';
import {UserType} from 'src/app/interfaces/user';
import {DataService} from 'src/app/services/data.service';
import {Component} from '@angular/core';
import * as _ from 'lodash';

@Component({
    selector: 'app-super-admin-balances',
    templateUrl: './super-admin-balances.component.html',
    styleUrls: ['./super-admin-balances.component.scss']
})
export class SuperAdminBalancesComponent {
    UserType = UserType;

    _users: User[];
    users: User[];
    filter = '';
    pager = {};
    pagination_pages = [];
    has_previous_five_page = false;
    has_next_five_page = false;
    is_first_load = 1;
    currentPage = 1;

    constructor(
        private data: DataService
    ) {
        this.getUsers(1);
    }

    getUsers(page) {
        // this.data.getUsers({
        //     type: `${UserType.Student},${UserType.Teacher}`
        // }).subscribe((res) => {
        //     if (res && res.data) {
        //         this._users = res.data;
        //
        //         this.filterData();
        //     }
        // })
        this.currentPage = page;
        this.data.getBalanceUsersByPaginate(this.is_first_load, page, {
            type: `${UserType.Student},${UserType.Teacher}`
        }).subscribe((res) => {
            if (res && res.data) {
                this._users = res.data;
                if (this.is_first_load === 1) {
                    this.pager = res.pager;
                    this.is_first_load = 0;
                }
                this.makePages(page, this.pager);
                this.filterData();
            }
        })
    }
    makePages(page, pager) {
        var pages = [];
        var start_page = 1;
        var end_page = 5;

        if (parseInt(page) >= 3) {
            start_page = parseInt(page) - 2;
            // BEGIN: calculate end_page
            if ((parseInt(page) + 2) <= parseInt(pager.pages[pager.pages.length-1])) {
                end_page = parseInt(page) + 2;
                this.has_next_five_page = true;
            } else {
                end_page = pager.pages[pager.pages.length-1];
                this.has_next_five_page = false;
            }
            // END:
        } else {
            if ( parseInt(pager.pages[pager.pages.length-1]) <= 5) {
                end_page = parseInt(pager.pages[pager.pages.length-1]);
                this.has_next_five_page = false;
            } else {
                end_page = 5;
                this.has_next_five_page = true;
            }
        }
        if (start_page > 1){
            this.has_previous_five_page = true;
        } else {
            this.has_previous_five_page = false;
        }
        for (let i = start_page; i <= end_page; i++) {
            pages.push(i);
        }
        this.pagination_pages = pages;
    }

    filterData() { 

        if (!this.filter) {
            this.users = this._users;
            return;
        }

        let users = this._users;

        if (/s/gi.test(this.filter)) {
            users = _.filter(users, v => v.type === UserType.Student);
        }

        if (/t/gi.test(this.filter)) {
            users = _.filter(users, v => v.type === UserType.Teacher);
        }

        if (/b/gi.test(this.filter)) {
            users = _.filter(users, v => !!v.balance);
        }

        this.users = users;
    }

}
