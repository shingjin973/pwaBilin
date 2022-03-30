import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'creditsPrice'
})
export class CreditsPricePipe implements PipeTransform {

  transform(value: any, word?: any): any {
    if(parseInt(value) === 0){
      return 'FREE';
    }

    return word ? `${value} ${word}` : value;
  }
}
