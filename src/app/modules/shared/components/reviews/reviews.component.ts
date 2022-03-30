import { DataService } from './../../../../services/data.service';
import { AuthService } from './../../../../services/auth.service';
import { ReviewType } from './../../../../interfaces/enums';
import { User } from './../../../../interfaces/user';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Review } from 'src/app/interfaces/review';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent implements OnChanges {
  @Input('type') type: ReviewType;
  @Input('from') from: User;
  @Input('to') to: string;
  @Input('canLeaveReview') canLeaveReview: boolean;

  @Output() onSubmitReview = new EventEmitter<boolean>();

  showLeaveReview: boolean;

  isSchoolAdmin$: Observable<boolean>;

  reviewForm: FormGroup;
  reviews: Review[];

  averageRating: number;

  managedRatings = {
    '1': 0,
    '2': 0,
    '3': 0,
    '4': 0,
    '5': 0
  }

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private auth: AuthService,
    private data: DataService
  ) {
    this.isSchoolAdmin$ = this.auth.isSchoolAdmin();

    this.showLeaveReview = true;
   }

  ngOnChanges(){
    if(!this.to){
      return;
    }

    this.getData();
  }

  createForm(){
    this.reviewForm = undefined;

    setTimeout(() => {
      this.reviewForm = this.fb.group({
        message: new FormControl('', [Validators.required]),
        stars: new FormControl('', [Validators.required])
      })
    }, 100);
  }

  async getData(){
    this.data.getReviews({to: this.to}).pipe(
      tap((res) => {
        if(res && res.data){
          let rating = 0;

          for(let review of res.data){
            rating += parseInt(review.stars);

            this.managedRatings[review.stars] += 1;
          }

          this.averageRating = rating ? parseFloat((rating / res.data.length).toFixed(2)) : 0;
        }
      })
    ).subscribe((res) => {
      if(res && res.data){
        this.reviews = res.data;

        this.createForm();
      }
    })
  }

  async submitReview(){
    try{
      if(this.reviewForm.invalid){
        throw Error('Review form is invalid.');
      }

      const data = this.reviewForm.value;
      data.from = this.from._id;
      data.from_showname = this.from.name;
      data.to = this.to;
      data.date = new Date();
      data.type = this.type;

      this.data.addReview(data).subscribe((res) => {

        if(res){
          this.onSubmitReview.emit(true);

          this.getData();

          this.createForm();
        }
      })
    }catch(e){
      this.toastr.error(e.message);
    }
  }

  async onReport(id: string){
    try{
      console.log(id);

    }catch({message}){
      this.toastr.error(message);
    }
  }

  async onDelete(id: string){
    await this.data.deleteReview(id).toPromise();

    this.getData();
  }
}
