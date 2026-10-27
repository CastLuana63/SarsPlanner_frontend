export type TStatusFiltroConclusao = 'NAO_CONCLUIDO' | 'CONCLUIDO' | 'TODOS'

export type TCampoOrdenacaoAlerta = 'data' | 'cidade'

export type TDirecaoOrdenacaoAlerta = 'asc' | 'desc'

export interface IAlertaNotificacao {
  id: number
  seq_evento: number
  dia_vencimento: string
  data_vencimento_iso: string
  mes_referencia: string // "01" a "12"
  ano_referencia: string // Ex: "2026"
  grupo_mes_ano: string // Ex: "Outubro | 26"
  data_show: string
  cidade: string
  uf: string
  cidade_uf: string
  artista: string
  categoria: string
  descricao: string
  lida: boolean
  concluida: boolean
}

export interface IFiltrosAlertas {
  // Filtros gerais do topo
  ano: string
  meses: string[]
  statusConclusao: TStatusFiltroConclusao
  pesquisaGeral: string

  // Filtros aplicados diretamente nas colunas
  diasSelecionados: string[]
  ufsSelecionadas: string[] 
  artistasSelecionados: string[]
  categoriasSelecionadas: string[]

  // Ordenação das linhas dentro de cada mês
  campoOrdenacao: TCampoOrdenacaoAlerta
  direcaoOrdenacao: TDirecaoOrdenacaoAlerta
}

export interface IGrupoHierarquicoMesAlerta {
  chaveGrupo: string
  ano: string
  mesNumero: number
  nomeMesExtenso: string
  rotuloMesAno: string
  alertasOrdenados: IAlertaNotificacao[]
  totalAlertas: number
  totalPendentes: number
}

export type TLinhaVirtualHierarquica =
  | {
      tipo: 'cabecalho_mes'
      chaveUnica: string
      grupo: IGrupoHierarquicoMesAlerta
      aberto: boolean
    }
  | {
      tipo: 'linha_alerta'
      chaveUnica: string
      chaveGrupo: string
      alerta: IAlertaNotificacao
      ehUltimaLinhaDoMes: boolean
    }

export interface INotificacoesContexto {
  listaAlertas: IAlertaNotificacao[]
  cincoAlertasMaisRecentes: IAlertaNotificacao[]
  quantidadeNaoLidasRecentes: number
  filtrosAplicados: IFiltrosAlertas
  rascunhoFiltros: IFiltrosAlertas
  atualizarCampoRascunhoFiltro: <K extends keyof IFiltrosAlertas>(
    campo: K,
    valor: IFiltrosAlertas[K]
  ) => void
  aplicarFiltrosAlertas: () => void
  limparFiltrosAlertas: () => void
  marcarAlertaComoLido: (idAlerta: number) => void
  marcarTodasComoLidas: () => void
  alternarConclusaoAlerta: (idAlerta: number) => void
}
