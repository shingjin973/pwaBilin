import { BreadCrumb } from './../../../../../interfaces/main';
import { UserType, Teacher, Student } from './../../../../../interfaces/user';
import { AuthService } from './../../../../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';

declare var $: any;

@Component({
    selector: 'app-transaction',
    templateUrl: './transaction.component.html',
    styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit {
    breadcrumbs: BreadCrumb[] = [{
        link: 'My Account',
        url: ['/profile']
    },
    {
        link: 'Promoter',
        url: ['/profile/promoter']
    },]
    UserType = UserType;
    user: Student | Teacher;
    myPromoterUsers:{username: string, totalamount: number} [];
    promoterRate = 0;
    totalCommissions = 0;
    paidCommision = 0 ;
    constructor(
        private auth: AuthService,
        private router: Router,
        private data: DataService,
    ) {
    }
    async ngOnInit() {        
        this.user = await this.auth.getUser();
        let promoterID = this.user.promoter_id;
        this.promoterRate = this.user.promotorRate;
        await this.data.getMypromoterUsers(promoterID).subscribe((res) => {
            if (res && res.data) {                    
                this.myPromoterUsers = [];            
                res.data.forEach((element) => {  
                    if (element.enrollments.state == 1 || element.enrollments.state == 2 ) { 
                        let data = {
                            username:element.name,
                            date:element.enrollments.date,
                            totalamount:element.enrollments.realPay
                        }  
                        this.totalCommissions =  this.totalCommissions + element.enrollments.realPay
                        this.myPromoterUsers.push(data) 
                    }
                    if(element.bundleenrollments.state){
                        if (element.bundleenrollments.state == 1 || element.bundleenrollments.state == 2 ) {
                            let data = {
                                username:element.name,
                                date:element.bundleenrollments.date,
                                totalamount:element.bundleenrollments.realPay
                            }  
                            this.totalCommissions =  this.totalCommissions + element.bundleenrollments.realPay
                            this.myPromoterUsers.push(data)                     
                        }
                    }                
                });       
            }
        });
        await this.data.getPaidCommission(this.user._id).subscribe((res) => {
            if (res && res.data) {   
                res.data.forEach((element) => {
                    this.paidCommision = this.paidCommision +element.amount
                })
            }
        });
    }
    navigate(url) {
        this.router.navigate([url]);
    }
}
