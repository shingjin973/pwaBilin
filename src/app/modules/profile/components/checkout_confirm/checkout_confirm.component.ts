import {map, tap} from 'rxjs/operators';
import {DataService} from 'src/app/services/data.service';
import {BreadCrumb} from './../../../../interfaces/main';
import {Transaction} from '../../../../interfaces/transactions';
import {UserType, Student, Teacher} from 'src/app/interfaces/user';
import {User} from './../../../../interfaces/user';
import {AuthService} from './../../../../services/auth.service';
import {Lesson, Enrollment, Session, Course, Bundle} from './../../../../interfaces/course';
import {Component, OnInit} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {Router, ActivatedRoute} from '@angular/router';
import {Payment} from 'src/app/interfaces/transactions';
import * as _ from 'lodash';
import {BehaviorSubject} from 'rxjs';
import {State} from 'src/app/interfaces/enums';
import * as moment from 'moment';
import swal from 'sweetalert2';
import * as uuid from 'uuid/v1';
import RxJS from "../../../shared/functions/rxjs";

@Component({
    selector: 'checkout-page',
    templateUrl: './checkout_confirm.component.html',
    styleUrls: ['./checkout_confirm.component.scss']
})
export class Checkout_confirmComponent implements OnInit {
    UserType = UserType;
    State = State;
    bundles: any[];
    user: User;
    total_sum_amount = 0;
    is_loading = true;
    breadcrumbs: BreadCrumb[] = [{
        link: 'Home',
        url: ['/']
    }, {
        link: 'My Account',
        url: ['/profile']
    }, {
        link: 'Checkout confirmation'
    }];

    constructor(
        private toastr: ToastrService,
        private auth: AuthService,
        private route: ActivatedRoute,
        private router: Router,
    ) {
    }

    async ngOnInit() {
        this.user = await this.auth.getUser(true);
        await this.getChekcoutBundles();
        await this.total_sum();

    }

    async getChekcoutBundles() {
        try {
            if (this.user.type === UserType.Student && localStorage.getItem('checkout_bundles')) {
                const checkout_bundles = JSON.parse(localStorage.getItem('checkout_bundles'));
                this.bundles = checkout_bundles;
                this.is_loading = false;
                localStorage.removeItem('checkout_bundles');
            }
            else {
                this.bundles = null;
                this.is_loading = false;
            }
        } catch (e) {
            this.toastr.error(e.message);
        }
    }

    async total_sum() {
        let sum = 0;
        if (this.bundles != null) {
            for (let j = 0; j < this.bundles.length; j++) {
                sum += this.bundles[j].tuition;
            }
        }
        this.total_sum_amount = sum;
        // return sum;
    }

    navigate(url) {
        if (typeof this.user.balance !== 'number' || this.user.balance < this.total_sum_amount) {
            var amount = 0;
            if (this.user.balance) {
                amount = (this.total_sum_amount - this.user.balance)
            } else {
                amount = this.total_sum_amount;
            }

            this.router.navigate([url], {
                queryParams: {
                    amount: amount
                }
            });
        }
        else {
            this.router.navigate([url]);
        }
    }
}
