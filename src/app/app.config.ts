// src/app/app.config.ts
import { ApplicationConfig, Injectable } from '@angular/core';
import { provideRouter, withInMemoryScrolling, TitleStrategy, RouterStateSnapshot } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Title } from '@angular/platform-browser';
import { authInterceptor } from '@core/interceptors/auth.interceptor';

@Injectable()
class AppTitleStrategy extends TitleStrategy {
  constructor(private readonly titleSvc: Title) { super(); }

  override updateTitle(snapshot: RouterStateSnapshot) {
    const title = this.buildTitle(snapshot);   // usa "title" definido nas rotas
    this.titleSvc.setTitle(title ?? 'Talent Core');
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })
    ),
    provideHttpClient(withInterceptors([authInterceptor])), // ou só provideHttpClient()
    provideAnimations(),
    { provide: TitleStrategy, useClass: AppTitleStrategy },
  ],
};