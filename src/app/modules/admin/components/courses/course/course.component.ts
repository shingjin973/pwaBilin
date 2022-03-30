import {DataService} from 'src/app/services/data.service';
import {State} from './../../../../../interfaces/enums';
import {FormGroup, FormBuilder, Validators, FormControl} from '@angular/forms';
import {Component, OnInit, ViewChild} from '@angular/core';
import {ToastrService} from 'ngx-toastr';

import * as _ from 'lodash';
import {Router, ActivatedRoute} from '@angular/router';
import {Bundle, Course, Lesson} from 'src/app/interfaces/course';
import {map, switchMap} from 'rxjs/operators';
import {of, Subject, Observable, merge} from 'rxjs';
import swal from 'sweetalert2';
import * as moment from "moment";

@Component({
    templateUrl: './course.component.html',
    styleUrls: ['./course.component.scss']
})
export class CourseComponent implements OnInit {
    form: FormGroup;
    editForm: FormGroup;
    course: Course;
    lessons: Lesson[];
    bundles: Bundle[];
    bundleform: FormGroup;

    skills$ = this.data.getSettings('configs').pipe(map(res => res && res.data ? res.data.skills : []));
    admin_course_categories: any[];

    State = State;

    loading = {
        lessonSubmit: false,
        lessonDelete: false,
        bundleSubmit: false
    };

    teacherForm = new FormControl('', [Validators.required]);

    teacherSearch = new Subject<string>();
    teachers$: Observable<any>;
    isAddingLesson = false;
    isEditing = false;

    isAddingBundle = false;

    pickedDates = [];
    minDate = moment().add(1, 'd').toDate();
    @ViewChild('datepicker', {static: false}) datepicker;
    @ViewChild('timepicker', {static: false}) timepicker;

    constructor(
        private fb: FormBuilder,
        private toastr: ToastrService,
        private router: Router,
        private route: ActivatedRoute,
        private data: DataService
    ) {
    }

    _range = (max) => Array(max).fill(1).map((x, y) => x + y);


    ngOnInit() {
        this.route.params.subscribe((p) => {
            if (p && p.courseid) {
                this.getCourse(p.courseid);
            }
        });

        this.teachers$ = this.teacherSearch.pipe(
            switchMap((q) => this.data.getTeachers({q}).pipe(map((res: any) => res && res.data ? res.data : [])))
        );

        this.teacherForm.valueChanges.subscribe(v => !!v ? this.teacherSearch.next(v) : undefined);

        this.data.getCategories().subscribe((res) => {
            if (res && res.data) {
                this.admin_course_categories = res.data;
            }
        });
    }

    getCourse(id) {
        this.data.getCourse(id).subscribe((res) => {
            if (res && res.data) {
                this.course = res.data;

                this.getLessons(id);
                this.getBundles(id);

            }
        });
    }

    getLessons(id) {
        this.data.getLessons(id).subscribe((data) => {
            console.log(data)
            this.lessons = data;

            this.isAddingLesson = false;
            this.createForm();
            this.createEditCourseForm();
        });
    }

    getBundles(id) {
        this.data.getBundles(id).subscribe((data) => {
            this.bundles = data;
            this.isAddingBundle = false;
            this.createBundleForm();
        });
    }

    hasError(field) {
        return this.form.get(field).invalid && this.form.get(field).touched && this.form.get(field).dirty;
    }

    hasBundleFormError(field) {
        return this.bundleform.get(field).invalid && this.bundleform.get(field).touched && this.bundleform.get(field).dirty;
    }

    createForm() {
        if (this.form) {
            this.form.get('subtitle').markAsUntouched();
            this.form.get('subtitle').setValue('');
            this.form.get('subtitle_ch').markAsUntouched();
            this.form.get('subtitle_ch').setValue('');
            this.form.get('credits_per_session').setValue(''); 
            this.form.get('session_duration').setValue('');     
            this.form.get('total_sessions').setValue(''); 
            this.form.get('max_students').setValue(''); 
        } else {
            this.form = this.fb.group({
                teacher_id: new FormControl('', [Validators.required]),
                credits_per_session: new FormControl('', [Validators.required]),  
                subtitle: new FormControl('', [Validators.required, Validators.maxLength(30)]),
                subtitle_ch: new FormControl(''),
                show_on_front:new FormControl(true),
                session_duration: new FormControl('', [Validators.required, Validators.pattern(/^\d{1,}$/i)]),
                total_sessions: new FormControl('', [Validators.required, Validators.pattern(/^\d{1,}$/i)]),
                max_students: new FormControl('', [Validators.required, Validators.pattern(/^\d{1,}$/i)]),
            });
        }
    }

    createBundleForm() {
        this.bundleform = this.fb.group({
            teacher_id: new FormControl('', [Validators.required]),
            bundle_title: new FormControl('', [Validators.required, Validators.maxLength(50)]),
            bundle_title_ch: new FormControl(''),
            number_of_sessions: new FormControl('', [Validators.required, Validators.pattern(/^\d{1,2}$/i)]),
            session_length: new FormControl('', [Validators.required, Validators.pattern(/^\d{1,}$/i)]),
            min_students_per_session: new FormControl('', [Validators.required, Validators.pattern(/^\d{1,2}$/i)]),
            max_students_per_session: new FormControl('', [Validators.required, Validators.pattern(/^\d{1,2}$/i)]),
            tuition: new FormControl('', [Validators.required, Validators.pattern(/^(\d{1,})+(.\d{1,2})?$/i)]),
            dates: new FormControl(''),
            dates_string: new FormControl(''),
            start_time: new FormControl(''),
            start_time_string: new FormControl(''),
            number_of_bundles: new FormControl('', [Validators.required, Validators.pattern(/^\d{1,5}$/i)]),
            cancel_policy: new FormControl('', [Validators.required])
        });
        this.onChangePickedTime();

    }

    async submit() {
        try {
            swal.fire({
                title: 'Are you sure to create?',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            }).then((result) => {
                if (result.value) {
                    if (this.form.invalid) {
                        throw Error('Form is invalid.');
                    }
                    const {value} = this.form;                 
                    value.credits_per_session = parseInt(value.credits_per_session);    
                    value.session_duration = parseInt(value.session_duration);                  
                    value.total_sessions = parseInt(value.total_sessions);   
                    value.max_students = parseInt(value.max_students);                    
                    this.data.addLesson(this.course._id, value).subscribe((data) => {
                        if (data) {
                            this.getLessons(this.course._id);
                            this.loading.lessonSubmit = false;
                        }
                    });
                }
            });

        } catch (e) {
            this.toastr.error(e.message);
        } finally {
            this.loading.lessonSubmit = false;
        }
    }

    async submitBundle() {
        try {
            swal.fire({
                title: 'Are you sure to create?',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            }).then((result) => {
                if (result.value) {
                    if (this.bundleform.invalid) {
                        throw Error('Form is invalid.');
                    }
                    this.loading.bundleSubmit = true;
                    var new_bundle_data = this.bundleform.value;

                    if (new_bundle_data.start_time_string != '' && moment('1970-01-01' + " " + new_bundle_data.start_time_string).isValid()) {
                        const current_date_time = moment("1970-01-01" + " " + new_bundle_data.start_time_string);
                        new_bundle_data.start_time_string = current_date_time.toISOString();
                    }                  
                    this.data.addBundle(this.course._id, new_bundle_data).subscribe((data) => {
                        if (data) {
                            this.getBundles(this.course._id);
                            this.loading.bundleSubmit = false;
                        }
                    });
                }
            });

        } catch (e) {
            this.toastr.error(e.message);
        } finally {
            this.loading.bundleSubmit = false;
        }
    }

    deleteLesson(id) {
        swal.fire({
            title: 'Are you sure to delete?',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.value) {
                this.data.deleteLesson(this.course._id, id).subscribe(() => {
                    this.getLessons(this.course._id);
                });
            }
        });
    }

    deleteBundle(id) {
        swal.fire({
            title: 'Are you sure to delete?',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.value) {
                this.data.deleteBundle(this.course._id, id).subscribe(() => {
                    this.getBundles(this.course._id);
                });
            }
        });
    }

    createEditCourseForm() {
        this.editForm = this.fb.group({
            thumbnail: new FormControl(this.course.thumbnail),
            topic: new FormControl(this.course.topic, [Validators.required]),
            topic_ch: new FormControl(this.course.topic_ch),
            material: new FormControl(this.course.material ? this.course.material : ''),
            category: new FormControl(this.course.category, [Validators.required]),
            default_sessions: new FormControl(this.course.default_sessions),
            description: new FormControl(this.course.description, [Validators.required]),
            description_ch: new FormControl(this.course.description_ch),
            min_age: new FormControl(this.course.min_age, [Validators.required, Validators.pattern(/^\d{1,2}$/i)]),
            max_age: new FormControl(this.course.max_age, [Validators.required, Validators.pattern(/^\d{1,2}$/i)]),
            language: new FormControl(this.course.language, [Validators.required]),
            language_skill: new FormControl(this.course.language_skill, [Validators.required]),
            skill: new FormControl(this.course.skill, [Validators.required]),
            skill_level: new FormControl(this.course.skill_level, [Validators.required]),          
            provider: new FormControl(this.course.provider, [Validators.required])
        });
    }

    editCourse() {
        try {
            this.isEditing = true;
            this.createEditCourseForm();

        } catch (e) {
            this.toastr.error(e.message);
        }
    }

    async saveCourse() {
        try {        
            if (this.editForm.invalid) {
                throw Error('Form is invalid.');
            }

            const {value} = this.editForm;

            value.default_sessions = _.split(value.default_sessions, ',').map((v) => v.trim());            
            value.min_age = parseInt(value.min_age);
            value.max_age = parseInt(value.max_age);          
            value.language_skill = parseInt(value.language_skill);
            value.skill_level = parseInt(value.skill_level);          
            this.data.updateCourse(this.course._id, value).subscribe((res) => {
                if (res) {
                    this.isEditing = false;
                    this.getCourse(this.course._id);
                }
            });
        } catch (e) {
            this.toastr.error(e.message);
        }
    }

    async deleteCourse() {
        this.data.deleteCourse(this.course._id).subscribe((res) => {
            if (res) {
                this.router.navigate(['/admin/courses']);
            }
        });
    }

    openDatePicker() {
        this.datepicker.open();
    };

    onChangePickedDates(e) {
        if (moment(e.value).isBefore(moment())) {
            return;
        }
        if (_.indexOf(this.pickedDates, e.value.getTime()) === -1) {
            // if (this.pickedDates.length + this.lesson.sessions.length < this.lesson.course.total_sessions) {
            this.pickedDates.push(e.value.getTime());
            // }
        } else {
            this.pickedDates = _.filter(Array.prototype.slice.call(this.pickedDates), v => v !== e.value.getTime());
        }
        this.bundleform.get('dates_string').setValue(_.map(this.pickedDates, v => moment(v).format('MM/DD/YYYY')).join(', '));
        // this.picker.select(moment().subtract(1, 'd').toDate());

        setTimeout(() => {
            this.openDatePicker();
        }, 300);
    }

    getPickedDates() {
        return (date: Date) => _.indexOf(this.pickedDates, date.getTime()) === -1 ? 'mat-datepicker-not-picked' : 'mat-datepicker-picked';
    }

    onChangePickedTime() {
        this.bundleform.get('start_time').valueChanges.subscribe(val => {
            this.bundleform.get('start_time_string').setValue(val);
        })
    }

    async setCourseToMiniApp() {
        this.data.updateCourseForMiniApp(this.course._id, {is_mini_app: true}).subscribe((res) => {
            if (res) {
                this.getCourse(this.course._id);
            }
        });
    }

    async removeCourseFromMiniApp() {
        this.data.updateCourseForMiniApp(this.course._id, {is_mini_app: false}).subscribe((res) => {
            if (res) {
                this.getCourse(this.course._id);
            }
        });
    }
}
