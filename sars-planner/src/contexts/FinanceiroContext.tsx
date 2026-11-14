import React, { createContext, useContext, useState, useMemo, useEffect } from 'react'
import financeiroMock from '@/mocks/financeiroMock.json'
import { useEventos } from '@/contexts/EventosContext'
import type {
    IDadosFinanceiroEvento,
    IFiltrosFinanceiro,
    IFinanceiroContexto,
    IParcelaPagamento,
    IResumoCalculadoFinanceiroEvento,
} from '@/types/financeiro.types'

const CHAVE_STORAGE_FINANCEIRO = '@SarsPlanner:dadosFinanceiros:v1'
const CHAVE_STORAGE_FILTROS_FINANCEIRO = '@SarsPlanner:filtrosFinanceiro:v1'

export const FILTROS_FINANCEIRO_INICIAIS: IFiltrosFinanceiro = {
    ano: String(new Date().getFullYear()),
    meses: [],
    statusQuitacao: 'TODOS',
    pesquisaGeral: '',
    diasSelecionados: [],
    ufsSelecionadas: [],
    artistasSelecionados: [],
    textoReceitaMinima: '',
    textoDespesaMinima: '',
    textoLiquidoMinimo: '',
    campoOrdenacao: 'data',
    direcaoOrdenacao: 'desc',
}

const FinanceiroContext = createContext<IFinanceiroContexto | undefined>(
    undefined
)

export const FinanceiroProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { listaEventos } = useEventos()

    const [mapaFinanceiro, setMapaFinanceiro] = useState<
        IDadosFinanceiroEvento[]
    >(() => {
        const salvo = localStorage.getItem(CHAVE_STORAGE_FINANCEIRO)
        if (salvo) {
            try {
                return JSON.parse(salvo) as IDadosFinanceiroEvento[]
            } catch {
                localStorage.removeItem(CHAVE_STORAGE_FINANCEIRO)
            }
        }
        return financeiroMock as IDadosFinanceiroEvento[]
    })

    const [filtrosAplicados, setFiltrosAplicados] = useState<IFiltrosFinanceiro>(
        () => {
            const salvo = localStorage.getItem(CHAVE_STORAGE_FILTROS_FINANCEIRO)
            if (salvo) {
                try {
                    return { ...FILTROS_FINANCEIRO_INICIAIS, ...JSON.parse(salvo) }
                } catch {
                    localStorage.removeItem(CHAVE_STORAGE_FILTROS_FINANCEIRO)
                }
            }
            return FILTROS_FINANCEIRO_INICIAIS
        }
    )

    const [rascunhoFiltros, setRascunhoFiltros] =
        useState<IFiltrosFinanceiro>(filtrosAplicados)

    useEffect(() => {
        localStorage.setItem(
            CHAVE_STORAGE_FINANCEIRO,
            JSON.stringify(mapaFinanceiro)
        )
    }, [mapaFinanceiro])

    useEffect(() => {
        localStorage.setItem(
            CHAVE_STORAGE_FILTROS_FINANCEIRO,
            JSON.stringify(filtrosAplicados)
        )
    }, [filtrosAplicados])

    const registrosCalculados = useMemo<IResumoCalculadoFinanceiroEvento[]>(() => {
        return listaEventos.map((evento) => {
            const finExistente = mapaFinanceiro.find(
                (f) => f.evento_id === evento.id
            ) || {
                evento_id: evento.id,
                contato_nome_telefone: `${evento.vendedor} (Definir telefone)`,
                diaria_ativa: false,
                diaria_valor: 0,
                producao_custos: 'CONTRATANTE',
                producao_operacional: 'CONTRATANTE',
                desconto_percentual: 0,
                parcelas: [],
                despesas: [],
            }

            const descontoPct = Math.min(
                100,
                Math.max(0, Number(finExistente.desconto_percentual) || 0)
            )
            const fatorMultiplicadorDesconto = 1 - descontoPct / 100

            const receitaBrutaParcelas = finExistente.parcelas.reduce(
                (acc, p) => acc + (Number(p.valor_bruto) || 0),
                0
            )
            const valorDesconto = receitaBrutaParcelas * (descontoPct / 100)
            const receitaTotal = receitaBrutaParcelas - valorDesconto

            const despesaTotal = finExistente.despesas.reduce(
                (acc, d) => acc + (Number(d.valor) || 0),
                0
            )

            const valorLiquido = receitaTotal - despesaTotal

            const totalPago = finExistente.parcelas
                .filter((p) => p.status === 'OK')
                .reduce(
                    (acc, p) =>
                        acc + (Number(p.valor_bruto) || 0) * fatorMultiplicadorDesconto,
                    0
                )

            const totalFaltaPagar = Math.max(0, receitaTotal - totalPago)

            const quantidadeParcelasTotal = finExistente.parcelas.length
            const quantidadeParcelasPagas = finExistente.parcelas.filter(
                (p) => p.status === 'OK'
            ).length

            let statusQuitacao: 'QUITADO' | 'PENDENTE' | 'SEM_LANCAMENTO' =
                'SEM_LANCAMENTO'
            if (quantidadeParcelasTotal > 0) {
                statusQuitacao =
                    quantidadeParcelasPagas === quantidadeParcelasTotal
                        ? 'QUITADO'
                        : 'PENDENTE'
            }

            return {
                evento_id: evento.id,
                dia_evento: evento.dia_evento,
                data_evento: evento.data_evento,
                mes_referencia: evento.mes_referencia,
                ano_referencia: evento.ano_referencia,
                cidade: evento.cidade,
                uf: evento.uf,
                cidade_uf: evento.cidade_uf,
                artista: evento.artista,
                contato_nome_telefone: finExistente.contato_nome_telefone,
                diaria_ativa: finExistente.diaria_ativa,
                diaria_valor: finExistente.diaria_valor,
                producao_custos: finExistente.producao_custos,
                producao_operacional: finExistente.producao_operacional,
                desconto_percentual: descontoPct,
                parcelas: finExistente.parcelas,
                despesas: finExistente.despesas,
                receitaBrutaParcelas,
                valorDesconto,
                receitaTotal,
                despesaTotal,
                valorLiquido,
                totalPago,
                totalFaltaPagar,
                quantidadeParcelasTotal,
                quantidadeParcelasPagas,
                statusQuitacao,
            }
        })
    }, [listaEventos, mapaFinanceiro])

    const garantirRegistroNoMapa = (
        lista: IDadosFinanceiroEvento[],
        eventoId: number
    ): IDadosFinanceiroEvento[] => {
        if (lista.some((item) => item.evento_id === eventoId)) return lista
        return [
            ...lista,
            {
                evento_id: eventoId,
                contato_nome_telefone: '',
                diaria_ativa: false,
                diaria_valor: 0,
                producao_custos: 'CONTRATANTE',
                producao_operacional: 'CONTRATANTE',
                desconto_percentual: 0,
                parcelas: [],
                despesas: [],
            },
        ]
    }

    const atualizarCampoFiltro = <K extends keyof IFiltrosFinanceiro>(
        campo: K,
        valor: IFiltrosFinanceiro[K]
    ) => {
        setRascunhoFiltros((anterior) => {
            const novo = { ...anterior, [campo]: valor }
            setFiltrosAplicados(novo)
            return novo
        })
    }

    const aplicarFiltros = () => {
        setFiltrosAplicados(rascunhoFiltros)
    }

    const limparFiltros = () => {
        setRascunhoFiltros(FILTROS_FINANCEIRO_INICIAIS)
        setFiltrosAplicados(FILTROS_FINANCEIRO_INICIAIS)
        localStorage.removeItem(CHAVE_STORAGE_FILTROS_FINANCEIRO)
    }

    const obterFinanceiroPorEventoId = (
        eventoId: number
    ): IResumoCalculadoFinanceiroEvento | null => {
        return (
            registrosCalculados.find((r) => r.evento_id === Number(eventoId)) || null
        )
    }

    const atualizarDadosCompartilharEvento: IFinanceiroContexto['atualizarDadosCompartilharEvento'] =
        (eventoId, dadosParciais) => {
            setMapaFinanceiro((anterior) => {
                const base = garantirRegistroNoMapa(anterior, eventoId)
                return base.map((item) =>
                    item.evento_id === eventoId ? { ...item, ...dadosParciais } : item
                )
            })
        }

    const adicionarParcela: IFinanceiroContexto['adicionarParcela'] = (
        eventoId,
        novaParcela
    ) => {
        setMapaFinanceiro((anterior) => {
            const base = garantirRegistroNoMapa(anterior, eventoId)
            return base.map((item) => {
                if (item.evento_id !== eventoId) return item
                const novoId =
                    item.parcelas.length > 0
                        ? Math.max(...item.parcelas.map((p) => p.id)) + 1
                        : 1
                const parcelasAtualizadas = [
                    ...item.parcelas,
                    { ...novaParcela, id: novoId },
                ].sort((a, b) => a.numero_parcela - b.numero_parcela)
                return { ...item, parcelas: parcelasAtualizadas }
            })
        })
    }

    const gerarParcelasAutomaticas: IFinanceiroContexto['gerarParcelasAutomaticas'] =
        (eventoId, quantidadeParcelas, valorTotalBruto, primeiraDataIso) => {
            if (quantidadeParcelas <= 0 || valorTotalBruto <= 0) return
            const valorBaseParcela =
                Math.floor((valorTotalBruto / quantidadeParcelas) * 100) / 100
            const diferencaCentavos =
                Math.round(
                    (valorTotalBruto - valorBaseParcela * quantidadeParcelas) * 100
                ) / 100

            const [anoBase, mesBase, diaBase] = (
                primeiraDataIso || '2026-10-15'
            )
                .split('-')
                .map(Number)

            const novasParcelas: IParcelaPagamento[] = Array.from(
                { length: quantidadeParcelas },
                (_, idx) => {
                    const dataObj = new Date(anoBase, mesBase - 1 + idx, diaBase || 15)
                    const dataIso = `${dataObj.getFullYear()}-${String(
                        dataObj.getMonth() + 1
                    ).padStart(2, '0')}-${String(dataObj.getDate()).padStart(2, '0')}`

                    return {
                        id: Date.now() + idx,
                        numero_parcela: idx + 1,
                        data_pagamento: dataIso,
                        valor_bruto:
                            idx === 0
                                ? Number((valorBaseParcela + diferencaCentavos).toFixed(2))
                                : valorBaseParcela,
                        status: 'NAO_OK',
                    }
                }
            )

            setMapaFinanceiro((anterior) => {
                const base = garantirRegistroNoMapa(anterior, eventoId)
                return base.map((item) =>
                    item.evento_id === eventoId
                        ? { ...item, parcelas: novasParcelas }
                        : item
                )
            })
        }

    const atualizarParcela: IFinanceiroContexto['atualizarParcela'] = (
        eventoId,
        parcelaId,
        dadosParciais
    ) => {
        setMapaFinanceiro((anterior) =>
            anterior.map((item) => {
                if (item.evento_id !== eventoId) return item
                return {
                    ...item,
                    parcelas: item.parcelas.map((p) =>
                        p.id === parcelaId ? { ...p, ...dadosParciais } : p
                    ),
                }
            })
        )
    }

    const excluirParcela: IFinanceiroContexto['excluirParcela'] = (
        eventoId,
        parcelaId
    ) => {
        setMapaFinanceiro((anterior) =>
            anterior.map((item) => {
                if (item.evento_id !== eventoId) return item
                return {
                    ...item,
                    parcelas: item.parcelas.filter((p) => p.id !== parcelaId),
                }
            })
        )
    }

    const adicionarDespesa: IFinanceiroContexto['adicionarDespesa'] = (
        eventoId,
        novaDespesa
    ) => {
        setMapaFinanceiro((anterior) => {
            const base = garantirRegistroNoMapa(anterior, eventoId)
            return base.map((item) => {
                if (item.evento_id !== eventoId) return item
                const novoId =
                    item.despesas.length > 0
                        ? Math.max(...item.despesas.map((d) => d.id)) + 1
                        : 1
                return {
                    ...item,
                    despesas: [...item.despesas, { ...novaDespesa, id: novoId }],
                }
            })
        })
    }

    const atualizarDespesa: IFinanceiroContexto['atualizarDespesa'] = (
        eventoId,
        despesaId,
        dadosParciais
    ) => {
        setMapaFinanceiro((anterior) =>
            anterior.map((item) => {
                if (item.evento_id !== eventoId) return item
                return {
                    ...item,
                    despesas: item.despesas.map((d) =>
                        d.id === despesaId ? { ...d, ...dadosParciais } : d
                    ),
                }
            })
        )
    }

    const excluirDespesa: IFinanceiroContexto['excluirDespesa'] = (
        eventoId,
        despesaId
    ) => {
        setMapaFinanceiro((anterior) =>
            anterior.map((item) => {
                if (item.evento_id !== eventoId) return item
                return {
                    ...item,
                    despesas: item.despesas.filter((d) => d.id !== despesaId),
                }
            })
        )
    }

    return (
        <FinanceiroContext.Provider
            value={{
                registrosCalculados,
                filtrosAplicados,
                rascunhoFiltros,
                atualizarCampoFiltro,
                aplicarFiltros,
                limparFiltros,
                obterFinanceiroPorEventoId,
                atualizarDadosCompartilharEvento,
                adicionarParcela,
                gerarParcelasAutomaticas,
                atualizarParcela,
                excluirParcela,
                adicionarDespesa,
                atualizarDespesa,
                excluirDespesa,
            }}
        >
            {children}
        </FinanceiroContext.Provider>
    )
}

export const useFinanceiro = (): IFinanceiroContexto => {
    const contexto = useContext(FinanceiroContext)
    if (!contexto) {
        throw new Error(
            'useFinanceiro deve ser utilizado dentro de um FinanceiroProvider'
        )
    }
    return contexto
}
