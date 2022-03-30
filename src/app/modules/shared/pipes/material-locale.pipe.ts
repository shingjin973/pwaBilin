import { Pipe, PipeTransform, LOCALE_ID, Inject } from '@angular/core';
import * as _ from 'lodash';

@Pipe({
  name: 'materialLocale'
})
export class MaterialLocalePipe implements PipeTransform {
  constructor(
    @Inject(LOCALE_ID) public locale: string
  ){}

  transform(value: any, args?: any): any {
    if(
      _.startsWith(value, 'http://') ||
      _.startsWith(value, 'https://') ||
      _.startsWith(value, '//')
    ){
      return value;
    }

    if(this.locale === 'en-US'){
      return `https://bilinstudio-assets.s3.us-east-2.amazonaws.com/${value}`;
    }

    if(this.locale === 'zh-Hans'){
      return `https://bilinstudio-assets-ap.s3.ap-east-1.amazonaws.com/${value}`;
    }

    return value;
  }

}
