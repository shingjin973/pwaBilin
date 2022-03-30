import {DataService} from 'src/app/services/data.service';
import {Lesson} from 'src/app/interfaces/course';
import {HomepageSettings} from './../../../../../interfaces/settings';
import {FormBuilder, FormGroup, FormControl, Validators} from '@angular/forms';
import {Component, OnInit} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import * as _ from 'lodash';

@Component({
    selector: 'app-super-admin-homepage',
    templateUrl: './super-admin-homepage.component.html',
    styleUrls: ['./super-admin-homepage.component.scss']
})
export class SuperAdminHomepageComponent implements OnInit {

    hs: HomepageSettings;

    form: FormGroup;

    promotions: any[];

    featured: Lesson;

    isEditing = false;

    constructor(
        private toastr: ToastrService,
        private fb: FormBuilder,
        private data: DataService
    ) {
    }

    ngOnInit() {
        this.getPaymentsSettings();
    }

    initForm(isEditing = false) {
        this.isEditing = isEditing;

        this.form = this.fb.group({
            title: new FormControl(this.hs.title, [Validators.required]),
            title_ch: new FormControl(this.hs.title_ch, [Validators.required]),
            facebook: new FormControl(this.hs.social.facebook),
            instagram: new FormControl(this.hs.social.instagram),
            twitter: new FormControl(this.hs.social.twitter),
            youtube: new FormControl(this.hs.social.youtube),
            loginText: new FormControl(this.hs.loginText)
        });
    }

    async getPaymentsSettings() {
        this.data.getSettings('configs').subscribe((res) => {
            if (res && res.data) {
                this.hs = res.data;

                this.data.getAllPromotions().subscribe((res) => {
                    if (res && res.data) {
                        this.promotions = res.data;
                    }
                });

                this.initForm();
            }
        });
    }

    async deletePromotion(id) {
        let newPromotions = _.filter(Array.prototype.slice.call(this.hs.promotions), v => v !== id);

        this.data.updateSettings('configs', {
            promotions: newPromotions
        }).subscribe((res) => {
            if (res) {
                this.getPaymentsSettings();
            }
        });
    }

    async save() {
        try {    

            if (this.form.invalid) {
                throw Error('Form is invalid.');
            }

            const {value: data} = this.form;

            const hs: HomepageSettings = {
                title: data.title,
                title_ch: data.title_ch,
                social: {
                    facebook: data.facebook,
                    twitter: data.twitter,
                    youtube: data.youtube,
                    instagram: data.instagram
                },
                loginText: data.loginText
            };

            this.data.updateSettings('configs', hs).subscribe((res) => {
                if (res) {
                    this.getPaymentsSettings();
                    this.isEditing = false;
                }
            });

        } catch (e) {
            console.error(e);
            this.toastr.error(e.message);
        }
    }
}
