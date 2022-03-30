import {UserType} from './../../../interfaces/user';
import {environment} from './../../../../environments/environment';
import {AuthService} from './../../../services/auth.service';
import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormControl, Validators} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import * as _ from 'lodash';
import swal from 'sweetalert2';
import {DataService} from 'src/app/services/data.service';

@Component({
    templateUrl: './signin.component.html',
    styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {
    UserType = UserType;

    form: FormGroup;
    isLoading: boolean;
    message: string;
    // invalidRecaptcha = true;
    secondScreen = false;
    secondScreenType: UserType;
    secondScreenUID: string;

    constructor(
        private fb: FormBuilder,
        private auth: AuthService,
        private router: Router,
        private data: DataService,
        private route: ActivatedRoute) {
        // var gcse = document.createElement('script');
        // gcse.type = 'text/javascript';
        // gcse.async = true;
        // gcse.src = "https://www.recaptcha.net/recaptcha/api.js";
        // var s = document.getElementsByTagName('script')[0];
        // s.parentNode.insertBefore(gcse, s);
        // localStorage.setItem("invalidRecaptcha", "true");
    }

    ngOnInit() {
        this.form = this.fb.group({
            email: new FormControl('', [Validators.required, Validators.pattern(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]),
            password: new FormControl('', [Validators.required])
        });
    }

    async submit() {
        try {
            this.isLoading = true;
            this.message = '';

            if (this.form.invalid) {
                throw Error('Form is invalid');
            }
            // if (localStorage.getItem("invalidRecaptcha") == "true") {
            //     throw Error('Please fill out the challenge below');
            // } else {
            //     localStorage.removeItem("invalidRecaptcha");
            const data = await this.auth.login({
                username: this.form.value.email,
                password: this.form.value.password
            }).toPromise();
            const user = await this.auth.getUser();    
            if (this.route.snapshot.queryParams && this.route.snapshot.queryParams.redirect_url) {
                this.router.navigateByUrl(_.replace(this.route.snapshot.queryParams.redirect_url, /%2F/g, '/'));
                return;
            }

            if (user.type === UserType.Teacher || user.type === UserType.Student) {
                this.router.navigate(['/profile']);
                return;
            }
            this.router.navigate(['/']);
            return;
            // }
        } catch (e) {
            this.message = e.message;
        } finally {
            this.isLoading = false;
        }
    }
    // async submit() {
    //     try {
    //         this.isLoading = true;
    //         this.message = '';
    //
    //         if (this.form.invalid) {
    //             throw Error('Form is invalid');
    //         }
    //         if (localStorage.getItem("invalidRecaptcha") == "true") {
    //             throw Error('Please fill out the challenge below');
    //         } else {
    //             localStorage.removeItem("invalidRecaptcha");
    //             const data = await this.auth.login({
    //                 username: this.form.value.email,
    //                 password: this.form.value.password
    //             }).toPromise();
    //             const user = await this.auth.getUser();
    //
    //             if (!user) {
    //                 // if (!data.phoneVerified) {
    //                 //     const code = await this.auth.verifyPhone(data.phone);
    //                 //
    //                 //     if (!code) {
    //                 //         return;
    //                 //     }
    //                 //
    //                 //     if (!await this.data.checkTwilioVerifyPhone(code).toPromise()) {
    //                 //         return;
    //                 //     }
    //                 //
    //                 //     this.submit();
    //                 // }
    //
    //                 if (!data.children || !data.children.length) {
    //                     this.secondScreen = true;
    //                     this.secondScreenType = data.type as UserType;
    //                     this.secondScreenUID = data._id;
    //                 }
    //             }
    //
    //             if (this.route.snapshot.queryParams && this.route.snapshot.queryParams.redirect_url) {
    //                 this.router.navigateByUrl(_.replace(this.route.snapshot.queryParams.redirect_url, /%2F/g, '/'));
    //                 return;
    //             }
    //
    //             if (user.type === UserType.Teacher || user.type === UserType.Student) {
    //                 this.router.navigate(['/profile']);
    //                 return;
    //             }
    //
    //             this.router.navigate(['/']);
    //             return;
    //         }
    //     } catch (e) {
    //         console.error(e);
    //
    //         this.message = e.message;
    //     } finally {
    //         this.isLoading = false;
    //     }
    // }

}
