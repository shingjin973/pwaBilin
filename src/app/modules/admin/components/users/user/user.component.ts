import { map } from 'rxjs/operators';
import { DataService } from './../../../../../services/data.service';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Enrollment } from './../../../../../interfaces/course';
import { State } from 'src/app/interfaces/enums';
import { UserType, Student } from 'src/app/interfaces/user';
import { User, Teacher, Kid } from './../../../../../interfaces/user';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Component, OnInit } from '@angular/core';
import { Lesson } from 'src/app/interfaces/course';
import * as _ from 'lodash';
import swal from 'sweetalert2';
import { HomepageSettings } from './../../../../../interfaces/settings';
import { async } from '@angular/core/testing';

@Component({
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

    private _enrollments: Enrollment[];
    enrollments: any;
    features: any;
    promotorform: FormGroup;
    commissions: FormGroup;
    activeEnrollmentGroup: string;
    commissionList: any
    enrollmentGroupForm = new FormControl();
    isAddingCommission = false;

    user: User | Student | Teacher;
    lessons: Lesson[];
    UserType = UserType;
    State = State;

    isRequestLoading = false;
    is_feature = false;
    isEditing = false;
    promote_rate = [];
    loading = {
        commissionSubmit: false
    };

    myPromoterUsers=[];
    promoterRate = 0;
    totalCommissions = 0;
    paidCommision = 0 ;
    constructor(
        private toastr: ToastrService,
        private route: ActivatedRoute,
        private router: Router,
        private data: DataService,
        private fb: FormBuilder,
    ) {
    }

    ngOnInit() {
        this.commissions = this.fb.group({
            amount: new FormControl(
            '', 
            [Validators.required, Validators.pattern(/^\d{1,}$/i)],
            this.checkAmount.bind(this)
            )
        });
        this.enrollmentGroupForm.valueChanges.subscribe((v) => {
            this.enrollments = this.groupEnrollmentsBy(v.toLowerCase());
        });
        this.route.params.subscribe((p) => {
            if (p.userid) {
                this.getData(p.userid);
                this.getCommissions(p.userid)
            }
        });
        this.getPaymentsSettings();
    }
    checkAmount(control: FormControl){
        return new Promise((resolve, reject) => {
            let rest_pay = this.totalCommissions*this.promoterRate/100 - this.paidCommision - control.value;
            if(rest_pay < 0) {
                resolve({ checkAmount: true });
            }
            else{resolve(null);}
        })       
    }
    getCommissions(id) {
        this.data.getCommissions(id).subscribe((res) => {
            if (res && res.data) {
                this.commissionList = res.data
            }
        });
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
                    if (this.commissions.invalid) {
                        throw Error('Form is invalid.');
                    }
                    const { value } = this.commissions;
                    value.amount = parseInt(value.amount);
                    value.userID = this.user._id;
                    this.data.addCommission(value).subscribe((res) => {
                        if (res.data) {
                            this.commissionList = res.data;
                            this.isAddingCommission = false;
                            this.loading.commissionSubmit = false;
                        }
                    });
                }
            });

        } catch (e) {
            this.toastr.error(e.message);
        } finally {
            this.loading.commissionSubmit = false;
        }
    }
    async getPaymentsSettings() {
        this.data.getSettings('configs').subscribe((res) => {
            if (res && res.data) {
                this.promote_rate = _.map(_.split(res.data.promoterRate, ','), v => parseInt(_.trim(v)));
            }
        })
    }
    deleteCommision(id) {
        swal.fire({
            title: 'Are you sure to delete?',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.value) {
                this.data.deleteCommision(id).subscribe(() => {
                    this.getCommissions(this.user._id);
                });
            }
        });
    }
    async getData(userid) {
        await this.data.getUser(userid).subscribe((res) => {
            if (res && res.data) {
                this.user = res.data;
                this.is_feature = Boolean(res.is_feature);
                switch (this.user.type) {
                    case UserType.Teacher: {
                        if ((this.user as Teacher).school) {
                            (this.user as any).school$ = this.data.getSchool((this.user as Teacher).school).pipe(map((res: any) => res.name as string));
                        }
                        this.getEnrollmentsData();
                        this.getLessonsData();
                        break;
                    }
                    case UserType.Student: {
                        this.getEnrollmentsData();
                        this.getCommissionTransaction();
                        break;
                    }
                    default: {
                        this.lessons = [];
                    }
                }
                this.initForm();
            }
        });

    }
    async getCommissionTransaction() {
        let promoterID = this.user.promoter_id;
        this.promoterRate = this.user.promotorRate;
        await this.data.getMypromoterUsers(promoterID).subscribe((res) => {
            if (res && res.data) {
                this.myPromoterUsers = [];
                res.data.forEach((element) => {
                    if (element.enrollments.state == 1 || element.enrollments.state == 2) {
                        let data = {
                            username: element.name,
                            date: element.enrollments.date,
                            totalamount: element.enrollments.realPay
                        }
                        this.totalCommissions = this.totalCommissions + element.enrollments.realPay
                        this.myPromoterUsers.push(data)
                    }
                    if (element.bundleenrollments.state) {
                        if (element.bundleenrollments.state == 1 || element.bundleenrollments.state == 2) {
                            let data = {
                                username: element.name,
                                date: element.bundleenrollments.date,
                                totalamount: element.bundleenrollments.realPay
                            }
                            this.totalCommissions = this.totalCommissions + element.bundleenrollments.realPay
                            this.myPromoterUsers.push(data)
                        }
                    }
                });
        
            }
        });
        await this.data.getPaidCommission(this.user._id).subscribe((res) => {
            if (res && res.data) {
                res.data.forEach((element) => {
                    this.paidCommision = this.paidCommision + element.amount
                })
            }
        });
    }
    editPromotor() {
        this.isEditing = true;
    }
    cancelPromotor() {
        this.initForm();   //set original form value, so it doesn't show what you edited
        this.isEditing = false;
    }
    savePromotor() {
        try {
            if (this.promotorform.invalid) {
                throw Error('Form is invalid.');
            }

            const { value } = this.promotorform;
            this.user.promotorRate = value.promotor_rate;
            this.user.promotor = value.promotor;
            var form_data = {
                'promotor': value.promotor,
                'promote_rate': value.promotor_rate,
                'userID': this.user._id
            };
            this.data.updatePromoter(form_data).subscribe((res) => {
                if (res && res.status === 200) {
                    this.isEditing = false;
                } else {
                    this.toastr.error(res.message);
                }
            })

        } catch ({ message }) {
            this.toastr.error(message);
        }
    }
    initForm() {
        this.promotorform = this.fb.group({
            promotor: new FormControl(this.user.promotor == undefined ? false : this.user.promotor, [Validators.required]),
            promotor_rate: new FormControl(this.user.promotorRate, [Validators.required])
        });
    }

    async getLessonsData() {
        this.data.getLessons(undefined, {
            teacher_id: this.user._id,
            students_enrolled: true
        }).subscribe((res) => {
            if (res && res.data) {
                this.lessons = res.data;
            }
        });
    }

    async getEnrollmentsData() {
        const user = this.user;

        switch (user.type) {
            case UserType.Student: {
                this.data.getEnrollments({
                    student_family: user._id
                }).subscribe((res) => {
                    if (res && res.data) {
                        this._enrollments = res.data;
                        this.enrollmentGroupForm.setValue('course');

                    }
                });

                break;
            }
            case UserType.Teacher: {
                this.data.getEnrollments({
                    teacher: user._id
                }).subscribe((res) => {
                    if (res && res.data) {
                        this._enrollments = res.data as Enrollment[];
                        this.enrollmentGroupForm.setValue('course');
                    }
                });
                break;
            }
        }
    }

    groupEnrollmentsBy(field: string) {
        return _.map(_.groupBy(this._enrollments, (v) => v[field]), (v: any, k) => {
            let group;

            if (field === 'student_family') {
                group = `Student family: ${v[0].student_family_name}`;
            }

            if (field === 'course') {
                group = `Course: ${v[0].course_name}`;
            }

            if (field === 'session') {
                group = `Session: ${v[0].session_auto_id}`;
            }

            if (field === 'teacher') {
                group = `Teacher: ${v[0].teacher_name}`;
            }

            return {
                group,
                value: v
            };
        });
    }

    async approveTeacher() {
        await this.data.approveTeacher(this.user._id).toPromise();

        this.getData(this.user._id);
    }

    async setFeatureTeacher() {
        await this.data.setFeatureTeacher(this.user._id).toPromise();
        this.is_feature = true;
        this.getData(this.user._id);
    }

    async removeFeatureTeacher() {
        await this.data.removeFeatureTeacher(this.user._id).toPromise();
        this.is_feature = false;
        this.getData(this.user._id);
    }

    async retireTeacher(teacher_id) {
        swal.fire({
            title: 'Are you sure to set the teacher retired?',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.value) {
                this.data.retireTeacher(teacher_id).subscribe(() => {
                    this.getData(this.user._id);
                });
            }
        });
    }

    async removeRetireTeacher(teacher_id) {
        swal.fire({
            title: 'Are you sure to set the teacher not retired?',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.value) {
                this.data.removeRetireTeacher(teacher_id).subscribe(() => {
                    this.getData(this.user._id);
                });
            }
        });
    }

    async delete() {
        try {
            const hasEnrollments = _.filter(this._enrollments, v => v.state === State.Active);

            if (hasEnrollments.length) {
                throw Error('User still has active enrollments');
            }

            if (this.user.type === UserType.Teacher) {
                if (this.lessons && this.lessons.length) {
                    throw Error('Teacher still has lessons.');
                }
            }

            await this.data.deleteUser(this.user._id).subscribe(() => {
                this.router.navigate(['/admin/users']);
            });

        } catch (e) {
            console.error(e);
            this.toastr.error(e.message);
        }
    }

    async requestZoomId() {
        this.isRequestLoading = true;

        this.data.requestZoomId({ userid: this.user._id }).subscribe((res) => {
            this.isRequestLoading = false;

            if (res) {
                this.getData(this.user._id);
            }
        });
    }

    async deleteZoomId() {
        this.isRequestLoading = true;

        this.data.deleteZoomId(this.user._id).subscribe((res) => {
            this.isRequestLoading = false;

            this.getData(this.user._id);
        });
    }

    async changeTeacherStatus() {
        try {
            swal.fire({
                title: 'Please select status',
                input: 'select',
                inputOptions: {
                    1: 'Bronze',
                    2: 'Silver',
                    3: 'Gold'
                },
                inputPlaceholder: 'Select a status',
                showCancelButton: true,
                inputValidator: (value) => value ? '' : 'Please select something.'
            }).then(async ({ value }) => {
                if (value) {
                    this.data.updateAdminUser(this.user._id, {
                        status: parseInt(value)
                    }).subscribe((res) => {
                        if (res) {
                            this.getData(this.user._id);
                        }
                    });
                }
            });

        } catch (e) {
            this.toastr.error(e.message);
        }
    }

    async changeTeacherSchool() {
        try {
            const schools = await this.data.getSchools().pipe(map(v => v.data)).toPromise();

            const inputOptions = {
                no_school: 'No school'
            };

            for (const school of schools) {
                inputOptions[school._id] = school.name;
            }

            const swalOptions: any = {
                title: 'Please select school',
                input: 'select',
                inputOptions,
                showCancelButton: true,
            };

            if ((this.user as any).school) {
                swalOptions.inputValue = (this.user as any).school;
            }

            swal.fire(swalOptions).then(async ({ value }) => {
                if (value) {
                    if (value === 'no_school') {
                        value = '';
                    }

                    this.data.updateAdminUser(this.user._id, {
                        school: value
                    }).subscribe((res) => {
                        if (res) {
                            this.getData(this.user._id);
                        }
                    });
                }
            });

        } catch (e) {
            this.toastr.error(e.message);
        }
    }

    async changeTeacherIntroduction(en_or_ch, introduction) {
        try {
            var title = '';
            if (en_or_ch == 'en') {
                title = 'Update Introduction';
            }
            else if (en_or_ch == 'ch') {
                title = 'Update Introduction (Chinese)';
            }
            swal.fire({
                title: title,
                input: 'textarea',
                inputValue: introduction,
                showCancelButton: true,
                inputPlaceholder: 'Type introduction of teacher',
                inputValidator: (value) => value ? '' : 'Please input something!'
            }).then(async ({ value }) => {
                if (value) {
                    this.data.updateAdminUser(this.user._id, {
                        en_or_ch: en_or_ch,
                        introduction: value
                    }).subscribe((res) => {
                        if (res) {
                            this.getData(this.user._id);
                        }
                    });
                }
            });

        } catch (e) {
            this.toastr.error(e.message);
        }
    }

    async verifyEmailSuperAdmin() {
        try {
            swal.fire({
                title: `Verify Email: ${this.user.email}`,
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            }).then((result) => {
                if (result.value) {
                    this.data.verifyEmailBySuperAdmin({ id: this.user._id }).subscribe((res) => {
                        if (res && res.status == 'success') {
                            swal.fire('Great!', 'Email is verified successfully', 'success');
                            this.user = res.data;
                        } else {
                            swal.showValidationMessage('Error in verifying email');
                        }
                    })
                }
            });
        } catch (e) {
            this.toastr.error(e.message);
        }
    }

    async verifyPhoneSuperAdmin() {
        try {
            swal.fire({
                title: `Verify Phone: ${this.user.phone}`,
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            }).then((result) => {
                if (result.value) {
                    this.data.verifyPhoneBySuperAdmin({ id: this.user._id }).subscribe((res) => {
                        if (res && res.status == 'success') {
                            swal.fire('Great!', 'Phone is verified successfully', 'success');
                            this.user = res.data;
                        } else {
                            swal.showValidationMessage('Error in verifying phone');
                        }
                    })
                }
            });
        } catch (e) {
            this.toastr.error(e.message);
        }
    }

    async changePassword() {
        try {
            swal.fire({
                title: 'Change Password',
                input: 'text',
                showCancelButton: true,
                inputPlaceholder: 'Enter new password',
                inputValidator: (value) => value ? '' : 'Please input something!'
            }).then(async ({ value }) => {
                if (value) {
                    this.data.changePasswordBySuperAdmin({
                        id: this.user._id,
                        password: value
                    }).subscribe((res) => {
                        if (res) {
                            swal.fire('Great!', 'Password is changed successfully', 'success');
                        } else {
                            swal.showValidationMessage('Error in changing password');
                        }
                    });
                }
            });

        } catch (e) {
            this.toastr.error(e.message);
        }
    }
}
