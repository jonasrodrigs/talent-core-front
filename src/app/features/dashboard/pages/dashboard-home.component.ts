import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

/**
 * Dashboard MVP (versão "Ocupação"):
 * - Busca candidatos em /api/candidatos
 * - Métricas:
 *   • total de candidatos
 *   • topOcupacoes (universal)
 *   • topIdiomas
 *   • recentes (primeiros N)
 *
 * Observação:
 * - Campo `ocupacao` é opcional no payload; se não vier, o card mostra "Sem dados suficientes."
 */
type CandidatoResponse = {
  id: string;
  nomeCompleto: string;
  email: string | null;
  cidade: string | null;
  estado: string | null;
  pais: string | null;
  // Universal (cargo/ofício/função)
  ocupacao?: string | null;
  // Informativos (mantidos)
  tecnologias?: string[] | null;
  idiomas?: string[] | null;
};

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss'],
})
export class DashboardHomeComponent implements OnInit {
  private http = inject(HttpClient);

  // Estado
  private _loading = signal<boolean>(false);
  loading = computed(() => this._loading());

  private _error = signal<string | null>(null);
  error = computed(() => this._error());

  private _candidatos = signal<CandidatoResponse[]>([]);
  candidatos = computed(() => this._candidatos());

  // Métricas
  total = computed(() => this._candidatos().length);

  /** Top Ocupações (universal) */
  topOcupacoes = computed(() => {
    const valores = this._candidatos()
      .map(c => (c.ocupacao ?? '').trim().toUpperCase())
      .filter(v => v.length > 0);
    if (valores.length === 0) return [] as [string, number][];
    const map: Record<string, number> = {};
    for (const v of valores) map[v] = (map[v] ?? 0) + 1;
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  });

  /** Top Idiomas */
  topIdiomas = computed(() => {
    const map: Record<string, number> = {};
    for (const c of this._candidatos()) {
      for (const lang of (c.idiomas ?? [])) {
        const key = (lang ?? '').trim().toUpperCase();
        if (!key) continue;
        map[key] = (map[key] ?? 0) + 1;
      }
    }
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  });

  /** Recentes (primeiros 8) */
  recentes = computed(() => this._candidatos().slice(0, 8));

  ngOnInit(): void {
    this.carregar();
  }

  async carregar(): Promise<void> {
    this._error.set(null);
    this._loading.set(true);
    try {
      // MVP: busca até 200; ajustar quando houver paginação real no back
      const lista = await firstValueFrom(
        this.http.get<CandidatoResponse[]>('/api/candidatos', {
          params: { page: 0, size: 200 },
        })
      );

      // Defensive mapping
      const arr = (lista ?? []).map(c => ({
        ...c,
        ocupacao: c.ocupacao ?? null,
        tecnologias: c.tecnologias ?? null,
        idiomas: c.idiomas ?? null,
      }));

      this._candidatos.set(arr);
    } catch (e: any) {
      const msg =
        e?.error?.message ??
        e?.message ??
        'Falha ao carregar dados do Dashboard.';
      this._error.set(msg);
    } finally {
      this._loading.set(false);
    }
  }
}
