// src/app/core/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

interface LoginResponse { token: string }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl; // '' (proxy) ou 'http://localhost:8080'
  private logoutTimer: any | null = null;

  constructor() {
    // Ao recarregar a página, se já houver token válido, reagenda o auto-logout
    const token = this.getToken();
    if (token && !this.isTokenExpired(token)) {
      this.scheduleAutoLogoutFromToken(token);
    }
  }

  /** true se existe token em localStorage ou sessionStorage */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  /** Fluxo de login: chama /auth/login, salva token e agenda auto-logout */
  async login(email: string, password: string, remember: boolean): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password })
      );
      const token = res?.token;
      if (!token) throw new Error('Token ausente na resposta do servidor.');

      (remember ? localStorage : sessionStorage).setItem('token', token);

      // (re)agenda o auto-logout conforme o exp do JWT
      this.scheduleAutoLogoutFromToken(token);
    } catch (err: any) {
      if (err?.status === 0) {
        throw new Error('Falha de conexão com a API (CORS/SSL/Network). Verifique a URL e o proxy.');
      }
      throw new Error(err?.error?.message || 'Falha ao autenticar. Verifique suas credenciais.');
    }
  }

  /** Logout: limpa token e cancela timer */
  logout(): void {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }
  }

  /** Obtém o token do armazenamento (prioriza localStorage) */
  getToken(): string | null {
    return localStorage.getItem('token') ?? sessionStorage.getItem('token');
  }

  // =========================
  // Utilitários de JWT
  // =========================

  /** Retorna o payload do JWT (ou null se inválido) */
  getTokenPayload(token: string | null = this.getToken()): any | null {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const json = atob(base64);
      // decodeURIComponent(escape(...)) para garantir UTF-8
      return JSON.parse(decodeURIComponent(escape(json)));
    } catch {
      return null;
    }
  }

  /** E-mail do usuário (claim 'sub' no seu JwtService) */
  getUserEmail(): string | null {
    const payload = this.getTokenPayload();
    return payload?.sub ?? null;
  }

  /** true se o token já expirou (exp < agora) */
  isTokenExpired(token: string | null = this.getToken()): boolean {
    const payload = this.getTokenPayload(token);
    if (!payload?.exp) return true; // sem exp, considere inválido
    const nowSec = Math.floor(Date.now() / 1000);
    return payload.exp <= nowSec;
  }

  /**
   * true se o token vai expirar nos próximos `thresholdSeconds` (padrão 60s).
   * Útil para avisar usuário ou renovar token (se você implementar refresh).
   */
  willExpireSoon(thresholdSeconds = 60, token: string | null = this.getToken()): boolean {
    const payload = this.getTokenPayload(token);
    if (!payload?.exp) return true;
    const nowSec = Math.floor(Date.now() / 1000);
    return payload.exp - nowSec <= thresholdSeconds;
  }

  /**
   * Agenda auto-logout quando o token expirar (com base no claim exp).
   * Se o exp já passou, faz logout imediato.
   */
  private scheduleAutoLogoutFromToken(token: string): void {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }

    const payload = this.getTokenPayload(token);
    if (!payload?.exp) {
      this.logout();
      return;
    }

    const nowMs = Date.now();
    const expMs = payload.exp * 1000; // exp em segundos → ms
    const delay = expMs - nowMs;

    if (delay <= 0) {
      // Já expirado
      this.logout();
      return;
    }

    // Agenda logout exatamente no expirar do token
    this.logoutTimer = setTimeout(() => {
      this.logout();
      // Opcional: você pode emitir um evento global, usar um service de toast,
      // ou deixar o interceptor redirecionar no próximo 401.
      // Se quiser forçar o redirect aqui, injete o Router via constructor.
    }, delay);
  }
}