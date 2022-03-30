import {AuthService} from './../../../../../../services/auth.service';
import {FormGroup, FormBuilder, Validators, FormControl} from '@angular/forms';
import {Component, OnInit} from '@angular/core';
import {ToastrService} from 'ngx-toastr';

import * as _ from 'lodash';
import {Router} from '@angular/router';
import {map} from 'rxjs/operators';
import {DataService} from 'src/app/services/data.service';

@Component({
    templateUrl: './info.component.html',
    styleUrls: ['./info.component.scss']
})
export class CourseInfoComponent implements OnInit {
    form: FormGroup;
    isLoading: boolean;

    max_students = [];

    categories$ = this.data.getSettings('configs').pipe(map(res => res && res.data ? res.data.categories : []));
    skills$ = this.data.getSettings('configs').pipe(map(res => res && res.data ? res.data.skills : []));
    admin_course_categories: any[];

    _range = (max) => Array(max).fill(1).map((x, y) => x + y);

    constructor(
        private fb: FormBuilder,
        private toastr: ToastrService,
        private router: Router,
        private data: DataService,
        private auth: AuthService
    ) {

        this.form = this.fb.group({
            topic: new FormControl('', [Validators.required]),
            topic_ch: new FormControl(''),
            material: new FormControl(''),
            category: new FormControl('', [Validators.required]),
            description: new FormControl('', [Validators.required]),
            description_ch: new FormControl(''),           
            min_age: new FormControl('', [Validators.required, Validators.pattern(/^\d{1,2}$/i)]),
            max_age: new FormControl('', [Validators.required, Validators.pattern(/^\d{1,2}$/i)]),
            language: new FormControl('', [Validators.required]),
            language_skill: new FormControl('', [Validators.required]),
            skill: new FormControl('', [Validators.required]),
            skill_level: new FormControl('', [Validators.required]),           
            thumbnail: new FormControl(''),      
            provider: new FormControl('', [Validators.required])
        });
        for (var i = 1; i < 26; i++) {
            this.max_students.push(i);
        }
        this.max_students.push(50);
        this.max_students.push(100);
    }

    ngOnInit() {
        this.data.getCategories().subscribe((res) => {
            if (res && res.data) {
                this.admin_course_categories = res.data;
            }
        });
    }

    hasError(field) {
        return this.form.get(field).invalid && this.form.get(field).touched && this.form.get(field).dirty;
    }

    async submit() {
        try {
            this.isLoading = true;

            if (this.form.invalid) {
                throw Error('Form is invalid');
            }

            const {value: form} = this.form;
          
            form.min_age = parseInt(form.min_age);
            form.max_age = parseInt(form.max_age);        
            form.language_skill = parseInt(form.language_skill);
            form.skill_level = parseInt(form.skill_level);    
            form.date = new Date();

            const admin = await this.auth.getUser() as any;

            if (admin.adminSchool) {
                form.school_id = admin.adminSchool['_id'];
            }

            this.data.addCourse(form).subscribe(() => {
                this.router.navigate(['/admin/courses/']);
            });
        } catch (e) {
            this.toastr.error(e.message);
        } finally {
            this.isLoading = false;
        }
    }

}
