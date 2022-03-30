import { Lesson } from 'src/app/interfaces/course';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-course-card',
  templateUrl: './course-card.component.html',
  styleUrls: ['./course-card.component.scss']
})
export class CourseCardComponent {
  @Input('data') lesson: any;

  constructor(
    private router: Router
  ) { }

  navigate(route){
    this.router.navigate(route);
  }
}
