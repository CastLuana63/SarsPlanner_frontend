export type TFiltroRealizadoEvento = 'TODOS' | 'REALIZADO' | 'NAO_REALIZADO'

export type TCampoOrdenacaoEvento = 'data' | 'cidade' | 'artista' | 'vendedor'

export type TDirecaoOrdenacaoEvento = 'asc' | 'desc'

export interface IStatusPersonalizadoEvento {
    id: string
    nome: string
    corHex: string
}

export interface IEventoSistema {
    id: number
    seq_empresa: number
    data_evento: string
    dia_evento: string
    mes_referencia: string
    ano_referencia: string
    horario_inicio: string
    horario_fim: string
    realizado: boolean
    artista: string
    estado: string
    uf: string
    cidade: string
    cidade_uf: string
    latitude: number
    longitude: number
    valor_show: string
    comissao: string
    vendedor: string
    producao: string
    status_id: string
    pendencia: string
    anotacoes: string
    data_enviado_contrato: string
    data_assinado_contrato: string
    receita_total: string
    despesa_total: string
    contato_nome_telefone: string
    diaria_sim_nao: 'Sim' | 'Não'
    valor_diaria: string
    custos_producao_local: string
    operacional_producao_local: string
}

export type TDadosFormularioEvento = Omit<
    IEventoSistema,
    'id' | 'dia_evento' | 'mes_referencia' | 'ano_referencia' | 'cidade_uf'
>

export interface IFiltrosEventos {
    ano: string
    meses: string[]
    realizado: TFiltroRealizadoEvento
    pesquisaGeral: string
    artistasSelecionados: string[]
    diasSelecionados: string[]
    ufsSelecionadas: string[]
    vendedoresSelecionados: string[]
    statusSelecionados: string[]
    textoValorShow: string
    textoComissao: string
    textoProducao: string
    campoOrdenacao: TCampoOrdenacaoEvento
    direcaoOrdenacao: TDirecaoOrdenacaoEvento
}

export interface IGrupoHierarquicoMesEvento {
    chaveGrupo: string
    ano: string
    mesNumero: number
    nomeMesExtenso: string
    rotuloMesAno: string
    eventosOrdenados: IEventoSistema[]
    totalEventos: number
}

export type TLinhaVirtualEvento =
    | {
        tipo: 'cabecalho_mes'
        chaveUnica: string
        grupo: IGrupoHierarquicoMesEvento
        aberto: boolean
    }
    | {
        tipo: 'linha_evento'
        chaveUnica: string
        chaveGrupo: string
        evento: IEventoSistema
        ehUltimaLinhaDoMes: boolean
    }

export interface IDistanciaCidadeEvento {
    eventoId: number
    cidade: string
    uf: string
    cidade_uf: string
    artista: string
    dataFormatada: string
    latitude: number
    longitude: number
    distanciaKm: number
    tempoEstimadoTexto: string
    tempoMinutos: number
}


export interface IEventosContexto {
    listaEventos: IEventoSistema[]
    listaStatus: IStatusPersonalizadoEvento[]
    filtrosEventos: IFiltrosEventos
    atualizarCampoFiltroEvento: <K extends keyof IFiltrosEventos>(
        campo: K,
        valor: IFiltrosEventos[K]
    ) => void
    limparTodosFiltrosEventos: () => void
    adicionarEvento: (dados: TDadosFormularioEvento) => void
    atualizarEvento: (idEvento: number, dadosParciais: Partial<IEventoSistema>) => void
    excluirEvento: (idEvento: number) => void
    salvarOuAtualizarStatus: (
        idExistente: string | null,
        nome: string,
        corHex: string
    ) => IStatusPersonalizadoEvento
    obterStatusPorId: (statusId: string) => IStatusPersonalizadoEvento
}
