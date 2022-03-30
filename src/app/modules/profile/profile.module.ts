import {ProfileRoutingModule} from './profile.routing';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProfileComponent} from './profile.component';
import {InfoComponent} from './components/info/info.component';
import {CheckoutComponent} from './components/checkout/checkout.component';
import {Checkout_confirmComponent} from './components/checkout_confirm/checkout_confirm.component';
import {SettingsComponent} from './components/settings/settings.component';
import {PromoterComponent} from './components/promoter/promoter.component';
import {SharedModule} from '../shared/shared.module';
import {BalanceComponent} from './components/balance/balance.component';
import {ShareComponent} from './components/promoter/share/share.component';
import { TransactionComponent } from './components/promoter/transaction/transaction.component';


@NgModule({
    declarations: [
        ProfileComponent,
        InfoComponent,
        SettingsComponent,
        BalanceComponent,
        CheckoutComponent,
        Checkout_confirmComponent,
        PromoterComponent,
        ShareComponent,
        TransactionComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        ProfileRoutingModule,  
    ]
})
export class ProfileModule {
}
