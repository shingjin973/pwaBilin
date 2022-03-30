import {AuthetncationRoutingModule} from './authentcation.routing';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AuthenticationComponent} from './authentication.component';
import {SigninComponent} from './signin/signin.component';
import {SignupComponent} from './signup/signup.component';
import {SharedModule} from '../shared/shared.module';
import {PartialUpdateComponent} from './partial-update/partial-update.component';
import {ForgotPasswordComponent} from './forgot-password/forgot-password.component';
import {VerifyEmailComponent} from './verify-email/verify-email.component';
import { CookieService } from 'ngx-cookie-service';

@NgModule({
    declarations: [
        AuthenticationComponent,
        SigninComponent,
        SignupComponent,
        PartialUpdateComponent,
        ForgotPasswordComponent,
        VerifyEmailComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        AuthetncationRoutingModule
    ],
    providers:[
        CookieService
    ]
})
export class AuthenticationModule {
}
