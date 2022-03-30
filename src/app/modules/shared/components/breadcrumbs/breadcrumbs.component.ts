import { BreadCrumb } from './../../../../interfaces/main';
import { Component, Input, OnChanges } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent implements OnChanges {


  @Input('breadcrumbs') breadcrumbs: BreadCrumb[];

  constructor(
    private router: Router
  ) { }

  ngOnChanges() {
  }

  navigate(route){
    this.router.navigate(route);
  }

}
