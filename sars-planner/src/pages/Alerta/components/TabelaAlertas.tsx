import React, { useState, useMemo, useCallback, useEffect } from 'react'
import {
    ChevronRight,
    ChevronDown,
    Flag,
    Check,
    DollarSign,
    Calendar,
    MapPin,
    ChevronsUpDown,
} from 'lucide-react'
import { useVirtualizacao } from '@/hooks/useVirtualizacao'
import type {
    IAlertaNotificacao,
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

const GRADE_COLUNAS_TEMPLATE =
    'grid-cols-[58px_108px_minmax(150px,1.2fr)_84px_124px_minmax(240px,2.2fr)_92px]'

interface ITabelaAlertasProps {
    alertasFiltrados: IAlertaNotificacao[]
    aoAlternarConclusao: (idAlerta: number) => void
    aoMarcarComoLido: (idAlerta: number) => void
}

export const TabelaAlertas: React.FC<ITabelaAlertasProps> = ({
    alertasFiltrados,
    aoAlternarConclusao,
    aoMarcarComoLido,
}) => {
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
            const alertasOrdenadosRecentes = [...itensDoMes].sort((a, b) =>
                b.data_vencimento_iso.localeCompare(a.data_vencimento_iso)
            )

            const totalPendentes = alertasOrdenadosRecentes.filter(
                (item) => !item.concluida
            ).length

            return {
                chaveGrupo,
                ano,
                mesNumero,
                nomeMesExtenso,
                rotuloMesAno: `${nomeMesExtenso} / ${ano}`,
                alertasOrdenadosRecentes,
                totalAlertas: alertasOrdenadosRecentes.length,
                totalPendentes,
            }
        })

        return grupos.sort((a, b) => {
            if (a.ano !== b.ano) {
                return b.ano.localeCompare(a.ano)
            }
            return a.mesNumero - b.mesNumero
        })
    }, [alertasFiltrados])

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
                listaPlana.push({
                    tipo: 'cabecalho_colunas',
                    chaveUnica: `colunas-${grupo.chaveGrupo}`,
                    chaveGrupo: grupo.chaveGrupo,
                })

                grupo.alertasOrdenadosRecentes.forEach((alerta, idx) => {
                    listaPlana.push({
                        tipo: 'linha_alerta',
                        chaveUnica: `alerta-${grupo.chaveGrupo}-${alerta.id}`,
                        chaveGrupo: grupo.chaveGrupo,
                        alerta,
                        ehUltimaLinhaDoMes:
                            idx === grupo.alertasOrdenadosRecentes.length - 1,
                    })
                })
            }
        }

        return listaPlana
    }, [gruposHierarquicos, mesesAbertos])

    const obterAlturaItemPx = useCallback((item: TLinhaVirtualHierarquica) => {
        if (item.tipo === 'cabecalho_mes') return 40
        if (item.tipo === 'cabecalho_colunas') return 34
        return 38
    }, [])

    const ALTURA_VIEWPORT_VIRTUAL_PX = 500

    const { alturaTotalPx, itensVisiveis, manipularScroll } = useVirtualizacao({
        itens: linhasVirtuais,
        alturaContainerPx: ALTURA_VIEWPORT_VIRTUAL_PX,
        obterAlturaItemPx,
        overscan: 8,
    })

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_10px_rgba(15,23,42,0.03)] overflow-hidden">
            <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 print:hidden">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <span className="text-[11px] font-medium text-slate-500">
                        • {gruposHierarquicos.length}{' '}
                        {gruposHierarquicos.length === 1 ? 'mês com registros' : 'meses com registros'}
                    </span>
                </div>

                {gruposHierarquicos.length > 0 && (
                    <button
                        type="button"
                        onClick={alternarTodosMeses}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                        <ChevronsUpDown className="w-3.5 h-3.5 text-slate-500" />
                        <span>{todosEstaoAbertos ? 'Recolher todos' : 'Expandir todos'}</span>
                    </button>
                )}
            </div>

            <div className="overflow-x-auto print:hidden">
                <div className="min-w-[860px]">
                    {linhasVirtuais.length === 0 ? (
                        <div className="py-10 px-4 text-center text-xs text-slate-400">
                            Nenhum alerta de pagamento encontrado para o ano/mês selecionado.
                        </div>
                    ) : (
                        <div
                            onScroll={manipularScroll}
                            style={{ maxHeight: `${ALTURA_VIEWPORT_VIRTUAL_PX}px` }}
                            className="relative overflow-y-auto select-none"
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
                                                className="flex items-center justify-between px-3.5 bg-slate-100/90 hover:bg-slate-200/70 border-b border-slate-300 cursor-pointer transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-white border border-slate-300 text-slate-700 shadow-2xs">
                                                        {aberto ? (
                                                            <ChevronDown className="w-3.5 h-3.5 text-[#1056f5]" />
                                                        ) : (
                                                            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                                                        )}
                                                    </span>

                                                    <span className="text-xs font-extrabold tracking-wide text-slate-800 uppercase">
                                                        {grupo.rotuloMesAno}
                                                    </span>

                                                    <span className="text-[10px] font-semibold text-slate-500">
                                                        (Ordem: mais recente ↓)
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center rounded-full bg-white border border-slate-300 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                                                        {grupo.totalAlertas}{' '}
                                                        {grupo.totalAlertas === 1 ? 'alerta' : 'alertas'}
                                                    </span>

                                                    {grupo.totalPendentes > 0 && (
                                                        <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-300 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                                            {grupo.totalPendentes} pendente(s)
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    }

                                    if (item.tipo === 'cabecalho_colunas') {
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
                                                className={`grid ${GRADE_COLUNAS_TEMPLATE} items-center bg-slate-200/95 border-b border-slate-300 px-2 text-xs font-bold uppercase tracking-wider text-slate-800`}
                                            >
                                                <div className="px-2 text-center">Dia</div>
                                                <div className="px-2 text-center">Data Show</div>
                                                <div className="px-2">Cidade - UF</div>
                                                <div className="px-2 text-center">Artista</div>
                                                <div className="px-2 text-center">Categoria</div>
                                                <div className="px-2">Descrição</div>
                                                <div className="px-2 text-center">Ações</div>
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
                                            className={`grid ${GRADE_COLUNAS_TEMPLATE} items-center px-2 text-[11px] leading-tight transition-colors ${ehUltimaLinhaDoMes
                                                    ? 'border-b-2 border-slate-300'
                                                    : 'border-b border-slate-200/80'
                                                } ${alerta.concluida
                                                    ? 'bg-slate-50/70 text-slate-400'
                                                    : !alerta.lida
                                                        ? 'bg-blue-50/25 hover:bg-slate-50 text-slate-600'
                                                        : 'bg-white hover:bg-slate-50 text-slate-600'
                                                }`}
                                        >
                                            <div className="px-2 text-center font-bold text-slate-700 flex items-center justify-center gap-1">
                                                {!alerta.lida && !alerta.concluida && (
                                                    <span
                                                        title="Notificação recente não lida"
                                                        className="w-1.5 h-1.5 rounded-full bg-[#1056f5] shrink-0"
                                                    />
                                                )}
                                                <span>{alerta.dia_vencimento}</span>
                                            </div>

                                            <div className="px-2 text-center text-slate-500 flex items-center justify-center gap-1">
                                                <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                                                <span>{alerta.data_show}</span>
                                            </div>

                                            <div className="px-2 font-semibold text-slate-700 truncate flex items-center gap-1">
                                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                                <span className="truncate">{alerta.cidade_uf}</span>
                                            </div>

                                            <div className="px-2 text-center">
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#1056f5] border border-blue-200/70">
                                                    {alerta.artista}
                                                </span>
                                            </div>

                                            <div className="px-2 text-center">
                                                <span className="inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
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
                                                className="px-2 flex items-center justify-center gap-1"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div className="relative group">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => e.preventDefault()}
                                                        title="Acessar financeiro deste evento (Em breve)"
                                                        className="p-1 rounded-md text-slate-400 bg-slate-50 border border-slate-200/80 cursor-not-allowed"
                                                    >
                                                        <DollarSign className="w-3.5 h-3.5" />
                                                    </button>
                                                    <span className="pointer-events-none absolute bottom-full right-1/2 translate-x-1/2 mb-1 hidden group-hover:block whitespace-nowrap rounded bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white shadow-md z-30">
                                                        Financeiro do evento #{alerta.seq_evento} (em breve)
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
                                                        className={`p-1 rounded-md border transition-all cursor-pointer ${alerta.concluida
                                                                ? 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                                                                : 'text-slate-600 hover:text-[#1056f5] hover:bg-blue-50 border-transparent hover:border-blue-200'
                                                            }`}
                                                    >
                                                        {alerta.concluida ? (
                                                            <Check className="w-3.5 h-3.5" />
                                                        ) : (
                                                            <Flag className="w-3.5 h-3.5" />
                                                        )}
                                                    </button>
                                                    <span className="pointer-events-none absolute bottom-full right-0 mb-1 hidden group-hover:block whitespace-nowrap rounded bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white shadow-md z-30">
                                                        {alerta.concluida
                                                            ? 'Concluída (clique para reabrir)'
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
                {gruposHierarquicos.map((grupo) => (
                    <div key={grupo.chaveGrupo} className="mb-4 border border-slate-300">
                        <div className="bg-slate-100 px-3 py-1.5 text-xs font-bold uppercase text-slate-800 border-b border-slate-300">
                            {grupo.rotuloMesAno} ({grupo.totalAlertas} registros)
                        </div>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-200 border-b border-slate-300 text-xs font-bold uppercase text-slate-800">
                                    <th className="py-1.5 px-2 text-center">Dia</th>
                                    <th className="py-1.5 px-2 text-center">Data Show</th>
                                    <th className="py-1.5 px-2">Cidade - UF</th>
                                    <th className="py-1.5 px-2 text-center">Artista</th>
                                    <th className="py-1.5 px-2 text-center">Categoria</th>
                                    <th className="py-1.5 px-2">Descrição</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 text-[11px] text-slate-600">
                                {grupo.alertasOrdenadosRecentes.map((alerta) => (
                                    <tr key={alerta.id}>
                                        <td className="py-1 px-2 text-center font-bold">
                                            {alerta.dia_vencimento}
                                        </td>
                                        <td className="py-1 px-2 text-center">{alerta.data_show}</td>
                                        <td className="py-1 px-2 font-semibold">{alerta.cidade_uf}</td>
                                        <td className="py-1 px-2 text-center">{alerta.artista}</td>
                                        <td className="py-1 px-2 text-center">{alerta.categoria}</td>
                                        <td className="py-1 px-2">{alerta.descricao}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>
    )
}
