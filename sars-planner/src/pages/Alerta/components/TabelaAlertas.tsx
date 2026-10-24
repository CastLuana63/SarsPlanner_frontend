import React, { useMemo } from 'react'
import { Flag, Check, DollarSign, Calendar, MapPin } from 'lucide-react'
import type { IAlertaNotificacao } from '@/types/notificacao.types'

interface ITabelaAlertasProps {
    alertasFiltrados: IAlertaNotificacao[]
    aoAlternarConclusao: (idAlerta: number) => void
    aoMarcarComoLido: (idAlerta: number) => void
}

interface IGrupoMensalAlertas {
    tituloGrupo: string
    itens: IAlertaNotificacao[]
}

export const TabelaAlertas: React.FC<ITabelaAlertasProps> = ({
    alertasFiltrados,
    aoAlternarConclusao,
    aoMarcarComoLido,
}) => {
    const gruposPorMesAno = useMemo<IGrupoMensalAlertas[]>(() => {
        const mapa = new Map<string, IAlertaNotificacao[]>()

        for (const alerta of alertasFiltrados) {
            const listaAtual = mapa.get(alerta.grupo_mes_ano) || []
            listaAtual.push(alerta)
            mapa.set(alerta.grupo_mes_ano, listaAtual)
        }

        return Array.from(mapa.entries()).map(([tituloGrupo, itens]) => ({
            tituloGrupo,
            itens,
        }))
    }, [alertasFiltrados])

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_10px_rgba(15,23,42,0.03)] overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-600 select-none">
                            <th className="py-3 px-4 text-center w-16">Dia</th>
                            <th className="py-3 px-4 text-center w-32">Data do Show</th>
                            <th className="py-3 px-4">Cidade - UF</th>
                            <th className="py-3 px-4 text-center w-28">Artista</th>
                            <th className="py-3 px-4 text-center w-36">Categoria</th>
                            <th className="py-3 px-4">Descrição</th>
                            <th className="py-3 px-4 text-center w-28 print:hidden">Ações</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200 text-xs sm:text-[13px] text-slate-700">
                        {gruposPorMesAno.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="py-8 px-4 text-center text-xs text-slate-400"
                                >
                                    Nenhum alerta de pagamento encontrado para os filtros selecionados.
                                </td>
                            </tr>
                        ) : (
                            gruposPorMesAno.map((grupo) => (
                                <React.Fragment key={grupo.tituloGrupo}>
                                    {/* Faixa divisória de Mês | Ano alinhada ao estilo clean da tabela de Artistas */}
                                    <tr className="bg-slate-100/80 border-y border-slate-200">
                                        <td
                                            colSpan={7}
                                            className="py-1.5 px-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-600"
                                        >
                                            {grupo.tituloGrupo}
                                        </td>
                                    </tr>

                                    {grupo.itens.map((alerta) => (
                                        <tr
                                            key={alerta.id}
                                            onClick={() => !alerta.lida && aoMarcarComoLido(alerta.id)}
                                            className={`transition-colors ${alerta.concluida
                                                    ? 'bg-slate-50/60 text-slate-400'
                                                    : !alerta.lida
                                                        ? 'bg-blue-50/30 hover:bg-slate-50/80'
                                                        : 'hover:bg-slate-50/80'
                                                }`}
                                        >
                                            {/* Dia */}
                                            <td className="py-2.5 px-4 text-center font-bold text-slate-900">
                                                <div className="inline-flex items-center justify-center gap-1.5">
                                                    {!alerta.lida && !alerta.concluida && (
                                                        <span
                                                            title="Notificação recente não lida"
                                                            className="w-2 h-2 rounded-full bg-[#1056f5] shrink-0 print:hidden"
                                                        />
                                                    )}
                                                    <span>{alerta.dia_vencimento}</span>
                                                </div>
                                            </td>

                                            {/* Data do Show */}
                                            <td className="py-2.5 px-4 text-center text-slate-600">
                                                <span className="inline-flex items-center justify-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0 print:hidden" />
                                                    <span>{alerta.data_show}</span>
                                                </span>
                                            </td>

                                            {/* Cidade - UF */}
                                            <td className="py-2.5 px-4 font-bold text-slate-900">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 print:hidden" />
                                                    <span>{alerta.cidade_uf}</span>
                                                </span>
                                            </td>

                                            {/* Artista (Mesmo badge azul da tela de Artistas) */}
                                            <td className="py-2.5 px-4 text-center">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-[#1056f5] border border-blue-200/70">
                                                    {alerta.artista}
                                                </span>
                                            </td>

                                            {/* Categoria */}
                                            <td className="py-2.5 px-4 text-center">
                                                <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                                    <span
                                                        className={`w-2 h-2 rounded-full shrink-0 ${alerta.concluida ? 'bg-slate-400' : 'bg-emerald-500'
                                                            }`}
                                                    />
                                                    {alerta.categoria}
                                                </span>
                                            </td>

                                            {/* Descrição */}
                                            <td
                                                className={`py-2.5 px-4 ${alerta.concluida
                                                        ? 'line-through text-slate-400'
                                                        : 'text-slate-600'
                                                    }`}
                                            >
                                                {alerta.descricao}
                                            </td>

                                            {/* Ações lado a lado no mesmo padrão visual da TabelaArtistas */}
                                            <td
                                                className="py-2.5 px-4 text-center print:hidden"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div className="inline-flex items-center justify-center gap-1.5">
                                                    {/* Botão Acessar Financeiro do Evento (Inativo por enquanto) */}
                                                    <div className="relative group">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => e.preventDefault()}
                                                            title="Acessar financeiro deste evento"
                                                            aria-label="Acessar financeiro deste evento"
                                                            className="p-1.5 rounded-lg text-slate-400 bg-slate-50 border border-slate-200/80 cursor-not-allowed"
                                                        >
                                                            <DollarSign className="w-4 h-4" />
                                                        </button>
                                                        <span className="pointer-events-none absolute bottom-full right-1/2 translate-x-1/2 mb-1.5 hidden group-hover:block whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white shadow-md z-30">
                                                            Acessar financeiro do evento #{alerta.seq_evento} (em breve)
                                                        </span>
                                                    </div>

                                                    {/* Botão Concluir Notificação */}
                                                    <div className="relative group">
                                                        <button
                                                            type="button"
                                                            onClick={() => aoAlternarConclusao(alerta.id)}
                                                            title={
                                                                alerta.concluida
                                                                    ? 'Reabrir notificação'
                                                                    : 'Concluir notificação'
                                                            }
                                                            aria-label={
                                                                alerta.concluida
                                                                    ? 'Reabrir notificação'
                                                                    : 'Concluir notificação'
                                                            }
                                                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${alerta.concluida
                                                                    ? 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                                                                    : 'text-slate-600 hover:text-[#1056f5] hover:bg-blue-50 border-transparent hover:border-blue-200'
                                                                }`}
                                                        >
                                                            {alerta.concluida ? (
                                                                <Check className="w-4 h-4" />
                                                            ) : (
                                                                <Flag className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                        <span className="pointer-events-none absolute bottom-full right-0 mb-1.5 hidden group-hover:block whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white shadow-md z-30">
                                                            {alerta.concluida
                                                                ? 'Notificação concluída (clique para reabrir)'
                                                                : 'Concluir notificação'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
