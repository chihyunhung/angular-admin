import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentReference,
  QueryFn
} from '@angular/fire/compat/firestore';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreDataService {
  constructor(private readonly firestore: AngularFirestore) {}

  collection<T>(path: string, queryFn?: QueryFn): AngularFirestoreCollection<T> {
    return this.firestore.collection<T>(path, queryFn);
  }

  collection$<T extends { id?: string }>(path: string, queryFn?: QueryFn): Observable<T[]> {
    return this.collection<T>(path, queryFn).valueChanges({ idField: 'id' });
  }

  doc$<T>(path: string): Observable<T | undefined> {
    return this.firestore.doc<T>(path).valueChanges();
  }

  create<T>(path: string, data: T): Observable<DocumentReference<T>> {
    return from(this.collection<T>(path).add({
      ...data,
      createdAt: new Date()
    }));
  }

  upsert<T>(path: string, id: string, data: Partial<T>) {
    return from(
      this.collection<T>(path).doc(id).set(
        {
          ...data,
          updatedAt: new Date()
        },
        { merge: true }
      )
    );
  }

  delete(path: string, id: string) {
    return from(this.collection(path).doc(id).delete());
  }
}
