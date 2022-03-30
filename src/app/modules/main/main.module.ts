import {TeacherComponent} from './components/teachers/teacher/teacher.component';
import {StarRatingModule} from 'angular-star-rating';
import {MainRoutingModule} from './main.routing';
import {NgModule} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {MainComponent} from './main.component';
import {CoursesComponent} from './components/courses/courses.component';
import {BundlesComponent} from './components/bundles/bundles.component';

import {SharedModule} from '../shared/shared.module';
import {HomeComponent} from './components/home/home.component';

import {CourseComponent} from './components/courses/course/course.component';
import {BundleComponent} from './components/bundles/bundle/bundle.component';

import {TeachersComponent} from './components/teachers/teachers.component';
import {SidebarComponent} from './components/courses/course/sidebar/sidebar.component';
import {BundleSidebarComponent} from './components/bundles/bundle/sidebar/bundle-sidebar.component';

import {SingleCourseSessionComponent} from './components/courses/session/session.component';
import {GalleryComponent} from './components/gallery/gallery.component';
import {AboutusComponent} from './components/aboutus/aboutus.component';
import {FaqComponent} from './components/faq/faq.component';

import {ContactComponent} from './components/contact/contact.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {SlickCarouselModule} from 'ngx-slick-carousel';

@NgModule({
    declarations: [
        MainComponent,
        CoursesComponent,
        BundlesComponent,
        HomeComponent,
        CourseComponent,
        BundleComponent,
        TeacherComponent,
        TeachersComponent,
        SidebarComponent,
        BundleSidebarComponent,
        SingleCourseSessionComponent,
        GalleryComponent,
        AboutusComponent,
        ContactComponent,
        FaqComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        MainRoutingModule,
        NgbModule,
        SlickCarouselModule
    ],
    providers: [DatePipe]
})
export class MainModule {
}
