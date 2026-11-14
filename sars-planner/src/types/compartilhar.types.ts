export type TCategoriaCampoCompartilhar = 'EVENTO' | 'FINANCEIRO' | 'ARTISTA'

export type TTipoValorCampoCompartilhar =
    | 'texto'
    | 'moeda'
    | 'numero'
    | 'data'
    | 'booleano'

export type TIdCampoCompartilhar =
    // Campos de Evento
    | 'ev_dia'
    | 'ev_data'
    | 'ev_horario'
    | 'ev_cidade_uf'
    | 'ev_uf'
    | 'ev_valor_show'
    | 'ev_comissao'
    | 'ev_vendedor'
    | 'ev_producao'
    | 'ev_status'
    | 'ev_realizado'
    // Campos do Financeiro
    | 'fin_contato'
    | 'fin_diaria_sn'
    | 'fin_diaria_valor'
    | 'fin_custos'
    | 'fin_operacional'
    | 'fin_receita_total'
    | 'fin_despesa_total'
    | 'fin_valor_liquido'
    | 'fin_total_pago'
    | 'fin_falta_pagar'
    | 'fin_qtd_parcelas'
    // Campos de Artistas
    | 'art_sigla'
    | 'art_nome_completo'
    | 'art_email'
    | 'art_telefone'
    | 'art_qtd_eventos'

export interface IDefinicaoCampoCompartilhar {
    id: TIdCampoCompartilhar
    categoria: TCategoriaCampoCompartilhar
    rotulo: string
    descricao: string
    tipoValor: TTipoValorCampoCompartilhar
    larguraMinimaPx: number
    alinhamento: 'left' | 'center' | 'right'
}

export interface IFiltroColunasSalvo {
    id: string
    nome: string
    colunas: TIdCampoCompartilhar[]
}

export interface IRegistroUnificadoCompartilhar {
    evento_id: number
    mes_referencia: string
    ano_referencia: string
    data_evento_iso: string
    valoresTexto: Record<TIdCampoCompartilhar, string>
    valoresNumericos: Partial<Record<TIdCampoCompartilhar, number>>
}

export interface IFiltroColunaDinamica {
    textoBusca: string
    valoresSelecionados: string[]
}

export interface IFiltrosCompartilhar {
    artistaTopo: string
    ano: string
    meses: string[]
    statusTopo: string
    pesquisaGeral: string
    filtrosPorColuna: Partial<Record<TIdCampoCompartilhar, IFiltroColunaDinamica>>
    colunaOrdenacao: TIdCampoCompartilhar | null
    direcaoOrdenacao: 'asc' | 'desc'
}

export interface IGrupoHierarquicoMesCompartilhar {
    chaveGrupo: string
    ano: string
    mesNumero: number
    nomeMesExtenso: string
    rotuloMesAno: string
    itensOrdenados: IRegistroUnificadoCompartilhar[]
}

export type TLinhaVirtualCompartilhar =
    | {
        tipo: 'cabecalho_mes'
        chaveUnica: string
        grupo: IGrupoHierarquicoMesCompartilhar
        aberto: boolean
    }
    | {
        tipo: 'linha_dados'
        chaveUnica: string
        chaveGrupo: string
        registro: IRegistroUnificadoCompartilhar
        ehUltimaLinhaDoMes: boolean
    }

export const ROTULOS_CATEGORIAS_COMPARTILHAR: Record<
    TCategoriaCampoCompartilhar,
    string
> = {
    EVENTO: 'Evento',
    FINANCEIRO: 'Financeiro',
    ARTISTA: 'Artistas',
}

export const CATALOGO_CAMPOS_COMPARTILHAR: IDefinicaoCampoCompartilhar[] = [
    // 1. EVENTO
    {
        id: 'ev_dia',
        categoria: 'EVENTO',
        rotulo: 'Dia',
        descricao: 'Dia do mês do evento',
        tipoValor: 'texto',
        larguraMinimaPx: 72,
        alinhamento: 'center',
    },
    {
        id: 'ev_data',
        categoria: 'EVENTO',
        rotulo: 'Data do Show',
        descricao: 'Data completa do evento',
        tipoValor: 'data',
        larguraMinimaPx: 115,
        alinhamento: 'center',
    },
    {
        id: 'ev_horario',
        categoria: 'EVENTO',
        rotulo: 'Horário',
        descricao: 'Faixa de horário de início e fim',
        tipoValor: 'texto',
        larguraMinimaPx: 110,
        alinhamento: 'center',
    },
    {
        id: 'ev_cidade_uf',
        categoria: 'EVENTO',
        rotulo: 'Cidade - UF',
        descricao: 'Município e estado do show',
        tipoValor: 'texto',
        larguraMinimaPx: 175,
        alinhamento: 'left',
    },
    {
        id: 'ev_uf',
        categoria: 'EVENTO',
        rotulo: 'UF',
        descricao: 'Sigla do estado',
        tipoValor: 'texto',
        larguraMinimaPx: 75,
        alinhamento: 'center',
    },
    {
        id: 'ev_valor_show',
        categoria: 'EVENTO',
        rotulo: 'Valor Show',
        descricao: 'Cachê acordado (com soma automática em R$)',
        tipoValor: 'moeda',
        larguraMinimaPx: 195,
        alinhamento: 'right',
    },
    {
        id: 'ev_comissao',
        categoria: 'EVENTO',
        rotulo: 'Comissão',
        descricao: 'Comissão comercial do show',
        tipoValor: 'texto',
        larguraMinimaPx: 115,
        alinhamento: 'center',
    },
    {
        id: 'ev_vendedor',
        categoria: 'EVENTO',
        rotulo: 'Vendedor',
        descricao: 'Responsável pela venda',
        tipoValor: 'texto',
        larguraMinimaPx: 150,
        alinhamento: 'left',
    },
    {
        id: 'ev_producao',
        categoria: 'EVENTO',
        rotulo: 'Anotações / Produção',
        descricao: 'Observações gerais e produção do show',
        tipoValor: 'texto',
        larguraMinimaPx: 175,
        alinhamento: 'left',
    },
    {
        id: 'ev_status',
        categoria: 'EVENTO',
        rotulo: 'Status',
        descricao: 'Status operacional do evento',
        tipoValor: 'texto',
        larguraMinimaPx: 120,
        alinhamento: 'center',
    },
    {
        id: 'ev_realizado',
        categoria: 'EVENTO',
        rotulo: 'Realizado',
        descricao: 'Indica se o evento já ocorreu (S/N)',
        tipoValor: 'booleano',
        larguraMinimaPx: 95,
        alinhamento: 'center',
    },

    // 2. FINANCEIRO
    {
        id: 'fin_contato',
        categoria: 'FINANCEIRO',
        rotulo: 'Nome/Telefone',
        descricao: 'Contato financeiro do contratante',
        tipoValor: 'texto',
        larguraMinimaPx: 195,
        alinhamento: 'left',
    },
    {
        id: 'fin_diaria_sn',
        categoria: 'FINANCEIRO',
        rotulo: 'Diária S/N',
        descricao: 'Possui diária inclusa (S/N)',
        tipoValor: 'booleano',
        larguraMinimaPx: 95,
        alinhamento: 'center',
    },
    {
        id: 'fin_diaria_valor',
        categoria: 'FINANCEIRO',
        rotulo: 'Valor Diária',
        descricao: 'Valor em R$ da diária (com soma automática)',
        tipoValor: 'moeda',
        larguraMinimaPx: 175,
        alinhamento: 'right',
    },
    {
        id: 'fin_custos',
        categoria: 'FINANCEIRO',
        rotulo: 'Custos',
        descricao: 'Responsável pelos custos locais',
        tipoValor: 'texto',
        larguraMinimaPx: 140,
        alinhamento: 'left',
    },
    {
        id: 'fin_operacional',
        categoria: 'FINANCEIRO',
        rotulo: 'Operacional',
        descricao: 'Responsável operacional local',
        tipoValor: 'texto',
        larguraMinimaPx: 140,
        alinhamento: 'left',
    },
    {
        id: 'fin_receita_total',
        categoria: 'FINANCEIRO',
        rotulo: 'Receita Total',
        descricao: 'Soma líquida das parcelas (com soma automática)',
        tipoValor: 'moeda',
        larguraMinimaPx: 190,
        alinhamento: 'right',
    },
    {
        id: 'fin_despesa_total',
        categoria: 'FINANCEIRO',
        rotulo: 'Despesa Total',
        descricao: 'Total de despesas lançadas (com soma automática)',
        tipoValor: 'moeda',
        larguraMinimaPx: 190,
        alinhamento: 'right',
    },
    {
        id: 'fin_valor_liquido',
        categoria: 'FINANCEIRO',
        rotulo: 'Valor Líquido',
        descricao: 'Receita menos despesas (com soma automática)',
        tipoValor: 'moeda',
        larguraMinimaPx: 190,
        alinhamento: 'right',
    },
    {
        id: 'fin_total_pago',
        categoria: 'FINANCEIRO',
        rotulo: 'Total Pago',
        descricao: 'Valor das parcelas quitadas (com soma automática)',
        tipoValor: 'moeda',
        larguraMinimaPx: 185,
        alinhamento: 'right',
    },
    {
        id: 'fin_falta_pagar',
        categoria: 'FINANCEIRO',
        rotulo: 'Falta Pagar',
        descricao: 'Saldo pendente a receber (com soma automática)',
        tipoValor: 'moeda',
        larguraMinimaPx: 185,
        alinhamento: 'right',
    },
    {
        id: 'fin_qtd_parcelas',
        categoria: 'FINANCEIRO',
        rotulo: 'Qtd. Parcelas',
        descricao: 'Número de parcelas do evento (com soma automática)',
        tipoValor: 'numero',
        larguraMinimaPx: 145,
        alinhamento: 'center',
    },

    // 3. ARTISTAS
    {
        id: 'art_sigla',
        categoria: 'ARTISTA',
        rotulo: 'Artista',
        descricao: 'Nome social / sigla do artista',
        tipoValor: 'texto',
        larguraMinimaPx: 95,
        alinhamento: 'center',
    },
    {
        id: 'art_nome_completo',
        categoria: 'ARTISTA',
        rotulo: 'Nome Artista',
        descricao: 'Nome completo do artista ou dupla',
        tipoValor: 'texto',
        larguraMinimaPx: 180,
        alinhamento: 'left',
    },
    {
        id: 'art_email',
        categoria: 'ARTISTA',
        rotulo: 'E-mail Artista',
        descricao: 'E-mail de contato do artista',
        tipoValor: 'texto',
        larguraMinimaPx: 190,
        alinhamento: 'left',
    },
    {
        id: 'art_telefone',
        categoria: 'ARTISTA',
        rotulo: 'Telefone Artista',
        descricao: 'Telefone cadastrado no artista',
        tipoValor: 'texto',
        larguraMinimaPx: 145,
        alinhamento: 'left',
    },
    {
        id: 'art_qtd_eventos',
        categoria: 'ARTISTA',
        rotulo: 'Shows do Artista',
        descricao: 'Quantidade de eventos do artista (com soma automática)',
        tipoValor: 'numero',
        larguraMinimaPx: 160,
        alinhamento: 'center',
    },
]

export const CAMPOS_SELECIONADOS_PADRAO: TIdCampoCompartilhar[] = [
    'ev_dia',
    'ev_cidade_uf',
    'fin_contato',
    'fin_diaria_sn',
    'fin_diaria_valor',
    'fin_custos',
    'fin_operacional',
    'ev_producao',
    'ev_valor_show',
]

export const FILTROS_SALVOS_INICIAIS: IFiltroColunasSalvo[] = [
    {
        id: 'padrao-logistica',
        nome: 'Logística e Produção',
        colunas: [
            'ev_dia',
            'ev_cidade_uf',
            'fin_contato',
            'fin_diaria_sn',
            'fin_diaria_valor',
            'fin_custos',
            'fin_operacional',
            'ev_producao',
        ],
    },
    {
        id: 'padrao-financeiro',
        nome: 'Resumo Financeiro',
        colunas: [
            'ev_dia',
            'ev_data',
            'ev_cidade_uf',
            'art_sigla',
            'ev_valor_show',
            'fin_receita_total',
            'fin_despesa_total',
            'fin_valor_liquido',
        ],
    },
]
