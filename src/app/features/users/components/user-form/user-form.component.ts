import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';

import { UserRole } from '../../../../core/models/user.model';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserFormComponent implements OnInit, OnDestroy {
  readonly rolesOptions: UserRole[] = ['admin', 'editor', 'viewer'];
  readonly form = this.fb.group({
    displayName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    roles: [['viewer'], [Validators.required]],
    status: ['active', [Validators.required]]
  });

  loading = false;
  userId?: string;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly usersService: UsersService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params) => {
          const id = params.get('id');
          this.userId = id ?? undefined;
          if (!id) {
            return of(null);
          }

          this.loading = true;
          return this.usersService.get(id);
        })
      )
      .subscribe((user) => {
        if (user) {
          this.form.patchValue({
            displayName: user.displayName,
            email: user.email,
            roles: user.roles,
            status: user.status
          });
        } else {
          this.form.reset({
            displayName: '',
            email: '',
            roles: ['viewer'],
            status: 'active'
          });
        }

        this.loading = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue();
    this.loading = true;

    const request$ = this.userId
      ? this.usersService.update(this.userId, payload)
      : this.usersService.create(payload);

    request$
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.snackBar.open('使用者資料已儲存', '關閉', { duration: 3000 });
          this.router.navigate(['/users']);
        },
        error: () => this.snackBar.open('儲存失敗，請檢查 Firestore 權限', '關閉', { duration: 4000 })
      });
  }
}
