import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss']
})
export class ActionsComponent {
  @Input('showReport') showReport: boolean = false;
  @Input('showDelete') showDelete: boolean = false;

  @Output() onReport = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();

  fireReport(){
    this.onReport.emit();
  }

  fireDelete(){
    this.onDelete.emit();
  }
}
