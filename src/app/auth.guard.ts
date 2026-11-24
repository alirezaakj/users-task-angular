import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountRole, AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isSignedIn()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  const allowedRoles = route.data['roles'] as readonly AccountRole[] | undefined;
  if (allowedRoles && !allowedRoles.includes(auth.role() as AccountRole)) {
    return router.createUrlTree(['/forbidden']);
  }

  return true;
};
