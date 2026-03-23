// src/app/core/guards/auth.guard.ts
import {
  CanActivateFn,
  CanMatchFn,
  Route,
  UrlSegment,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';

/**
 * Guard de autenticação (CanActivate):
 * - Permite acesso se houver token (AuthService.isAuthenticated()).
 * - Caso não tenha, redireciona para /login e preserva a URL pretendida (returnUrl).
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

/**
 * Guard de autenticação (CanMatch) – opcional:
 * - Impede até o MATCH da rota lazy quando não há token.
 * - Útil para rotas com loadChildren/loadComponent.
 */
export const authMatchGuard: CanMatchFn = (
  route: Route,
  segments: UrlSegment[]
) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;

  const attemptedUrl = '/' + segments.map(s => s.path).join('/');
  router.navigate(['/login'], { queryParams: { returnUrl: attemptedUrl } });
  return false;
};