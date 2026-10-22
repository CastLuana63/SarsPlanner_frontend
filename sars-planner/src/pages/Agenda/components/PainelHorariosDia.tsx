import React from 'react'
import {
    X,
    Clock,
    MapPin,
    Mic2,
    DollarSign,
    UserCheck,
    Briefcase,
    Building2,
    CheckCircle2,
} from 'lucide-react'
import { EtiquetaStatusEvento } from '@/components/ui/EtiquetaStatusEvento'
import type { IEventoAgenda } from '@/types/agenda.types'

interface IPainelHorariosDiaProps {
    dataIsoSelecionada: string
    eventosDoDia: IEventoAgenda[]
    aoFecharPainel: () => void
}

export const PainelHorariosDia: React.FC<IPainelHorariosDiaProps> = ({
    dataIsoSelecionada,
    eventosDoDia,
    aoFecharPainel,
}) => {
    const formatarDataCompleta = (dataIso: string): string => {
        const [ano, mes, dia] = dataIso.split('-').map(Number)
        const dataObj = new Date(ano, mes - 1, dia)
        return dataObj.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        })
    }

    const eventosOrdenadosPorHorario = [...eventosDoDia].sort((a, b) =>
        a.horario_inicio.localeCompare(b.horario_inicio)
    )

    return (
        <aside className="bg-white rounded-xl border border-slate-200 shadow-[0_4px_16px_rgba(15,23,42,0.04)] flex flex-col max-h-[calc(100vh-9.5rem)] overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-start justify-between gap-2 shrink-0">
                <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1056f5] block">
                        Programação do Dia ({eventosDoDia.length})
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 capitalize mt-0.5">
                        {formatarDataCompleta(dataIsoSelecionada)}
                    </h3>
                </div>

                <button
                    type="button"
                    onClick={aoFecharPainel}
                    title="Fechar painel de horários"
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="p-3.5 space-y-2.5 overflow-y-auto flex-1">
                {eventosOrdenadosPorHorario.map((evento) => (
                    <div
                        key={evento.id}
                        className="relative pl-3 border-l-4 border-[#1056f5] bg-slate-50/70 hover:bg-slate-50 rounded-r-lg border-t border-r border-b border-slate-200 p-3 transition space-y-2"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1056f5] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                                <Clock className="w-3 h-3" />
                                <span>
                                    {evento.horario_inicio} às {evento.horario_fim}
                                </span>
                            </div>

                            <EtiquetaStatusEvento status={evento.status_evento} />
                        </div>

                        <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-900">
                                <Mic2 className="w-3.5 h-3.5 text-[#1056f5] shrink-0" />
                                <span>Artista: {evento.artista}</span>
                            </div>

                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{evento.cidade_uf}</span>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                            <div className="flex items-center gap-1 text-slate-600">
                                <DollarSign className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="text-slate-500">Valor:</span>
                                <span className="font-bold text-slate-800 truncate">
                                    {evento.valor_show}
                                </span>
                            </div>

                            <div className="flex items-center gap-1 text-slate-600">
                                <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="text-slate-500">Comissão:</span>
                                <span className="font-bold text-slate-800">{evento.comissao}</span>
                            </div>

                            <div className="flex items-center gap-1 text-slate-600">
                                <UserCheck className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="text-slate-500">Vendedor:</span>
                                <span className="font-bold text-slate-800 truncate">
                                    {evento.vendedor}
                                </span>
                            </div>

                            <div className="flex items-center gap-1 text-slate-600">
                                <CheckCircle2 className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="text-slate-500">Produção:</span>
                                <span className="font-bold text-slate-800 truncate">
                                    {evento.producao}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    )
}
