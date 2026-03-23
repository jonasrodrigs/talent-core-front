// src/app/features/talents/pages/talent-detail/talent-detail.component.ts
import { Component, OnDestroy, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

/**
 * TalentDetailComponent (front-first)
 * - Carrega o candidato por :id (GET /api/candidatos/{id})
 * - Layout de currículo com: Foto/Avatar, Ocupação, Resumo, Links, Contato, Endereço,
 *   Idiomas/Tecnologias, Dados pessoais, Habilidades técnicas, Soft skills,
 *   Experiências e Projetos.
 */

// Tipos de apoio (mantendo defensivo com enum aberto em string)
type HabilidadeTecnica = {
  nome: string;
  categoria?: string | null;
  nivel?: 'BASICO' | 'INTERMEDIARIO' | 'AVANCADO' | 'EXPERT' | string | null;
};

type SoftSkill = { nome: string };

// Experiência conforme o backend devolve
type Experiencia = {
  empresa: string;
  cargo: string;
  tipo?: 'CLT' | 'PJ' | 'ESTAGIO' | 'FREELANCE' | string | null;
  dataInicio?: string | null;
  dataFim?: string | null;
  tecnologias?: string[] | null;
  realizacoes?: string[] | null;
};

// Projeto conforme o backend devolve
type Projeto = {
  nome: string;
  descricao?: string | null;
  url?: string | null;
  dataInicio?: string | null;
  dataFim?: string | null;
  tecnologias?: string[] | null;
};

type CandidatoDetail = {
  id: string;
  nomeCompleto: string;
  email: string | null;
  telefone?: string | null;

  cidade: string | null;
  estado: string | null;
  pais: string | null;

  // Endereço (apoio para enderecoCurto)
  bairro?: string | null;

  // Universal (opcional no back)
  ocupacao?: string | null;

  // Mídia/Texto opcionais
  fotoUrl?: string | null;
  resumoProfissional?: string | null;

  // Dados pessoais (opcionais)
  dataNascimento?: string | Date | null;
  nacionalidade?: string | null;
  estadoCivil?: string | null;

  // Informativos (opcionais)
  tecnologias?: string[] | null;
  idiomas?: string[] | null;

  // Links (opcionais)
  linkedin?: string | null;
  github?: string | null;
  portfolio?: string | null;

  // Disponibilidade (opcionais)
  aceitaViagens?: string | boolean | null;   // 'S' | 'N' | true | false | null
  aceitaMudanca?: string | boolean | null;   // 'S' | 'N' | true | false | null
  horarios?: string | null;                  // texto livre
  pretensaoSalarial?: string | null;         // texto livre

  // Coleções visuais
  habilidades?: string[] | null;                       // fallback (array de nomes)
  habilidadesTecnicas?: HabilidadeTecnica[] | null;    // objetos completos
  habilidadesComportamentais?: SoftSkill[] | null;     // objetos { nome }

  // >>> NOVO
  experiencias?: Experiencia[] | null;
  projetos?: Projeto[] | null;
};

@Component({
  selector: 'app-talent-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './talent-detail.component.html',
  styleUrls: ['./talent-detail.component.scss'],
})
export class TalentDetailComponent implements OnInit, OnDestroy {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  private sub?: Subscription;

  // Estado
  private _loading = signal<boolean>(true);
  loading = computed(() => this._loading());

  private _error = signal<string | null>(null);
  error = computed(() => this._error());

  private _cand = signal<CandidatoDetail | null>(null);
  cand = computed(() => this._cand());

  // Foto existe e parece URL válida?
  hasPhoto = computed(() => {
    const url = this._cand()?.fotoUrl ?? '';
    return this.isLikelyUrl(url);
  });

  // Avatar com iniciais (fallback quando não há foto)
  avatarInitials = computed(() => {
    const name = this._cand()?.nomeCompleto ?? '';
    if (!name.trim()) return '';
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  });

  // Resumo existe?
  hasResumo = computed(() => {
    const t = this._cand()?.resumoProfissional ?? '';
    return t.trim().length > 0;
  });

  // Endereço curto: "Bairro · Cidade/UF" (formatado no template com | titlecase)
  enderecoCurto = computed(() => {
    const c = this._cand();
    if (!c) return '—';
    const bairro = (c.bairro ?? '').trim();
    const cidade = (c.cidade ?? '').trim();
    const uf = (c.estado ?? '').trim();

    const partes: string[] = [];
    if (bairro) partes.push(bairro);
    if (cidade || uf) {
      const cidadeUf = cidade + (uf ? `/${uf}` : '');
      if (cidadeUf) partes.push(cidadeUf);
    }
    return partes.length ? partes.join(' · ') : '—';
  });

  // Dados pessoais: renderiza se houver pelo menos um campo
  hasDadosPessoais = computed(() => {
    const c = this._cand();
    if (!c) return false;
    return !!(c.dataNascimento || c.nacionalidade || c.estadoCivil);
  });

  // Disponibilidade: renderiza se houver pelo menos um campo
  hasDisponibilidade = computed(() => {
    const c = this._cand();
    if (!c) return false;
    return !!(
      c.aceitaViagens !== undefined && c.aceitaViagens !== null ||
      c.aceitaMudanca !== undefined && c.aceitaMudanca !== null ||
      (c.horarios && c.horarios.trim()) ||
      (c.pretensaoSalarial && c.pretensaoSalarial.trim())
    );
  });

  // Normaliza booleano 'S'/'N' | true/false em "Sim"/"Não"
  formatSimNao(v: string | boolean | null | undefined): string {
    if (v === true || v === 'S' || String(v).toUpperCase() === 'SIM') return 'Sim';
    if (v === false || v === 'N' || String(v).toUpperCase() === 'NAO' || String(v).toUpperCase() === 'NÃO') return 'Não';
    return '—';
  }

  ngOnInit(): void {
    this.sub = this.route.paramMap.subscribe(async (params) => {
      const id = params.get('id');
      if (!id) {
        this._error.set('Identificador inválido.');
        this._loading.set(false);
        return;
      }
      await this.carregar(id);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private async carregar(id: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const data = await this.http
        .get<CandidatoDetail>(`/api/candidatos/${id}`)
        .toPromise();

      if (!data) {
        this._error.set('Candidato não encontrado.');
        this._cand.set(null);
        return;
      }

      // Mapeamento defensivo (aceita presença/ausência de campos)
      const mapped: CandidatoDetail = {
        id: data.id,
        nomeCompleto: data.nomeCompleto,
        email: data.email ?? null,
        telefone: (data as any).telefone ?? null,

        cidade: data.cidade ?? null,
        estado: data.estado ?? null,
        pais: data.pais ?? null,
        bairro: (data as any).bairro ?? null,

        ocupacao: (data as any).ocupacao ?? null,
        fotoUrl: (data as any).fotoUrl ?? null,
        resumoProfissional: (data as any).resumoProfissional
          ? String((data as any).resumoProfissional)
          : null,

        dataNascimento: (data as any).dataNascimento ?? null,
        nacionalidade: (data as any).nacionalidade ?? null,
        estadoCivil:   (data as any).estadoCivil ?? null,

        tecnologias: data.tecnologias ?? null,
        idiomas: data.idiomas ?? null,

        linkedin: (data as any).linkedin ?? null,
        github: (data as any).github ?? null,
        portfolio: (data as any).portfolio ?? null,

        // Disponibilidade
        aceitaViagens: (data as any).aceitaViagens ?? null,
        aceitaMudanca: (data as any).aceitaMudanca ?? null,
        horarios: (data as any).horarios ?? null,
        pretensaoSalarial: (data as any).pretensaoSalarial ?? null,

        // Coleções
        habilidades: (data as any).habilidades ?? null,
        habilidadesTecnicas: (data as any).habilidadesTecnicas ?? null,
        habilidadesComportamentais: (data as any).habilidadesComportamentais ?? null,

        // >>> NOVO
        experiencias: (data as any).experiencias ?? null,
        projetos: (data as any).projetos ?? null,
      };

      this._cand.set(mapped);
    } catch (e: any) {
      this._error.set(e?.error?.message || e?.message || 'Falha ao carregar o candidato.');
      this._cand.set(null);
    } finally {
      this._loading.set(false);
    }
  }

  // Navega de volta para a lista
  async voltar(): Promise<void> {
    await this.router.navigate(['/app/talents']);
  }

  /** Heurística simples para validar se uma string "parece" URL */
  private isLikelyUrl(url: string): boolean {
    if (!url) return false;
    return /^(https?:)?\/\//i.test(url) || /^data:image\//i.test(url);
  }
}