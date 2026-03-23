# TalentCore Frontend
## design minimalista para viabilizar o desenvolvimento
<img width="1919" height="831" alt="image" src="https://github.com/user-attachments/assets/a42058ff-5523-4969-94b6-9093792bd928" />
______________________________________________________________________________________________________________________________________________

<img width="1915" height="829" alt="image" src="https://github.com/user-attachments/assets/4de236c2-27c2-4532-810b-0d049f5e0ce8" />

______________________________________________________________________________________________________________________________________________

<img width="1916" height="824" alt="image" src="https://github.com/user-attachments/assets/f570ea0c-a321-487b-b612-2509f249f5f2" />

______________________________________________________________________________________________________________________________________________

<img width="1894" height="822" alt="image" src="https://github.com/user-attachments/assets/2fb21605-ff41-4e82-99a2-084dbe822a25" />

______________________________________________________________________________________________________________________________________________




## Visão Geral
O **TalentCore Frontend** é a interface web do produto TalentCore, um banco de talentos profissional com foco em recrutadores e candidatos. O frontend foi desenvolvido com **Angular moderno (standalone)**, arquitetura orientada a **features**, reutilização inteligente de **Bootstrap 5**, e um **design system próprio** baseado em tokens.

O objetivo principal do frontend é oferecer:
- Experiência profissional (nível SaaS / Enterprise)
- Escalabilidade para planos Free e Pagos
- Código limpo, previsível e fácil de evoluir

---

## Tecnologias Principais

- **Angular** (Standalone Components)
- **TypeScript**
- **SCSS**
- **Bootstrap 5 (customizado)**
- **JWT** para autenticação
- **Arquitetura baseada em Features**

---

## Arquitetura de Pastas

```txt
src/
├─ app/
│  ├─ core/
│  │  ├─ guards/            # Guards de rota (Auth, etc)
│  │  ├─ interceptors/      # Interceptor HTTP (JWT, erros)
│  │  └─ services/          # Serviços globais (Auth, APIs)
│  │
│  ├─ features/
│  │  ├─ auth/              # Login / autenticação
│  │  ├─ dashboard/         # Dashboard principal
│  │  └─ talents/           # Banco de talentos
│  │     ├─ pages/
│  │     │  ├─ talent-list/   # Listagem de talentos
│  │     │  └─ talent-detail/ # Currículo do candidato
│  │     └─ components/
│  │
│  ├─ shared/
│  │  └─ layout/            # Layout principal
│  │     ├─ header-toolbar/
│  │     ├─ side-nav/
│  │     └─ main-layout/
│  │
│  ├─ app.routes.ts
│  └─ app.config.ts
│
├─ styles/
│  ├─ _tc-theme.scss        # Design tokens (cores, mixins)
│  └─ bootstrap.custom.scss # Bootstrap customizado
│
└─ styles.scss              # Estilos globais mínimos
```

---

## Princípios Arquiteturais

### 1. Feature-based Architecture
Cada domínio funcional possui sua própria pasta dentro de `features`. Isso garante:
- Escalabilidade
- Menor acoplamento
- Facilidade de manutenção

### 2. Standalone Components
Não são utilizados NgModules tradicionais. Cada componente declara explicitamente suas dependências (`imports`).

### 3. Separação de Responsabilidades
- **UI**: Componentes visuais
- **Estado/Fluxo**: Signals, Computeds
- **Comunicação**: Serviços em `core/services`

---

## Sistema de Estilos

### Design Tokens
Arquivo base:
```
src/styles/_tc-theme.scss
```

Contém:
- Paleta de cores
- CSS Variables (`--tc-*`)
- Mixins reutilizáveis:
  - `elevation()`
  - `border()`
  - `btn-primary()`

Este arquivo é a **fonte da verdade visual** do projeto.

---

### Bootstrap Customizado
Arquivo:
```
src/styles/bootstrap.custom.scss
```

Características:
- Baseado em Bootstrap 5
- Sobrescrita de variáveis (cores, radius, fontes)
- Reutilização consciente de:
  - tables
  - badges
  - buttons

Objetivo: **consistência visual + produtividade**.

---

### Estilos por Componente

Regra adotada:
- ❌ Nada de CSS específico em `styles.scss`
- ✅ Cada componente possui seu próprio `.scss`

Benefícios:
- Encapsulamento
- Evita conflitos globais
- Facilita refino visual por tela

---

## Telas Principais

### Header Toolbar
- Navegação principal
- Busca contextual (apenas em /app/talents)
- Informações do usuário
- Logout

Layout clean, estilo enterprise, inspirado em LinkedIn.

---

### Dashboard
- Visão executiva
- Cards organizados
- Métricas de talentos
- Tabela de recentes

Visual focado em leitura e tomada de decisão.

---

### Talent List
- Tabela baseada em Bootstrap
- `table-striped`, `table-hover`
- Badges para idiomas
- Links claros para detalhe

Sem customização excessiva – foco em legibilidade.

---

### Talent Detail (Currículo)

Tela inspirada em **currículos profissionais e LinkedIn**:
- Header com foto/avatar
- Nome e ocupação em destaque
- Cards como seções de CV
- Chips para skills, idiomas e links
- Layout compacto e elegante

Pensada também para futura exportação PDF.

---

## Autenticação

- Baseada em JWT
- Token guardado no client
- Guards protegem rotas autenticadas
- Interceptor anexa token automaticamente

---

## Estado e Reatividade

- Uso de **signals** e **computed**
- Estado previsível

- Menos RXJS em telas, mais simplicidade

---

#O frontend possui uma UI funcional voltada para desenvolvimento (Pragmatic UI).
As funcionalidades listadas como “não implementadas” ainda não possuem regras, lógica ou interface específica.

## Preparado para Evolução

O frontend já está pronto para:

- ✅ Controle de permissões (UI)
- ✅ Feature Vagas
- ✅ Exportação PDF
- ✅ Novos dashboards

# O que ainda falta implementar no Frontend

## parte pro do recrutador

- Editar dados do recrutador
- Editar dados da empresa
- Upload / troca de logo da empresa
- Gerenciar informações institucionais da empresa
- Gerenciar vagas publicadas
- Criar nova vaga
- Editar vaga
- Pausar ou encerrar vaga
- Visualizar candidatos por vaga
- Associar talentos a vagas manualmente
- Marcar status do candidato (em análise, entrevista, aprovado, recusado)
- Favoritar talentos
- Organizar talentos favoritos
- Salvar buscas de talentos
- Histórico de visualizações de talentos
- Anotações privadas no perfil do talento
- Exportar currículo do talento (PDF)
- Exportar lista de talentos
- Compartilhar perfil do talento por link
- Visualizar limites do plano (quando houver)
- Dashboard específico do recrutador
- Histórico de ações do recrutador
---

## Perfil do candidato

- Editar dados pessoais
- Editar resumo profissional
- Gerenciar experiências profissionais
- Gerenciar projetos
- Gerenciar habilidades técnicas
- Gerenciar habilidades comportamentais (soft skills)
- Upload / troca de foto ou avatar
- Anexar currículo em PDF ou DOC
- Atualizar ou substituir currículo anexado
- Visualizar currículo anexado
- Remover currículo anexado
- Preview do currículo gerado pela plataforma (antes de salvar)
- Escolher usar currículo anexado ou currículo gerado pela plataforma
- Controlar visibilidade do perfil para recrutadores
- Definir disponibilidade (viagens, mudança, horários)
- Informar pretensão salarial
- Gerenciar links externos (LinkedIn, GitHub, Portfólio)
- Histórico de alterações do perfil
- Indicar status do perfil (em busca, aberto a propostas, indisponível)


## Padrões Seguidos

- Clean Code
- Componentes pequenos e focados
- Sem lógica de negócio no template
- HTML semântico
- Acessibilidade básica

---

## Conclusão

O **TalentCore Frontend** possui uma base sólida, profissional e escalável, adequada para um produto SaaS real. A arquitetura e as decisões visuais foram pensadas para permitir crescimento sem retrabalho.

---

**Autor:** Jonas Mexilem Rodrigues da Silva
