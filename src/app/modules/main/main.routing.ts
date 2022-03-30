import {AboutusComponent} from './components/aboutus/aboutus.component';
import {GalleryComponent} from './components/gallery/gallery.component';
import {SingleCourseSessionComponent} from './components/courses/session/session.component';
import {TeacherComponent} from './components/teachers/teacher/teacher.component';
import {MainComponent} from './main.component';
import {HomeComponent} from './components/home/home.component';
import {CoursesComponent} from './components/courses/courses.component';
import {BundlesComponent} from './components/bundles/bundles.component';
import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {CourseComponent} from './components/courses/course/course.component';
import {BundleComponent} from './components/bundles/bundle/bundle.component';
import {TeachersComponent} from './components/teachers/teachers.component';
import {ContactComponent} from './components/contact/contact.component';
import {FaqComponent} from './components/faq/faq.component';

const routes: Routes = [
    {
        path: '',
        component: MainComponent,
        children: [
            {
                path: '',
                component: HomeComponent
            },
            {
                path: 'gallery',
                component: GalleryComponent
            },
            {
                path: 'about-us',
                component: AboutusComponent
            },
            {
                path: 'faq',
                component: FaqComponent
            },
            {
                path: 'contact-us',
                component: ContactComponent
            },
            {
                path: 'teachers/:teacherid',
                component: TeacherComponent
            },
            {
                path: 'teachers',
                component: TeachersComponent
            },
            {
                path: 'courses/:courseid/lesson/:lessonid/session/:sessionid',
                component: SingleCourseSessionComponent
            },
            {
                path: 'courses/:courseid/lesson/:lessonid',
                component: CourseComponent
            },
            {
                path: 'courses/:courseid/package/:bundleid',
                component: BundleComponent
            },
            {
                path: 'courses',
                component: CoursesComponent
            }, 
            {
                path: 'courses/:page',
                component: CoursesComponent
            }, 
            {
                path: 'packages',
                component: BundlesComponent
            },
            {
                path: 'packages/:page',
                component: BundlesComponent
            },
        ]
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
    ],
    exports: [RouterModule]
})
export class MainRoutingModule {
}
