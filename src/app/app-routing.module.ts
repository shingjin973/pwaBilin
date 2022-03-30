import {AlipayComponent} from './modules/shared/components/alipay/alipay.component';
import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

const routes: Routes = [
    {
        path: '__/alipay',
        component: AlipayComponent
    },
    {
        path: '',
        loadChildren: './modules/main/main.module#MainModule'
    },
    {
        path: 'admin',
        loadChildren: './modules/admin/admin.module#AdminModule'
    },
    {
        path: 'authentication',
        loadChildren: './modules/authentication/authentication.module#AuthenticationModule'
    },
    {
        path: 'profile',
        loadChildren: './modules/profile/profile.module#ProfileModule'
    }
];

@NgModule({
    imports: [
        // RouterModule.forRoot(routes),
        RouterModule.forRoot(routes, {
            scrollPositionRestoration: 'enabled',
            anchorScrolling: 'enabled',
        })],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
