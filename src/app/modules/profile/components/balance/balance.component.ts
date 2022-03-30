import { environment } from "./../../../../../environments/environment";
import { DataService } from "./../../../../services/data.service";
import { User } from "./../../../../interfaces/user";
import { AuthService } from "./../../../../services/auth.service";
import { Payment } from "../../../../interfaces/transactions";
import { BreadCrumb } from "./../../../../interfaces/main";
import { ToastrService } from "ngx-toastr";
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
} from "@angular/forms";
import { ICreateOrderRequest } from "ngx-paypal";
import { Component, OnInit } from "@angular/core";
import * as QRCode from "qrcode";

import * as _ from "lodash";
import { ActivatedRoute, Router } from "@angular/router";
import RxJS from "./../../../shared/functions/rxjs";

@Component({
  selector: "app-balance",
  templateUrl: "./balance.component.html",
  styleUrls: ["./balance.component.scss"],
})
export class BalanceComponent implements OnInit {
  // is_payment_selected = false;
  is_payment_selected = true;
  selected_payment_image = "";

  paymentServices = [
    {
      id: "PayPal",
      text: "PayPal",
      image: "assets/img/payments/s-paypal.png",
    },
    {
        id: 'WeChat',
        text: 'WeChat',
        image: 'assets/img/payments/s-wechat-pay.png'
    },
    {
      id: "AliPay",
      text: "AliPay",
      image: "assets/img/payments/s-alipay.png",
    },
  ];

  paypalConfig: any;
  config: any;
  creditsValues: number[];  
  pricePerCredit: any;

  user: User;

  initiated = false;
  isLoading = false;
  selected_value : any;

  creditsForm: FormGroup;

  breadcrumbs: BreadCrumb[] = [
    {
      link: "Home",
      url: ["/"],
    },
    {
      link: "My Account",
      url: ["/profile"],
    },
  ];
  selected_level = 0; // selected credit index
  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private auth: AuthService,
    private data: DataService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    try {
      const configs = await this.data
        .getSettings("configs")
        .pipe(RxJS.mapResponseToData)
        .toPromise();

      if (!configs) {
        return;
      }

      if (
        !(
          configs.creditsToPurchase &&
          configs.creditsToPurchase.length &&
          configs.pricePerCredit
        )
      ) {
        throw Error("Could not get configs. Please reload the page.");
      }
      const { queryParams: params } = this.route.snapshot;
      this.creditsValues =
        params && params.amount ? [params.amount] : configs.creditsToPurchase;     

      // this.creditsValues = configs.creditsToPurchase;
      this.pricePerCredit = configs.pricePerCredit;
      this.user = await this.auth.getUser();

      this.breadcrumbs.push({
        link: this.user.name,
        url: ["/profile"],
      });
      this.breadcrumbs.push({
        link: "Balance",
      });
      this.selected_value = _.first(this.creditsValues)

      this.creditsForm = this.fb.group({
        // type: new FormControl('', [Validators.required]),
        type: new FormControl("PayPal", [Validators.required]),
        currency: new FormControl("USD", [Validators.required]),
        credits: new FormControl(_.first(this.creditsValues), [
          Validators.required,
        ]),
      });
    } catch ({ message }) {
      this.toastr.error(message);
    }
  }

  selectPayment(type: string, paymentImage: string) {
    this.is_payment_selected = true;
    this.selected_payment_image = paymentImage;
    this.creditsForm.patchValue({
      type: type,
    });
  }
  select_credit_value(item, i) {
    this.selected_level = i;    
    this.selected_value = item;
    this.creditsForm.controls['credits'].setValue(item);
  }
  continue() {

    switch (this.creditsForm.value.type) {
      case "PayPal": {
        this.initPayPal(this.creditsForm.value);
        this.initiated = true;
        break;
      }
      case "WeChat": {
        this.initStripe(this.creditsForm.value, "wechat");
        this.initiated = true;
        break;
      }
      case "AliPay": {
        this.initStripe(this.creditsForm.value, "alipay");
        this.initiated = true;
        break;
      }
      default: {
        this.toastr.error("Undetermined payment service. Please try again.");
      }
    }
  }

  async initStripe(v, type: "wechat" | "alipay") {
    try {
      const currency = v.currency;
      const amount = _.toString(v.credits * this.pricePerCredit);

      if (!currency || !amount) {
        throw Error("Something went wrong.");
      }

      this.config = { type };

      switch (type) {
        case "wechat": {
          this.data
            .getPaymentToken(type, { c: currency, b: amount })
            .subscribe(async (res) => {
              if (res && res.source) {
                this.config.url = await QRCode.toDataURL(res.source.url);
                this.config.id = res.source.id;
              }
            });
          break;
        }
        case "alipay": {
          this.data
            .getPaymentToken(type, {
              c: currency,
              b: amount,
              r: encodeURI(`${location.origin}/en/__/alipay`),
            })
            .subscribe(async (res) => {
              if (res && res.source) {
                this.config.id = res.source.id;

                let newWindow = window.open(
                  res.source.url,
                  "Stripe",
                  "width=600,height=600"
                );
                newWindow.focus();
              }
            });
          break;
        }
        default: {
          throw Error("Oops.. Something went wrong.");
        }
      }
    } catch ({ message }) {
      this.toastr.error(message);
      this.router.navigateByUrl("/profile");
    }
  }

  async confirmStripeRequest() {
    try {
      this.isLoading = true;

      switch (this.config.type) {
        case "wechat": {
          this.data
            .addPaymentToken("wechat", { id: this.config.id })
            .subscribe((res) => {
              this.isLoading = false;

              if (res) {
                const { queryParams: params } = this.route.snapshot;
                if (
                  params &&
                  params.amount &&
                  localStorage.getItem("checkout_bundles")
                ) {
                  const checkout_bundles = JSON.parse(
                    localStorage.getItem("checkout_bundles")
                  );
                  this.data
                    .addBundleEnrollments(checkout_bundles)
                    .subscribe((res) => {
                      if (res && res.status === 200) {
                        // this.toastr.success(res.message);
                        // localStorage.removeItem('checkout_bundles');
                        this.router.navigate(["/profile/checkout-confirm"]);
                      } else {
                        this.toastr.error(res.message);
                      }
                    });
                } else {
                  this.router.navigate(["/profile"]);
                }
              }
            });
          break;
        }
        case "alipay": {
          this.data
            .addPaymentToken("alipay", { id: this.config.id })
            .subscribe((res) => {
              this.isLoading = false;

              if (res) {
                const { queryParams: params } = this.route.snapshot;
                if (
                  params &&
                  params.amount &&
                  localStorage.getItem("checkout_bundles")
                ) {
                  const checkout_bundles = JSON.parse(
                    localStorage.getItem("checkout_bundles")
                  );
                  this.data
                    .addBundleEnrollments(checkout_bundles)
                    .subscribe((res) => {
                      if (res && res.status === 200) {
                        // this.toastr.success(res.message);
                        // localStorage.removeItem('checkout_bundles');
                        this.router.navigate(["/profile/checkout-confirm"]);
                      } else {
                        this.toastr.error(res.message);
                      }
                    });
                } else {
                  this.router.navigate(["/profile"]);
                }
              }
            });
          break;
        }
        default: {
          throw Error("Oops.. Something went wrong.");
        }
      }
    } catch ({ message }) {
      this.isLoading = false;
      this.toastr.error(message);
    }
  }

  initPayPal(v) {
    const currency = v.currency;
    const amount = _.toString(v.credits * this.pricePerCredit);

    if (!currency || !amount) {
      throw Error("Something went wrong.");
    }

    this.paypalConfig = {
      currency: currency,
      clientId: environment.paypalId,
      createOrderOnClient: (data) =>
        <ICreateOrderRequest>{
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: currency,
                value: amount,
                breakdown: {
                  item_total: {
                    currency_code: currency,
                    value: amount,
                  },
                },
              },
              items: [
                {
                  name: "Bilin Academy Purchase credits",
                  quantity: "1",
                  category: "DIGITAL_GOODS",
                  unit_amount: {
                    currency_code: currency,
                    value: amount,
                  },
                },
              ],
            },
          ],
        },
      advanced: {
        updateOrderDetails: {
          commit: true,
        },
        extraQueryParams: [{ name: "disable-funding", value: "credit" }],
      },
      style: {
        shape: "rect",
        label: "pay",
      },
      onApprove: (data, actions) => {
        this.isLoading = true;
        actions.order.get().then((details) => {
          this.isLoading = true;  
        });
      },
      onClientAuthorization: async (data) => {
        const { purchase_units } = data;
        const payment: Payment = {
          create_time: data.create_time,
          paypal_id: data.id,
          payer_id: data.payer.payer_id,
          payer_email_address: data.payer.email_address,
          status: data.status,
          update_time: data.update_time,
          amount: purchase_units[0].amount.value,
          currency: purchase_units[0].amount.currency_code,
          credits: v.credits,
        };

        this.data.addPayment(payment).subscribe((res) => {
          this.isLoading = false;
          if (res) {
            const { queryParams: params } = this.route.snapshot;
            if (
              params &&
              params.amount &&
              localStorage.getItem("checkout_bundles")
            ) {
              const checkout_bundles = JSON.parse(
                localStorage.getItem("checkout_bundles")
              );
              this.data
                .addBundleEnrollments(checkout_bundles)
                .subscribe((res) => {
                  if (res && res.status === 200) {
                    // this.toastr.success(res.message);
                    // localStorage.removeItem('checkout_bundles');
                    this.router.navigate(["/profile/checkout-confirm"]);
                  } else {
                    this.toastr.error(res.message);
                  }
                });
            } else {
              this.router.navigate(["/profile"]);
            }
          }
        });
      },
      onError: (err) => {
        this.toastr.error(err);
        this.isLoading = false;
      },
    };
  }
}
