import { AuthService } from './../services/auth.service';
import { tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router
  ){}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return this.auth.isStudent().pipe(
      tap(v => {
        if(!v){
          this.router.navigate(['/'])
        }
      })
    );
  }

}
