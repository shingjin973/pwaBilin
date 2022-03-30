import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({
  name: 'materialtype'
})
export class MaterialtypePipe implements PipeTransform {
  transform(value: any, args?: any): any {

    value = _.toUpper(_.last(_.split(value, '.')));

    if(value.length >= 4){
      value = 'LINK';
    }

    if(value === 'PDF'){
      return 'far fa-file-pdf';
    }else if(value === 'ZIP'){
      return 'far fa-file-archive';
    }else if(value === 'DOC' || value === 'DOCX'){
      return 'far fa-file-word';
    }else if(value === 'PPT' || value === 'PPTX'){
      return 'far fa-file-powerpoint';
    }else if(value === 'JPG' || value === 'PNG' || value === 'JPEG' || value === 'GIF'){
      return 'far fa-file-image';
    }else if(value === 'LINK'){
      return 'fas fa-external-link-alt';
    }

    return 'far fa-file';
  }
}
