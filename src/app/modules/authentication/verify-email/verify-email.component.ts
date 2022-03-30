import { DataService } from 'src/app/services/data.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.sass']
})
export class VerifyEmailComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private data: DataService,
    private auth: AuthService

  ) {
    auth.isAuthenticated();
   }

  async ngOnInit() {
    try{
      const {q: code} = this.route.snapshot.queryParams;

      if(!code){
        this.router.navigateByUrl('/');
        return;
      }

      await this.data.verifyEmail({code}).toPromise();

      this.toastr.success('Your email has been successfully verified.');
      this.router.navigate(['/profile']);

    }catch({message}){
      this.toastr.error(message);
      this.router.navigateByUrl('/');      
    }
  }

}
