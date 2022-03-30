import {SearchComponent} from '../../../../shared/components/search/search.component';
import {AuthService} from '../../../../../services/auth.service';
import {DataService} from '../../../../../services/data.service';
import {State} from '../../../../../interfaces/enums';
import {Component, OnInit} from '@angular/core';
import {Bundle, Enrollment} from 'src/app/interfaces/course';
import * as _ from 'lodash';
import {MatDialog} from '@angular/material';
import * as moment from 'moment';
import swal from "sweetalert2";
import {Router} from "@angular/router";

enum Fields {
    Course = 'course',
    Title = 'title'
}

@Component({
    templateUrl: './featured-packages.component.html',
    styleUrls: ['./featured-packages.component.scss']
})
export class FeaturedPackagesComponent implements OnInit {
    _bundles: Bundle[];
    bundles: Bundle[];
    State = State;

    currentPage = 1;
    totalItemsPerPage = 20;

    currentFilter = {
        field: "",
        value: ""
    };
    pager = {
        currentPage: 1,
        totalPages: 0,
        pages: [],
        totals: 0
    };
    pagination_pages = [];
    has_previous_five_page = false;
    has_next_five_page = false;
    is_first_load = 1;

    constructor(
        private data: DataService,
        private auth: AuthService,
        private dialog: MatDialog,
        private router: Router
    ) {
    }

    ngOnInit() {
        this.getData(1);
    }

    getData(page, search_key = this.currentFilter) {
        this.currentPage = page;
        this.data.getFeaturedBundlesByPaginate(this.is_first_load, page, search_key).subscribe(async (res) => {
            if (res && res.data) {
                let bundles = res.data;

                const user = await this.auth.getUser() as any;

                if (user.adminSchool) {
                    const {teachers} = await this.data.getSchool(user.adminSchool._id).toPromise();
                    bundles = _.filter(bundles, v => _.map(teachers, v => v._id).includes(v.teacher)) as Bundle[];
                }

                this._bundles = bundles;
                this.bundles = bundles;
                this.pager = res.pager;
                // if (this.is_first_load === 1) {
                //     this.pager = res.pager;
                //     this.is_first_load = 0;
                // }
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

    async deleteBundle(course_id, bundle_id) {
        swal.fire({
            title: 'Are you sure to delete?',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.value) {
                this.data.deleteBundle(course_id, bundle_id).subscribe(() => {
                    this.getData(this.currentPage, this.currentFilter);
                });
            }
        });
    }

    search() {
        const ref = this.dialog.open(SearchComponent, {
            width: '600px',
            data: [
                {
                    key: Fields.Course,
                    value: 'Course Name'
                },
                {
                    key: Fields.Title,
                    value: 'Package Title'
                },
            ]
        });

        ref.beforeClose().subscribe((filter) => {
            if (filter) {
                // this.filterEnrollments(filter);
                this.currentFilter = filter;
                this.is_first_load = 1;

                this.getData(1, filter);

            }
        })
    }

    clearSearch() {
        this.currentFilter = {
            field: "",
            value: ""
        };
        this.is_first_load = 1;
        this.getData(1, this.currentFilter);
    }

    async removeFeaturePackage(course_id, bundle_id) {
        await this.data.removeFeaturePackage(course_id, bundle_id).toPromise();
        this.getData(this.currentPage, this.currentFilter);
    }

    navigate(route) {
        this.router.navigate(route);
    }
}
