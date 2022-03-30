import { BalanceComponent } from './components/balance/balance.component';
import { AuthGuard } from './../../guards/auth.guard';
import { NgModule } from '@angular/core';
import { InfoComponent } from './components/info/info.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { Checkout_confirmComponent } from './components/checkout_confirm/checkout_confirm.component';
import { ProfileComponent } from './profile.component';
import { Routes, RouterModule } from '@angular/router';
import { SettingsComponent } from './components/settings/settings.component';
import { PromoterComponent } from './components/promoter/promoter.component';
import { StudentGuard } from 'src/app/guards/student.guard';
import { ShareComponent } from './components/promoter/share/share.component';
import { TransactionComponent } from './components/promoter/transaction/transaction.component';
const routes: Routes = [
    {
        path: '',
        component: ProfileComponent,
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        children: [
            {
                path: '',
                component: InfoComponent
            },
            {
                path: 'balance',
                component: BalanceComponent,
                canActivate: [StudentGuard]
            },
            {
                path: 'settings',
                component: SettingsComponent
            },
            {
                path: 'promoter',
                children: [
                    {
                        path: '',
                        component: PromoterComponent

                    },
                    {
                        path: 'share',
                        component: ShareComponent,
                    },
                    {
                        path: 'transaction',
                        component: TransactionComponent,
                    }
                ]
            },
            {
                path: 'checkout',
                component: CheckoutComponent
            },
            {
                path: 'checkout-confirm',
                component: Checkout_confirmComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProfileRoutingModule {
}
