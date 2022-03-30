import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, Inject } from '@angular/core';

@Component({
  templateUrl: './search.component.html'
})
export class SearchComponent {
  form: FormGroup;
  fields: any[];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SearchComponent>,
    @Inject(MAT_DIALOG_DATA) data
  ){
    this.fields = data;

    this.form = this.fb.group({
      field: ['', Validators.required],
      value: ['', Validators.required]
    })
  }

  submit(){
    if(this.form.invalid){
      return;
    }

    this.dialogRef.close(this.form.value);
  }
}
