import {DataService} from './../../../../services/data.service';
import {User} from './../../../../interfaces/user';
import {FormControl} from '@angular/forms';
import {Component, OnInit} from '@angular/core';
import {Transaction} from 'src/app/interfaces/transactions';
import * as _ from 'lodash';
import swal from 'sweetalert2';
import {SearchComponent} from "../../../shared/components/search/search.component";
import {MatDialog} from "@angular/material";

@Component({
    selector: 'app-transactions',
    templateUrl: './transactions.component.html',
    styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {
    currentFilter = {
        field: "",
        value: ""
    };

    transactions: Transaction[];
    showData: any[];
    currentPage = 1;
    totalItemsPerPage = 20;
    showSettings = false;
    searchForm = new FormControl('');
    transactionFilter = 0;
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
        private dialog: MatDialog
    ) {
    }

    ngOnInit() {
        this.searchForm.valueChanges.subscribe(async (v) => {
            if (!v) {
                this.showData = this.transactions;
                return;
            }

            let data = _.filter(this.transactions, (i) => !(this.transactionFilter !== 0 && i.type !== this.transactionFilter));

            if (!Number.isNaN(+v)) {
                this.showData = _.filter(data, (i) => String.prototype.search.call(i.auto_id, new RegExp(v, 'gi')) !== -1);
                return;
            }

            this.showData = _.filter(data, (i) => (i.debit_user && String.prototype.search.call((<User>i.debit_user).name, new RegExp(v, 'gi')) !== -1) || (i.credit_user && String.prototype.search.call((<User>i.credit_user).name, new RegExp(v, 'gi')) !== -1));
        })

        this.getData(1);
    }

    getData(page, search_key = this.currentFilter) {
        // this.data.getAllTransactions().subscribe((res) => {
        //     if (res && res.data) {
        //         this.transactions = res.data;
        //         this.showData = res.data;
        //     }
        // })
        this.currentPage = page;
        this.data.getAllTransactionsByPaginate(this.is_first_load, page, search_key).subscribe((res) => {
            if (res && res.data) {
                this.transactions = res.data;
                this.showData = res.data;
                if (this.is_first_load === 1) {
                    this.pager = res.pager;
                    this.is_first_load = 0;
                }
                this.makePages(page, this.pager);
            }
        })
    }

    search() {
        const ref = this.dialog.open(SearchComponent, {
            width: '600px',
            data: [
                {
                    key: 'Debit User',
                    value: 'Debit User'
                },
                {
                    key: 'Credit User',
                    value: 'Credit User'
                },
                {
                    key: 'Both',
                    value: 'Debit User or Credit User'
                }
            ]
        })

        ref.beforeClose().subscribe((filter) => {
            if (filter) {
                this.currentFilter = filter;
                this.is_first_load = 1;
                this.getData(1);
            }
        })
    }

    clearSearch() {
        this.currentFilter = {
            field: "",
            value: ""
        }
        this.is_first_load = 1;
        this.getData(1);

        // this.getData(1, this.currentFilter);
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

    openNotes(text) {
        swal.fire({
            type: 'info',
            title: 'Notes',
            text
        })
    }

    filterTransactions(value) {     
        let data = this.transactions;

        this.transactionFilter = value;

        if (this.searchForm.value) {
            data = _.filter(data, (i) => {
                const regex = new RegExp(this.searchForm.value, 'gi');

                return String.prototype.search.call(i.auto_id, regex) !== -1 || (i.debit_user && String.prototype.search.call((<User>i.debit_user).name, regex) !== -1) || (i.credit_user && String.prototype.search.call((<User>i.credit_user).name, regex) !== -1);
            });
        }

        this.showData = value === 0 ? data : _.filter(data, {type: value});
    }
}
