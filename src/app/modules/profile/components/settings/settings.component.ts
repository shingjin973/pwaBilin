import {DataService} from 'src/app/services/data.service';
import {BreadCrumb} from './../../../../interfaces/main';
import {UserType, Teacher, Student} from './../../../../interfaces/user';
import {AuthService} from './../../../../services/auth.service';
import {FormControl, Validators, FormBuilder, FormGroup} from '@angular/forms';
import {Component, OnInit} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {Router} from '@angular/router';
import swal from 'sweetalert2';

declare var $: any;

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
    UserType = UserType;
    form: FormGroup;
    user: Student | Teacher;

    isLoading = false;

    schools: any[];

    breadcrumbs: BreadCrumb[] = [{
        link: 'Home',
        url: ['/']
    }, {
        link: 'My Account',
        url: ['/profile']
    }]

    constructor(
        private fb: FormBuilder,
        private data: DataService,
        private toastr: ToastrService,
        private auth: AuthService,
        private router: Router
    ) {
    }

    async changePassword() {
        swal.fire({
            title: 'Change password',
            showCancelButton: true,
            confirmButtonText: 'Change password',
            showLoaderOnConfirm: true,
            html: `
        <input autocapitalize="off" class="swal2-input mb-0" id="current-password" placeholder="Current password" type="password" >
        <input autocapitalize="off" class="swal2-input mb-0" id="new-password" placeholder="New password" type="password" >
        <input autocapitalize="off" class="swal2-input" id="new-password-confirm" placeholder="Confirm new password" type="password" >
      `,
            preConfirm: () => {
                const currentPassword = $('#current-password').val();
                const newPassword = $('#new-password').val();
                const confirmNewPassword = $('#new-password-confirm').val();

                if (!currentPassword) {
                    return swal.showValidationMessage('Please enter current password.');
                }

                if (!newPassword || !confirmNewPassword) {
                    return swal.showValidationMessage('Please enter new password.');
                }

                if (newPassword.length < 6) {
                    return swal.showValidationMessage('Password has to be at least 6 characters.');
                }

                if (newPassword !== confirmNewPassword) {
                    return swal.showValidationMessage('Passwords don\'t match');
                }

                return this.data.updateUser({password: currentPassword, newPassword: newPassword}).toPromise();
            },
            allowOutsideClick: () => !swal.isLoading()
        });
    }

    async ngOnInit() {
        this.user = await this.auth.getUser();

        this.breadcrumbs.push({
            link: this.user.name,
            url: ['/profile']
        })
        this.breadcrumbs.push({
            link: 'Edit'
        })

        const form: any = {
            name: new FormControl(this.user.name, [Validators.required]),
            phone: new FormControl(this.user.phone, [Validators.required]),
            facebook: new FormControl(this.user.facebook || ''),
            wechat: new FormControl(this.user.wechat || ''),
            classin: new FormControl(this.user.classin || ''),
            profile_picture: new FormControl((<Teacher>this.user).profile_picture)
        }

        if (this.user.type === UserType.Teacher) {
            form.introduction = new FormControl((<Teacher>this.user).introduction, [Validators.required]);
            form.introduction_ch = new FormControl((<Teacher>this.user).introduction_ch);
            form.school = new FormControl((<Teacher>this.user).school)

            this.data.getSchools().subscribe(({data}) => {
                this.schools = data;
            })
        }

        this.form = this.fb.group(form);
        if (this.user.phoneVerified){
            this.form.get("phone").disable();
        }
    }

    async submit() {
        try {
            this.isLoading = true;

            if (this.form.invalid) {
                throw Error('Form is invalid.');
            }

            this.data.updateProfile(this.form.value).subscribe((res) => {
                if (res && res.status === 200) {
                    this.router.navigate(['/profile']);
                } else {
                    this.toastr.error(res.message);
                }
            })
        } catch ({message}) {
            this.toastr.error(message);
        } finally {
            this.isLoading = false;
        }
    }
    isPhoneRegisterd(control: FormControl) {
        return new Promise((resolve, reject) => {  
            const phone = {
                phone: control.value,
              };    
            this.auth.isPhoneRegisterd(phone).subscribe((res) => {
                if (res.isPhoneRegisterd) {
                    resolve({'isPhoneRegisterd': true});
                }
                else {
                    resolve(null);
                }
            }, () => {
                resolve({'isPhoneRegisterd': false});
            });
        });
    }
}
