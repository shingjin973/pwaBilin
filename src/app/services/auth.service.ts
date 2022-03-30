import {tap, map, catchError} from 'rxjs/operators';
import {DataService, HttpMethod} from './data.service';
import {UserType, Teacher, Student} from 'src/app/interfaces/user';
import {User} from './../interfaces/user';
import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject, of} from 'rxjs';
import swal from 'sweetalert2';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment.prod-zh';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    public uid: string;
    private user: User;

    user$ = new Subject();

    private isLoginSubject = new BehaviorSubject<boolean>(false);
    private isStudentSubject = new BehaviorSubject<boolean>(false);
    private isAdminSubject = new BehaviorSubject<boolean>(false);
    private isPromoterSubject = new BehaviorSubject<boolean>(false);
    private isSuperAdminSubject = new BehaviorSubject<boolean>(false);

    constructor(
        private data: DataService,
        private http: HttpClient
    ) {
        this.getUser().then((user) => this.isLoginSubject.next(!!user));

        this.isLoginSubject.asObservable().subscribe(async (isAuth) => {
            if (!isAuth) {
                this.isAdminSubject.next(false);
                this.isSuperAdminSubject.next(false);
                this.isStudentSubject.next(false);
                this.isPromoterSubject.next(false);
                this.user$.next(null);
                return;
            }
            const user = await this.getUser();

            this.user$.next(user);

            this.isAdminSubject.next(user && (user.type === UserType.SchoolAdmin || user.type === UserType.SuperAdmin));
            this.isSuperAdminSubject.next(user && user.type === UserType.SuperAdmin);
            this.isStudentSubject.next(user && user.type === UserType.Student);
            this.isPromoterSubject.next(user && user.promotor === true);
        });
    }

    getUser2(): Observable<any> {
        return this.user ? of(this.user) : this.user$.asObservable();
    }

    async getUser(force = false) {
        const token = localStorage.getItem('token');
        if (!this.user || force) {            
            if (token) {                
                const res = await this.data.getProfile().toPromise();
                if (res && res.data) {
                    this.user = res.data;
                } else {
                    localStorage.removeItem('token');
                    this.user = undefined;
                }
            }
        }

        return this.user;
    }

    isStudent = () => this.isStudentSubject.asObservable();

    isSuperAdmin = () => this.isSuperAdminSubject.asObservable();

    isSchoolAdmin = () => this.isAdminSubject.asObservable();
    isPromoter = () => this.isPromoterSubject.asObservable();

    isAuthenticated = () => this.isLoginSubject.asObservable();

    signup(data) {
        return this.http.post(`${this.data.baseHref}/auth/register`, data).pipe(
            map((res: any) => {
                if (res && res.token) {
                    this.data.setToken(res.token);
                }
                return res.data;
            }),
            catchError(e => {
                throw new Error(e.error ? e.error.message : 'Something went wrong.');
            })
        );
    }

    isEmailRegisterd(data) {
        return this.http.post(`${this.data.baseHref}/auth/isEmailRegisterd`, data).pipe(
            map((res: any) => {
                if (res) {
                    return res;
                }
            }),
            catchError(e => {
                throw new Error(e.error ? e.error.message : 'Something went wrong.');
            })
        );
    }

    isPhoneRegisterd(data) {
        return this.http.post(`${this.data.baseHref}/auth/isPhoneRegisterd`, data).pipe(
            map((res: any) => {
                if (res) {
                    return res;
                }
            }),
            catchError(e => {
                throw new Error(e.error ? e.error.message : 'Something went wrong.');
            })
        );
    }

    resetPasswordRequest(user) {
        return this.data.request(HttpMethod.POST, `/auth/reset`, user);
    }

    resetPassword(user) {
        return this.data.request(HttpMethod.PUT, `/auth/reset`, user);
    }

    login(data): Observable<any> {
        return this.http.post(`${this.data.baseHref}/auth/login`, data).pipe(
            map((res: any) => {
                if (res && res.data) {
                    const user: User = res.data;

                    switch (user.type) {
                        case UserType.Teacher: {
                            const teacher = user as Teacher;

                            if (teacher.profile_picture && teacher.introduction) {
                                this.user = teacher;
                                this.isLoginSubject.next(true);
                                this.data.setToken(res.token);
                            } else {                          
                                this.data.setToken(res.token, true);
                            }
                            break;
                        }
                        case UserType.Student: {
                            const student = user as Student;
                            this.user = student;
                            this.isLoginSubject.next(true);
                            this.data.setToken(res.token);
                            break;
                        }
                        case UserType.SchoolAdmin: {
                            this.user = user;
                            this.isLoginSubject.next(true);
                            this.data.setToken(res.token);
                            break;
                        }
                        case UserType.SuperAdmin: {
                            this.user = user;
                            this.isLoginSubject.next(true);
                            this.data.setToken(res.token);
                            break;
                        }
                        case UserType.UnApprovedTeacher: {
                            const teacher = user as Teacher;

                            if (teacher.profile_picture && teacher.introduction) {
                                this.user = teacher;
                                this.isLoginSubject.next(true);
                                this.data.setToken(res.token);
                            } else {
                                this.data.setToken(res.token, true);
                            }
                            break;
                        }
                    }
                }

                return res.data;
            }),
            catchError(e => {
                throw new Error(e.error ? e.error.message : 'Something went wrong.');
            })
        );
    }

    // login(data): Observable<any> {
    //     return this.http.post(`${this.data.baseHref}/auth/login`, data).pipe(
    //         map((res: any) => {
    //             if (res && res.data) {
    //                 const user: User = res.data;
    //
    //                 switch (user.type) {
    //                     case UserType.Teacher: {
    //                         const teacher = user as Teacher;
    //
    //                         if (teacher.profile_picture && teacher.introduction) {
    //                             this.user = teacher;
    //                             this.isLoginSubject.next(true);
    //                             this.data.setToken(res.token);
    //                         } else {
    //                             this.data.setToken(res.token, true);
    //                         }
    //                         break;
    //                     }
    //                     case UserType.Student: {
    //                         const student = user as Student;
    //
    //                         // if (student.children && student.children.length && student.phoneVerified) {
    //                         if (student.children && student.children.length) {
    //                             this.user = student;
    //                             this.isLoginSubject.next(true);
    //                             this.data.setToken(res.token);
    //                         } else {
    //                             this.data.setToken(res.token, true);
    //                         }
    //                         break;
    //                     }
    //                     case UserType.SchoolAdmin: {
    //                         this.user = user;
    //                         this.isLoginSubject.next(true);
    //                         this.data.setToken(res.token);
    //                         break;
    //                     }
    //                     case UserType.SuperAdmin: {
    //                         this.user = user;
    //                         this.isLoginSubject.next(true);
    //                         this.data.setToken(res.token);
    //                         break;
    //                     }
    //                     case UserType.UnApprovedTeacher: {
    //                         const teacher = user as Teacher;
    //
    //                         if (teacher.profile_picture && teacher.introduction) {
    //                             this.user = teacher;
    //                             this.isLoginSubject.next(true);
    //                             this.data.setToken(res.token);
    //                         } else {
    //                             this.data.setToken(res.token, true);
    //                         }
    //                         break;
    //                     }
    //                 }
    //             }
    //
    //             return res.data;
    //         }),
    //         catchError(e => {
    //             throw new Error(e.error ? e.error.message : 'Something went wrong.');
    //         })
    //     );
    // }

    async logout() {
        localStorage.removeItem('token');
        this.user = undefined;
        this.isLoginSubject.next(false);
    }

    async verifyPhone(phone) {
        return await new Promise((resolve, reject) => {
            swal.fire({
                type: 'info',
                title: 'Verify Phone',
                html: `Verification Code will be sent to <strong>${phone}</strong>`,
                confirmButtonText: 'Send Code',
                showLoaderOnConfirm: true,
                showCancelButton: true,
                preConfirm: () => {
                    return new Promise(async (resolve) => {
                        // const data = await this.data.sendTwilioVerifyPhone(phone).toPromise();
                        const data = await this.data.sendTencentVerifyPhone(phone).toPromise();

                        if (!data || data.status !== 'success') {
                            swal.showValidationMessage('Code has not been sent.');
                            resolve();
                            return;
                        }

                        resolve(true);
                    });
                }
            }).then(({value}) => {
                if (!value) {
                    return resolve();
                }

                swal.fire({
                    type: 'info',
                    title: 'Verify Phone',
                    text: 'Enter your code',
                    input: 'text',
                    confirmButtonText: 'Confirm',
                    showLoaderOnConfirm: true,
                    showCancelButton: true,
                    inputValidator: v => !v || v.length !== 6 ? 'Please enter valid code.' : ''
                }).then(async ({value}) => {
                    resolve(value);
                });
            });
        });
    }
}
