export interface IStatusEventoCustom {
    id: string
    rotulo: string
    corHex: string
}

export interface IEvento {
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
    cidade: string
    uf: string
    cidade_uf: string
    latitude: number
    longitude: number
    valor_show: string
    comissao: string
    vendedor: string
    producao: string
    status_id: string
}

export type TStatusFiltroRealizado = 'TODOS' | 'REALIZADO' | 'NAO_REALIZADO'
export type TCampoOrdenacaoEvento = 'data' | 'cidade' | 'artista'
export type TDirecaoOrdenacaoEvento = 'asc' | 'desc'

export interface IFiltrosEventos {
    ano: string
    meses: string[]
    realizado: TStatusFiltroRealizado
    pesquisaGeral: string
    diasSelecionados: string[]
    ufsSelecionadas: string[]
    artistasSelecionados: string[]
    vendedoresSelecionados: string[]
    statusSelecionados: string[]
    textoValorShow: string
    textoComissao: string
    textoProducao: string
    campoOrdenacao: TCampoOrdenacaoEvento
    direcaoOrdenacao: TDirecaoOrdenacaoEvento
}

export interface IDistanciaCidadeEvento {
    eventoId: number
    cidade: string
    uf: string
    cidade_uf: string
    artista: string
    data_evento: string
    latitude: number
    longitude: number
    distanciaKm: number
    tempoEstimadoTexto: string
    tempoMinutos: number
}

export interface IGrupoHierarquicoMesEvento {
    chaveGrupo: string
    ano: string
    mesNumero: number
    nomeMesExtenso: string
    rotuloMesAno: string
    eventosOrdenados: IEvento[]
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
        evento: IEvento
        ehUltimaLinhaDoMes: boolean
    }

export interface IEventosContexto {
    listaEventos: IEvento[]
    listaStatus: IStatusEventoCustom[]
    filtrosAplicados: IFiltrosEventos
    rascunhoFiltros: IFiltrosEventos
    atualizarCampoFiltro: <K extends keyof IFiltrosEventos>(
        campo: K,
        valor: IFiltrosEventos[K]
    ) => void
    aplicarFiltros: () => void
    limparFiltros: () => void
    adicionarEvento: (novo: Omit<IEvento, 'id'>) => void
    atualizarEvento: (id: number, dadosParciais: Partial<IEvento>) => void
    excluirEvento: (id: number) => void
    salvarStatusCustom: (status: IStatusEventoCustom) => void
    obterStatusPorId: (statusId: string) => IStatusEventoCustom
}
