import {ActivatedRoute} from '@angular/router';
import {DataService} from './../../../../services/data.service';
import {FormControl} from '@angular/forms';
import {User, Student, UserType} from './../../../../interfaces/user';
import {Component, OnInit} from '@angular/core';
import * as _ from 'lodash';
import {MatDialog} from '@angular/material';
import {SearchComponent} from 'src/app/modules/shared/components/search/search.component';
import swal from "sweetalert2";

enum Fields {
    Student = 'student',
    Parent = 'parent',
    Email = 'email',
    Teacher = 'teacher',
    Type = 'type',
    Phone = 'phone',
    Promoter = 'promoter_id'
}

@Component({
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
    currentFilter = {
        field: '',
        value: ''
    };

    users: User[];
    _users: User[];

    currentPage = 1;
    totalItemsPerPage = 20;

    showSettings = false;

    searchForm = new FormControl('');
    userFilter = 0;

    schoolFilter = '';

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
        private route: ActivatedRoute,
        private dialog: MatDialog
    ) {
    }

    ngOnInit() {
        this.loadPage(1);
        // this.data.getUsers().subscribe((res) => {
        //     if (res && res.data) {
        //         if (this.route.snapshot.queryParams['school']) {
        //             this.schoolFilter = this.route.snapshot.queryParams['school'];
        //             this._users = _.filter(res.data, v => v.school === this.schoolFilter);
        //         } else {
        //             this._users = res.data;
        //         }
        //
        //         this.users = this._users;
        //     }
        // })
    }

    loadPage(page, search_key = this.currentFilter) {
        this.currentPage = page;

        if (this.route.snapshot.queryParams['school']) {
            this.schoolFilter = this.route.snapshot.queryParams['school'];
        }
        let userType = 'all';
        // get page of items from api
        this.data.getUsersByPaginate(this.is_first_load, page, search_key, this.schoolFilter,userType).subscribe((res) => {
            if (res && res.data) {
                // if (this.route.snapshot.queryParams['school']) {
                //     this.schoolFilter = this.route.snapshot.queryParams['school'];
                //     this._users = _.filter(res.data, v => v.school === this.schoolFilter);
                // } else {
                //     this._users = res.data;
                // }
                this.users = res.data;            
                this.users = _.sortBy(this.users, v => v.auto_id);
                if (this.is_first_load === 1) {
                    this.pager = res.pager;
                    this.is_first_load = 0;
                }
                this.makePages(page, this.pager);
            }
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

    async delete(id) {
        this.data.deleteUser(id).subscribe();
    }


    async retireTeacher(teacher_id) {
        swal.fire({
            title: 'Are you sure to set the teacher retired?',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.value) {
                this.data.retireTeacher(teacher_id).subscribe(() => {
                    this.loadPage(this.currentPage);
                });
            }
        });
    }

    async removeRetireTeacher(teacher_id) {
        swal.fire({
            title: 'Are you sure to set the teacher not retired?',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.value) {
                this.data.removeRetireTeacher(teacher_id).subscribe(() => {
                    this.loadPage(this.currentPage);
                });
            }
        });
    }

    search() {
        const ref = this.dialog.open(SearchComponent, {
            width: '600px',
            data: [
                {
                    key: Fields.Type,
                    value: 'User Type'
                },
                {
                    key: Fields.Student,
                    value: 'Student Name'
                },
                {
                    key: Fields.Parent,
                    value: 'Parent Name'
                },
                {
                    key: Fields.Teacher,
                    value: 'Teacher Name'
                },
                {
                    key: Fields.Email,
                    value: 'Email'
                },
                {
                    key: Fields.Phone,
                    value: 'Phone'
                },
                {
                    key: Fields.Promoter,
                    value: 'Promoter ID'
                }
            ]
        });

        ref.beforeClose().subscribe((filter) => {          
            if (filter) {
                this.currentFilter = filter;
                this.is_first_load = 1;
                this.loadPage(1, filter);
                // this.filterUsers(filter);
            }
        });
    }

    clearSearch() {
        this.currentFilter = {
            field: '',
            value: ''
        };
        this.is_first_load = 1;

        this.loadPage(1, this.currentFilter);
    }

    filterUsers(filter?: any) {
        this.currentFilter = filter;

        if (!filter) {
            this.users = this._users;
            return;
        }

        const {field, value} = filter;

        switch (field) {
            case Fields.Student: {
                this.users = _.filter(this._users, (v: Student) => {
                    if (!v.children || !v.children.length) {
                        return false;
                    }

                    const regex = new RegExp(value, 'i');

                    return !!_.filter(v.children, q => regex.test(q.name)).length;
                });
                return;
            }
            case Fields.Parent: {
                const regex = new RegExp(value, 'i');
                this.users = _.filter(this._users, v => v.type === UserType.Student && regex.test(v.name));

                return;
            }
            case Fields.Teacher: {
                const regex = new RegExp(value, 'i');
                this.users = _.filter(this._users, v => (v.type === UserType.Teacher || v.type === UserType.UnApprovedTeacher) && regex.test(v.name));

                return;
            }
            case Fields.Email: {
                const regex = new RegExp(value, 'i');
                this.users = _.filter(this._users, v => regex.test(v.email));

                return;
            }
        }
    }

    // filterUsers({value}){
    //   let data = this.users;

    //   this.userFilter = value;

    //   if(this.searchForm.value){
    //     data = _.filter(data, (i) => {
    //       const regex = new RegExp(this.searchForm.value, 'gi');

    //       return String.prototype.search.call(i.auto_id, regex) !== -1 || String.prototype.search.call(i.name, regex) !== -1;
    //     });
    //   }

    //   this.showData = value === 0 ? data : _.filter(data, {type: value});
    // }
}
