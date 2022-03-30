import { TeacherStatus } from '../../../interfaces/user';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'teacherstatus'
})
export class TeacherstatusPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    switch(value){
      case TeacherStatus.Bronze: return 'Bronze';
      case TeacherStatus.Silver: return 'Silver';
      case TeacherStatus.Gold: return 'Gold';
      default: return 'Bronze';
    }
  }

}
