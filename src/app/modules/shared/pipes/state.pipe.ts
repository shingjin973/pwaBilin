import { State } from 'src/app/interfaces/enums';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'state'
})
export class StatePipe implements PipeTransform {

  transform(value: State, args?: any): any {
    switch(value){
      case State.Active:
        return 'Active';
      case State.Canceled:
        return 'Canceled';
      case State.Completed:
        return 'Completed';
      default:
        return 'unknown';
    }
  }

}
