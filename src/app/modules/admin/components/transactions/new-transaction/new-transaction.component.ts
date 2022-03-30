import { DataService } from './../../../../../services/data.service';
import { AuthService } from './../../../../../services/auth.service';
import { User } from './../../../../../interfaces/user';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject, Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import * as _ from 'lodash';
import { TransactionType } from 'src/app/interfaces/transactions';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-transaction',
  templateUrl: './new-transaction.component.html',
  styleUrls: ['./new-transaction.component.scss']
})
export class NewTransactionComponent implements OnInit {

  form: FormGroup;

  debitUsersForm = new FormControl('', [Validators.required]);
  creditUsersForm = new FormControl('', [Validators.required]);

  debitUsersSearch = new Subject<string>();
  creditUsersSearch = new Subject<string>();

  debitUsers$: Observable<User[]>;
  creditUsers$: Observable<User[]>;

  constructor(
    private toastr: ToastrService,
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService,
    private data: DataService
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      debit_user: new FormControl('', [Validators.required]),
      debit_type: new FormControl('', [Validators.required]),
      debit_amount: new FormControl('', [Validators.required, Validators.min(1), Validators.max(10000)]),
      credit_user: new FormControl('', [Validators.required]),
      notes: new FormControl('', [Validators.required])
    })

    this.debitUsers$ = this.debitUsersSearch.pipe(
      switchMap((q, i) => {
        if(q === '_'){
          return of([{_id: '0', name: 'System', auto_id: 0}] as User[]);
        }

        return this.data.getUsers({q: q}).pipe(map(res => res && res.data ? res.data : []));
      })
    )

    this.debitUsersForm.valueChanges.subscribe((v) => {
      if(!v){
        return;
      }

      this.debitUsersSearch.next(v)
    });

    this.creditUsers$ = this.creditUsersSearch.pipe(
      switchMap((q, i) => {
        if(q === '_'){
          return of([{_id: '0', name: 'System', auto_id: 0}] as User[]);
        }

        return this.data.getUsers({q: q}).pipe(map(res => res && res.data ? res.data : []));
      })
    )

    this.creditUsersForm.valueChanges.subscribe((v) => {
      if(!v){
        return;
      }

      this.creditUsersSearch.next(v);
    });
  }

  async submit(){
    try{
      if(this.form.invalid){
        throw Error('The form is invalid.');
      }

      const {value: data} = this.form;

      const user = await this.auth.getUser();

      data.debit_type = parseInt(data.debit_type);
      data.debit_amount = parseInt(data.debit_amount);
      data.debit_user = data.debit_user._id === '0' ? 0 : data.debit_user._id;
      data.credit_type = parseInt(data.debit_type);
      data.credit_amount = parseInt(data.debit_amount);
      data.credit_user = data.credit_user._id === '0' ? 0 : data.credit_user._id;
      data.type = TransactionType.AdminModification;
      data.notes = `Admin modification (#${user.auto_id}) | ${data.notes}`;

      this.data.addTransaction(data).subscribe((res) => {
        if(res){
          this.router.navigate(['/admin/transactions']);
        }
      })

    }catch(e){
      this.toastr.error(e.message);
    }
  }

}
