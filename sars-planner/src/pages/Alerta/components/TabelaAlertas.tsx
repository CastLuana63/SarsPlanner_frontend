import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import {
    ChevronRight,
    ChevronDown,
    Flag,
    Check,
    DollarSign,
    Calendar,
    MapPin,
    ChevronsUpDown,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    Filter,
} from 'lucide-react'
import { useVirtualizacao } from '@/hooks/useVirtualizacao'
import type {
    IAlertaNotificacao,
    IFiltrosAlertas,
    IGrupoHierarquicoMesAlerta,
    TLinhaVirtualHierarquica,
} from '@/types/notificacao.types'

const NOMES_MESES_POR_NUMERO: Record<number, string> = {
    1: 'Janeiro',
    2: 'Fevereiro',
    3: 'Março',
    4: 'Abril',
    5: 'Maio',
    6: 'Junho',
    7: 'Julho',
    8: 'Agosto',
    9: 'Setembro',
    10: 'Outubro',
    11: 'Novembro',
    12: 'Dezembro',
}

const DIAS_DO_MES_CALENDARIO = Array.from({ length: 31 }, (_, idx) =>
    String(idx + 1).padStart(2, '0')
)

const GRADE_COLUNAS_TEMPLATE =
    'grid-cols-[74px_98px_minmax(160px,1.2fr)_96px_124px_minmax(220px,2.2fr)_78px]'

type TDropdownColunaAtivo = 'dia' | 'uf' | 'artista' | 'categoria' | null

interface ITabelaAlertasProps {
    alertasFiltrados: IAlertaNotificacao[]
    filtros: IFiltrosAlertas
    opcoesUfs: string[]
    opcoesArtistas: string[]
    opcoesCategorias: string[]
    aoAlterarCampoFiltro: <K extends keyof IFiltrosAlertas>(
        campo: K,
        valor: IFiltrosAlertas[K]
    ) => void
    aoAlternarConclusao: (idAlerta: number) => void
    aoMarcarComoLido: (idAlerta: number) => void
}

export const TabelaAlertas: React.FC<ITabelaAlertasProps> = ({
    alertasFiltrados,
    filtros,
    opcoesUfs,
    opcoesArtistas,
    opcoesCategorias,
    aoAlterarCampoFiltro,
    aoAlternarConclusao,
    aoMarcarComoLido,
}) => {
    const [dropdownColunaAberto, setDropdownColunaAberto] =
        useState<TDropdownColunaAtivo>(null)
    const cabecalhoColunasRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const manipularCliqueFora = (evento: MouseEvent) => {
            if (
                cabecalhoColunasRef.current &&
                !cabecalhoColunasRef.current.contains(evento.target as Node)
            ) {
                setDropdownColunaAberto(null)
            }
        }
        document.addEventListener('mousedown', manipularCliqueFora)
        return () => document.removeEventListener('mousedown', manipularCliqueFora)
    }, [])

    const alternarItemArrayFiltro = (
        campo:
            | 'diasSelecionados'
            | 'ufsSelecionadas'
            | 'artistasSelecionados'
            | 'categoriasSelecionadas',
        valor: string
    ) => {
        const listaAtual = filtros[campo]
        const existe = listaAtual.includes(valor)
        const novaLista = existe
            ? listaAtual.filter((item) => item !== valor)
            : [...listaAtual, valor].sort()
        aoAlterarCampoFiltro(campo, novaLista)
    }

    const alternarOrdenacaoData = () => {
        if (filtros.campoOrdenacao === 'data') {
            aoAlterarCampoFiltro(
                'direcaoOrdenacao',
                filtros.direcaoOrdenacao === 'desc' ? 'asc' : 'desc'
            )
        } else {
            aoAlterarCampoFiltro('campoOrdenacao', 'data')
            aoAlterarCampoFiltro('direcaoOrdenacao', 'desc')
        }
    }

    const alternarOrdenacaoCidade = () => {
        if (filtros.campoOrdenacao === 'cidade') {
            aoAlterarCampoFiltro(
                'direcaoOrdenacao',
                filtros.direcaoOrdenacao === 'asc' ? 'desc' : 'asc'
            )
        } else {
            aoAlterarCampoFiltro('campoOrdenacao', 'cidade')
            aoAlterarCampoFiltro('direcaoOrdenacao', 'asc')
        }
    }

    const gruposHierarquicos = useMemo<IGrupoHierarquicoMesAlerta[]>(() => {
        const mapaGrupos = new Map<string, IAlertaNotificacao[]>()

        for (const alerta of alertasFiltrados) {
            const mesPadronizado = alerta.mes_referencia.padStart(2, '0')
            const chave = `${alerta.ano_referencia}-${mesPadronizado}`
            const listaAtual = mapaGrupos.get(chave) || []
            listaAtual.push(alerta)
            mapaGrupos.set(chave, listaAtual)
        }

        const grupos: IGrupoHierarquicoMesAlerta[] = Array.from(
            mapaGrupos.entries()
        ).map(([chaveGrupo, itensDoMes]) => {
            const [ano, mesStr] = chaveGrupo.split('-')
            const mesNumero = Number(mesStr)
            const nomeMesExtenso = NOMES_MESES_POR_NUMERO[mesNumero] || `Mês ${mesStr}`
            const alertasOrdenados = [...itensDoMes].sort((a, b) => {
                if (filtros.campoOrdenacao === 'cidade') {
                    const comparacaoCidade = a.cidade.localeCompare(b.cidade, 'pt-BR', {
                        sensitivity: 'base',
                    })
                    return filtros.direcaoOrdenacao === 'asc'
                        ? comparacaoCidade
                        : -comparacaoCidade
                }

                const comparacaoData = a.data_vencimento_iso.localeCompare(
                    b.data_vencimento_iso
                )
                return filtros.direcaoOrdenacao === 'asc'
                    ? comparacaoData
                    : -comparacaoData
            })

            const totalPendentes = alertasOrdenados.filter(
                (item) => !item.concluida
            ).length

            return {
                chaveGrupo,
                ano,
                mesNumero,
                nomeMesExtenso,
                rotuloMesAno: `${nomeMesExtenso} / ${ano}`,
                alertasOrdenados,
                totalAlertas: alertasOrdenados.length,
                totalPendentes,
            }
        })

        return grupos.sort((a, b) => {
            if (a.ano !== b.ano) {
                return b.ano.localeCompare(a.ano)
            }
            return a.mesNumero - b.mesNumero
        })
    }, [alertasFiltrados, filtros.campoOrdenacao, filtros.direcaoOrdenacao])

    const [mesesAbertos, setMesesAbertos] = useState<Record<string, boolean>>({})

    useEffect(() => {
        setMesesAbertos((estadoAnterior) => {
            const novoMapa: Record<string, boolean> = {}
            for (const grupo of gruposHierarquicos) {
                novoMapa[grupo.chaveGrupo] =
                    estadoAnterior[grupo.chaveGrupo] !== undefined
                        ? estadoAnterior[grupo.chaveGrupo]
                        : true
            }
            return novoMapa
        })
    }, [gruposHierarquicos])

    const alternarMesAberto = (chaveGrupo: string) => {
        setMesesAbertos((estadoAnterior) => ({
            ...estadoAnterior,
            [chaveGrupo]: !estadoAnterior[chaveGrupo],
        }))
    }

    const todosEstaoAbertos = useMemo(() => {
        if (gruposHierarquicos.length === 0) return false
        return gruposHierarquicos.every((g) => mesesAbertos[g.chaveGrupo])
    }, [gruposHierarquicos, mesesAbertos])

    const alternarTodosMeses = () => {
        const novoValor = !todosEstaoAbertos
        const novoMapa: Record<string, boolean> = {}
        for (const grupo of gruposHierarquicos) {
            novoMapa[grupo.chaveGrupo] = novoValor
        }
        setMesesAbertos(novoMapa)
    }

    const linhasVirtuais = useMemo<TLinhaVirtualHierarquica[]>(() => {
        const listaPlana: TLinhaVirtualHierarquica[] = []

        for (const grupo of gruposHierarquicos) {
            const aberto = Boolean(mesesAbertos[grupo.chaveGrupo])

            listaPlana.push({
                tipo: 'cabecalho_mes',
                chaveUnica: `mes-${grupo.chaveGrupo}`,
                grupo,
                aberto,
            })

            if (aberto) {
                grupo.alertasOrdenados.forEach((alerta, idx) => {
                    listaPlana.push({
                        tipo: 'linha_alerta',
                        chaveUnica: `alerta-${grupo.chaveGrupo}-${alerta.id}`,
                        chaveGrupo: grupo.chaveGrupo,
                        alerta,
                        ehUltimaLinhaDoMes: idx === grupo.alertasOrdenados.length - 1,
                    })
                })
            }
        }

        return listaPlana
    }, [gruposHierarquicos, mesesAbertos])

    const obterAlturaItemPx = useCallback((item: TLinhaVirtualHierarquica) => {
        if (item.tipo === 'cabecalho_mes') return 30
        return 30
    }, [])

    const ALTURA_VIEWPORT_VIRTUAL_PX = 480

    const { alturaTotalPx, itensVisiveis, manipularScroll } = useVirtualizacao({
        itens: linhasVirtuais,
        alturaContainerPx: ALTURA_VIEWPORT_VIRTUAL_PX,
        obterAlturaItemPx,
        overscan: 10,
    })

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_6px_rgba(15,23,42,0.02)] overflow-visible">
            <div className="px-3.5 py-1.5 bg-slate-50 border-b border-slate-200 rounded-t-xl flex flex-wrap items-center justify-between gap-2 print:hidden">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                    <span>
                        Agrupamento Mensal ({gruposHierarquicos.length}{' '}
                        {gruposHierarquicos.length === 1 ? 'mês' : 'meses'})
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[10.5px] text-slate-500">
                        Ordenação ativa:{' '}
                        <strong className="text-slate-700">
                            {filtros.campoOrdenacao === 'data'
                                ? `Data (${filtros.direcaoOrdenacao === 'desc' ? 'Mais recente ↓' : 'Mais antiga ↑'})`
                                : `Cidade (${filtros.direcaoOrdenacao === 'asc' ? 'A–Z' : 'Z–A'})`}
                        </strong>
                    </span>
                </div>

                {gruposHierarquicos.length > 0 && (
                    <button
                        type="button"
                        onClick={alternarTodosMeses}
                        className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-0.5 text-[10.5px] font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                    >
                        <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                        <span>{todosEstaoAbertos ? 'Recolher meses' : 'Expandir meses'}</span>
                    </button>
                )}
            </div>

            <div className="overflow-x-auto print:hidden">
                <div className="min-w-[840px]">
                    <div
                        ref={cabecalhoColunasRef}
                        className={`relative grid ${GRADE_COLUNAS_TEMPLATE} items-center h-8 bg-slate-200/95 border-b border-slate-300 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-700 select-none z-30`}
                    >
                        <div className="relative px-1.5 flex items-center justify-center">
                            <button
                                type="button"
                                onClick={() =>
                                    setDropdownColunaAberto((atual) =>
                                        atual === 'dia' ? null : 'dia'
                                    )
                                }
                                className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 transition cursor-pointer ${filtros.diasSelecionados.length > 0 ||
                                    filtros.campoOrdenacao === 'data'
                                    ? 'text-[#1056f5] bg-blue-50/80'
                                    : 'hover:bg-slate-300/60 text-slate-700'
                                    }`}
                            >
                                <span>Dia</span>
                                {filtros.diasSelecionados.length > 0 && (
                                    <span className="px-1 rounded-full bg-[#1056f5] text-white text-[9px] leading-tight">
                                        {filtros.diasSelecionados.length}
                                    </span>
                                )}
                                <ChevronDown className="w-3 h-3 opacity-75" />
                            </button>

                            {dropdownColunaAberto === 'dia' && (
                                <div className="absolute left-0 top-8 z-50 w-60 rounded-xl bg-white shadow-xl border border-slate-200 p-2.5 text-left font-normal normal-case tracking-normal space-y-2.5">
                                    <div className="space-y-1 border-b border-slate-100 pb-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                            Ordenar Datas no Mês
                                        </span>
                                        <div className="grid grid-cols-2 gap-1">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    aoAlterarCampoFiltro('campoOrdenacao', 'data')
                                                    aoAlterarCampoFiltro('direcaoOrdenacao', 'desc')
                                                }}
                                                className={`px-2 py-1 rounded text-[10.5px] font-semibold flex items-center justify-center gap-1 cursor-pointer ${filtros.campoOrdenacao === 'data' &&
                                                    filtros.direcaoOrdenacao === 'desc'
                                                    ? 'bg-[#1056f5] text-white'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    }`}
                                            >
                                                <ArrowDown className="w-3 h-3" />
                                                <span>Mais recente</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    aoAlterarCampoFiltro('campoOrdenacao', 'data')
                                                    aoAlterarCampoFiltro('direcaoOrdenacao', 'asc')
                                                }}
                                                className={`px-2 py-1 rounded text-[10.5px] font-semibold flex items-center justify-center gap-1 cursor-pointer ${filtros.campoOrdenacao === 'data' &&
                                                    filtros.direcaoOrdenacao === 'asc'
                                                    ? 'bg-[#1056f5] text-white'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    }`}
                                            >
                                                <ArrowUp className="w-3 h-3" />
                                                <span>Mais antiga</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Selecionar Dias (1 a 31)
                                            </span>
                                            {filtros.diasSelecionados.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        aoAlterarCampoFiltro('diasSelecionados', [])
                                                    }
                                                    className="text-[10px] font-semibold text-[#1056f5] hover:underline cursor-pointer"
                                                >
                                                    Limpar
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-7 gap-1">
                                            {DIAS_DO_MES_CALENDARIO.map((diaStr) => {
                                                const ativo = filtros.diasSelecionados.includes(diaStr)
                                                return (
                                                    <button
                                                        key={diaStr}
                                                        type="button"
                                                        onClick={() =>
                                                            alternarItemArrayFiltro('diasSelecionados', diaStr)
                                                        }
                                                        className={`h-6 rounded text-[10.5px] font-semibold transition cursor-pointer ${ativo
                                                            ? 'bg-[#1056f5] text-white shadow-2xs'
                                                            : 'bg-slate-100/80 text-slate-700 hover:bg-blue-50 hover:text-[#1056f5]'
                                                            }`}
                                                    >
                                                        {Number(diaStr)}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="px-1.5 flex items-center justify-center">
                            <button
                                type="button"
                                onClick={alternarOrdenacaoData}
                                title="Inverter ordenação de data (Mais recente / Mais antiga)"
                                className="inline-flex items-center gap-1 hover:text-slate-900 transition cursor-pointer"
                            >
                                <span>Data Show</span>
                                {filtros.campoOrdenacao === 'data' ? (
                                    filtros.direcaoOrdenacao === 'desc' ? (
                                        <ArrowDown className="w-3 h-3 text-[#1056f5]" />
                                    ) : (
                                        <ArrowUp className="w-3 h-3 text-[#1056f5]" />
                                    )
                                ) : (
                                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                )}
                            </button>
                        </div>
                        <div className="relative px-2 flex items-center justify-between gap-1">
                            <button
                                type="button"
                                onClick={alternarOrdenacaoCidade}
                                title="Ordenar Cidade em ordem alfabética"
                                className={`inline-flex items-center gap-1 rounded px-1 py-0.5 transition cursor-pointer ${filtros.campoOrdenacao === 'cidade'
                                    ? 'text-[#1056f5] bg-blue-50/80'
                                    : 'hover:bg-slate-300/60 text-slate-700'
                                    }`}
                            >
                                <span>Cidade</span>
                                {filtros.campoOrdenacao === 'cidade' ? (
                                    filtros.direcaoOrdenacao === 'asc' ? (
                                        <ArrowUp className="w-3 h-3 text-[#1056f5]" />
                                    ) : (
                                        <ArrowDown className="w-3 h-3 text-[#1056f5]" />
                                    )
                                ) : (
                                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setDropdownColunaAberto((atual) =>
                                        atual === 'uf' ? null : 'uf'
                                    )
                                }
                                title="Filtrar por UF (Siglas)"
                                className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 transition cursor-pointer ${filtros.ufsSelecionadas.length > 0
                                    ? 'bg-[#1056f5] text-white'
                                    : 'bg-slate-300/70 hover:bg-slate-300 text-slate-700'
                                    }`}
                            >
                                <span>UF</span>
                                {filtros.ufsSelecionadas.length > 0 && (
                                    <span className="text-[9px] font-extrabold">
                                        ({filtros.ufsSelecionadas.length})
                                    </span>
                                )}
                                <ChevronDown className="w-3 h-3" />
                            </button>

                            {dropdownColunaAberto === 'uf' && (
                                <div className="absolute left-0 top-8 z-50 w-48 rounded-xl bg-white shadow-xl border border-slate-200 p-2 text-left font-normal normal-case tracking-normal space-y-1.5">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-1 px-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Filtrar UF (Siglas)
                                        </span>
                                        {filtros.ufsSelecionadas.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    aoAlterarCampoFiltro('ufsSelecionadas', [])
                                                }
                                                className="text-[10px] font-semibold text-[#1056f5] hover:underline cursor-pointer"
                                            >
                                                Limpar
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto">
                                        {opcoesUfs.map((siglaUf) => {
                                            const selecionada =
                                                filtros.ufsSelecionadas.includes(siglaUf)
                                            return (
                                                <button
                                                    key={siglaUf}
                                                    type="button"
                                                    onClick={() =>
                                                        alternarItemArrayFiltro('ufsSelecionadas', siglaUf)
                                                    }
                                                    className={`flex items-center gap-1.5 rounded px-2 py-1 text-[11px] cursor-pointer ${selecionada
                                                        ? 'bg-blue-50 text-[#1056f5] font-bold'
                                                        : 'text-slate-600 hover:bg-slate-100'
                                                        }`}
                                                >
                                                    <span
                                                        className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${selecionada
                                                            ? 'bg-[#1056f5] border-[#1056f5] text-white'
                                                            : 'border-slate-300 bg-white'
                                                            }`}
                                                    >
                                                        {selecionada && (
                                                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                        )}
                                                    </span>
                                                    <span>{siglaUf}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="relative px-1.5 flex items-center justify-center">
                            <button
                                type="button"
                                onClick={() =>
                                    setDropdownColunaAberto((atual) =>
                                        atual === 'artista' ? null : 'artista'
                                    )
                                }
                                className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 transition cursor-pointer ${filtros.artistasSelecionados.length > 0
                                    ? 'text-[#1056f5] bg-blue-50/80'
                                    : 'hover:bg-slate-300/60 text-slate-700'
                                    }`}
                            >
                                <span>Artista</span>
                                {filtros.artistasSelecionados.length > 0 ? (
                                    <span className="px-1 rounded-full bg-[#1056f5] text-white text-[9px] leading-tight">
                                        {filtros.artistasSelecionados.length}
                                    </span>
                                ) : (
                                    <Filter className="w-2.5 h-2.5 opacity-60" />
                                )}
                                <ChevronDown className="w-3 h-3 opacity-75" />
                            </button>

                            {dropdownColunaAberto === 'artista' && (
                                <div className="absolute left-1/2 -translate-x-1/2 top-8 z-50 w-48 rounded-xl bg-white shadow-xl border border-slate-200 p-2 text-left font-normal normal-case tracking-normal space-y-1.5">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-1 px-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Selecionar Artistas
                                        </span>
                                        {filtros.artistasSelecionados.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    aoAlterarCampoFiltro('artistasSelecionados', [])
                                                }
                                                className="text-[10px] font-semibold text-[#1056f5] hover:underline cursor-pointer"
                                            >
                                                Todos
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-0.5 max-h-48 overflow-y-auto">
                                        {opcoesArtistas.map((siglaArtista) => {
                                            const selecionado =
                                                filtros.artistasSelecionados.includes(siglaArtista)
                                            return (
                                                <button
                                                    key={siglaArtista}
                                                    type="button"
                                                    onClick={() =>
                                                        alternarItemArrayFiltro(
                                                            'artistasSelecionados',
                                                            siglaArtista
                                                        )
                                                    }
                                                    className={`w-full flex items-center gap-2 rounded px-2 py-1 text-[11px] cursor-pointer ${selecionado
                                                        ? 'bg-blue-50 text-[#1056f5] font-bold'
                                                        : 'text-slate-600 hover:bg-slate-100'
                                                        }`}
                                                >
                                                    <span
                                                        className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${selecionado
                                                            ? 'bg-[#1056f5] border-[#1056f5] text-white'
                                                            : 'border-slate-300 bg-white'
                                                            }`}
                                                    >
                                                        {selecionado && (
                                                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                        )}
                                                    </span>
                                                    <span>{siglaArtista}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="relative px-1.5 flex items-center justify-center">
                            <button
                                type="button"
                                onClick={() =>
                                    setDropdownColunaAberto((atual) =>
                                        atual === 'categoria' ? null : 'categoria'
                                    )
                                }
                                className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 transition cursor-pointer ${filtros.categoriasSelecionadas.length > 0
                                    ? 'text-[#1056f5] bg-blue-50/80'
                                    : 'hover:bg-slate-300/60 text-slate-700'
                                    }`}
                            >
                                <span>Categoria</span>
                                {filtros.categoriasSelecionadas.length > 0 ? (
                                    <span className="px-1 rounded-full bg-[#1056f5] text-white text-[9px] leading-tight">
                                        {filtros.categoriasSelecionadas.length}
                                    </span>
                                ) : (
                                    <Filter className="w-2.5 h-2.5 opacity-60" />
                                )}
                                <ChevronDown className="w-3 h-3 opacity-75" />
                            </button>

                            {dropdownColunaAberto === 'categoria' && (
                                <div className="absolute left-1/2 -translate-x-1/2 top-8 z-50 w-48 rounded-xl bg-white shadow-xl border border-slate-200 p-2 text-left font-normal normal-case tracking-normal space-y-1.5">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-1 px-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Categorias
                                        </span>
                                        {filtros.categoriasSelecionadas.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    aoAlterarCampoFiltro('categoriasSelecionadas', [])
                                                }
                                                className="text-[10px] font-semibold text-[#1056f5] hover:underline cursor-pointer"
                                            >
                                                Todas
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-0.5 max-h-48 overflow-y-auto">
                                        {opcoesCategorias.map((cat) => {
                                            const selecionada =
                                                filtros.categoriasSelecionadas.includes(cat)
                                            return (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() =>
                                                        alternarItemArrayFiltro(
                                                            'categoriasSelecionadas',
                                                            cat
                                                        )
                                                    }
                                                    className={`w-full flex items-center gap-2 rounded px-2 py-1 text-[11px] cursor-pointer ${selecionada
                                                        ? 'bg-blue-50 text-[#1056f5] font-bold'
                                                        : 'text-slate-600 hover:bg-slate-100'
                                                        }`}
                                                >
                                                    <span
                                                        className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${selecionada
                                                            ? 'bg-[#1056f5] border-[#1056f5] text-white'
                                                            : 'border-slate-300 bg-white'
                                                            }`}
                                                    >
                                                        {selecionada && (
                                                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                        )}
                                                    </span>
                                                    <span>{cat}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="px-2 text-slate-700">Descrição</div>
                        <div className="px-2 text-center text-slate-700">Ações</div>
                    </div>
                    {linhasVirtuais.length === 0 ? (
                        <div className="py-8 px-4 text-center text-[11px] text-slate-400">
                            Nenhum alerta de pagamento encontrado para os filtros aplicados.
                        </div>
                    ) : (
                        <div
                            onScroll={manipularScroll}
                            style={{ maxHeight: `${ALTURA_VIEWPORT_VIRTUAL_PX}px` }}
                            className="relative overflow-y-auto select-none rounded-b-xl"
                        >
                            <div
                                style={{ height: `${alturaTotalPx}px` }}
                                className="relative w-full"
                            >
                                {itensVisiveis.map(({ item, topoPx, alturaPx }) => {
                                    if (item.tipo === 'cabecalho_mes') {
                                        const { grupo, aberto } = item
                                        return (
                                            <div
                                                key={item.chaveUnica}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: `${alturaPx}px`,
                                                    transform: `translateY(${topoPx}px)`,
                                                }}
                                                onClick={() => alternarMesAberto(grupo.chaveGrupo)}
                                                className="flex items-center justify-between px-3 bg-slate-100/85 hover:bg-slate-200/60 border-b border-slate-200 cursor-pointer transition-colors"
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-white border border-slate-300 text-slate-600">
                                                        {aberto ? (
                                                            <ChevronDown className="w-3 h-3 text-[#1056f5]" />
                                                        ) : (
                                                            <ChevronRight className="w-3 h-3 text-slate-500" />
                                                        )}
                                                    </span>

                                                    <span className="text-[11px] font-bold tracking-wide text-slate-700 uppercase">
                                                        {grupo.rotuloMesAno}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1.5">
                                                    <span className="inline-flex items-center rounded-full bg-white border border-slate-200 px-2 py-0.2 text-[9.5px] font-semibold text-slate-600">
                                                        {grupo.totalAlertas}{' '}
                                                        {grupo.totalAlertas === 1 ? 'registro' : 'registros'}
                                                    </span>

                                                    {grupo.totalPendentes > 0 && (
                                                        <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2 py-0.2 text-[9.5px] font-semibold text-amber-700">
                                                            {grupo.totalPendentes} pendente(s)
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    }

                                    const { alerta, ehUltimaLinhaDoMes } = item
                                    return (
                                        <div
                                            key={item.chaveUnica}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                height: `${alturaPx}px`,
                                                transform: `translateY(${topoPx}px)`,
                                            }}
                                            onClick={() => !alerta.lida && aoMarcarComoLido(alerta.id)}
                                            className={`grid ${GRADE_COLUNAS_TEMPLATE} items-center px-2 text-[10.5px] leading-none transition-colors ${ehUltimaLinhaDoMes
                                                ? 'border-b border-slate-300'
                                                : 'border-b border-slate-100'
                                                } ${alerta.concluida
                                                    ? 'bg-slate-50/60 text-slate-400'
                                                    : !alerta.lida
                                                        ? 'bg-blue-50/20 hover:bg-slate-50/90 text-slate-600'
                                                        : 'bg-white hover:bg-slate-50/90 text-slate-600'
                                                }`}
                                        >
                                            <div className="px-1.5 text-center font-semibold text-slate-700 flex items-center justify-center gap-1">
                                                {!alerta.lida && !alerta.concluida && (
                                                    <span
                                                        title="Notificação recente não lida"
                                                        className="w-1.5 h-1.5 rounded-full bg-[#1056f5] shrink-0"
                                                    />
                                                )}
                                                <span>{alerta.dia_vencimento}</span>
                                            </div>
                                            <div className="px-1.5 text-center text-slate-500 flex items-center justify-center gap-1">
                                                <Calendar className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                                <span>{alerta.data_show}</span>
                                            </div>
                                            <div className="px-2 font-medium text-slate-700 truncate flex items-center gap-1">
                                                <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                                <span className="truncate">{alerta.cidade_uf}</span>
                                            </div>
                                            <div className="px-1.5 text-center">
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-blue-50/80 text-[#1056f5] border border-blue-200/60">
                                                    {alerta.artista}
                                                </span>
                                            </div>
                                            <div className="px-1.5 text-center">
                                                <span className="inline-flex items-center justify-center gap-1 px-1.5 py-0.5 rounded-full text-[9.5px] font-medium bg-slate-100 text-slate-600 border border-slate-200/80">
                                                    <span
                                                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${alerta.concluida ? 'bg-slate-400' : 'bg-emerald-500'
                                                            }`}
                                                    />
                                                    {alerta.categoria}
                                                </span>
                                            </div>
                                            <div
                                                title={alerta.descricao}
                                                className={`px-2 truncate ${alerta.concluida
                                                    ? 'line-through text-slate-400'
                                                    : 'text-slate-600'
                                                    }`}
                                            >
                                                {alerta.descricao}
                                            </div>
                                            <div
                                                className="px-1.5 flex items-center justify-center gap-1"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div className="relative group">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => e.preventDefault()}
                                                        title="Acessar financeiro deste evento (Em breve)"
                                                        className="p-1 rounded text-slate-400 bg-slate-50 border border-slate-200/70 cursor-not-allowed"
                                                    >
                                                        <DollarSign className="w-3 h-3" />
                                                    </button>
                                                    <span className="pointer-events-none absolute bottom-full right-1/2 translate-x-1/2 mb-1 hidden group-hover:block whitespace-nowrap rounded bg-slate-900 px-1.5 py-0.5 text-[9.5px] font-medium text-white shadow-md z-30">
                                                        Financeiro #{alerta.seq_evento} (em breve)
                                                    </span>
                                                </div>

                                                <div className="relative group">
                                                    <button
                                                        type="button"
                                                        onClick={() => aoAlternarConclusao(alerta.id)}
                                                        title={
                                                            alerta.concluida
                                                                ? 'Reabrir notificação'
                                                                : 'Concluir notificação'
                                                        }
                                                        className={`p-1 rounded border transition-all cursor-pointer ${alerta.concluida
                                                            ? 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                                                            : 'text-slate-500 hover:text-[#1056f5] hover:bg-blue-50 border-transparent hover:border-blue-200'
                                                            }`}
                                                    >
                                                        {alerta.concluida ? (
                                                            <Check className="w-3 h-3" />
                                                        ) : (
                                                            <Flag className="w-3 h-3" />
                                                        )}
                                                    </button>
                                                    <span className="pointer-events-none absolute bottom-full right-0 mb-1 hidden group-hover:block whitespace-nowrap rounded bg-slate-900 px-1.5 py-0.5 text-[9.5px] font-medium text-white shadow-md z-30">
                                                        {alerta.concluida
                                                            ? 'Concluída (reabrir)'
                                                            : 'Concluir notificação'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="hidden print:block">
                <table className="w-full text-left border-collapse border border-slate-300">
                    <thead>
                        <tr className="bg-slate-200 border-b border-slate-300 text-[10.5px] font-bold uppercase text-slate-700">
                            <th className="py-1 px-2 text-center">Dia</th>
                            <th className="py-1 px-2 text-center">Data Show</th>
                            <th className="py-1 px-2">Cidade - UF</th>
                            <th className="py-1 px-2 text-center">Artista</th>
                            <th className="py-1 px-2 text-center">Categoria</th>
                            <th className="py-1 px-2">Descrição</th>
                        </tr>
                    </thead>
                    <tbody className="text-[10px] text-slate-600">
                        {gruposHierarquicos.map((grupo) => (
                            <React.Fragment key={grupo.chaveGrupo}>
                                <tr className="bg-slate-100 border-y border-slate-300 font-bold text-slate-700">
                                    <td colSpan={6} className="py-1 px-2 uppercase">
                                        {grupo.rotuloMesAno} ({grupo.totalAlertas} registros)
                                    </td>
                                </tr>
                                {grupo.alertasOrdenados.map((alerta) => (
                                    <tr key={alerta.id} className="border-b border-slate-200">
                                        <td className="py-1 px-2 text-center font-semibold">
                                            {alerta.dia_vencimento}
                                        </td>
                                        <td className="py-1 px-2 text-center">{alerta.data_show}</td>
                                        <td className="py-1 px-2 font-medium">{alerta.cidade_uf}</td>
                                        <td className="py-1 px-2 text-center">{alerta.artista}</td>
                                        <td className="py-1 px-2 text-center">{alerta.categoria}</td>
                                        <td className="py-1 px-2">{alerta.descricao}</td>
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
