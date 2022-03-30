import {Router} from '@angular/router';
import {DataService} from './../../../../../services/data.service';
import {User} from './../../../../../interfaces/user';
import {UserType} from 'src/app/interfaces/user';
import {Component, OnInit} from '@angular/core';
import swal from 'sweetalert2';

@Component({
    selector: 'app-super-admin-testimonial',
    templateUrl: './super-admin-testimonial.component.html',
    styleUrls: ['./super-admin-testimonial.component.sass']
})
export class SuperAdminTestimonialComponent implements OnInit {

    UserType = UserType;

    admins: User[];
    testimonial: any[];
    teachers: any[];
    currentPage = 1;
    totalItemsPerPage = 20;
    pager = {};
    pagination_pages = [];
    has_previous_five_page = false;
    has_next_five_page = false;
    is_first_load = 1;

    constructor(
        private data: DataService,
        private router: Router
    ) {
    }

    ngOnInit() {
        this.getData(1);
    }

    getData(page) {
        this.currentPage = page;

        this.data.getTestimonialByPaginate(this.is_first_load, page).subscribe((res) => {
            if (res && res.data) {
                this.testimonial = res.data;
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

    async addTestimonial() {
        const inputOptions = {
            "English": "English",
            "Chinese": "Chinese"
        };

        swal.mixin({
            confirmButtonText: 'Next &rarr;',
            showCancelButton: true,
            progressSteps: ['1', '2', '3']
        }).queue([
            {
                title: 'Please enter name',
                input: 'text',
                inputValidator: (v) => !!v ? '' : 'Please enter valid name'
            },
            {
                title: 'Please enter testimony',
                input: 'textarea',
                inputValidator: (v) => !!v ? '' : 'Please enter valid testimony'
            },
            {
                title: 'Please select language',
                input: 'select',
                inputOptions,
                confirmButtonText: 'Submit'
            }
        ]).then(async ({value}) => {
            if (value) {
                try {
                    await this.data.addTestimonial({
                        name: value[0],
                        testimony: value[1],
                        language: value[2]
                    }).toPromise();
                    this.is_first_load = 1;
                    this.getData(1);
                } catch ({message}) {
                    swal.fire('Oops', message, 'error');
                }
            }
        })
    }

    async deleteTestimonial(id) {
        try {

            swal.fire({
                title: 'Are you sure to delete?',
                text: 'You will not be able to recover!',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            }).then((result) => {
                if (result.value) {
                    this.data.deleteTestimonial(id).subscribe((res) => {
                        if (res) {
                            swal.fire('Great!', 'Testimonial has been successfully deleted.', 'success');
                            this.is_first_load = 1;
                            this.getData(1);
                        }
                    })
                }
            })
        } catch ({message}) {
            swal.fire('Oops', message, 'error');
        }
    }

    async editTestimonial(item) {
        const inputOptions = {
            "English": "English",
            "Chinese": "Chinese"
        };

        swal.mixin({
            confirmButtonText: 'Next &rarr;',
            showCancelButton: true,
            progressSteps: ['1', '2', '3']
        }).queue([
            {
                title: 'Please enter name',
                input: 'text',
                inputValue: item.name,
                inputValidator: (v) => !!v ? '' : 'Please enter valid name'
            },
            {
                title: 'Please enter testimony',
                input: 'textarea',
                inputValue: item.testimony,
                inputValidator: (v) => !!v ? '' : 'Please enter valid testimony'
            },
            {
                title: 'Please select language',
                input: 'select',
                inputOptions,
                inputValue: item.language,
                confirmButtonText: 'Submit'
            }
        ]).then(async ({value}) => {
            if (value) {
                try {
                    await this.data.editTestimonial(item._id,{
                        name: value[0],
                        testimony: value[1],
                        language: value[2]
                    }).toPromise();
                    this.is_first_load = 1;
                    this.getData(1);
                } catch ({message}) {
                    swal.fire('Oops', message, 'error');
                }
            }
        })
    }
}
