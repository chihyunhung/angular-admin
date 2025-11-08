import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  DocumentChangeAction
} from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UserProfile, WithId } from '../../../core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private readonly firestore: AngularFirestore) {}

  collectionCount$(path: string): Observable<number> {
    return this.firestore
      .collection(path)
      .valueChanges({ idField: 'id' })
      .pipe(map((items: unknown[]) => items.length));
  }

  recentUsers$(): Observable<WithId<UserProfile>[]> {
    return this.firestore
      .collection<UserProfile>('users', (ref) => ref.orderBy('createdAt', 'desc').limit(5))
      .snapshotChanges()
      .pipe(
        map((actions: DocumentChangeAction<UserProfile>[]) =>
          actions.map((action) => {
            const data = action.payload.doc.data() as UserProfile;
            const id = action.payload.doc.id;
            return { ...data, id };
          })
        )
      );
  }
}
