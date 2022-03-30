import {Component, OnInit} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {DataService} from '../../../../services/data.service';
import {State} from 'src/app/interfaces/enums';
import * as _ from 'lodash';
import {environment} from "../../../../../environments/environment";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import * as moment from "moment";

@Component({
    selector: 'app-sessions',
    templateUrl: './sessions.component.html',
    styleUrls: ['./sessions.component.sass']
})
export class SessionsComponent implements OnInit {
    State = State;
    _sessions: any[];
    sessions: any[];
    temp_sessions: any[];
    currentState = State.Active;

    currentPage = 1;
    totalItemsPerPage = 20;
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

    date_to_filter = '';
    show_pages = true;

    form: FormGroup;

    constructor(
        private data: DataService,
        private fb: FormBuilder
    ) {
    }

    ngOnInit() {
        this.form = this.fb.group({
            date_to_filter: new FormControl('YYYY-MM-DD')
        })
        this.getData(1);
    }

    getData(page) {
        this.currentPage = page;
        this.sessions = this.temp_sessions;
        this.data.getAllSessionsByPaginate(this.is_first_load, page, this.currentState).subscribe((res) => {
            console.log(res.data)
            this.show_pages = true;
            this._sessions = _.sortBy(res.data, v => v.sessions.startTime);       
            // this.sessions = _.sortBy(this._sessions, v => v.sessions.startTime);
            this.filterSessionsByDate(this.date_to_filter);
            if (this.is_first_load === 1) {
                this.pager = res.pager;
                this.is_first_load = 0;
            }
            this.makePages(page, this.pager);
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

    filterBy(state) {
        this.currentPage = 1;
        this.currentState = state;
        this.is_first_load = 1;
        this.date_to_filter = "";
        // begin: clear date input value
        this.form.controls['date_to_filter'].setValue('YYYY-MM-DD');
        // end:
        this.getData(this.currentPage);
    }

    filterByDate(event) {
        let options = {
            month: 'short',
            day: 'numeric',
            // year: '2-digit'
            year: 'numeric'
        };

        let date_to_filter = new Date(event.target.valueAsDate).toLocaleDateString('en-US', options);
        this.date_to_filter = date_to_filter;
        this.show_pages = false;
        this.filterSessionsByDate(date_to_filter);
    }

    clearDateToFilter() {
        this.date_to_filter = "";

        // begin: clear date input value
        this.form.controls['date_to_filter'].setValue('YYYY-MM-DD');
        // end:

        this.show_pages = true;
        this.filterSessionsByDate(this.date_to_filter);
    }

    filterSessionsByDate(date) {   
        let options = {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        };
        if (date != "" && this._sessions) {
            let sessions = this._sessions;
            sessions.forEach(session => {
                let converted_startTime = new Date(session.sessions.startTime).toLocaleDateString('en-US', options);
                session.converted_startTime = converted_startTime;
            });
            this.sessions = _.filter(sessions, (v) => v.converted_startTime == date);
        } else {
            this.sessions = this._sessions;
        }
    }
}
