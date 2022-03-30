import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {Component, OnInit} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {Router} from '@angular/router';
import {DataService} from 'src/app/services/data.service';

@Component({
    selector: 'app-new-testimonial',
    templateUrl: './new-testimonial.component.html',
    styleUrls: ['./new-testimonial.component.scss']
})
export class NewTestimonialComponent implements OnInit {

    isLoading = false;

    form: FormGroup;

    constructor(
        private fb: FormBuilder,
        private toastr: ToastrService,
        private router: Router,
        private db: DataService
    ) {
    }

    ngOnInit() {
        this.form = this.fb.group({
            name: new FormControl('', [Validators.required]),
            testimony: new FormControl('', [Validators.required]),
            language: new FormControl('', [Validators.required]),
        })
    }

    async submit() {
        try {
            this.isLoading = true;

            if (this.form.invalid) {
                throw Error('Form is invalid.');
            }

            const {value: testimonial} = this.form;

            // Add new testimonial to DB
            this.db.addTestimonial(testimonial).subscribe((res) => {
                if (res) {
                    this.router.navigate(['/admin/super-admin/testimonial']);
                } else {
                    throw Error('Something went wrong.');
                }
            })
        } catch ({message}) {
            this.toastr.error(message);
        } finally {
            this.isLoading = false;
        }
    }

    hasError(field) {
        return this.form.get(field).invalid && this.form.get(field).touched && this.form.get(field).dirty;
    }
}
