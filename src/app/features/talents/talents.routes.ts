// src/app/features/talents/talents.routes.ts
import { Routes } from '@angular/router';

export const TALENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/talent-list/talent-list.component')
        .then(m => m.TalentListComponent),
    title: 'Talentos • Talent Core',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/talent-detail/talent-detail.component')
        .then(m => m.TalentDetailComponent),
    title: 'Detalhe do Talento • Talent Core',
  },
];