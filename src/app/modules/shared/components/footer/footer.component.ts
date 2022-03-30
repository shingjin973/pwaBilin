import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  locale = environment.locale;

  @Input('social') social: any = {};

  constructor(private router: Router) { }

  ngOnInit() {
  }

  navigate(url){
    this.router.navigate([url]);
  }
}
