import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {Component, OnInit} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {Router} from '@angular/router';
import {DataService} from 'src/app/services/data.service';

@Component({
    selector: 'app-new-teacher',
    templateUrl: './new-teacher.component.html',
    styleUrls: ['./new-teacher.component.scss']
})
export class NewTeacherComponent implements OnInit {

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
            email: new FormControl('', [Validators.required]),
            password: new FormControl('', [Validators.required]),
            phone: new FormControl('', [Validators.required]),
            introduction: new FormControl('', [Validators.required, Validators.minLength(100)]),
            introduction_ch: new FormControl(''),
            profile_picture: new FormControl('', [Validators.required])
        })
    }

    async submit() {
        try {
            this.isLoading = true;

            if (this.form.invalid) {
                throw Error('Form is invalid.');
            }

            const {value: teacher} = this.form;

            this.db.addTeacher(teacher).subscribe((res) => {
                if (res && res.data) {
                    this.router.navigate(['/admin/users']);
                }
            })
        } catch ({message}) {
            this.toastr.error(message);
        } finally {
            this.isLoading = false;
        }
    }

}
