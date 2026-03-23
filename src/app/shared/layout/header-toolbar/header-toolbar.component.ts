// src/app/shared/layout/header-toolbar/header-toolbar.component.ts
import { Component, EventEmitter, Output, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription, filter } from 'rxjs';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-header-toolbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header-toolbar.component.html',
  styleUrls: ['./header-toolbar.component.scss']
})
export class HeaderToolbarComponent implements OnInit, OnDestroy {
  @Output() toggleNav = new EventEmitter<void>();

  private auth = inject(AuthService);
  private router = inject(Router);
  private sub?: Subscription;

  /** Controla exibição da barra de pesquisa */
  showSearch = false;

  ngOnInit(): void {
    // Estado inicial
    this.showSearch = this.isTalentsUrl(this.router.url);

    // Atualiza quando a rota muda
    this.sub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.showSearch = this.isTalentsUrl(this.router.url);
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  /**
   * Mostra a barra SOMENTE na rota exata /app/talents.
   * - Não exibe em /app/talents/:id nem em outras rotas.
   */
  private isTalentsUrl(url: string): boolean {
    try {
      const tree = this.router.parseUrl(url);
      const primary = tree.root.children['primary'];
      const path = '/' + (primary?.segments.map(s => s.path).join('/') ?? '');
      return path === '/app/talents';
    } catch {
      // fallback conservador
      return false;
    }
  }

  /** Logout: limpa token e navega para /login */
  async logout(): Promise<void> {
    this.auth.logout();
    await this.router.navigateByUrl('/login');
  }

  /** Handler da barra de pesquisa do header (apenas Talentos) */
  async onSearch(raw: string): Promise<void> {
    const q = (raw ?? '').trim();
    const queryParams = q ? { q } : {};
    await this.router.navigate(['/app/talents'], { queryParams });
  }

  /** E-mail do usuário exibido no header (claim "sub" do JWT) */
  get userEmail(): string | null {
    const token = this.auth.getToken();
    if (!token) return null;
    const payload = this.decodeJwtPayload(token);
    return payload?.sub ?? null;
  }

  /** Decodifica o payload do JWT sem libs externas */
  private decodeJwtPayload(token: string): any | null {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const json = atob(base64);
      return JSON.parse(decodeURIComponent(escape(json)));
    } catch {
      return null;
    }
  }

  /** Indica se há sessão autenticada */
  get isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }
}