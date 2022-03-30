import {map, tap} from 'rxjs/operators';
import {DataService} from 'src/app/services/data.service';
import {BreadCrumb} from './../../../../interfaces/main';
import {Transaction} from '../../../../interfaces/transactions';
import {UserType, Student, Teacher} from 'src/app/interfaces/user';
import {User} from './../../../../interfaces/user';
import {AuthService} from './../../../../services/auth.service';
import {Lesson, Enrollment, Session, Course, Bundle} from './../../../../interfaces/course';
import {Component, OnInit} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {Router, ActivatedRoute} from '@angular/router';
import {Payment} from 'src/app/interfaces/transactions';
import * as _ from 'lodash';
import {BehaviorSubject} from 'rxjs';
import {State} from 'src/app/interfaces/enums';
import * as moment from 'moment';
import swal from 'sweetalert2';
import * as uuid from 'uuid/v1';
import {environment} from "../../../../../environments/environment";
import QrCodeWithLogo from "qrcode-with-logos";

const getStateNameByType = state => {
    switch (state) {
        case State.Active:
            return 'Active';
        case State.Canceled:
            return 'Canceled';
        case State.Completed:
            return 'Completed';
        default:
            return '';
    }
};

enum Tabs {
    Hidden = 0,
    Orders = 1,
    Enrollments = 2,
    Lessons = 3,
    Transactions = 4,
    UpcomingSessions = 5,
    Homeworks = 6,
    Bundles = 7
}

@Component({
    selector: 'app-info',
    templateUrl: './info.component.html',
    styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit {
    UserType = UserType;
    Tabs = Tabs;
    State = State;

    currentTab: BehaviorSubject<Tabs>;

    enrollments: Enrollment[];
    _enrollments: Enrollment[];

    bundles: Bundle[];
    _bundles: Bundle[];

    lessons: Lesson[];
    transactions: Transaction[];
    upcomingSessions: any[];

    enrollmentTab = 'upcoming';

    payments: Payment[];

    user: User;

    currentLesson: string;
    currentSession: string;

    loadingCompletionSession = false;

    homeworks: any[];
    us_link : string;
    china_link : string;
    showusTooltip = false;
    showchTooltip = false;
    show_refer = 'none';

    breadcrumbs: BreadCrumb[] = [{
        link: 'Home',
        url: ['/']
    }, {
        link: 'My Account',
        url: ['/profile']
    }]; 

    constructor(
        private toastr: ToastrService,
        private auth: AuthService,
        private route: ActivatedRoute,
        private router: Router,
        private data: DataService
    ) {
    }

    async ngOnInit() {      
        this.user = await this.auth.getUser(true);
        this.us_link = "https://bilin.academy/en/authentication/signup?referer=" + this.user._id;
        this.china_link = "https://www.bilinacademy.cn/ch/authentication/signup?referer=" + this.user._id
        await this.getBundles();
        const {queryParams} = this.route.snapshot;

        if (queryParams && queryParams.verifyMobile === 'true') {
            this.router.navigate([], {queryParams: {}});
            this.verifyMobile();
        }

        if ((<Teacher>this.user).school) {
            (<any>this.user).school$ = this.data.getSchool((<Teacher>this.user).school).pipe(map((res: any) => res.name as string));
        }

        this.breadcrumbs.push({
            link: this.user.name
        });

        switch (this.user.type) {
            case UserType.Student: {
                this.currentTab = new BehaviorSubject(Tabs.Enrollments);
                break;
            }
            case UserType.Teacher: {
                this.currentTab = new BehaviorSubject(Tabs.UpcomingSessions);
                break;
            }
            default: {
                this.currentTab = new BehaviorSubject(Tabs.Hidden);
            }
        }

        this.currentTab.subscribe((v: Tabs) => {
            switch (v) {
                case Tabs.Enrollments: {
                    this.getEnrollmentsData();
                    break;
                }
                case Tabs.Lessons: {
                    this.getLessonsData();
                    break;
                }
                case Tabs.Orders: {
                    this.getPaymentsData();
                    break;
                }
                case Tabs.Transactions: {
                    this.getTransactionsData();
                    break;
                }
                case Tabs.UpcomingSessions: {
                    this.getUpcomingsessions();
                    break;
                }
                case Tabs.Homeworks: {
                    this.getHomeworks();
                    break;
                }
                case Tabs.Bundles: {
                    this.getBundles();
                    break;
                }
            }
        });
        let qrcode_us = new QrCodeWithLogo({            
            content: this.us_link ,
            width: 112,          
            image: document.getElementById("us_image") as HTMLImageElement,
            logo: {
              src: "assets/img/logo.png"
            }
          });              
          qrcode_us.toImage();

        let qrcode_cn = new QrCodeWithLogo({            
            content: this.china_link ,
            width: 112,          
            image: document.getElementById("ch_image") as HTMLImageElement,
            logo: {
              src: "assets/img/logo.png"
            }
          });           
          qrcode_cn.toImage();
    }
    delay(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }
    change_show(){
        if (this.show_refer =='block'){
            this.show_refer='none'
        }
        else{
            this.show_refer ='block'
        }    
       
    }
    async copy_us(){
        navigator.clipboard.writeText(this.us_link); 
        this.showusTooltip = true;
        await this.delay(1000);
        this.showusTooltip = false;
    }
    async copy_ch(){
        navigator.clipboard.writeText(this.china_link); 
        this.showchTooltip = true;
        await this.delay(1000);
        this.showchTooltip = false;
    }

    verifyEmail() {
        swal.fire({
            type: 'info',
            title: 'Verify Email',
            html: `Verification link will be sent to <strong>${this.user.email}</strong>`,
            confirmButtonText: 'Send link',
            showLoaderOnConfirm: true,
            allowOutsideClick: () => !swal.isLoading(),
            preConfirm: () => {
                return new Promise(async (resolve) => {
                    let language = environment.locale;
                    const data = await this.data.sendVerifyEmail(language).toPromise();

                    if (!data || data.status !== 'success') {
                        swal.showValidationMessage('Link has not been sent.');
                        return;
                    }

                    resolve(true);
                });
            }
        }).then(({value}) => {
            if (value) {
                swal.fire({
                    type: 'success',
                    title: 'Great!',
                    text: `Verification link has been sent.`,
                });
            }
        });
    }

    async verifyMobile() {
        if (!this.user.phone) {
            swal.fire({
                title: 'Oops',
                text: 'Please enter your phone number first.',
                type: 'error'
            }).then(({value}) => {
                if (value) {
                    this.router.navigate(['./settings']);
                }
            });

            return;
        }
        if (!this.user.phoneVerified) {
            const code = await this.auth.verifyPhone(this.user.phone);

            if (!code) {
                return;
            }

            // if (!await this.data.checkTwilioVerifyPhone(code).toPromise()){
            //     return;
            // }
            if (!await this.data.checkTencentVerifyPhone(code).toPromise()){
                return;
            }
            swal.fire('Great!', 'You have successfully verified your phone number.', 'success');
        }

        this.user = await this.auth.getUser(true);
    }

    async uploadHomework() {
        let courses = _.map(this._enrollments, v => ({
            course_id: (<any>v.course)._id,
            name: `${v.course_name} (${(<any>v.course).auto_id})`
        }));

        swal.mixin({
            confirmButtonText: 'Next &rarr;',
            showCancelButton: true,
            progressSteps: ['1', '2'],
        }).queue([
            {
                title: 'Select a course',
                input: 'select',
                inputOptions: _.mapValues(_.keyBy(courses, 'course_id'), v => v.name),
                inputValidator: (v) => !!v ? '' : 'Please select a course'
            },
            {
                title: 'Select file',
                input: 'file',
                inputAttributes: {
                    'accept': 'application/msword, application/vnd.ms-powerpoint, application/pdf, image/*, application/zip, application/octet-stream, audio/*',
                    'aria-label': 'Upload your file'
                },
                confirmButtonText: 'Submit'
            }
        ]).then(async ({value}) => {
            if (value && value.length === 2) {
                try {
                    const fileData: any = {};

                    const file: File = value[1];

                    fileData.course_id = value[0];

                    if (file.size > 50 * 1000 * 1000) {
                        throw Error('File is too big');
                    }

                    if (!(
                        file.type === 'application/pdf' ||
                        file.type === 'application/msword' ||
                        file.type === 'application/vnd.ms-powerpoint' ||
                        file.type === 'application/zip' ||
                        file.type === 'application/octet-stream' ||
                        /^image\//.test(file.type) ||
                        /^audio\//.test(file.type)
                    )) {
                        throw Error('Invalid file type.');
                    }


                    let key = uuid();
                    key = `${key}.${_.last(_.split(file.name, '.'))}`;

                    const res = await this.data.presignS3File(key, file.type).toPromise();

                    if (!res || !res.AWSurl || !res.AWSurl_ch) {
                        throw Error('Something went wrong.');
                    }

                    await this.data.uploadS3File(res.AWSurl, file).toPromise();
                    await this.data.uploadS3File(res.AWSurl_ch, file).toPromise();

                    fileData.url = key;

                    await this.data.addHomework(fileData).toPromise();

                    this.toastr.success('Homework has been uploaded.');

                } catch (e) {
                    this.toastr.error(e.message);
                }
            }
        });
    }

    async getHomeworks() {
        this.data.getHomeworks().subscribe((res) => {
            if (res && res.data) {
                this.homeworks = _.map(res.data, v => ({
                    ...v,
                    prettyUrl: `...${_.last(_.split(v.url, '/'))}`
                }));
            }
        });
    }

    async getUpcomingsessions() {
        this.data.getLessons('', {teacher_id: this.user._id}).subscribe((res) => {
            if (res && res.data) {
                let sessions = _.filter(_.flattenDeep(_.map(res.data, v => _.map(v.sessions, q => ({
                    ...q,
                    course: v.course,
                    lesson: v._id
                })))), v => v.state === State.Active);
                sessions = _.sortBy(sessions, v => v.startTime);

                this.upcomingSessions = sessions;
      
            }
        });
    }

    async getTransactionsData() {
        this.data.getMyTransactions().subscribe((res) => {
            if (res && res.data) {
                this.transactions = res.data;
            }
        });
    }

    async getLessonsData() {
        this.data.getLessons('', {teacher_id: this.user._id}).subscribe((res) => {
            if (res && res.data) {
                this.lessons = _.map(res.data, v => {
                    v.sessions = _.sortBy(v.sessions, m => m.startTime);
                    return v;
                });
            }
        });
    }

    async editChild(_id) {
        const kid = _.find((<Student>this.user).children, {_id}) as any;

        if (!kid) {
            return;
        }

        swal.mixin({
            input: 'text',
            confirmButtonText: 'Next &rarr;',
            showCancelButton: true,
            progressSteps: ['1', '2']
        }).queue([
            {
                title: 'Child name',
                text: 'Please enter child\'s name',
                inputValue: kid.name,
                inputValidator: v => {
                    if (!v) {
                        return 'Please enter child\'s name';
                    }
                }
            },
            {
                title: 'Child age',
                text: 'Please enter child\'s age',
                inputValue: `${kid.age}`,
                confirmButtonText: 'Submit',
                inputValidator: (v) => {
                    if (!(!Number.isNaN(parseInt(v)) && parseInt(v) >= 1 && parseInt(v) <= 100)) {
                        return 'Please enter correct age';
                    }
                },
                preConfirm: v => parseInt(v)
            }
        ]).then(({value}) => {
            if (value && value.length === 2) {
                const user: Student = this.user;
                const children = _.map(user.children, v => {
                    if (v._id === _id) {
                        v.name = value[0];
                        v.age = value[1];
                    }

                    return v;
                });

                this.data.updateUser({children}).subscribe(({status, data: user}) => {
                    if (status === 200) {
                        this.user = user;
                        this.toastr.success('Child has been successfully added.');
                    }
                });
            }
        });
    }

    async addChild() {
        try {
            swal.mixin({
                input: 'text',
                confirmButtonText: 'Next &rarr;',
                showCancelButton: true,
                progressSteps: ['1', '2']
            }).queue([
                {
                    title: 'Child name',
                    text: 'Please enter child\'s name',
                    inputValidator: v => {
                        if (!v) {
                            return 'Please enter child\'s name';
                        }
                    }
                },
                {
                    title: 'Child age',
                    text: 'Please enter child\'s age',
                    confirmButtonText: 'Submit',
                    inputValidator: (v) => {
                        if (!(!Number.isNaN(parseInt(v)) && parseInt(v) >= 1 && parseInt(v) <= 100)) {
                            return 'Please enter correct age';
                        }
                    },
                    preConfirm: v => parseInt(v)
                }
            ]).then(({value}) => {
                if (value && value.length === 2) {
                    const user: Student = this.user;
                    const children = _.concat(user.children, [{name: value[0], age: value[1]}]);
                    this.data.updateUser({children}).subscribe(({status, data: user}) => {
                        if (status === 200) {
                            if (user.emailVerified == "") {
                                user.emailVerified = true;
                            } else {
                                user.emailVerified = false;
                            }
                            this.user = user;
                            this.toastr.success('Child has been successfully added.');
                        }
                    });
                }
            });

        } catch ({message}) {
            this.toastr.error(message);
        }
    }

    async referFriend() {
        try {
            swal.fire({
                title: "Refer a friend by email",
                input: 'email',
                inputValue: '',
                showCancelButton: true,
                inputPlaceholder: 'Email address here',
                confirmButtonText: 'Send invite',
                inputValidator: (value) => {
                    if (value == '') {
                        return 'Email of person you are referring';
                    } else {
                        if (!/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value)) {
                            return 'Invalid email';
                        }
                    }
                }
            }).then(async ({value}) => {
                if (value) {
                    const user: Student = this.user;
                    const refer_friend = {
                        referer_id: user._id,
                        email: value
                    };
                    this.data.referFriend(refer_friend).subscribe((res) => {
                        if (res && res.status == 'success') {
                            this.toastr.success(res.message);
                        } else if (res && res.status == 'error') {
                            this.toastr.error(res.message);
                        } else {
                            this.toastr.error('Error in sending invitation');
                        }
                    });
                }
            });

        } catch ({message}) {
            this.toastr.error(message);
        }
    }

    async addResume() {
        try {
            swal.fire({
                title: 'Select resume',
                input: 'file',
                inputAttributes: {
                    accept: 'application/pdf,application/msword'
                },
                inputValidator: v => {
                    if (!v) {
                        return 'You need to select a resume file';
                    }
                },
                confirmButtonText: 'Upload',
                showLoaderOnConfirm: true,
                allowOutsideClick: () => !swal.isLoading(),
                preConfirm: (file: File) => {
                    return new Promise(async resolve => {
                        try {
                            let key = uuid();

                            key = `${key}.${_.last(_.split(file.name, '.'))}`;

                            const res = await this.data.presignS3File(key, file.type).toPromise();

                            if (!res || !res.AWSurl || !res.AWSurl_ch) {
                                throw Error('Something went wrong.');
                            }

                            await this.data.uploadS3File(res.AWSurl, file).toPromise();
                            await this.data.uploadS3File(res.AWSurl_ch, file).toPromise();

                            resolve(key);

                        } catch ({message}) {
                            swal.showValidationMessage(message);
                        }
                    });
                }
            }).then(({value}) => {
                if (value) {
                    this.data.uploadResume({resume: value}).subscribe(async res => {
                        if (res) {
                            this.user = await this.auth.getUser(true);
                        }
                    });
                }
            });

        } catch ({message}) {
            this.toastr.error(message);
        }
    }

    async getEnrollmentsData(lessonId?: string, sessionId?: string) {
        try {
            this.enrollments = null;

            if (lessonId && sessionId) {
                const res = await this.data.getEnrollments({lesson: lessonId, session: sessionId}).toPromise();

                if (res && res.data) {
                    this.enrollments = res.data;
                }
                return;
            }

            if (this.user.type === UserType.Student) {
                const res = await this.data.getMyEnrollments().toPromise();

                if (res && res.data) {
                    for (let i = 0; i < res.data.length; i++) {
                        res.data[i].session = _.find((<Lesson>res.data[i].lesson).sessions, {_id: res.data[i].session}) as Session;
                    }

                    this._enrollments = res.data;

                    this.filterStudentEnrollments();
                }
            }
        } catch (e) {
            this.toastr.error(e.message);
        }
    }

    async getBundles() {
        try {
            // this.bundles = null;
            // if (this.user.type === UserType.Student) {
            const res = await this.data.getMyBundles().toPromise();
            if (res && res.data) {
                this._bundles = res.data;
                this.bundles = this._bundles;
            }
            // }
        } catch (e) {
            this.toastr.error(e.message);
        }
    }

    async viewEnrollments({lesson, _id}) {
        if (lesson && _id) {
            const res = await this.data.getEnrollments({lesson: lesson, session: _id}).toPromise();

            if (res && res.data) {
                let html;

                if (res.data.length) {
                    html = _.map(res.data, v => `<div class="d-flex justify-content-between align-items-center h6 w-100 px-5 mt-3"><span>${v.student_family_name} (${v.student_name})</span><span>(${getStateNameByType(v.state)})</span></div>`).join('');
                } else {
                    html = '<div class="my-3">No data</div>';
                }

                swal.fire({
                    title: `Enrollments (${res.data.length})`,
                    html
                });
            }
            return;
        }
    }

    filterStudentEnrollments() {
        switch (this.enrollmentTab) {
            case 'upcoming': {
                this.enrollments = _.filter(this._enrollments, v => v.state === State.Active);
                this.enrollments = _.sortBy(this.enrollments, v => (<Session>v.session).startTime);
                break;
            }
            case 'completed': {
                this.enrollments = _.filter(this._enrollments, v => v.state === State.Completed);
                this.enrollments = _.sortBy(this.enrollments, v => (<Session>v.session).startTime).reverse();
                break;
            }
            case 'past': {
                this.enrollments = _.sortBy(this.enrollments, v => (<Session>v.session).startTime);

                let grouped = _.groupBy(this.enrollments, v => (<Lesson>v.lesson)._id);
                grouped = _.map(grouped, (v, k) => ({
                    _id: k,
                    course: v[0].course,
                    subtitle: (<Lesson>v[0].lesson).subtitle,
                    sessions: v
                })) as any;

                this.enrollments = grouped as any;
                break;
            }
        }
    }

    async getPaymentsData() {
        this.data.getMyPayments().subscribe((res) => {
            if (res && res.data) {
                this.payments = res.data;
            }
        });
    }

    logout() {
        this.auth.logout();
        localStorage.removeItem('checkout_bundles');
        this.router.navigate(['/']);
    }

    activateLesson(lesson: string, session: string) {
        if (this.currentSession === session) {
            this.currentSession = null;
        } else {
            this.currentSession = session;

            this.getEnrollmentsData(lesson, session);
        }
    }

    async checkSessionCompletion(session: Session, lesson: Lesson) {
        try {
            this.loadingCompletionSession = true;

            this.data.checkSessionCompetion({
                meetingId: session.zoomId,
                courseId: lesson.course_id
            }).subscribe((res) => {
                if (res) {
                    this.data.completeLessonSession(lesson.course_id, lesson._id, session._id).subscribe((res) => {
                        if (res) {
                            this.loadingCompletionSession = false;
                            this.currentSession = null;
                            this.currentLesson = null;
                            this.getLessonsData();
                            this.getEnrollmentsData(lesson._id, session._id);
                        }
                    });
                }
            });
        } catch (e) {     
            this.loadingCompletionSession = false;
            this.toastr.error(e.message);
        }
    }

    launchClassroom(provider, url) {
        if (provider === 'classin') {
            swal.fire('Classin Course', 'We use classin app for this class. Contact learn@bilinacademy.com or WeChat: bilinstudio for instruction of how to join the class.', 'info');
            return;
        }

        return window.open(url, '_blank');
    }

    navigate(url, fragment) {
        this.router.navigate([url], {fragment: fragment});
    }
}
