import {DataService} from './../../../../../services/data.service';
import {Student, UserType} from './../../../../../interfaces/user';
import {Lesson} from './../../../../../interfaces/course';
import {FormControl, Validators, FormGroup, FormBuilder} from '@angular/forms';
import {Component, OnInit} from '@angular/core';
import {Observable, Subject, of} from 'rxjs';
import {switchMap, map} from 'rxjs/operators';

import * as _ from 'lodash';
import {State} from 'src/app/interfaces/enums';
import {ActivatedRoute, Router} from '@angular/router';
import swal from 'sweetalert2';
import {Session} from 'src/app/interfaces/course';
import {ToastrService} from "ngx-toastr";

@Component({
    selector: 'app-new-enrollment',
    templateUrl: './new-bundle-enrollment.component.html',
    styleUrls: ['./new-bundle-enrollment.component.scss']
})
export class NewBundleEnrollmentComponent implements OnInit {

    isLoading = false;
    form: FormGroup;
    studentForm = new FormControl('', [Validators.required]);
    studentSearch = new Subject<string>();
    students$: Observable<any>;
    bundle_id: string;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private data: DataService,
        private route: ActivatedRoute,
        private toastr: ToastrService,
    ) {
    }

    ngOnInit() {
        this.route.params.subscribe(async (p) => {
            if (p.bundleid) {
                this.bundle_id = p.bundleid;
            } else {
                this.router.navigate(['/admin/packages']);
            }
        });
        this.form = this.fb.group({
            student_family: new FormControl('', [Validators.required]),
        });

        this.students$ = this.studentSearch.pipe(
            switchMap((q, i) => {
                if (!q) {
                    return of([]);
                }
                return this.data.getStudentsByChildName({q: q}).pipe(map(v => v.data || []));
            })
        );

        this.studentForm.valueChanges.subscribe((v) => {
            if (!v) {
                return;
            }
            this.studentSearch.next(v);
        });
    }

    async submit() {
        try {
            this.isLoading = true;

            if (this.form.invalid) {
                throw Error('Form is invalid.');
            }

            const data = this.form.value;
            data.student_name = data.student_family.children.name;
            data.student = data.student_family.children._id;
            data.bundle = this.bundle_id;
            data.student_family_name = data.student_family.name;
            data.student_family = data.student_family._id;

            const bundle_enrollment = await this.data.addAdminBundleEnrollments({
                ...data,
            }).toPromise();

            if (bundle_enrollment && bundle_enrollment.status == 200) {
                this.toastr.success("Package Enrollment was added successfully");
            }

            this.router.navigate(['/admin/packages', this.bundle_id, 'enrollments']);
        } catch ({message}) {
            swal.fire('Oops', message, 'error');
        } finally {
            this.isLoading = false;
            this.form.reset();
        }
    }
}
