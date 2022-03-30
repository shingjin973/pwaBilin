import { DataService } from 'src/app/services/data.service';
import { AuthService } from './../../../../services/auth.service';
import { Observable } from 'rxjs';
import { DrawingComment } from './../../../../interfaces/course';
import { User } from './../../../../interfaces/user';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnChanges {
  @Input('from') from: User;
  @Input('to') to: string;
  @Input('canLeaveComment') canLeaveComment: boolean = true;

  isSchoolAdmin$: Observable<boolean>;

  @Output() onSubmitComment = new EventEmitter<any>();

  commentForm: FormGroup;
  comments: DrawingComment[];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private data: DataService,
    private auth: AuthService
  ) {

    this.isSchoolAdmin$ = this.auth.isSchoolAdmin();

    this.commentForm = this.fb.group({
      message: new FormControl('')
    })
   }

  ngOnChanges(){
    if(!this.to){
      return;
    }

    this.getData();
  }

  async getData(){
    this.data.getComments(this.to).subscribe((res) => {
      if(res && res.data){
        this.comments = res.data;
      }
    })
  }

  async submitComment(){
    try{
      if(!this.commentForm.get('message').value){
        throw Error('Please enter your comment.');
      }

      this.isLoading = true;

      const data = this.commentForm.value;
      data.from = this.from._id;
      data.name = this.from.name;
      data.to = this.to;

      this.data.addComment(data).subscribe((res) => {
        if(res){
          this.commentForm.get('message').setValue('');
          this.getData();
        }
      })
    }catch(e){
      this.toastr.error(e.message);
    }finally{
      this.isLoading = false;
    }
  }

  async onReport(id: string){
    console.log('report' + id);
  }

  async onDelete(id: string){
    this.data.deleteComment(id).subscribe((res) => {
      if(res){
        this.getData();
      }
    })
  }
}
