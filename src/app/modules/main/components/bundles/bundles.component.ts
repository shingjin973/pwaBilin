import {DataService} from 'src/app/services/data.service';
import {BreadCrumb} from './../../../../interfaces/main';
import {ActivatedRoute} from '@angular/router';
import {State, View} from './../../../../interfaces/enums';
import {FormControl} from '@angular/forms';
import {Bundle, Lesson} from './../../../../interfaces/course';
import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import * as _ from 'lodash';
import swal from "sweetalert2";
import {Kid, Student} from "../../../../interfaces/user";
import {AuthService} from "../../../../services/auth.service";
import {ToastrService} from "ngx-toastr";
import {element} from "protractor";
import * as moment from "moment";
import { toTypeScript } from '@angular/compiler';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

declare var $: any;

enum CourseTabs {
    All = 1,
    Chinese = 2,
    English = 3
}

@Component({
    templateUrl: './bundles.component.html',
    styleUrls: ['./bundles.component.scss']
})
export class BundlesComponent implements OnInit {
    coinwallet: string[] = ['wallet1', 'wallet2'];
    selectedwallet = this.coinwallet[0];

    enrollments: any[];
    myEnrollments: any[];

    View = View;
    _bundles: Bundle[];
    bundles: Bundle[];
    single_bundle: Bundle;

    categories: any[];
    courseMainHeight = 0;
    currentPage = 1;
    totalItemsPerPage = 6;

    viewState: View = View.Grid;
    user: Student;
    breadcrumbs: BreadCrumb[] = [{
        link: 'Home',
        url: ['/']
    }, {
        link: 'Courses'
    }];

    searchForm: any;
    CourseTabs = CourseTabs;
    currentTab = CourseTabs.All;
    currentCategory = '';
    search_key = '';
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
        const {queryParams: params} = this.route.snapshot;

        // begin: if url has queryParams, set them to the variables
        this.search_key = params && params.search_key ? params.search_key : '';
        this.searchForm = new FormControl(this.search_key);
        this.currentCategory = params && params.search_category ? params.search_category : '';
        this.currentTab = params && params.search_tab ? params.search_tab : CourseTabs.All;     
        let origindate = new Date()  ;             
        this.today = origindate.getFullYear() +'-'+ ((origindate.getMonth() > 8) ? (origindate.getMonth() + 1) : ('0' + (origindate.getMonth() + 1))) + '-' + ((origindate.getDate() > 9) ? origindate.getDate() : ('0' + origindate.getDate()+1))         
        // end:
        this.getBundles();
        this.getCategories();

        this.searchForm.valueChanges.subscribe(async (search_key) => {
            this.search_key = search_key;
            const queryParams = {
                search_tab: this.currentTab,
                search_category: this.currentCategory,
                search_key: this.search_key
            };
            this.changeUrl(queryParams);
            this.filter();
        });
        this.route.params.subscribe(async (p) => {
            if (p.page) {
                this.currentPage = p.page;
            } 
        });
    }

    async selectCategory(categoryName) {
        this.currentCategory = categoryName;
        const queryParams = {
            search_tab: this.currentTab,
            search_category: this.currentCategory,
            search_key: this.search_key
        };
        this.changeUrl(queryParams);
        this.filter();

    }

    clickTab(tab) {
        this.currentTab = tab;
        const queryParams = {
            search_tab: this.currentTab,
            search_category: this.currentCategory,
            search_key: this.search_key
        };
        this.changeUrl(queryParams);
        this.filter();
    }

    async get_single_bundle(bundle_id: string) {
        this._bundles.forEach((element) => {
            if (element._id == bundle_id) {
                this.single_bundle = element;
            }
        });
    }

    // async get_bundle_enrollments(course_id: string, bundle_id: string) {
    //     this.data.getBundleEnrollments({
    //         course: course_id,
    //         bundle: bundle_id,
    //         teacher: this.single_bundle.teacher_id
    //     }).subscribe((res) => {
    //         if (res && res.data) {
    //             const data = _.filter(res.data, v => v.state !== State.Canceled);
    //             this.enrollments = data;
    //             this.myEnrollments = this.user ? _.map(_.filter(data, (i) => this.user && i.student_family === this.user._id)) : [];
    //         }
    //     });
    // }
    //
    // async enrollBundle(course_id: string, bundle_id: string) {
    //     try {
    //         this.user = await this.auth.getUser() as Student;
    //
    //         // get single bundle
    //         await this.get_single_bundle(bundle_id);
    //
    //         if (!this.user) {
    //             this.router.navigate(['/authentication/signin'], {
    //                 queryParams: {
    //                     redirect_url: this.route.snapshot.url.join('%2F')
    //                 }
    //             });
    //             return;
    //         }
    //
    //         if (this.user.phoneVerified === false) {
    //             swal.fire({
    //                 type: 'error',
    //                 title: 'Oops',
    //                 text: 'Please verify your phone number first.',
    //                 confirmButtonText: 'Verify',
    //                 showCancelButton: true
    //             }).then(({value}) => {
    //                 if (value) {
    //                     this.router.navigate(['/profile'], {queryParams: {verifyMobile: true}});
    //                 }
    //             });
    //
    //             return;
    //         }
    //
    //         if (this.user.children.length === 0) {
    //             swal.fire({
    //                 type: 'error',
    //                 title: 'Oops',
    //                 text: 'Please add your children to participate in our bundles',
    //                 confirmButtonText: 'Ok',
    //                 showCancelButton: true
    //             }).then(({value}) => {
    //                 if (value) {
    //                     this.router.navigate(['/profile'], {queryParams: {verifyMobile: true}});
    //                 }
    //             });
    //             return;
    //         }
    //
    //         if (typeof this.user.balance !== 'number' || this.user.balance < this.single_bundle.tuition) {
    //             swal.fire({
    //                 type: 'info',
    //                 title: 'Oops',
    //                 text: 'You don\'t have enough credits. Do you want to buy more credits?',
    //                 showCancelButton: true,
    //                 confirmButtonText: 'Buy more'
    //             }).then(({value}) => {
    //                 if (value) {
    //                     this.router.navigateByUrl('/profile/balance');
    //                 }
    //             });
    //             return;
    //         }
    //
    //         const inputOptions = {};
    //
    //         // get all bundleEnrollments
    //         // await this.get_bundle_enrollments(course_id, bundle_id);
    //         this.data.getBundleEnrollments({
    //             course: course_id,
    //             bundle: bundle_id,
    //             teacher: this.single_bundle.teacher_id
    //         }).subscribe((res) => {
    //             if (res && res.data) {
    //                 const data = _.filter(res.data, v => v.state !== State.Canceled);
    //                 this.enrollments = data;
    //                 this.myEnrollments = this.user ? _.map(_.filter(data, (i) => this.user && i.student_family === this.user._id)) : [];
    //
    //                 for (let i of this.user.children) {
    //                     if (_.find(this.enrollments, {
    //                         bundle: bundle_id,
    //                         student: i._id
    //                     })) {
    //                         continue;
    //                     }
    //
    //                     Object.defineProperty(inputOptions, i._id, {
    //                         value: `${i.name} - ${i.age}`,
    //                         writable: true,
    //                         enumerable: true
    //                     });
    //                 }
    //
    //                 if (!_.size(inputOptions)) {
    //                     swal.fire({
    //                         type: 'info',
    //                         title: 'Enrolling',
    //                         text: 'All students are currently enrolled!'
    //                     });
    //                     return;
    //                 }
    //
    //                 swal.fire({
    //                     title: 'Bundle Enrolling',
    //                     text: 'Please select children to enroll.',
    //                     input: 'select',
    //                     inputOptions: inputOptions,
    //                     inputPlaceholder: 'Select children',
    //                     showCancelButton: true,
    //                     inputValidator: (value) => {
    //                         return value ? '' : 'You need to select something.';
    //                     }
    //                 }).then(async (res) => {
    //                     if (res.value) {
    //                         const {min_age, max_age} = this.single_bundle.course;
    //                         const {age: student_age} = _.find(this.user.children, {
    //                             _id: res.value
    //                         }) as Kid;
    //
    //                         if (!(student_age >= min_age && student_age <= max_age)) {
    //                             swal.fire('Oops..', `Child's age is not eligible for this course.`, 'error');
    //                             return;
    //                         }
    //
    //                         this.data.addBundleEnrollments({
    //                             student: res.value,
    //                             student_family: this.user._id,
    //                             course: this.single_bundle.course_id,
    //                             bundle: this.single_bundle._id,
    //                             teacher_name: this.single_bundle.teacher.name
    //                         }).subscribe((res) => {
    //                             if (res && res.data && res.status === 200) {
    //                                 this.toastr.success(res.message);
    //                                 this.getBundles();
    //                             } else {
    //                                 this.toastr.error(res.message);
    //
    //                             }
    //                         });
    //                     }
    //                 });
    //             }
    //         });
    //     } catch (e) {
    //         this.toastr.error(e.message);
    //     }
    // }

    getBundles() {
        this.data.getBundles().subscribe((res) => {
            if (res && res.data) {      
                this._bundles = _.filter(res.data, (v) => (v.number_of_bundles * v.max_students_per_session - v.enrollment[0].length > 0)
                && (v.show_on_front== undefined || v.show_on_front == true)
                );
                this.bundles = this._bundles;           
                this.filter();
            }
        });
    }

    filter() {
        if (this.search_key != "") {
            if (this.currentTab == this.CourseTabs.All) {
                this.bundles = _.filter(this._bundles, (i) =>
                    (i.course.topic && String.prototype.search.call(i.course.topic, new RegExp(this.search_key, 'i')) !== -1) ||
                    (i.course.topic_ch && String.prototype.search.call(i.course.topic_ch, new RegExp(this.search_key, 'i')) !== -1));
            }
            else if (this.currentTab == this.CourseTabs.Chinese) {
                var temp_bundles = _.filter(this._bundles, (v) => v.course.language == 'Chinese');
                this.bundles = _.filter(temp_bundles, (i) =>
                    (i.course.topic && String.prototype.search.call(i.course.topic, new RegExp(this.search_key, 'i')) !== -1) ||
                    (i.course.topic_ch && String.prototype.search.call(i.course.topic_ch, new RegExp(this.search_key, 'i')) !== -1));
            }
            else if (this.currentTab == this.CourseTabs.English) {
                var temp_bundles = _.filter(this._bundles, (v) => v.course.language == 'English');
                this.bundles = _.filter(temp_bundles, (i) =>
                    (i.course.topic && String.prototype.search.call(i.course.topic, new RegExp(this.search_key, 'i')) !== -1) ||
                    (i.course.topic_ch && String.prototype.search.call(i.course.topic_ch, new RegExp(this.search_key, 'i')) !== -1));
            }
        } else {
            if (this.currentTab == this.CourseTabs.All) {
                this.bundles = this._bundles;
            }
            else if (this.currentTab == this.CourseTabs.Chinese) {
                this.bundles = _.filter(this._bundles, (v) => v.course.language == 'Chinese');
            }
            else if (this.currentTab == this.CourseTabs.English) {
                this.bundles = _.filter(this._bundles, (v) => v.course.language == 'English');
            }
        }
        // filter by category
        if (this.currentCategory.toLowerCase() == "all") {
            this.bundles = this.bundles;
        } else {
            this.bundles = _.filter(this.bundles, (v) => v.course.category == this.currentCategory);
        }
        
    }


    getCategories() {
        this.data.getCategories().subscribe((res) => {
            if (res && res.data) {
                this.categories = res.data;
                this.categories.map(item => {
                    if (item.name.toLowerCase() == 'all' && this.currentCategory == '') {
                        this.currentCategory = item.name;
                    }
                });
            }
        });
    }

    isValidTime(time) {
        return moment('1970-01-01' + time.replace(/\s/g, '')).isValid(); // remove spaces from time, like "11:30 PM" , time format must be 'T00:00:00.000Z'
    }
    hasNumber(myString) {
        return /\d/.test(myString);
      }

    make_date_string(date_array) { 
        var temp_date=date_array[0].date   
        if(this.hasNumber(temp_date) && temp_date.indexOf('/') != -1){
            temp_date = temp_date.split('/')[2].trim()+'-'+temp_date.split('/')[0].trim()+'-'+temp_date.split('/')[1].trim()
            if(this.isValidTime(date_array[0].time)){                        
               let origintime = new Date(temp_date+date_array[0].time)            
               temp_date = origintime.getFullYear() +'-'+ ((origintime.getMonth() > 8) ? (origintime.getMonth() + 1) : ('0' + (origintime.getMonth() + 1))) + '-' + ((origintime.getDate() > 9) ? origintime.getDate() : ('0' + origintime.getDate()))         
            }
        }
        else{
            temp_date = 'Please contact us to schedule'
        }
        return temp_date
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

    navigate(route) {
        this.router.navigate(route);
    }

    changeUrl(queryParams) {
        this.router.navigate(['/packages/1'],
            {
                queryParams: queryParams,
            });
    }
    paginate(page_index){
        // this.currentPage = page_index;
        const queryParams = {
            search_tab: this.currentTab,
            search_category: this.currentCategory,
            search_key: this.search_key           
        };
        this.router.navigate(['/packages/'+page_index],
        {
            queryParams: queryParams,
        });   
    }
}
