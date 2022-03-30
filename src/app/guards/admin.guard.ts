import { tap, map } from 'rxjs/operators';
import { AuthService } from './../services/auth.service';
import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserType } from 'src/app/interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate, CanActivateChild {
  constructor(
    private auth: AuthService,
    private router: Router
  ){}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return this.auth.getUser2().pipe(
        map(user => user && (user.type === UserType.SchoolAdmin || user.type === UserType.SuperAdmin)),
        tap(v => {
          if(!v){
            this.router.navigate(['/'])
          }
        })
      )
  }
  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return this.auth.getUser2().pipe(
        map(user => user && (user.type === UserType.SchoolAdmin || user.type === UserType.SuperAdmin)),
        tap(v => {
          if(!v){
            this.router.navigate(['/'])
          }
        })
      )
  }

}
