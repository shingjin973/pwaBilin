import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
import { environment } from '../../../../environments/environment';

@Pipe({
  name: 's3Storage'
})
export class S3StoragePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if(_.startsWith(value, 'http')){
      return value;
    }
    let hostName = location.origin;
    const cnFrontHostName = "https://www.bilinacademy.cn";
    if (hostName == cnFrontHostName){
      return `https://bilinstudio-assets.s3.cn-north-1.amazonaws.com.cn/${value}`;

    } else{
      return `https://bilinstudio-assets.s3.us-east-2.amazonaws.com/${value}`;
    }    
  }
}
