export type TStatusParcela = 'OK' | 'NAO_OK'

export interface IParcelaPagamento {
    id: number
    numero_parcela: number
    data_pagamento: string 
    valor_bruto: number
    status: TStatusParcela
}

export interface IDespesaEvento {
    id: number
    data_despesa: string 
    valor: number
    justificativa: string
}

export interface IDadosFinanceiroEvento {
    evento_id: number
    contato_nome_telefone: string
    diaria_ativa: boolean
    diaria_valor: number
    producao_custos: string
    producao_operacional: string
    desconto_percentual: number 
    parcelas: IParcelaPagamento[]
    despesas: IDespesaEvento[]
}

export interface IResumoCalculadoFinanceiroEvento {
    evento_id: number
    dia_evento: string
    data_evento: string
    mes_referencia: string
    ano_referencia: string
    cidade: string
    uf: string
    cidade_uf: string
    artista: string
    contato_nome_telefone: string
    diaria_ativa: boolean
    diaria_valor: number
    producao_custos: string
    producao_operacional: string
    desconto_percentual: number
    parcelas: IParcelaPagamento[]
    despesas: IDespesaEvento[]
    receitaBrutaParcelas: number
    valorDesconto: number
    receitaTotal: number
    despesaTotal: number
    valorLiquido: number
    totalPago: number
    totalFaltaPagar: number
    quantidadeParcelasTotal: number
    quantidadeParcelasPagas: number
    statusQuitacao: 'QUITADO' | 'PENDENTE' | 'SEM_LANCAMENTO'
}

export type TStatusFiltroFinanceiro =
    | 'TODOS'
    | 'PENDENTE'
    | 'QUITADO'
    | 'SEM_LANCAMENTO'

export type TCampoOrdenacaoFinanceiro =
    | 'data'
    | 'cidade'
    | 'artista'
    | 'receita'
    | 'despesa'
    | 'liquido'

export type TDirecaoOrdenacaoFinanceiro = 'asc' | 'desc'

export interface IFiltrosFinanceiro {
    ano: string
    meses: string[]
    statusQuitacao: TStatusFiltroFinanceiro
    pesquisaGeral: string
    diasSelecionados: string[]
    ufsSelecionadas: string[]
    artistasSelecionados: string[]
    textoReceitaMinima: string
    textoDespesaMinima: string
    textoLiquidoMinimo: string
    campoOrdenacao: TCampoOrdenacaoFinanceiro
    direcaoOrdenacao: TDirecaoOrdenacaoFinanceiro
}

export interface IGrupoHierarquicoMesFinanceiro {
    chaveGrupo: string
    ano: string
    mesNumero: number
    nomeMesExtenso: string
    rotuloMesAno: string
    itensOrdenados: IResumoCalculadoFinanceiroEvento[]
    totalReceitaMes: number
    totalDespesaMes: number
    totalLiquidoMes: number
}

export type TLinhaVirtualFinanceiro =
    | {
        tipo: 'cabecalho_mes'
        chaveUnica: string
        grupo: IGrupoHierarquicoMesFinanceiro
        aberto: boolean
    }
    | {
        tipo: 'linha_financeiro'
        chaveUnica: string
        chaveGrupo: string
        registro: IResumoCalculadoFinanceiroEvento
        ehUltimaLinhaDoMes: boolean
    }

export interface IFinanceiroContexto {
    registrosCalculados: IResumoCalculadoFinanceiroEvento[]
    filtrosAplicados: IFiltrosFinanceiro
    rascunhoFiltros: IFiltrosFinanceiro
    atualizarCampoFiltro: <K extends keyof IFiltrosFinanceiro>(
        campo: K,
        valor: IFiltrosFinanceiro[K]
    ) => void
    aplicarFiltros: () => void
    limparFiltros: () => void
    obterFinanceiroPorEventoId: (
        eventoId: number
    ) => IResumoCalculadoFinanceiroEvento | null
    atualizarDadosCompartilharEvento: (
        eventoId: number,
        dadosParciais: Partial<
            Pick<
                IDadosFinanceiroEvento,
                | 'contato_nome_telefone'
                | 'diaria_ativa'
                | 'diaria_valor'
                | 'producao_custos'
                | 'producao_operacional'
                | 'desconto_percentual'
            >
        >
    ) => void
    adicionarParcela: (
        eventoId: number,
        novaParcela: Omit<IParcelaPagamento, 'id'>
    ) => void
    gerarParcelasAutomaticas: (
        eventoId: number,
        quantidadeParcelas: number,
        valorTotalBruto: number,
        primeiraDataIso: string
    ) => void
    atualizarParcela: (
        eventoId: number,
        parcelaId: number,
        dadosParciais: Partial<IParcelaPagamento>
    ) => void
    excluirParcela: (eventoId: number, parcelaId: number) => void
    adicionarDespesa: (
        eventoId: number,
        novaDespesa: Omit<IDespesaEvento, 'id'>
    ) => void
    atualizarDespesa: (
        eventoId: number,
        despesaId: number,
        dadosParciais: Partial<IDespesaEvento>
    ) => void
    excluirDespesa: (eventoId: number, despesaId: number) => void
}

/**
 * Formata um número para moeda Real Brasileiro: R$ 150.000,00
 */
export const formatarMoedaBRL = (valor: number): string => {
    const numeroSeguro = Number.isFinite(valor) ? valor : 0
    return numeroSeguro.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

/**
 * Converte strings como "250.000,00", "50K", "3,5K" ou "1500" em número puro
 */
export const converterTextoParaValorMonetario = (texto: string): number => {
    if (!texto) return 0
    const limpo = texto.trim().toUpperCase().replace(/R\$\s?/g, '')
    if (limpo.endsWith('K')) {
        const base = parseFloat(limpo.replace('K', '').replace(',', '.'))
        return Number.isFinite(base) ? base * 1000 : 0
    }
    const normalizado =
        limpo.includes(',') && limpo.includes('.')
            ? limpo.replace(/\./g, '').replace(',', '.')
            : limpo.replace(',', '.')
    const num = parseFloat(normalizado)
    return Number.isFinite(num) ? num : 0
}
