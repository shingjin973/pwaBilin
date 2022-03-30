import { DataService } from './../../../../services/data.service';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BreadCrumb } from './../../../../interfaces/main';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  form: FormGroup;
  isLoading = false;

  breadcrumbs: BreadCrumb[] = [{
    link: 'Home',
    url: ['/']
  },{
    link: 'Contact us'
  }]

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private data: DataService,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', Validators.required]
    })
  }

  async submit(){
    try{
      this.isLoading = true;

      if(this.form.invalid){
        throw Error('Form is invalid. Please try again.');
      }

      await this.data.sendContactUsEmail(this.form.value).toPromise();

      this.toastr.success('Your request has been successfully sent.');

      this.router.navigateByUrl('/');
    }catch({message}){
      this.toastr.error(message)
    }finally{
      this.isLoading = false;
    }
  }

}
