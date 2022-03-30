import {DataService} from 'src/app/services/data.service';
import {Component, Output, Input, OnChanges, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import {FileSystemFileEntry, UploadEvent} from 'ngx-file-drop';

import * as _ from 'lodash';
import * as uuid from 'uuid/v1';

@Component({
    selector: 'app-file-upload',
    templateUrl: './file-upload.component.html',
    styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnChanges {

    @Output() onFinish = new EventEmitter();
    @Input('file') filePath: string;

    uploader: any;
    file: string;
    isLoading = false;

    constructor(
        private data: DataService
    ) {
    }

    ngOnChanges() {
        this.file = this.filePath;
    }

    public dropped(event: UploadEvent) {
        try {
            const droppedFile = event.files[0];

            if (!droppedFile || !droppedFile.fileEntry.isFile) {
                return;
            }

            const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;

            fileEntry.file(async (file: File) => {
                if (_.startsWith(file.type, 'image')) {
                    let key = uuid();

                    key = `${key}.${_.last(_.split(file.name, '.'))}`;

                    const res = await this.data.presignS3File(key, file.type).toPromise();

                    if (!res || !res.AWSurl || !res.AWSurl_ch) {
                        throw Error('Something went wrong.');
                    }

                    await this.data.uploadS3File(res.AWSurl, file).toPromise();
                    await this.data.uploadS3File(res.AWSurl_ch, file).toPromise();

                    this.onFinish.emit(key);
                }
            });

        } catch ({message}) {
            console.log(message);
        }
    }

    public delete() {
        this.file = undefined;

        this.onFinish.emit('');
    }
}
