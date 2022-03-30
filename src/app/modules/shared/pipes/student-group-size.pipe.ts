import { Pipe, PipeTransform } from '@angular/core';
import { StudentGroupSize } from '../../../interfaces/user';

@Pipe({
  name: 'studentGroupSize'
})
export class StudentGroupSizePipe implements PipeTransform {

  transform(value: StudentGroupSize, titles = false): any {
    if(titles){
      switch(value){
        case StudentGroupSize.Private: return 'Private';
        case StudentGroupSize.Group: return 'Group';
        default: return '';
      }
    }else{
      switch(value){
        case StudentGroupSize.Private: return '1';
        case StudentGroupSize.Group: return '>=2';
        default: return '';
      }
    }
  }

}
