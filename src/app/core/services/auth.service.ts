import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { from, Observable, of } from 'rxjs';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';

import { UserProfile, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  readonly firebaseUser$ = this.afAuth.authState.pipe(shareReplay(1));

  readonly userProfile$: Observable<UserProfile | null> = this.firebaseUser$.pipe(
    switchMap((user) => {
      if (!user) {
        return of(null);
      }

      return this.firestore.doc<UserProfile>(`users/${user.uid}`).valueChanges().pipe(
        map((profile): UserProfile => {
          if (!profile) {
            return {
              uid: user.uid,
              email: user.email ?? '',
              displayName: user.displayName ?? user.email ?? '',
              roles: ['viewer'] as UserRole[],
              status: 'active'
            };
          }

          return {
            ...profile,
            uid: user.uid,
            email: profile.email ?? user.email ?? ''
          };
        })
      );
    }),
    shareReplay(1)
  );

  readonly isAuthenticated$ = this.userProfile$.pipe(map((profile) => !!profile));

  constructor(
    private readonly afAuth: AngularFireAuth,
    private readonly firestore: AngularFirestore,
    private readonly router: Router
  ) {}

  loginWithEmail(email: string, password: string) {
    return from(
      this.afAuth.signInWithEmailAndPassword(email, password).then(async (credentials) => {
        if (credentials.user) {
          await this.ensureUserDocument(credentials.user);
        }

        return credentials;
      })
    );
  }

  logout(): Observable<void> {
    return from(this.afAuth.signOut()).pipe(
      tap(() => {
        this.router.navigate(['/login']);
      })
    );
  }

  hasRole(roles: UserRole | UserRole[]): Observable<boolean> {
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    return this.userProfile$.pipe(
      map((profile) => !!profile && requiredRoles.some((role) => profile.roles?.includes(role)))
    );
  }

  private async ensureUserDocument(user: firebase.User): Promise<void> {
    const docRef = this.firestore.doc<UserProfile>(`users/${user.uid}`);
    const snapshot = await docRef.ref.get();

    if (!snapshot.exists) {
      const fallbackProfile: UserProfile = {
        uid: user.uid,
        email: user.email ?? '',
        displayName: user.displayName ?? user.email ?? '',
        roles: ['viewer'] as UserRole[],
        status: 'active',
        createdAt: new Date()
      };

      await docRef.set(fallbackProfile);
    }
  }
}
