import {SearchComponent} from './components/search/search.component';
import {MaterialLocalePipe} from './pipes/material-locale.pipe';
import {LevelsPipe} from './pipes/levels.pipe';
import {StudentGroupSizePipe} from './pipes/student-group-size.pipe';
import {MaterialtypePipe} from './pipes/materialtype.pipe';
import {StatePipe} from './pipes/state.pipe';
import {UsertypePipe, TransactiontypePipe, TransactionvaluetypePipe} from './pipes/types.pipe';
import {NgModule} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {HeaderComponent} from './components/header/header.component';
import {FooterComponent} from './components/footer/footer.component';
import {CourseCardComponent} from './components/course-card/course-card.component';

import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import {ReactiveFormsModule} from '@angular/forms';

import {NgbModule, NgbProgressbarModule, NgbDropdownModule} from '@ng-bootstrap/ng-bootstrap';
import {NgxPaginationModule} from 'ngx-pagination';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {NgxMatSelectSearchModule} from 'ngx-mat-select-search';
import {DurationPipe} from './pipes/duration.pipe';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule, MatRadioModule} from '@angular/material';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {StarRatingModule} from 'angular-star-rating';
import {BreadcrumbsComponent} from './components/breadcrumbs/breadcrumbs.component';
import {ExcerptPipe} from './pipes/excerpt.pipe';
import {TimeAgoPipe} from 'time-ago-pipe';

import {FileDropModule} from 'ngx-file-drop';
import {FileUploadComponent} from './components/file-upload/file-upload.component';

import {BarRatingModule} from "ngx-bar-rating";
import {ReviewsComponent} from './components/reviews/reviews.component';
import {CommentsComponent} from './components/comments/comments.component';
import {ActionsComponent} from './components/actions/actions.component';

import {LightboxModule} from 'ngx-lightbox';

import {NgxPayPalModule} from 'ngx-paypal';
import {SweetAlert2Module} from '@sweetalert2/ngx-sweetalert2';

import {MomentModule} from 'ngx-moment';
import {HttpClientModule} from '@angular/common/http';
import {TeacherstatusPipe} from './pipes/teacherstatus.pipe';
import {MatChipsModule} from '@angular/material/chips';
import {AlipayComponent} from './components/alipay/alipay.component'
import {CreditsPricePipe} from './pipes/credits-price.pipe';
import {TranslateDirective} from './directives/translate.directive';
import {TeacherIntroductionChTranslateDirective} from './directives/teacher.introduction.ch.translate.directive';
import {S3StoragePipe} from './pipes/s3-storage.pipe';

@NgModule({
    declarations: [
        HeaderComponent,
        FooterComponent,
        CourseCardComponent,
        BreadcrumbsComponent,
        FileUploadComponent,
        // pipes
        ExcerptPipe,
        DurationPipe,
        UsertypePipe,
        TransactiontypePipe,
        TransactionvaluetypePipe,
        StatePipe,
        MaterialtypePipe,
        TimeAgoPipe,
        StudentGroupSizePipe,
        LevelsPipe,
        TeacherstatusPipe,
        CreditsPricePipe,
        MaterialLocalePipe,
        ReviewsComponent,
        CommentsComponent,
        ActionsComponent,
        AlipayComponent,
        SearchComponent,
        TranslateDirective,
        TeacherIntroductionChTranslateDirective,
        S3StoragePipe
    ],
    imports: [
        CommonModule,
        MatInputModule,
        MatSelectModule,
        ReactiveFormsModule,
        NgbModule,
        NgbDropdownModule,
        NgxPaginationModule,
        MatTableModule,
        MatPaginatorModule,
        MatDatepickerModule,
        MatProgressSpinnerModule,
        MatCheckboxModule,
        MatSortModule,
        MatRadioModule,
        NgxMatSelectSearchModule,
        MatNativeDateModule,
        StarRatingModule.forChild(),
        SweetAlert2Module,
        FileDropModule,
        BarRatingModule,
        NgbProgressbarModule,
        LightboxModule,
        NgxPayPalModule,
        MomentModule,
        HttpClientModule
    ],
    entryComponents: [SearchComponent],
    exports: [
        SearchComponent,
        HeaderComponent,
        FooterComponent,
        CourseCardComponent,
        MatInputModule,
        MatSelectModule,
        ReactiveFormsModule,
        NgxPaginationModule,
        MatTableModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatDatepickerModule,
        MatSortModule,
        MatCheckboxModule,
        NgxMatSelectSearchModule,
        MatNativeDateModule,
        StarRatingModule,
        BreadcrumbsComponent,
        FileDropModule,
        FileUploadComponent,
        BarRatingModule,
        ReviewsComponent,
        CommentsComponent,
        ActionsComponent,
        LightboxModule,
        NgxPayPalModule,
        SweetAlert2Module,
        MomentModule,
        NgbDropdownModule,
        HttpClientModule,
        MatRadioModule,
        // Pipes
        DurationPipe,
        ExcerptPipe,
        UsertypePipe,
        TransactiontypePipe,
        TransactionvaluetypePipe,
        StatePipe,
        MaterialtypePipe,
        TimeAgoPipe,
        StudentGroupSizePipe,
        LevelsPipe,
        TeacherstatusPipe,
        CreditsPricePipe,
        MaterialLocalePipe,
        TranslateDirective,
        TeacherIntroductionChTranslateDirective,
        S3StoragePipe
    ],
    providers: [S3StoragePipe]
})
export class SharedModule {
}
