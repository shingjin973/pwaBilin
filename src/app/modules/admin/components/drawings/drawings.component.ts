import {DataService} from 'src/app/services/data.service';
import {Drawing} from './../../../../interfaces/course';
import {Component, OnInit} from '@angular/core';
import {Lightbox} from 'ngx-lightbox';

@Component({
    selector: 'app-drawings',
    templateUrl: './drawings.component.html',
    styleUrls: ['./drawings.component.scss']
})
export class DrawingsComponent implements OnInit {
    drawings: Drawing[];

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

    constructor(
        private _lightbox: Lightbox,
        private data: DataService
    ) {
    }

    ngOnInit() {
        this.getData(1);
    }

    getData(page) {
        // this.data.getDrawings().subscribe((res) => {
        //     if (res && res.data) {
        //         this.drawings = res.data;
        //     }
        // })
        this.currentPage = page;

        this.data.getDrawingsByPaginate(this.is_first_load, page).subscribe((res) => {
            if (res && res.data) {
                this.drawings = res.data;
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

    async delete(id) {
        this.data.deleteDrawing(id).subscribe((res) => {
            if (res) {
                this.is_first_load = 1;
                this.getData(1);
            }
        })
    }

    openDrawing(src: string) {
        this._lightbox.open([{src: src, thumb: src}]);
    }
}
