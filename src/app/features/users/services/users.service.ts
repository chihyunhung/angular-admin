import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UserProfile, UserRole, WithId } from '../../../core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly collection = this.firestore.collection<UserProfile>('users');

  constructor(private readonly firestore: AngularFirestore) {}

  list(): Observable<WithId<UserProfile>[]> {
    return this.collection.snapshotChanges().pipe(
      map((actions) =>
        actions.map((action) => {
          const data = action.payload.doc.data() as UserProfile;
          const id = action.payload.doc.id;
          return { ...data, id };
        })
      )
    );
  }

  get(id: string): Observable<UserProfile | undefined> {
    return this.collection.doc(id).valueChanges();
  }

  create(payload: Partial<UserProfile>) {
    const docId = payload.uid && payload.uid.length ? payload.uid : this.firestore.createId();

    const data: UserProfile = {
      uid: docId,
      email: payload.email ?? '',
      displayName: payload.displayName ?? payload.email ?? '',
      roles: (payload.roles as UserRole[]) ?? (['viewer'] as UserRole[]),
      status: payload.status ?? 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      photoURL: payload.photoURL
    };

    return from(this.collection.doc(docId).set(data));
  }

  update(id: string, payload: Partial<UserProfile>) {
    const updatePayload: Partial<UserProfile> = {
      ...payload,
      updatedAt: new Date()
    };

    return from(this.collection.doc(id).update(updatePayload));
  }

  delete(id: string) {
    return from(this.collection.doc(id).delete());
  }
}
