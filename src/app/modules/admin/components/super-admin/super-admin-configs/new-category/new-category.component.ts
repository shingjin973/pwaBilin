import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {Component, OnInit} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {Router} from '@angular/router';
import {DataService} from 'src/app/services/data.service';

@Component({
    selector: 'app-new-category',
    templateUrl: './new-category.component.html',
    styleUrls: ['./new-category.component.scss']
})
export class NewCategoryComponent implements OnInit {

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
            picture: new FormControl('', [Validators.required])
        })
    }

    async submit() {
        try {
            this.isLoading = true;

            if (this.form.invalid) {
                throw Error('Form is invalid.');
            }

            const {value: teacher} = this.form;

            // Add new category to DB
            this.db.addCategory(teacher).subscribe((res) => {
                if (res && res.categories) {
                    this.router.navigate(['/admin/super-admin/configs']);
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
