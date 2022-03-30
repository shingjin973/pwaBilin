import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {Component, OnInit} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {Router} from '@angular/router';
import {DataService} from 'src/app/services/data.service';

@Component({
    selector: 'app-new-partner',
    templateUrl: './new-partner.component.html',
    styleUrls: ['./new-partner.component.scss']
})
export class NewPartnerComponent implements OnInit {

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
            icon: new FormControl('', [Validators.required]),
            description: new FormControl('', [Validators.required])
        })
    }

    async submit() {
        try {
            this.isLoading = true;

            if (this.form.invalid) {
                throw Error('Form is invalid.');
            }

            const {value: partner} = this.form;

            // Add new partner to DB
            this.db.addPartners(partner).subscribe((res) => {
                if (res) {
                    this.router.navigate(['/admin/super-admin/partners']);
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

}
