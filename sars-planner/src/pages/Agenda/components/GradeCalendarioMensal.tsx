import React from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import type { IDiaCalendario } from '@/types/agenda.types'

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

interface IGradeCalendarioMensalProps {
    tituloMesAno: string
    diasGrade: IDiaCalendario[]
    dataSelecionada: string | null
    painelLateralAberto: boolean
    aoSelecionarDiaComEvento: (dataIso: string) => void
    aoNavegarMesAnterior: () => void
    aoNavegarProximoMes: () => void
    aoIrParaMesPadrao: () => void
}

export const GradeCalendarioMensal: React.FC<IGradeCalendarioMensalProps> = ({
    tituloMesAno,
    diasGrade,
    dataSelecionada,
    painelLateralAberto,
    aoSelecionarDiaComEvento,
    aoNavegarMesAnterior,
    aoNavegarProximoMes,
    aoIrParaMesPadrao,
}) => {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_12px_rgba(15,23,42,0.03)] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1056f5] flex items-center justify-center">
                        <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 capitalize">
                            {tituloMesAno}
                        </h2>
                        <p className="text-xs text-slate-500">
                            Clique em um dia destacado em azul para ver os horários e detalhes
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={aoIrParaMesPadrao}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                        Outubro / 2026
                    </button>

                    <button
                        type="button"
                        onClick={aoNavegarMesAnterior}
                        title="Mês anterior"
                        className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        onClick={aoNavegarProximoMes}
                        title="Próximo mês"
                        className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/70">
                {DIAS_SEMANA.map((dia) => (
                    <div
                        key={dia}
                        className="py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500"
                    >
                        {dia}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 divide-x divide-y divide-slate-200">
                {diasGrade.map((dia) => {
                    const quantidadeEventos = dia.eventosDoDia.length
                    const possuiEventos = quantidadeEventos > 0
                    const estaSelecionado = dataSelecionada === dia.dataIso

                    return (
                        <button
                            key={dia.dataIso}
                            type="button"
                            disabled={!possuiEventos}
                            onClick={() => possuiEventos && aoSelecionarDiaComEvento(dia.dataIso)}
                            className={`relative text-left p-2 sm:p-3 transition-all flex flex-col justify-between ${painelLateralAberto
                                    ? 'min-h-[88px] sm:min-h-[104px]'
                                    : 'min-h-[104px] sm:min-h-[124px]'
                                } ${!dia.ehMesAtual
                                    ? 'bg-slate-50/60 text-slate-300'
                                    : 'bg-white text-slate-700'
                                } ${possuiEventos
                                    ? estaSelecionado
                                        ? 'bg-[#1056f5] text-white ring-2 ring-inset ring-blue-700 shadow-inner cursor-pointer'
                                        : 'bg-blue-50/80 hover:bg-blue-100/80 border-blue-200 cursor-pointer'
                                    : 'cursor-default'
                                }`}
                        >
                            <div className="w-full flex items-center justify-between gap-1">
                                <span
                                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs sm:text-sm font-bold ${possuiEventos
                                            ? estaSelecionado
                                                ? 'bg-white text-[#1056f5]'
                                                : 'bg-[#1056f5] text-white'
                                            : dia.ehHoje
                                                ? 'bg-slate-900 text-white'
                                                : ''
                                        }`}
                                >
                                    {dia.numeroDia}
                                </span>

                                {possuiEventos && (
                                    <span
                                        title={`${quantidadeEventos} evento(s) programado(s)`}
                                        className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-extrabold ${estaSelecionado
                                                ? 'bg-blue-800 text-white'
                                                : 'bg-[#1056f5]/15 text-[#1056f5]'
                                            }`}
                                    >
                                        {quantidadeEventos}
                                    </span>
                                )}
                            </div>

                            {possuiEventos && (
                                <div className="mt-2 w-full space-y-1 overflow-hidden">
                                    {dia.eventosDoDia.slice(0, 2).map((evento) => (
                                        <div
                                            key={evento.id}
                                            className={`truncate rounded-md px-1.5 py-1 text-[11px] font-semibold leading-tight ${estaSelecionado
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-[#1056f5] text-white shadow-2xs'
                                                }`}
                                        >
                                            {evento.horario_inicio} • {evento.artista} ({evento.cidade_uf})
                                        </div>
                                    ))}
                                </div>
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
