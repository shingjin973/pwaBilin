import { Directive, Input, OnInit, ElementRef } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Directive({
  selector: '[appTranslate]'
})
export class TranslateDirective implements OnInit {
  @Input('appTranslate') content: any;

  constructor(private el: ElementRef){}

  ngOnInit(){
    if(environment.locale === 'zh' && this.content){
      this.el.nativeElement.innerText = this.content;
    }
  }
}
