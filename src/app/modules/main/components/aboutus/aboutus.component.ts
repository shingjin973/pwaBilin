import { BreadCrumb } from './../../../../interfaces/main';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-aboutus',
  templateUrl: './aboutus.component.html',
  styleUrls: ['./aboutus.component.scss']
})
export class AboutusComponent implements OnInit {

  breadcrumbs: BreadCrumb[] = [{
    link: 'Home',
    url: ['/']
  },{
    link: 'About us'
  }]

  constructor() { }

  ngOnInit() {
  }

}
