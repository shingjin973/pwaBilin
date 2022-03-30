import { DataService } from 'src/app/services/data.service';
import { BreadCrumb } from './../../../../interfaces/main';
import { Lightbox } from 'ngx-lightbox';
import { Component, OnInit } from '@angular/core';

import * as _ from 'lodash';
import { S3StoragePipe } from '../../../shared/pipes/s3-storage.pipe';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {
  _albums = [];

  breadcrumbs: BreadCrumb[] = [{
    link: 'Home',
    url: ['/']
  },{
    link: 'Gallery'
  }]

  constructor(
    private _lightbox: Lightbox,
    private data: DataService,
    private s3StoragePipe: S3StoragePipe
  ) {}

  ngOnInit() {
    this.data.getSettings('configs').subscribe((res) => {
      if(res && res.data){
        this._albums = _.map(res.data.images, (v, i) => {
          return {
            src: this.s3StoragePipe.transform(v.src),
            image: `Image #${i}`,
            thumb: this.s3StoragePipe.transform(v.src)
          }
        })
      }
    })
  }

  splitToColumns(data: any[], id){
    const res = [];
    for(let i = id - 1; i < data.length; i+=3){
      res.push(data[i]);
    }

    return res;
  }

  open(index: number): void {
    this._lightbox.open(this._albums, index);
  }

}
