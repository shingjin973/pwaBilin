import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ToastrModule} from 'ngx-toastr';
import {StarRatingModule} from 'angular-star-rating';
import {ErrorStateMatcher, ShowOnDirtyErrorStateMatcher} from '@angular/material';
import {SweetAlert2Module} from '@sweetalert2/ngx-sweetalert2';
import {SharedModule} from './modules/shared/shared.module';


@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        SharedModule,
        ToastrModule.forRoot({
            positionClass: 'toast-bottom-right'
        }),
        StarRatingModule.forRoot(),
        SweetAlert2Module.forRoot(),
        

    ],
    providers: [
        {provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher}
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
}