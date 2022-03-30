import {Bundle, Lesson} from '../../../../../../interfaces/course';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bundle-single-sidebar',
  templateUrl: './bundle-sidebar.component.html',
  styleUrls: ['./bundle-sidebar.component.scss']
})
export class BundleSidebarComponent {

  @Input('bundle') bundle: Bundle;
  @Input('showSections') showSections: boolean = true;
  constructor(
    private router: Router
) {
}
  navigate(url){
    this.router.navigate([url]);
  }
}
