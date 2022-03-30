import { environment } from "./../../../../environments/environment";
import { DataService } from "./../../../services/data.service";
import { AuthService } from "./../../../services/auth.service";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from "@angular/forms";
import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { UserType } from "src/app/interfaces/user";
import { ToastrService } from "ngx-toastr";
import swal from "sweetalert2";
import { isMobilePhone } from "validator";
import * as _ from "lodash";
import { CookieService } from "ngx-cookie-service";
// import custom validator to validate that password and confirm password fields match
import { MustMatch } from "src/app/helpers/must-match.validator";

@Component({
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.scss"],
})
export class SignupComponent implements OnInit {
  form: FormGroup;
  isLoading: boolean;
  message: string;

  countries = [
    {
      pre: "+1",
      name: "United States",
      locale: "en-US",
    },
    {
      pre: "+1",
      name: "Canada",
      locale: "en-CA",
    },
    {
      pre: "+7",
      name: "Russia",
      locale: "ru-RU",
    },
    {
      pre: "+32",
      name: "Belgium",
      locale: "nl-BE",
    },

    {
      pre: "+33",
      name: "France",
      locale: "fr-FR",
    },
    {
      pre: "+34",
      name: "Spain",
      locale: "es-ES",
    },
    {
      pre: "+39",
      name: "Italy",
      locale: "it-IT",
    },
    {
      pre: "+44",
      name: "United Kingdom",
      locale: "en-GB",
    },
    {
      pre: "+49",
      name: "Germany",
      locale: "de-DE",
    },
    {
      pre: "+60",
      name: "Malaysia",
      locale: "ms-MY",
    },
    {
      pre: "+61",
      name: "Australia",
      locale: "en-AU",
    },
    {
      pre: "+62",
      name: "Indonesia",
      locale: "id-ID",
    },
    {
      pre: "+64",
      name: "New Zealand",
      locale: "en-NZ",
    },
    {
      pre: "+65",
      name: "Singapore",
      locale: "en-SG",
    },
    {
      pre: "+66",
      name: "Thailand",
      locale: "th-TH",
    },

    {
      pre: "+81",
      name: "Japan",
      locale: "ja-JP",
    },
    {
      pre: "+82",
      name: "Korea Republic of",
      locale: "ko-KR",
    },
    {
      pre: "+84",
      name: "Vietnam",
      locale: "vi-VN",
    },
    {
      pre: "+86",
      name: "China",
      locale: "zh-CN",
    },

    {
      pre: "+852",
      name: "Hong Kong",
      locale: "zh-HK",
    },
    {
      pre: "+853",
      name: "Macao",
      locale: "any",
    },
    {
      pre: "+886",
      name: "Taiwan",
      locale: "zh-TW",
    },
    {
      pre: "",
      name: "Other",
      locale: "",
    },
  ];

  UserType = UserType;

  secondScreen = false;
  secondScreenType: UserType;
  secondScreenUID: string;

  is_country_other = false;
  referer = "";
  promoterId = "0";  
  courseId = "0"; 
  lessonId = "0"; 
  editDisable =  true;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private cookieService: CookieService
  ) {
    //     var gcse = document.createElement('script');
    //     gcse.type = 'text/javascript';
    //     gcse.async = true;
    //     gcse.src = "https://www.recaptcha.net/recaptcha/api.js";
    //     var s = document.getElementsByTagName('script')[0];
    //     s.parentNode.insertBefore(gcse, s);
    //     localStorage.setItem("signupinvalidRecaptcha", "true");
  }

  ngOnInit() {
    const { queryParams: params } = this.route.snapshot;
    this.referer = params && params.referer ? params.referer : "";

    this.promoterId = params && params.promoterId ? params.promoterId : "0";

    if(this.promoterId =='0'){
      this.editDisable = false;
    } 

    this.courseId = params && params.courseId ? params.courseId : "0";
  

    this.lessonId = params && params.lessonId ? params.lessonId : "0";
  

    this.form = this.fb.group(
      {
        email: new FormControl(
          "",
          [
            Validators.required,
            Validators.pattern(
              /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            ),
          ],
          this.isEmailRegisterd.bind(this)
        ),
        name: new FormControl("", [Validators.required]),
        // phone: new FormControl('', [Validators.required, Validators.pattern(/\d{1,}/)],
        //     this.isPhoneRegisterd.bind(this)),
        // valid phone number is 18012340598, 12345678901
        phone: new FormControl(
          "",
          [
            Validators.required,
            Validators.pattern(/^(?!0+$)(?:\(?\d{1,3}\)?[- ]?|0)?\d+$/),
          ],
          this.isPhoneRegisterd.bind(this)
        ),
        country: new FormControl("United States", [Validators.required]),
        password: new FormControl("", [
          Validators.required,
          Validators.minLength(6),
        ]),
        confirmPassword: new FormControl("", [Validators.required]),
        type: new FormControl(UserType.Student, [Validators.required]),
        term_privacy: new FormControl(false, [Validators.requiredTrue]),
        promoter: new FormControl({ value: this.promoterId, disabled: this.editDisable }),
      },
      {
        validator: MustMatch("password", "confirmPassword"),
      }
    );
  }

  isPhoneRegisterd(control: FormControl) {
    return new Promise((resolve, reject) => {
      const country = _.find(this.countries, {
        name: this.form.value.country,
      }) as any;

      const phone = {
        phone: country.pre + control.value,
      };
      this.authService.isPhoneRegisterd(phone).subscribe(
        (res) => {
          if (res.isPhoneRegisterd) {
            resolve({ isPhoneRegisterd: true });
          } else {
            resolve(null);
          }
        },
        () => {
          resolve({ isPhoneRegisterd: false });
        }
      );
    });
  }

  isEmailRegisterd(control: FormControl) {
    return new Promise((resolve, reject) => {
      // setTimeout(() => {
      const email = {
        email: control.value,
      };
      this.authService.isEmailRegisterd(email).subscribe(
        (res) => {
          // resolve({'isEmailRegisterd': res.isEmailRegisterd});
          if (res.isEmailRegisterd) {
            resolve({ isEmailRegisterd: true });
          } else {
            resolve(null);
          }
        },
        () => {
          resolve({ isEmailRegisterd: false });
        }
      );
      // }, 1000);
    });
  }

  async submit() {
    this.isLoading = true;
    this.message = "";

    try {
      if (this.form.invalid) {
        throw Error("Form is invalid.");
      }
      // if (localStorage.getItem("signupinvalidRecaptcha") == "true") {
      //     throw Error('Please fill out the challenge below');
      // } else {
      //     localStorage.removeItem("signupinvalidRecaptcha");
      const country = _.find(this.countries, {
        name: this.form.value.country,
      }) as any;
      var user;
      let language = environment.locale;
      var promoterByID;
      if(this.editDisable){
        promoterByID = Number(this.promoterId);
      }
      else{
        const regex = new RegExp(/^\d+$/);
        if(regex.test(this.form.value.promoter)){
          promoterByID = Number(this.form.value.promoter);
        }
        else{
          promoterByID = 0;
        }        
      }
      if (country.name == "Other" && this.is_country_other) {
        user = {
          registerByPromoterId: promoterByID,
          referer: this.referer,
          username: this.form.value.email,
          name: this.form.value.name,
          password: this.form.value.password,
          phone: this.form.value.countrycode + this.form.value.phone,
          type: this.form.value.type,
          language: language,
        };
      } else {
        user = {
          registerByPromoterId: promoterByID,
          referer: this.referer,
          username: this.form.value.email,
          name: this.form.value.name,
          password: this.form.value.password,
          phone: country.pre + this.form.value.phone,
          type: this.form.value.type,
          language: language,
        };
      }     

      if (this.form.value.country === "Other") {
        if (!_.startsWith(user.phone, "+")) {
          throw Error("Invalid phone number.");
        }
      } else if (!isMobilePhone(user.phone, country.locale)) {
        throw Error("Invalid phone number.");
      }

      await this.authService.signup({ ...user }).toPromise();

      await this.authService
        .login({
          username: this.form.value.email,
          password: this.form.value.password,
        })
        .toPromise();

      const user_after_login = await this.authService.getUser();
      if (
        user_after_login.type === UserType.Teacher ||
        user_after_login.type === UserType.Student
      ) {
          if(this.lessonId != "0"){
            // this.router.navigate(["/courses/"+this.courseIdValue+"/lesson"+this.lessonIdValue]);
            this.router.navigate(['/courses', this.courseId, 'lesson', this.lessonId])
          }
          else{
            this.router.navigate(["/profile"]);
          }   
        return;
      }

      this.router.navigate(["/"]);
      return;

      // this.secondScreen = true;
      // this.secondScreenType = +this.form.value.type as UserType;
      // this.secondScreenUID = data._id;
      // }
    } catch (e) {
      console.error(e);

      this.message = e.message;
    } finally {
      this.isLoading = false;
    }
  }

  changeCountry(country) {
    if (country == "Other") {
      this.is_country_other = true;
      // valid country code input is +91, +919, etc
      this.form.addControl(
        "countrycode",
        new FormControl("", [
          Validators.required,
          Validators.pattern(/^(?:\+)\d+$/),
        ])
      );
    } else {
      this.is_country_other = false;
      this.form.removeControl("countrycode");
    }
  }

  // async submit() {
  //     this.isLoading = true;
  //     this.message = '';
  //
  //     try {
  //         if (this.form.invalid) {
  //             throw Error('Form is invalid.');
  //         }
  //         if (localStorage.getItem("signupinvalidRecaptcha") == "true") {
  //             throw Error('Please fill out the challenge below');
  //         } else {
  //             localStorage.removeItem("signupinvalidRecaptcha");
  //             const country = _.find(this.countries, {name: this.form.value.country}) as any;
  //
  //             const user = {
  //                 username: this.form.value.email,
  //                 name: this.form.value.name,
  //                 password: this.form.value.password,
  //                 phone: country.pre + this.form.value.phone,
  //                 type: this.form.value.type
  //             };
  //
  //             if (this.form.value.country === 'Other') {
  //                 if (!_.startsWith(user.phone, '+')) {
  //                     throw Error('Invalid phone number. +country code phone');
  //                 }
  //             } else if (!isMobilePhone(user.phone, country.locale)) {
  //                 throw Error('Invalid phone number.');
  //             }
  //
  //             // const code = await this.authService.verifyPhone(user.phone);
  //             //
  //             // if (!code) {
  //             //     return;
  //             // }
  //             // const data = await this.authService.signup({...user, code}).toPromise();
  //             const data = await this.authService.signup({...user}).toPromise();
  //
  //             this.secondScreen = true;
  //             this.secondScreenType = +this.form.value.type as UserType;
  //             this.secondScreenUID = data._id;
  //         }
  //     } catch (e) {
  //         console.error(e);
  //
  //         this.message = e.message;
  //     } finally {
  //         this.isLoading = false;
  //     }
  // }

  async afterUpdate() {
    try {
      this.authService
        .login({
          username: this.form.value.email,
          password: this.form.value.password,
        })
        .subscribe((res) => {
          this.router.navigate(["/"]);
        });
    } catch (e) {
      console.error(e);

      this.toastr.error(e.message);
    }
  }
}
