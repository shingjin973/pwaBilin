import {Payment, Transaction} from './../interfaces/transactions';
import {Course, Lesson, Session} from 'src/app/interfaces/course';
import {HttpClient, HttpRequest, HttpHeaders, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {catchError, tap} from 'rxjs/operators';
import {of} from 'rxjs';
import {ToastrService} from 'ngx-toastr';
import {HomepageSettings} from '../interfaces/settings';
import * as _ from 'lodash';
import {Student} from '../interfaces/user';

export enum HttpMethod {
    GET = 1,
    POST = 2,
    PUT = 3,
    DELETE = 4
}

interface HttpOptions {
    orderBy?: string;
}

export interface HttpResponse {
    status: number;
    message: string;
    data: any;
}

@Injectable({
    providedIn: 'root'
})

export class DataService {
    public baseHref: string;
    private token: string;
    private privateToken: string;

    constructor(
        private http: HttpClient,
        private toastr: ToastrService
    ) {
        if (location.hostname === 'localhost') {
            this.baseHref = 'http://localhost:4000';
        } else {
            if (_.startsWith(location.hostname, 'www.')) {
                if (location.protocol === 'https:') {
                    this.baseHref = `https://api.${String.prototype.replace.apply(location.hostname, ['www.', ''])}`;
                } else {
                    this.baseHref = `http://api.${String.prototype.replace.apply(location.hostname, ['www.', ''])}`;
                }
            } else {
                if (location.protocol === 'https:') {
                    this.baseHref = `https://api.${location.hostname}`;
                } else {
                    this.baseHref = `http://api.${location.hostname}`;

                }
            }
        }
    }

    setToken(token, privateToken = false) {
        if (!privateToken) {
            localStorage.setItem('token', token);
            this.token = token;
        } else {
            this.privateToken = token;
        }
    }

    request(method: HttpMethod, url: string, body: any = null, options: any = {}) {
        let headers = new HttpHeaders();

        headers = headers.append('Content-Type', 'application/json');

        this.token = this.token || localStorage.getItem('token');

        if (this.token) {
            headers = headers.append('Authorization', `Bearer ${this.token}`);
        } else if (this.privateToken && ['/auth/update', '/auth/verify-email', '/auth/twilio-verify-phone-check'].includes(url)) {
            headers = headers.append('Authorization', `Bearer ${this.privateToken}`);
        }


        url = this.baseHref + url;

        let params = new HttpParams();

        for (const key in options) {
            params = params.append(key, options[key]);
        }

        switch (method) {
            case HttpMethod.GET: {
                return this.http.get(url, {
                    headers,
                    params
                }).pipe(
                    tap((res: HttpResponse) => {
                        if (res && res.status === 200) {
                            if (res.message) {
                                this.toastr.success(res.message);
                            }
                        }
                    }),
                    catchError(e => {
                        this.toastr.error(e.error.message || 'Oops.. Something went wrong.');

                        return of(null);
                    })
                );
            }

            case HttpMethod.POST: {
                return this.http.post(url, body, {
                    headers,
                    params
                }).pipe(
                    tap((res: HttpResponse) => {
                        if (res && res.status === 200) {
                            if (res.message) {
                                this.toastr.success(res.message);
                            }
                        }
                    }),
                    catchError((e) => {
                        this.toastr.error(e.error.message || 'Oops.. Something went wrong.');

                        return of(null);
                    })
                );
            }

            case HttpMethod.PUT: {
                return this.http.put(url, body, {
                    headers,
                    params
                }).pipe(
                    tap((res: HttpResponse) => {
                        if (res && res.status === 200) {
                            if (res.message) {
                                this.toastr.success(res.message);
                            }
                        }
                    }),
                    catchError((e) => {
                        this.toastr.error(e.error.message || 'Oops.. Something went wrong.');

                        return of(null);
                    })
                );
            }

            case HttpMethod.DELETE: {
                return this.http.delete(url, {
                    headers,
                    params
                }).pipe(
                    tap((res: HttpResponse) => {
                        if (res && res.status === 200) {
                            if (res.message) {
                                this.toastr.success(res.message);
                            }
                        }
                    }),
                    catchError((e) => {
                        this.toastr.error(e.error.message || 'Oops.. Something went wrong.');

                        return of(null);
                    })
                );
            }
        }
    }

    getCourses(options: HttpOptions = {}) {
        return this.request(HttpMethod.GET, '/courses', null, options);
    }
    getCommissions(id){
        return this.request(HttpMethod.GET, '/users/getCommissions?id='+id);
    }
    addCommission(data){
        return this.request(HttpMethod.POST, '/users/addCommission',data);
    }
    deleteCommision(id){
        return this.request(HttpMethod.DELETE, `/users/deleteCommision/${id}`);
    }
    getMypromoterUsers(promoterID){
        return this.request(HttpMethod.GET, '/my/getMypromoterUsers?promoter_id='+promoterID);
    }
    getPaidCommission(userId){
        return this.request(HttpMethod.GET, '/my/getPaidCommission?userId='+userId);
    }

    getTotalNumberOfClasses(options: HttpOptions = {}) {
        return this.request(HttpMethod.GET, '/courses/totalnumber', null, options);
    }

    getCoursesByPaginate(options: HttpOptions = {}, first_load, page: string, search_key) {
        if (search_key.field === '' && search_key.value === '') {
            return this.request(HttpMethod.GET, '/courses/paginate-courses?page=' + page + '&first_load=' + first_load, null, options);
        } else {
            return this.request(HttpMethod.GET, '/courses/paginate-courses?page=' + page + '&first_load=' + first_load + '&field=' + search_key.field + '&value=' + search_key.value, null, options);
        }
    }


    getWechatCoursesByPaginate(options: HttpOptions = {}, first_load, page: string, search_key) {
        if (search_key.field === '' && search_key.value === '') {
            return this.request(HttpMethod.GET, '/courses/paginate-wechat-courses?page=' + page + '&first_load=' + first_load, null, options);
        } else {
            return this.request(HttpMethod.GET, '/courses/paginate-wechat-courses?page=' + page + '&first_load=' + first_load + '&field=' + search_key.field + '&value=' + search_key.value, null, options);
        }
    }

    getCourse(course_id: string) {
        return this.request(HttpMethod.GET, `/courses/${course_id}`);
    }

    addCourse(data: Course) {
        return this.request(HttpMethod.POST, '/courses', data);
    }

    updateCourse(course_id: string, data: Course) {
        return this.request(HttpMethod.PUT, `/courses/${course_id}`, data);
    }
    updateCoursePromoterPicture(course_id: string, data) {
        return this.request(HttpMethod.PUT, `/courses/promoter/${course_id}`, data);
    }

    updateCourseForMiniApp(course_id: string, data) {
        return this.request(HttpMethod.PUT, `/courses/${course_id}/mini_app`, data);
    }

    deleteCourse(course_id: string) {
        return this.request(HttpMethod.DELETE, `/courses/${course_id}`);
    }

    getAllPromotions() {
        return this.request(HttpMethod.GET, `/courses/promotions`);
    }

    getFeatured() {
        return this.request(HttpMethod.GET, `/courses/featured`);
    }

    getLessons(course_id: string = '', params = {}) {
        return this.request(HttpMethod.GET, `/courses/${course_id ? `${course_id}/` : ''}lessons`, null, params);
    }

    getBundles(course_id: string = '', params = {}) {
        return this.request(HttpMethod.GET, `/courses/${course_id ? `${course_id}/` : ''}bundles`, null, params);
    }

    getFeatureBundles(course_id: string = '', params = {}) {
        return this.request(HttpMethod.GET, `/courses/featureBundles`, null, params);
    }

    getBundlesByPaginate(first_load, page: string, search_key, params: any = {}) {
        if (search_key.field === '' && search_key.value === '') {
            return this.request(HttpMethod.GET, '/courses/paginate-bundles?page=' + page + '&first_load=' + first_load, null, params);
        } else {
            return this.request(HttpMethod.GET, '/courses/paginate-bundles?page=' + page + '&first_load=' + first_load + '&field=' + search_key.field + '&value=' + search_key.value, null, params);
        }
    }

    getFeaturedBundlesByPaginate(first_load, page: string, search_key, params: any = {}) {
        if (search_key.field === '' && search_key.value === '') {
            return this.request(HttpMethod.GET, '/courses/paginate-featured-bundles?page=' + page + '&first_load=' + first_load, null, params);
        } else {
            return this.request(HttpMethod.GET, '/courses/paginate-featured-bundles?page=' + page + '&first_load=' + first_load + '&field=' + search_key.field + '&value=' + search_key.value, null, params);
        }
    }

    getCategories() {
        return this.request(HttpMethod.GET, `/courses/categories`);
    }

    getLesson(course_id: string, lesson_id: string) {
        return this.request(HttpMethod.GET, `/courses/${course_id}/lessons/${lesson_id}`);
    }

    getBundle(course_id: string, bundle_id: string) {
        return this.request(HttpMethod.GET, `/courses/${course_id}/bundles/${bundle_id}`);
    }

    addLesson(course_id: string, data: Lesson) {
        return this.request(HttpMethod.POST, `/courses/${course_id}/lessons`, data);
    }

    addBundle(course_id: string, data: Lesson) {
        return this.request(HttpMethod.POST, `/courses/${course_id}/bundles`, data);
    }

    updateLesson(course_id: string, lesson_id: string, data: Lesson) {
        return this.request(HttpMethod.PUT, `/courses/${course_id}/lessons/${lesson_id}`, data);
    }

    updateBundle(course_id: string, bundle_id: string, data: Lesson) {
        return this.request(HttpMethod.PUT, `/courses/${course_id}/bundles/${bundle_id}`, data);
    }

    deleteLesson(course_id: string, lesson_id: string) {
        return this.request(HttpMethod.DELETE, `/courses/${course_id}/lessons/${lesson_id}`);
    }

    deleteBundle(course_id: string, bundle_id: string) {
        return this.request(HttpMethod.DELETE, `/courses/${course_id}/bundles/${bundle_id}`);
    }

    setFeaturePackage(course_id: string, package_id: string) {
        return this.request(HttpMethod.PUT, `/courses/${course_id}/bundles/${package_id}/feature`);
    }

    removeFeaturePackage(course_id: string, package_id: string) {
        return this.request(HttpMethod.PUT, `/courses/${course_id}/bundles/${package_id}/removefeature`);
    }

    addLessonSession(course_id: string, lesson_id: string, data: Session[]) {
        return this.request(HttpMethod.POST, `/courses/${course_id}/lessons/${lesson_id}/sessions`, {sessions: data});
    }

    updateLessonSession(course_id: string, lesson_id: string, session_id: string, data: Session) {
        return this.request(HttpMethod.PUT, `/courses/${course_id}/lessons/${lesson_id}/sessions/${session_id}`, data);
    }

    deleteLessonSession(course_id: string, lesson_id: string, session_id: string) {
        return this.request(HttpMethod.DELETE, `/courses/${course_id}/lessons/${lesson_id}/sessions/${session_id}`);
    }

    getLessonSessionMaterials(course_id: string, lesson_id: string, session_id: string) {
        return this.request(HttpMethod.GET, `/courses/${course_id}/lessons/${lesson_id}/sessions/${session_id}/materials`);
    }

    getAllSessions() {
        return this.request(HttpMethod.GET, '/courses/sessions');
    }

    getAllSessionsByPaginate(first_load, page: number, state: number) {
        return this.request(HttpMethod.GET, '/courses/paginate-sessions?page=' + page + '&state=' + state + '&first_load=' + first_load);

    }

    getEnrollments(params: any = {}) {
        return this.request(HttpMethod.GET, `/enrollments`, null, params);
    }

    getBundleEnrollments(params: any = {}) {
        return this.request(HttpMethod.GET, `/enrollments/bundles`, null, params);
    }

    getEnrollmentsByPaginate(first_load, page: string, search_key) {
        if (search_key.field === '' && search_key.value === '') {
            return this.request(HttpMethod.GET, '/enrollments/paginate-enrollments?page=' + page + '&first_load=' + first_load);
        } else {
            return this.request(HttpMethod.GET, '/enrollments/paginate-enrollments?page=' + page + '&first_load=' + first_load + '&field=' + search_key.field + '&value=' + search_key.value);
        }
    }

    getBundleEnrollmentsByPaginate(bundleid, first_load, page: string, search_key, params: any = {}) {
        if (search_key.field === '' && search_key.value === '') {
            return this.request(HttpMethod.GET, '/enrollments/paginate-bundle-enrollments?page=' + page + '&first_load=' + first_load + '&bundle=' + bundleid, null, params);
        } else {
            return this.request(HttpMethod.GET, '/enrollments/paginate-bundle-enrollments?page=' + page + '&first_load=' + first_load + '&bundle=' + bundleid + '&field=' + search_key.field + '&value=' + search_key.value, null, params);
        }
    }  
    getAllBundleEnrollmentsByPaginate(first_load, page: string, search_key, params: any = {}) {
        if (search_key.field === '' && search_key.value === '') {
            return this.request(HttpMethod.GET, '/enrollments/paginate-bundle-enrollments?page=' + page + '&first_load=' + first_load , null, params);
        } else {
            return this.request(HttpMethod.GET, '/enrollments/paginate-bundle-enrollments?page=' + page + '&first_load=' + first_load + '&field=' + search_key.field + '&value=' + search_key.value, null, params);
        }
    }  

    getMyEnrollments() {
        return this.request(HttpMethod.GET, `/my/enrollments`);
    }

    getMyBundles() {
        return this.request(HttpMethod.GET, `/my/bundles`);
    }

    addEnrollments(data: any) {
        return this.request(HttpMethod.POST, `/enrollments`, data);
    }

    addBundleEnrollments(data: any) {
        return this.request(HttpMethod.POST, `/enrollments/bundle`, data);
    }

    updateEnrollment(id: string, data: any) {
        return this.request(HttpMethod.PUT, `/enrollments/${id}`, data);
    }

    cancelEnrollments(data: any) {
        return this.request(HttpMethod.POST, `/enrollments/cancel`, data);
    }

    updateBundleEnrollment(id: string, data: any) {
        return this.request(HttpMethod.PUT, `/enrollments/bundle/${id}`, data);
    }

    deleteEnrollment(id: string) {
        return this.request(HttpMethod.DELETE, `/enrollments/${id}`);
    }

    deleteBundleEnrollment(id: string) {
        return this.request(HttpMethod.DELETE, `/enrollments/bundle/${id}`);
    }

    updateUser(data) {
        return this.request(HttpMethod.PUT, `/auth/update`, data);
    }

    getUsers(params = {}) {
        return this.request(HttpMethod.GET, `/users`, null, params);
    }

    getBalanceUsersByPaginate(first_load, page, params = {}) {
        return this.request(HttpMethod.GET, '/users/paginate-balanceusers?page=' + page + '&first_load=' + first_load, null, params);

    }

    getAdminUsersByPaginate(first_load, page) {
        return this.request(HttpMethod.GET, '/users/paginate-adminusers?page=' + page + '&first_load=' + first_load);
    }

    getFeatureTeachersByPaginate(first_load, page) {
        return this.request(HttpMethod.GET, '/users/paginate-featureteachers?page=' + page + '&first_load=' + first_load);
    }

    getUsersByPaginate(first_load, page: string, search_key, school = '',userType:string) {
        if (search_key.field === '' && search_key.value === '') {
            return this.request(HttpMethod.GET, '/users/paginate-users?page=' + page + '&first_load=' + first_load + '&user_type=' + userType + '&school=' + school);
        } else {
            return this.request(HttpMethod.GET, '/users/paginate-users?page=' + page + '&first_load=' + first_load + '&user_type=' + userType+'&school=' + school + '&field=' + search_key.field + '&value=' + search_key.value);
        }
    }

    getStudentsByChildName(params = {}) {
        return this.request(HttpMethod.GET, `/users/children`, null, params);
    }

    getUser(id: string) {
        return this.request(HttpMethod.GET, `/users/${id}`);
    }

    deleteUser(id: string) {
        return this.request(HttpMethod.DELETE, `/users/${id}`);
    }

    addStudent(student: Student) {
        return this.request(HttpMethod.POST, `/users/students`, student);
    }

    getTeachers(params = {}) {
        return this.request(HttpMethod.GET, `/users/teachers`, null, params);
    }

    addTeacher(teacher: any) {
        return this.request(HttpMethod.POST, `/users/teachers`, teacher);
    }

    approveTeacher(teacher_id: string) {
        return this.request(HttpMethod.PUT, `/users/teachers/${teacher_id}/approve`);
    }

    retireTeacher(teacher_id: string) {
        return this.request(HttpMethod.PUT, `/users/teachers/${teacher_id}/retireTeacher`);
    }

    removeRetireTeacher(teacher_id: string) {
        return this.request(HttpMethod.PUT, `/users/teachers/${teacher_id}/removeRetireTeacher`);
    }

    setFeatureTeacher(teacher_id: string) {
        return this.request(HttpMethod.PUT, `/users/teachers/${teacher_id}/featureteacher`);
    }

    removeFeatureTeacher(teacher_id: string) {
        return this.request(HttpMethod.PUT, `/users/teachers/${teacher_id}/removefeatureteacher`);
    }

    getSettings(type: string) {
        return this.request(HttpMethod.GET, `/settings/${type}`);
    }

    updateSettings(type: string, data: HomepageSettings) {
        return this.request(HttpMethod.PUT, `/settings/${type}`, data);
    }

    addCategory(data: any) {
        return this.request(HttpMethod.POST, '/settings/addcategory', data);
    }

    deleteCategory(id: string) {
        return this.request(HttpMethod.DELETE, '/settings/category/' + id);
    }

    presignS3File(key: string, contentType: string, params = {}) {
        return this.request(HttpMethod.POST, `/file-uploader`, {
            key,
            contentType
        }, params);
    }

    uploadFile(url: string, fileToUpload: File, key: string) {
        const formData = new FormData();
        formData.append('file', fileToUpload, key);
        return this.http.post(this.baseHref + url, formData);
    }

    uploadS3File(url: string, file: File) {
        return this.http.put(url, file, {
            headers: new HttpHeaders({
                'Content-Type': file.type
            })
        });
    }

    getDrawings(params = {}) {
        return this.request(HttpMethod.GET, `/assets/drawings`, null, params);
    }

    getDrawingsByPaginate(first_load, page, params = {}) {
        return this.request(HttpMethod.GET, '/assets/paginate-drawings?page=' + page + '&first_load=' + first_load, null, params);
    }

    addDrawing(data: any) {
        return this.request(HttpMethod.POST, `/assets/drawings`, data);
    }

    deleteDrawing(id: string) {
        return this.request(HttpMethod.DELETE, `/assets/drawings/${id}`);
    }

    getMaterial(id: string) {
        return this.request(HttpMethod.GET, `/assets/materials/${id}`);
    }

    getMaterials(params = {}) {
        return this.request(HttpMethod.GET, `/assets/materials`, null, params);
    }

    getMaterialsByPaginate(first_load, page: string, search_key, params = {}) {
        if (search_key.field === '' && search_key.value === '') {
            return this.request(HttpMethod.GET, '/assets/paginate-materials?page=' + page + '&first_load=' + first_load, null, params);
        } else {
            return this.request(HttpMethod.GET, '/assets/paginate-materials?page=' + page + '&first_load=' + first_load + '&field=' + search_key.field + '&value=' + search_key.value, null, params);
        }
    }

    addMaterial(data: any) {
        return this.request(HttpMethod.POST, `/assets/materials`, data);
    }

    deleteMaterial(id: string) {
        return this.request(HttpMethod.DELETE, `/assets/materials/${id}`);
    }

    getHomeworks() {
        return this.request(HttpMethod.GET, `/assets/homeworks`);
    }

    addHomework(data: any) {
        return this.request(HttpMethod.POST, `/assets/homeworks`, data);
    }

    getReviews(params = {}) {
        return this.request(HttpMethod.GET, `/reviews`, null, params);
    }

    addReview(data: any) {
        return this.request(HttpMethod.POST, `/reviews`, data);
    }

    deleteReview(id: string) {
        return this.request(HttpMethod.DELETE, `/reviews/${id}`);
    }

    getMyTransactions() {
        return this.request(HttpMethod.GET, `/my/transactions`);
    }

    getProfile() {
        return this.request(HttpMethod.GET, '/my/profile').pipe(
            tap(res => {
                if (res && res.token) {
                    this.setToken(res.token);
                }
            })
        );
    }
    updatePromoter(data: any) {
        return this.request(HttpMethod.PUT, `/my/promoter`, data);
    }
    updateProfile(data: any) {
        return this.request(HttpMethod.PUT, `/my/profile`, data);
    }
    uploadResume(data: any) {
        return this.request(HttpMethod.PUT, `/my/resume`, data);
    }

    getMyPayments() {
        return this.request(HttpMethod.GET, `/my/payments`);
    }

    getPaymentToken(type: 'wechat' | 'alipay', params = {}) {
        return this.request(HttpMethod.GET, `/payments/${type}`, null, params);
    }

    addPaymentToken(type: 'wechat' | 'alipay', body) {
        return this.request(HttpMethod.POST, `/payments/${type}`, body);
    }

    addPayment(data: Payment) {
        return this.request(HttpMethod.POST, `/payments/`, data);
    }

    getComments(to: string) {
        return this.request(HttpMethod.GET, `/comments`, null, {to});
    }

    addComment(data: any) {
        return this.request(HttpMethod.POST, `/comments`, data);
    }

    deleteComment(id: string) {
        return this.request(HttpMethod.DELETE, `/comments/${id}`);
    }

    getAllReviews() {
        return this.request(HttpMethod.GET, `/admin/reviews`);
    }

    getAllReviewsByPaginate(first_load, page) {
        return this.request(HttpMethod.GET, '/admin/paginate-reviews?page=' + page + '&first_load=' + first_load);
    }

    getAllComments() {
        return this.request(HttpMethod.GET, `/admin/comments`);
    }

    getAllCommentsByPaginate(first_load, page) {
        return this.request(HttpMethod.GET, '/admin/paginate-comments?page=' + page + '&first_load=' + first_load);

    }

    getAllPayments() {
        return this.request(HttpMethod.GET, `/admin/payments`);
    }

    getAllPaymentsByPaginate(first_load, page) {
        return this.request(HttpMethod.GET, '/admin/paginate-payments?page=' + page + '&first_load=' + first_load);

    }

    getAllTransactions() {
        return this.request(HttpMethod.GET, `/admin/transactions`);
    }

    getAllTransactionsByPaginate(first_load, page, search_key) {
        if (search_key.field === '' && search_key.value === '') {
            return this.request(HttpMethod.GET, '/admin/paginate-transactions?page=' + page + '&first_load=' + first_load);
        } else {
            return this.request(HttpMethod.GET, '/admin/paginate-transactions?page=' + page + '&first_load=' + first_load + '&field=' + search_key.field + '&value=' + search_key.value);
        }
    }

    addTransaction(body: Transaction) {
        return this.request(HttpMethod.POST, `/admin/transactions`, body);
    }

    addAdminEnrollments(body: any) {
        return this.request(HttpMethod.POST, `/admin/enrollments`, body);
    }

    addAdminBundleEnrollments(body: any) {
        return this.request(HttpMethod.POST, `/admin/bundle-enrollments`, body);
    }

    updateAdminUser(uid: string, body: any) {
        return this.request(HttpMethod.PUT, `/admin/users/${uid}`, body);
    }

    addAdmin(body: any) {
        return this.request(HttpMethod.POST, `/admin`, body);
    }

    editAdminTeachers(id: string, body: any) {
        return this.request(HttpMethod.PUT, `/admin/teachers/${id}`, body);
    }

    requestZoomId(body: { userid: string }) {
        return this.request(HttpMethod.POST, `/zoom`, body);
    }

    deleteZoomId(id: string) {
        return this.request(HttpMethod.DELETE, `/zoom/${id}`);
    }

    createMeeting(body: any) {
        return this.request(HttpMethod.POST, `/zoom/meeting`, body);
    }

    checkSessionCompetion(body: any) {
        return this.request(HttpMethod.POST, `/zoom/completion`, body);
    }

    completeLessonSession(course_id: string, lesson_id: string, session_id: string) {
        return this.request(HttpMethod.POST, `/courses/${course_id}/lessons/${lesson_id}/sessions/${session_id}/complete`);
    }

    cancelLessonSession(course_id: string, lesson_id: string, session_id: string) {
        return this.request(HttpMethod.POST, `/courses/${course_id}/lessons/${lesson_id}/sessions/${session_id}/cancel`);
    }

    rescheduleLessonSession(course_id: string, lesson_id: string, session_id: string, data: any) {
        return this.request(HttpMethod.POST, `/courses/${course_id}/lessons/${lesson_id}/sessions/${session_id}/reschedule`, data);
    }

    getUpcomingLesson() {
        return this.request(HttpMethod.GET, `/courses/lessons/upcoming`);
    }

    getFeatureTeachersForHome(limit) {
        return this.request(HttpMethod.GET, '/users/featureteachersforhome?limit=' + limit);
    }

    getTestimonialForHome() {
        return this.request(HttpMethod.GET, '/users/testimonialforhome');
    }

    getPartnersForHome() {
        return this.request(HttpMethod.GET, '/users/partnersforhome');
    }

    sendContactUsEmail(data) {
        return this.request(HttpMethod.POST, `/auth/contact`, data);
    }

    // checkVerifyEmail(email) {
    //     return this.request(HttpMethod.GET, `/auth/verify-email/${email}`);
    // }

    sendTwilioVerifyPhone(phone) {
        return this.request(HttpMethod.POST, `/auth/twilio-verify-phone`, {phone});
    }
    sendTencentVerifyPhone(phone) {
        return this.request(HttpMethod.POST, `/auth/tencent-verify-phone`, {phone});
    }
    checkTwilioVerifyPhone(code) {
        return this.request(HttpMethod.POST, `/auth/twilio-verify-phone-check`, {code});
    }
    checkTencentVerifyPhone(code) {
        return this.request(HttpMethod.POST, `/auth/tencent-verify-phone-check`, {code});
    }
    sendVerifyEmail(language) {
        return this.request(HttpMethod.GET, '/auth/verify-email?language=' + language);
    }

    verifyEmail(data) {
        return this.request(HttpMethod.POST, `/auth/verify-email`, data);
    }

    referFriend(data) {
        return this.request(HttpMethod.POST, `/auth/refer-friend`, data);
    }

    verifyEmailBySuperAdmin(data) {
        return this.request(HttpMethod.PUT, '/auth/verify-email-superadmin', data);
    }

    verifyPhoneBySuperAdmin(data) {
        return this.request(HttpMethod.PUT, '/auth/verify-phone-superadmin', data);
    }

    changePasswordBySuperAdmin(data) {
        return this.request(HttpMethod.PUT, '/auth/change-password-superadmin', data);
    }

    getSchools() {
        return this.request(HttpMethod.GET, `/schools`);
    }

    getSchoolsByPaginate(first_load, page) {
        return this.request(HttpMethod.GET, '/schools/paginate-schools?page=' + page + '&first_load=' + first_load);

    }

    // APIs for Testimony
    getTestimonialByPaginate(first_load, page) {
        return this.request(HttpMethod.GET, '/admin/paginate-testimonial?page=' + page + '&first_load=' + first_load);

    }

    addTestimonial(data) {
        return this.request(HttpMethod.POST, `/admin/testimonial`, data);
    }

    deleteTestimonial(id) {
        return this.request(HttpMethod.DELETE, '/admin/testimonial/' + id);
    }

    editTestimonial(id, data) {
        return this.request(HttpMethod.PUT, '/admin/testimonial/' + id, data);
    }

    // APIs for partners
    getPartnersByPaginate(first_load, page) {
        return this.request(HttpMethod.GET, '/admin/paginate-partners?page=' + page + '&first_load=' + first_load);

    }

    addPartners(data) {
        return this.request(HttpMethod.POST, `/admin/partners`, data);
    }

    deletePartners(id) {
        return this.request(HttpMethod.DELETE, '/admin/partners/' + id);
    }

    editPartners(id, data) {
        return this.request(HttpMethod.PUT, '/admin/partners/' + id, data);
    }

    getSchool(id) {
        return this.request(HttpMethod.GET, `/schools/${id}`);
    }

    getSchoolTeachers(id) {
        return this.request(HttpMethod.GET, `/schools/${id}/teachers`);
    }

    addSchool(data) {
        return this.request(HttpMethod.POST, `/schools`, data);
    }

    deleteSchool(data) {
        return this.request(HttpMethod.DELETE, `/schools`, data);
    }
}
