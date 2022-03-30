import {SuperAdminSchoolsComponent} from './components/super-admin/super-admin-schools/super-admin-schools.component';
import {MaterialComponent} from './components/materials/material/material.component';
import {SuperAdminGalleryComponent} from './components/super-admin/super-admin-gallery/super-admin-gallery.component';
import {PaymentsComponent} from './components/payments/payments.component';
import {NewTeacherComponent} from './components/users/new-teacher/new-teacher.component';
import {AdminGuard} from './../../guards/admin.guard';
import {SessionComponent} from './components/courses/course/session/session.component';
import {CommentsComponent} from './components/comments/comments.component';
import {MaterialsComponent} from './components/materials/materials.component';
import {UsersComponent} from './components/users/users.component';
import {StudentsComponent} from './components/users/students/students.component';
import {TeachersComponent} from './components/users/teachers/teachers.component';
import {PromotersComponent} from './components/users/promoters/promoters.component';
import {CourseInfoComponent} from './components/courses/course/info/info.component';
import {CourseComponent} from './components/courses/course/course.component';
import {WechatCourseComponent} from './components/wechat-courses/course/wechat-course.component';

import {AdminComponent} from './admin.component';
import {CoursesComponent} from './components/courses/courses.component';
import {PromoteComponent} from './components/promote/promote.component';
import {FeaturedPackagesComponent} from './components/super-admin/featured-packages/featured-packages.component';
import {WechatCoursesComponent} from './components/wechat-courses/wechat-courses.component';

import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {LessonComponent} from './components/courses/course/lesson/lesson.component';
import {BundleComponent} from './components/courses/course/bundle/bundle.component';
import {UserComponent} from './components/users/user/user.component';
import {EnrollmentsComponent} from './components/enrollments/enrollments.component';
import {BundleEnrollmentsComponent} from './components/bundle-enrollments/bundle-enrollments.component';
import {BundlesComponent} from './components/bundles/bundles.component';
import {DrawingsComponent} from './components/drawings/drawings.component';
import {ReviewsComponent} from './components/reviews/reviews.component';
import {NewEnrollmentComponent} from './components/enrollments/new-enrollment/new-enrollment.component';
import {NewBundleEnrollmentComponent} from './components/bundle-enrollments/new-enrollment/new-bundle-enrollment.component';
import {SuperAdminComponent} from './components/super-admin/super-admin.component';
import {SuperAdminGuard} from 'src/app/guards/super-admin.guard';
import {SuperAdminHomepageComponent} from './components/super-admin/super-admin-homepage/super-admin-homepage.component';
import {SuperAdminAdminsComponent} from './components/super-admin/super-admin-admins/super-admin-admins.component';
import {SuperAdminFeaturesComponent} from './components/super-admin/super-admin-features/super-admin-features.component';
import {SuperAdminTestimonialComponent} from './components/super-admin/super-admin-testimonial/super-admin-testimonial.component';
import {SuperAdminPartnersComponent} from './components/super-admin/super-admin-partners/super-admin-partners.component';
import {SuperAdminConfigsComponent} from './components/super-admin/super-admin-configs/super-admin-configs.component';
import {TransactionsComponent} from './components/transactions/transactions.component';
import {NewTransactionComponent} from './components/transactions/new-transaction/new-transaction.component';
import {SuperAdminBalancesComponent} from './components/super-admin/super-admin-balances/super-admin-balances.component';
import {NewStudentComponent} from './components/users/new-student/new-student.component';
import {SessionsComponent} from './components/sessions/sessions.component';
import {NewCategoryComponent} from './components/super-admin/super-admin-configs/new-category/new-category.component';
import {NewTestimonialComponent} from './components/super-admin/super-admin-testimonial/new-testimonial/new-testimonial.component';
import {NewPartnerComponent} from './components/super-admin/super-admin-partners/new-partner/new-partner.component';

const routes: Routes = [
    {
        path: '',
        component: AdminComponent,
        canActivate: [AdminGuard],
        children: [
            {
                path: 'super-admin',
                component: SuperAdminComponent,
                canActivate: [SuperAdminGuard],
                canActivateChild: [SuperAdminGuard],
                children: [
                    {
                        path: 'homepage',
                        component: SuperAdminHomepageComponent
                    },
                    {
                        path: 'configs',
                        component: SuperAdminConfigsComponent
                    },
                    {
                        path: 'configs/new-category',
                        component: NewCategoryComponent
                    },
                    {
                        path: 'admins',
                        component: SuperAdminAdminsComponent
                    },
                    {
                        path: 'feature_teachers',
                        component: SuperAdminFeaturesComponent
                    },
                    {
                        path: 'feature_packages',
                        component: FeaturedPackagesComponent
                    },
                    {
                        path: 'testimonial',
                        component: SuperAdminTestimonialComponent
                    },
                    {
                        path: 'testimonial/new-testimonial',
                        component: NewTestimonialComponent
                    },
                    {
                        path: 'partners',
                        component: SuperAdminPartnersComponent
                    },
                    {
                        path: 'partners/new-partner',
                        component: NewPartnerComponent
                    },
                    {
                        path: 'gallery',
                        component: SuperAdminGalleryComponent
                    },
                    {
                        path: 'balances',
                        component: SuperAdminBalancesComponent
                    },
                    {
                        path: 'schools',
                        component: SuperAdminSchoolsComponent
                    },
                    {
                        path: '',
                        redirectTo: 'homepage',
                        pathMatch: 'full'
                    }
                ]
            },
            {
                path: 'payments',
                component: PaymentsComponent
            },
            {
                path: 'transactions/new',
                component: NewTransactionComponent
            },
            {
                path: 'transactions',
                component: TransactionsComponent
            },
            {
                path: 'enrollments/new',
                component: NewEnrollmentComponent
            },
            {
                path: 'enrollments',
                component: EnrollmentsComponent
            },
            {
                path: 'packages/:bundleid/enrollments',
                component: BundleEnrollmentsComponent
            },
            {
                path: 'packages/:bundleid/enrollments/new',
                component: NewBundleEnrollmentComponent
            },
            {
                path: 'packages',
                component: BundlesComponent
            },
            {
                path: 'courses/new',
                component: CourseInfoComponent
            },
            {
                path: 'courses/:courseid/lesson/:lessonid/session/:sessionid',
                component: SessionComponent
            },
            {
                path: 'courses/:courseid/lesson/:lessonid',
                component: LessonComponent
            },
            {
                path: 'courses/:courseid/package/:bundleid',
                component: BundleComponent
            },
            {
                path: 'courses/:courseid/edit',
                component: CourseInfoComponent
            },
            {
                path: 'courses/:courseid',
                component: CourseComponent
            },
            {
                path: 'courses',
                component: CoursesComponent
            },
            {
                path: 'promote',
                component: PromoteComponent
            },
            {
                path: 'wechat-courses',
                component: WechatCoursesComponent
            },
            {
                path: 'wechat-courses/:courseid',
                component: WechatCourseComponent
            },
            {
                path: 'materials/:materialid',
                component: MaterialComponent
            },
            {
                path: 'materials',
                component: MaterialsComponent
            },
            {
                path: 'reviews',
                component: ReviewsComponent
            },
            {
                path: 'comments',
                component: CommentsComponent
            },
            {
                path: 'sessions',
                component: SessionsComponent
            },
            {
                path: 'drawings',
                component: DrawingsComponent
            },
            {
                path: 'users/new-teacher',
                component: NewTeacherComponent
            },
            {
                path: 'users/new-student',
                component: NewStudentComponent
            },
            {
                path: 'users/students',
                component: StudentsComponent
            },
            {
                path: 'users/teachers',
                component: TeachersComponent
            },
            {
                path: 'users/promoters',
                component: PromotersComponent
            },
            {
                path: 'users/:userid',
                component: UserComponent
            },
            {
                path: 'users',
                component: UsersComponent
            },
            {
                path: '',
                redirectTo: '/admin/courses',
                pathMatch: 'full'
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule {
}
