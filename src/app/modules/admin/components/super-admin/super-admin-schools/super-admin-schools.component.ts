import {Router} from '@angular/router';
import {DataService} from './../../../../../services/data.service';
import {User} from './../../../../../interfaces/user';
import {UserType} from 'src/app/interfaces/user';
import {Component, OnInit} from '@angular/core';
import swal from 'sweetalert2';

@Component({
    selector: 'app-super-admin-schools',
    templateUrl: './super-admin-schools.component.html',
    styleUrls: ['./super-admin-schools.component.sass']
})
export class SuperAdminSchoolsComponent implements OnInit {

    UserType = UserType;

    admins: User[];
    schools: any[];
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

        this.data.getSchoolsByPaginate(this.is_first_load, page).subscribe((res) => {
            if (res && res.data) {
                this.schools = res.data;
                if (this.is_first_load === 1) {
                    this.pager = res.pager;
                    this.is_first_load = 0;
                }
                this.makePages(page, this.pager);
            }
        });
        this.data.getUsers({
            type: UserType.SchoolAdmin
        }).subscribe((res) => {
            if (res && res.data) {
                this.admins = res.data;
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

    async add() {
        const inputOptions = {};

        for (let admin of this.admins) {
            inputOptions[admin._id] = `${admin.name} (${admin.email})`;
        }

        swal.mixin({
            confirmButtonText: 'Next &rarr;',
            showCancelButton: true,
            progressSteps: ['1', '2']
        }).queue([
            {
                title: 'Please pick an admin',
                input: 'select',
                inputOptions
            },
            {
                title: 'Please enter school name',
                input: 'text',
                confirmButtonText: 'Submit'
            }
        ]).then(async ({value}) => {
            if (value) {
                try {
                    await this.data.addSchool({
                        admin: value[0],
                        name: value[1]
                    }).toPromise();
                    this.is_first_load = 1;

                    this.getData(1);
                } catch ({message}) {
                    swal.fire('Oops', message, 'error');
                }
            }
        })
    }

    async viewTeachers(id) {
        this.router.navigate(['/admin/users'], {queryParams: {school: id}});
    }

    async delete(id) {
        try {
            await this.data.deleteSchool({id}).toPromise();

            swal.fire('Great!', 'School has been successfully deleted.', 'success');
            this.is_first_load = 1;

            this.getData(1);
        } catch ({message}) {
            swal.fire('Oops', message, 'error');
        }
    }
}
