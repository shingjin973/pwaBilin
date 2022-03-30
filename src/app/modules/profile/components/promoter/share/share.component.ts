
import { BreadCrumb } from './../../../../../interfaces/main';
import { UserType, Teacher, Student } from './../../../../../interfaces/user';
import { AuthService } from './../../../../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import QrCodeWithLogo from "qrcode-with-logos";

declare var $: any;

@Component({
    selector: 'app-share',
    templateUrl: './share.component.html',
    styleUrls: ['./share.component.scss']
})
export class ShareComponent implements OnInit {
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
    isLoading = false;
    us_link: string;
    china_link: string;
    buttton_style = 'copy-button';
    copy_text = "Copy Referral Link US";
    copy_Cntext = "Copy Referral Link CN"
    constructor(
        private auth: AuthService,
        private router: Router
    ) {
    }
    async ngOnInit() {
        this.user = await this.auth.getUser();
        this.us_link = "https://bilin.academy/en/authentication/signup?promoterId=" + this.user.promoter_id;
        this.china_link = "https://www.bilinacademy.cn/ch/authentication/signup?promoterId=" + this.user.promoter_id;
        this.isLoading = true;
        let qrcode_us = new QrCodeWithLogo({
            content: this.us_link,
            width: 300,
            image: document.getElementById("us_image") as HTMLImageElement,
            logo: {
                src: "assets/img/logo.png"
            },
            nodeQrCodeOptions: {
                margin: 2
            },
        });
        qrcode_us.toImage();
        let qrcode_cn = new QrCodeWithLogo({
            content: this.us_link,
            width: 300,
            image: document.getElementById("cn_image") as HTMLImageElement,
            logo: {
                src: "assets/img/logo.png"
            },
            nodeQrCodeOptions: {
                margin: 2
            },
        });
        qrcode_cn.toImage();
    }
    navigate(url) {
        this.router.navigate([url]);
    }
    async copy_us() {
        navigator.clipboard.writeText(this.us_link);
        this.buttton_style = 'copied';
        this.copy_text = "Copied!"
    }
    async copy_cn() {
        navigator.clipboard.writeText(this.china_link);
        this.buttton_style = 'copied';
        this.copy_Cntext = "Copied!"
    }
}
