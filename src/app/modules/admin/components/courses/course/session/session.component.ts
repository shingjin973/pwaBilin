import {DataService} from './../../../../../../services/data.service';
import {Lightbox} from 'ngx-lightbox';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {Enrollment, Session, Drawing, Material} from './../../../../../../interfaces/course';
import {ActivatedRoute, Router} from '@angular/router';
import {Lesson} from 'src/app/interfaces/course';
import {Component, OnInit, Inject} from '@angular/core';
import {ToastrService} from 'ngx-toastr';

import * as _ from 'lodash';
import {State} from 'src/app/interfaces/enums';

import swal from 'sweetalert2';
import * as moment from 'moment';
import {MAT_DIALOG_DATA, MatDialogRef, MatDialog} from '@angular/material';

@Component({
    selector: 'app-session',
    templateUrl: './session.component.html',
    styleUrls: ['./session.component.scss']
})
export class SessionComponent implements OnInit {
    State = State;

    lesson: Lesson;

    enrollments: Enrollment[];
    materials: Material[];
    drawings: Drawing[];

    form: FormGroup;

    session: Session;

    isLoadingSession = false;

    constructor(
        private router: Router,
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private _lightbox: Lightbox,
        private data: DataService,
        private dialog: MatDialog
    ) {
    }

    ngOnInit() {
        this.route.params.subscribe((p) => {
            if (p.courseid && p.lessonid && p.sessionid) {
                this.getData(p.courseid, p.lessonid, p.sessionid);
            }
        })
    }

    /**
     * Function that gets data from the db
     * @param courseid course's ID
     * @param lessonid lesson's ID
     * @param sessionid sessions's ID
     */
    async getData(courseid: string, lessonid: string, sessionid: string) {
        this.data.getLesson(courseid, lessonid).subscribe((res) => {
            if (res && res.data) {
                this.lesson = res.data;

                this.session = _.find(this.lesson.sessions, {_id: sessionid});

                if (!this.form) {
                    this.createForm();
                }

                this.getEnrollments();
                this.getMaterials();
                this.getDrawings();
            }
        })
    }

    createForm() {
        this.form = this.fb.group({
            subject: new FormControl(this.session.subject, Validators.required),
            subject_ch: new FormControl(this.session.subject_ch),
            date: new FormControl(moment(this.session.startTime).format('YYYY-MM-DD'), [Validators.required]),
            zoomUrl: new FormControl(this.session.zoomUrl),
            zoomId: new FormControl(this.session.zoomId),
            zoomPassword: new FormControl(this.session.zoomPassword),
            notes: new FormControl(this.session.notes),
            status: new FormControl(this.session.state, [Validators.required]),
            startTime: new FormControl(moment(this.session.startTime).format('HH:mm'), [Validators.required])
        })
    }

    async changeState() {
        try {
            const options: any = {};

            if (this.session.state === State.Active) {
                options.complete = 'Complete';
                options.cancel = 'Cancel';
            } else {
                options.reschedule = 'Reschedule';
            }

            const {value} = await swal.fire({
                title: 'Status change',
                text: 'Please pick a status for the session',
                input: 'select',
                showCancelButton: true,
                inputOptions: options,
                inputValidator: (v) => v === 'cancel' || v === 'complete' || v === 'reschedule' ? '' : 'Please pick a status.'
            })

            switch (value) {
                case 'cancel': {
                    this.cancelSession();
                    break;
                }
                case 'complete': {
                    this.completeSession();
                    break;
                }
                case 'reschedule': {
                    this.rescheduleSession();
                    break;
                }
            }

        } catch (e) {
            console.error(e);
            this.toastr.error(e.message);
        }
    }

    async completeSession() {
        this.isLoadingSession = true;

        this.data.completeLessonSession(this.lesson.course_id, this.lesson._id, this.session._id).subscribe((res) => {
            this.isLoadingSession = false;

            if (res) {
                this.getData(this.lesson.course_id, this.lesson._id, this.session._id);
            }
        })
    }

    async cancelSession() {
        this.isLoadingSession = true;

        this.data.cancelLessonSession(this.lesson.course_id, this.lesson._id, this.session._id).subscribe((res) => {
            this.isLoadingSession = false;

            if (res) {
                this.getData(this.lesson.course_id, this.lesson._id, this.session._id);
            }
        })
    }

    async rescheduleSession() {
        this.isLoadingSession = true;

        swal.mixin({
            input: 'text',
            confirmButtonText: 'Next &rarr;',
            showCancelButton: true,
            progressSteps: ['1', '2']
        }).queue([
            {
                title: 'Please enter Zoom URL',
                text: 'Make sure Zoom URL is valid.',
                inputValidator: (v) => !v ? 'Please enter valid URL' : ''
            },
            {
                title: 'Please enter Zoom ID',
                inputValidator: (v) => !v ? 'Please enter valid ID' : '',
                confirmButtonText: 'Submit'
            }
        ]).then((result) => {
            if (result.value && result.value.length === 2) {
                this.data.rescheduleLessonSession(this.lesson.course_id, this.lesson._id, this.session._id, {
                    zoomUrl: _.first(result.value),
                    zoomId: _.last(result.value)
                }).subscribe((res) => {
                    this.isLoadingSession = false;

                    if (res) {
                        this.getData(this.lesson.course_id, this.lesson._id, this.session._id);
                    }
                })
            }
        })
    }

    async saveSession() {
        try {
            if (this.form.invalid) {
                throw Error('Form is invalid.');
            }
            const data = this.form.value;

            this.session.zoomUrl = data.zoomUrl;
            this.session.zoomId = data.zoomId;
            this.session.zoomPassword = data.zoomPassword;
            this.session.state = +data.status;
            this.session.notes = data.notes;

            const startTime = moment(data.date).set({
                h: parseInt(_.first(_.split(data.startTime, ':'))),
                m: parseInt(_.last(_.split(data.startTime, ':')))
            });

            this.session.startTime = startTime.toISOString();
            this.session.endTime = startTime.add(this.lesson.session_duration, 'm').toISOString();
            this.session.subject = data.subject;
            this.session.subject_ch = data.subject_ch;

            this.data.updateLessonSession(this.lesson.course_id, this.lesson._id, this.session._id, this.session).subscribe(() => {
                this.getData(this.lesson.course_id, this.lesson._id, this.session._id);
            })

        } catch ({message}) {
            this.toastr.error(message);
        }
    }

    async deleteSession() {
        if (this.session.state === State.Active) {
            swal.fire('Oops', 'You can only delete cancelled and completed sessions.', 'error');
            return;
        }

        this.data.deleteLessonSession(this.lesson.course_id, this.lesson._id, this.session._id).subscribe(() => {
            this.router.navigate(['/admin/courses', this.lesson.course_id, 'lesson', this.lesson._id]);
        })
    }

    async getEnrollments() {
        this.data.getEnrollments({
            course: this.lesson.course_id,
            teacher: this.lesson.teacher_id,
            lesson: this.lesson._id,
            session: this.session._id
        }).subscribe((res) => {
            if (res && res.data) {
                this.enrollments = res.data;
            }
        })
    }

    async addMaterial() {
        const {data} = await this.data.getMaterials().toPromise();

        const ref = this.dialog.open(PickMaterialComponent, {
            width: '600px',
            data: {
                data,
                picked: _.map(this.materials, v => v._id)
            }
        })

        ref.beforeClose().subscribe(async (materials) => {
            try {
                if (materials) {
                    await this.data.updateLessonSession(this.lesson.course_id, this.lesson._id, this.session._id, {materials}).toPromise();
                    this.getMaterials();
                }
            } catch ({message}) {
                this.toastr.error(message);
            }
        })
    }

    getMaterials() {
        this.data.getLessonSessionMaterials(this.lesson.course_id, this.lesson._id, this.session._id).subscribe((res) => {
            if (res && res.data) {
                this.materials = res.data;
            }
        })
    }

    getDrawings() {
        this.data.getDrawings({session_id: this.session._id}).subscribe((res) => {
            if (res && res.data) {
                this.drawings = res.data;
            }
        })
    }

    openDrawing(src: string) {
        this._lightbox.open([{src: src, thumb: src}]);
    }

    async deleteDrawing(id: string) {
        this.data.deleteDrawing(id).subscribe((res) => {
            if (res) {
                this.getDrawings();
            }
        })
    }

    async deleteMaterial(id: string) {
        this.data.deleteMaterial(id).subscribe((res) => {
            if (res && res.data) {
                this.getMaterials();
            }
        })
    }
}

@Component({
    selector: 'app-admin-session-pick-material',
    templateUrl: './pick-material.component.html',
    styles: [`
        .list-group {
            height: 200px;
            overflow: scroll;
        }

        .list-group-item.bg-primary {
            color: white !important;
        }

        .list-group-item:hover {
            cursor: pointer;
        }
    `]
})
export class PickMaterialComponent {
    materials: any[];
    _data: any[];
    picked: any[] = [];

    search = new FormControl();

    constructor(
        @Inject(MAT_DIALOG_DATA) _data,
        private dialog: MatDialogRef<PickMaterialComponent>
    ) {
        const {data, picked} = _data;

        this._data = data;
        this.materials = data;
        this.picked = picked;


        this.search.valueChanges.subscribe((val) => {
            if (!val) {
                this.materials = this._data;
                return;
            }

            const regex = new RegExp(val, 'gi');

            this.materials = _.filter(this._data, v => regex.test(v.description));
        })
    }

    isPicked(id) {
        return _.indexOf(this.picked, id) !== -1;
    }

    pick(id) {
        if (this.isPicked(id)) {
            this.picked = _.filter(this.picked, v => v !== id);
        } else {
            this.picked.push(id)
        }
    }

    submit() {
        this.dialog.close(this.picked);
    }
}
