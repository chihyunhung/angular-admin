import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { UserProfile, WithId } from '../../../../core/models/user.model';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersListComponent {
  readonly users$ = this.usersService.list();
  readonly displayedColumns = ['displayName', 'email', 'roles', 'status', 'actions'];

  constructor(private readonly usersService: UsersService, private readonly router: Router, private readonly snackBar: MatSnackBar) {}

  trackById(_: number, user: WithId<UserProfile>): string {
    return user.id;
  }

  createUser(): void {
    this.router.navigate(['users', 'new']);
  }

  editUser(user: WithId<UserProfile>): void {
    this.router.navigate(['users', user.id]);
  }

  deleteUser(user: WithId<UserProfile>): void {
    if (!confirm(`確定刪除 ${user.displayName || user.email} ?`)) {
      return;
    }

    this.usersService.delete(user.id).subscribe({
      next: () => this.snackBar.open('使用者已刪除', '關閉', { duration: 3000 }),
      error: () => this.snackBar.open('刪除失敗，請確認 Firebase 權限', '關閉', { duration: 4000 })
    });
  }
}
