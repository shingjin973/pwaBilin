import {DataService} from './../../../../../services/data.service';
import {UserType} from './../../../../../interfaces/user';
import {Lesson} from './../../../../../interfaces/course';
import {FormControl, Validators, FormGroup, FormBuilder} from '@angular/forms';
import {Component, OnInit} from '@angular/core';
import {Observable, Subject, of} from 'rxjs';
import {switchMap, map} from 'rxjs/operators';

import * as _ from 'lodash';
import {State} from 'src/app/interfaces/enums';
import {Router} from '@angular/router';
import swal from 'sweetalert2';
import {Session} from 'src/app/interfaces/course';

@Component({
    selector: 'app-new-enrollment',
    templateUrl: './new-enrollment.component.html',
    styleUrls: ['./new-enrollment.component.scss']
})
export class NewEnrollmentComponent implements OnInit {

    isLoading = false;

    form: FormGroup;

    studentForm = new FormControl('', [Validators.required]);
    teacherForm = new FormControl('', [Validators.required]);

    studentSearch = new Subject<string>();
    teacherSearch = new Subject<string>();
    lessonsSearch = new Subject<string>();

    students$: Observable<any>;
    teachers$: Observable<any>;
    lessons: Lesson[];
    sessions: Session[];

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private data: DataService
    ) {
    }

    ngOnInit() {
        this.form = this.fb.group({
            lesson: new FormControl('', [Validators.required]),
            session: new FormControl('', [Validators.required]),
            student_family: new FormControl('', [Validators.required]),
            teacher: new FormControl('', [Validators.required])
        })

        this.students$ = this.studentSearch.pipe(
            switchMap((q, i) => {
                if (!q) {
                    return of([]);
                }

                return this.data.getStudentsByChildName({q: q}).pipe(map(v => v.data || []));
            })
        )

        this.teachers$ = this.teacherSearch.pipe(
            switchMap((q, i) => {
                if (!q) {
                    return of([]);
                }

                return this.data.getTeachers({q: q}).pipe(map(v => v.data || []));
            })
        )

        this.lessonsSearch.pipe(
            switchMap((q, i) => {
                return this.data.getLessons('', {teacher_id: q}).pipe(map(v => v.data || []));
            })
        ).subscribe(async data => {
            this.lessons = data;
        })

        this.studentForm.valueChanges.subscribe((v) => {
            if (!v) {
                return;
            }

            this.studentSearch.next(v);
        })

        this.teacherForm.valueChanges.subscribe((v) => {
            if (!v) {
                return;
            }

            this.teacherSearch.next(v);
        })

        this.form.get('teacher').valueChanges.subscribe((v) => {
            if (!v) {
                return;
            }

            this.lessonsSearch.next(v._id);
        })

        this.form.get('lesson').valueChanges.subscribe((lesson) => {
            this.sessions = _.filter(lesson.sessions, v => v.state === State.Active);
        })
    }

    async submit() {
        try {
            this.isLoading = true;

            if (this.form.invalid) {
                throw Error('Form is invalid.');
            }

            const data = this.form.value;

            data.course_name = data.lesson.course.topic;
            data.course = data.lesson.course_id;

            data.lesson = data.lesson._id;

            data.state = State.Active;

            data.student_name = data.student_family.children.name;
            data.student = data.student_family.children._id;

            data.student_family_name = data.student_family.name;
            data.student_family = data.student_family._id;

            data.teacher_name = data.teacher.name;
            data.teacher = data.teacher._id;

            if (!data.session.length) {
                throw Error('No sessions picked.');
            }

            for (let session of data.session) {
                await this.data.addAdminEnrollments({
                    ...data,
                    session: session._id,
                    session_auto_id: session.auto_id
                }).toPromise();
            }

            this.router.navigate(['/admin/enrollments']);
        } catch ({message}) {
            swal.fire('Oops', message, 'error');
        } finally {
            this.isLoading = false;

            this.form.reset();

            this.lessons = undefined;
        }
    }
}
