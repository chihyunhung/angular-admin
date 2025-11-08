import { ChangeDetectionStrategy, Component } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { DashboardService } from './services/dashboard.service';
import { UserProfile, WithId } from '../../core/models/user.model';

interface DashboardCard {
  icon: string;
  label: string;
  value: number;
  hint: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  readonly recentUsers$: Observable<WithId<UserProfile>[]> = this.dashboardService.recentUsers$();

  readonly cards$: Observable<DashboardCard[]> = combineLatest([
    this.dashboardService.collectionCount$('users').pipe(startWith(0)),
    this.dashboardService.collectionCount$('orders').pipe(startWith(0)),
    this.dashboardService.collectionCount$('reports').pipe(startWith(0))
  ]).pipe(
    map(([users, orders, reports]) => [
      { icon: 'people', label: '使用者', value: users, hint: '已啟用 Firebase 帳號' },
      { icon: 'assignment', label: '訂單', value: orders, hint: 'Firestore orders 集合' },
      { icon: 'bar_chart', label: '報表', value: reports, hint: '自訂報表數量' }
    ])
  );

  displayedColumns = ['displayName', 'email', 'roles', 'status'];

  constructor(private readonly dashboardService: DashboardService) {}
}
