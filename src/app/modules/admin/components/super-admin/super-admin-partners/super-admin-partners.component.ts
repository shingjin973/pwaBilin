import {Router} from '@angular/router';
import {DataService} from './../../../../../services/data.service';
import {User} from './../../../../../interfaces/user';
import {UserType} from 'src/app/interfaces/user';
import {Component, OnInit} from '@angular/core';
import swal from 'sweetalert2';
import * as _ from "lodash";
import * as uuid from 'uuid/v1';
import {environment} from "../../../../../../environments/environment";
import {Lightbox} from "ngx-lightbox";

@Component({
    selector: 'app-super-admin-partners',
    templateUrl: './super-admin-partners.component.html',
    styleUrls: ['./super-admin-partners.component.sass']
})
export class SuperAdminPartnersComponent implements OnInit {
    partners: any[];
    currentPage = 1;
    totalItemsPerPage = 20;
    pager = {};
    pagination_pages = [];
    has_previous_five_page = false;
    has_next_five_page = false;
    is_first_load = 1;

    constructor(
        private data: DataService,
        private _lightbox: Lightbox
    ) {
    }

    ngOnInit() {
        this.getData(1);
    }

    getData(page) {
        this.currentPage = page;
        this.data.getPartnersByPaginate(this.is_first_load, page).subscribe((res) => {
            if (res && res.data) {
                this.partners = res.data;
                if (this.is_first_load === 1) {
                    this.pager = res.pager;
                    this.is_first_load = 0;
                }
                this.makePages(page, this.pager);
            }
        });
    }

    makePages(page, pager) {
        var pages = [];
        var start_page = 1;
        var end_page = 5;

        if (parseInt(page) >= 3) {
            start_page = parseInt(page) - 2;
            // BEGIN: calculate end_page
            if ((parseInt(page) + 2) <= parseInt(pager.pages[pager.pages.length - 1])) {
                end_page = parseInt(page) + 2;
                this.has_next_five_page = true;
            } else {
                end_page = pager.pages[pager.pages.length - 1];
                this.has_next_five_page = false;
            }
            // END:
        } else {
            if (parseInt(pager.pages[pager.pages.length - 1]) <= 5) {
                end_page = parseInt(pager.pages[pager.pages.length - 1]);
                this.has_next_five_page = false;
            } else {
                end_page = 5;
                this.has_next_five_page = true;
            }
        }
        if (start_page > 1) {
            this.has_previous_five_page = true;
        } else {
            this.has_previous_five_page = false;
        }
        for (let i = start_page; i <= end_page; i++) {
            pages.push(i);
        }
        this.pagination_pages = pages;
    }

    async addPartner() {
        const inputOptions = {
            "English": "English",
            "Chinese": "Chinese"
        };

        swal.mixin({
            confirmButtonText: 'Next &rarr;',
            showCancelButton: true,
            progressSteps: ['1', '2', '3']
        }).queue([
            {
                title: 'Please Enter Partner name',
                input: 'text',
                inputValidator: (v) => !!v ? '' : 'Please enter valid name'
            },
            {
                title: 'Select Partner Icon',
                input: 'file',
                inputAttributes: {
                    'accept': 'image/*,',
                    'aria-label': 'Upload partner icon'
                }
            },
            {
                title: 'Please Enter Partner Description',
                input: 'textarea',
                inputValidator: (v) => !!v ? '' : 'Please enter valid description'
            }
        ]).then(async ({value}) => {
            if (value) {
                try {
                    // BEGIN: upload partner icon to AWS S3
                    const file: File = value[1];
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
                    // END:

                    await this.data.addPartners({
                        name: value[0],
                        icon: key,
                        description: value[2]
                    }).toPromise();
                    this.is_first_load = 1;
                    this.getData(1);
                } catch ({message}) {
                    swal.fire('Oops', message, 'error');
                }
            }
        })
    }

    viewPartnerImage(src: string) {
        const image_url = environment.locale === 'en' ? `https://bilinstudio-assets.s3.us-east-2.amazonaws.com/${src}` : `https://bilinstudio-assets.s3.cn-north-1.amazonaws.com.cn/${src}`;

        this._lightbox.open([{src: image_url, thumb: image_url}]);
    }

    async deletePartner(id) {
        try {
            swal.fire({
                title: 'Are you sure to delete?',
                text: 'You will not be able to recover!',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            }).then((result) => {
                if (result.value) {
                    this.data.deletePartners(id).subscribe((res) => {
                        if (res) {
                            swal.fire('Great!', 'Partner has been successfully deleted.', 'success');
                            this.is_first_load = 1;
                            this.getData(1);
                        }
                    })
                }
            })
        } catch ({message}) {
            swal.fire('Oops', message, 'error');
        }
    }

    async editPartner(item) {
        swal.mixin({
            confirmButtonText: 'Next &rarr;',
            showCancelButton: true,
            progressSteps: ['1', '2', '3']
        }).queue([
            {
                title: 'Please Enter Partner name',
                input: 'text',
                inputValue: item.name,
                inputValidator: (v) => !!v ? '' : 'Please enter valid name'
            },
            {
                title: 'Select Partner Icon',
                input: 'file',
                inputAttributes: {
                    'accept': 'image/*,',
                    'aria-label': 'Upload partner icon'
                }
            },
            {
                title: 'Please Enter Partner Description',
                input: 'textarea',
                inputValue: item.description,
                inputValidator: (v) => !!v ? '' : 'Please enter valid description'
            }
        ]).then(async ({value}) => {
            if (value) {
                try {
                    var edit_data;
                    var key;            
                    if (value[1]) {
                        // BEGIN: upload partner icon to AWS S3
                        const file: File = value[1];
                        if (file.size > 50 * 1000 * 1000) {
                            throw Error('File is too big');
                        }

                        if (!(/^image\//.test(file.type))) {
                            throw Error('Invalid file type.');
                        }


                        key = uuid();
                        key = `${key}.${_.last(_.split(file.name, '.'))}`;

                        const res = await this.data.presignS3File(key, file.type).toPromise();

                        if (!res || !res.AWSurl || !res.AWSurl_ch) {
                            throw Error('Something went wrong.');
                        }
                        // upload to US S3
                        await this.data.uploadS3File(res.AWSurl, file).toPromise();
                        // Upload to China S3
                        await this.data.uploadS3File(res.AWSurl_ch, file).toPromise();
                        // END:
                        edit_data = {
                            name: value[0],
                            icon: key,
                            description: value[2]
                        }
                    } else {
                        edit_data = {
                            name: value[0],
                            icon: "",
                            description: value[2]
                        }
                    }

                    await this.data.editPartners(item._id, edit_data).toPromise();
                    this.is_first_load = 1;
                    this.getData(1);
                } catch ({message}) {
                    swal.fire('Oops', message, 'error');
                }
            }
        })
    }
}
