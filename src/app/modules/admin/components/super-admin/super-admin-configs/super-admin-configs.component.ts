import {DataService} from './../../../../../services/data.service';
import {HomepageSettings} from './../../../../../interfaces/settings';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {Component, OnInit} from '@angular/core';
import * as uuid from 'uuid/v1';

import * as _ from 'lodash';
import swal from "sweetalert2";
import {Material} from "../../../../../interfaces/course";
import * as urlValidator from "validator/lib/isURL";
import {Lightbox} from "ngx-lightbox";
import {environment} from "../../../../../../environments/environment";

@Component({
    selector: 'app-super-admin-configs',
    templateUrl: './super-admin-configs.component.html',
    styleUrls: ['./super-admin-configs.component.scss']
})
export class SuperAdminConfigsComponent implements OnInit {

    paymentsSettings: HomepageSettings;
    categories;
    form: FormGroup;

    isEditing = false;

    constructor(
        private toastr: ToastrService,
        private fb: FormBuilder,
        private data: DataService,
        private _lightbox: Lightbox
    ) {
    }

    ngOnInit() {
        this.getPaymentsSettings();
    }

    initForm(isEditing = false) {
        this.isEditing = isEditing;

        this.form = this.fb.group({
            fees_bronze: new FormControl(this.paymentsSettings.fees.bronze, [Validators.required]),
            fees_silver: new FormControl(this.paymentsSettings.fees.silver, [Validators.required]),
            fees_gold: new FormControl(this.paymentsSettings.fees.gold, [Validators.required]),
            pricePerCredit: new FormControl(this.paymentsSettings.pricePerCredit, [Validators.required]),
            creditsToPurchase: new FormControl(this.paymentsSettings.creditsToPurchase.join(', '), [Validators.required]),
            promoterRate: new FormControl(this.paymentsSettings.promoterRate.join(', '), [Validators.required]),
            categories: new FormControl(this.paymentsSettings.categories.join(', '), [Validators.required]),
            skills: new FormControl(this.paymentsSettings.skills.join(', '), [Validators.required]),
        })
    }

    async uploadCategoryImage() {
        try {
            let new_category;

            await new Promise(() => {
                swal.mixin({
                    confirmButtonText: 'Next &rarr;',
                    showCancelButton: true,
                    progressSteps: ['1', '2'],
                }).queue([
                    {
                        title: 'Select Category Image',
                        input: 'file',
                        inputAttributes: {
                            'accept': 'image/*,',
                            'aria-label': 'Upload category image'
                        }
                    },
                    {
                        title: 'Enter Category Name',
                        input: 'text',
                        inputValidator: (v) => !!v ? '' : 'Please enter valid name',
                    }
                ]).then(async ({value}) => {
                    if (value && value.length === 2) {
                        try {
                            const file: File = value[0];
                            const category_name = value[1];
                            if (file.size > 50 * 1000 * 1000) {
                                throw Error('File is too big');
                            }

                            if (!(/^image\//.test(file.type))) {
                                throw Error('Invalid file type.');
                            }


                            let key = uuid();
                            key = `${key}.${_.last(_.split(file.name, '.'))}`;

                            const res = await this.data.presignS3File(key, file.type).toPromise();

                            if (!res || !res.AWSurl || !res.AWSurl_ch) {
                                throw Error('Something went wrong.');
                            }
                            // upload to US S3
                            await this.data.uploadS3File(res.AWSurl, file).toPromise();
                            // Upload to China S3
                            await this.data.uploadS3File(res.AWSurl_ch, file).toPromise();
                 
                            // fileData.url = key;
                            new_category = {
                                "picture": key,
                                "name": category_name
                            }

                            // Add new category to DB
                            const result = await this.data.addCategory(new_category).toPromise();

                            //    load categories again
                            if (!result || !result.categories) {
                                throw Error('Something went wrong.');
                            } else {
                                this.categories = result.categories;
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    }
                })
            })
        } catch ({message}) {
            this.toastr.error(message);
        }
    }

    async deleteCategory(id) {
        // this.data.deleteCategory(id).subscribe((res) => {
        //     if (res) {
        //         this.categories = res.categories;
        //     }
        // })
        swal.fire({
            title: 'Are you sure to delete?',
            text: 'You will not be able to recover!',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.value) {
                this.data.deleteCategory(id).subscribe((res) => {
                    if (res) {
                        this.categories = res.categories;
                        swal.fire('Great!', 'Category has been successfully deleted.', 'success');
                    }
                })

                // For more information about handling dismissals please visit
                // https://sweetalert2.github.io/#handling-dismissals
            }
            // else if (result.dismiss === swal.DismissReason.cancel) {
            //     swal.fire(
            //         'Cancelled',
            //         'Your imaginary file is safe :)',
            //         'error'
            //     )
            // }
        })
    }

    viewCategoryImage(src: string) {
        const image_url = environment.locale === 'en' ? `https://bilinstudio-assets.s3.us-east-2.amazonaws.com/${src}` : `https://bilinstudio-assets.s3.cn-north-1.amazonaws.com.cn/${src}`;

        this._lightbox.open([{src: image_url, thumb: image_url}]);
    }

    async getPaymentsSettings() {
        this.data.getSettings('configs').subscribe((res) => {
            if (res && res.data) {
                this.paymentsSettings = res.data;
                this.categories = res.data.new_categories;
                this.initForm();
            }
        })
    }

    async save() {
        try {
            if (this.form.invalid) {
                throw Error('Form is invalid.');
            }

            const {value: data} = this.form;

            const creditsToPurchase = _.map(_.split(data.creditsToPurchase, ','), v => parseInt(_.trim(v)));              

            if (creditsToPurchase.length === 0 || !_.every(creditsToPurchase, v =>  !isNaN(v))) {
                throw Error('Invalid credits field.');
            }
         

            const promoterRate = _.map(_.split(data.promoterRate, ','), v => parseInt(_.trim(v)));

            if (promoterRate.length === 0 || !_.every(promoterRate, v =>  !isNaN(v))) {
                throw Error('Invalid credits field.');
            }

            const categories = _.map(_.split(data.categories, ','), v => _.startCase(_.trim(v)));
            const skills = _.map(_.split(data.skills, ','), v => _.startCase(_.trim(v)));

            const paymentsSettings = {
                fees: {
                    bronze: parseInt(data.fees_bronze),
                    silver: parseInt(data.fees_silver),
                    gold: parseInt(data.fees_gold)
                },
                pricePerCredit: parseInt(data.pricePerCredit),
                creditsToPurchase: creditsToPurchase,
                promoterRate:promoterRate,
                categories,
                skills
            }

            this.data.updateSettings('configs', paymentsSettings).subscribe((res) => {
                if (res) {
                    this.getPaymentsSettings();
                    this.isEditing = false;
                }
            })
        } catch (e) {
            console.error(e);
            this.toastr.error(e.message);
        }
    }
}
