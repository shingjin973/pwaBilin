import {SearchComponent} from './../../../shared/components/search/search.component';
import {AuthService} from './../../../../services/auth.service';
import {DataService} from './../../../../services/data.service';
import {State} from './../../../../interfaces/enums';
import {Component, OnInit} from '@angular/core';
import {Enrollment} from 'src/app/interfaces/course';
import * as _ from 'lodash';
import {MatDialog} from '@angular/material';
import * as moment from 'moment';
import swal from "sweetalert2";

enum Fields {
    Student = 'student',
    Parent = 'parent',
    Teacher = 'teacher',
    Course = 'course',
}

@Component({
    templateUrl: './enrollments.component.html',
    styleUrls: ['./enrollments.component.scss']
})
export class EnrollmentsComponent implements OnInit {
    _enrollments: Enrollment[];
    enrollments: Enrollment[];

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
        private dialog: MatDialog
    ) {
    }

    ngOnInit() {
        this.getData(1);
    }

    getData(page, search_key = this.currentFilter) {
        this.currentPage = page;
        this.data.getEnrollmentsByPaginate(this.is_first_load, page, search_key).subscribe(async (res) => {
            if (res && res.data) {
                let enrollments = res.data;

                const user = await this.auth.getUser() as any;

                if (user.adminSchool) {
                    const {teachers} = await this.data.getSchool(user.adminSchool._id).toPromise();

                    enrollments = _.filter(enrollments, v => _.map(teachers, v => v._id).includes(v.teacher)) as Enrollment[];
                }

                enrollments = _.map(enrollments, v => ({
                    ...v,
                    session_time: v.sessions && _.find(v.sessions, {_id: v.session}) ? _.find(v.sessions, {_id: v.session}).startTime : ''
                }))

                this._enrollments = enrollments;
                this.enrollments = enrollments;
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

    async delete(id: string) {
        swal.fire({
            title: 'Are you sure to delete?',
            text: 'You will not be able to recover!',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.value) {
                this.data.deleteEnrollment(id).subscribe((res) => {
                    if (res) {
                        swal.fire('Great!', 'Deleted successfully.', 'success');
                        this.is_first_load = 1;
                        this.getData(1, this.currentFilter);
                    }
                })
            }
        });
    }

    async cancel(id: string) {
        swal.fire({
            title: 'Are you sure to cancel?',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.value) {
                this.data.updateEnrollment(id, {state: State.Canceled}).subscribe((res) => {
                    if (res) {
                        swal.fire('Great!', 'Canceled successfully.', 'success');
                        this.getData(this.currentPage, this.currentFilter);
                    }
                })
            }
        });

    }

    search() {
        const ref = this.dialog.open(SearchComponent, {
            width: '600px',
            data: [
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
                    key: Fields.Course,
                    value: 'Course Name'
                }
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

    filterEnrollments(filter?: any) {
        this.currentFilter = filter;

        if (!filter) {
            this.enrollments = this._enrollments;
            return;
        }

        const {field, value} = filter;

        switch (field) {
            case Fields.Student: {
                const regex = new RegExp(value, 'i');
                this.enrollments = _.filter(this._enrollments, v => regex.test(v.student_name));

                return;
            }
            case Fields.Teacher: {
                const regex = new RegExp(value, 'i');
                this.enrollments = _.filter(this._enrollments, v => regex.test(v.teacher_name));

                return;
            }
            case Fields.Parent: {
                const regex = new RegExp(value, 'i');
                this.enrollments = _.filter(this._enrollments, v => regex.test(v.student_family_name));

                return;
            }
            case Fields.Course: {
                const regex = new RegExp(value, 'i');
                this.enrollments = _.filter(this._enrollments, v => regex.test(v.course_name));

                return;
            }
        }
    }
}
