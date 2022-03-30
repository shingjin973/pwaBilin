import {DataService} from 'src/app/services/data.service';
import {Component, OnInit} from '@angular/core';

import * as _ from 'lodash';
import {Review} from "../../../../interfaces/review";

@Component({
    selector: 'app-payments',
    templateUrl: './payments.component.html',
    styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent implements OnInit {
    payments:[];
    totalItemsPerPage = 10;
    currentPage = 1;
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
        private data: DataService
    ) {
    }

    ngOnInit() {
        this.getData(1)
    }

    async getData(page) {
        // this.data.getAllReviews().subscribe((res) => {
        //   if(res && res.data){
        //     this.reviews = res.data as Review[];
        //   }
        // })
        this.currentPage = page;

        this.data.getAllPaymentsByPaginate(this.is_first_load, page).subscribe((res) => {
            if (res && res.data) {        
                this.payments = res.data;      
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

}
