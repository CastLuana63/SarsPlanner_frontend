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
    Binoculars,
    Receipt,
} from 'lucide-react'
import { useVirtualizacao } from '@/hooks/useVirtualizacao'
import {
    ContainerGridPadrao,
    ESTILOS_PADRAO_GRID,
    obterClasseBotaoColunaAzul,
} from '@/components/ui/PadraoGrid'
import {
    formatarMoedaBRL,
    type IFiltrosFinanceiro,
    type IGrupoHierarquicoMesFinanceiro,
    type IResumoCalculadoFinanceiroEvento,
    type TLinhaVirtualFinanceiro,
} from '@/types/financeiro.types'

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

const GRADE_COLUNAS_FINANCEIRO =
    'grid-cols-[68px_minmax(170px,1.5fr)_90px_minmax(130px,1fr)_minmax(130px,1fr)_minmax(130px,1fr)_110px]'

type TDropdownColunaFinanceiro =
    | 'dia'
    | 'uf'
    | 'artista'
    | 'receita'
    | 'despesa'
    | 'liquido'
    | null

interface ITabelaFinanceiroProps {
    registrosFiltrados: IResumoCalculadoFinanceiroEvento[]
    filtros: IFiltrosFinanceiro
    opcoesArtistas: string[]
    opcoesUfs: string[]
    aoAlterarCampoFiltro: <K extends keyof IFiltrosFinanceiro>(
        campo: K,
        valor: IFiltrosFinanceiro[K]
    ) => void
    aoAbrirDetalhamentoFinanceiro: (eventoId: number) => void
    aoAbrirModalDespesas: (registro: IResumoCalculadoFinanceiroEvento) => void
}

export const TabelaFinanceiro: React.FC<ITabelaFinanceiroProps> = ({
    registrosFiltrados,
    filtros,
    opcoesArtistas,
    opcoesUfs,
    aoAlterarCampoFiltro,
    aoAbrirDetalhamentoFinanceiro,
    aoAbrirModalDespesas,
}) => {
    const [dropdownColuna, setDropdownColuna] =
        useState<TDropdownColunaFinanceiro>(null)
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
        campo: 'diasSelecionados' | 'ufsSelecionadas' | 'artistasSelecionados',
        valor: string
    ) => {
        const atual = filtros[campo]
        const existe = atual.includes(valor)
        const novaLista = existe
            ? atual.filter((item) => item !== valor)
            : [...atual, valor].sort()
        aoAlterarCampoFiltro(campo, novaLista)
    }

    const alternarOrdenacao = (
        campo: 'data' | 'cidade' | 'artista' | 'receita' | 'despesa' | 'liquido'
    ) => {
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

    const gruposHierarquicos = useMemo<IGrupoHierarquicoMesFinanceiro[]>(() => {
        const mapa = new Map<string, IResumoCalculadoFinanceiroEvento[]>()
        for (const reg of registrosFiltrados) {
            const mesPad = reg.mes_referencia.padStart(2, '0')
            const chave = `${reg.ano_referencia}-${mesPad}`
            const lista = mapa.get(chave) || []
            lista.push(reg)
            mapa.set(chave, lista)
        }

        const grupos: IGrupoHierarquicoMesFinanceiro[] = Array.from(
            mapa.entries()
        ).map(([chaveGrupo, itens]) => {
            const [ano, mesStr] = chaveGrupo.split('-')
            const mesNumero = Number(mesStr)
            const nomeMesExtenso =
                NOMES_MESES_POR_NUMERO[mesNumero] || `Mês ${mesStr}`

            const itensOrdenados = [...itens].sort((a, b) => {
                const mult = filtros.direcaoOrdenacao === 'asc' ? 1 : -1
                if (filtros.campoOrdenacao === 'cidade') {
                    return a.cidade.localeCompare(b.cidade, 'pt-BR') * mult
                }
                if (filtros.campoOrdenacao === 'artista') {
                    return a.artista.localeCompare(b.artista, 'pt-BR') * mult
                }
                if (filtros.campoOrdenacao === 'receita') {
                    return (a.receitaTotal - b.receitaTotal) * mult
                }
                if (filtros.campoOrdenacao === 'despesa') {
                    return (a.despesaTotal - b.despesaTotal) * mult
                }
                if (filtros.campoOrdenacao === 'liquido') {
                    return (a.valorLiquido - b.valorLiquido) * mult
                }
                return a.data_evento.localeCompare(b.data_evento) * mult
            })

            const totalReceitaMes = itensOrdenados.reduce(
                (acc, i) => acc + i.receitaTotal,
                0
            )
            const totalDespesaMes = itensOrdenados.reduce(
                (acc, i) => acc + i.despesaTotal,
                0
            )
            const totalLiquidoMes = itensOrdenados.reduce(
                (acc, i) => acc + i.valorLiquido,
                0
            )

            return {
                chaveGrupo,
                ano,
                mesNumero,
                nomeMesExtenso,
                rotuloMesAno: `${nomeMesExtenso} | ${ano.slice(-2)}`,
                itensOrdenados,
                totalReceitaMes,
                totalDespesaMes,
                totalLiquidoMes,
            }
        })

        return grupos.sort((a, b) => {
            if (a.ano !== b.ano) return b.ano.localeCompare(a.ano)
            return a.mesNumero - b.mesNumero
        })
    }, [registrosFiltrados, filtros.campoOrdenacao, filtros.direcaoOrdenacao])

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

    const linhasVirtuais = useMemo<TLinhaVirtualFinanceiro[]>(() => {
        const plana: TLinhaVirtualFinanceiro[] = []
        for (const grupo of gruposHierarquicos) {
            const aberto = Boolean(mesesAbertos[grupo.chaveGrupo])
            plana.push({
                tipo: 'cabecalho_mes',
                chaveUnica: `mes-${grupo.chaveGrupo}`,
                grupo,
                aberto,
            })
            if (aberto) {
                grupo.itensOrdenados.forEach((reg, idx) => {
                    plana.push({
                        tipo: 'linha_financeiro',
                        chaveUnica: `fin-${grupo.chaveGrupo}-${reg.evento_id}`,
                        chaveGrupo: grupo.chaveGrupo,
                        registro: reg,
                        ehUltimaLinhaDoMes: idx === grupo.itensOrdenados.length - 1,
                    })
                })
            }
        }
        return plana
    }, [gruposHierarquicos, mesesAbertos])

    const obterAlturaItemPx = useCallback(() => 32, [])
    const ALTURA_VIEWPORT_PX = 520

    const { alturaTotalPx, itensVisiveis, manipularScroll } = useVirtualizacao({
        itens: linhasVirtuais,
        alturaContainerPx: ALTURA_VIEWPORT_PX,
        obterAlturaItemPx,
        overscan: 12,
    })

    return (
        <>
            <div className="print:hidden">
                <ContainerGridPadrao larguraMinimaPx="min-w-[920px]">
                    <div
                        onScroll={manipularScroll}
                        className={ESTILOS_PADRAO_GRID.viewportAlturaFixa}
                    >
                        <div ref={cabecalhoRef} className="sticky top-0 z-30 select-none">
                            <div
                                className={`grid ${GRADE_COLUNAS_FINANCEIRO} items-center h-6 bg-[#0b43c6] text-white border-b border-blue-400/40 text-[10px] font-extrabold uppercase tracking-widest px-2`}
                            >
                                <div className="col-span-3 text-center border-r border-blue-400/40">
                                    Contato
                                </div>
                                <div className="col-span-4 text-center">Valores</div>
                            </div>

                            <div
                                className={`grid ${GRADE_COLUNAS_FINANCEIRO} items-center px-2 h-8 bg-[#1056f5] text-white border-b border-blue-700 text-[11px] font-bold uppercase tracking-wider shadow-2xs`}
                            >
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

                                <div className="relative px-2 flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() => alternarOrdenacao('cidade')}
                                        className="inline-flex items-center gap-1 hover:underline cursor-pointer"
                                    >
                                        <span>Cidade - UF</span>
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
                                                    const ativo =
                                                        filtros.ufsSelecionadas.includes(siglaUf)
                                                    return (
                                                        <button
                                                            key={siglaUf}
                                                            type="button"
                                                            onClick={() =>
                                                                alternarItemListaFiltro(
                                                                    'ufsSelecionadas',
                                                                    siglaUf
                                                                )
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
                                                                {ativo && (
                                                                    <Check className="w-2 h-2 stroke-[3]" />
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
                                            setDropdownColuna((v) =>
                                                v === 'artista' ? null : 'artista'
                                            )
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
                                                const ativo =
                                                    filtros.artistasSelecionados.includes(sigla)
                                                return (
                                                    <button
                                                        key={sigla}
                                                        type="button"
                                                        onClick={() =>
                                                            alternarItemListaFiltro(
                                                                'artistasSelecionados',
                                                                sigla
                                                            )
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
                                                            {ativo && (
                                                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                            )}
                                                        </span>
                                                        <span>{sigla}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="relative px-2 flex items-center justify-end gap-1">
                                    <button
                                        type="button"
                                        onClick={() => alternarOrdenacao('receita')}
                                        className="hover:underline cursor-pointer"
                                    >
                                        Receita Total
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setDropdownColuna((v) =>
                                                v === 'receita' ? null : 'receita'
                                            )
                                        }
                                        className={obterClasseBotaoColunaAzul(
                                            Boolean(filtros.textoReceitaMinima.trim())
                                        )}
                                    >
                                        <Filter className="w-2.5 h-2.5 opacity-85" />
                                    </button>
                                    {dropdownColuna === 'receita' && (
                                        <div className="absolute right-0 top-8 z-40 w-52 rounded-xl bg-white text-slate-700 shadow-2xl border border-slate-200 p-2 font-normal normal-case tracking-normal">
                                            <div className="relative">
                                                <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type="text"
                                                    placeholder="Receita mínima (Ex: 100000)..."
                                                    value={filtros.textoReceitaMinima}
                                                    onChange={(e) =>
                                                        aoAlterarCampoFiltro(
                                                            'textoReceitaMinima',
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full h-7 rounded border border-slate-300 pl-6 pr-2 text-[11px] text-slate-800 focus:border-[#1056f5] focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="relative px-2 flex items-center justify-end gap-1">
                                    <button
                                        type="button"
                                        onClick={() => alternarOrdenacao('despesa')}
                                        className="hover:underline cursor-pointer"
                                    >
                                        Despesa Total
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setDropdownColuna((v) =>
                                                v === 'despesa' ? null : 'despesa'
                                            )
                                        }
                                        className={obterClasseBotaoColunaAzul(
                                            Boolean(filtros.textoDespesaMinima.trim())
                                        )}
                                    >
                                        <Filter className="w-2.5 h-2.5 opacity-85" />
                                    </button>
                                    {dropdownColuna === 'despesa' && (
                                        <div className="absolute right-0 top-8 z-40 w-52 rounded-xl bg-white text-slate-700 shadow-2xl border border-slate-200 p-2 font-normal normal-case tracking-normal">
                                            <input
                                                type="text"
                                                placeholder="Despesa mínima (Ex: 10000)..."
                                                value={filtros.textoDespesaMinima}
                                                onChange={(e) =>
                                                    aoAlterarCampoFiltro(
                                                        'textoDespesaMinima',
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full h-7 rounded border border-slate-300 px-2 text-[11px] text-slate-800 focus:border-[#1056f5] focus:outline-none"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="relative px-2 flex items-center justify-end gap-1">
                                    <button
                                        type="button"
                                        onClick={() => alternarOrdenacao('liquido')}
                                        className="hover:underline cursor-pointer"
                                    >
                                        Valor Líquido
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setDropdownColuna((v) =>
                                                v === 'liquido' ? null : 'liquido'
                                            )
                                        }
                                        className={obterClasseBotaoColunaAzul(
                                            Boolean(filtros.textoLiquidoMinimo.trim())
                                        )}
                                    >
                                        <Filter className="w-2.5 h-2.5 opacity-85" />
                                    </button>
                                    {dropdownColuna === 'liquido' && (
                                        <div className="absolute right-0 top-8 z-40 w-52 rounded-xl bg-white text-slate-700 shadow-2xl border border-slate-200 p-2 font-normal normal-case tracking-normal">
                                            <input
                                                type="text"
                                                placeholder="Líquido mínimo (Ex: 80000)..."
                                                value={filtros.textoLiquidoMinimo}
                                                onChange={(e) =>
                                                    aoAlterarCampoFiltro(
                                                        'textoLiquidoMinimo',
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full h-7 rounded border border-slate-300 px-2 text-[11px] text-slate-800 focus:border-[#1056f5] focus:outline-none"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="px-1 text-center">Detalhamento</div>
                            </div>
                        </div>

                        {linhasVirtuais.length === 0 ? (
                            <div className="py-12 px-4 text-center text-[11px] text-slate-400">
                                Nenhum registro financeiro encontrado para os filtros aplicados.
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

                                                <div className="flex items-center gap-3 text-[10px]">
                                                    <span className="text-slate-500">
                                                        Receita:{' '}
                                                        <strong className="text-emerald-700">
                                                            {formatarMoedaBRL(grupo.totalReceitaMes)}
                                                        </strong>
                                                    </span>
                                                    <span className="text-slate-500">
                                                        Despesa:{' '}
                                                        <strong className="text-red-600">
                                                            {formatarMoedaBRL(grupo.totalDespesaMes)}
                                                        </strong>
                                                    </span>
                                                    <span className="text-slate-500">
                                                        Líquido:{' '}
                                                        <strong className="text-[#1056f5]">
                                                            {formatarMoedaBRL(grupo.totalLiquidoMes)}
                                                        </strong>
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    }

                                    const { registro, ehUltimaLinhaDoMes } = item
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
                                            className={`grid ${GRADE_COLUNAS_FINANCEIRO} ${ESTILOS_PADRAO_GRID.linhaDadosBase} ${ehUltimaLinhaDoMes
                                                    ? 'border-b border-slate-200'
                                                    : 'border-b border-slate-100'
                                                }`}
                                        >
                                            <div className="px-1 text-center font-semibold text-slate-700">
                                                {registro.dia_evento}
                                            </div>

                                            <div className="px-2 font-medium text-slate-800 truncate">
                                                {registro.cidade_uf}
                                            </div>

                                            <div className="px-1 text-center">
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-blue-50/80 text-[#1056f5] border border-blue-200/60">
                                                    {registro.artista}
                                                </span>
                                            </div>

                                            <div className="px-2 text-right font-semibold text-emerald-700">
                                                {formatarMoedaBRL(registro.receitaTotal)}
                                                {registro.desconto_percentual > 0 && (
                                                    <span
                                                        title={`Desconto aplicado de ${registro.desconto_percentual}%`}
                                                        className="ml-1 text-[9px] text-amber-600 font-bold"
                                                    >
                                                        (-{registro.desconto_percentual}%)
                                                    </span>
                                                )}
                                            </div>

                                            <div className="px-2 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => aoAbrirModalDespesas(registro)}
                                                    title="Clique para visualizar ou lançar despesas deste evento"
                                                    className="inline-flex items-center justify-end gap-1 font-semibold text-red-600 hover:underline cursor-pointer"
                                                >
                                                    <span>{formatarMoedaBRL(registro.despesaTotal)}</span>
                                                    <Receipt className="w-3 h-3 text-slate-400" />
                                                </button>
                                            </div>

                                            <div className="px-2 text-right font-bold text-slate-900">
                                                {formatarMoedaBRL(registro.valorLiquido)}
                                            </div>

                                            <div className="px-1 flex items-center justify-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        aoAbrirDetalhamentoFinanceiro(registro.evento_id)
                                                    }
                                                    title="Visualizar informações de pagamento e parcelas deste evento"
                                                    className="inline-flex items-center justify-center w-7 h-6 rounded-md bg-[#2b4c7e] hover:bg-[#1056f5] text-white transition cursor-pointer shadow-2xs"
                                                >
                                                    <Binoculars className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </ContainerGridPadrao>
            </div>

            <div className="hidden print:block space-y-4">
                <div className="border-b-2 border-[#1056f5] pb-2 flex items-center justify-between">
                    <div>
                        <h1 className="text-base font-extrabold text-slate-900 uppercase">
                            Relatório Financeiro Completo — SarsPlanner
                        </h1>
                        <p className="text-[10px] text-slate-500">
                            Listagem integral da grid com todos os subitens (parcelas e
                            despesas) expandidos ({registrosFiltrados.length} eventos)
                        </p>
                    </div>
                </div>

                <table className="w-full text-left border-collapse border border-slate-300">
                    <thead>
                        <tr className="bg-[#0b43c6] text-white text-[9.5px] font-extrabold uppercase tracking-wider">
                            <th
                                colSpan={3}
                                className="py-1 px-2 text-center border-r border-blue-300"
                            >
                                Contato
                            </th>
                            <th colSpan={4} className="py-1 px-2 text-center">
                                Valores
                            </th>
                        </tr>
                        <tr className="bg-[#1056f5] text-white text-[10px] font-bold uppercase">
                            <th className="py-1.5 px-2 text-center w-12">Dia</th>
                            <th className="py-1.5 px-2">Cidade - UF</th>
                            <th className="py-1.5 px-2 text-center w-16">Artista</th>
                            <th className="py-1.5 px-2 text-right">Receita Total</th>
                            <th className="py-1.5 px-2 text-right">Despesa Total</th>
                            <th className="py-1.5 px-2 text-right">Valor Líquido</th>
                            <th className="py-1.5 px-2 text-center">Status Parcelas</th>
                        </tr>
                    </thead>

                    <tbody className="text-[10px] text-slate-700">
                        {gruposHierarquicos.map((grupo) => (
                            <React.Fragment key={`print-${grupo.chaveGrupo}`}>
                                <tr className="bg-slate-200 border-y border-slate-300 font-extrabold text-slate-800">
                                    <td colSpan={3} className="py-1 px-2 uppercase">
                                        {grupo.rotuloMesAno}
                                    </td>
                                    <td className="py-1 px-2 text-right text-emerald-800">
                                        {formatarMoedaBRL(grupo.totalReceitaMes)}
                                    </td>
                                    <td className="py-1 px-2 text-right text-red-700">
                                        {formatarMoedaBRL(grupo.totalDespesaMes)}
                                    </td>
                                    <td className="py-1 px-2 text-right text-blue-900">
                                        {formatarMoedaBRL(grupo.totalLiquidoMes)}
                                    </td>
                                    <td className="py-1 px-2 text-center">
                                        {grupo.itensOrdenados.length} ev.
                                    </td>
                                </tr>

                                {grupo.itensOrdenados.map((reg) => (
                                    <React.Fragment key={`print-ev-${reg.evento_id}`}>
                                        {/* Linha Principal do Evento */}
                                        <tr className="border-t border-slate-300 bg-white font-semibold">
                                            <td className="py-1.5 px-2 text-center font-bold">
                                                {reg.dia_evento}
                                            </td>
                                            <td className="py-1.5 px-2">
                                                {reg.cidade_uf}
                                                <span className="block text-[9px] font-normal text-slate-500">
                                                    Contato: {reg.contato_nome_telefone || '—'} | Diária:{' '}
                                                    {reg.diaria_ativa
                                                        ? formatarMoedaBRL(reg.diaria_valor)
                                                        : 'Não'}
                                                </span>
                                            </td>
                                            <td className="py-1.5 px-2 text-center">{reg.artista}</td>
                                            <td className="py-1.5 px-2 text-right text-emerald-700">
                                                {formatarMoedaBRL(reg.receitaTotal)}
                                                {reg.desconto_percentual > 0
                                                    ? ` (-${reg.desconto_percentual}%)`
                                                    : ''}
                                            </td>
                                            <td className="py-1.5 px-2 text-right text-red-600">
                                                {formatarMoedaBRL(reg.despesaTotal)}
                                            </td>
                                            <td className="py-1.5 px-2 text-right font-bold text-slate-900">
                                                {formatarMoedaBRL(reg.valorLiquido)}
                                            </td>
                                            <td className="py-1.5 px-2 text-center text-[9px]">
                                                {reg.quantidadeParcelasPagas}/
                                                {reg.quantidadeParcelasTotal} pagas (Falta:{' '}
                                                {formatarMoedaBRL(reg.totalFaltaPagar)})
                                            </td>
                                        </tr>

                                        {/* Subitens Abertos Automaticamente no PDF: Parcelas + Despesas */}
                                        <tr className="bg-slate-50/90 border-b border-slate-300 text-[9px]">
                                            <td />
                                            <td colSpan={6} className="py-1.5 px-3">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <strong className="uppercase text-slate-600 block mb-0.5">
                                                            Subitens — Parcelas de Pagamento (
                                                            {reg.parcelas.length}):
                                                        </strong>
                                                        {reg.parcelas.length === 0 ? (
                                                            <span className="text-slate-400">
                                                                Nenhuma parcela registrada.
                                                            </span>
                                                        ) : (
                                                            <ul className="space-y-0.5">
                                                                {reg.parcelas.map((p) => (
                                                                    <li key={p.id}>
                                                                        • {p.numero_parcela}ª Parcela (
                                                                        {p.data_pagamento
                                                                            .split('-')
                                                                            .reverse()
                                                                            .join('/')}
                                                                        ):{' '}
                                                                        <strong>
                                                                            {formatarMoedaBRL(p.valor_bruto)}
                                                                        </strong>{' '}
                                                                        — [{p.status === 'OK' ? 'PAGA' : 'PENDENTE'}]
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <strong className="uppercase text-slate-600 block mb-0.5">
                                                            Subitens — Despesas ({reg.despesas.length}):
                                                        </strong>
                                                        {reg.despesas.length === 0 ? (
                                                            <span className="text-slate-400">
                                                                Nenhuma despesa registrada.
                                                            </span>
                                                        ) : (
                                                            <ul className="space-y-0.5">
                                                                {reg.despesas.map((d) => (
                                                                    <li key={d.id}>
                                                                        •{' '}
                                                                        {d.data_despesa
                                                                            .split('-')
                                                                            .reverse()
                                                                            .join('/')}
                                                                        : <strong>{formatarMoedaBRL(d.valor)}</strong>{' '}
                                                                        — {d.justificativa}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}