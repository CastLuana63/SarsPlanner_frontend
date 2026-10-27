export type TStatusFiltroConclusao = 'NAO_CONCLUIDO' | 'CONCLUIDO' | 'TODOS'

export interface IAlertaNotificacao {
    id: number
    seq_evento: number
    dia_vencimento: string
    data_vencimento_iso: string
    mes_referencia: string 
    ano_referencia: string 
    grupo_mes_ano: string
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
    artista: string
    statusConclusao: TStatusFiltroConclusao
    ano: string
    mes: string
    cidade: string
    uf: string
    categoria: string
    descricao: string
}

export interface IGrupoHierarquicoMesAlerta {
    chaveGrupo: string 
    ano: string
    mesNumero: number 
    nomeMesExtenso: string 
    rotuloMesAno: string 
    alertasOrdenadosRecentes: IAlertaNotificacao[]
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
        tipo: 'cabecalho_colunas'
        chaveUnica: string
        chaveGrupo: string
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
