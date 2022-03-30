import { ActivatedRoute } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  selector: 'app-alipay',
  templateUrl: './alipay.component.html',
  styleUrls: ['./alipay.component.sass']
})
export class AlipayComponent {

  constructor(
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe((q) => {
      if(q.client_secret && q.source){
        window.close();
      }
    })
   }
}
