// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.getToken();
  const isLogin = req.url.includes('/auth/login'); // nunca anexa Authorization no login

  // Anexa Bearer somente em chamadas da API (e não no login)
  const shouldAttach =
    !!token &&
    !isLogin &&
    (req.url.startsWith('/api') ||
     req.url.startsWith('/auth') ||
     req.url.startsWith('http://localhost:8080') ||
     req.url.startsWith('https://'));

  let request = req;
  if (shouldAttach) {
    request = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // Nunca tratar o próprio /auth/login para evitar loop
      if (isLogin) {
        return throwError(() => error);
      }

      // 401 → sessão expirada/ausente: limpar token e ir para /login
      if (error.status === 401) {
        auth.logout();
        // Evita navegar se já estamos no /login
        const currentUrl = router.routerState.snapshot.url || '';
        if (!currentUrl.startsWith('/login')) {
          router.navigate(['/login'], { queryParams: { reason: 'expired' } });
        }
      }

      // 403 → sem permissão/role: opcionalmente redireciona
      if (error.status === 403) {
        const currentUrl = router.routerState.snapshot.url || '';
        if (!currentUrl.startsWith('/dashboard')) {
          router.navigate(['/dashboard'], { queryParams: { reason: 'forbidden' } });
        }
      }

      return throwError(() => error);
    })
  );
};