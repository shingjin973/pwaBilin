import {DataService} from 'src/app/services/data.service';
import {Material} from './../../../../interfaces/course';
import {Component, OnInit} from '@angular/core';
import * as urlValidator from 'validator/lib/isURL';
import swal from 'sweetalert2';
import * as uuid from 'uuid/v1';
import * as _ from 'lodash';
import {ToastrService} from 'ngx-toastr';
import {MatDialog} from '@angular/material';
import {SearchComponent} from '../../../shared/components/search/search.component';

enum Fields {
    Description = 'Description'
}

@Component({
    selector: 'app-materials',
    templateUrl: './materials.component.html',
    styleUrls: ['./materials.component.scss']
})
export class MaterialsComponent implements OnInit {
    currentFilter = {
        field: "",
        value: ""
    };
    _materials: Material[];
    materials: Material[];
    isLoadingMaterials = false;

    currentPage = 1;
    totalItemsPerPage = 20;
    pager = {
        currentPage: 1,
        totalPages: 0,
        pages: [],
        totals: 0
    };
    pagination_pages = [];
    has_previous_five_page = false;
    has_next_five_page = false;
    is_first_load = 1;

    constructor(
        private data: DataService,
        private toastr: ToastrService,
        private dialog: MatDialog
    ) {
    }

    ngOnInit() {
        this.getData(1);
    }

    async uploadMaterial(type) {
        try {
            let material;

            if (type === 'file') {
                material = await new Promise((resolve, reject) => {
                    swal.mixin({
                        confirmButtonText: 'Next &rarr;',
                        showCancelButton: true,
                        progressSteps: ['1', '2'],
                    }).queue([
                        {
                            title: 'Select file',
                            input: 'file',
                            inputAttributes: {
                                'accept': 'application/msword, application/vnd.ms-powerpoint, application/pdf, image/*, application/zip, application/octet-stream, audio/*',
                                'aria-label': 'Upload your file'
                            }
                        },
                        {
                            title: 'Enter file description',
                            input: 'text',
                            inputValidator: (v) => !!v ? '' : 'Please enter valid description',
                        }
                    ]).then(async ({value}) => {
                        if (value && value.length === 2) {
                            try {
                                this.isLoadingMaterials = true;

                                const fileData: Material = {};

                                const file: File = value[0];

                                fileData.description = value[1];
                                fileData.shareable = value[2] === 'true' ? true : false;

                                if (file.size > 50 * 1000 * 1000) {
                                    throw Error('File is too big');
                                }

                                if (!(
                                    file.type === 'application/pdf' ||
                                    file.type === 'application/msword' ||
                                    file.type === 'application/vnd.ms-powerpoint' ||
                                    file.type === 'application/zip' ||
                                    file.type === 'application/octet-stream' ||
                                    /^image\//.test(file.type) ||
                                    /^audio\//.test(file.type)
                                )) {
                                    throw Error('Invalid file type.');
                                }


                                let key = uuid();
                                key = `${key}.${_.last(_.split(file.name, '.'))}`;

                                const res = await this.data.presignS3File(key, file.type).toPromise();

                                if (!res || !res.AWSurl || !res.AWSurl_ch) {
                                    throw Error('Something went wrong.');
                                }

                                await this.data.uploadS3File(res.AWSurl, file).toPromise();
                                await this.data.uploadS3File(res.AWSurl_ch, file).toPromise();

                                fileData.url = key;

                                resolve(fileData);

                            } catch (e) {
                                reject(e);
                            }
                        }
                    })
                })
            } else if (type === 'url') {
                material = await new Promise((resolve, reject) => {
                    swal.mixin({
                        confirmButtonText: 'Next &rarr;',
                        showCancelButton: true,
                        progressSteps: ['1', '2']
                    }).queue([
                        {
                            title: 'Enter url',
                            input: 'url',
                            inputValidator: (v) => !!v && urlValidator(v, {protocols: ['https']}) ? '' : 'Please enter valid URL'
                        },
                        {
                            title: 'Enter file description',
                            input: 'text',
                            inputValidator: (v) => !!v ? '' : 'This field cannot be empty.'
                        }
                    ]).then(({value}) => {
                        if (value) {
                            return resolve({
                                url: value[0],
                                description: value[1]
                            })
                        }
                    })
                });
            }
            await this.data.addMaterial(material).toPromise();
            this.is_first_load = 1;

            this.getData(1);
        } catch ({message}) {
            this.toastr.error(message);
        } finally {
            this.isLoadingMaterials = false;
        }
    }

    getData(page, search_key = this.currentFilter) {
        this.currentPage = page;

        this.data.getMaterialsByPaginate(this.is_first_load, page, search_key).subscribe((res) => {
            if (res && res.data) {
                this._materials = res.data;
                this.materials = this._materials;
                if (this.is_first_load === 1) {
                    this.pager = res.pager;
                    this.is_first_load = 0;
                }
                this.makePages(page, this.pager);
                // this.filterMaterials();
            }
        })
    }
    makePages(page, pager) {
        var pages = [];
        var start_page = 1;
        var end_page = 5;

        if (parseInt(page) >= 3) {
            start_page = parseInt(page) - 2;
            // BEGIN: calculate end_page
            if ((parseInt(page) + 2) <= parseInt(pager.pages[pager.pages.length-1])) {
                end_page = parseInt(page) + 2;
                this.has_next_five_page = true;
            } else {
                end_page = pager.pages[pager.pages.length-1];
                this.has_next_five_page = false;
            }
            // END:
        } else {
            if ( parseInt(pager.pages[pager.pages.length-1]) <= 5) {
                end_page = parseInt(pager.pages[pager.pages.length-1]);
                this.has_next_five_page = false;
            } else {
                end_page = 5;
                this.has_next_five_page = true;
            }
        }
        if (start_page > 1){
            this.has_previous_five_page = true;
        } else {
            this.has_previous_five_page = false;
        }
        for (let i = start_page; i <= end_page; i++) {
            pages.push(i);
        }
        this.pagination_pages = pages;
    }

    clearSearch() {
        this.currentFilter = {
            field: "",
            value: ""
        };
        this.is_first_load = 1;

        this.getData(1, this.currentFilter);
    }
    async delete(id) {
        await this.data.deleteMaterial(id).toPromise();
        this.is_first_load = 1;

        this.getData(1);
    }

    search() {
        const ref = this.dialog.open(SearchComponent, {
            width: '600px',
            data: [
                {
                    key: Fields.Description,
                    value: 'Material Description'
                }
            ]
        })

        ref.beforeClose().subscribe((filter) => {
            if (filter) {
                this.currentFilter = filter;
                this.is_first_load = 1;

                this.getData(1, filter);

                // this.filterMaterials(filter);
            }
        })
    }

    filterMaterials(filter?: any) {
        this.currentFilter = filter;

        if (!filter) {
            this.materials = this._materials;
            return;
        }

        const {field, value} = filter;

        switch (field) {
            case Fields.Description: {
                this.materials = _.filter(this._materials, (v: Material) => new RegExp(value, 'i').test(v.description));
                return;
            }
        }
    }
}
