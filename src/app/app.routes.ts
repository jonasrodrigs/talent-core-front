// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { MainLayoutComponent } from '@shared/layout/main-layout/main-layout.component';
import { authMatchGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  // Raiz → login
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  // Rotas públicas
  {
    path: 'login',
    loadComponent: () =>
      import('@features/auth/pages/login.page.component')
        .then(m => m.LoginPageComponent),
    title: 'Login • Talent Core',
  },

  // Área autenticada (isolada em /app)
  {
    path: 'app',
    component: MainLayoutComponent,
    canMatch: [authMatchGuard], // ✅ agora seguro
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('@features/dashboard/pages/dashboard-home.component')
            .then(m => m.DashboardHomeComponent),
        title: 'Dashboard • Talent Core',
      },
      {
        path: 'talents',
        loadChildren: () =>
          import('@features/talents/talents.routes')
            .then(m => m.TALENTS_ROUTES),
        title: 'Talentos • Talent Core',
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
    ],
  },

  // Fallback
  { path: '**', redirectTo: 'login' },
];