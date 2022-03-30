import {DataService, HttpMethod} from 'src/app/services/data.service';
import {BreadCrumb} from './../../../../../interfaces/main';
import {AuthService} from './../../../../../services/auth.service';
import {Student} from './../../../../../interfaces/user';
import {Session} from 'src/app/interfaces/course';
import {Lesson, Material, Drawing} from './../../../../../interfaces/course';
import {ToastrService} from 'ngx-toastr';
import {ActivatedRoute, Router} from '@angular/router';
import {Component, OnInit} from '@angular/core';
import * as _ from 'lodash';
import {Observable, BehaviorSubject} from 'rxjs';
import {DatePipe} from '@angular/common';
import swal from 'sweetalert2';
import * as uuid from 'uuid/v1';
import * as urlValidator from 'validator/lib/isURL'
import {map} from 'rxjs/operators';
import {HttpClient} from "@angular/common/http";

@Component({
    selector: 'app-single-session',
    templateUrl: './session.component.html',
    styleUrls: ['./session.component.scss']
})

export class SingleCourseSessionComponent implements OnInit {
    isSchoolAdmin$: Observable<any>;
    isTeacher = false;

    isLoadingMaterials = false;
    isLoadingDrawings = false;

    lesson: Lesson;

    currentSession: Session;

    user: Student;

    materials: Material[];
    drawings: Drawing[];

    activeDrawing: Drawing;

    activeDrawing$ = new BehaviorSubject(null);

    breadcrumbs: BreadCrumb[] = [{
        link: 'Home',
        url: ['/']
    }, {
        link: 'Courses',
        url: ['/courses']
    }];

    constructor(
        private route: ActivatedRoute,
        private data: DataService,
        private router: Router,
        private toastr: ToastrService,
        private auth: AuthService,
        private datePipe: DatePipe,
        private http: HttpClient,
    ) {
    }

    ngOnInit() {

        this.isSchoolAdmin$ = this.auth.isSchoolAdmin();

        this.route.params.subscribe(async (p) => {
            if (p.courseid && p.lessonid && p.sessionid) {
                this.getData(p.courseid, p.lessonid, p.sessionid);
                this.user = await this.auth.getUser() as Student;

                this.activeDrawing$.subscribe(async (v) => {
                    if (!v) {
                        return;
                    }

                    this.activeDrawing = v;
                });
            } else {
                this.router.navigate(['/courses']);
            }
        })
    }

    getData(courseid: string, lessonid: string, sessionid: string) {
        this.data.getLesson(courseid, lessonid).subscribe((res) => {
            if (res && res.data) {
                this.lesson = res.data;

                const currentSession: Session = _.find(this.lesson.sessions, {_id: sessionid});

                if (!currentSession) {
                    this.router.navigate(['/courses']);
                }

                this.currentSession = currentSession;
                this.isTeacher = this.user && this.lesson.teacher_id === this.user._id;

                this.breadcrumbs.length = 2;
                this.breadcrumbs.push({
                    link: this.lesson.course.topic,
                    url: ['/courses', this.lesson.course_id, 'lesson', this.lesson._id]
                })
                this.breadcrumbs.push({
                    link: `Session (${this.datePipe.transform(currentSession.startTime, 'shortDate')})`
                })

                this.getMaterials();
                this.getDrawings();
            }
        })
    }

    getMaterials() {
        this.data.getLessonSessionMaterials(this.lesson.course_id, this.lesson._id, this.currentSession._id).subscribe((res) => {
            if (res && res.data) {
                this.materials = _.map(res.data, v => {
                    v.extension = _.toUpper(_.last(_.split(v.url, '.')));

                    if (v.extension.length >= 4) {
                        v.extension = 'LINK'
                    }

                    if (!(
                        _.startsWith(v.url, 'http://') ||
                        _.startsWith(v.url, 'https://') ||
                        _.startsWith(v.url, '//')
                    )) {
                        v.external = true;
                    }

                    return v;
                })

                this.currentSession.materials = _.map(this.materials, v => v._id) as any;
            }
        })
    }

    async uploadMaterials(type) {
        try {
            let material: Material;

            if (type === 'file') {
                material = await new Promise((resolve, reject) => {
                    swal.mixin({
                        confirmButtonText: 'Next &rarr;',
                        showCancelButton: true,
                        progressSteps: ['1', '2', '3'],
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
                        },
                        {
                            title: 'Add this material to all sessions?',
                            html: `<div class="form-check">
                  <input type="checkbox" class="form-check-input" id="swal2-input-3">
                  <label class="form-check-label" for="swal2-input-3">Yes, please add this material to all sessions.</label>
                </div>`,
                            confirmButtonText: 'Submit',
                            preConfirm: () => _.toString((<HTMLInputElement>document.querySelector('#swal2-input-3')).checked)
                        }
                    ]).then(async ({value}) => {
                        if (value && value.length === 3) {
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
                                // const res = await this.data.uploadFile('/file-uploader/upload', file, key).toPromise();
                                const res = await this.data.presignS3File(key, file.type).toPromise();
                                if(!res || !res.AWSurl || !res.AWSurl_ch){
                                  throw Error('Something went wrong.');
                                }
                                //
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
                        progressSteps: ['1', '2', '3']
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
                        },
                        {
                            title: 'Add this material to all sessions?',
                            html: `<div class="form-check">
                  <input type="checkbox" class="form-check-input" id="swal2-input-3">
                  <label class="form-check-label" for="swal2-input-3">Yes, please add this material to all sessions.</label>
                </div>`,
                            confirmButtonText: 'Submit',
                            preConfirm: () => _.toString((<HTMLInputElement>document.querySelector('#swal2-input-3')).checked)
                        }
                    ]).then(({value}) => {
                        if (value) {
                            return resolve({
                                url: value[0],
                                description: value[1],
                                shareable: value[2] === 'true' ? true : false
                            })
                        }
                    })
                });
            }

            const isShareable = material.shareable;
            delete material.shareable;

            const {sessions} = await this.data.getLesson(this.lesson.course_id, this.lesson._id).pipe(map(v => v.data)).toPromise();

            const sessionsForMaterials = isShareable ? sessions : [this.currentSession];

            const {_id} = await this.data.addMaterial(material).toPromise();

            for (let session of sessionsForMaterials) {
                const materials = _.concat(session.materials || [], [_id]);

                await this.data.updateLessonSession(this.lesson.course_id, this.lesson._id, session._id, {materials}).toPromise();
            }

            this.getMaterials();

        } catch ({message}) {
            this.toastr.error(message);
        } finally {
            this.isLoadingMaterials = false;
        }
    }

    /**
     * Function that gets all drawings from DB
     */
    getDrawings() {
        this.data.getDrawings({session_id: this.currentSession._id}).subscribe((res) => {
            if (res && res.data) {
                this.drawings = res.data;
                this.activeDrawing$.next(res.data[0]);
            }
        })
    }

    uploadDrawings() {
        try {
            swal.fire({
                title: 'Select drawing',
                input: 'file',
                inputAttributes: {
                    'accept': 'image/*',
                    'aria-label': 'Upload your file'
                },
                confirmButtonText: 'Next &rarr;',
                showCancelButton: true,
                allowOutsideClick: () => !swal.isLoading(),
                showLoaderOnConfirm: true,
                preConfirm: (value) => new Promise(async (resolve) => {
                    try {
                        if (!value) {
                            throw Error('Please select an image.');
                        }

                        const fileData: Drawing = {};

                        const file: File = value;

                        fileData.course_id = this.lesson.course_id;
                        fileData.lesson_id = this.lesson._id;
                        fileData.session_id = this.currentSession._id;

                        if (file.size > 10 * 1000 * 1000) {
                            throw Error('File is too big');
                        }

                        let key = uuid();

                        key = `${key}.${_.last(_.split(file.name, '.'))}`;

                        const res = await this.data.presignS3File(key, file.type, {uploadToChina: true}).toPromise();

                        if (!res || !res.AWSurl || !res.AWSurl_ch) {
                            throw Error('Something went wrong.');
                        }

                        await this.data.uploadS3File(res.AWSurl, file).toPromise();
                        await this.data.uploadS3File(res.AWSurl_ch, file).toPromise();

                        fileData.url = key;
                        fileData.uploaded_by = this.user._id;

                        resolve(fileData);
                    } catch ({message}) {
                        swal.showValidationMessage(message);
                        return resolve();
                    }
                })
            }).then(async ({value}) => {
                try {
                    this.isLoadingDrawings = true;

                    if (value) {
                        this.data.addDrawing(value).subscribe((res) => {
                            if (res) {
                                this.getDrawings();
                            }
                        })
                    }
                } catch ({message}) {
                    this.toastr.error(message);
                } finally {
                    this.isLoadingDrawings = false;
                }
            })

        } catch ({message}) {
            this.toastr.error(message);
        }
    }

    async reportDrawing() {
        try {
            this.toastr.success('The drawing has been successfully reported.');

        } catch ({message}) {
            this.toastr.error(message);
        }
    }

    async deleteDrawing() {
        await this.data.deleteDrawing(this.activeDrawing._id).toPromise();
        this.getDrawings();
    }

    async deleteMaterial(id: string) {
        const {sessions} = await this.data.getLesson(this.lesson.course_id, this.lesson._id).pipe(map(v => v.data)).toPromise();
        const currentSession = _.find(sessions, {_id: this.currentSession._id});

        const materials = _.filter(Array.prototype.slice.call(currentSession.materials || []), v => v !== id);

        await this.data.updateLessonSession(this.lesson.course_id, this.lesson._id, this.currentSession._id, {materials}).toPromise();

        this.getMaterials();
    }
}
