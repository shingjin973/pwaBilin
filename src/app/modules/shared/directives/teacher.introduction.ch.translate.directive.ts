import { Directive, Input, OnInit, ElementRef } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Directive({
  selector: '[teacherIntroductionTranslate]'
})
export class TeacherIntroductionChTranslateDirective implements OnInit {
  @Input('teacherIntroductionTranslate') content: any;

  constructor(private el: ElementRef){}

  ngOnInit(){
    if(environment.locale === 'zh' && this.content){
      this.el.nativeElement.innerText = String.prototype.slice.apply(this.content, [0, 52]) + '...';
    }
  }
}
