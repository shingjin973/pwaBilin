import { HttpResponse } from './../../../services/data.service';
import { map } from 'rxjs/operators';

const mapResponseToData = map((res: HttpResponse): any => {
  if(res && res.data){
    return res.data;
  }

  return null;
})

const RxJS = {
  mapResponseToData
}

export default RxJS;
