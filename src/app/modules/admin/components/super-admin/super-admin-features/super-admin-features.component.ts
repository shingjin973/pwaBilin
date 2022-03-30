import {DataService} from 'src/app/services/data.service';
import {FormGroup} from '@angular/forms';
import {User, UserType} from './../../../../../interfaces/user';
import {Component, OnInit} from '@angular/core';
import swal from 'sweetalert2';
import * as _ from 'lodash';

@Component({
    selector: 'app-super-admin-features',
    templateUrl: './super-admin-features.component.html',
    styleUrls: ['./super-admin-features.component.scss']
})
export class SuperAdminFeaturesComponent implements OnInit {

    UserType = UserType;

    admins: any[];

    form: FormGroup;

    currentPage = 1;
    totalItemsPerPage = 20;
    pager = {};
    pagination_pages = [];
    has_previous_five_page = false;
    has_next_five_page = false;
    is_first_load = 1;

    constructor(
        private data: DataService
    ) {
    }

    ngOnInit() {
        this.getData(1);
    }

    getData(page) {
        this.currentPage = page;

        this.data.getFeatureTeachersByPaginate(this.is_first_load, page).subscribe((res) => {
            if (res && res.data) {
                this.admins = res.data;
                if (this.is_first_load === 1) {
                    this.pager = res.pager;
                    this.is_first_load = 0;
                }
                this.makePages(page, this.pager);
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
            if ((parseInt(page) + 2) <= parseInt(pager.pages[pager.pages.length - 1])) {
                end_page = parseInt(page) + 2;
                this.has_next_five_page = true;
            } else {
                end_page = pager.pages[pager.pages.length - 1];
                this.has_next_five_page = false;
            }
            // END:
        } else {
            if (parseInt(pager.pages[pager.pages.length - 1]) <= 5) {
                end_page = parseInt(pager.pages[pager.pages.length - 1]);
                this.has_next_five_page = false;
            } else {
                end_page = 5;
                this.has_next_five_page = true;
            }
        }
        if (start_page > 1) {
            this.has_previous_five_page = true;
        } else {
            this.has_previous_five_page = false;
        }
        for (let i = start_page; i <= end_page; i++) {
            pages.push(i);
        }
        this.pagination_pages = pages;
    }

    async deleteFromFeatures(id: string) {
        await this.data.removeFeatureTeacher(id).toPromise();
        this.is_first_load = 1;

        this.getData(1);
    }

}
