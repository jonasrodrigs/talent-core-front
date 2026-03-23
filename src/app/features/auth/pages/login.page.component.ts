// src/app/features/auth/pages/login.page.component.ts
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.page.component.html',
  styleUrls: ['./login.page.component.scss'],
})
export class LoginPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private _hide = signal(true);
  hide = computed(() => this._hide());

  loading = signal(false);
  private _authError = signal<string | null>(null);
  authError = computed(() => this._authError());

  /** Captura o returnUrl da query string (ex.: /app/talents) para redirecionar após login */
  private get returnUrl(): string {
    const url = this.route.snapshot.queryParamMap.get('returnUrl');
    // Garante que comece com '/', evitando navegação relativa
    return url && url.startsWith('/') ? url : '/app/dashboard';
  }

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [true],
  });

  get email() { return this.form.get('email'); }
  get password() { return this.form.get('password'); }

  ngOnInit(): void {
    // Mensagens automáticas de acordo com o motivo do redirecionamento
    // Ex.: /login?reason=expired | forbidden | logout
    const reason = this.route.snapshot.queryParamMap.get('reason');
    if (reason === 'expired') {
      this._authError.set('Sua sessão expirou. Faça login novamente.');
    } else if (reason === 'forbidden') {
      this._authError.set('Acesso negado para o recurso solicitado.');
    } else if (reason === 'logout') {
      this._authError.set('Você saiu da sessão com sucesso.');
    }

    // Se o usuário começar a digitar, limpamos a mensagem
    this.form.valueChanges.subscribe(() => {
      if (this._authError()) this._authError.set(null);
    });
  }

  toggleVisibility() {
    this._hide.update(v => !v);
  }

  async submit() {
    this._authError.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password, remember } = this.form.getRawValue();

    try {
      this.loading.set(true);
      await this.auth.login(String(email), String(password), Boolean(remember));
      // Redireciona priorizando o returnUrl; fallback para /app/dashboard
      await this.router.navigateByUrl(this.returnUrl);
    } catch (e: any) {
      this._authError.set(e?.message ?? 'Falha ao autenticar.');
    } finally {
      this.loading.set(false);
    }
  }
}
