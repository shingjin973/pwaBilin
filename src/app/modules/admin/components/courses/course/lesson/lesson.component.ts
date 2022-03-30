import {Teacher, User} from './../../../../../../interfaces/user';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {Enrollment} from './../../../../../../interfaces/course';
import {ActivatedRoute, Router} from '@angular/router';
import {Lesson} from 'src/app/interfaces/course';
import {Component, OnInit, ViewChild} from '@angular/core';
import {ToastrService} from 'ngx-toastr';

import * as _ from 'lodash';
import * as moment from 'moment';
import 'moment-timezone';
import {State} from './../../../../../../interfaces/enums';
import {map} from 'rxjs/operators';

import swal from 'sweetalert2';

import * as csv from 'csvtojson';
import {DataService} from 'src/app/services/data.service';

@Component({
    templateUrl: './lesson.component.html',
    styleUrls: ['./lesson.component.scss']
})
export class LessonComponent implements OnInit {
    minDate = moment().add(1, 'd').toDate();

    lesson: Lesson;

    enrollments: Enrollment[];

    editingSession: string;

    form: FormGroup;
    editForm: FormGroup;
    multipleForm: FormGroup;
    isLoading = false;
    isAddingNewSession = false;
    addSingleSession = true;
    isLoadingUpload = false;

    isEditing = false;

    toCreateZoomMeeting = false;

    State = State;

    multipleEntries = [];
    pickedDates = [];

    @ViewChild('picker', {static: false}) picker;

    constructor(
        private router: Router,
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private data: DataService
    ) {
    }
    _range = (max) => Array(max).fill(1).map((x, y) => x + y);
    ngOnInit() {
        this.route.params.subscribe((p) => {
            if (p.courseid && p.lessonid) {
                this.getLessons(p.courseid, p.lessonid);
            }
        });

        const tz = moment.tz.guess(true);
    
    }

    openPicker() {
        if (this.pickedDates.length + this.lesson.sessions.length >= this.lesson.total_sessions) {
            return;
        }

        this.picker.open();
    };

    /**
     * Function that gets data from the db
     * @param courseid course's ID
     * @param lessonid lesson's ID
     */
    async getLessons(courseid: string, lessonid: string) {
        this.data.getLesson(courseid, lessonid).subscribe((res) => {
            this.lesson = null;

            if (res && res.data) {
                this.lesson = res.data;

                if (!this.form) {
                    this.createForm();
                    this.createEditForm();
                    this.createMultipleForm();

                    this.getEnrollments();
                }
            }
        });
    }


    /**
     * Function that checks if field has an error
     * @param field form's field
     */
    hasError(field: string) {
        return this.form.get(field).invalid && this.form.get(field).touched && this.form.get(field).dirty;
    }

    /**
     * Function that allows to create/reset the form.
     */
    createForm() {
        if (this.form) {
            this.form.reset();
        } else {
            this.form = this.fb.group({
                date: new FormControl('', [Validators.required]),
                subject: new FormControl('', [Validators.required]),
                subject_ch: new FormControl('', Validators.required),
                startTime: new FormControl('', [Validators.required]),
                toCreateZoomMeeting: new FormControl(false),
                zoomMeetingHost: new FormControl('teacher'),
                zoomUrl: new FormControl(''),
                zoomId: new FormControl(''),
                zoomPassword:new FormControl('')
            });
        }
    }
    cancelEdit(){
        this.isEditing = false;
        this.createEditForm()
    }

    createMultipleForm() {
        this.multipleForm = this.fb.group({
            date: new FormControl(''),
            dateString: new FormControl(''),
            startTime: new FormControl('', [Validators.required]),
            toCreateZoomMeeting: new FormControl(false),
            zoomMeetingHost: new FormControl('teacher')
        });
    }

    onChangePickedDates(e) {
        if (moment(e.value).isBefore(moment())) {
            return;
        }

        if (_.indexOf(this.pickedDates, e.value.getTime()) === -1) {
            if (this.pickedDates.length + this.lesson.sessions.length < this.lesson.total_sessions) {
                this.pickedDates.push(e.value.getTime());
            }
        } else {
            this.pickedDates = _.filter(Array.prototype.slice.call(this.pickedDates), v => v !== e.value.getTime());
        }

        this.multipleForm.get('dateString').setValue(_.map(this.pickedDates, v => moment(v).format('MM/DD/YYYY')).join(', '));

        this.picker.select(moment().subtract(1, 'd').toDate());

        setTimeout(() => {
            this.openPicker();
        }, 300);
    }

    getPickedDates() {
        return (date: Date) => _.indexOf(this.pickedDates, date.getTime()) === -1 ? 'mat-datepicker-not-picked' : 'mat-datepicker-picked';
    }

    async multipleEntryNext() {
        const data = this.multipleForm.value;

        const time = {
            h: parseInt(_.first(_.split(data.startTime, ':'))),
            m: parseInt(_.last(_.split(data.startTime, ':')))
        };

        this.multipleEntries = _.map(_.split(data.dateString, ','), (v, i) => ({
            startTimeZoom: moment(v).set(time).toDate(),
            startTime: moment(v).set(time).toISOString(),
            endTime: moment(v).set(time).add(this.lesson.session_duration, 'm').toISOString(),
            toCreateZoomMeeting: data.toCreateZoomMeeting,
            zoomMeetingHost: data.zoomMeetingHost,
            zoomUrl: '',
            zoomId: '',
            zoomPassword:'',
            subject: this.lesson.course.default_sessions[this.lesson.sessions.length + i] || '',
            subject_ch: ''
        }));
    }

    async handleMultipleEntryChange(id, field, val) {
        this.multipleEntries = _.map(Array.prototype.slice.call(this.multipleEntries), (v, i) => {
            if (i === id) {
                v[field] = val;
            }

            return v;
        });
    }

    async submitMultipleEntries() {
        try {
            if (!this.multipleEntries.length) {
                throw Error('Please enter data first.');
            }

            const multipleEntries = Array.prototype.slice.call(this.multipleEntries);

            const checkIfTeacherHasZoomId = _.filter(multipleEntries, v => v.toCreateZoomMeeting && v.zoomMeetingHost === 'teacher');

            if (checkIfTeacherHasZoomId.length) {
                if (!(<Teacher>this.lesson.teacher).zoomId) {
                    throw Error('Teacher doesn\'t have zoom ID. Please go to teacher\'s profile to request');
                }
            }

            for (let i = 0; i < multipleEntries.length; i++) {
                const currentEntry = multipleEntries[i];

                if (currentEntry.toCreateZoomMeeting) {
                    let zoomId;
                    if (currentEntry.zoomMeetingHost === 'teacher') {
                        zoomId = (<Teacher>this.lesson.teacher).zoomId;
                    }

                    if (currentEntry.zoomMeetingHost === 'host') {
                        zoomId = 'CrqiQ6bDQLifEjYbnAC5OQ';
                    }

                    if (!zoomId) {
                        throw Error('Something went wrong.');
                    }

                    const tz = moment.tz.guess(true);

                    const {data: meetingData} = await this.data.createMeeting({
                        timezone: tz,
                        start_time_zoom: currentEntry.startTimeZoom,
                        start_time: currentEntry.startTime,
                        userid: zoomId,
                        duration: this.lesson.session_duration,
                        topic: currentEntry.subject
                    }).toPromise();

                    if (!meetingData || !meetingData.id || !meetingData.join_url) {
                        throw Error('Something went wrong.');
                    }

                    multipleEntries[i].zoomUrl = meetingData.join_url;
                    multipleEntries[i].zoomId = meetingData.id;                
                }
            }

            this.data.addLessonSession(this.lesson.course_id, this.lesson._id, multipleEntries).subscribe(() => {
                this.isAddingNewSession = false;
                this.addSingleSession = true;

                this.getLessons(this.lesson.course_id, this.lesson._id);

                this.multipleEntries = [];
            });

        } catch (e) {
            this.toastr.error(e.message);
        }
    }

    async submit() {
        try {
            this.isLoading = true;

            const {value: data} = this.form;

            const startTime = moment(data.date).set({
                h: parseInt(_.first(_.split(data.startTime, ':'))),
                minutes: parseInt(_.last(_.split(data.startTime, ':')))
            });

            data.startTime = startTime.toISOString();
            data.endTime = startTime.clone().add(this.lesson.session_duration, 'm').toISOString();

            const tz = moment.tz.guess(true);

            if (data.toCreateZoomMeeting) {
                let zoomId;
                if (data.zoomMeetingHost === 'teacher') {
                    if (!(<Teacher>this.lesson.teacher).zoomId) {
                        throw Error('Teacher doesn\'t have zoom ID. Please go to teacher\'s profile to request');
                    }

                    zoomId = (<Teacher>this.lesson.teacher).zoomId;
                }

                if (data.zoomMeetingHost === 'host') {
                    zoomId = 'CrqiQ6bDQLifEjYbnAC5OQ';
                }

                if (!zoomId) {
                    throw Error('Something went wrong.');
                }

                const {data: meetingData} = await this.data.createMeeting({
                    timezone: tz,
                    start_time: startTime.toISOString(),
                    userid: zoomId,
                    duration: this.lesson.session_duration,
                    topic: data.subject
                }).toPromise();

                if (!meetingData || !meetingData.id || !meetingData.join_url) {
                    throw Error('Something went wrong.');
                }

                data.zoomUrl = meetingData.join_url;
                data.zoomId = meetingData.id;              
            }

            this.data.addLessonSession(this.lesson.course_id, this.lesson._id, [data]).subscribe(() => {
                this.isAddingNewSession = false;

                this.getLessons(this.lesson.course_id, this.lesson._id);

                setTimeout(() => {
                    this.createForm();
                }, 100);
            });

        } catch (e) {
            this.toastr.error(e.message);
        } finally {
            this.isLoading = false;
        }
    }

    async getEnrollments() {
        this.data.getEnrollments({
            course: this.lesson.course_id,
            lesson: this.lesson._id,
            teacher: this.lesson.teacher_id
        }).subscribe((res) => {
            if (res && res.data) {
                this.enrollments = res.data;
            }
        });
    }

    uploadSessions() {
        try {
            swal.fire({
                title: 'Upload sessions',
                inputPlaceholder: 'Select CSV file',
                inputOptions: {
                    'accept': 'text/csv'
                },
                input: 'file',
                preConfirm: (v) => {
                    if (v.type !== 'text/csv') {
                        return 'Please select valid CSV file.';
                    }

                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            csv().fromString(reader.result.toString()).then((v) => {
                                resolve(v);
                            });
                        };
                        reader.readAsText(v);
                    });
                },
                allowOutsideClick: () => !swal.isLoading(),
                showLoaderOnConfirm: true
            }).then(({value}) => {
                if (value && value.length) {
                    const result = [];

                    for (let line of value) {
                        if (!line.date || !line.time || !line.subject || !line.zoomUrl || !line.zoomId) {                         
                            continue;
                        }

                        const date = moment(line.date);

                        if (!date.isValid()) {                  
                            continue;
                        }

                        if (!/^[0-2][0-9]:[0-5][0-9]$/.test(line.time)) {                        
                            continue;
                        }

                        const startTime = date.set({
                            h: parseInt(_.first(_.split(line.time, ':'))),
                            m: parseInt(_.last(_.split(line.time, ':')))
                        });

                        result.push({
                            startTime: startTime.toISOString(),
                            endTime: startTime.add(this.lesson.session_duration, 'm').toISOString(),
                            subject: line.subject,
                            subject_ch: line.subject_ch,
                            zoomUrl: line.zoomUrl,
                            zoomId: line.zoomId,
                            date: date.toDate(),
                            state: State.Active
                        });
                    }

                    if (result.length) {
                        swal.fire({
                            type: 'info',
                            text: `You have ${result.length} valid sessions. Do you want to upload?`,
                            showCancelButton: true
                        }).then(async ({value}) => {
                            try {
                                this.isLoadingUpload = true;

                                if (value) {
                                    this.data.addLessonSession(this.lesson.course_id, this.lesson._id, result).subscribe(() => {
                                        this.getLessons(this.lesson.course_id, this.lesson._id);
                                    });
                                }
                            } catch ({message}) {
                                this.toastr.error(message);
                            } finally {
                                this.isLoadingUpload = false;
                            }
                        });
                    } else {
                        swal.fire('Oops', 'No valid sessions', 'error');
                    }
                }
            });

        } catch ({message}) {
            this.toastr.error(message);
        }
    }

    createEditForm() {          
        this.editForm = this.fb.group({
            subtitle: new FormControl(this.lesson.subtitle, [Validators.required]),
            subtitle_ch: new FormControl(this.lesson.subtitle_ch || ''),
            state: new FormControl(this.lesson.state, [Validators.required]),
            credits_per_session: new FormControl(this.lesson.credits_per_session, [Validators.required, Validators.pattern(/^(\d{1,})+(.\d{1,2})?$/i)]),
            show_on_front:new FormControl(this.lesson.show_on_front == undefined ? true: this.lesson.show_on_front , [Validators.required]),
            session_duration: new FormControl(this.lesson.session_duration || 60, [Validators.required, Validators.pattern(/^\d{1,}$/i)]),
            total_sessions: new FormControl(this.lesson.total_sessions || '1', [Validators.required, Validators.pattern(/^\d{1,}$/i)]),
            max_students: new FormControl(this.lesson.max_students || '1', [Validators.required, Validators.pattern(/^\d{1,}$/i)]),
            
        });
    }

    async deleteLesson() {
        this.data.deleteLesson(this.lesson.course_id, this.lesson._id).subscribe(() => {
            this.router.navigate(['/admin/courses', this.lesson.course_id]);
        });
    }

    async saveLesson() {
        try {
            if (this.editForm.invalid) {
                throw Error('Form is invalid.');
            }

            const {value} = this.editForm;

            value.credits_per_session = parseInt(value.credits_per_session);
            value.state = parseInt(value.state);       
            value.session_duration = parseInt(value.session_duration);
            value.total_sessions = parseInt(value.total_sessions);
            value.max_students = parseInt(value.max_students); 
            this.data.updateLesson(this.lesson.course_id, this.lesson._id, value).subscribe(() => {
                this.isEditing = false;
                this.getLessons(this.lesson.course_id, this.lesson._id);
            });

        } catch ({message}) {
            this.toastr.error(message);
        }
    }

    editLesson() {
        // this.createEditForm();
        this.isEditing = true;
    }

    setLessonAs() {
        swal.fire({
            title: 'Set class as',
            input: 'select',
            inputOptions: {
                // 'featured': 'Featured class',
                'promotion': 'Promotioned class'
            }
        }).then(async ({value}) => {
            if (value) {
                const newSettings: any = {};

                if (value === 'featured') {
                    newSettings.featured = this.lesson._id;
                } else {
                    let promotions = await this.data.getSettings('configs').pipe(map((res) => res && res.data ? res.data.promotions : [])).toPromise();

                    promotions.push(this.lesson._id);

                    newSettings.promotions = promotions;
                }

                await this.data.updateSettings('configs', newSettings).toPromise();
            }
        });
    }
}
