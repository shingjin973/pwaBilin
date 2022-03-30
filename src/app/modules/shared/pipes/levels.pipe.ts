import { Pipe, PipeTransform } from '@angular/core';
import { Levels } from '../../../interfaces/enums';
import { environment } from '../../../../environments/environment';
@Pipe({
  name: 'levels'
})
export class LevelsPipe implements PipeTransform {

  transform(value: Levels, args?: any): any {
    switch(value){
      case Levels.Beginner: 
        if(environment.locale === 'zh'){
          return '初级';
        }
        else{
          return 'Beginner';
        }
      case Levels.Intermediate: 
        if(environment.locale === 'zh'){
          return '中级';
        }
        else{
          return 'Intermediate';
        }
      case Levels.Advanced: 
        if(environment.locale === 'zh'){
          return '高级';
        }
        else{
          return 'Advanced';
        }
      default: return '';
    }
  }

}
