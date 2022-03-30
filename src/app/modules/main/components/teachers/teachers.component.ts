import {DataService} from 'src/app/services/data.service';
import {FormControl} from '@angular/forms';
import {BreadCrumb} from './../../../../interfaces/main';
import {Component, OnInit} from '@angular/core';
import {Teacher} from 'src/app/interfaces/user';
import {View} from 'src/app/interfaces/enums';

import * as _ from 'lodash';

@Component({
    templateUrl: './teachers.component.html',
    styleUrls: ['./teachers.component.scss']
})
export class TeachersComponent implements OnInit {

    View = View;

    teachers: Teacher[];
    showData: Teacher[];
    currentPage = 1;
    totalItemsPerPage = 6;

    viewState: View = View.Grid;

    breadcrumbs: BreadCrumb[] = [{
        link: 'Home',
        url: ['/']
    }, {
        link: 'Teachers'
    }];


    searchForm = new FormControl('');


    constructor(
        private data: DataService
    ) {
    }

    ngOnInit() {
        this.getTeachers();

        this.searchForm.valueChanges.subscribe(async (v) => {
            if (!v) {
                return;
            }

            const _data = _.filter(this.teachers, (i) => {
                const regex = new RegExp(v, 'gi');

                return i.name && String.prototype.search.call(i.name, regex) !== -1;
            });

            this.showData = _data;
        });
    }

    async getTeachers() {
        this.data.getTeachers({courses_offering: true, rating: true}).subscribe((res) => {
            if (res && res.data) {
                this.teachers = res.data;
                this.showData = this.teachers;
            }
        });
    }

}
