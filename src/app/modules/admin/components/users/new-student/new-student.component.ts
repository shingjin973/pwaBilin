import {Component, OnInit} from '@angular/core';
import {FormControl, Validators, FormBuilder, FormGroup} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {Router} from '@angular/router';
import {DataService} from '../../../../../services/data.service';
import swal from 'sweetalert2';
import {Student} from '../../../../../interfaces/user';

@Component({
    selector: 'app-new-student',
    templateUrl: './new-student.component.html',
    styleUrls: ['./new-student.component.scss']
})
export class NewStudentComponent implements OnInit {

    isLoading = false;

    form: FormGroup;
    children = [];

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
        })
    }

    async submit() {
        try {
            this.isLoading = true;

            if (this.form.invalid) {
                throw Error('Form is invalid.');
            }

            const {value} = this.form;

            this.db.addStudent({...value, children: this.children}).subscribe((res) => {
                if (res && res.status === 200) {
                    this.router.navigate(['/admin/users']);
                } else {
                    this.toastr.error(res.message);
                }
            })
        } catch ({message}) {
            this.toastr.error(message);
        } finally {
            this.isLoading = false;
        }
    }

    async addChild() {
        try {
            swal.mixin({
                input: 'text',
                confirmButtonText: 'Next &rarr;',
                showCancelButton: true,
                progressSteps: ['1', '2']
            }).queue([
                {
                    title: 'Child name',
                    text: 'Please enter child\'s name',
                    inputValidator: v => {
                        if (!v) {
                            return 'Please enter child\'s name';
                        }
                    }
                },
                {
                    title: 'Child age',
                    text: 'Please enter child\'s age',
                    confirmButtonText: 'Submit',
                    inputValidator: (v) => {
                        if (!(!Number.isNaN(parseInt(v)) && parseInt(v) >= 1 && parseInt(v) <= 100)) {
                            return 'Please enter correct age';
                        }
                    },
                    preConfirm: v => parseInt(v)
                }
            ]).then(({value}) => {
                this.children.push({name: value[0], age: value[1]});
            })
        } catch ({message}) {
            this.toastr.error(message);
        }
    }
}
