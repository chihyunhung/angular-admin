import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';

import { UserProfile, UserRole } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  roles?: UserRole[];
}

@Component({
  selector: 'app-admin-shell',
  templateUrl: './admin-shell.component.html',
  styleUrls: ['./admin-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminShellComponent {
  readonly user$: Observable<UserProfile | null> = this.auth.userProfile$;

  readonly navItems: NavItem[] = [
    { icon: 'dashboard', label: '儀表板', route: '/dashboard' },
    { icon: 'people', label: '使用者管理', route: '/users', roles: ['admin'] }
  ];

  constructor(private readonly auth: AuthService) {}

  logout(): void {
    this.auth.logout().subscribe();
  }

  canShow(item: NavItem, user: UserProfile | null): boolean {
    if (!item.roles || !item.roles.length) {
      return true;
    }

    return !!user?.roles?.some((role) => item.roles?.includes(role));
  }
}
