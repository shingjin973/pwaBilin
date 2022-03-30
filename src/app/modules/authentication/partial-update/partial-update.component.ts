import {DataService} from 'src/app/services/data.service';
import {ToastrService} from 'ngx-toastr';
import {UserType, User, Kid} from './../../../interfaces/user';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import * as _ from 'lodash';

@Component({
    selector: 'app-partial-update',
    templateUrl: './partial-update.component.html',
    styleUrls: ['./partial-update.component.scss']
})
export class PartialUpdateComponent implements OnInit {

    form: FormGroup;
    message: string;

    children: Kid[];
    schools: any[];

    isLoading = false;

    @Input('type') type: UserType;
    @Input('uid') uid: string;
    @Output() onSubmit = new EventEmitter<boolean>();

    UserType = UserType;

    constructor(
        private fb: FormBuilder,
        private toastr: ToastrService,
        private data: DataService
    ) {
    }

    ngOnInit() {
        switch (this.type) {
            case UserType.UnApprovedTeacher:
                this.form = this.fb.group({
                    profile_picture: new FormControl('', [Validators.required]),
                    introduction: new FormControl('', [Validators.required, Validators.minLength(100)]),
                    introduction_ch: new FormControl(''),
                    school: new FormControl('')
                })

                this.data.getSchools().subscribe(({data}) => {
                    this.schools = data;
                })
                break;
            case UserType.Student:
                this.form = this.fb.group({
                    name: new FormControl('', [Validators.required]),
                    age: new FormControl('', [Validators.required, Validators.pattern(/^\d{1,2}$/i)])
                })

                this.children = [];

                break;
            default:
                console.error('Error: Unknown User Type.');
        }
    }

    async submit() {
        try {
            let data;
            this.isLoading = true;

            switch (this.type) {
                case UserType.UnApprovedTeacher:
                    if (this.form.invalid) {
                        this.message = 'Form is invalid.';
                        return;
                    }

                    data = this.form.value
                    break;
                case UserType.Student:
                    if (!this.children || !this.children.length) {
                        this.message = 'Form is invalid.';
                        return;
                    }

                    data = {
                        children: this.children
                    };
                    break;
            }

            if (!data) {
                throw Error('Something went wrong.')
            }

            this.data.updateUser(data).subscribe(async (res) => {
                if (res) {
                    this.onSubmit.emit(true);
                }
            })

        } catch (e) {
            this.toastr.error(e.message);
        } finally {
            this.isLoading = false;
        }
    }

    deleteKid(id) {
        _.remove(this.children, (v, i) => i === id);
    }

    addKid() {
        if (this.form.valid) {
            this.children.push(this.form.value);
            this.form.reset();
        }
    }
}
