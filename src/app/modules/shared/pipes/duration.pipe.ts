import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Pipe({
  name: 'duration'
})
export class DurationPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    const duration = +value;
    if(environment.locale === 'zh'){
      if(duration < 60){
        return duration + '分钟';
      }

      if(duration % 60 !== 0){
        return `${Math.floor(duration / 60)} 小时${Math.floor(duration / 60) > 1 ? 's' : ''} ${duration % 60} 分钟`;
      }

      return duration / 60 + ' 小时';
    }
    else{
            if(duration < 60){
            return duration + ' minutes';
          }

          if(duration % 60 !== 0){
            return `${Math.floor(duration / 60)} hour${Math.floor(duration / 60) > 1 ? 's' : ''} ${duration % 60} minutes`;
          }

          return duration / 60 + ' hours';
    }

    
  }
}
