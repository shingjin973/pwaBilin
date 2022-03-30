import { AuthService } from './../../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  form: FormGroup;
  passForm: FormGroup;
  isLoading: boolean;

  code: string;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService) { }

  ngOnInit() {
    this.form = this.fb.group({
      email: new FormControl('', [Validators.required, Validators.pattern(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)])
    })

    this.passForm = this.fb.group({
      password: new FormControl('', [Validators.required])
    })

    this.route.queryParams.subscribe((p) => {
      if(p && p.q){
        this.code = p.q;
      }
    })
  }

  async submitPassword(){
    try{
      this.isLoading = true;

      if(this.passForm.invalid){
        throw Error('Form is invalid');
      }

      this.auth.resetPassword({password: this.passForm.value.password, code: this.code}).subscribe((res) => {
        if(res && res.status === 'success'){
          this.toastr.success('Your password has been changed.');

          this.router.navigate(['/authentication/signin']);
        }
      })

    }catch(e){
      console.error(e);

      this.toastr.error(e.message);

    }finally{
      this.isLoading = false;      
    }
  }

  async submit(){
    try{
      this.isLoading = true;

      if(this.form.invalid){
        throw Error('Form is invalid');
      }
      let language = environment.locale;
      this.auth.resetPasswordRequest({email: this.form.value.email, language:language}).subscribe((res) => {
        if(res && res.status === 'success'){
          this.toastr.success('Your password has been reset. Please check your email.');

          this.router.navigate(['/authentication/signin']);
        }
      })

    }catch(e){
      console.error(e);

      this.toastr.error(e.message);

    }finally{
      this.isLoading = false;
    }
  }
}
