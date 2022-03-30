import {FormControl} from '@angular/forms';
import {AuthService} from './../../../../services/auth.service';
import {Course} from './../../../../interfaces/course';
import {Component, OnInit} from '@angular/core';
import {DataService} from 'src/app/services/data.service';
import * as _ from 'lodash';
import {MatDialog} from '@angular/material';
import {SearchComponent} from '../../../shared/components/search/search.component';

enum Fields {
    Topic = 'topic'
}

@Component({
    templateUrl: './wechat-courses.component.html',
    styleUrls: ['./wechat-courses.component.scss']
})
export class WechatCoursesComponent implements OnInit {
    user;

    _data: Course[];
    data: Course[];

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

    currentPage = 1;
    totalItemsPerPage = 20;
    currentFilter = {
        field: "",
        value: ""
    };

    constructor(
        private db: DataService,
        private auth: AuthService,
        private dialog: MatDialog
    ) {
    }

    async ngOnInit() {
        this.auth.getUser2().subscribe((user: any) => {
            this.user = user;
            this.getData(1);
        })
    }

    getData(page, search_key = this.currentFilter) {
        const query: any = {
            orderBy: 'date'
        };

        if (this.user.adminSchool) {
            query.school = this.user.adminSchool['_id'];
        }

        // this.db.getCourses(query).subscribe((data) => {
        //   this._data = data;
        //   this.filter();
        // });
        this.currentPage = page;

        this.db.getWechatCoursesByPaginate(query, this.is_first_load, page, search_key).subscribe((res) => {
            this._data = res.data;
            this.data = this._data;

            if (this.is_first_load === 1) {
                this.pager = res.pager;
                this.is_first_load = 0;
            }
            this.makePages(page, this.pager);
        });
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

    search() {
        const ref = this.dialog.open(SearchComponent, {
            width: '600px',
            data: [
                {
                    key: Fields.Topic,
                    value: 'Topic'
                }
            ]
        })

        // ref.beforeClose().subscribe(
        //     // this.filter.bind(this)
        // );
        ref.beforeClose().subscribe((filter) => {
            if (filter) {
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

    filter(filter?: any) {
        this.currentFilter = filter;

        if (!filter) {
            this.data = this._data;
            return;
        }

        const {field, value} = filter;
        switch (field) {
            case Fields.Topic: {
                const regex = new RegExp(value, 'i');
                this.data = _.filter(this._data, v => regex.test(v.topic));
                break;
            }
            default: {
                this.data = this._data;
            }
        }
    }
}
