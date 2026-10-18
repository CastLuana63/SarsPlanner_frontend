# Regras de Desenvolvimento — SarsPlanner (ShowPlanner)

## 1. Nomenclatura de Código
- **Componentes React e Interfaces/Types TypeScript (`PascalCase`)**:
  - Exemplos: `Botao`, `CampoTexto`, `LayoutPrincipal`, `IUsuarioAutenticado`, `IItemMenuLateral`.
- **Variáveis, Estados, Funções e Props (`camelCase` em Português claro)**:
  - Exemplos: `exibirLoginInterno`, `emailUsuario`, `senhaUsuario`, `menuRecolhido`, `realizarLoginInterno`.
- **Booleanos (Prefixos semânticos `eh`, `esta`, `possui`, `exibir`)**:
  - Exemplos: `estaAutenticado`, `exibirLoginInterno`, `menuMobileAberto`, `notificacaoAberta`.
- **Constantes Globais e Chaves de Storage (`UPPER_SNAKE_CASE`)**:
  - Exemplos: `CHAVE_STORAGE_USUARIO`, `SECOES_MENU_LATERAL`.

## 2. Arquitetura e Componentização
- **Sem bibliotecas de componentes prontos (Sem shadcn/ui)**: Todos os componentes visuais são construídos internamente em `src/components/ui/` utilizando apenas Tailwind CSS.
- **Separação de Camadas**:
  - `src/components/ui/`: Componentes visuais atômicos e reutilizáveis.
  - `src/components/layout/`: Componentes estruturais (`Sidebar`, `Header`, `LayoutPrincipal`).
  - `src/pages/`: Telas completas conectadas às rotas.
  - `src/mocks/`: Dados estáticos em JSON para simulação local sem backend.
  - `src/contexts/`: Estados globais da aplicação (Autenticação).
  - `src/types/`: Contratos e interfaces TypeScript.
- **Responsividade**: Layouts projetados para funcionar em telas mobile, tablets e desktops.
