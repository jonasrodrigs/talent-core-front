import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

/**
 * TalentListComponent
 *
 * - Lista candidatos
 * - Leitura da busca livre via query param `q`
 * - Chamada GET /api/candidatos?page=&size=&q=
 * - Não aplica filtros locais (responsabilidade do backend)
 *
 * Campo universal:
 * - ocupacao?: string | null
 */

type CandidatoResponse = {
  id: string;
  nomeCompleto: string;
  email: string | null;
  cidade: string | null;
  estado: string | null;
  pais: string | null;

  // Campo universal (currículo / dashboard)
  ocupacao?: string | null;

  // Informativos
  tecnologias?: string[] | null;
  idiomas?: string[] | null;
};

@Component({
  selector: 'app-talent-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './talent-list.component.html',
  styleUrls: ['./talent-list.component.scss'],
})
export class TalentListComponent implements OnInit, OnDestroy {

  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  loading = true;
  error: string | null = null;
  candidatos: CandidatoResponse[] = [];

  private qpSub?: Subscription;

  ngOnInit(): void {
    // Observa alterações na query string (ex.: /app/talents?q=valor)
    this.qpSub = this.route.queryParamMap.subscribe(async params => {
      const q = (params.get('q') ?? '').trim();
      await this.carregar(q);
    });
  }

  ngOnDestroy(): void {
    this.qpSub?.unsubscribe();
  }

  /** Busca candidatos; se `q` for vazio, busca geral */
  private async carregar(q: string): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      let httpParams = new HttpParams()
        .set('page', '0')
        .set('size', '200');

      if (q) {
        httpParams = httpParams.set('q', q);
      }

      const lista = await this.http
        .get<CandidatoResponse[]>('/api/candidatos', { params: httpParams })
        .toPromise();

      // Mapeamento defensivo
      this.candidatos = (lista ?? []).map(c => ({
        ...c,
        ocupacao: c.ocupacao ?? null,
        tecnologias: c.tecnologias ?? null,
        idiomas: c.idiomas ?? null,
      }));

    } catch (e: any) {
      this.error =
        e?.error?.message ||
        e?.message ||
        'Falha ao carregar lista de talentos.';
      this.candidatos = [];
    } finally {
      this.loading = false;
    }
  }

  /** trackBy para otimizar renderização da tabela */
  trackById(_: number, c: CandidatoResponse): string {
    return c.id;
  }
}