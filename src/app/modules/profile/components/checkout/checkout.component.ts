import { map, tap } from "rxjs/operators";
import { DataService } from "src/app/services/data.service";
import { BreadCrumb } from "./../../../../interfaces/main";
import { Transaction } from "../../../../interfaces/transactions";
import { UserType, Student, Teacher } from "src/app/interfaces/user";
import { User } from "./../../../../interfaces/user";
import { AuthService } from "./../../../../services/auth.service";
import {
  Lesson,
  Enrollment,
  Session,
  Course,
  Bundle,
} from "./../../../../interfaces/course";
import { Component, OnInit } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { Router, ActivatedRoute } from "@angular/router";
import { Payment } from "src/app/interfaces/transactions";
import * as _ from "lodash";
import { BehaviorSubject } from "rxjs";
import { State } from "src/app/interfaces/enums";
import * as moment from "moment";
import swal from "sweetalert2";
import * as uuid from "uuid/v1";
import RxJS from "../../../shared/functions/rxjs";

@Component({
  selector: "checkout-page",
  templateUrl: "./checkout.component.html",
  styleUrls: ["./checkout.component.scss"],
})
export class CheckoutComponent implements OnInit {
  UserType = UserType;
  State = State;
  bundles: any[];
  user: User;
  total_sum_amount = 0;
  membership = false;
  membership_credits = 0;
  normal_credit = 0;
  free_balance = 0;
  applied_balance = 0;
  need_credit_amount = 0;
  is_submit_purchase = false;
  pricePerCredit: any;

  breadcrumbs: BreadCrumb[] = [
    {
      link: "Home",
      url: ["/"],
    },
    {
      link: "My Account",
      url: ["/profile"],
    },
    {
      link: "Checkout",
    },
  ];

  constructor(
    private toastr: ToastrService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private data: DataService
  ) {}

  async ngOnInit() {
    this.user = await this.auth.getUser(true);
    await this.getChekcoutBundles();
    const configs = await this.data
      .getSettings("configs")
      .pipe(RxJS.mapResponseToData)
      .toPromise();
    this.pricePerCredit = configs.pricePerCredit;
    if (this.user.free_balance != null) {
      this.free_balance = this.user.free_balance;
    }
    this.total_sum();
  }

  async getChekcoutBundles() {
    try {
      if (
        this.user.type === UserType.Student &&
        localStorage.getItem("checkout_bundles")
      ) {
        const checkout_bundles = JSON.parse(
          localStorage.getItem("checkout_bundles")
        );
        this.bundles = checkout_bundles;
      } else {
        this.bundles = null;
      }
    } catch (e) {
      this.toastr.error(e.message);
    }
  }

  delete_from_cart(bundle_id: string) {
    this.bundles = _.filter(this.bundles, (v) => v.bundle != bundle_id);
    localStorage.setItem("checkout_bundles", JSON.stringify(this.bundles));
    this.toastr.success("Removed from checkout");
    this.total_sum();
  }

  total_sum() {
    let sum = 0;
    let sum_membership = 0;
    let need_amount = 0;
    if (this.bundles != null) {     
      for (let j = 0; j < this.bundles.length; j++) {
        sum += this.bundles[j].tuition;          
        if (this.bundles[j].membership) {
          this.membership = true; //check whether membershipe package
          sum_membership += this.bundles[j].tuition; // total credits of membership packages
        }        
      }
    }
    this.total_sum_amount = sum;
    this.membership_credits = sum_membership;
    this.normal_credit = sum - sum_membership;
    if (this.free_balance < this.normal_credit) {
      need_amount = this.total_sum_amount - this.user.balance;
    } else {
      need_amount =
        this.membership_credits - (this.user.balance - this.free_balance);
    }
    if (need_amount < 0) {
      this.need_credit_amount = 0;
    } else {
      this.need_credit_amount = need_amount;
    }
    this.applied_balance = this.total_sum_amount - this.need_credit_amount;

    // return sum;
  }

  purchase_bundles() {
    if (this.need_credit_amount>0 ) {      
      this.router.navigate(["/profile/balance"], {
        queryParams: {
          amount: this.need_credit_amount,
        },
      });
      return;
    } else {
      swal
        .fire({
          type: "warning",
          text: "Are you sure to purchase?",
          showCancelButton: true,
          confirmButtonText: "Yes",
        })
        .then(({ value }) => {
          if (value) {
            this.is_submit_purchase = true;
            this.data.addBundleEnrollments(this.bundles).subscribe((res) => {
              if (res && res.status === 200) {
                // this.toastr.success(res.message);
                // localStorage.removeItem('checkout_bundles');
                this.bundles = null;
                this.is_submit_purchase = false;
                this.router.navigateByUrl("/profile/checkout-confirm");
              } else {
                this.toastr.error(res.message);
              }
            });
          }
        });
      return;
    }
  }

  navigate(url) {
    if (
      typeof this.user.balance !== "number" ||
      this.user.balance < this.total_sum_amount
    ) {
      var amount = 0;
      if (this.user.balance) {
        amount = this.total_sum_amount - this.user.balance;
      } else {
        amount = this.total_sum_amount;
      }

      this.router.navigate([url], {
        queryParams: {
          amount: amount,
        },
      });
    } else {
      this.router.navigate([url]);
    }
  }
}
