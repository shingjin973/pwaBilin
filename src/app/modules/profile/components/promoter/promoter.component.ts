import {DataService} from 'src/app/services/data.service';
import {BreadCrumb} from './../../../../interfaces/main';
import {UserType, Teacher, Student} from './../../../../interfaces/user';
import {AuthService} from './../../../../services/auth.service';
import {FormControl, Validators, FormBuilder, FormGroup} from '@angular/forms';
import {Component, OnInit} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {Router} from '@angular/router';
import swal from 'sweetalert2';

declare var $: any;

@Component({
    selector: 'app-promoter',
    templateUrl: './promoter.component.html',
    styleUrls: ['./promoter.component.scss']
})
export class PromoterComponent implements OnInit {
    UserType = UserType;
    user: Student | Teacher;
    isLoading = false;  
    constructor(     
        private auth: AuthService,
        private router: Router
    ) {
    }
    async ngOnInit() {
        this.user = await this.auth.getUser();    
        this.isLoading = true;    
    } 
    navigate(url) {
        this.router.navigate([url]);
    }
}
