import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { take, tap } from 'rxjs/operators';

import { UserRole } from '../models/user.model';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const requiredRoles = (route.data['roles'] as UserRole[]) ?? [];
    if (!requiredRoles.length) {
      return of(true);
    }

    return this.auth.hasRole(requiredRoles).pipe(
      take(1),
      tap((allowed) => {
        if (!allowed) {
          this.router.navigate(['/dashboard']);
        }
      })
    );
  }
}
