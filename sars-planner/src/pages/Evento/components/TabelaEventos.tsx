import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    ChevronRight,
    ChevronDown,
    Check,
    ChevronsUpDown,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    Filter,
    MapPinned,
    Pencil,
    Trash2,
} from 'lucide-react'
import { useVirtualizacao } from '@/hooks/useVirtualizacao'
import { useEventos } from '@/contexts/EventosContext'
import type {
    IEventoSistema,
    IFiltrosEventos,
    IGrupoHierarquicoMesEvento,
    TLinhaVirtualEvento,
} from '@/types/evento.types'

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

const DIAS_CALENDARIO = Array.from({ length: 31 }, (_, idx) =>
    String(idx + 1).padStart(2, '0')
)

const GRADE_COLUNAS_EVENTOS =
    'grid-cols-[64px_86px_64px_minmax(150px,1.2fr)_minmax(140px,1.1fr)_96px_minmax(120px,1fr)_minmax(115px,0.9fr)_116px_96px]'

type TDropdownColunaEvento =
    | 'artista'
    | 'dia'
    | 'uf'
    | 'vendedor'
    | 'status'
    | null

interface ITabelaEventosProps {
    eventosFiltrados: IEventoSistema[]
    filtros: IFiltrosEventos
    opcoesArtistas: string[]
    opcoesUfs: string[]
    opcoesVendedores: string[]
    opcoesStatus: string[]
    aoAlterarCampoFiltro: <K extends keyof IFiltrosEventos>(
        campo: K,
        valor: IFiltrosEventos[K]
    ) => void
    aoClicarEditarEvento: (evento: IEventoSistema) => void
    aoClicarExcluirEvento: (evento: IEventoSistema) => void
    aoDuploCliqueBolinhaStatus: (nomeStatus: string) => void
}

export const TabelaEventos: React.FC<ITabelaEventosProps> = ({
    eventosFiltrados,
    filtros,
    opcoesArtistas,
    opcoesUfs,
    opcoesVendedores,
    opcoesStatus,
    aoAlterarCampoFiltro,
    aoClicarEditarEvento,
    aoClicarExcluirEvento,
    aoDuploCliqueBolinhaStatus,
}) => {
    const navigate = useNavigate()
    //const { obterCorStatus, atualizarCampoEvento } = useEventos()

    const [dropdownColunaAberto, setDropdownColunaAberto] =
        useState<TDropdownColunaEvento>(null)
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
            | 'vendedoresSelecionados'
            | 'statusSelecionados',
        valor: string
    ) => {
        const listaAtual = filtros[campo]
        const existe = listaAtual.includes(valor)
        const novaLista = existe
            ? listaAtual.filter((item) => item !== valor)
            : [...listaAtual, valor].sort()
        aoAlterarCampoFiltro(campo, novaLista)
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

    const gruposHierarquicos = useMemo<IGrupoHierarquicoMesEvento[]>(() => {
        const mapaGrupos = new Map<string, IEvento[]>()

        for (const ev of eventosFiltrados) {
            const [ano, mes] = ev.data_evento.split('-')
            const chave = `${ano}-${mes}`
            const listaAtual = mapaGrupos.get(chave) || []
            listaAtual.push(ev)
            mapaGrupos.set(chave, listaAtual)
        }

        const grupos: IGrupoHierarquicoMesEvento[] = Array.from(
            mapaGrupos.entries()
        ).map(([chaveGrupo, itensDoMes]) => {
            const [ano, mesStr] = chaveGrupo.split('-')
            const mesNumero = Number(mesStr)
            const nomeMesExtenso = NOMES_MESES_POR_NUMERO[mesNumero] || `Mês ${mesStr}`

            const eventosOrdenados = [...itensDoMes].sort((a, b) => {
                if (filtros.campoOrdenacao === 'cidade') {
                    const comp = a.cidade.localeCompare(b.cidade, 'pt-BR', {
                        sensitivity: 'base',
                    })
                    return filtros.direcaoOrdenacao === 'asc' ? comp : -comp
                }
                const compData = a.data_evento.localeCompare(b.data_evento)
                return filtros.direcaoOrdenacao === 'asc' ? compData : -compData
            })

            return {
                chaveGrupo,
                ano,
                mesNumero,
                nomeMesExtenso,
                rotuloMesAno: `${nomeMesExtenso} | ${ano.slice(-2)}`,
                eventosOrdenados,
                totalEventos: eventosOrdenados.length,
            }
        })

        return grupos.sort((a, b) => {
            if (a.ano !== b.ano) return a.ano.localeCompare(b.ano)
            return a.mesNumero - b.mesNumero
        })
    }, [eventosFiltrados, filtros.campoOrdenacao, filtros.direcaoOrdenacao])

    const [mesesAbertos, setMesesAbertos] = useState<Record<string, boolean>>({})

    useEffect(() => {
        setMesesAbertos((anterior) => {
            const novoMapa: Record<string, boolean> = {}
            for (const grupo of gruposHierarquicos) {
                novoMapa[grupo.chaveGrupo] =
                    anterior[grupo.chaveGrupo] !== undefined
                        ? anterior[grupo.chaveGrupo]
                        : true
            }
            return novoMapa
        })
    }, [gruposHierarquicos])

    const alternarMesAberto = (chaveGrupo: string) => {
        setMesesAbertos((anterior) => ({
            ...anterior,
            [chaveGrupo]: !anterior[chaveGrupo],
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

    const linhasVirtuais = useMemo<TLinhaVirtualEvento[]>(() => {
        const listaPlana: TLinhaVirtualEvento[] = []

        for (const grupo of gruposHierarquicos) {
            const aberto = Boolean(mesesAbertos[grupo.chaveGrupo])

            listaPlana.push({
                tipo: 'cabecalho_mes',
                chaveUnica: `mes-${grupo.chaveGrupo}`,
                grupo,
                aberto,
            })

            if (aberto) {
                grupo.eventosOrdenados.forEach((evento, idx) => {
                    listaPlana.push({
                        tipo: 'linha_evento',
                        chaveUnica: `ev-${grupo.chaveGrupo}-${evento.id}`,
                        chaveGrupo: grupo.chaveGrupo,
                        evento,
                        ehUltimaLinhaDoMes: idx === grupo.eventosOrdenados.length - 1,
                    })
                })
            }
        }

        return listaPlana
    }, [gruposHierarquicos, mesesAbertos])

    const obterAlturaItemPx = useCallback((item: TLinhaVirtualEvento) => {
        if (item.tipo === 'cabecalho_mes') return 30
        return 32
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
            {/* Barra Auxiliar Sutil */}
            <div className="px-3.5 py-1.5 bg-slate-50 border-b border-slate-200 rounded-t-xl flex flex-wrap items-center justify-between gap-2 print:hidden">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                    <span>
                        Lista de Eventos ({eventosFiltrados.length}{' '}
                        {eventosFiltrados.length === 1 ? 'show' : 'shows'})
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[10.5px] text-slate-500">
                        Dica: dê 2 cliques na bolinha de status para editar ou criar cores, ou clique no ícone de mapa para ver rotas e distâncias
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

            {/* Cabeçalho Único + Grid Virtualizada */}
            <div className="overflow-x-auto">
                <div className="min-w-[980px]">
                    {/* CABEÇALHO DE COLUNAS ÚNICO */}
                    <div
                        ref={cabecalhoColunasRef}
                        className={`relative grid ${GRADE_COLUNAS_EVENTOS} items-center h-8 bg-slate-200/95 border-b border-slate-300 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-700 select-none z-30`}
                    >
                        {/* 1. REALIZADO */}
                        <div className="px-1 text-center">Realizado</div>

                        {/* 2. ARTISTA (Com Dropdown de Filtro) */}
                        <div className="relative px-1 flex items-center justify-center">
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
                                    <span className="px-1 rounded-full bg-[#1056f5] text-white text-[9px]">
                                        {filtros.artistasSelecionados.length}
                                    </span>
                                ) : (
                                    <Filter className="w-2.5 h-2.5 opacity-60" />
                                )}
                                <ChevronDown className="w-3 h-3 opacity-75" />
                            </button>

                            {dropdownColunaAberto === 'artista' && (
                                <div className="absolute left-0 top-8 z-50 w-44 rounded-xl bg-white shadow-xl border border-slate-200 p-2 text-left font-normal normal-case tracking-normal space-y-1.5">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-1 px-1">
                                        <span className="text-[10px] font-bold uppercase text-slate-400">
                                            Artistas
                                        </span>
                                        {filtros.artistasSelecionados.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    aoAlterarCampoFiltro('artistasSelecionados', [])
                                                }
                                                className="text-[10px] font-semibold text-[#1056f5] hover:underline cursor-pointer"
                                            >
                                                Limpar
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-0.5 max-h-44 overflow-y-auto">
                                        {opcoesArtistas.map((sigla) => {
                                            const ativo =
                                                filtros.artistasSelecionados.includes(sigla)
                                            return (
                                                <button
                                                    key={sigla}
                                                    type="button"
                                                    onClick={() =>
                                                        alternarItemArrayFiltro(
                                                            'artistasSelecionados',
                                                            sigla
                                                        )
                                                    }
                                                    className={`w-full flex items-center gap-2 rounded px-2 py-1 text-[11px] cursor-pointer ${ativo
                                                            ? 'bg-blue-50 text-[#1056f5] font-bold'
                                                            : 'text-slate-600 hover:bg-slate-100'
                                                        }`}
                                                >
                                                    <span
                                                        className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${ativo
                                                                ? 'bg-[#1056f5] border-[#1056f5] text-white'
                                                                : 'border-slate-300 bg-white'
                                                            }`}
                                                    >
                                                        {ativo && (
                                                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                        )}
                                                    </span>
                                                    <span>{sigla}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 3. DIA (Calendário 1 a 31 + Ordenação Data) */}
                        <div className="relative px-1 flex items-center justify-center">
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
                                    <span className="px-1 rounded-full bg-[#1056f5] text-white text-[9px]">
                                        {filtros.diasSelecionados.length}
                                    </span>
                                )}
                                <ChevronDown className="w-3 h-3 opacity-75" />
                            </button>

                            {dropdownColunaAberto === 'dia' && (
                                <div className="absolute left-0 top-8 z-50 w-60 rounded-xl bg-white shadow-xl border border-slate-200 p-2.5 text-left font-normal normal-case tracking-normal space-y-2">
                                    <div className="space-y-1 border-b border-slate-100 pb-2">
                                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                            Ordenar Dias no Mês
                                        </span>
                                        <div className="grid grid-cols-2 gap-1">
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
                                                <span>1 → 31</span>
                                            </button>

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
                                                <span>31 → 1</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold uppercase text-slate-400">
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
                                            {DIAS_CALENDARIO.map((d) => {
                                                const ativo = filtros.diasSelecionados.includes(d)
                                                return (
                                                    <button
                                                        key={d}
                                                        type="button"
                                                        onClick={() =>
                                                            alternarItemArrayFiltro('diasSelecionados', d)
                                                        }
                                                        className={`h-6 rounded text-[10.5px] font-semibold transition cursor-pointer ${ativo
                                                                ? 'bg-[#1056f5] text-white'
                                                                : 'bg-slate-100 text-slate-700 hover:bg-blue-50'
                                                            }`}
                                                    >
                                                        {Number(d)}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 4. CIDADE - UF (Ordenação Cidade + Filtro UF) */}
                        <div className="relative px-2 flex items-center justify-between gap-1">
                            <button
                                type="button"
                                onClick={alternarOrdenacaoCidade}
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
                                className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 transition cursor-pointer ${filtros.ufsSelecionadas.length > 0
                                        ? 'bg-[#1056f5] text-white'
                                        : 'bg-slate-300/70 hover:bg-slate-300 text-slate-700'
                                    }`}
                            >
                                <span>UF</span>
                                <ChevronDown className="w-3 h-3" />
                            </button>

                            {dropdownColunaAberto === 'uf' && (
                                <div className="absolute left-0 top-8 z-50 w-44 rounded-xl bg-white shadow-xl border border-slate-200 p-2 text-left font-normal normal-case tracking-normal space-y-1.5">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-1 px-1">
                                        <span className="text-[10px] font-bold uppercase text-slate-400">
                                            Filtrar UF
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
                                    <div className="grid grid-cols-2 gap-1">
                                        {opcoesUfs.map((uf) => {
                                            const ativo = filtros.ufsSelecionadas.includes(uf)
                                            return (
                                                <button
                                                    key={uf}
                                                    type="button"
                                                    onClick={() =>
                                                        alternarItemArrayFiltro('ufsSelecionadas', uf)
                                                    }
                                                    className={`flex items-center gap-1.5 rounded px-2 py-1 text-[11px] cursor-pointer ${ativo
                                                            ? 'bg-blue-50 text-[#1056f5] font-bold'
                                                            : 'text-slate-600 hover:bg-slate-100'
                                                        }`}
                                                >
                                                    <span
                                                        className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${ativo
                                                                ? 'bg-[#1056f5] border-[#1056f5] text-white'
                                                                : 'border-slate-300 bg-white'
                                                            }`}
                                                    >
                                                        {ativo && (
                                                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                        )}
                                                    </span>
                                                    <span>{uf}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 5. VALOR SHOW */}
                        <div className="px-2">Valor Show</div>

                        {/* 6. COMISSÃO */}
                        <div className="px-2 text-center">Comissão</div>

                        {/* 7. VENDEDOR (Com Dropdown de Filtro) */}
                        <div className="relative px-2 flex items-center">
                            <button
                                type="button"
                                onClick={() =>
                                    setDropdownColunaAberto((atual) =>
                                        atual === 'vendedor' ? null : 'vendedor'
                                    )
                                }
                                className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 transition cursor-pointer ${filtros.vendedoresSelecionados.length > 0
                                        ? 'text-[#1056f5] bg-blue-50/80'
                                        : 'hover:bg-slate-300/60 text-slate-700'
                                    }`}
                            >
                                <span>Vendedor</span>
                                <Filter className="w-2.5 h-2.5 opacity-60" />
                                <ChevronDown className="w-3 h-3 opacity-75" />
                            </button>

                            {dropdownColunaAberto === 'vendedor' && (
                                <div className="absolute left-0 top-8 z-50 w-52 rounded-xl bg-white shadow-xl border border-slate-200 p-2 text-left font-normal normal-case tracking-normal space-y-1.5">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-1 px-1">
                                        <span className="text-[10px] font-bold uppercase text-slate-400">
                                            Vendedores
                                        </span>
                                        {filtros.vendedoresSelecionados.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    aoAlterarCampoFiltro('vendedoresSelecionados', [])
                                                }
                                                className="text-[10px] font-semibold text-[#1056f5] hover:underline cursor-pointer"
                                            >
                                                Limpar
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-0.5 max-h-44 overflow-y-auto">
                                        {opcoesVendedores.map((vend) => {
                                            const ativo =
                                                filtros.vendedoresSelecionados.includes(vend)
                                            return (
                                                <button
                                                    key={vend}
                                                    type="button"
                                                    onClick={() =>
                                                        alternarItemArrayFiltro(
                                                            'vendedoresSelecionados',
                                                            vend
                                                        )
                                                    }
                                                    className={`w-full flex items-center gap-2 rounded px-2 py-1 text-[11px] cursor-pointer ${ativo
                                                            ? 'bg-blue-50 text-[#1056f5] font-bold'
                                                            : 'text-slate-600 hover:bg-slate-100'
                                                        }`}
                                                >
                                                    <span
                                                        className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 ${ativo
                                                                ? 'bg-[#1056f5] border-[#1056f5] text-white'
                                                                : 'border-slate-300 bg-white'
                                                            }`}
                                                    >
                                                        {ativo && (
                                                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                        )}
                                                    </span>
                                                    <span className="truncate">{vend}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 8. PRODUÇÃO */}
                        <div className="px-2">Produção</div>

                        {/* 9. STATUS (Com Dropdown de Filtro) */}
                        <div className="relative px-1.5 flex items-center justify-center">
                            <button
                                type="button"
                                onClick={() =>
                                    setDropdownColunaAberto((atual) =>
                                        atual === 'status' ? null : 'status'
                                    )
                                }
                                className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 transition cursor-pointer ${filtros.statusSelecionados.length > 0
                                        ? 'text-[#1056f5] bg-blue-50/80'
                                        : 'hover:bg-slate-300/60 text-slate-700'
                                    }`}
                            >
                                <span>Status</span>
                                <Filter className="w-2.5 h-2.5 opacity-60" />
                                <ChevronDown className="w-3 h-3 opacity-75" />
                            </button>

                            {dropdownColunaAberto === 'status' && (
                                <div className="absolute right-0 top-8 z-50 w-48 rounded-xl bg-white shadow-xl border border-slate-200 p-2 text-left font-normal normal-case tracking-normal space-y-1.5">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-1 px-1">
                                        <span className="text-[10px] font-bold uppercase text-slate-400">
                                            Status
                                        </span>
                                        {filtros.statusSelecionados.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    aoAlterarCampoFiltro('statusSelecionados', [])
                                                }
                                                className="text-[10px] font-semibold text-[#1056f5] hover:underline cursor-pointer"
                                            >
                                                Limpar
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-0.5 max-h-44 overflow-y-auto">
                                        {opcoesStatus.map((stNome) => {
                                            const ativo =
                                                filtros.statusSelecionados.includes(stNome)
                                            return (
                                                <button
                                                    key={stNome}
                                                    type="button"
                                                    onClick={() =>
                                                        alternarItemArrayFiltro(
                                                            'statusSelecionados',
                                                            stNome
                                                        )
                                                    }
                                                    className={`w-full flex items-center justify-between gap-2 rounded px-2 py-1 text-[11px] cursor-pointer ${ativo
                                                            ? 'bg-blue-50 text-[#1056f5] font-bold'
                                                            : 'text-slate-600 hover:bg-slate-100'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2 truncate">
                                                        <span
                                                            className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 ${ativo
                                                                    ? 'bg-[#1056f5] border-[#1056f5] text-white'
                                                                    : 'border-slate-300 bg-white'
                                                                }`}
                                                        >
                                                            {ativo && (
                                                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                            )}
                                                        </span>
                                                        <span className="truncate">{stNome}</span>
                                                    </div>
                                                    <span
                                                        style={{ backgroundColor: obterCorStatus(stNome) }}
                                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                                    />
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 10. AÇÕES */}
                        <div className="px-2 text-center print:hidden">Ações</div>
                    </div>

                    {/* CORPO VIRTUALIZADO */}
                    {linhasVirtuais.length === 0 ? (
                        <div className="py-8 px-4 text-center text-[11px] text-slate-400">
                            Nenhum evento encontrado para os filtros selecionados.
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
                                                className="flex items-center justify-between px-3 bg-[#d8d9e8]/75 hover:bg-[#d8d9e8] border-b border-slate-300 cursor-pointer transition-colors"
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-white/90 border border-slate-300 text-slate-700">
                                                        {aberto ? (
                                                            <ChevronDown className="w-3 h-3 text-[#1056f5]" />
                                                        ) : (
                                                            <ChevronRight className="w-3 h-3 text-slate-600" />
                                                        )}
                                                    </span>
                                                    <span className="text-[11px] font-bold tracking-wide text-slate-800">
                                                        {grupo.rotuloMesAno}
                                                    </span>
                                                </div>

                                                <span className="rounded-full bg-white/90 border border-slate-300 px-2 py-0.2 text-[9.5px] font-semibold text-slate-700">
                                                    {grupo.totalEventos}{' '}
                                                    {grupo.totalEventos === 1 ? 'evento' : 'eventos'}
                                                </span>
                                            </div>
                                        )
                                    }

                                    const { evento, ehUltimaLinhaDoMes } = item
                                    const diaEvento = evento.data_evento.split('-')[2] || ''
                                    const corBolinha = obterCorStatus(evento.status_evento)

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
                                            className={`grid ${GRADE_COLUNAS_EVENTOS} items-center px-2 text-[10.5px] leading-none bg-white hover:bg-slate-50/90 text-slate-600 transition-colors ${ehUltimaLinhaDoMes
                                                    ? 'border-b border-slate-300'
                                                    : 'border-b border-slate-100'
                                                }`}
                                        >
                                            {/* 1. Realizado */}
                                            <div className="px-1 flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        atualizarCampoEvento(
                                                            evento.id,
                                                            'realizado',
                                                            !evento.realizado
                                                        )
                                                    }
                                                    title={
                                                        evento.realizado
                                                            ? 'Evento realizado (clique para alternar)'
                                                            : 'Não realizado (clique para marcar como realizado)'
                                                    }
                                                    className={`w-3.5 h-3.5 rounded-full border transition cursor-pointer ${evento.realizado
                                                            ? 'bg-emerald-600 border-emerald-700'
                                                            : 'bg-slate-600 border-slate-700 hover:bg-slate-800'
                                                        }`}
                                                />
                                            </div>

                                            {/* 2. Artista */}
                                            <div className="px-1 text-center">
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-blue-50/80 text-[#1056f5] border border-blue-200/60">
                                                    {evento.artista}
                                                </span>
                                            </div>

                                            {/* 3. Dia */}
                                            <div className="px-1 text-center font-semibold text-slate-700">
                                                {diaEvento}
                                            </div>

                                            {/* 4. Cidade - UF */}
                                            <div
                                                title={evento.cidade_uf}
                                                className="px-2 font-medium text-slate-800 truncate"
                                            >
                                                {evento.cidade_uf}
                                            </div>

                                            {/* 5. Valor Show */}
                                            <div
                                                title={evento.valor_show}
                                                className="px-2 font-semibold text-slate-700 truncate"
                                            >
                                                {evento.valor_show}
                                            </div>

                                            {/* 6. Comissão */}
                                            <div className="px-2 text-center text-slate-600 truncate">
                                                {evento.comissao || '—'}
                                            </div>

                                            {/* 7. Vendedor */}
                                            <div
                                                title={evento.vendedor}
                                                className="px-2 text-slate-600 truncate"
                                            >
                                                {evento.vendedor || '—'}
                                            </div>

                                            {/* 8. Produção */}
                                            <div
                                                title={evento.producao}
                                                className="px-2 text-slate-600 truncate"
                                            >
                                                {evento.producao || '—'}
                                            </div>

                                            {/* 9. Status + Bolinha Colorida (2 cliques abre modal de status) */}
                                            <div className="px-1.5 flex items-center justify-center gap-1.5">
                                                <span className="text-[9.5px] font-bold uppercase text-slate-700 truncate">
                                                    {evento.status_evento}
                                                </span>
                                                <button
                                                    type="button"
                                                    onDoubleClick={() =>
                                                        aoDuploCliqueBolinhaStatus(evento.status_evento)
                                                    }
                                                    title="Dê 2 cliques para editar ou criar status"
                                                    style={{ backgroundColor: corBolinha }}
                                                    className="w-3 h-3 rounded-full shrink-0 border border-black/15 cursor-pointer hover:scale-125 transition-transform"
                                                />
                                            </div>

                                            {/* 10. Ações: Ícone de Mapa (Detalhes/Rotas) + Editar + Excluir */}
                                            <div className="px-1 flex items-center justify-center gap-1 print:hidden">
                                                {/* Botão de Mapa: Abre a tela individual de detalhes e distâncias */}
                                                <div className="relative group">
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate(`/eventos/${evento.id}`)}
                                                        title="Abrir detalhes do evento e mapa de distâncias"
                                                        className="p-1 rounded text-[#1056f5] hover:bg-blue-50 border border-transparent hover:border-blue-200 transition cursor-pointer"
                                                    >
                                                        <MapPinned className="w-3.5 h-3.5" />
                                                    </button>
                                                    <span className="pointer-events-none absolute bottom-full right-1/2 translate-x-1/2 mb-1 hidden group-hover:block whitespace-nowrap rounded bg-slate-900 px-1.5 py-0.5 text-[9.5px] font-medium text-white shadow-md z-30">
                                                        Mapa de rotas e detalhes
                                                    </span>
                                                </div>

                                                {/* Botão Editar (Abre o Drawer Lateral) */}
                                                <div className="relative group">
                                                    <button
                                                        type="button"
                                                        onClick={() => aoClicarEditarEvento(evento)}
                                                        title="Editar evento no painel lateral"
                                                        className="p-1 rounded text-slate-500 hover:text-[#1056f5] hover:bg-blue-50 border border-transparent hover:border-blue-200 transition cursor-pointer"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <span className="pointer-events-none absolute bottom-full right-1/2 translate-x-1/2 mb-1 hidden group-hover:block whitespace-nowrap rounded bg-slate-900 px-1.5 py-0.5 text-[9.5px] font-medium text-white shadow-md z-30">
                                                        Editar informações
                                                    </span>
                                                </div>

                                                {/* Botão Excluir */}
                                                <div className="relative group">
                                                    <button
                                                        type="button"
                                                        onClick={() => aoClicarExcluirEvento(evento)}
                                                        title="Deletar evento"
                                                        className="p-1 rounded text-slate-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition cursor-pointer"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <span className="pointer-events-none absolute bottom-full right-0 mb-1 hidden group-hover:block whitespace-nowrap rounded bg-slate-900 px-1.5 py-0.5 text-[9.5px] font-medium text-white shadow-md z-30">
                                                        Deletar evento
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
        </div>
    )
}
