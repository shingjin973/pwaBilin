import {DataService} from 'src/app/services/data.service';
import {ActivatedRoute} from '@angular/router';
import {State, View} from '../../../../../interfaces/enums';
import {Bundle, Lesson} from '../../../../../interfaces/course';
import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import * as _ from 'lodash';
import swal from "sweetalert2";
import {AuthService} from '../../../../../services/auth.service';
import {Student, Kid} from '../../../../../interfaces/user';
import {ToastrService} from "ngx-toastr";
import * as moment from "moment";

declare var $: any;

@Component({
    templateUrl: './bundle.component.html',
    styleUrls: ['./bundle.component.scss']
})
export class BundleComponent implements OnInit {
    State = State;
    isSchoolAdmin: any;
    isTeacher = false;
    isLoadingEnroll = false;
    single_bundle: any;
    enrollments: any[];
    myEnrollments: any[];
    user: Student;
    today:any;

    constructor(
        private data: DataService,
        private route: ActivatedRoute,
        private router: Router,
        private toastr: ToastrService,
        private auth: AuthService
    ) {
    }

    ngOnInit() {
        this.isSchoolAdmin = this.auth.isSchoolAdmin();
        this.route.params.subscribe(async (p) => {
            if (p.courseid && p.bundleid) {
                await this.getData(p.courseid, p.bundleid);
                this.user = await this.auth.getUser() as Student;
                await this.getBundleEnrollments();
            } else {
                this.router.navigate(['/presales']);
            }
        });
        let origindate = new Date()  ;             
        this.today = origindate.getFullYear() +'-'+ ((origindate.getMonth() > 8) ? (origindate.getMonth() + 1) : ('0' + (origindate.getMonth() + 1))) + '-' + ((origindate.getDate() > 9) ? origindate.getDate() : ('0' + origindate.getDate()+1)) 
    }

    async getData(courseid: string, bundleid: string) {
        const res = await this.data.getBundle(courseid, bundleid).toPromise()
        if (res && res.data) {
            this.single_bundle = res.data;
            //for using Angular Datepipe, convert date format from "7/12/2021" to "2021-07-12"        
            for (let i of this.single_bundle.date_time) {           
               i.date = i.date.split('/')[2].trim()+'-'+i.date.split('/')[0].trim()+'-'+i.date.split('/')[1].trim()        
            }            
            this.isTeacher = this.user && this.single_bundle.teacher_id === this.user._id;
        }
    }

    isValidTime(time) {
        return moment('1970-01-01' + time.replace(/\s/g, '')).isValid();
    }
    isValidDate(date) {
        return moment(date + 'T18:00:00.000Z').isValid();
    }

    make_date_string(date_array) {
        return _.map(date_array, v => v.date).join(', ');
    }
    make_time_string(date_array) { 
        var temp_date=date_array[0].date   
        if(temp_date.indexOf('/') != -1){
            temp_date = temp_date.split('/')[2].trim()+'-'+temp_date.split('/')[0].trim()+'-'+temp_date.split('/')[1].trim()                                 
            
        }
        else{
            temp_date = this.today
        }
        return temp_date
    } 

    async getBundleEnrollments() {
        const res = await this.data.getBundleEnrollments({
            course: this.single_bundle.course_id,
            bundle: this.single_bundle._id,
            teacher: this.single_bundle.teacher_id
        }).toPromise()
        if (res && res.data) {
            const data = _.filter(res.data, v => v.state !== State.Canceled);
            this.enrollments = data;
            this.myEnrollments = this.user ? _.map(_.filter(data, (i) => this.user && i.student_family == this.user._id)) : [];
        }
    }

    async enrollBundle(course_id: string, bundle_id: string) {
        try {
            this.user = await this.auth.getUser() as Student;
            if (!this.user) {
                this.router.navigate(['/authentication/signin'], {
                    queryParams: {
                        redirect_url: this.route.snapshot.url.join('%2F')
                    }
                });
                return;
            }

            if (this.user.phoneVerified === false) {
                swal.fire({
                    type: 'error',
                    title: 'Oops',
                    text: 'Please verify your phone number first.',
                    confirmButtonText: 'Verify',
                    showCancelButton: true
                }).then(({value}) => {
                    if (value) {
                        this.router.navigate(['/profile'], {queryParams: {verifyMobile: true}});
                    }
                });

                return;
            }

            if (this.user.children.length === 0) {
                swal.fire({
                    // type: 'error',
                    title: '',
                    text: 'Add a child/participant to jon the class',
                    confirmButtonText: 'Ok',
                    showCancelButton: true
                }).then(({value}) => {
                    if (value) {
                        this.router.navigate(['/profile'], {queryParams: {verifyMobile: true}});
                    }
                });
                return;
            }

            // if (typeof this.user.balance !== 'number' || this.user.balance < this.single_bundle.tuition) {
            //     swal.fire({
            //         type: 'info',
            //         title: 'Oops',
            //         text: 'You don\'t have enough credits. Do you want to buy more credits?',
            //         showCancelButton: true,
            //         confirmButtonText: 'Buy more'
            //     }).then(({value}) => {
            //         if (value) {
            //             this.router.navigateByUrl('/profile/balance');
            //         }
            //     });
            //     return;
            // }

            const inputOptions = {};
            for (let i of this.user.children) {
                if (_.find(this.enrollments, {
                    bundle: bundle_id,
                    student: i._id
                })) {
                    continue;
                }

                Object.defineProperty(inputOptions, i._id, {
                    value: `${i.name} - ${i.age}`,
                    writable: true,
                    enumerable: true
                });
            }
            if (!_.size(inputOptions)) {
                swal.fire({
                    type: 'info',
                    text: 'All students are currently enrolled!'
                });
                return;
            }

            if (this.single_bundle.enrollment[0].length >= this.single_bundle.number_of_bundles * this.single_bundle.max_students_per_session) {
                swal.fire({
                    type: 'warning',
                    text: 'Package has a limit of ' + this.single_bundle.number_of_bundles * this.single_bundle.max_students_per_session + ' students'
                });
                return;
            }

            swal.fire({
                title: 'Package Enrolling',
                text: 'Please select children to enroll.',
                input: 'select',
                inputOptions: inputOptions,
                inputPlaceholder: 'Select children',
                showCancelButton: true,
                inputValidator: (value) => {
                    return value ? '' : 'You need to select something.';
                }
            }).then(async (res) => {
                if (res.value) {
                    const {min_age, max_age} = this.single_bundle.course;
                    const {age: student_age, name: student_name} = _.find(this.user.children, {
                        _id: res.value
                    }) as Kid;

                    if (!(student_age >= min_age && student_age <= max_age)) {
                        swal.fire('Oops..', `Child's age is not eligible for this course.`, 'error');
                        return;
                    }
                    if (localStorage.getItem('checkout_bundles')) {
                        const checkout_bundles = JSON.parse(localStorage.getItem('checkout_bundles'));

                        // if this bundle is not in cart
                        if (!_.find(checkout_bundles, {
                            student: [res.value],
                            student_name: student_name,
                            student_family: this.user._id,
                            course: this.single_bundle.course_id,
                            course_topic: this.single_bundle.course.topic,
                            course_topic_ch: this.single_bundle.course.topic_ch,
                            bundle: this.single_bundle._id,
                            bundle_title: this.single_bundle.bundle_title,
                            bundle_title_ch: this.single_bundle.bundle_title_ch,
                            number_of_sessions: this.single_bundle.number_of_sessions,
                            session_length: this.single_bundle.session_length,
                            tuition: this.single_bundle.tuition,
                            teacher: this.single_bundle.teacher._id,
                            teacher_name: this.single_bundle.teacher.name,
                            membership:this.single_bundle.membership
                        })) {
                            checkout_bundles.push({
                                student: [res.value],
                                student_name: student_name,
                                student_family: this.user._id,
                                course: this.single_bundle.course_id,
                                course_topic: this.single_bundle.course.topic,
                                course_topic_ch: this.single_bundle.course.topic_ch,
                                bundle: this.single_bundle._id,
                                bundle_title: this.single_bundle.bundle_title,
                                bundle_title_ch: this.single_bundle.bundle_title_ch,
                                number_of_sessions: this.single_bundle.number_of_sessions,
                                session_length: this.single_bundle.session_length,
                                tuition: this.single_bundle.tuition,
                                teacher: this.single_bundle.teacher._id,
                                teacher_name: this.single_bundle.teacher.name,
                                membership:this.single_bundle.membership
                            });                   
                            localStorage.setItem("checkout_bundles", JSON.stringify(checkout_bundles));
                            this.toastr.success("Package added to cart");
                            this.router.navigate(['/profile/checkout']);                           
                            
                        }
                        else {
                            this.toastr.error("This Package was already added.");
                        }
                    }
                    else {
                        const checkout_bundles = [];
                        checkout_bundles.push({
                            student: [res.value],
                            student_name: student_name,
                            student_family: this.user._id,
                            course: this.single_bundle.course_id,
                            course_topic: this.single_bundle.course.topic,
                            course_topic_ch: this.single_bundle.course.topic_ch,
                            bundle: this.single_bundle._id,
                            bundle_title: this.single_bundle.bundle_title,
                            bundle_title_ch: this.single_bundle.bundle_title_ch,
                            number_of_sessions: this.single_bundle.number_of_sessions,
                            session_length: this.single_bundle.session_length,
                            tuition: this.single_bundle.tuition,
                            teacher: this.single_bundle.teacher._id,
                            teacher_name: this.single_bundle.teacher.name
                        });
                        localStorage.setItem("checkout_bundles", JSON.stringify(checkout_bundles));
                        this.toastr.success("Package added to cart");
                        this.router.navigate(['/profile/checkout']);   
                    }
                    // this.data.addBundleEnrollments({
                    //     student: res.value,
                    //     student_family: this.user._id,
                    //     course: this.single_bundle.course_id,
                    //     bundle: this.single_bundle._id,
                    //     teacher_name: this.single_bundle.teacher.name
                    // }).subscribe((res) => {
                    //     if (res && res.data && res.status === 200) {
                    //         this.toastr.success(res.message);
                    //         this.getData(this.single_bundle.course_id, this.single_bundle._id);
                    //     } else {
                    //         this.toastr.error(res.message);
                    //     }
                    // });
                }
            });
        } catch (e) {
            this.toastr.error(e.message);
        }
    }

    navigate(route) {
        this.router.navigate(route);
    }
}
