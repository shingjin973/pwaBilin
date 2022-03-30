import {AdminRoutingModule} from './admin.routing';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AdminComponent} from './admin.component';
import {CoursesComponent} from './components/courses/courses.component';
import {WechatCoursesComponent} from './components/wechat-courses/wechat-courses.component';

import {SharedModule} from '../shared/shared.module';
import {CourseComponent} from './components/courses/course/course.component';
import {FeaturedPackagesComponent} from './components/super-admin/featured-packages/featured-packages.component';
import {WechatCourseComponent} from './components/wechat-courses/course/wechat-course.component';

import {CourseInfoComponent} from './components/courses/course/info/info.component';
import {LessonComponent} from './components/courses/course/lesson/lesson.component';
import {BundleComponent} from './components/courses/course/bundle/bundle.component';
import {UsersComponent} from './components/users/users.component';
import {StudentsComponent} from './components/users/students/students.component';
import {TeachersComponent} from './components/users/teachers/teachers.component';
import {PromotersComponent} from './components/users/promoters/promoters.component';
import {UserComponent} from './components/users/user/user.component';
import {EnrollmentsComponent} from './components/enrollments/enrollments.component';
import {BundleEnrollmentsComponent} from './components/bundle-enrollments/bundle-enrollments.component';
import {BundlesComponent} from './components/bundles/bundles.component';
import {MaterialsComponent} from './components/materials/materials.component';
import {DrawingsComponent} from './components/drawings/drawings.component';
import {ReviewsComponent} from './components/reviews/reviews.component';
import {CommentsComponent} from './components/comments/comments.component';
import {SessionComponent, PickMaterialComponent} from './components/courses/course/session/session.component';
import {NewEnrollmentComponent} from './components/enrollments/new-enrollment/new-enrollment.component';
import {NewBundleEnrollmentComponent} from './components/bundle-enrollments/new-enrollment/new-bundle-enrollment.component';
import {NewTeacherComponent} from './components/users/new-teacher/new-teacher.component';
import {SuperAdminComponent} from './components/super-admin/super-admin.component';
import {SuperAdminHomepageComponent} from './components/super-admin/super-admin-homepage/super-admin-homepage.component';
import {SuperAdminAdminsComponent} from './components/super-admin/super-admin-admins/super-admin-admins.component';
import {SuperAdminFeaturesComponent} from './components/super-admin/super-admin-features/super-admin-features.component';
import {SuperAdminTestimonialComponent} from './components/super-admin/super-admin-testimonial/super-admin-testimonial.component';
import {SuperAdminPartnersComponent} from './components/super-admin/super-admin-partners/super-admin-partners.component';
import {SuperAdminConfigsComponent} from './components/super-admin/super-admin-configs/super-admin-configs.component';
import {SuperAdminGalleryComponent} from './components/super-admin/super-admin-gallery/super-admin-gallery.component';
import {TransactionsComponent} from './components/transactions/transactions.component';
import {NewTransactionComponent} from './components/transactions/new-transaction/new-transaction.component';
import {PaymentsComponent} from './components/payments/payments.component';
import {MaterialComponent} from './components/materials/material/material.component';
import {SuperAdminBalancesComponent} from './components/super-admin/super-admin-balances/super-admin-balances.component';
import {SuperAdminSchoolsComponent} from './components/super-admin/super-admin-schools/super-admin-schools.component';
import {MatDialogModule} from '@angular/material';
import {NewStudentComponent} from './components/users/new-student/new-student.component';
import {SessionsComponent} from './components/sessions/sessions.component';
import {NewCategoryComponent} from './components/super-admin/super-admin-configs/new-category/new-category.component';
import {NewTestimonialComponent} from './components/super-admin/super-admin-testimonial/new-testimonial/new-testimonial.component';
import {NewPartnerComponent} from './components/super-admin/super-admin-partners/new-partner/new-partner.component';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { PromoteComponent, NgbdModalContent } from './components/promote/promote.component';

@NgModule({
    declarations: [
        AdminComponent,
        CoursesComponent,
        FeaturedPackagesComponent,
        WechatCoursesComponent,
        CourseComponent,
        WechatCourseComponent,
        CourseInfoComponent,
        LessonComponent,
        BundleComponent,
        UsersComponent,
        UserComponent,
        StudentsComponent,
        TeachersComponent,
        PromotersComponent,
        EnrollmentsComponent,
        BundleEnrollmentsComponent,
        BundlesComponent,
        MaterialsComponent,
        DrawingsComponent,
        ReviewsComponent,
        CommentsComponent,
        SessionComponent,
        NewEnrollmentComponent,
        NewBundleEnrollmentComponent,
        NewTeacherComponent,
        SuperAdminComponent,
        SuperAdminHomepageComponent,
        SuperAdminAdminsComponent,
        SuperAdminFeaturesComponent,
        SuperAdminTestimonialComponent,
        SuperAdminPartnersComponent,
        SuperAdminConfigsComponent,
        SuperAdminGalleryComponent,
        TransactionsComponent,
        NewTransactionComponent,
        PaymentsComponent,
        MaterialComponent,
        SuperAdminBalancesComponent,
        SuperAdminSchoolsComponent,
        PickMaterialComponent,
        NewStudentComponent,
        SessionsComponent,
        NewCategoryComponent,
        NewTestimonialComponent,
        NewPartnerComponent,
        PromoteComponent,
        NgbdModalContent
    ],
    imports: [
        CommonModule,
        SharedModule,
        AdminRoutingModule,
        MatDialogModule,
        NgxMaterialTimepickerModule,
        MatSlideToggleModule

    ],
    entryComponents: [PickMaterialComponent, NgbdModalContent]
})
export class AdminModule {
}
