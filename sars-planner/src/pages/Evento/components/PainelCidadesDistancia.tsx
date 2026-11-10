import React from 'react'
import { Route, Clock, MapPin, Eye } from 'lucide-react'
import type { IDistanciaCidadeEvento, IEvento } from '@/types/evento.types'

interface IPainelCidadesDistanciaProps {
    eventoPrincipal: IEvento
    cidadesCalculadas: IDistanciaCidadeEvento[]
    cidadeSelecionada: IDistanciaCidadeEvento | null
    aoSelecionarCidade: (cidade: IDistanciaCidadeEvento | null) => void
}

export const PainelCidadesDistancia: React.FC<IPainelCidadesDistanciaProps> = ({
    eventoPrincipal,
    cidadesCalculadas,
    cidadeSelecionada,
    aoSelecionarCidade,
}) => {
    const manipularMudancaSelect = (valorId: string) => {
        if (valorId === 'TODAS') {
            aoSelecionarCidade(null)
            return
        }
        const encontrada =
            cidadesCalculadas.find((c) => String(c.eventoId) === valorId) || null
        aoSelecionarCidade(encontrada)
    }

    return (
        <aside className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_6px_rgba(15,23,42,0.02)] flex flex-col h-[410px] overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Route className="w-3.5 h-3.5 text-[#1056f5]" />
                        <span>Distâncias até {eventoPrincipal.cidade_uf}</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                        {cidadesCalculadas.length} cidades
                    </span>
                </div>

                <div>
                    <label className="block text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Selecionar cidade para traçar rota no mapa (1 por vez)
                    </label>
                    <select
                        value={cidadeSelecionada ? String(cidadeSelecionada.eventoId) : 'TODAS'}
                        onChange={(e) => manipularMudancaSelect(e.target.value)}
                        className="w-full h-8 rounded-lg border border-slate-300 bg-white px-2.5 text-[11px] font-semibold text-slate-800 focus:border-[#1056f5] focus:outline-none cursor-pointer"
                    >
                        <option value="TODAS">
                            Mostrar todas as cidades (Apenas marcadores)
                        </option>
                        {cidadesCalculadas.map((cid) => (
                            <option key={cid.eventoId} value={String(cid.eventoId)}>
                                Rota: {cid.cidade_uf} → {eventoPrincipal.cidade_uf} (
                                {cid.distanciaKm} km • {cid.tempoEstimadoTexto})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-12 bg-[#1056f5] text-white border-b border-blue-700 px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wider select-none">
                <div className="col-span-6">Cidade Origem</div>
                <div className="col-span-3 text-right">Km</div>
                <div className="col-span-3 text-right">Tempo</div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {cidadesCalculadas.length === 0 ? (
                    <div className="p-6 text-center text-[11px] text-slate-400">
                        Nenhuma outra cidade com evento cadastrado para comparar distância.
                    </div>
                ) : (
                    cidadesCalculadas.map((cid) => {
                        const ativa = cidadeSelecionada?.eventoId === cid.eventoId
                        return (
                            <button
                                key={cid.eventoId}
                                type="button"
                                onClick={() => aoSelecionarCidade(ativa ? null : cid)}
                                className={`w-full grid grid-cols-12 items-center px-3 py-2 text-left text-[10.5px] transition cursor-pointer ${ativa
                                        ? 'bg-blue-50/90 border-l-4 border-l-[#1056f5] font-semibold text-[#1056f5]'
                                        : 'hover:bg-blue-50/35 text-slate-700'
                                    }`}
                            >
                                <div className="col-span-6 pr-2 min-w-0">
                                    <div className="flex items-center gap-1.5 truncate">
                                        <MapPin
                                            className={`w-3 h-3 shrink-0 ${ativa ? 'text-[#1056f5]' : 'text-red-500'
                                                }`}
                                        />
                                        <span className="truncate font-bold text-slate-800">
                                            {cid.cidade_uf}
                                        </span>
                                    </div>
                                    <span className="text-[9.5px] text-slate-400 block pl-4 truncate">
                                        Show {cid.artista} •{' '}
                                        {cid.data_evento.split('-').reverse().join('/')}
                                    </span>
                                </div>

                                <div className="col-span-3 text-right font-bold text-slate-800">
                                    {cid.distanciaKm} km
                                </div>

                                <div className="col-span-3 text-right flex items-center justify-end gap-1 text-[10px] text-slate-600">
                                    <Clock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                    <span>{cid.tempoEstimadoTexto}</span>
                                </div>
                            </button>
                        )
                    })
                )}
            </div>

            <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                <span className="inline-flex items-center gap-1">
                    <Eye className="w-3 h-3 text-[#1056f5]" />
                    Clique em uma cidade para traçar ou ocultar a rota
                </span>
            </div>
        </aside>
    )
}
