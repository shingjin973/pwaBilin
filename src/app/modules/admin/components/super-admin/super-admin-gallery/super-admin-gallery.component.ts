import { DataService } from './../../../../../services/data.service';
import swal from 'sweetalert2';
import { GalleryItem } from './../../../../../interfaces/settings';
import { Lightbox } from 'ngx-lightbox';
import { Drawing } from './../../../../../interfaces/course';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import * as _ from 'lodash';
import * as uuid from 'uuid/v1';

declare var $: any;

@Component({
  selector: 'app-super-admin-gallery',
  templateUrl: './super-admin-gallery.component.html',
  styleUrls: ['./super-admin-gallery.component.scss']
})
export class SuperAdminGalleryComponent implements OnInit {

  images: Drawing[];

  currentPage = 1;
  totalItemsPerPage = 20;

  isLoadingDrawings = false;

  constructor(
    private toastr: ToastrService,
    private _lightbox: Lightbox,
    private data: DataService
  ) { }

  ngOnInit() {
    this.getData();
  }

  getData(){
    this.data.getSettings('configs').subscribe((res) => {
      if(res && res.data){
        this.images = res.data.images;
      }
    })
  }

  async delete(src){
    const images = _.filter(Array.prototype.slice.call(this.images), i => i.src !== src);

    this.data.updateSettings('configs', {
      images: images
    }).subscribe((res) => {
      if(res){
        this.getData();
      }
    })
  }

  open(src: string){
    this._lightbox.open([{src: src, thumb: src}]);
  }

  upload(){
    try{
      swal.fire({
        title: 'Select drawing',
        input: 'file',
        inputAttributes: {
          'accept': 'image/*',
          'aria-label': 'Upload your file'
        },
        confirmButtonText: 'Next &rarr;',
        showCancelButton: true,
      }).then(async({value}) => {
        try{
          this.isLoadingDrawings = true;

          if (value) {
            const fileData: GalleryItem = {};

            const file: File = value;

            if(file.size > 10 * 1000 * 1000){
              throw Error('File is too big');
            }

            const fileBase64 = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(file);
            }) as string;

            const optimizedPicture = await swal.fire({
              title: 'Optimize your picture',
              input: 'select',
              inputPlaceholder: 'Rotate image',
              inputOptions: {
                '90': 'Rotate 90deg',
                '-90': 'Rotate -90deg'
              },
              imageUrl: fileBase64,
              imageAlt: '',
              showCancelButton: true,
              confirmButtonText: 'Upload',
              onBeforeOpen: (dom) => {
                $(dom).find('.swal2-select').change((e) => {
                  e.preventDefault();

                  const rotateImage = (base64, isClockwise) => {
                    const offScreenCanvas = document.createElement('canvas');
                    const offScreenCanvasCtx = offScreenCanvas.getContext('2d');

                    var img = new Image();
                    img.src = base64;

                    offScreenCanvas.height = img.width;
                    offScreenCanvas.width = img.height;

                    if (isClockwise) {
                      offScreenCanvasCtx.rotate(90 * Math.PI / 180);
                      offScreenCanvasCtx.translate(0, -offScreenCanvas.width);
                    } else {
                      offScreenCanvasCtx.rotate(-90 * Math.PI / 180);
                      offScreenCanvasCtx.translate(-offScreenCanvas.height, 0);
                    }

                    offScreenCanvasCtx.drawImage(img, 0, 0);

                    return offScreenCanvas.toDataURL('image/jpeg', 100);
                  }

                  const newBase64 = rotateImage($(dom).find('.swal2-image').attr('src'), e.target.value === '90' ? true : false);

                  $(dom).find('.swal2-image').attr('src', newBase64);
                  $(dom).find('.swal2-select').val('');
                })
              },
              preConfirm: () => new Promise((resolve) => resolve($('.swal2-image').attr('src')))
            });

            if(optimizedPicture.dismiss){
              return;
            }

            const newFile = ((dataURI) => {
              var byteString = atob(dataURI.split(',')[1]);
              var ab = new ArrayBuffer(byteString.length);
              var ia = new Uint8Array(ab);
              for (var i = 0; i < byteString.length; i++) {
                  ia[i] = byteString.charCodeAt(i);
              }
              return new File([ab], file.name, { type: file.type });
            })(optimizedPicture.value);

            const key = `${uuid()}.${_.last(_.split(newFile.name, '.'))}`;

            const res = await this.data.presignS3File(key, newFile.type).toPromise();

            if(!res || !res.AWSurl || !res.AWSurl_ch){
              throw Error('Something went wrong.');
            }

            await this.data.uploadS3File(res.AWSurl, file).toPromise();
            await this.data.uploadS3File(res.AWSurl_ch, file).toPromise();

            fileData.src = key;
            fileData.date = new Date();

            const images = Array.prototype.slice.call(this.images);

            images.push(fileData);

            this.data.updateSettings('configs', {
              images: images
            }).subscribe((res) => {
              if(res){
                this.getData();
              }
            })
          }
        }catch({message}){
          this.toastr.error(message);
        }finally{
          this.isLoadingDrawings = false;
        }
      })

    }catch({message}){
      this.toastr.error(message);
    }
  }
}
