import {Teacher, User} from './../../../../../../interfaces/user';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {Bundle, Enrollment} from './../../../../../../interfaces/course';
import {ActivatedRoute, Router} from '@angular/router';
import {Lesson} from 'src/app/interfaces/course';
import {Component, OnInit, ViewChild} from '@angular/core';
import {ToastrService} from 'ngx-toastr';

import * as _ from 'lodash';
import * as moment from 'moment';
import 'moment-timezone';
import {State} from './../../../../../../interfaces/enums';
import {map, switchMap} from 'rxjs/operators';

import swal from 'sweetalert2';

import * as csv from 'csvtojson';
import {DataService} from 'src/app/services/data.service';
import {Observable, Subject} from "rxjs";

@Component({
    templateUrl: './bundle.component.html',
    styleUrls: ['./bundle.component.scss']
})
export class BundleComponent implements OnInit {
    minDate = moment().add(1, 'd').toDate();
    bundle: any;
    editForm: FormGroup;
    isLoading = false;
    isEditing = false;
    checked : Boolean;
    showHidden : Boolean;
    disabled = true;

    teacherForm = new FormControl('', [Validators.required]);

    teacherSearch = new Subject<string>();
    teachers: any;

    pickedDates = [];

    bundleEditSubmit = false;
    bundleStartDateString = '';
    bundleStartTimeString = '';
    is_valid_bundleStartTime = false;
    today:any;
    dash_today:any;

    @ViewChild('datepicker', {static: false}) datepicker;
    @ViewChild('timepicker', {static: false}) timepicker;

    constructor(
        private router: Router,
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private data: DataService
    ) {
    }

    ngOnInit() {
        this.route.params.subscribe((p) => {
            if (p.courseid && p.bundleid) {
                this.getBundle(p.courseid, p.bundleid);
            }
        });
        let origindate = new Date()  ;             
        this.today = ((origindate.getDate() > 9) ? origindate.getDate() : ('0' + origindate.getDate()+1)) +'/'+ ((origindate.getMonth() > 8) ? (origindate.getMonth() + 1) : ('0' + (origindate.getMonth() + 1))) + '/' +origindate.getFullYear();
        this.dash_today = origindate.getFullYear()+'-'+ ((origindate.getMonth() > 8) ? (origindate.getMonth() + 1) : ('0' + (origindate.getMonth() + 1))) + '-' + ((origindate.getDate() > 9) ? origindate.getDate() : ('0' + origindate.getDate()+1)) ;
    }


    /**
     * Function that gets bundle from the db
     * @param courseid course's ID
     * @param bundleid bundle's ID
     */
    async getBundle(courseid: string, bundleid: string) {
        this.data.getBundle(courseid, bundleid).subscribe((res) => {
            this.bundle = null;
            if (res && res.data) {              
                this.bundle = res.data;
                this.checked = this.bundle.membership == undefined ? false: this.bundle.membership;
                this.showHidden = this.bundle.show_on_front == undefined ? true: this.bundle.show_on_front;
                // BEGIN: makes Start Date and time of bundle to string
                this.bundleStartDateString = _.map(res.data.date_time, v =>this.make_date_string(v.date,v.time) ).join(',');
                // this.bundleStartDateString = this.make_date_string(res.data.date_time);  
                // start_time is only time ex;(T01:00:20.303Z), so add date and check it valid or not
                if (moment('1970-01-01' + res.data.date_time[0].time.replace(/\s/g, '')).isValid()) {
                    this.is_valid_bundleStartTime = true;
                    this.bundleStartTimeString = this.make_time_string(res.data.date_time) + res.data.date_time[0].time;// date convert to 2021-07-14 style
                } else {
                    this.is_valid_bundleStartTime = false;
                    this.bundleStartTimeString = res.data.date_time[0].time;
                }
                //    END:
            }
        });
    }
    
    make_date_string(package_date, package_time) { 
        var temp_date;
        var result='';
        if(package_date.indexOf('/') != -1){
            package_date = package_date.split('/')[2].trim()+'-'+package_date.split('/')[0].trim()+'-'+package_date.split('/')[1].trim()
            if(this.isValidTimeZone(package_time)){                        
                let origintime = new Date(package_date+package_time)            
                package_date =  ((origintime.getMonth() > 8) ? (origintime.getMonth() + 1) : ('0' + (origintime.getMonth() + 1))) + '/' + ((origintime.getDate() > 9) ? origintime.getDate() : ('0' + origintime.getDate())) +'/'+origintime.getFullYear()      
            }
        }          
        return package_date
    } 
    make_time_string(date_array) { 
        var temp_date=date_array[0].date   
        if(temp_date.indexOf('/') != -1){
            temp_date = temp_date.split('/')[2].trim()+'-'+temp_date.split('/')[0].trim()+'-'+temp_date.split('/')[1].trim()                                
            
        }
        else{
            temp_date = this.dash_today
        }
        return temp_date
    } 


    isValidDate(date) {
        let bits = date.split('/');
        let d = new Date(bits[2], bits[0] - 1, bits[1]);
        return d && (d.getMonth() + 1) == bits[0];
    }

    isValidTime(time) {
        const re = /^\d{1,2}:\d{2} ([AP]M)?$/;
        if (time.match(re)) {
            return true;
        } else {
            return false;
        }
    }
    isValidTimeZone(time) {
        return moment('1970-01-01' + time.replace(/\s/g, '')).isValid();
    }


    /**
     * Function that allows to create edit bundle form
     */
    createEditForm() {
        const bundle_data = this.bundle;          
        this.editForm = this.fb.group({
            teacher_id: new FormControl(bundle_data.teacher._id, [Validators.required]),
            bundle_title: new FormControl(bundle_data.bundle_title, [Validators.required, Validators.maxLength(50)]),
            bundle_title_ch: new FormControl(bundle_data.bundle_title_ch),
            number_of_sessions: new FormControl(bundle_data.number_of_sessions, [Validators.required, Validators.pattern(/^\d{1,2}$/i)]),
            session_length: new FormControl(bundle_data.session_length, [Validators.required, Validators.pattern(/^\d{1,}$/i)]),
            min_students_per_session: new FormControl(bundle_data.min_students_per_session, [Validators.required, Validators.pattern(/^\d{1,2}$/i)]),
            max_students_per_session: new FormControl(bundle_data.max_students_per_session, [Validators.required, Validators.pattern(/^\d{1,2}$/i)]),
            tuition: new FormControl(bundle_data.tuition, [Validators.required, Validators.pattern(/^(\d{1,})+(.\d{1,2})?$/i)]),
            membership:new FormControl(bundle_data.membership == undefined ? false: bundle_data.membership , [Validators.required]),
            dates: new FormControl(''),
            dates_string: new FormControl(this.bundleStartDateString),
            start_time: new FormControl(''),
            start_time_string: new FormControl(moment(this.bundleStartTimeString).isValid() ? moment(this.bundleStartTimeString).format('h:mm A') : this.bundleStartTimeString),
            number_of_bundles: new FormControl(bundle_data.number_of_bundles, [Validators.required, Validators.pattern(/^\d{1,5}$/i)]),
            cancel_policy: new FormControl(bundle_data.cancel_policy, [Validators.required]),
            show_on_front:new FormControl(bundle_data.show_on_front == undefined ? true: bundle_data.show_on_front , [Validators.required]),
            
        });

        this.teachers = this.teacherSearch.pipe(
            switchMap((q) => this.data.getTeachers({q}).pipe(map((res: any) => res && res.data && res.data._id != bundle_data.teacher._id ? res.data : [])))
        );
        this.teacherForm.valueChanges.subscribe(v => !!v ? this.teacherSearch.next(v) : undefined);

        this.onChangePickedTime();
    }

    /**
     * Function that checks if field has an error
     * @param field form's field
     */
    hasBundleFormError(field) {
        return this.editForm.get(field).invalid && this.editForm.get(field).touched && this.editForm.get(field).dirty;
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
        this.editForm.get('dates_string').setValue(_.map(this.pickedDates, v => moment(v).format('MM/DD/YYYY')).join(', '));
        // this.picker.select(moment().subtract(1, 'd').toDate());

        setTimeout(() => {
            this.openDatePicker();
        }, 300);
    }

    getPickedDates() {
        return (date: Date) => _.indexOf(this.pickedDates, date.getTime()) === -1 ? 'mat-datepicker-not-picked' : 'mat-datepicker-picked';
    }

    onChangePickedTime() {
        this.editForm.get('start_time').valueChanges.subscribe(val => {
            this.editForm.get('start_time_string').setValue(val);
        })
    }

    async deleteBundle() {
        swal.fire({
            title: 'Are you sure to delete?',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.value) {
                this.data.deleteBundle(this.bundle.course_id, this.bundle._id).subscribe(() => {
                    this.router.navigate(['/admin/courses', this.bundle.course_id]);
                });
            }
        });
    }

    async setFeaturePackage() {
        await this.data.setFeaturePackage(this.bundle.course_id, this.bundle._id).toPromise();
        this.getBundle(this.bundle.course_id, this.bundle._id);
    }

    async removeFeaturePackage() {
        await this.data.removeFeaturePackage(this.bundle.course_id, this.bundle._id).toPromise();
        this.getBundle(this.bundle.course_id, this.bundle._id);
    }

    async saveBundle() {
        try {
            // if (this.editForm.invalid) {
            //     throw Error('Form is invalid.');
            // }
            // const updated_bundle_data = this.editForm.value;
            // console.log(updated_bundle_data);
            // this.bundleEditSubmit = true;
            // const tz = moment.tz.guess(true);
            // updated_bundle_data.tim_zone = tz;
            // this.data.updateBundle(this.bundle.course_id, this.bundle._id, updated_bundle_data).subscribe(() => {
            //     this.isEditing = false;
            //     this.bundleEditSubmit = false;
            //     this.getBundle(this.bundle.course_id, this.bundle._id);
            // });
            if (this.editForm.invalid) {
                throw Error('Form is invalid.');
            }                
            const updated_bundle_data = this.editForm.value; 
            if (this.isValidTime(updated_bundle_data.start_time_string)) {                                    
                var date_result='' ;
                var time_result='';
                var update_date_array = updated_bundle_data.dates_string.split(',');   
                var count = 0           
                for (var item of update_date_array){                  
                    if(item.indexOf('/') != -1){                       
                        // var convert_date= item.split('/')[2].trim()+'-'+item.split('/')[0].trim()+'-'+item.split('/')[1].trim();
                        count=count+1;
                        if (count==1){
                            time_result = (moment(item + " " + updated_bundle_data.start_time_string)).toISOString()
                        }
                        var convert_date = (moment(item + " " + updated_bundle_data.start_time_string)).toISOString().split('T')[0]  //get date 2021-07-23
                        convert_date = convert_date.split('-')[1].trim()+'/'+convert_date.split('-')[2].trim()+'/'+convert_date.split('-')[0].trim(); //convert date to 07/13/2021
                        date_result = date_result+ convert_date + ','
                    }
                }
                updated_bundle_data.dates_string = date_result
                if(updated_bundle_data.dates_string=='') {
                    const current_date_time = moment(this.today + " " + updated_bundle_data.start_time_string)
                    updated_bundle_data.start_time_string = current_date_time.toISOString(); 
                }
                else{ 
                    updated_bundle_data.start_time_string = time_result;
                }           

            }        
            this.data.updateBundle(this.bundle.course_id, this.bundle._id, updated_bundle_data).subscribe(() => {
                this.isEditing = false;
                this.bundleEditSubmit = false;
                this.getBundle(this.bundle.course_id, this.bundle._id);
            });
        } catch ({message}) {
            this.toastr.error(message);
        }
    }

    editBundle() {
        this.createEditForm();
        this.isEditing = true;
    }
}
