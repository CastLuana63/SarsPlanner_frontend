import React, { useState, useMemo } from 'react'
import { useEventos } from '@/contexts/EventosContext'
import { GradeCalendarioMensal } from './components/GradeCalendarioMensal'
import { PainelHorariosDia } from './components/PainelHorariosDia'
import type {
    IDiaCalendario,
    IEventoAgenda,
    TipoStatusEvento,
} from '@/types/agenda.types'

export const AgendaPage: React.FC = () => {
    const { listaEventos } = useEventos()

    // Converte os eventos sincronizados do EventosContext para o formato do calendário da Agenda
    const listaEventosSincronizados = useMemo<IEventoAgenda[]>(() => {
        return listaEventos.map((ev) => {
            let statusMapeado: TipoStatusEvento = 'pendente'
            if (ev.status_id === 'OK' || ev.realizado) statusMapeado = 'concluido'
            if (ev.status_id === 'CANCELADO') statusMapeado = 'cancelado'

            return {
                id: ev.id,
                seq_empresa: ev.seq_empresa,
                data_evento: ev.data_evento,
                horario_inicio: ev.horario_inicio,
                horario_fim: ev.horario_fim,
                status_evento: statusMapeado,
                realizado: ev.realizado,
                artista: ev.artista,
                cidade_uf: ev.cidade_uf,
                valor_show: ev.valor_show,
                comissao: ev.comissao,
                vendedor: ev.vendedor,
                producao: ev.producao,
            }
        })
    }, [listaEventos])

    const [dataReferenciaMes, setDataReferenciaMes] = useState<Date>(
        new Date(2026, 9, 1)
    )
    const [dataIsoSelecionada, setDataIsoSelecionada] = useState<string | null>(
        null
    )

    const anoAtual = dataReferenciaMes.getFullYear()
    const mesAtual = dataReferenciaMes.getMonth()

    const tituloMesAno = dataReferenciaMes.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
    })

    const diasGradeCalendario = useMemo<IDiaCalendario[]>(() => {
        const primeiroDiaMes = new Date(anoAtual, mesAtual, 1)
        const ultimoDiaMes = new Date(anoAtual, mesAtual + 1, 0)
        const diaSemanaInicio = primeiroDiaMes.getDay()
        const totalDiasMes = ultimoDiaMes.getDate()
        const dias: IDiaCalendario[] = []

        const formatarDataIso = (ano: number, mes: number, dia: number): string => {
            return `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
        }

        const ultimoDiaMesAnterior = new Date(anoAtual, mesAtual, 0).getDate()
        for (let i = diaSemanaInicio - 1; i >= 0; i--) {
            const diaNum = ultimoDiaMesAnterior - i
            const dataObj = new Date(anoAtual, mesAtual - 1, diaNum)
            const dataIso = formatarDataIso(
                dataObj.getFullYear(),
                dataObj.getMonth(),
                dataObj.getDate()
            )
            dias.push({
                dataIso,
                numeroDia: diaNum,
                ehMesAtual: false,
                ehHoje: false,
                eventosDoDia: listaEventosSincronizados.filter(
                    (ev) => ev.data_evento === dataIso
                ),
            })
        }

        for (let diaNum = 1; diaNum <= totalDiasMes; diaNum++) {
            const dataIso = formatarDataIso(anoAtual, mesAtual, diaNum)
            dias.push({
                dataIso,
                numeroDia: diaNum,
                ehMesAtual: true,
                ehHoje: dataIso === '2026-10-21',
                eventosDoDia: listaEventosSincronizados.filter(
                    (ev) => ev.data_evento === dataIso
                ),
            })
        }

        const celulasRestantes = 42 - dias.length
        for (let diaNum = 1; diaNum <= celulasRestantes; diaNum++) {
            const dataObj = new Date(anoAtual, mesAtual + 1, diaNum)
            const dataIso = formatarDataIso(
                dataObj.getFullYear(),
                dataObj.getMonth(),
                dataObj.getDate()
            )
            dias.push({
                dataIso,
                numeroDia: diaNum,
                ehMesAtual: false,
                ehHoje: false,
                eventosDoDia: listaEventosSincronizados.filter(
                    (ev) => ev.data_evento === dataIso
                ),
            })
        }

        return dias
    }, [anoAtual, mesAtual, listaEventosSincronizados])

    const eventosDoDiaSelecionado = useMemo<IEventoAgenda[]>(() => {
        if (!dataIsoSelecionada) return []
        return listaEventosSincronizados.filter(
            (ev) => ev.data_evento === dataIsoSelecionada
        )
    }, [dataIsoSelecionada, listaEventosSincronizados])

    const painelLateralAberto = Boolean(
        dataIsoSelecionada && eventosDoDiaSelecionado.length > 0
    )

    return (
        <div className="space-y-3.5">
            <header className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                    <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1056f5]" />
                        Dia com evento
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded-full bg-[#1056f5]/15 text-[#1056f5] font-bold text-[10px] leading-none">
                            2 evs.
                        </span>
                        Total no dia
                    </span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                <div
                    className={`transition-all duration-200 ${painelLateralAberto
                            ? 'lg:col-span-7 xl:col-span-8'
                            : 'lg:col-span-12'
                        }`}
                >
                    <GradeCalendarioMensal
                        tituloMesAno={tituloMesAno}
                        diasGrade={diasGradeCalendario}
                        dataSelecionada={dataIsoSelecionada}
                        painelLateralAberto={painelLateralAberto}
                        aoSelecionarDiaComEvento={(iso) =>
                            setDataIsoSelecionada((ant) => (ant === iso ? null : iso))
                        }
                        aoNavegarMesAnterior={() =>
                            setDataReferenciaMes(new Date(anoAtual, mesAtual - 1, 1))
                        }
                        aoNavegarProximoMes={() =>
                            setDataReferenciaMes(new Date(anoAtual, mesAtual + 1, 1))
                        }
                        aoIrParaMesPadrao={() => setDataReferenciaMes(new Date(2026, 9, 1))}
                    />
                </div>

                {painelLateralAberto && dataIsoSelecionada && (
                    <div className="lg:col-span-5 xl:col-span-4">
                        <PainelHorariosDia
                            dataIsoSelecionada={dataIsoSelecionada}
                            eventosDoDia={eventosDoDiaSelecionado}
                            aoFecharPainel={() => setDataIsoSelecionada(null)}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}