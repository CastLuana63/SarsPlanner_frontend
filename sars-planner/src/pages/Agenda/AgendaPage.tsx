import React, { useState, useMemo } from 'react'
import agendaEventosMock from '@/mocks/agendaEventosMock.json'
import { GradeCalendarioMensal } from './components/GradeCalendarioMensal'
import { PainelHorariosDia } from './components/PainelHorariosDia'
import type { IDiaCalendario, IEventoAgenda } from '@/types/agenda.types'

export const AgendaPage: React.FC = () => {
    const listaEventos = agendaEventosMock as IEventoAgenda[]

    // Inicia em Outubro de 2026 (mês 9 no índice 0-based do JS) para exibir os mocks imediatamente
    const [dataReferenciaMes, setDataReferenciaMes] = useState<Date>(new Date(2026, 9, 1))
    const [dataIsoSelecionada, setDataIsoSelecionada] = useState<string | null>(null)

    const anoAtual = dataReferenciaMes.getFullYear()
    const mesAtual = dataReferenciaMes.getMonth()

    const tituloMesAno = dataReferenciaMes.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
    })

    // Constrói as 42 células (6 semanas) da grade do calendário mensal
    const diasGradeCalendario = useMemo<IDiaCalendario[]>(() => {
        const primeiroDiaMes = new Date(anoAtual, mesAtual, 1)
        const ultimoDiaMes = new Date(anoAtual, mesAtual + 1, 0)

        const diaSemanaInicio = primeiroDiaMes.getDay()
        const totalDiasMes = ultimoDiaMes.getDate()

        const dias: IDiaCalendario[] = []

        const formatarDataIso = (ano: number, mes: number, dia: number): string => {
            const mesFormatado = String(mes + 1).padStart(2, '0')
            const diaFormatado = String(dia).padStart(2, '0')
            return `${ano}-${mesFormatado}-${diaFormatado}`
        }

        // Dias do mês anterior para preencher o início da semana
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
                eventosDoDia: listaEventos.filter((ev) => ev.data_evento === dataIso),
            })
        }

        // Dias do mês atual
        for (let diaNum = 1; diaNum <= totalDiasMes; diaNum++) {
            const dataIso = formatarDataIso(anoAtual, mesAtual, diaNum)
            dias.push({
                dataIso,
                numeroDia: diaNum,
                ehMesAtual: true,
                ehHoje: dataIso === '2026-10-21',
                eventosDoDia: listaEventos.filter((ev) => ev.data_evento === dataIso),
            })
        }

        // Dias do próximo mês para fechar 42 células (6 linhas x 7 colunas)
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
                eventosDoDia: listaEventos.filter((ev) => ev.data_evento === dataIso),
            })
        }

        return dias
    }, [anoAtual, mesAtual, listaEventos])

    const eventosDoDiaSelecionado = useMemo<IEventoAgenda[]>(() => {
        if (!dataIsoSelecionada) return []
        return listaEventos.filter((evento) => evento.data_evento === dataIsoSelecionada)
    }, [dataIsoSelecionada, listaEventos])

    const manipularSelecaoDia = (dataIso: string) => {
        setDataIsoSelecionada((dataAnterior) => (dataAnterior === dataIso ? null : dataIso))
    }

    const irParaMesAnterior = () => {
        setDataReferenciaMes(new Date(anoAtual, mesAtual - 1, 1))
    }

    const irParaProximoMes = () => {
        setDataReferenciaMes(new Date(anoAtual, mesAtual + 1, 1))
    }

    const irParaOutubro2026 = () => {
        setDataReferenciaMes(new Date(2026, 9, 1))
    }

    const fecharPainelLateral = () => {
        setDataIsoSelecionada(null)
    }

    const painelLateralAberto = Boolean(
        dataIsoSelecionada && eventosDoDiaSelecionado.length > 0
    )

    return (
        <div className="space-y-1">
            <header className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-4 text-xs font-medium text-slate-600 bg-white px-4 py-2 rounded-xl border border-slate-200">
                    <span className="inline-flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-[#1056f5]" />
                        Dia com evento programado
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded-full bg-[#1056f5]/15 text-[#1056f5] font-bold text-[10px]">
                            2 eventos
                        </span>
                        Quantidade no dia
                    </span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
                <div
                    className={`transition-all duration-200 ${painelLateralAberto ? 'lg:col-span-7 xl:col-span-8' : 'lg:col-span-12'
                        }`}
                >
                    <GradeCalendarioMensal
                        tituloMesAno={tituloMesAno}
                        diasGrade={diasGradeCalendario}
                        dataSelecionada={dataIsoSelecionada}
                        painelLateralAberto={painelLateralAberto}
                        aoSelecionarDiaComEvento={manipularSelecaoDia}
                        aoNavegarMesAnterior={irParaMesAnterior}
                        aoNavegarProximoMes={irParaProximoMes}
                        aoIrParaMesPadrao={irParaOutubro2026}
                    />
                </div>

                {painelLateralAberto && dataIsoSelecionada && (
                    <div className="lg:col-span-5 xl:col-span-4">
                        <PainelHorariosDia
                            dataIsoSelecionada={dataIsoSelecionada}
                            eventosDoDia={eventosDoDiaSelecionado}
                            aoFecharPainel={fecharPainelLateral}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
