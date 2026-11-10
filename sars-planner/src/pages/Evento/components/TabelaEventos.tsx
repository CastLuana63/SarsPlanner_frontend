import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import {
    ChevronRight,
    ChevronDown,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    Filter,
    Check,
    Search,
    MapPin,
    Pencil,
    Trash2,
} from 'lucide-react'
import { useVirtualizacao } from '@/hooks/useVirtualizacao'
import {
    ContainerGridPadrao,
    ESTILOS_PADRAO_GRID,
    obterClasseBotaoColunaAzul,
} from '@/components/ui/PadraoGrid'
import type {
    IEvento,
    IFiltrosEventos,
    IGrupoHierarquicoMesEvento,
    IStatusEventoCustom,
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

const DIAS_CALENDARIO = Array.from({ length: 31 }, (_, i) =>
    String(i + 1).padStart(2, '0')
)

const GRADE_COLUNAS_EVENTOS =
    'grid-cols-[64px_76px_62px_minmax(150px,1.3fr)_minmax(130px,1.1fr)_90px_minmax(120px,1fr)_minmax(120px,1fr)_118px_96px]'

type TDropdownColunaEvento =
    | 'artista'
    | 'dia'
    | 'uf'
    | 'valor_show'
    | 'comissao'
    | 'vendedor'
    | 'producao'
    | 'status'
    | null

interface ITabelaEventosProps {
    eventosFiltrados: IEvento[]
    filtros: IFiltrosEventos
    listaStatus: IStatusEventoCustom[]
    opcoesArtistas: string[]
    opcoesUfs: string[]
    opcoesVendedores: string[]
    obterStatusPorId: (statusId: string) => IStatusEventoCustom
    aoAlterarCampoFiltro: <K extends keyof IFiltrosEventos>(
        campo: K,
        valor: IFiltrosEventos[K]
    ) => void
    aoAlternarRealizado: (evento: IEvento) => void
    aoAbrirModalStatus: (status: IStatusEventoCustom) => void
    aoAbrirDetalhesMapa: (evento: IEvento) => void
    aoClicarEditar: (evento: IEvento) => void
    aoClicarExcluir: (evento: IEvento) => void
}

export const TabelaEventos: React.FC<ITabelaEventosProps> = ({
    eventosFiltrados,
    filtros,
    listaStatus,
    opcoesArtistas,
    opcoesUfs,
    opcoesVendedores,
    obterStatusPorId,
    aoAlterarCampoFiltro,
    aoAlternarRealizado,
    aoAbrirModalStatus,
    aoAbrirDetalhesMapa,
    aoClicarEditar,
    aoClicarExcluir,
}) => {
    const [dropdownColuna, setDropdownColuna] =
        useState<TDropdownColunaEvento>(null)
    const cabecalhoRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const manipularCliqueFora = (e: MouseEvent) => {
            if (
                cabecalhoRef.current &&
                !cabecalhoRef.current.contains(e.target as Node)
            ) {
                setDropdownColuna(null)
            }
        }
        document.addEventListener('mousedown', manipularCliqueFora)
        return () => document.removeEventListener('mousedown', manipularCliqueFora)
    }, [])

    const alternarItemListaFiltro = (
        campo:
            | 'diasSelecionados'
            | 'ufsSelecionadas'
            | 'artistasSelecionados'
            | 'vendedoresSelecionados'
            | 'statusSelecionados',
        valor: string
    ) => {
        const atual = filtros[campo]
        const existe = atual.includes(valor)
        const novaLista = existe
            ? atual.filter((item) => item !== valor)
            : [...atual, valor].sort()
        aoAlterarCampoFiltro(campo, novaLista)
    }

    const alternarOrdenacao = (campo: 'data' | 'cidade' | 'artista') => {
        if (filtros.campoOrdenacao === campo) {
            aoAlterarCampoFiltro(
                'direcaoOrdenacao',
                filtros.direcaoOrdenacao === 'asc' ? 'desc' : 'asc'
            )
        } else {
            aoAlterarCampoFiltro('campoOrdenacao', campo)
            aoAlterarCampoFiltro('direcaoOrdenacao', campo === 'data' ? 'desc' : 'asc')
        }
    }

    const gruposHierarquicos = useMemo<IGrupoHierarquicoMesEvento[]>(() => {
        const mapa = new Map<string, IEvento[]>()
        for (const ev of eventosFiltrados) {
            const mesPad = ev.mes_referencia.padStart(2, '0')
            const chave = `${ev.ano_referencia}-${mesPad}`
            const lista = mapa.get(chave) || []
            lista.push(ev)
            mapa.set(chave, lista)
        }

        const grupos: IGrupoHierarquicoMesEvento[] = Array.from(mapa.entries()).map(
            ([chaveGrupo, itens]) => {
                const [ano, mesStr] = chaveGrupo.split('-')
                const mesNumero = Number(mesStr)
                const nomeMesExtenso =
                    NOMES_MESES_POR_NUMERO[mesNumero] || `Mês ${mesStr}`

                const eventosOrdenados = [...itens].sort((a, b) => {
                    if (filtros.campoOrdenacao === 'cidade') {
                        const cmp = a.cidade.localeCompare(b.cidade, 'pt-BR')
                        return filtros.direcaoOrdenacao === 'asc' ? cmp : -cmp
                    }
                    if (filtros.campoOrdenacao === 'artista') {
                        const cmp = a.artista.localeCompare(b.artista, 'pt-BR')
                        return filtros.direcaoOrdenacao === 'asc' ? cmp : -cmp
                    }
                    const cmpData = a.data_evento.localeCompare(b.data_evento)
                    return filtros.direcaoOrdenacao === 'asc' ? cmpData : -cmpData
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
            }
        )

        return grupos.sort((a, b) => {
            if (a.ano !== b.ano) return b.ano.localeCompare(a.ano)
            return a.mesNumero - b.mesNumero
        })
    }, [eventosFiltrados, filtros.campoOrdenacao, filtros.direcaoOrdenacao])

    const [mesesAbertos, setMesesAbertos] = useState<Record<string, boolean>>({})

    useEffect(() => {
        setMesesAbertos((anterior) => {
            const novo: Record<string, boolean> = {}
            for (const g of gruposHierarquicos) {
                novo[g.chaveGrupo] =
                    anterior[g.chaveGrupo] !== undefined ? anterior[g.chaveGrupo] : true
            }
            return novo
        })
    }, [gruposHierarquicos])

    const linhasVirtuais = useMemo<TLinhaVirtualEvento[]>(() => {
        const plana: TLinhaVirtualEvento[] = []
        for (const grupo of gruposHierarquicos) {
            const aberto = Boolean(mesesAbertos[grupo.chaveGrupo])
            plana.push({
                tipo: 'cabecalho_mes',
                chaveUnica: `mes-${grupo.chaveGrupo}`,
                grupo,
                aberto,
            })
            if (aberto) {
                grupo.eventosOrdenados.forEach((ev, idx) => {
                    plana.push({
                        tipo: 'linha_evento',
                        chaveUnica: `ev-${grupo.chaveGrupo}-${ev.id}`,
                        chaveGrupo: grupo.chaveGrupo,
                        evento: ev,
                        ehUltimaLinhaDoMes: idx === grupo.eventosOrdenados.length - 1,
                    })
                })
            }
        }
        return plana
    }, [gruposHierarquicos, mesesAbertos])

    const obterAlturaItemPx = useCallback(() => 30, [])
    const ALTURA_VIEWPORT_PX = 520

    const { alturaTotalPx, itensVisiveis, manipularScroll } = useVirtualizacao({
        itens: linhasVirtuais,
        alturaContainerPx: ALTURA_VIEWPORT_PX,
        obterAlturaItemPx,
        overscan: 12,
    })

    return (
        <ContainerGridPadrao larguraMinimaPx="min-w-[1040px]">
            <div
                onScroll={manipularScroll}
                className={ESTILOS_PADRAO_GRID.viewportAlturaFixa}
            >
                <div
                    ref={cabecalhoRef}
                    className={`grid ${GRADE_COLUNAS_EVENTOS} items-center px-2 ${ESTILOS_PADRAO_GRID.cabecalhoColunasAzul}`}
                >
                    <div className="px-1 text-center">Realiz.</div>
                    <div className="relative px-1 flex items-center justify-center gap-0.5">
                        <button
                            type="button"
                            onClick={() => alternarOrdenacao('artista')}
                            className="hover:underline cursor-pointer"
                        >
                            Artista
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                setDropdownColuna((v) => (v === 'artista' ? null : 'artista'))
                            }
                            className={obterClasseBotaoColunaAzul(
                                filtros.artistasSelecionados.length > 0
                            )}
                        >
                            <ChevronDown className="w-3 h-3" />
                        </button>

                        {dropdownColuna === 'artista' && (
                            <div className="absolute left-0 top-8 z-40 w-44 rounded-xl bg-white text-slate-700 shadow-2xl border border-slate-200 p-2 font-normal normal-case tracking-normal space-y-1">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                                    <span className="text-[10px] font-bold uppercase text-slate-400">
                                        Artistas
                                    </span>
                                    {filtros.artistasSelecionados.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                aoAlterarCampoFiltro('artistasSelecionados', [])
                                            }
                                            className="text-[10px] text-[#1056f5] font-semibold cursor-pointer"
                                        >
                                            Todos
                                        </button>
                                    )}
                                </div>
                                {opcoesArtistas.map((sigla) => {
                                    const ativo = filtros.artistasSelecionados.includes(sigla)
                                    return (
                                        <button
                                            key={sigla}
                                            type="button"
                                            onClick={() =>
                                                alternarItemListaFiltro('artistasSelecionados', sigla)
                                            }
                                            className={`w-full flex items-center gap-2 rounded px-2 py-1 text-[10.5px] cursor-pointer ${ativo
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
                                                {ativo && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                            </span>
                                            <span>{sigla}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <div className="relative px-1 flex items-center justify-center">
                        <button
                            type="button"
                            onClick={() =>
                                setDropdownColuna((v) => (v === 'dia' ? null : 'dia'))
                            }
                            className={obterClasseBotaoColunaAzul(
                                filtros.diasSelecionados.length > 0
                            )}
                        >
                            <span>Dia</span>
                            <ChevronDown className="w-3 h-3" />
                        </button>

                        {dropdownColuna === 'dia' && (
                            <div className="absolute left-0 top-8 z-40 w-56 rounded-xl bg-white text-slate-700 shadow-2xl border border-slate-200 p-2.5 font-normal normal-case tracking-normal space-y-2">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                                    <span className="text-[10px] font-bold uppercase text-slate-400">
                                        Dias (1 a 31)
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => alternarOrdenacao('data')}
                                        className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#1056f5] cursor-pointer"
                                    >
                                        {filtros.direcaoOrdenacao === 'desc' ? (
                                            <ArrowDown className="w-3 h-3" />
                                        ) : (
                                            <ArrowUp className="w-3 h-3" />
                                        )}
                                        <span>Inverter data</span>
                                    </button>
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {DIAS_CALENDARIO.map((d) => {
                                        const ativo = filtros.diasSelecionados.includes(d)
                                        return (
                                            <button
                                                key={d}
                                                type="button"
                                                onClick={() =>
                                                    alternarItemListaFiltro('diasSelecionados', d)
                                                }
                                                className={`h-6 rounded text-[10px] font-semibold cursor-pointer ${ativo
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
                        )}
                    </div>

                    <div className="relative px-1.5 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => alternarOrdenacao('cidade')}
                            className="inline-flex items-center gap-1 hover:underline cursor-pointer"
                        >
                            <span>Cidade</span>
                            <ArrowUpDown className="w-3 h-3 text-white/80" />
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setDropdownColuna((v) => (v === 'uf' ? null : 'uf'))
                            }
                            className={obterClasseBotaoColunaAzul(
                                filtros.ufsSelecionadas.length > 0
                            )}
                        >
                            <span>UF</span>
                            <ChevronDown className="w-2.5 h-2.5" />
                        </button>

                        {dropdownColuna === 'uf' && (
                            <div className="absolute left-0 top-8 z-40 w-44 rounded-xl bg-white text-slate-700 shadow-2xl border border-slate-200 p-2 font-normal normal-case tracking-normal space-y-1">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                                    <span className="text-[10px] font-bold uppercase text-slate-400">
                                        Filtrar UF
                                    </span>
                                    {filtros.ufsSelecionadas.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                aoAlterarCampoFiltro('ufsSelecionadas', [])
                                            }
                                            className="text-[10px] text-[#1056f5] font-semibold cursor-pointer"
                                        >
                                            Limpar
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-1">
                                    {opcoesUfs.map((siglaUf) => {
                                        const ativo = filtros.ufsSelecionadas.includes(siglaUf)
                                        return (
                                            <button
                                                key={siglaUf}
                                                type="button"
                                                onClick={() =>
                                                    alternarItemListaFiltro('ufsSelecionadas', siglaUf)
                                                }
                                                className={`flex items-center gap-1.5 rounded px-2 py-1 text-[10.5px] cursor-pointer ${ativo
                                                        ? 'bg-blue-50 text-[#1056f5] font-bold'
                                                        : 'text-slate-600 hover:bg-slate-100'
                                                    }`}
                                            >
                                                <span
                                                    className={`w-3 h-3 rounded flex items-center justify-center border ${ativo
                                                            ? 'bg-[#1056f5] border-[#1056f5] text-white'
                                                            : 'border-slate-300 bg-white'
                                                        }`}
                                                >
                                                    {ativo && <Check className="w-2 h-2 stroke-[3]" />}
                                                </span>
                                                <span>{siglaUf}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative px-1.5">
                        <button
                            type="button"
                            onClick={() =>
                                setDropdownColuna((v) =>
                                    v === 'valor_show' ? null : 'valor_show'
                                )
                            }
                            className={obterClasseBotaoColunaAzul(
                                Boolean(filtros.textoValorShow.trim())
                            )}
                        >
                            <span>Valor Show</span>
                            <Filter className="w-2.5 h-2.5 opacity-80" />
                        </button>
                        {dropdownColuna === 'valor_show' && (
                            <div className="absolute left-0 top-8 z-40 w-52 rounded-xl bg-white text-slate-700 shadow-2xl border border-slate-200 p-2 font-normal normal-case tracking-normal">
                                <div className="relative">
                                    <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Filtrar valor..."
                                        value={filtros.textoValorShow}
                                        onChange={(e) =>
                                            aoAlterarCampoFiltro('textoValorShow', e.target.value)
                                        }
                                        className="w-full h-7 rounded border border-slate-300 pl-6 pr-2 text-[11px] text-slate-800 focus:border-[#1056f5] focus:outline-none"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative px-1 text-center">
                        <button
                            type="button"
                            onClick={() =>
                                setDropdownColuna((v) =>
                                    v === 'comissao' ? null : 'comissao'
                                )
                            }
                            className={obterClasseBotaoColunaAzul(
                                Boolean(filtros.textoComissao.trim())
                            )}
                        >
                            <span>Comissão</span>
                            <Filter className="w-2.5 h-2.5 opacity-80" />
                        </button>
                        {dropdownColuna === 'comissao' && (
                            <div className="absolute left-0 top-8 z-40 w-44 rounded-xl bg-white text-slate-700 shadow-2xl border border-slate-200 p-2 font-normal normal-case tracking-normal">
                                <input
                                    type="text"
                                    placeholder="Filtrar comissão..."
                                    value={filtros.textoComissao}
                                    onChange={(e) =>
                                        aoAlterarCampoFiltro('textoComissao', e.target.value)
                                    }
                                    className="w-full h-7 rounded border border-slate-300 px-2 text-[11px] text-slate-800 focus:border-[#1056f5] focus:outline-none"
                                />
                            </div>
                        )}
                    </div>

                    <div className="relative px-1.5">
                        <button
                            type="button"
                            onClick={() =>
                                setDropdownColuna((v) =>
                                    v === 'vendedor' ? null : 'vendedor'
                                )
                            }
                            className={obterClasseBotaoColunaAzul(
                                filtros.vendedoresSelecionados.length > 0
                            )}
                        >
                            <span>Vendedor</span>
                            <ChevronDown className="w-3 h-3" />
                        </button>
                        {dropdownColuna === 'vendedor' && (
                            <div className="absolute left-0 top-8 z-40 w-52 rounded-xl bg-white text-slate-700 shadow-2xl border border-slate-200 p-2 font-normal normal-case tracking-normal space-y-1">
                                {opcoesVendedores.map((vend) => {
                                    const ativo =
                                        filtros.vendedoresSelecionados.includes(vend)
                                    return (
                                        <button
                                            key={vend}
                                            type="button"
                                            onClick={() =>
                                                alternarItemListaFiltro(
                                                    'vendedoresSelecionados',
                                                    vend
                                                )
                                            }
                                            className={`w-full flex items-center gap-2 rounded px-2 py-1 text-left text-[10.5px] cursor-pointer ${ativo
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
                                                {ativo && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                            </span>
                                            <span className="truncate">{vend}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <div className="relative px-1.5">
                        <button
                            type="button"
                            onClick={() =>
                                setDropdownColuna((v) =>
                                    v === 'producao' ? null : 'producao'
                                )
                            }
                            className={obterClasseBotaoColunaAzul(
                                Boolean(filtros.textoProducao.trim())
                            )}
                        >
                            <span>Produção</span>
                            <Filter className="w-2.5 h-2.5 opacity-80" />
                        </button>
                        {dropdownColuna === 'producao' && (
                            <div className="absolute right-0 top-8 z-40 w-48 rounded-xl bg-white text-slate-700 shadow-2xl border border-slate-200 p-2 font-normal normal-case tracking-normal">
                                <input
                                    type="text"
                                    placeholder="Filtrar produção..."
                                    value={filtros.textoProducao}
                                    onChange={(e) =>
                                        aoAlterarCampoFiltro('textoProducao', e.target.value)
                                    }
                                    className="w-full h-7 rounded border border-slate-300 px-2 text-[11px] text-slate-800 focus:border-[#1056f5] focus:outline-none"
                                />
                            </div>
                        )}
                    </div>
                    <div className="relative px-1 text-center">
                        <button
                            type="button"
                            onClick={() =>
                                setDropdownColuna((v) => (v === 'status' ? null : 'status'))
                            }
                            className={obterClasseBotaoColunaAzul(
                                filtros.statusSelecionados.length > 0
                            )}
                        >
                            <span>Status</span>
                            <ChevronDown className="w-3 h-3" />
                        </button>
                        {dropdownColuna === 'status' && (
                            <div className="absolute right-0 top-8 z-40 w-48 rounded-xl bg-white text-slate-700 shadow-2xl border border-slate-200 p-2 font-normal normal-case tracking-normal space-y-1">
                                {listaStatus.map((st) => {
                                    const ativo = filtros.statusSelecionados.includes(st.id)
                                    return (
                                        <button
                                            key={st.id}
                                            type="button"
                                            onClick={() =>
                                                alternarItemListaFiltro('statusSelecionados', st.id)
                                            }
                                            className={`w-full flex items-center gap-2 rounded px-2 py-1 text-left text-[10.5px] cursor-pointer ${ativo
                                                    ? 'bg-blue-50 text-[#1056f5] font-bold'
                                                    : 'text-slate-600 hover:bg-slate-100'
                                                }`}
                                        >
                                            <span
                                                style={{ backgroundColor: st.corHex }}
                                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                            />
                                            <span className="truncate">{st.rotulo}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                    <div className="px-1 text-center print:hidden">Ação</div>
                </div>

                {linhasVirtuais.length === 0 ? (
                    <div className="py-12 px-4 text-center text-[11px] text-slate-400">
                        Nenhum evento encontrado para os filtros aplicados.
                    </div>
                ) : (
                    <div
                        style={{ height: `${alturaTotalPx}px` }}
                        className="relative w-full z-10"
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
                                        onClick={() =>
                                            setMesesAbertos((ant) => ({
                                                ...ant,
                                                [grupo.chaveGrupo]: !ant[grupo.chaveGrupo],
                                            }))
                                        }
                                        className={ESTILOS_PADRAO_GRID.linhaGrupoMesCinzaClaro}
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

                                        <span className="inline-flex items-center rounded-full bg-white border border-slate-200 px-2 py-0.2 text-[9.5px] font-semibold text-slate-600">
                                            {grupo.totalEventos}{' '}
                                            {grupo.totalEventos === 1 ? 'evento' : 'eventos'}
                                        </span>
                                    </div>
                                )
                            }

                            const { evento, ehUltimaLinhaDoMes } = item
                            const statusObj = obterStatusPorId(evento.status_id)

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
                                    className={`grid ${GRADE_COLUNAS_EVENTOS} ${ESTILOS_PADRAO_GRID.linhaDadosBase} ${ehUltimaLinhaDoMes
                                            ? 'border-b border-slate-200'
                                            : 'border-b border-slate-100'
                                        }`}
                                >
                                    <div className="px-1 flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => aoAlternarRealizado(evento)}
                                            title={
                                                evento.realizado
                                                    ? 'Realizado (clique para alternar)'
                                                    : 'Não realizado (clique para alternar)'
                                            }
                                            className={`w-3.5 h-3.5 rounded-full border transition cursor-pointer ${evento.realizado
                                                    ? 'bg-emerald-600 border-emerald-700'
                                                    : 'bg-slate-600 border-slate-700 opacity-80 hover:opacity-100'
                                                }`}
                                        />
                                    </div>

                                    <div className="px-1 text-center">
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-blue-50/80 text-[#1056f5] border border-blue-200/60">
                                            {evento.artista}
                                        </span>
                                    </div>

                                    <div className="px-1 text-center font-semibold text-slate-700">
                                        {evento.dia_evento}
                                    </div>

                                    <div className="px-1.5 font-medium text-slate-700 truncate">
                                        {evento.cidade_uf}
                                    </div>

                                    <div className="px-1.5 text-slate-600 truncate">
                                        {evento.valor_show}
                                    </div>

                                    <div className="px-1 text-center text-slate-600 truncate">
                                        {evento.comissao}
                                    </div>

                                    <div className="px-1.5 text-slate-600 truncate">
                                        {evento.vendedor}
                                    </div>

                                    <div className="px-1.5 text-slate-600 truncate">
                                        {evento.producao}
                                    </div>

                                    <div className="px-1 flex items-center justify-center gap-1.5">
                                        <span className="text-[10px] font-semibold text-slate-600 truncate">
                                            {statusObj.rotulo}
                                        </span>
                                        <button
                                            type="button"
                                            onDoubleClick={() => aoAbrirModalStatus(statusObj)}
                                            title="Dê 2 cliques na bolinha para editar a cor ou criar um novo status"
                                            style={{ backgroundColor: statusObj.corHex }}
                                            className="w-3 h-3 rounded-full shrink-0 cursor-pointer ring-1 ring-black/10 hover:scale-125 transition-transform"
                                        />
                                    </div>

                                    <div className="px-1 flex items-center justify-center gap-1 print:hidden">
                                        <button
                                            type="button"
                                            onClick={() => aoAbrirDetalhesMapa(evento)}
                                            title="Abrir detalhes do evento e mapa de distâncias"
                                            className="p-1 rounded text-[#1056f5] hover:bg-blue-50 border border-transparent hover:border-blue-200 transition cursor-pointer"
                                        >
                                            <MapPin className="w-3.5 h-3.5" />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => aoClicarEditar(evento)}
                                            title="Editar evento no painel lateral"
                                            className="p-1 rounded text-slate-500 hover:text-[#1056f5] hover:bg-blue-50 border border-transparent hover:border-blue-200 transition cursor-pointer"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => aoClicarExcluir(evento)}
                                            title="Excluir evento"
                                            className="p-1 rounded text-slate-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition cursor-pointer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </ContainerGridPadrao>
    )
}
